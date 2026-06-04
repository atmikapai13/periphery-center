import { useState, useEffect } from 'react';

interface UseTextScrambleOptions {
  text: string;
  speed?: number;
  scrambleSpeed?: number;
  characters?: string;
  delay?: number;
}

export function useTextScramble({
  text,
  speed = 50,
  scrambleSpeed = 20,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?',
  delay = 0,
}: UseTextScrambleOptions): string {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let currentIndex = 0;
    let scrambleInterval: NodeJS.Timeout;
    let revealInterval: NodeJS.Timeout;

    const scramble = () => {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        if (i < currentIndex) {
          result += text[i];
        } else if (text[i] === ' ') {
          result += ' ';
        } else {
          result += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      setDisplayText(result);
    };

    const reveal = () => {
      if (currentIndex <= text.length) {
        currentIndex++;
        scramble();
      } else {
        clearInterval(scrambleInterval);
        clearInterval(revealInterval);
        setDisplayText(text);
      }
    };

    scrambleInterval = setInterval(scramble, scrambleSpeed);
    revealInterval = setInterval(reveal, speed);

    return () => {
      clearInterval(scrambleInterval);
      clearInterval(revealInterval);
    };
  }, [text, speed, scrambleSpeed, characters, started]);

  return displayText;
}
