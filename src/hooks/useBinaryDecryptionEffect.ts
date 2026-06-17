/**
 * Hook for managing the binary background animation behind "THE PERIPHERY CENTER".
 * Text binaries render bright from the start; the background binaries radially
 * scramble (Phase 2A, 0-3s) then disappear in random chunks (Phase 2B, 3-7s).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateBinaryGroups, calculateRevealTimings, BinaryGroupConfig } from '../utils/binaryGroupCalculator';

export interface BinaryChar {
  char: string;
  phase: 'binary' | 'transitioning' | 'revealed';
  shouldRemain: boolean; // Whether this position forms part of a letter
  revealDelay: number; // When this character should start revealing (ms)
  glitchIntensity: number; // 0-1 for glitch effects
  revealProgress?: number; // 0-1 progress for smooth opacity transitions
}

export interface DecryptionState {
  phase: 'revealing' | 'complete';
  progress: number; // 0-1
  elapsedTime: number;
}

export interface UseBinaryDecryptionEffectProps {
  text: string[];
  gridWidth: number;
  gridHeight: number;
  measureRef: React.RefObject<HTMLElement>;
  onComplete?: () => void;
  fontSize?: number;
  fontFamily?: string;
}

export function useBinaryDecryptionEffect({
  text,
  gridWidth,
  gridHeight,
  measureRef,
  onComplete,
  fontSize = 14,
  fontFamily = 'Helvetica, Arial, sans-serif'
}: UseBinaryDecryptionEffectProps) {

  const [binaryGrid, setBinaryGrid] = useState<BinaryChar[][]>([]);
  const [decryptionState, setDecryptionState] = useState<DecryptionState>({
    phase: 'revealing',
    progress: 0,
    elapsedTime: 0
  });

  const binaryGroupsRef = useRef<BinaryGroupConfig>();
  const revealTimingsRef = useRef<Map<string, number>>();
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const frameCountRef = useRef<number>(0);

  // Animation timing constants (in milliseconds)
  const REVEAL_DURATION = 7000; // No emergence: Phase 2A=3s + Phase 2B=4s
  const TOTAL_DURATION = REVEAL_DURATION;

  // Initialize binary grid systematically
  const initializeGrid = useCallback(() => {
    if (!measureRef.current || gridWidth === 0 || gridHeight === 0) return;

    // Calculate binary groups systematically (no randomization)
    const binaryGroups = calculateBinaryGroups(gridWidth, gridHeight);
    binaryGroupsRef.current = binaryGroups;

    // Generate deterministic reveal timings
    const timings = calculateRevealTimings(
      binaryGroups.textPositions,
      binaryGroups.backgroundPositions,
      REVEAL_DURATION
    );
    revealTimingsRef.current = timings;

    // Initialize binary grid with systematic assignment
    const newGrid: BinaryChar[][] = [];

    for (let row = 0; row < gridHeight; row++) {
      const gridRow: BinaryChar[] = [];
      for (let col = 0; col < gridWidth; col++) {
        const posKey = `${row},${col}`;
        const shouldRemain = binaryGroups.textPositions.has(posKey);
        const revealDelay = timings.get(posKey) || 0;

        // Text positions start fully revealed (bright white); background
        // positions start as plain binary (grey #b1b0b06a) and will scramble.
        gridRow.push({
          char: (row + col) % 2 === 0 ? '1' : '0', // deterministic digit
          phase: shouldRemain ? 'revealed' : 'binary',
          shouldRemain,
          revealDelay,
          glitchIntensity: shouldRemain ? 0 : 0.2,
          revealProgress: shouldRemain ? 1 : 0
        });
      }
      newGrid.push(gridRow);
    }

    console.log(`Text positions: ${binaryGroups.textPositions.size}, Background: ${binaryGroups.backgroundPositions.size}`);

    setBinaryGrid(newGrid);
  }, [gridWidth, gridHeight, measureRef]);

  // Start the animation
  const startAnimation = useCallback(() => {
    startTimeRef.current = Date.now();
    frameCountRef.current = 0;
    setDecryptionState({
      phase: 'revealing',
      progress: 0,
      elapsedTime: 0
    });

    const animate = () => {
      if (!startTimeRef.current) return;

      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimeRef.current;
      const progress = Math.min(elapsedTime / TOTAL_DURATION, 1);

      // Determine current phase
      let phase: DecryptionState['phase'];
      if (elapsedTime < REVEAL_DURATION) {
        phase = 'revealing';
      } else {
        phase = 'complete';
      }

      // Update state
      setDecryptionState({
        phase,
        progress,
        elapsedTime
      });

      // Update binary grid based on current phase
      // PERFORMANCE: Only update grid every 3rd frame (20fps instead of 60fps)
      const FRAME_SKIP = 3;
      frameCountRef.current++;

      if (phase === 'revealing') {
        if (frameCountRef.current % FRAME_SKIP === 0) {
          updateRevealPhase(elapsedTime);
        }
      } else {
        // Animation complete
        onComplete?.();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [onComplete]);

  // No emergence phase. Text stays fully revealed the whole time; the
  // background binaries radially scramble (Phase 2A), then disappear in
  // random chunks (Phase 2B).
  const updateRevealPhase = useCallback((revealElapsed: number) => {
    // PHASE 2A: 0-3000ms - radial scramble (3s)
    // PHASE 2B: 3000-7000ms - random chunks disappear (4s)
    const SCRAMBLE_END = 3000;

    setBinaryGrid(prevGrid =>
      prevGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell.shouldRemain) {
            // TEXT POSITIONS: always fully revealed (bright white).
            return {
              ...cell,
              phase: 'revealed' as const,
              char: getCharacterForPosition(rowIndex, colIndex),
              glitchIntensity: 0,
              revealProgress: 1
            };
          }

          // BACKGROUND POSITIONS
          // Phase 2A: circular scrambling from t=0
          if (revealElapsed <= SCRAMBLE_END) {
            return {
              ...cell,
              phase: 'transitioning' as const,
              char: getCircularScrambleChar(rowIndex, colIndex, revealElapsed),
              glitchIntensity: 0,
              revealProgress: 0.1 // Constant phase indicator
            };
          }
          // Phase 2B: random chunks disappear over 4 seconds
          const fadeProgress = (revealElapsed - SCRAMBLE_END) / 4000; // 0 to 1
          const shouldDisappear = getRandomChunkDisappear(rowIndex, colIndex, fadeProgress);

          return {
            ...cell,
            phase: 'transitioning' as const,
            char: shouldDisappear ? '' : getCircularScrambleChar(rowIndex, colIndex, revealElapsed),
            glitchIntensity: 0,
            revealProgress: shouldDisappear ? 1.0 : 0.1
          };
        })
      )
    );
  }, []);

  // Get the target character for a specific grid position (systematic)
  const getCharacterForPosition = useCallback((row: number, col: number): string => {
    // Simple deterministic binary digit based on position (no randomization)
    return (row + col) % 2 === 0 ? '1' : '0';
  }, []);

  // Generate circular scrambling pattern for background positions
  const getCircularScrambleChar = useCallback((row: number, col: number, elapsedTime: number): string => {
    // Create circular wave pattern based on distance from center
    const centerRow = gridHeight / 2;
    const centerCol = gridWidth / 2;
    const distance = Math.sqrt((row - centerRow) ** 2 + (col - centerCol) ** 2);

    // Time-based wave that expands outward
    const wave = Math.sin((distance * 0.3) - (elapsedTime * 0.01));
    const scrambleIndex = Math.floor(wave * 4 + elapsedTime * 0.005);

    // Circular pattern alternates between binary digits
    const binaryChars = ['0', '1'];
    return binaryChars[Math.abs(scrambleIndex) % 2];
  }, [gridWidth, gridHeight]);

  // Determine if character should disappear in random chunks
  const getRandomChunkDisappear = useCallback((row: number, col: number, fadeProgress: number): boolean => {
    // Ensure ALL chunks disappear by the end - force disappear at 90% progress
    if (fadeProgress >= 0.9) {
      return true;
    }

    // Create deterministic "random" chunks based on position
    const chunkSize = 8; // Size of each disappearing chunk
    const chunkRow = Math.floor(row / chunkSize);
    const chunkCol = Math.floor(col / chunkSize);

    // Create pseudo-random seed for this chunk
    const chunkSeed = (chunkRow * 17 + chunkCol * 23) % 100;

    // Progressive disappearance - chunks disappear at different times
    // Scale threshold to 0-0.85 so all chunks disappear before 90% progress
    const disappearThreshold = (chunkSeed / 100) * 0.85; // 0 to 0.85

    // Chunk disappears when fadeProgress exceeds its threshold
    return fadeProgress > disappearThreshold;
  }, []);



  // Initialize when dependencies change
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Start animation when grid is ready
  useEffect(() => {
    if (binaryGrid.length > 0) {
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [binaryGrid.length, startAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    binaryGrid,
    decryptionState,
    isComplete: decryptionState.phase === 'complete'
  };
}