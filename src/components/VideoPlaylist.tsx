import { useEffect, useRef, useState } from 'react';
import '../styles/VideoPlaylist.css';

// Clips from assets/video. They play one at a time, muted + autoplaying, and
// auto-advance through the list (wrapping), so the player runs continuously.
import v1 from '../assets/video/PXL_20240804_021805851.mp4';
import v2 from '../assets/video/PXL_20240808_162248102.mp4';
import v3 from '../assets/video/PXL_20241103_052321118.mp4';
import v4 from '../assets/video/PXL_20260131_190139239~2.mp4';
import v5 from '../assets/video/PXL_20260228_035446843.mp4';
import v6 from '../assets/video/PXL_20260228_195309633.mp4';
import v7 from '../assets/video/PXL_20260228_195637719.mp4';
import v8 from '../assets/video/PXL_20260228_204021205.mp4';
import v9 from '../assets/video/PXL_20260228_210324961.mp4';

const VIDEOS = [v1, v2, v3, v4, v5, v6, v7, v8, v9];

function VideoPlaylist() {
  const [index, setIndex] = useState(0);
  // When stopped, the video is hidden so only the black background shows.
  const [stopped, setStopped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reload + play whenever the source changes (changing `src` alone doesn't
  // restart playback reliably).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [index]);

  const goPrev = () => setIndex((i) => (i - 1 + VIDEOS.length) % VIDEOS.length);
  const goNext = () => setIndex((i) => (i + 1) % VIDEOS.length);
  const play = () => {
    setStopped(false); // bring the video background back
    videoRef.current?.play().catch(() => {});
  };
  const pause = () => videoRef.current?.pause();
  const stop = () => {
    setStopped(true); // hide the video → black background
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  return (
    <div className="video-playlist">
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
      <video
        ref={videoRef}
        className="video-playlist-player"
        src={VIDEOS[index]}
        autoPlay
        muted
        playsInline
        onEnded={goNext}
        style={{ visibility: stopped ? 'hidden' : 'visible' }}
      />
    </div>
  );
}

export default VideoPlaylist;
