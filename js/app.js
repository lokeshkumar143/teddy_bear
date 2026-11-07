/**
 * Romantic Celestial Universe & Living ASCII Teddy Bear Experience (v10.0)
 * 
 * Flow:
 * 1. Screen 1: An Enchanted 3D Surprise Gift Box hovers in the celestial night sky.
 *    - Velvet crimson box, gilded satin ribbons, golden heart bow, and personalized tag: "For: Loki ❤️".
 *    - Interactive 3D mouse parallax tilt & floating stardust sparkles.
 * 2. Unboxing Ceremony:
 *    - User taps the gift box or "OPEN YOUR SURPRISE" button.
 *    - Golden bow unties, 3D lid pops off, radiant light beams shoot out.
 *    - Exploding shower of floating hearts, confetti, and golden ASCII embers!
 * 3. Living ASCII Teddy Bear:
 *    - Living 24-bit True-Color ASCII Teddy Bear emerges slowly from the bottom upward.
 *    - Up-side (top) selector bar allows switching between 4 unique teddy bears.
 *    - Floating Polaroid photo of Loki with handwritten script and custom upload.
 *    - Interactive action buttons: Save Gift 🎁, Make Teddy Wave 👋, Pulse Heart 💖, Explore World ✨.
 *    - Real-time theme switcher (Aurora, Rose, Honey, Twilight) and Web Audio music box.
 *    - Pure ASCII Key signature for LOKESH KUMAR.
 */

import { AmbientParticles } from './ambient-particles.js?v=10.0';
import { GiftBoxController } from './gift-box.js?v=10.0';
import { AsciiTeddy } from './ascii-teddy.js?v=10.0';
import { AudioManager } from './audio-fx.js?v=10.0';

class PigeonTeddyApp {
  constructor() {
    this.currentScreen = 'gift'; // 'gift' or 'teddy'
    this.isTransitioning = false;

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
    this.giftScreen = document.getElementById('gift-screen');
    this.teddyScreen = document.getElementById('teddy-screen');

    // Gift Screen elements
    this.surpriseGiftBox = document.getElementById('surprise-gift-box');
    this.giftSparkleCanvas = document.getElementById('gift-sparkle-canvas');
    this.giftOpenBtn = document.getElementById('gift-open-btn');

    // Teddy Screen elements
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
    // 1. Interactive 3D Celestial Surprise Gift Box
    if (this.surpriseGiftBox && this.giftSparkleCanvas) {
      this.giftBoxController = new GiftBoxController(
        this.surpriseGiftBox,
        this.giftSparkleCanvas,
        () => {
          this.transitionToTeddy();
        }
      );
    }

    // 2. Living Colored ASCII Teddy Bear
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
    // Open Gift Trigger
    const handleGiftOpen = () => {
      if (this.currentScreen !== 'gift' || this.isTransitioning) return;

      try {
        this.audioManager.init();
        this.audioManager.playHeartBurst();
        this.audioManager.playBloomChime();
      } catch (e) {}

      if (this.giftBoxController) {
        this.giftBoxController.openGift();
      } else {
        this.transitionToTeddy();
      }
    };

    // Tap gift box
    if (this.surpriseGiftBox) {
      this.surpriseGiftBox.addEventListener('click', handleGiftOpen);
      this.surpriseGiftBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleGiftOpen();
        }
      });
    }

    // Tap open button
    if (this.giftOpenBtn) {
      this.giftOpenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleGiftOpen();
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

    // Theme toggle button
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.cycleTheme());
    }

    // Sound / Music toggle button
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const isMuted = this.audioManager.toggleMute();
        this.soundToggleBtn.classList.toggle('active', !isMuted);
        if (this.soundIcon) {
          this.soundIcon.textContent = isMuted ? '🔇' : '🎵';
        }
        if (this.soundLabel) {
          this.soundLabel.textContent = isMuted ? 'Music' : 'Playing';
        }
        this.showToast(isMuted ? 'Music paused 🔇' : 'Celestial music box playing 🎵');
      });
    }

    // Interactive Action 1: Save Gift (Capture PNG Snapshot)
    if (this.btnSaveGift) {
      this.btnSaveGift.addEventListener('click', () => {
        this.saveGiftSnapshot();
      });
    }

    // Interactive Action 2: Make Teddy Wave
    if (this.btnMakeWave) {
      this.btnMakeWave.addEventListener('click', () => {
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerWave();
          this.showToast('Teddy waves happily to you! 👋✨');
          try {
            this.audioManager.playBloomChime();
          } catch (e) {}
        }
      });
    }

    // Interactive Action 3: Pulse Heart
    if (this.btnPulseHeart) {
      this.btnPulseHeart.addEventListener('click', () => {
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerHeartPulse();
          this.showToast('Teddy sends a warm heartbeat! 💖✨');
          try {
            this.audioManager.playHeartBurst();
          } catch (e) {}
        }
      });
    }

    // Interactive Action 4: Explore World (Modal)
    if (this.btnExploreWorld) {
      this.btnExploreWorld.addEventListener('click', () => {
        if (this.worldModal) {
          this.worldModal.classList.add('visible');
          try {
            this.audioManager.playClick();
          } catch (e) {}
        }
      });
    }

    if (this.btnCloseWorld) {
      this.btnCloseWorld.addEventListener('click', () => {
        if (this.worldModal) {
          this.worldModal.classList.remove('visible');
        }
      });
    }

    if (this.worldModal) {
      this.worldModal.addEventListener('click', (e) => {
        if (e.target === this.worldModal) {
          this.worldModal.classList.remove('visible');
        }
      });
    }

    // Replay Button: Open the Surprise Gift Again!
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.restartExperience();
      });
    }

    // Floating Polaroid Photo: Click to Zoom / Enlarge
    if (this.floatingPolaroid) {
      this.floatingPolaroid.addEventListener('click', (e) => {
        if (e.target.closest('.btn-change-photo') || e.target.closest('input')) return;
        this.floatingPolaroid.classList.toggle('enlarged');
        try {
          this.audioManager.playClick();
        } catch (err) {}
      });
    }

    // Custom Photo Upload on Polaroid
    if (this.photoUploadInput && this.polaroidImg) {
      this.photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            this.polaroidImg.src = loadEvt.target.result;
            this.showToast('Custom photo framed with love! 📸✨');
            try {
              this.audioManager.playBloomChime();
            } catch (err) {}
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Key accessibility navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.worldModal && this.worldModal.classList.contains('visible')) {
        this.worldModal.classList.remove('visible');
      }
      if (e.key === 'ArrowRight' && this.currentScreen === 'teddy' && this.teddyRenderer) {
        const next = (this.teddyRenderer.currentIndex + 1) % 4;
        this.teddyRenderer.setTeddy(next);
        this.updateTeddySelectorUI(next);
      }
      if (e.key === 'ArrowLeft' && this.currentScreen === 'teddy' && this.teddyRenderer) {
        const prev = (this.teddyRenderer.currentIndex + 3) % 4;
        this.teddyRenderer.setTeddy(prev);
        this.updateTeddySelectorUI(prev);
      }
    });

    window.addEventListener('resize', () => {
      if (this.giftBoxController) this.giftBoxController.resize();
      if (this.teddyRenderer) this.teddyRenderer.resize();
    });
  }

  saveGiftSnapshot() {
    this.showToast('Crafting your magical keepsake... 📸✨');
    try {
      const snapCanvas = document.createElement('canvas');
      const w = 1200;
      const h = 1200;
      snapCanvas.width = w;
      snapCanvas.height = h;
      const sCtx = snapCanvas.getContext('2d');

      // Gradient background
      const grad = sCtx.createRadialGradient(w * 0.5, h * 0.5, 100, w * 0.5, h * 0.5, 700);
      grad.addColorStop(0, '#15132d');
      grad.addColorStop(0.5, '#0b0c1c');
      grad.addColorStop(1, '#05050d');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, w, h);

      // Draw living ASCII teddy
      if (this.teddyCanvas) {
        sCtx.drawImage(this.teddyCanvas, 100, 100, 1000, 1000);
      }

      // Gilded dedication banner
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      sCtx.font = 'bold 36px "Inter", sans-serif';
      sCtx.textAlign = 'center';
      sCtx.fillText('SPECIALLY CRAFTED FOR LOKI', w * 0.5, 90);

      sCtx.fillStyle = '#ff7b9f';
      sCtx.font = 'italic 28px "Cormorant Garamond", serif';
      sCtx.fillText('"You bring endless warmth, comfort, and happiness."', w * 0.5, h - 90);

      sCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      sCtx.font = '600 20px monospace';
      sCtx.fillText('> with love : LOKESH KUMAR', w * 0.5, h - 50);

      const link = document.createElement('a');
      link.download = `loki-teddy-gift-${Date.now()}.png`;
      link.href = snapCanvas.toDataURL('image/png');
      link.click();

      this.showToast('Keepsake saved to your device! 🎁💖');
      try {
        this.audioManager.playHeartBurst();
      } catch (e) {}
    } catch (err) {
      console.warn('Snapshot error:', err);
      this.showToast('Could not save snapshot directly. Take a screenshot! 📸');
    }
  }

  updateTeddySelectorUI(index) {
    if (!this.teddySelectorBar) return;
    const buttons = this.teddySelectorBar.querySelectorAll('.teddy-tab-btn');
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === index);
    });
  }

  transitionToTeddy() {
    if (this.isTransitioning || this.currentScreen === 'teddy') return;
    this.isTransitioning = true;
    this.currentScreen = 'teddy';

    try {
      this.audioManager.playBloomChime();
    } catch (e) {}

    // 1. Fade out gift screen
    if (this.giftScreen) {
      this.giftScreen.classList.remove('active');
    }

    setTimeout(() => {
      if (this.giftBoxController) this.giftBoxController.stop();
      if (this.giftScreen) this.giftScreen.style.display = 'none';

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

      // 4. Start living teddy: reveals slowly from bottom upward!
      if (this.teddyRenderer) {
        this.teddyRenderer.reset(false);
        this.teddyRenderer.start();
      }

      this.isTransitioning = false;
    }, 450);
  }

  restartExperience() {
    this.isTransitioning = true;
    this.currentScreen = 'gift';

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

      if (this.giftBoxController) {
        this.giftBoxController.reset();
        this.giftBoxController.startAmbientLoop();
      }

      if (this.giftScreen) {
        this.giftScreen.style.display = '';
        this.giftScreen.classList.add('active');
      }

      this.isTransitioning = false;
    }, 400);
  }

  start() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scene') === 'teddy') {
      this.currentScreen = 'teddy';
      if (this.giftScreen) {
        this.giftScreen.classList.remove('active');
        this.giftScreen.style.display = 'none';
      }
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
    }

    // Start ambient celestial stardust & rising hearts
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
