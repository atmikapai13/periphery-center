// Simple utility for playing one-shot sound effects
class SoundEffectPlayer {
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async preload(id: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(id, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound effect: ${url}`, error);
    }
  }

  play(id: string, volume: number = 0.1): void {
    // Resume audio context if suspended (browser autoplay restriction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(err => {
        console.warn('Failed to resume audio context:', err);
      });
    }

    const buffer = this.audioBuffers.get(id);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  close(): void {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export const soundEffectPlayer = new SoundEffectPlayer();
