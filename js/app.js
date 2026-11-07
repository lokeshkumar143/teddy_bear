/**
 * Romantic Carrier Pigeon & Living ASCII Teddy Bear Experience
 * 
 * Flow:
 * 1. Pigeon flies in from top-left carrying a sealed romantic letter.
 * 2. Pigeon swoops into center, drops the letter into center stage, then flies off.
 * 3. User taps the sealed letter -> Letter opens with sparkling hearts, embers, and chimes.
 * 4. Living 24-bit true-color ASCII Teddy Bear reveals slowly from the bottom upward.
 * 5. Up-side (top) selector displays the remaining teddy buttons to switch between all 4 teddy bears.
 * 6. Minimal love note card & personalized ASCII key signature for Lokesh Kumar.
 */

import { AmbientParticles } from './ambient-particles.js';
import { AsciiPigeon } from './ascii-pigeon.js';
import { AsciiEnvelope } from './ascii-envelope.js';
import { AsciiTeddy } from './ascii-teddy.js';
import { AudioManager } from './audio-fx.js';

class PigeonTeddyApp {
  constructor() {
    this.currentScreen = 'delivery'; // 'delivery' or 'teddy'
    this.isTransitioning = false;
    this.letterDelivered = false;

    this.initElements();
    this.initAmbientParticles();
    this.initAudio();
    this.initRenderers();
    this.initInteractions();
    this.start();
  }

  initElements() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.deliveryScreen = document.getElementById('delivery-screen');
    this.teddyScreen = document.getElementById('teddy-screen');

    this.pigeonCanvas = document.getElementById('pigeon-canvas');
    this.envelopeCanvas = document.getElementById('envelope-canvas');
    this.envelopeHint = document.getElementById('envelope-hint');

    this.teddyCanvas = document.getElementById('teddy-canvas');
    this.teddySelectorBar = document.getElementById('teddy-selector-bar');
    this.cloudNote = document.getElementById('cloud-note');
    this.cornerSignature = document.getElementById('corner-signature');
    this.replayBtn = document.getElementById('btn-replay');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
  }

  initAmbientParticles() {
    if (!this.ambientCanvas) return;
    this.ambientParticles = new AmbientParticles(this.ambientCanvas);
  }

  initAudio() {
    this.audioManager = new AudioManager();
  }

  initRenderers() {
    // 1. ASCII Carrier Pigeon
    if (this.pigeonCanvas) {
      this.pigeonRenderer = new AsciiPigeon(
        this.pigeonCanvas,
        () => {
          // When letter is delivered to center:
          this.onLetterDelivered();
        },
        () => {
          // When pigeon departs into stars:
          if (this.pigeonCanvas) {
            this.pigeonCanvas.style.pointerEvents = 'none';
          }
        }
      );
    }

    // 2. Sealed Envelope in Center Stage
    if (this.envelopeCanvas) {
      this.envelopeRenderer = new AsciiEnvelope(this.envelopeCanvas, () => {
        // When envelope completes opening, transition to the Teddy Reveal!
        this.transitionToTeddy();
      });
    }

    // 3. Living Colored ASCII Teddy Bear (slow upward reveal from bottom)
    if (this.teddyCanvas) {
      this.teddyRenderer = new AsciiTeddy(this.teddyCanvas, () => {
        // Once teddy finishes emerging, show note card and signature
        if (this.cloudNote) {
          this.cloudNote.classList.add('visible');
        }
        if (this.cornerSignature) {
          this.cornerSignature.classList.add('visible');
        }
      });
    }
  }

  onLetterDelivered() {
    this.letterDelivered = true;
    if (this.envelopeRenderer) {
      this.envelopeRenderer.start();
    }
    if (this.envelopeHint) {
      this.envelopeHint.classList.add('visible');
    }
    try {
      this.audioManager.playHeartBurst();
    } catch (e) {}
  }

  initInteractions() {
    const handleLetterOpen = () => {
      if (this.currentScreen !== 'delivery' || this.isTransitioning) return;

      // Play warm love chime
      try {
        this.audioManager.init();
        this.audioManager.playHeartBurst();
      } catch (e) {}

      // Hide hint smoothly
      if (this.envelopeHint) {
        this.envelopeHint.style.opacity = '0';
        this.envelopeHint.style.pointerEvents = 'none';
      }

      // Open the envelope
      if (this.envelopeRenderer) {
        this.envelopeRenderer.triggerClick();
      }
    };

    // Click / touch to open letter
    if (this.envelopeCanvas) {
      this.envelopeCanvas.addEventListener('click', handleLetterOpen);
      this.envelopeCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleLetterOpen();
      }, { passive: false });
    }

    if (this.deliveryScreen) {
      this.deliveryScreen.addEventListener('click', (e) => {
        if (this.letterDelivered) {
          handleLetterOpen();
        }
      });
    }

    // Up-side (top) Teddy Selector buttons
    if (this.teddySelectorBar) {
      this.teddySelectorBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.teddy-tab-btn');
        if (!btn) return;
        const index = parseInt(btn.getAttribute('data-teddy'), 10);
        if (!isNaN(index) && this.teddyRenderer) {
          this.teddyRenderer.setTeddy(index);
          this.updateTeddySelectorUI(index);
          try {
            this.audioManager.playBloomChime();
          } catch (err) {}
        }
      });
    }

    // Tap canvas to cycle to next teddy
    if (this.teddyCanvas) {
      this.teddyCanvas.addEventListener('click', (e) => {
        if (e.target && (e.target.closest('#btn-replay') || e.target.closest('#teddy-selector-bar'))) return;
        if (this.teddyRenderer) {
          const nextIdx = this.teddyRenderer.nextTeddy();
          this.updateTeddySelectorUI(nextIdx);
          try {
            this.audioManager.playBloomChime();
          } catch (err) {}
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.currentScreen === 'delivery') {
        e.preventDefault();
        handleLetterOpen();
      } else if (e.key === 'ArrowRight' && this.currentScreen === 'teddy' && this.teddyRenderer) {
        const nextIdx = this.teddyRenderer.nextTeddy();
        this.updateTeddySelectorUI(nextIdx);
      } else if (e.key === 'ArrowLeft' && this.currentScreen === 'teddy' && this.teddyRenderer) {
        const prevIdx = this.teddyRenderer.prevTeddy();
        this.updateTeddySelectorUI(prevIdx);
      }
    });

    window.addEventListener('resize', () => {
      if (this.pigeonRenderer) this.pigeonRenderer.resize();
      if (this.envelopeRenderer) this.envelopeRenderer.resize();
      if (this.teddyRenderer) this.teddyRenderer.resize();
    });

    // Replay interaction (send pigeon again)
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartExperience();
      });
    }

    // Sound Toggle interaction
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.audioManager.toggleMute();
        this.soundToggleBtn.innerHTML = isMuted 
          ? '<span aria-hidden="true">🔇</span><span>Music</span>' 
          : '<span aria-hidden="true">🔊</span><span>Playing</span>';
      });
    }
  }

  updateTeddySelectorUI(activeIndex) {
    if (!this.teddySelectorBar) return;
    const buttons = this.teddySelectorBar.querySelectorAll('.teddy-tab-btn');
    buttons.forEach((btn) => {
      const idx = parseInt(btn.getAttribute('data-teddy'), 10);
      if (idx === activeIndex) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
  }

  transitionToTeddy() {
    if (this.isTransitioning || this.currentScreen === 'teddy') return;
    this.isTransitioning = true;
    this.currentScreen = 'teddy';

    try {
      this.audioManager.playBloomChime();
    } catch (e) {}

    // 1. Fade out delivery screen
    if (this.deliveryScreen) {
      this.deliveryScreen.classList.remove('active');
    }

    setTimeout(() => {
      if (this.pigeonRenderer) this.pigeonRenderer.stop();
      if (this.envelopeRenderer) this.envelopeRenderer.stop();

      // 2. Fade in teddy screen
      if (this.teddyScreen) {
        this.teddyScreen.classList.add('active');
      }
      if (this.cloudNote) {
        this.cloudNote.classList.remove('visible');
      }
      if (this.cornerSignature) {
        this.cornerSignature.classList.remove('visible');
      }

      // 3. Show up-side (top) teddy selector bar
      if (this.teddySelectorBar) {
        this.teddySelectorBar.classList.add('visible');
      }

      // 4. Start living teddy: reveals slowly from the bottom upward!
      if (this.teddyRenderer) {
        this.teddyRenderer.reset(false);
        this.teddyRenderer.start();
      }

      this.isTransitioning = false;
    }, 550);
  }

  restartExperience() {
    this.isTransitioning = true;
    this.currentScreen = 'delivery';
    this.letterDelivered = false;

    if (this.cloudNote) {
      this.cloudNote.classList.remove('visible');
    }
    if (this.cornerSignature) {
      this.cornerSignature.classList.remove('visible');
    }
    if (this.teddySelectorBar) {
      this.teddySelectorBar.classList.remove('visible');
    }
    if (this.teddyScreen) {
      this.teddyScreen.classList.remove('active');
    }

    setTimeout(() => {
      if (this.teddyRenderer) this.teddyRenderer.stop();

      if (this.envelopeRenderer) {
        this.envelopeRenderer.reset();
      }
      if (this.envelopeHint) {
        this.envelopeHint.style.opacity = '';
        this.envelopeHint.style.pointerEvents = '';
        this.envelopeHint.classList.remove('visible');
      }

      if (this.deliveryScreen) {
        this.deliveryScreen.classList.add('active');
      }

      // Relaunch the carrier pigeon flight from top-left
      if (this.pigeonRenderer) {
        this.pigeonRenderer.reset();
        this.pigeonRenderer.start();
      }

      this.isTransitioning = false;
    }, 500);
  }

  start() {
    // Direct URL parameter check for quick scene testing: e.g. ?scene=teddy
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scene') === 'teddy') {
      this.currentScreen = 'teddy';
      if (this.deliveryScreen) this.deliveryScreen.classList.remove('active');
      if (this.teddyScreen) {
        this.teddyScreen.classList.add('active');
        this.teddyScreen.style.transition = 'none';
        this.teddyScreen.style.opacity = '1';
      }
      if (this.teddySelectorBar) {
        this.teddySelectorBar.classList.add('visible');
      }
      if (this.cloudNote) {
        this.cloudNote.classList.add('visible');
      }
      if (this.cornerSignature) {
        this.cornerSignature.classList.add('visible');
      }

      const teddyParam = parseInt(urlParams.get('teddy'), 10);
      if (!isNaN(teddyParam) && this.teddyRenderer) {
        this.teddyRenderer.currentIndex = Math.max(0, Math.min(3, teddyParam));
        this.updateTeddySelectorUI(this.teddyRenderer.currentIndex);
      }

      if (this.teddyRenderer) {
        this.teddyRenderer.reset(true);
        this.teddyRenderer.start();
      }
    } else {
      // Normal experience: Carrier Pigeon takes flight carrying the letter
      if (this.pigeonRenderer) {
        this.pigeonRenderer.start();
      }
    }

    // Start ambient floating golden stardust
    let lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (this.ambientParticles) {
        this.ambientParticles.update(dt);
        this.ambientParticles.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new PigeonTeddyApp();
  });
} else {
  window.app = new PigeonTeddyApp();
}
