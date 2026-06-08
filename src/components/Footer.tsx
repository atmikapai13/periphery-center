import { useEffect, useState } from 'react';
import '../styles/Footer.css';
import { ANCIENT_CHARS, ALL_SCRAMBLE_CHARS, ScriptType } from '../utils/ancientScripts';

function Footer() {
  const titleText = 'THE PERIPHERY CENTER';
  const [displayChars, setDisplayChars] = useState<string[]>(titleText.split(''));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const animate = () => {
      setIsAnimating(true);

      const scriptTypes = Object.keys(ANCIENT_CHARS) as Array<ScriptType>;
      const scriptType = scriptTypes[Math.floor(Math.random() * scriptTypes.length)];
      const chars = ANCIENT_CHARS[scriptType];

      const targetChars = titleText.split('').map(char => {
        if (char === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      });

      const holdNormalDuration = 10000; // 10s hold
      const scrambleDuration = 5000; // 5s scramble
      const descrambleDuration = 5000; // 5s descramble
      const frameRate = 20;
      const frameTime = 1000 / frameRate;

      let frameCount = 0;
      const holdNormalFrames = holdNormalDuration / frameTime;
      const scrambleFrames = scrambleDuration / frameTime;
      const descrambleFrames = descrambleDuration / frameTime;

      const animationInterval = setInterval(() => {
        frameCount++;

        if (frameCount <= holdNormalFrames) {
          setDisplayChars(titleText.split(''));
        } else if (frameCount <= holdNormalFrames + scrambleFrames) {
          const progress = (frameCount - holdNormalFrames) / scrambleFrames;
          const revealedCount = Math.floor(progress * titleText.length);

          setDisplayChars(titleText.split('').map((originalChar, index) => {
            if (originalChar === ' ') return ' ';
            if (index < revealedCount) {
              return Math.random() < 0.95 ? targetChars[index] : ALL_SCRAMBLE_CHARS[Math.floor(Math.random() * ALL_SCRAMBLE_CHARS.length)];
            } else {
              return Math.random() < 0.9 ? originalChar : ALL_SCRAMBLE_CHARS[Math.floor(Math.random() * ALL_SCRAMBLE_CHARS.length)];
            }
          }));
        } else if (frameCount <= holdNormalFrames + scrambleFrames + descrambleFrames) {
          const descrambleProgress = (frameCount - holdNormalFrames - scrambleFrames) / descrambleFrames;
          const restoredCount = Math.floor(descrambleProgress * titleText.length);

          setDisplayChars(titleText.split('').map((originalChar, index) => {
            if (originalChar === ' ') return ' ';
            if (index < restoredCount) {
              return Math.random() < 0.95 ? originalChar : ALL_SCRAMBLE_CHARS[Math.floor(Math.random() * ALL_SCRAMBLE_CHARS.length)];
            } else {
              return Math.random() < 0.9 ? targetChars[index] : ALL_SCRAMBLE_CHARS[Math.floor(Math.random() * ALL_SCRAMBLE_CHARS.length)];
            }
          }));
        } else {
          clearInterval(animationInterval);
          setDisplayChars(titleText.split(''));
          setIsAnimating(false);
        }
      }, frameTime);

      return animationInterval;
    };

    const startDelay = setTimeout(() => {
      animate();
    }, 1000);

    const recurringAnimation = setInterval(() => {
      if (!isAnimating) {
        animate();
      }
    }, 20000);

    return () => {
      clearTimeout(startDelay);
      clearInterval(recurringAnimation);
    };
  }, [isAnimating]);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <div className="footer-title">
            {displayChars.map((char, index) => (
              <span key={index} className={char === ' ' ? 'space' : 'char'}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <a
          href="mailto:hello@peripherycenter.com"
          className="footer-button"
        >
          CHAT WITH US
        </a>
      </div>
    </footer>
  );
}

export default Footer;
