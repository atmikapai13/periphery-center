/**
 * Font-based character-to-grid mapping utility for binary-to-text decryption effect
 * Maps character shapes to binary grid positions using DOM measurement
 */

export interface CharacterGridMapping {
  char: string;
  positions: { row: number; col: number }[];
  bounds: {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
}

export interface TextLayoutMapping {
  lines: string[];
  characters: CharacterGridMapping[];
  totalBounds: {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
}

/**
 * Maps text characters to binary grid positions based on font rendering
 * Uses DOM canvas to analyze pixel data and determine which grid positions
 * should remain visible to form letter shapes
 */
export class FontGridMapper {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fontSize: number;
  private fontFamily: string;
  private charWidth: number;
  private lineHeight: number;
  private gridSpacing: number; // Space between binary digits

  constructor(
    fontSize: number = 14,
    fontFamily: string = 'Helvetica, Arial, sans-serif',
    charWidth: number = 10,
    lineHeight: number = 20.3,
    gridSpacing: number = 1
  ) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.charWidth = charWidth;
    this.lineHeight = lineHeight;
    this.gridSpacing = gridSpacing;

    // Set up canvas for character analysis
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Make canvas large enough for character analysis
    this.canvas.width = 200;
    this.canvas.height = 100;

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${this.fontSize * 3}px ${this.fontFamily}`;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'left';
  }

  /**
   * Analyzes a single character and returns grid positions that should remain
   */
  private analyzeCharacter(char: string): { row: number; col: number }[] {
    if (char === ' ') return []; // Spaces have no visible positions

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render character in white
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(char, 10, 10);

    // Get pixel data
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;

    const positions: { row: number; col: number }[] = [];
    const samplingRate = 3; // Sample every 3rd pixel for performance

    // Convert pixel data to grid positions
    for (let y = 0; y < this.canvas.height; y += samplingRate) {
      for (let x = 0; x < this.canvas.width; x += samplingRate) {
        const index = (y * this.canvas.width + x) * 4;
        const r = pixels[index];

        // If pixel is white (character pixel), convert to grid position
        if (r > 128) {
          // Scale down from canvas coordinates to grid coordinates
          const gridRow = Math.floor(y / (this.fontSize * 0.8));
          const gridCol = Math.floor(x / (this.charWidth * 0.8));

          positions.push({ row: gridRow, col: gridCol });
        }
      }
    }

    return positions;
  }

  /**
   * Maps multi-line text to grid positions
   * Returns layout with character positions for the decryption effect
   */
  public mapTextToGrid(
    lines: string[],
    gridWidth: number,
    gridHeight: number
  ): TextLayoutMapping {
    // Simplified approach: create basic text shapes using font measurement
    const characters: CharacterGridMapping[] = [];
    const maxLineLength = Math.max(...lines.map(line => line.length));

    // Calculate left-aligned positioning
    const totalTextHeight = lines.length * 8; // 8 rows per line of text (6 for letter + 2 spacing)
    const startRow = Math.max(0, Math.floor((gridHeight - totalTextHeight) / 2)); // Vertically center
    const leftMargin = 5; // Left margin from edge

    let totalBounds = {
      startRow: Infinity,
      endRow: -Infinity,
      startCol: Infinity,
      endCol: -Infinity
    };

    lines.forEach((line, lineIndex) => {
      const lineStartCol = leftMargin; // Left-align all lines

      Array.from(line).forEach((char, charIndex) => {
        if (char === ' ') return; // Skip spaces

        // Create simple rectangular character shapes
        const charBaseRow = startRow + lineIndex * 8; // Space lines apart (6 for letter + 2 spacing)
        const charBaseCol = lineStartCol + charIndex * 7; // Space characters apart

        const positions: { row: number; col: number }[] = [];

        // Create a simple 6x5 character pattern
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 5; c++) {
            // Create letter-like shapes based on character
            if (this.shouldIncludePixel(char, r, c)) {
              const row = charBaseRow + r;
              const col = charBaseCol + c;

              if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
                positions.push({ row, col });
              }
            }
          }
        }

        if (positions.length > 0) {
          const charBounds = {
            startRow: Math.min(...positions.map(p => p.row)),
            endRow: Math.max(...positions.map(p => p.row)),
            startCol: Math.min(...positions.map(p => p.col)),
            endCol: Math.max(...positions.map(p => p.col))
          };

          characters.push({
            char,
            positions,
            bounds: charBounds
          });

          // Update total bounds
          totalBounds.startRow = Math.min(totalBounds.startRow, charBounds.startRow);
          totalBounds.endRow = Math.max(totalBounds.endRow, charBounds.endRow);
          totalBounds.startCol = Math.min(totalBounds.startCol, charBounds.startCol);
          totalBounds.endCol = Math.max(totalBounds.endCol, charBounds.endCol);
        }
      });
    });

    return {
      lines,
      characters,
      totalBounds
    };
  }

  /**
   * Simple pixel pattern for basic letter shapes (6x5 grid)
   */
  private shouldIncludePixel(char: string, row: number, col: number): boolean {
    const patterns: Record<string, string[]> = {
      'T': [
        '11111',
        '11111',
        '00100',
        '00100',
        '00100',
        '00100'
      ],
      'H': [
        '10001',
        '10001',
        '10001',
        '11111',
        '10001',
        '10001'
      ],
      'E': [
        '11111',
        '10000',
        '10000',
        '11110',
        '10000',
        '11111'
      ],
      'P': [
        '11110',
        '10001',
        '10001',
        '11110',
        '10000',
        '10000'
      ],
      'R': [
        '11110',
        '10001',
        '10001',
        '11110',
        '10010',
        '10001'
      ],
      'I': [
        '11111',
        '00100',
        '00100',
        '00100',
        '00100',
        '11111'
      ],
      'Y': [
        '10001',
        '10001',
        '01010',
        '00100',
        '00100',
        '00100'
      ],
      'C': [
        '01111',
        '10000',
        '10000',
        '10000',
        '10000',
        '01111'
      ],
      'N': [
        '10001',
        '11001',
        '10101',
        '10101',
        '10011',
        '10001'
      ],
      'A': [
        '01110',
        '10001',
        '10001',
        '11111',
        '10001',
        '10001'
      ]
    };

    const pattern = patterns[char.toUpperCase()];
    if (!pattern || row >= pattern.length || col >= pattern[0].length) {
      return Math.random() > 0.7; // Fallback pattern for unknown chars
    }

    return pattern[row][col] === '1';
  }

  /**
   * Creates a lookup map for quick position checks
   */
  public createPositionLookup(mapping: TextLayoutMapping): Set<string> {
    const lookup = new Set<string>();

    mapping.characters.forEach(char => {
      char.positions.forEach(pos => {
        lookup.add(`${pos.row},${pos.col}`);
      });
    });

    return lookup;
  }

  /**
   * Generates theatrical timing offsets for dramatic reveal effect
   */
  public generateRevealTimings(
    mapping: TextLayoutMapping,
    totalDuration: number = 3000 // 3 seconds for dual-process decode
  ): Map<string, number> {
    const timings = new Map<string, number>();

    mapping.characters.forEach((char, charIndex) => {
      char.positions.forEach((pos, posIndex) => {
        // Theatrical timing: dramatic waves across the screen
        const baseDelay = (charIndex / mapping.characters.length) * totalDuration * 0.7;

        // Add dramatic randomness for theatrical feel
        const randomOffset = (Math.random() - 0.5) * 400; // ±200ms variation

        // Create wave effect that sweeps across the screen
        const waveOffset = (pos.col * 8) + (pos.row * 3);

        const finalDelay = Math.max(0, baseDelay + randomOffset + waveOffset);
        timings.set(`${pos.row},${pos.col}`, finalDelay);
      });
    });

    return timings;
  }

  /**
   * Clean up canvas resources
   */
  public dispose(): void {
    // Canvas will be garbage collected automatically
  }
}

/**
 * Utility function to create font grid mapper with current page measurements
 */
export function createFontGridMapper(
  measureRef: React.RefObject<HTMLElement>,
  fontSize: number = 14,
  fontFamily: string = 'Helvetica, Arial, sans-serif'
): FontGridMapper {
  let charWidth = 10;
  let lineHeight = 20.3;

  if (measureRef.current) {
    measureRef.current.textContent = '0 ';
    charWidth = measureRef.current.offsetWidth;

    measureRef.current.textContent = '0\n0';
    lineHeight = measureRef.current.offsetHeight / 2;
  }

  return new FontGridMapper(fontSize, fontFamily, charWidth, lineHeight);
}