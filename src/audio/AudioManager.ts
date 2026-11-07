/**
 * Procedural Web Audio Sound Engine for TEDDYVERSE
 * 100% self-contained synthesized audio — zero external network audio files required.
 * Generates ambient music-box melodies, portal warps, and tactile sound effects.
 */

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private isMelodyPlaying: boolean = false;
  private melodyTimeout: any = null;
  private masterGain: GainNode | null = null;
  private melodyStep: number = 0;

  constructor() {
    // Lazy initialize on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('AudioContext not supported', e);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    if (muted) {
      this.stopMelody();
    } else {
      this.startMelody();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // Tactical Glass Click
  public playClick() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.045);
  }

  // Star Collection Shimmer
  public playStarCollect() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const freqs = [880, 1108.73, 1318.51, 1760];
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }, idx * 45);
    });
  }

  // Heart Burst / Hugging Chime
  public playHeartBurst() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    // Sub warmth
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(65, this.ctx.currentTime + 0.35);
    subGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start();
    subOsc.stop(this.ctx.currentTime + 0.42);

    // Sweet harp arpeggio
    const harpNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    harpNotes.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      }, i * 65);
    });
  }

  // Teddy Cute Sound
  public playTeddySound() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.26, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.24);
  }

  // Portal Warp Sound
  public playPortalWarp() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.6);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 1.2);

    // Lowpass filter sweep
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3200, this.ctx.currentTime + 0.6);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.3);
  }

  // Ambient Celestial Music Box Melody
  public startMelody() {
    if (this.isMelodyPlaying || this.isMuted) return;
    this.isMelodyPlaying = true;
    this.melodyStep = 0;
    this.playNextMelodyNote();
  }

  public stopMelody() {
    this.isMelodyPlaying = false;
    if (this.melodyTimeout) {
      clearTimeout(this.melodyTimeout);
      this.melodyTimeout = null;
    }
  }

  private playNextMelodyNote() {
    if (!this.isMelodyPlaying || this.isMuted) return;
    this.resume();

    // Pentatonic dreamy scale in C: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const notes = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00
    ];

    // Lofi chord progression: Cmaj7 - Am7 - Fmaj7 - Gsus4
    const pattern = [
      0, 2, 4, 6,  // Cmaj7
      1, 3, 5, 7,  // Dm / Am feel
      0, 4, 5, 8,  // Fmaj7
      1, 3, 6, 9   // Gsus feel
    ];

    const noteIdx = pattern[this.melodyStep % pattern.length];
    const freq = notes[noteIdx];

    if (this.ctx && this.masterGain && !this.isMuted) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Music box bell envelope
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.15);
    }

    this.melodyStep++;
    // Relaxing interval
    this.melodyTimeout = setTimeout(() => {
      this.playNextMelodyNote();
    }, 620);
  }
}

export const AudioManager = new AudioManagerClass();

