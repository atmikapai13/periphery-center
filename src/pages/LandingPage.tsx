import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBinaryDecryptionEffect } from '../hooks/useBinaryDecryptionEffect';
import '../styles/LandingPage.css';

const TITLE_LINES = ["THE", "PERIPHERY", "CENTER"];

function LandingPage() {
  const navigate = useNavigate();
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });
  // Binary-matrix font size in px. Shrinks on narrow screens so the embedded
  // title (esp. "PERIPHERY") still fits one line; capped at 12px on desktop.
  const [fontSize, setFontSize] = useState(12);
  const [animationStarted, setAnimationStarted] = useState(false);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Initialize grid dimensions
  useEffect(() => {
    // The title's letter stride adapts to the grid width (see binaryGroupCalculator),
    // so the title always fits. Aiming for more columns just makes the binary cells
    // (and thus the title) smaller on narrow screens; desktop caps at REF_FONT.
    const REF_FONT = 12;       // desktop / reference size
    const MIN_FONT = 4;        // never go smaller than this
    const REQUIRED_COLS = 60;  // higher target → smaller binary cells on mobile

    const calculateGridDimensions = () => {
      const el = measureRef.current;
      if (!el) return;
      el.style.lineHeight = '1.4';

      const paddingInPx = 32;
      const availableWidth = window.innerWidth - paddingInPx;
      const availableHeight = window.innerHeight - paddingInPx + 20;

      // Pass 1: measure a "digit + space" cell at the 12px reference to choose a
      // target font size that fits REQUIRED_COLS columns.
      el.style.fontSize = `${REF_FONT}px`;
      el.textContent = '0 ';
      const charWidth12 = el.offsetWidth || 10;

      const maxCellForFit = availableWidth / (REQUIRED_COLS + 1);
      const nextFontSize = Math.max(
        MIN_FONT,
        Math.min(REF_FONT, REF_FONT * (maxCellForFit / charWidth12))
      );

      // Pass 2: re-measure at the chosen size to get the REAL rendered cell width.
      // If a mobile browser clamps/boosts tiny fonts, this captures it, so the
      // grid math matches what's actually drawn (no overflow, title stays centered).
      el.style.fontSize = `${nextFontSize}px`;
      el.textContent = '0 ';
      const realCharWidth = el.offsetWidth || charWidth12 * (nextFontSize / REF_FONT);
      // Derive the actually-rendered px size from the width ratio, then the line
      // height (matching the matrix's line-height: 1.4).
      const actualFont = REF_FONT * (realCharWidth / charWidth12);
      const realLineHeight = actualFont * 1.4;

      const digitsPerLine = Math.floor(availableWidth / realCharWidth) - 1;
      const lineCount = Math.floor(availableHeight / realLineHeight);

      setFontSize(nextFontSize);
      setGridDimensions({ width: digitsPerLine, height: lineCount });
    };

    // Wait for the binary-matrix web font (JetBrains Mono, both weights) to load
    // before measuring/rendering the grid. Otherwise the browser draws the
    // fallback monospace first and swaps to JetBrains Mono mid-animation, which
    // both shifts the glyphs and throws off the measured grid metrics.
    let active = true;
    const initWhenFontReady = async () => {
      try {
        await Promise.all([
          document.fonts.load('400 12px "JetBrains Mono"'),
          document.fonts.load('700 12px "JetBrains Mono"'),
        ]);
        await document.fonts.ready;
      } catch {
        /* If the Font Loading API is unavailable, fall through and render anyway. */
      }
      if (active) calculateGridDimensions();
    };
    initWhenFontReady();

    const handleResize = () => {
      calculateGridDimensions();
      setAnimationStarted(false); // Restart animation on resize
    };

    window.addEventListener('resize', handleResize);
    return () => {
      active = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Use the binary decryption effect
  const { binaryGrid, decryptionState, isComplete } = useBinaryDecryptionEffect({
    text: TITLE_LINES,
    gridWidth: gridDimensions.width,
    gridHeight: gridDimensions.height,
    measureRef,
    fontSize,
    fontFamily: 'JetBrains Mono, Roboto Mono, monospace'
  });

  // Mark animation as started when grid is ready
  useEffect(() => {
    if (binaryGrid.length > 0 && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [binaryGrid.length, animationStarted]);

  // Sequential phases - Clean visual hierarchy
  const renderBinaryChar = (char: any, rowIndex: number, colIndex: number) => {
    const { char: character, phase, glitchIntensity, shouldRemain, revealProgress = 0 } = char;

    let className = 'binary-char';
    let displayChar = character || '0';

    if (phase === 'transitioning') {
      if (shouldRemain) {
        // PHASE 1: Text emergence - CSS handles smooth transition
        if (revealProgress > 0.7) {
          className += ' text-emerged';
        } else {
          className += ' text-emerging';
        }
      } else {
        // PHASE 2: Background processing - simple scramble then fade
        if (character) {
          // Apply background phase classes based on revealProgress indicators
          if (revealProgress >= 1.0) {
            className += ' background-faded'; // Direct disappear
          } else {
            className += ' background-scrambling'; // Scrambling phase
          }
        }
      }
    } else if (phase === 'revealed') {
      // Final bright text state
      className += ' revealed';
    }

    // Apply glitch effects only during background phase
    if (!shouldRemain && glitchIntensity > 0.3) {
      className += ' glitch-flicker';
    }

    // Handle empty characters for faded background
    if (!character && phase === 'transitioning' && !shouldRemain) {
      displayChar = ' ';
    }

    return (
      <span
        key={`${rowIndex}-${colIndex}`}
        className={className}
      >
        {displayChar}
      </span>
    );
  };

  // Render a binary line
  const renderBinaryLine = (row: any[], rowIndex: number) => {
    const elements = [];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const char = row[colIndex];
      elements.push(renderBinaryChar(char, rowIndex, colIndex));

      // Add space between characters (except last one)
      if (colIndex < row.length - 1) {
        elements.push(' ');
      }
    }

    return elements;
  };

  return (
    <div className="binary-page">
      <span ref={measureRef} style={{
        position: 'absolute',
        visibility: 'hidden',
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, Roboto Mono, monospace',
        whiteSpace: 'pre'
      }} />

      <div className="binary-matrix" style={{ fontSize: `${fontSize}px` }}>
        {binaryGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="binary-line">
            {renderBinaryLine(row, rowIndex)}
          </div>
        ))}
      </div>

      {/* Clickable overlay appears when animation is complete */}
      {isComplete && (
        <div
          className="title-overlay"
          style={{
            opacity: 1,
            cursor: 'pointer',
            pointerEvents: 'all'
          }}
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
        <div className="binary-arrows">
          <div className="arrow-pattern">
            <div className="arrow-row">
              {Array.from('            1').map((char, i) => (
                <span key={i} className="binary-digit" style={{animationDelay: `${i * 0.1}s`}}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('            1 1').map((char, i) => (
                <span key={i} className="binary-digit" style={{animationDelay: `${i * 0.1}s`}}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('1 0 1 1 0 1 0 0 1').map((char, i) => (
                <span key={i} className="binary-digit" style={{animationDelay: `${i * 0.1}s`}}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('            0 1').map((char, i) => (
                <span key={i} className="binary-digit" style={{animationDelay: `${i * 0.1}s`}}>
                  {char}
                </span>
              ))}
            </div>
            <div className="arrow-row">
              {Array.from('            0').map((char, i) => (
                <span key={i} className="binary-digit" style={{animationDelay: `${i * 0.1}s`}}>
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
