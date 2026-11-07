/**
 * A Seamless Romantic Experience — Teddy Bear Universe
 * Scene 1: The ASCII Knight (on the right) + Sealed Envelope ("FOR YOU", in bottom-left)
 * Interaction: Touch the letter -> Cellular fire ignition, burning embers, burns open
 * Scene 2: Multilingual Stardust Heart (Tamil + global languages) builds in center
 * Scene 3: Heart glides to top-left corner -> Living 24-Bit Glowing ASCII Teddy Bear emerges
 * Scene 4: Interactive Teddy Selector (all 4 teddy bears) + Love Note & Personalized ASCII Signature for Lokesh Kumar
 */

import { AmbientParticles } from './ambient-particles.js';
import { AsciiKnight } from './ascii-knight.js';
import { AsciiEnvelope } from './ascii-envelope.js';
import { AsciiHeart } from './ascii-heart.js';
import { AsciiTeddy } from './ascii-teddy.js';
import { AudioManager } from './audio-fx.js';

class LiveAsciiLoveApp {
  constructor() {
    this.currentScreen = 'knight'; // 'knight' or 'teddy'
    this.isTransitioning = false;

    this.initElements();
    this.initAmbientParticles();
    this.initAudio();
    this.initRenderers();
    this.initInteractions();
    this.start();
  }

  initElements() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.knightScreen = document.getElementById('knight-screen');
    this.teddyScreen = document.getElementById('teddy-screen') || document.getElementById('flower-screen');

    this.knightCanvas = document.getElementById('knight-canvas');
    this.envelopeCanvas = document.getElementById('envelope-canvas');
    this.knightHint = document.getElementById('knight-hint');

    this.heartCanvas = document.getElementById('heart-canvas');
    this.teddyCanvas = document.getElementById('teddy-canvas') || document.getElementById('rose-canvas');
    this.cloudNote = document.getElementById('cloud-note');
    this.cornerSignature = document.getElementById('corner-signature');
    this.replayBtn = document.getElementById('btn-replay');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.teddySelectorBar = document.getElementById('teddy-selector-bar');
  }

  initAmbientParticles() {
    if (!this.ambientCanvas) return;
    this.ambientParticles = new AmbientParticles(this.ambientCanvas);
  }

  initAudio() {
    this.audioManager = new AudioManager();
  }

  initRenderers() {
    // 1. Knight on the right side
    if (this.knightCanvas) {
      this.knightRenderer = new AsciiKnight(this.knightCanvas);
    }

    // 2. Sealed Envelope in bottom-left
    if (this.envelopeCanvas) {
      this.envelopeRenderer = new AsciiEnvelope(this.envelopeCanvas, () => {
        // When envelope completes burning open, transition to the Multilingual Heart!
        this.transitionToHeart();
      });
    }

    // 3. Multilingual Love Heart (Tamil + global languages)
    if (this.heartCanvas) {
      this.heartRenderer = new AsciiHeart(this.heartCanvas, () => {
        // When heart finishes building and glides to corner, reveal the living ASCII Teddy!
        this.revealTeddy();
      });
    }

    // 4. Living Colored ASCII Teddy Bear (with all 4 watercolor teddy styles)
    if (this.teddyCanvas) {
      this.teddyRenderer = new AsciiTeddy(this.teddyCanvas, () => {
        // When Teddy completes emergence, ensure Note & Signature & Switcher are visible!
        if (this.cloudNote) {
          this.cloudNote.classList.add('visible');
        }
        if (this.cornerSignature) {
          this.cornerSignature.classList.add('visible');
        }
        if (this.teddySelectorBar) {
          this.teddySelectorBar.classList.add('visible');
        }
      });
    }
  }

  initInteractions() {
    const handleLetterOpen = () => {
      if (this.currentScreen !== 'knight' || this.isTransitioning) return;

      // 1. Play warm harmonic love chime
      try {
        this.audioManager.init();
        this.audioManager.playHeartBurst();
      } catch (e) {}

      // 2. Hide hint and quote gently
      if (this.knightHint) {
        this.knightHint.style.opacity = '0';
        this.knightHint.style.pointerEvents = 'none';
      }

      // 3. Trigger envelope ignition in bottom-left
      if (this.envelopeRenderer) {
        this.envelopeRenderer.triggerClick();
      }
    };

    // Attach click / touch handlers for Letter
    if (this.envelopeCanvas) {
      this.envelopeCanvas.addEventListener('click', handleLetterOpen);
      this.envelopeCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleLetterOpen();
      }, { passive: false });
    }

    if (this.knightCanvas) {
      this.knightCanvas.addEventListener('click', handleLetterOpen);
    }

    if (this.knightHint) {
      this.knightHint.addEventListener('click', handleLetterOpen);
    }

    // Tap during heart build to fast-forward to teddy
    if (this.teddyScreen) {
      this.teddyScreen.addEventListener('click', (e) => {
        if (e.target && (e.target.closest('#btn-replay') || e.target.closest('#teddy-selector-bar') || e.target.closest('#sound-toggle-btn'))) return;
        if (this.heartRenderer && !this.heartRenderer.isDocked) {
          this.heartRenderer.fastForward();
        } else if (this.teddyRenderer) {
          // Tap teddy canvas to cycle to next teddy
          const nextIdx = this.teddyRenderer.nextTeddy();
          this.updateTeddySelectorUI(nextIdx);
          try {
            this.audioManager.playBloomChime();
          } catch (err) {}
        }
      });
    }

    // Teddy Selector Button Click Handlers
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

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.currentScreen === 'knight') {
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
      if (this.knightRenderer) this.knightRenderer.resize();
      if (this.envelopeRenderer) this.envelopeRenderer.resize();
      if (this.heartRenderer) this.heartRenderer.resize();
      if (this.teddyRenderer) this.teddyRenderer.resize();
    });

    // Replay interaction
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

  transitionToHeart() {
    if (this.isTransitioning || this.currentScreen === 'teddy') return;
    this.isTransitioning = true;
    this.currentScreen = 'teddy';

    try {
      this.audioManager.playBloomChime();
    } catch (e) {}

    // 1. Fade out knight screen
    if (this.knightScreen) {
      this.knightScreen.classList.remove('active');
    }

    setTimeout(() => {
      if (this.knightRenderer) this.knightRenderer.stop();
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
      if (this.teddySelectorBar) {
        this.teddySelectorBar.classList.remove('visible');
      }

      // 3. Start Multilingual Love Heart in center
      if (this.heartRenderer) {
        this.heartRenderer.reset();
        this.heartRenderer.start();
      }

      this.isTransitioning = false;
    }, 600);
  }

  revealTeddy() {
    try {
      this.audioManager.playBloomChime();
    } catch (e) {}

    const urlParams = new URLSearchParams(window.location.search);
    const isDirect = urlParams.get('scene') === 'teddy' || urlParams.get('scene') === 'flower';

    // 1. Reveal living 24-bit glowing ASCII Teddy Bear in center
    if (this.teddyRenderer) {
      this.teddyRenderer.reset(isDirect);
      this.teddyRenderer.start();
    }

    // 2. Reveal the minimal love note card, teddy switcher, & signature
    setTimeout(() => {
      if (this.cloudNote) {
        this.cloudNote.classList.add('visible');
      }
      if (this.cornerSignature) {
        this.cornerSignature.classList.add('visible');
      }
      if (this.teddySelectorBar) {
        this.teddySelectorBar.classList.add('visible');
      }
    }, 500);
  }

  restartExperience() {
    this.isTransitioning = true;
    this.currentScreen = 'knight';

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
      if (this.heartRenderer) this.heartRenderer.stop();

      if (this.envelopeRenderer) {
        this.envelopeRenderer.reset();
      }
      if (this.knightHint) {
        this.knightHint.style.opacity = '';
        this.knightHint.style.pointerEvents = '';
      }

      if (this.knightScreen) {
        this.knightScreen.classList.add('active');
      }

      if (this.knightRenderer) {
        this.knightRenderer.start();
      }
      if (this.envelopeRenderer) {
        this.envelopeRenderer.start();
      }

      this.isTransitioning = false;
    }, 600);
  }

  start() {
    // Direct URL parameter check for quick scene testing: e.g. ?scene=teddy
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scene') === 'teddy' || urlParams.get('scene') === 'flower') {
      this.currentScreen = 'teddy';
      if (this.knightScreen) {
        this.knightScreen.classList.remove('active');
        this.knightScreen.style.display = 'none';
      }
      if (this.knightHint) {
        this.knightHint.style.display = 'none';
      }
      if (this.teddyScreen) {
        this.teddyScreen.classList.add('active');
        this.teddyScreen.style.transition = 'none';
        this.teddyScreen.style.opacity = '1';
      }
      if (this.cloudNote) {
        this.cloudNote.style.transition = 'none';
        this.cloudNote.classList.add('visible');
      }
      if (this.cornerSignature) {
        this.cornerSignature.style.transition = 'none';
        this.cornerSignature.classList.add('visible');
      }
      if (this.teddySelectorBar) {
        this.teddySelectorBar.style.transition = 'none';
        this.teddySelectorBar.classList.add('visible');
      }

      const teddyParam = parseInt(urlParams.get('teddy'), 10);
      if (!isNaN(teddyParam) && this.teddyRenderer) {
        this.teddyRenderer.currentIndex = Math.max(0, Math.min(3, teddyParam));
        this.updateTeddySelectorUI(this.teddyRenderer.currentIndex);
      }

      this.revealTeddy();
    } else {
      // Start Scene 1: Knight on right + Letter in bottom-left
      if (this.knightRenderer) {
        this.knightRenderer.start();
      }
      if (this.envelopeRenderer) {
        this.envelopeRenderer.start();
      }
    }

    // Start ambient drifting stardust & hearts
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
    window.app = new LiveAsciiLoveApp();
  });
} else {
  window.app = new LiveAsciiLoveApp();
}
