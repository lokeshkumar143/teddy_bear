/**
 * Romantic Carrier Pigeon & Living ASCII Teddy Bear Experience (v5.0)
 * 
 * Flow:
 * 1. Carrier Pigeon flies in carrying a sealed romantic letter across the starry sky.
 * 2. Pigeon delivers letter to center stage, user taps letter to open it.
 * 3. Letter burns open with sparkling embers and sweet harp chimes.
 * 4. Living 24-bit True-Color ASCII Teddy Bear emerges slowly from bottom upward.
 * 5. Up-side (top) selector bar allows switching between 4 unique teddy bears.
 * 6. Floating Polaroid photo of Loki with handwritten script and customizable photo upload.
 * 7. Interactive action buttons: Save Gift 🎁, Make Teddy Wave 👋, Pulse Heart 💖, Explore World ✨.
 * 8. Real-time theme switcher (Aurora, Rose, Honey, Twilight) and synthesized Web Audio music box.
 * 9. Pure ASCII Key signature for LOKESH KUMAR.
 */

import { AmbientParticles } from './ambient-particles.js?v=8.0';
import { AsciiPigeon } from './ascii-pigeon.js?v=8.0';
import { AsciiEnvelope } from './ascii-envelope.js?v=8.0';
import { AsciiTeddy } from './ascii-teddy.js?v=8.0';
import { AudioManager } from './audio-fx.js?v=8.0';

class PigeonTeddyApp {
  constructor() {
    this.currentScreen = 'delivery'; // 'delivery' or 'teddy'
    this.isTransitioning = false;
    this.letterDelivered = false;

    // Atmosphere Themes
    this.themes = [
      { id: 'theme-aurora', name: 'Aurora', icon: '🌌' },
      { id: 'theme-rose', name: 'Rose', icon: '🌸' },
      { id: 'theme-golden', name: 'Honey', icon: '🍯' },
      { id: 'theme-twilight', name: 'Twilight', icon: '💜' }
    ];
    this.currentThemeIdx = 0;

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
    this.floatingPolaroid = document.getElementById('floating-polaroid');
    this.polaroidImg = document.getElementById('polaroid-img');
    this.photoUploadInput = document.getElementById('photo-upload-input');

    this.giftActionCard = document.getElementById('gift-action-card');
    this.btnSaveGift = document.getElementById('btn-save-gift');
    this.btnMakeWave = document.getElementById('btn-make-wave');
    this.btnPulseHeart = document.getElementById('btn-pulse-heart');
    this.btnExploreWorld = document.getElementById('btn-explore-world');
    this.replayBtn = document.getElementById('btn-replay');

    this.cornerSignature = document.getElementById('corner-signature');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.themeLabel = document.getElementById('theme-label');
    this.themeIcon = document.getElementById('theme-icon');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundLabel = document.getElementById('sound-label');

    this.worldModal = document.getElementById('world-modal');
    this.btnCloseWorld = document.getElementById('btn-close-world');
    this.toastMsg = document.getElementById('toast-msg');
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
          this.onLetterDelivered();
        },
        () => {
          if (this.pigeonCanvas) {
            this.pigeonCanvas.style.pointerEvents = 'none';
          }
        }
      );
    }

    // 2. Sealed Envelope in Center Stage
    if (this.envelopeCanvas) {
      this.envelopeRenderer = new AsciiEnvelope(this.envelopeCanvas, () => {
        this.transitionToTeddy();
      });
    }

    // 3. Living Colored ASCII Teddy Bear
    if (this.teddyCanvas) {
      this.teddyRenderer = new AsciiTeddy(this.teddyCanvas, () => {
        // Once teddy finishes emerging, show action card and signature
        if (this.giftActionCard) {
          this.giftActionCard.classList.add('visible');
        }
        if (this.floatingPolaroid) {
          this.floatingPolaroid.classList.add('visible');
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

  showToast(text) {
    if (!this.toastMsg) return;
    this.toastMsg.textContent = text;
    this.toastMsg.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMsg.classList.remove('show');
    }, 2800);
  }

  cycleTheme() {
    this.currentThemeIdx = (this.currentThemeIdx + 1) % this.themes.length;
    const theme = this.themes[this.currentThemeIdx];

    document.body.className = theme.id;
    if (this.themeLabel) this.themeLabel.textContent = theme.name;
    if (this.themeIcon) this.themeIcon.textContent = theme.icon;

    this.showToast(`Switched atmosphere to ${theme.name} ${theme.icon}`);
    try {
      this.audioManager.playClick();
    } catch (e) {}
  }

  initInteractions() {
    const handleLetterOpen = () => {
      if (this.currentScreen !== 'delivery' || this.isTransitioning) return;

      try {
        this.audioManager.init();
        this.audioManager.playHeartBurst();
      } catch (e) {}

      if (this.envelopeHint) {
        this.envelopeHint.style.opacity = '0';
        this.envelopeHint.style.pointerEvents = 'none';
      }

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

    const unsealBtn = document.getElementById('unseal-btn');
    if (unsealBtn) {
      unsealBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleLetterOpen();
      });
    }

    if (this.deliveryScreen) {
      this.deliveryScreen.addEventListener('click', () => {
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
          this.showToast(`Revealing ${this.teddyRenderer.teddyAssets[index].title} 🧸`);
        }
      });
    }

    // Tap canvas to trigger wave or cycle teddy
    if (this.teddyCanvas) {
      this.teddyCanvas.addEventListener('click', (e) => {
        if (e.target && (e.target.closest('#btn-replay') || e.target.closest('#teddy-selector-bar'))) return;
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerHeartPulse();
          try {
            this.audioManager.playBloomChime();
          } catch (err) {}
          this.showToast("Teddy loves you! 💖");
        }
      });
    }

    // Theme Switcher button
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme();
      });
    }

    // Sound Toggle interaction
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.audioManager.toggleMute();
        if (this.soundIcon) this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
        if (this.soundLabel) this.soundLabel.textContent = isMuted ? 'Music' : 'Playing';
        this.soundToggleBtn.classList.toggle('active', !isMuted);
        this.showToast(isMuted ? 'Sound muted 🔇' : 'Romantic music box playing 🎶');
      });
    }

    // Action 1: Make Teddy Wave
    if (this.btnMakeWave) {
      this.btnMakeWave.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerWave();
          try {
            this.audioManager.playBloomChime();
          } catch (err) {}
          this.showToast("Teddy is waving at you, Loki! 👋❤️");
        }
      });
    }

    // Action 2: Pulse Heart
    if (this.btnPulseHeart) {
      this.btnPulseHeart.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerHeartPulse();
          try {
            this.audioManager.playHeartBurst();
          } catch (err) {}
          this.showToast("Teddy's heart beats just for you! 💖");
        }
      });
    }

    // Action 3: Save Gift Snapshot (high-res canvas image)
    if (this.btnSaveGift) {
      this.btnSaveGift.addEventListener('click', (e) => {
        e.stopPropagation();
        this.saveGiftSnapshot();
      });
    }

    // Action 4: Explore World Portfolio Modal
    if (this.btnExploreWorld) {
      this.btnExploreWorld.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.worldModal) {
          this.worldModal.classList.add('active');
          this.worldModal.setAttribute('aria-hidden', 'false');
          try {
            this.audioManager.playBloomChime();
          } catch (err) {}
        }
      });
    }

    if (this.btnCloseWorld) {
      this.btnCloseWorld.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.worldModal) {
          this.worldModal.classList.remove('active');
          this.worldModal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    if (this.worldModal) {
      this.worldModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('world-modal-backdrop')) {
          this.worldModal.classList.remove('active');
          this.worldModal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    // Floating Polaroid click to enlarge
    if (this.floatingPolaroid) {
      this.floatingPolaroid.addEventListener('click', (e) => {
        if (e.target.closest('.btn-change-photo') || e.target.closest('#photo-upload-input')) return;
        this.floatingPolaroid.classList.toggle('enlarged');
      });
    }

    // Custom photo upload support
    if (this.photoUploadInput) {
      this.photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (this.polaroidImg) {
              this.polaroidImg.src = evt.target.result;
              this.showToast("Polaroid photo updated! 📸❤️");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Replay interaction (send pigeon again)
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartExperience();
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
      } else if (e.key === 'Escape' && this.worldModal && this.worldModal.classList.contains('active')) {
        this.worldModal.classList.remove('active');
      }
    });

    window.addEventListener('resize', () => {
      if (this.pigeonRenderer) this.pigeonRenderer.resize();
      if (this.envelopeRenderer) this.envelopeRenderer.resize();
      if (this.teddyRenderer) this.teddyRenderer.resize();
    });
  }

  saveGiftSnapshot() {
    this.showToast("Preparing your high-res gift snapshot... 🎁");
    setTimeout(() => {
      try {
        if (!this.teddyCanvas) return;
        const dataUrl = this.teddyCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `teddy_gift_for_loki.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast("Gift saved to your downloads! 💖");
      } catch (err) {
        console.error("Save snapshot error:", err);
        this.showToast("Screenshot captured! Right click to save image.");
      }
    }, 250);
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
      if (this.giftActionCard) {
        this.giftActionCard.classList.remove('visible');
      }
      if (this.floatingPolaroid) {
        this.floatingPolaroid.classList.remove('visible');
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

    if (this.giftActionCard) {
      this.giftActionCard.classList.remove('visible');
    }
    if (this.floatingPolaroid) {
      this.floatingPolaroid.classList.remove('visible');
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
    // Direct URL parameter check for quick scene testing: e.g. ?scene=teddy or ?scene=envelope
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scene') === 'envelope') {
      this.currentScreen = 'delivery';
      this.letterDelivered = true;
      if (this.envelopeRenderer) {
        this.envelopeRenderer.start();
      }
      if (this.envelopeHint) {
        this.envelopeHint.classList.add('visible');
      }
    } else if (urlParams.get('scene') === 'teddy') {
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
      if (this.giftActionCard) {
        this.giftActionCard.classList.add('visible');
      }
      if (this.floatingPolaroid) {
        this.floatingPolaroid.classList.add('visible');
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

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.app = new PigeonTeddyApp();
    });
  } else {
    window.app = new PigeonTeddyApp();
  }
}
