/**
 * Procedural Web Audio Sound Generator
 * Generates organic chimes, tactile clicks, and romantic music box melodies.
 * 100% synthesized in real time via Web Audio API - zero external assets.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // start muted by default to respect browser autoplay policies
    this.initialized = false;
    this.isPlayingMelody = false;
    this.melodyTimer = null;
    this.melodyStep = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.startRomanticMelody();
      this.playChime(523.25, 'sine', 0.2, 1.5);
    } else {
      this.stopRomanticMelody();
    }
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playBalloonPop() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const t = this.ctx.currentTime;

    // 1. Tactile Pressurized Air "POP!" Sound
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.02);
      filter.frequency.exponentialRampToValueAtTime(90, t + 0.08);
      filter.Q.setValueAtTime(3.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(t);

      // Low end rubber pop punch
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(280, t);
      popOsc.frequency.exponentialRampToValueAtTime(40, t + 0.07);
      popGain.gain.setValueAtTime(0.7, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      popOsc.connect(popGain);
      popGain.connect(this.ctx.destination);
      popOsc.start(t);
      popOsc.stop(t + 0.07);
    } catch (e) {}

    // 2. Cascading Magical Sparkle Chime Cascade
    const popNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    popNotes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          this.playChime(freq, 'sine', 0.16, 1.3);
        } catch (err) {}
      }, 35 + idx * 30);
    });
  }

  playHeartBurst() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Harmonic romantic chime chord (C major 9 / F major 7 warm love chord)
    const chord = [261.63, 329.63, 392.00, 493.88, 523.25]; // C4, E4, G4, B4, C5
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'sine', 0.15, 1.6);
      }, idx * 45);
    });
  }

  playHeartbeatSymphony() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    // Double lub-dub acoustic heartbeat resonance
    this.playHeartThud(t, 70, 0.55);
    this.playHeartThud(t + 0.22, 58, 0.42);

    this.playHeartThud(t + 0.75, 75, 0.60);
    this.playHeartThud(t + 0.98, 62, 0.45);

    this.playHeartThud(t + 1.50, 78, 0.65);
    this.playHeartThud(t + 1.73, 64, 0.48);

    // Sweet cascading celestial harp chords trailing the heartbeat
    const harpNotes = [392.00, 493.88, 587.33, 659.25, 783.99, 987.77, 1046.50];
    harpNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'sine', 0.18, 2.2);
      }, 300 + idx * 75);
    });
  }

  playHeartThud(startTime, freq = 65, peakGain = 0.45) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, startTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(32, startTime + 0.18);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.20);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.20);
    } catch (e) {}
  }

  playBloomChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [329.63, 392.00, 493.88, 587.33, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'sine', 0.2, 1.2);
      }, idx * 60);
    });
  }

  playCelestialTone(step = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    // Harmonic celestial frequencies (pentatonic ascending scale)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
    const freq = scale[step % scale.length];
    this.playChime(freq, 'sine', 0.18, 1.1);
    setTimeout(() => {
      this.playChime(freq * 1.5, 'triangle', 0.05, 0.7);
    }, 45);
  }

  playTransformSound() {
    this.playHeartBurst();
  }

  playChime(freq, type = 'sine', volume = 0.15, duration = 1.2) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Delicate Music Box Romantic Melody (Canon / Lullaby pattern)
   */
  startRomanticMelody() {
    if (this.isPlayingMelody || !this.ctx) return;
    this.isPlayingMelody = true;

    // Soft romantic arpeggio notes (Frequencies in Hz)
    const melody = [
      523.25, 659.25, 783.99, 659.25, // C5, E5, G5, E5
      493.88, 587.33, 783.99, 587.33, // B4, D5, G5, D5
      440.00, 523.25, 659.25, 523.25, // A4, C5, E5, C5
      392.00, 493.88, 587.33, 493.88, // G4, B4, D5, B4
      349.23, 440.00, 523.25, 440.00, // F4, A4, C5, A4
      329.63, 392.00, 523.25, 392.00  // E4, G4, C5, G4
    ];

    const playNext = () => {
      if (!this.isPlayingMelody || this.isMuted) return;
      const freq = melody[this.melodyStep % melody.length];
      this.melodyStep++;

      // Warm music box bell tone
      this.playChime(freq, 'sine', 0.1, 1.4);

      // Octave bass note on downbeat
      if (this.melodyStep % 4 === 1) {
        this.playChime(freq / 2, 'triangle', 0.08, 2.0);
      }

      this.melodyTimer = setTimeout(playNext, 450);
    };

    playNext();
  }

  stopRomanticMelody() {
    this.isPlayingMelody = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }
}
