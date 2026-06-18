import { useEffect, useRef, useState } from 'react';
import '../styles/VideoPlaylist.css';

// Clips from assets/video. They play one at a time, muted + autoplaying, and
// auto-advance through the list (wrapping), so the player runs continuously.
import v2 from '../assets/video/PXL_20240808_162248102.mp4';
import v3 from '../assets/video/PXL_20241103_052321118.mp4';
import v4 from '../assets/video/PXL_20260131_190139239~2.mp4';
import v5 from '../assets/video/PXL_20260228_035446843.mp4';
import v6 from '../assets/video/PXL_20260228_195309633.mp4';
import v7 from '../assets/video/PXL_20260228_195637719.mp4';
import v8 from '../assets/video/PXL_20260228_204021205.mp4';
import v9 from '../assets/video/PXL_20260228_210324961.mp4';

const VIDEOS = [v2, v3, v4, v5, v6, v7, v8, v9];
const COUNT = VIDEOS.length;

// Two video buffers ping-pong: while one plays, the other preloads the *next*
// clip, so advancing is an instant opacity swap with no black load gap.
function VideoPlaylist() {
  // slots[0]/slots[1] = the clip index currently assigned to buffer A / B.
  const [slots, setSlots] = useState<[number, number]>([0, COUNT > 1 ? 1 : 0]);
  // Which buffer is the one on screen / playing.
  const [active, setActive] = useState<0 | 1>(0);
  // When stopped, both buffers hide so only the black background shows.
  const [stopped, setStopped] = useState(false);

  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);
  const refs = [refA, refB] as const;

  // Whenever the active buffer changes, queue the *following* clip into the
  // now-inactive buffer and start fetching it so it's ready before it's needed.
  useEffect(() => {
    if (COUNT < 2) return;
    const inactive = active === 0 ? 1 : 0;
    setSlots((prev) => {
      const nextIdx = (prev[active] + 1) % COUNT;
      if (prev[inactive] === nextIdx) return prev;
      const copy: [number, number] = [prev[0], prev[1]];
      copy[inactive] = nextIdx;
      return copy;
    });
  }, [active]);

  // Kick off buffering on the inactive element whenever its queued clip changes.
  useEffect(() => {
    if (COUNT < 2) return;
    const inactive = active === 0 ? 1 : 0;
    refs[inactive].current?.load();
  }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play the active buffer from the start whenever it changes.
  useEffect(() => {
    if (stopped) return;
    const el = refs[active].current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  }, [active, stopped]); // eslint-disable-line react-hooks/exhaustive-deps

  // Active clip finished → flip to the other (already-preloaded) buffer.
  const handleEnded = () => {
    if (COUNT < 2) {
      const el = refs[active].current;
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
      return;
    }
    setActive((a) => (a === 0 ? 1 : 0));
  };

  // Manual jump: load the target into the inactive buffer, then make it active.
  // (A manual jump may show a brief load since the target wasn't preloaded.)
  const jumpTo = (target: number) => {
    if (COUNT < 2) return;
    setStopped(false);
    const inactive = active === 0 ? 1 : 0;
    setSlots((prev) => {
      const copy: [number, number] = [prev[0], prev[1]];
      copy[inactive] = (target + COUNT) % COUNT;
      return copy;
    });
    setActive(inactive);
  };

  const goPrev = () => jumpTo(slots[active] - 1);
  const goNext = () => jumpTo(slots[active] + 1);
  const play = () => {
    setStopped(false);
    refs[active].current?.play().catch(() => {});
  };
  const pause = () => refs[active].current?.pause();
  const stop = () => {
    setStopped(true);
    refs.forEach((r) => {
      const el = r.current;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });
  };

  return (
    <div className="video-playlist">
      <div className="video-stage">
        {[0, 1].map((i) => (
          <video
            key={i}
            ref={refs[i]}
            className={`video-playlist-player${active === i && !stopped ? ' is-active' : ''}`}
            src={VIDEOS[slots[i]]}
            muted
            playsInline
            preload="auto"
            onEnded={active === i ? handleEnded : undefined}
          />
        ))}
      </div>
      <div className="video-playlist-controls">
        <button type="button" onClick={goPrev} aria-label="Previous clip">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 5 L18 19 L9 12 Z" />
            <path d="M11 5 L11 19 L2 12 Z" />
          </svg>
        </button>
        <button type="button" onClick={play} aria-label="Play">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5 L7 19 L19 12 Z" />
          </svg>
        </button>
        <button type="button" onClick={pause} aria-label="Pause">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="7" y="5" width="3.5" height="14" />
            <rect x="13.5" y="5" width="3.5" height="14" />
          </svg>
        </button>
        <button type="button" onClick={stop} aria-label="Stop">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="5" width="14" height="14" />
          </svg>
        </button>
        <button type="button" onClick={goNext} aria-label="Next clip">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 5 L6 19 L15 12 Z" />
            <path d="M13 5 L13 19 L22 12 Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default VideoPlaylist;
