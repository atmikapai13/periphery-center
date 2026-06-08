import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as HoverCard from '@radix-ui/react-hover-card';
import { ANCIENT_CHARS, ALL_SCRAMBLE_CHARS, ScriptType } from '../utils/ancientScripts';
import { useAmbientAudio } from '../hooks/useAmbientAudio';
import { soundEffectPlayer } from '../utils/audioUtils';
import '../styles/HomePage.css';

interface GridTransformation {
  id: string;
  lineIndex: number;
  startCharIndex: number;
  rows: number;
  cols: number;
  scriptType: ScriptType;
  targetChars: string[][];
  currentChars: string[][];
  stage: 'scrambling' | 'holding' | 'reverting';
  progress: number;
  charProgress: number[][]; // Individual progress for each character (0-1)
  hasDrip: boolean[][]; // Which characters have drips
}

function HomePage() {
  const navigate = useNavigate();
  const { preloadAudio, play, stop } = useAmbientAudio({
    volume: 0.12, // Very subtle for calm computing
    fadeInDuration: 800,
    fadeOutDuration: 600
  });

  const [binaryLines, setBinaryLines] = useState<string[]>([]);
  const [transformations, setTransformations] = useState<GridTransformation[]>([]);
  const measureRef = useRef<HTMLSpanElement>(null);
  const digitsPerLineRef = useRef<number>(0);
  const lineCountRef = useRef<number>(0);
  const animationActiveRef = useRef<boolean>(false);
  const charWidthRef = useRef<number>(10);
  const lineHeightRef = useRef<number>(20.3);

  // Preload audio files
  useEffect(() => {
    // Preload the flip-flap loop sound (plays during scrambling/reverting)
    preloadAudio('flip-flap', '/audio/flip-flap-loop.mp3');

    return () => {
      // Cleanup on unmount
      soundEffectPlayer.close();
    };
  }, [preloadAudio]);

  // Generate binary matrix
  useEffect(() => {
    const generateBinaryMatrix = () => {
      const lines: string[] = [];

      let charWidth = 10;
      if (measureRef.current) {
        measureRef.current.textContent = '0 ';
        charWidth = measureRef.current.offsetWidth;
      }
      charWidthRef.current = charWidth;

      const paddingInPx = 32;
      const viewportWidth = window.innerWidth;
      const availableWidth = viewportWidth - paddingInPx;
      const digitsPerLine = Math.floor(availableWidth / charWidth) - 1;

      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - paddingInPx + 20;
      const fontSize = 14;
      const lineHeightMultiplier = 1.45;
      const actualLineHeight = fontSize * lineHeightMultiplier;
      lineHeightRef.current = actualLineHeight;
      const lineCount = Math.floor(availableHeight / actualLineHeight);

      digitsPerLineRef.current = digitsPerLine;
      lineCountRef.current = lineCount;

      for (let i = 0; i < lineCount; i++) {
        const digits: string[] = [];
        for (let j = 0; j < digitsPerLine; j++) {
          digits.push(Math.random() > 0.5 ? '1' : '0');
        }
        lines.push(digits.join(' '));
      }

      return lines;
    };

    setTimeout(() => {
      setBinaryLines(generateBinaryMatrix());
    }, 0);

    const handleResize = () => {
      setBinaryLines(generateBinaryMatrix());
      setTransformations([]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manage transformations
  useEffect(() => {
    if (binaryLines.length === 0) return;

    const startNewTransformation = () => {
      const rows = 5;
      const cols = 5;

      if (lineCountRef.current < rows + 1) return;
      if (digitsPerLineRef.current < cols) return;

      const lineIndex = Math.floor(Math.random() * (lineCountRef.current - rows));
      const startCharIndex = Math.floor(Math.random() * (digitsPerLineRef.current - cols));

      const scriptTypes = Object.keys(ANCIENT_CHARS) as Array<ScriptType>;
      const scriptType = scriptTypes[Math.floor(Math.random() * scriptTypes.length)];
      const chars = ANCIENT_CHARS[scriptType];

      const targetChars: string[][] = [];
      const charProgress: number[][] = [];
      const hasDrip: boolean[][] = [];

      for (let r = 0; r < rows; r++) {
        const row: string[] = [];
        const progressRow: number[] = [];
        const dripRow: boolean[] = [];

        for (let c = 0; c < cols; c++) {
          row.push(chars[Math.floor(Math.random() * chars.length)]);
          progressRow.push(0);
          // 20% chance of drip
          dripRow.push(Math.random() < 0.2);
        }

        targetChars.push(row);
        charProgress.push(progressRow);
        hasDrip.push(dripRow);
      }

      const newTransformation: GridTransformation = {
        id: `${Date.now()}-${Math.random()}`,
        lineIndex,
        startCharIndex,
        rows,
        cols,
        scriptType,
        targetChars,
        currentChars: targetChars.map(row => [...row]),
        stage: 'scrambling',
        progress: 0,
        charProgress,
        hasDrip
      };

      setTransformations(prev => [...prev, newTransformation]);

      // Play the flip-flap sound when scrambling starts
      play('flip-flap');

      const scrambleDuration = 2000; // 2s to decrypt
      const holdDuration = 10000; // 10s hold with hover active
      const revertDuration = 2000; // 2s to revert
      const frameRate = 20;
      const frameTime = 1000 / frameRate;

      let frameCount = 0;
      const scrambleFrames = scrambleDuration / frameTime;
      const revertFrames = revertDuration / frameTime;

      const animationInterval = setInterval(() => {
        frameCount++;

        if (frameCount <= scrambleFrames) {
          const progress = frameCount / scrambleFrames;
          setTransformations(prev => prev.map(t => {
            if (t.id !== newTransformation.id) return t;

            // Update individual character progress (organic, staggered)
            const newCharProgress = t.charProgress.map((row, r) =>
              row.map((charProg, c) => {
                // Each character progresses at slightly different rates
                const randomSpeed = 0.8 + Math.random() * 0.4; // 0.8-1.2x speed
                const newProg = Math.min(1, charProg + (randomSpeed / scrambleFrames));
                return newProg;
              })
            );

            const newCurrentChars = t.targetChars.map((row, r) =>
              row.map((targetChar, c) => {
                const charProgress = newCharProgress[r][c];
                if (charProgress > 0.7) {
                  return targetChar; // Fully revealed
                } else if (charProgress > 0.3) {
                  // Sometimes show target, sometimes scramble (flicker effect)
                  return Math.random() < charProgress ? targetChar : ALL_SCRAMBLE_CHARS[Math.floor(Math.random() * ALL_SCRAMBLE_CHARS.length)];
                } else {
                  return ALL_SCRAMBLE_CHARS[Math.floor(Math.random() * ALL_SCRAMBLE_CHARS.length)];
                }
              })
            );

            return { ...t, currentChars: newCurrentChars, charProgress: newCharProgress, progress, stage: 'scrambling' };
          }));
        } else if (frameCount === scrambleFrames + 1) {
          // Stop flip-flap sound when holding starts
          stop('flip-flap');
          setTransformations(prev => prev.map(t => {
            if (t.id !== newTransformation.id) return t;
            return { ...t, currentChars: t.targetChars, progress: 1, stage: 'holding' };
          }));
        } else if (frameCount <= scrambleFrames + holdDuration / frameTime) {
          // Continue holding
          setTransformations(prev => prev.map(t => {
            if (t.id !== newTransformation.id) return t;
            return { ...t, currentChars: t.targetChars, progress: 1, stage: 'holding' };
          }));
        } else if (frameCount === scrambleFrames + holdDuration / frameTime + 1) {
          // Start flip-flap sound when reverting begins
          play('flip-flap');

          // Reset charProgress for reverting phase
          setTransformations(prev => prev.map(t => {
            if (t.id !== newTransformation.id) return t;
            return {
              ...t,
              stage: 'reverting' as const,
              charProgress: t.charProgress.map(row => row.map(() => 0))
            };
          }));
        } else if (frameCount <= scrambleFrames + holdDuration / frameTime + revertFrames) {
          // Continue reverting with organic progress
          const revertProgress = (frameCount - scrambleFrames - holdDuration / frameTime) / revertFrames;
          setTransformations(prev => prev.map(t => {
            if (t.id !== newTransformation.id) return t;

            // Update individual character progress for reverting
            const newCharProgress = t.charProgress.map((row, r) =>
              row.map((charProg, c) => {
                const randomSpeed = 0.8 + Math.random() * 0.4;
                return Math.min(1, charProg + (randomSpeed / revertFrames));
              })
            );

            const newCurrentChars = t.targetChars.map((row, r) =>
              row.map((targetChar, c) => {
                const charProgress = newCharProgress[r][c];
                if (charProgress > 0.7) {
                  return Math.random() > 0.5 ? '1' : '0'; // Back to binary
                } else if (charProgress > 0.3) {
                  // Flicker between target and binary
                  return Math.random() < charProgress ? (Math.random() > 0.5 ? '1' : '0') : targetChar;
                } else {
                  return targetChar;
                }
              })
            );

            return { ...t, currentChars: newCurrentChars, charProgress: newCharProgress, progress: 1 - revertProgress, stage: 'reverting' };
          }));
        } else {
          // Stop flip-flap sound when animation ends
          stop('flip-flap');
          clearInterval(animationInterval);
          setTransformations(prev => prev.filter(t => t.id !== newTransformation.id));
        }
      }, frameTime);
    };

    const runSequentialAnimations = () => {
      const startNextAnimation = () => {
        if (animationActiveRef.current) return;

        animationActiveRef.current = true;
        startNewTransformation();

        setTimeout(() => {
          animationActiveRef.current = false;
          startNextAnimation();
        }, 14000); // 2s scramble + 10s hold + 2s revert = 14s total
      };

      setTimeout(startNextAnimation, 2000);
    };

    runSequentialAnimations();

    return () => {
      animationActiveRef.current = false;
    };
  }, [binaryLines]);

  // Helper to check if position is in a transformation
  const getTransformationAt = (lineIndex: number, charIndex: number) => {
    for (const transformation of transformations) {
      const { lineIndex: tLine, startCharIndex, rows, cols, currentChars, hasDrip, charProgress } = transformation;

      if (lineIndex >= tLine && lineIndex < tLine + rows &&
          charIndex >= startCharIndex && charIndex < startCharIndex + cols) {
        const row = lineIndex - tLine;
        const col = charIndex - startCharIndex;
        return {
          char: currentChars[row][col],
          transformation,
          hasDrip: hasDrip[row][col],
          charProgress: charProgress[row][col]
        };
      }
    }
    return { char: null, transformation: null, hasDrip: false, charProgress: 0 };
  };

  // Render line with transformations - characters stay in-place
  const renderLine = (line: string, lineIndex: number) => {
    const chars = line.split(' ');

    return chars.map((char, charIndex) => {
      const { char: overlayChar, hasDrip, charProgress } = getTransformationAt(lineIndex, charIndex);

      if (overlayChar) {
        const classes = ['transforming-char'];

        // Add spray paint appearance when character is revealed
        if (charProgress > 0.6) {
          classes.push('spray-paint-in');
        }

        // Add wobble during transformation
        if (charProgress > 0.1 && charProgress < 0.9) {
          classes.push('wobbling');
        }

        return (
          <span key={charIndex} className={classes.join(' ')} style={{ position: 'relative' }}>
            {overlayChar}
            {hasDrip && charProgress > 0.5 && (
              <span className="char-drip animating" />
            )}
            {charIndex < chars.length - 1 && ' '}
          </span>
        );
      }

      return <span key={charIndex}>{char}{charIndex < chars.length - 1 && ' '}</span>;
    });
  };

  // Render hover card overlays for holding transformations
  const renderHoverCards = () => {
    return transformations.map(transformation => {
      if (transformation.stage !== 'holding') return null;

      const { id, lineIndex, startCharIndex, rows, cols, scriptType } = transformation;

      // Calculate position of the grid using measured dimensions
      const charWidth = charWidthRef.current;
      const lineHeight = lineHeightRef.current;
      const left = startCharIndex * charWidth;
      const top = lineIndex * lineHeight;
      // Ancient characters are wider than digits, so multiply width
      const width = cols * charWidth * 2.2;
      const height = rows * lineHeight;

      return (
        <HoverCard.Root key={id} openDelay={0} closeDelay={100}>
          <HoverCard.Trigger asChild>
            <div
              className="hover-trigger-zone"
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                cursor: 'pointer'
              }}
            />
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content
              className="hover-card-content"
              sideOffset={-height}
              alignOffset={0}
              side="bottom"
              align="start"
            >
              <div className="hover-circle" onClick={() => navigate('/about')}>
                <div className="hover-circle-text">
                  <div className="hover-circle-title">
                    The<br/>Periphery<br/>Center
                  </div>
                  <div className="hover-circle-subtitle">
                    A Living Culture Lab
                  </div>
                </div>
              </div>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      );
    });
  };

  return (
    <div className="binary-page">
      <span ref={measureRef} style={{
        position: 'absolute',
        visibility: 'hidden',
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        whiteSpace: 'pre'
      }} />
      <div className="binary-matrix">
        {binaryLines.map((line, index) => (
          <div key={index} className="binary-line">
            {renderLine(line, index)}
          </div>
        ))}
        {renderHoverCards()}
      </div>
    </div>
  );
}

export default HomePage;
