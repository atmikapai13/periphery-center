/**
 * Pre-calculates binary groups based on screen size for optimal performance
 * Eliminates runtime randomization by systematizing position assignments
 */

export interface BinaryGroupConfig {
  textPositions: Set<string>; // Positions that form "THE PERIPHERY CENTER"
  backgroundPositions: Set<string>; // Positions that fade to background
  gridDimensions: { width: number; height: number };
  textLayout: TextGroup[];
}

export interface TextGroup {
  word: string;
  startRow: number;
  startCol: number;
  positions: { row: number; col: string }[];
}

/**
 * Systematically calculates which binaries belong to which group
 */
export function calculateBinaryGroups(
  gridWidth: number,
  gridHeight: number,
  charWidth: number = 10
): BinaryGroupConfig {

  const textPositions = new Set<string>();
  const backgroundPositions = new Set<string>();
  const textLayout: TextGroup[] = [];

  // Desktop letter patterns: the original 6-row x 5-col glyphs.
  const desktopPatterns = {
    'T': ['11111', '11111', '00100', '00100', '00100', '00100'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001'],
    'E': ['11111', '10000', '10000', '11110', '10000', '11111'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000'],
    'R': ['11110', '10001', '10001', '11110', '10010', '10001'],
    'I': ['11111', '00100', '00100', '00100', '00100', '11111'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100'],
    'C': ['01111', '10000', '10000', '10000', '10000', '01111'],
    'N': ['10001', '11001', '10101', '10101', '10011', '10001'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001']
  };

  // Mobile letter patterns: narrower 5-row x 4-col glyphs so the title fits.
  const mobilePatterns = {
    'T': ['1111', '0110', '0110', '0110', '0110'],
    'H': ['1001', '1001', '1111', '1001', '1001'],
    'E': ['1111', '1000', '1110', '1000', '1111'],
    'P': ['1110', '1001', '1110', '1000', '1000'],
    'R': ['1110', '1001', '1110', '1010', '1001'],
    'I': ['1111', '0110', '0110', '0110', '1111'],
    'Y': ['1001', '1001', '0110', '0110', '0110'],
    'C': ['0111', '1000', '1000', '1000', '0111'],
    'N': ['1001', '1101', '1011', '1011', '1001'],
    'A': ['0110', '1001', '1111', '1001', '1001']
  };

  const lines = ["THE", "PERIPHERY", "CENTER"];
  const longestLine = Math.max(
    ...lines.map((l) => Array.from(l).filter((c) => c !== ' ').length)
  );

  // Pick the layout: keep the original desktop design when the grid is wide
  // enough for it; otherwise fall back to the compact mobile layout. Desktop is
  // unchanged from before.
  const DESKTOP_W = 5;      // desktop letter width
  const DESKTOP_STRIDE = 7; // desktop letter + gap
  const DESKTOP_LINE = 8;   // desktop per-line row stride (6 letter + 2 gap)
  const DESKTOP_MARGIN = 5;
  const desktopTitleWidth =
    DESKTOP_MARGIN + (longestLine - 1) * DESKTOP_STRIDE + DESKTOP_W;

  let letterPatterns: Record<string, string[]>;
  let letterWidth: number;
  let stride: number;
  let leftMargin: number;
  let lineStride: number;

  if (gridWidth >= desktopTitleWidth) {
    // Desktop — original look.
    letterPatterns = desktopPatterns;
    letterWidth = DESKTOP_W;
    stride = DESKTOP_STRIDE;
    leftMargin = DESKTOP_MARGIN;
    lineStride = DESKTOP_LINE;
  } else {
    // Mobile — narrow 4-wide glyphs, compact line stride, comfortable 1-col gap
    // that only tightens (margin then gap) as much as a narrow grid requires.
    letterPatterns = mobilePatterns;
    letterWidth = 4;
    lineStride = 7; // 5 letter + 2 gap
    leftMargin = 5;
    stride = letterWidth + 1;
    const titleWidth = (s: number, m: number) =>
      m + (longestLine - 1) * s + letterWidth;
    if (titleWidth(stride, leftMargin) > gridWidth) {
      leftMargin = 1;
      while (stride > letterWidth && titleWidth(stride, leftMargin) > gridWidth) {
        stride -= 1;
      }
    }
  }

  // Calculate layout systematically (left-aligned, moved up from center)
  const totalTextHeight = lines.length * lineStride;
  const centerRow = Math.floor((gridHeight - totalTextHeight) / 2);
  const startRow = Math.max(0, centerRow - Math.floor(gridHeight * 0.05)); // Move up by 12%

  lines.forEach((line, lineIndex) => {
    const lineStartCol = leftMargin;
    const lineStartRow = startRow + lineIndex * lineStride;

    Array.from(line).forEach((char, charIndex) => {
      if (char === ' ') return;

      const pattern = letterPatterns[char as keyof typeof letterPatterns];
      if (!pattern) return;

      const charBaseRow = lineStartRow;
      const charBaseCol = lineStartCol + charIndex * stride;

      const charPositions: { row: number; col: string }[] = [];

      // Map character pattern to grid positions
      pattern.forEach((row, rowIndex) => {
        Array.from(row).forEach((pixel, colIndex) => {
          if (pixel === '1') {
            const gridRow = charBaseRow + rowIndex;
            const gridCol = charBaseCol + colIndex;

            if (gridRow >= 0 && gridRow < gridHeight && gridCol >= 0 && gridCol < gridWidth) {
              const posKey = `${gridRow},${gridCol}`;
              textPositions.add(posKey);
              charPositions.push({ row: gridRow, col: posKey });
            }
          }
        });
      });

      textLayout.push({
        word: char,
        startRow: charBaseRow,
        startCol: charBaseCol,
        positions: charPositions
      });
    });
  });

  // All other positions are background
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const posKey = `${row},${col}`;
      if (!textPositions.has(posKey)) {
        backgroundPositions.add(posKey);
      }
    }
  }

  return {
    textPositions,
    backgroundPositions,
    gridDimensions: { width: gridWidth, height: gridHeight },
    textLayout
  };
}