import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateBinaryGroups } from '../utils/binaryGroupCalculator';
import '../styles/LandingPage.css';

// Animation timing (ms). Background binaries radially scramble (Phase 2A), then
// disappear in random chunks (Phase 2B); the title binaries stay bright throughout.
const REVEAL_DURATION = 5000; // Phase 2A (1.5s) + Phase 2B (3.5s)
const SCRAMBLE_END = 1500;
const FADE_DURATION = 3500;
const FRAME_INTERVAL = 40; // redraw cadence (~25fps) — canvas is cheap, but this
                           // caps work on weak mobile CPUs without visible stutter.

// Grid sizing. Lower REQUIRED_COLS → bigger binary cells (and a bigger title).
const REF_FONT = 12;
const MIN_FONT = 4;
const REQUIRED_COLS = 45;
// Extra breathing room between binary cells (>1 spreads them apart). Widens the
// cell stride without changing the digit size; the column count auto-adjusts so
// the title still fits.
const CHAR_SPACING = 1.2;

// How fast the radial digit churn moves. <1 = calmer/slower flicker (the total
// 7s animation length is unaffected — this only slows the decrypt/encrypt shimmer).
const SCRAMBLE_SPEED = 0.15;

// Deterministic circular scramble digit for a background cell (ported from the
// old per-cell hook, but now evaluated straight into the canvas draw).
function scrambleChar(row: number, col: number, cols: number, rows: number, elapsed: number): string {
  const t = elapsed * SCRAMBLE_SPEED;
  const distance = Math.sqrt((row - rows / 2) ** 2 + (col - cols / 2) ** 2);
  const wave = Math.sin(distance * 0.3 - t * 0.01);
  const scrambleIndex = Math.floor(wave * 4 + t * 0.005);
  return Math.abs(scrambleIndex) % 2 === 0 ? '0' : '1';
}

// Deterministic per-chunk disappearance during Phase 2B.
function chunkDisappeared(row: number, col: number, fadeProgress: number): boolean {
  if (fadeProgress >= 0.9) return true;
  const chunkSize = 8;
  const chunkSeed = (Math.floor(row / chunkSize) * 17 + Math.floor(col / chunkSize) * 23) % 100;
  return fadeProgress > (chunkSeed / 100) * 0.85;
}

function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  // The matrix's computed cell font size, surfaced so the corner arrows can
  // render at the exact same size as the binary title text.
  const [matrixFontSize, setMatrixFontSize] = useState(REF_FONT);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let active = true;
    let rafId = 0;
    let startTime = 0;
    let lastDraw = -Infinity;

    // Grid config (recomputed on setup + resize).
    let cols = 0;
    let rows = 0;
    let fontSize = REF_FONT;
    let cellW = 10;
    let lineH = 17;
    let textPositions = new Set<string>();
    const LEFT = 32; // 2rem, matches the page's left padding
    const TOP = 16; // 1rem

    const bgFont = () => `400 ${fontSize}px "JetBrains Mono", "Roboto Mono", monospace`;
    const titleFont = () => `700 ${fontSize}px "JetBrains Mono", "Roboto Mono", monospace`;

    const computeGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const availableWidth = W - 48; // left 2rem + right 1rem
      const availableHeight = H - 24;

      // Pass 1: at the reference size, choose a font that fits REQUIRED_COLS.
      ctx.font = `400 ${REF_FONT}px "JetBrains Mono", "Roboto Mono", monospace`;
      const charWidthRef = ctx.measureText('0 ').width || 10;
      const maxCell = availableWidth / (REQUIRED_COLS + 1);
      fontSize = Math.max(MIN_FONT, Math.min(REF_FONT, REF_FONT * (maxCell / charWidthRef)));

      // Pass 2: measure the real cell stride at the chosen size, then widen it
      // (and the line height) by CHAR_SPACING so the cells aren't cramped.
      ctx.font = bgFont();
      cellW = (ctx.measureText('0 ').width || charWidthRef * (fontSize / REF_FONT)) * CHAR_SPACING;
      lineH = fontSize * 1.4 * CHAR_SPACING;

      cols = Math.max(1, Math.floor(availableWidth / cellW) - 1);
      rows = Math.max(1, Math.floor(availableHeight / lineH));
      textPositions = calculateBinaryGroups(cols, rows).textPositions;
      setMatrixFontSize(fontSize); // keep the corner arrows in sync with the title
    };

    const draw = (elapsed: number) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
      ctx.textBaseline = 'top';

      const fadeProgress = elapsed > SCRAMBLE_END ? (elapsed - SCRAMBLE_END) / FADE_DURATION : -1;

      // Background binaries (grey, no glow) — batched in one style.
      ctx.font = bgFont();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(177, 176, 176, 0.42)'; // #b1b0b06a
      for (let row = 0; row < rows; row++) {
        const y = TOP + row * lineH;
        for (let col = 0; col < cols; col++) {
          if (textPositions.has(`${row},${col}`)) continue;
          if (fadeProgress >= 0 && chunkDisappeared(row, col, fadeProgress)) continue;
          ctx.fillText(scrambleChar(row, col, cols, rows, elapsed), LEFT + col * cellW, y);
        }
      }

      // Title binaries (bright white, bold, soft glow) — drawn once on top.
      ctx.font = titleFont();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = Math.max(2, fontSize * 0.5);
      textPositions.forEach((key) => {
        const comma = key.indexOf(',');
        const row = Number(key.slice(0, comma));
        const col = Number(key.slice(comma + 1));
        const ch = (row + col) % 2 === 0 ? '1' : '0';
        ctx.fillText(ch, LEFT + col * cellW, TOP + row * lineH);
      });
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      if (!active) return;
      const now = Date.now();
      const elapsed = now - startTime;
      if (elapsed >= REVEAL_DURATION) {
        draw(REVEAL_DURATION); // final frame: only the bright title binaries remain
        setIsComplete(true);
        return;
      }
      if (now - lastDraw >= FRAME_INTERVAL) {
        draw(elapsed);
        lastDraw = now;
      }
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      computeGrid();
      setIsComplete(false);
      startTime = Date.now();
      lastDraw = -Infinity;
      rafId = requestAnimationFrame(loop);
    };

    // Wait for JetBrains Mono (both weights) so glyph metrics match the draw and
    // there's no fallback-font flash, then start.
    (async () => {
      try {
        await Promise.all([
          document.fonts.load('400 12px "JetBrains Mono"'),
          document.fonts.load('700 12px "JetBrains Mono"'),
        ]);
        await document.fonts.ready;
      } catch {
        /* Font Loading API unavailable — render with the fallback anyway. */
      }
      if (active) start();
    })();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!active) return;
        cancelAnimationFrame(rafId);
        start();
      }, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="binary-page">
      <canvas ref={canvasRef} className="binary-canvas" />

      {/* Clickable overlay appears when animation is complete */}
      {isComplete && (
        <div
          className="title-overlay"
          style={{ opacity: 1, cursor: 'pointer', pointerEvents: 'all' }}
          onClick={() => navigate('/about')}
        >
          <div className="title-text" style={{ opacity: 0 }}>
            <div className="title-line">THE</div>
            <div className="title-line">PERIPHERY</div>
            <div className="title-line">CENTER</div>
          </div>
        </div>
      )}

      {/* Binary arrow indicators at bottom right */}
      {isComplete && (
        <div className="binary-arrows" style={{ fontSize: `${matrixFontSize}px` }}>
          <div className="arrow-pattern">
            <div className="arrow-row">
              {Array.from('            1').map((char, i) => (
                <span key={i} className="binary-digit" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('            1 1').map((char, i) => (
                <span key={i} className="binary-digit" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('1 0 1 1 0 1 0 0 1').map((char, i) => (
                <span key={i} className="binary-digit" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('            0 1').map((char, i) => (
                <span key={i} className="binary-digit" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('            0').map((char, i) => (
                <span key={i} className="binary-digit" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
