import { useEffect, useRef } from 'react';

/**
 * Renders an image that "decrypts" into view: it resolves out of a field of
 * scattered glyphs and coarse colored mosaic blocks into the sharp photo,
 * emerging center-outward. Re-runs the reveal whenever `src` changes, so it
 * doubles as a slideshow transition.
 */

interface DecryptingImageProps {
  src: string;
  className?: string;
  /** Reveal duration in ms. */
  duration?: number;
  /** 'out' = resolve center→edges; 'in' = resolve edges→center. */
  direction?: 'out' | 'in';
  /** When false, the first image shows sharp immediately (no reveal); later
      `src` changes still animate. Defaults to true. */
  animateOnMount?: boolean;
}

const CELL = 14; // CSS px per mosaic cell

// Symbols scattered across not-yet-decrypted cells.
const GLYPHS = '#@&+?*!/\\<>=-~^:;%$01░▒▓◆●▲■';

// Glyph density falls off from the image center: dense in the middle, nearly
// empty at the outskirts. CENTER/EDGE are the fraction of cells that show a
// glyph at dist=0 / dist=1; FALLOFF>1 thins the mid→edge region faster.
const CENTER_GLYPH_DENSITY = 0.9;
const EDGE_GLYPH_DENSITY = 0.07;
const GLYPH_FALLOFF = 2.2;

// Cheap deterministic hash → [0,1), stable per (row,col) so a cell keeps its
// reveal timing and glyph across frames.
function hash(r: number, c: number, salt: number): number {
  const x = Math.sin(r * 127.1 + c * 311.7 + salt * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

interface CellData {
  cols: number;
  rows: number;
  tBlock: Float32Array; // progress at which a cell turns from glyph → mosaic block
  tSharp: Float32Array; // progress at which it resolves to the sharp image
  color: Uint8ClampedArray; // rgb per cell (length cols*rows*3)
  glyph: string[]; // chosen glyph per cell
  hasGlyph: Uint8Array; // sparse: only some encrypted cells show a glyph
}

function DecryptingImage({ src, className, duration = 1800, direction = 'out', animateOnMount = true }: DecryptingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cellsRef = useRef<CellData | null>(null);
  const rafRef = useRef<number>();
  const startRef = useRef<number | null>(null);
  // Tracks whether the first image has been shown yet (to optionally skip the
  // reveal on mount). Persists across `src` changes.
  const firstRunRef = useRef(true);
  const coverRef = useRef<{ sx: number; sy: number; sw: number; sh: number }>();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    const img = new Image();
    img.src = src;

    // Compute object-fit: cover source rectangle for the current container size.
    const computeCover = (cw: number, ch: number) => {
      const ir = img.width / img.height;
      const cr = cw / ch;
      let sw = img.width;
      let sh = img.height;
      if (ir > cr) {
        // image wider than container → crop sides
        sw = img.height * cr;
      } else {
        sh = img.width / cr;
      }
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      coverRef.current = { sx, sy, sw, sh };
    };

    // Build per-cell color + timing data by sampling a cover-fit draw offscreen.
    const setup = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      computeCover(cw, ch);

      // Offscreen sample buffer at CSS resolution.
      const off = document.createElement('canvas');
      off.width = cw;
      off.height = ch;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      const { sx, sy, sw, sh } = coverRef.current!;
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      const pixels = octx.getImageData(0, 0, cw, ch).data;

      const cols = Math.ceil(cw / CELL);
      const rows = Math.ceil(ch / CELL);
      const n = cols * rows;
      const tBlock = new Float32Array(n);
      const tSharp = new Float32Array(n);
      const color = new Uint8ClampedArray(n * 3);
      const glyph: string[] = new Array(n);
      const hasGlyph = new Uint8Array(n);

      // p-norm shapes the reveal front: p=2 is a circle, p→∞ a square.
      // p=4 gives a "squircle" (rounded cube) — between circle and cube.
      const P = 4;
      const diag = Math.pow(2 * Math.pow(0.5, P), 1 / P);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          // sample the cell's center pixel
          const px = Math.min(cw - 1, Math.floor((c + 0.5) * CELL));
          const py = Math.min(ch - 1, Math.floor((r + 0.5) * CELL));
          const p = (py * cw + px) * 4;
          color[i * 3] = pixels[p];
          color[i * 3 + 1] = pixels[p + 1];
          color[i * 3 + 2] = pixels[p + 2];

          // squircle distance: 0 center → 1 corner. 'out' resolves the center
          // first, 'in' resolves the edges first.
          const dx = (c + 0.5) / cols - 0.5;
          const dy = (r + 0.5) / rows - 0.5;
          const dist = Math.pow(Math.pow(Math.abs(dx), P) + Math.pow(Math.abs(dy), P), 1 / P) / diag;
          const radial = direction === 'in' ? 1 - dist : dist;
          const order = Math.min(1, 0.65 * radial + 0.35 * hash(r, c, 1));
          const ts = 0.15 + order * 0.85;
          tSharp[i] = ts;
          tBlock[i] = Math.max(0, ts - 0.3);

          const g = hash(r, c, 2);
          glyph[i] = GLYPHS[Math.floor(g * GLYPHS.length)];
          // Denser glyphs near the image center, nearly empty at the edges.
          const glyphDensity =
            EDGE_GLYPH_DENSITY +
            (CENTER_GLYPH_DENSITY - EDGE_GLYPH_DENSITY) *
              Math.pow(Math.max(0, 1 - dist), GLYPH_FALLOFF);
          hasGlyph[i] = hash(r, c, 3) < glyphDensity ? 1 : 0;
        }
      }

      cellsRef.current = { cols, rows, tBlock, tSharp, color, glyph, hasGlyph };
    };

    const draw = (progress: number) => {
      const ctx = canvas.getContext('2d');
      const cells = cellsRef.current;
      const cover = coverRef.current;
      if (!ctx || !cells || !cover) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      // Base layer: the sharp, cover-fit image.
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, cover.sx, cover.sy, cover.sw, cover.sh, 0, 0, cw, ch);

      if (progress >= 1) return; // fully revealed; nothing to overlay

      const { cols, rows, tBlock, tSharp, color, glyph, hasGlyph } = cells;
      ctx.font = `${CELL}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const ts = tSharp[i];
          if (progress >= ts) continue; // resolved → show sharp image beneath

          const x = c * CELL;
          const y = r * CELL;
          const cr = color[i * 3];
          const cg = color[i * 3 + 1];
          const cb = color[i * 3 + 2];

          if (progress >= tBlock[i]) {
            // Mosaic stage: solid average-color block dissolving into the photo.
            const a = (ts - progress) / (ts - tBlock[i]); // 1 → 0
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
            ctx.fillRect(x, y, CELL, CELL);
          } else {
            // Encrypted stage: black cell, optionally a brightened-color glyph.
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, CELL, CELL);
            if (hasGlyph[i]) {
              const br = (v: number) => Math.min(255, v * 1.6 + 40);
              const ga = 0.45 + hash(r, c, 4) * 0.45;
              ctx.fillStyle = `rgba(${br(cr)},${br(cg)},${br(cb)},${ga})`;
              ctx.fillText(glyph[i], x + CELL / 2, y + CELL / 2 + 1);
            }
          }
        }
      }
    };

    const animate = (ts: number) => {
      if (cancelled) return;
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min(1, (ts - startRef.current) / duration);
      draw(progress);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const start = () => {
      setup();
      const isFirst = firstRunRef.current;
      firstRunRef.current = false;
      // First image with animateOnMount=false: just show it sharp, no reveal.
      if (isFirst && !animateOnMount) {
        draw(1);
        return;
      }
      startRef.current = null;
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = requestAnimationFrame(animate);
    };

    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      start();
    };
    // If cached/already loaded, onload may not fire.
    if (img.complete && img.naturalWidth > 0) {
      imgRef.current = img;
      start();
    }

    // Re-fit (no re-animation) on container resize.
    const ro = new ResizeObserver(() => {
      if (!imgRef.current) return;
      setup();
      draw(1);
    });
    ro.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current!);
      ro.disconnect();
    };
  }, [src, duration, direction, animateOnMount]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

export default DecryptingImage;
