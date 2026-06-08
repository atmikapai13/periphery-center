import { useEffect, useRef, useCallback } from 'react';

interface AmbientAudioOptions {
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export function useAmbientAudio(options: AmbientAudioOptions = {}) {
  const {
    volume = 0.15, // Very low default volume for calm computing
    fadeInDuration = 800,
    fadeOutDuration = 600
  } = options;

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSourcesRef = useRef<Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>>(new Map());

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
      // Clean up all active sources
      activeSourcesRef.current.forEach(({ source }) => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      activeSourcesRef.current.clear();

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Preload audio file
  const preloadAudio = useCallback(async (id: string, url: string) => {
    if (!audioContextRef.current) return;

    try {
      console.log(`[Audio] Loading: ${id} from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBuffersRef.current.set(id, audioBuffer);
      console.log(`[Audio] Loaded successfully: ${id}`);
    } catch (error) {
      console.error(`[Audio] Failed to load: ${url}`, error);
    }
  }, []);

  // Play audio with fade in
  const play = useCallback((id: string) => {
    if (!audioContextRef.current) return;

    console.log(`[Audio] Attempting to play: ${id}`);
    console.log(`[Audio] Context state: ${audioContextRef.current.state}`);

    // Resume audio context if suspended (browser autoplay restriction)
    if (audioContextRef.current.state === 'suspended') {
      console.log('[Audio] Resuming suspended audio context...');
      audioContextRef.current.resume().catch(err => {
        console.warn('[Audio] Failed to resume audio context:', err);
      });
    }

    const audioBuffer = audioBuffersRef.current.get(id);
    if (!audioBuffer) {
      console.warn(`[Audio] Buffer not found for id: ${id}`);
      console.log('[Audio] Available buffers:', Array.from(audioBuffersRef.current.keys()));
      return;
    }

    console.log(`[Audio] Playing: ${id}`);

    // Stop existing audio for this id if playing
    stop(id);

    const context = audioContextRef.current;
    const source = context.createBufferSource();
    const gainNode = context.createGain();

    source.buffer = audioBuffer;
    source.loop = true; // Loop the ambient sound

    // Connect: source -> gain -> destination
    source.connect(gainNode);
    gainNode.connect(context.destination);

    // Fade in
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + fadeInDuration / 1000);

    source.start(0);

    activeSourcesRef.current.set(id, { source, gainNode });
  }, [volume, fadeInDuration]);

  // Stop audio with fade out
  const stop = useCallback((id: string) => {
    if (!audioContextRef.current) return;

    const active = activeSourcesRef.current.get(id);
    if (!active) return;

    const { source, gainNode } = active;
    const context = audioContextRef.current;

    // Fade out
    gainNode.gain.setValueAtTime(gainNode.gain.value, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + fadeOutDuration / 1000);

    // Stop after fade out completes
    setTimeout(() => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
      activeSourcesRef.current.delete(id);
    }, fadeOutDuration);
  }, [fadeOutDuration]);

  // Stop all audio
  const stopAll = useCallback(() => {
    activeSourcesRef.current.forEach((_, id) => stop(id));
  }, [stop]);

  return {
    preloadAudio,
    play,
    stop,
    stopAll
  };
}
