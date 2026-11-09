/**
 * Romantic Celestial Universe & Living ASCII Teddy Bear Experience (v14.0)
 * 
 * Complete Worldwide Multilingual & Internationalization Architecture:
 * - Unicode compliance across all major world writing systems.
 * - Exact user native name preservation (never replaced or stripped).
 * - User-controlled transliteration manager with interactive editing.
 * - Dynamic UI language switching with Right-To-Left (RTL) support (Arabic, Hebrew).
 * - 24-bit True-Color Glowing ASCII Teddy Bear with complete standing posture & feet.
 * - v14.0: Multilingual name grid in final dedication card.
 */

import { AmbientParticles } from './ambient-particles.js?v=35.0';
import { AsciiPigeon } from './ascii-pigeon.js?v=35.0';
import { AsciiEnvelope } from './ascii-envelope.js?v=35.0';
import { AsciiTeddy } from './ascii-teddy.js?v=35.0';
import { AudioManager } from './audio-fx.js?v=35.0';
import { MultiLangNameProfile } from './name-multilang.js?v=35.0';

class PigeonTeddyApp {
  constructor() {
    this.currentScreen = 'delivery'; // 'delivery' or 'teddy'
    this.isTransitioning = false;

    // Load or initialize Name Profile (Default: 'Lokesh Kumar')
    let loadedProfile = MultiLangNameProfile.load();
    if (loadedProfile && (loadedProfile.originalName === 'Loki' || !loadedProfile.originalName)) {
      loadedProfile = new MultiLangNameProfile('Lokesh Kumar');
      loadedProfile.save();
    }
    this.nameProfile = loadedProfile || new MultiLangNameProfile('Lokesh Kumar');
    this.recipientName = this.nameProfile.originalName || 'Lokesh Kumar';

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

    // Delivery Screen elements
    this.deliveryScreen = document.getElementById('delivery-screen');
    this.pigeonCanvas = document.getElementById('pigeon-canvas');
    this.envelopeCanvas = document.getElementById('envelope-canvas');
    this.envelopeHint = document.getElementById('envelope-hint');
    this.unsealBtn = document.getElementById('unseal-btn');
    this.unsealSubcaption = document.getElementById('unseal-subcaption');

    // Teddy Screen elements
    this.experienceHeaderBadge = document.getElementById('experience-header-badge');
    this.teddyCanvas = document.getElementById('teddy-canvas');
    this.teddySelectorBar = document.getElementById('teddy-selector-bar');
    this.headerNameDisplay = document.getElementById('header-name-display');

    this.giftActionCard = document.getElementById('gift-action-card');
    this.cardName = document.getElementById('card-name');
    this.btnToggleCard = document.getElementById('btn-toggle-card');
    this.btnCardPill = document.getElementById('btn-card-pill');

    this.btnSaveGift = document.getElementById('btn-save-gift');
    this.btnMakeWave = document.getElementById('btn-make-wave');
    this.btnPulseHeart = document.getElementById('btn-pulse-heart');
    this.replayBtn = document.getElementById('btn-replay');

    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.themeLabel = document.getElementById('theme-label');
    this.themeIcon = document.getElementById('theme-icon');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundLabel = document.getElementById('sound-label');

    // Personalized Love Blessing Modal ("Special for that person")
    this.heartBlessingModal = document.getElementById('heart-blessing-modal');
    this.btnDismissBlessing = document.getElementById('btn-dismiss-blessing');
    this.btnReceiveLove = document.getElementById('btn-receive-love');
    this.blessingRecipientName = document.querySelector('.blessing-recipient-name');

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
    // 1. ASCII Carrier Pigeon Dove
    if (this.pigeonCanvas) {
      this.pigeonRenderer = new AsciiPigeon(
        this.pigeonCanvas,
        // On letter dropped into center stage:
        () => {
          if (this.envelopeCanvas) {
            this.envelopeCanvas.classList.add('visible');
          }
          if (this.envelopeHint) {
            this.envelopeHint.classList.add('visible');
          }
          try {
            this.audioManager.playDrop();
          } catch (e) {}
        },
        // On pigeon departed into stars:
        () => {
          if (this.pigeonRenderer) this.pigeonRenderer.stop();
        }
      );
    }

    // 2. ASCII Sealed Letter & Unsealing Ceremony
    if (this.envelopeCanvas) {
      this.envelopeRenderer = new AsciiEnvelope(
        this.envelopeCanvas,
        () => {
          this.transitionToTeddy();
        }
      );
      this.envelopeRenderer.setRecipientName(this.recipientName);
    }

    // 3. Living Colored ASCII Teddy Bear
    if (this.teddyCanvas) {
      this.teddyRenderer = new AsciiTeddy(this.teddyCanvas, () => {
        if (this.giftActionCard) {
          this.giftActionCard.classList.add('visible');
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

  applyRecipientProfile(profile) {
    this.nameProfile = profile;
    this.recipientName = profile.originalName;
    this.multiLangData = profile.transliterations;
    this.nameProfile.save();
    this.refreshDisplays();
  }

  applyRecipientName(rawName) {
    const clean = String(rawName || 'Lokesh Kumar').normalize('NFC').trim() || 'Lokesh Kumar';
    this.nameProfile = new MultiLangNameProfile(clean);
    this.recipientName = this.nameProfile.originalName;
    this.multiLangData = this.nameProfile.transliterations;
    this.nameProfile.save();
    this.refreshDisplays();
  }

  refreshDisplays() {
    const displayName = this.nameProfile.displayName || this.nameProfile.originalName;

    // 1. Envelope Renderer
    if (this.envelopeRenderer) {
      this.envelopeRenderer.setRecipientName(this.recipientName);
    }

    // 2. Header Banner
    if (this.headerNameDisplay) {
      this.headerNameDisplay.textContent = displayName;
    }

    // 3. Dedication Card Title
    if (this.cardName) {
      this.cardName.textContent = displayName;
    }

    // 4. Personalized Love Blessing Modal Title
    if (this.blessingRecipientName) {
      this.blessingRecipientName.textContent = displayName;
    }
  }

  openHeartBlessing() {
    if (!this.heartBlessingModal) {
      this.heartBlessingModal = document.getElementById('heart-blessing-modal');
    }
    if (!this.heartBlessingModal) return;
    this.heartBlessingModal.removeAttribute('inert');
    this.heartBlessingModal.classList.add('visible');
    this.heartBlessingModal.removeAttribute('aria-hidden');
  }

  closeHeartBlessing() {
    if (!this.heartBlessingModal) {
      this.heartBlessingModal = document.getElementById('heart-blessing-modal');
    }
    if (!this.heartBlessingModal) return;
    if (document.activeElement && this.heartBlessingModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    this.heartBlessingModal.classList.remove('visible');
    this.heartBlessingModal.setAttribute('aria-hidden', 'true');
    this.heartBlessingModal.setAttribute('inert', '');
  }

  initInteractions() {
    // Click letter / envelope to open immediately without name prompting
    const handleLetterOpenRequest = () => {
      if (this.currentScreen !== 'delivery' || this.isTransitioning) return;
      try {
        this.audioManager.init();
        this.audioManager.playHeartBurst();
        this.audioManager.playBloomChime();
      } catch (e) {}

      if (this.envelopeRenderer) {
        this.envelopeRenderer.triggerClick();
      } else {
        this.transitionToTeddy();
      }
    };

    if (this.envelopeCanvas) {
      this.envelopeCanvas.addEventListener('click', handleLetterOpenRequest);
    }
    if (this.unsealBtn) {
      this.unsealBtn.addEventListener('click', handleLetterOpenRequest);
      this.unsealBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleLetterOpenRequest();
      });
    }

    // Global Responsive Resize for mobile orientation changes & viewport updates
    window.addEventListener('resize', () => {
      if (this.currentScreen === 'delivery') {
        if (this.pigeonRenderer) this.pigeonRenderer.resize();
        if (this.envelopeRenderer) this.envelopeRenderer.resize();
      } else if (this.currentScreen === 'teddy') {
        if (this.teddyRenderer) this.teddyRenderer.resize();
      }
    }, { passive: true });

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
      });
    }

    // Action button handlers (with fast mobile touch & click support)
    if (this.btnSaveGift) {
      const handleSave = (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        this.saveGiftSnapshot();
      };
      this.btnSaveGift.addEventListener('click', handleSave);
      this.btnSaveGift.addEventListener('touchend', handleSave, { passive: false });
    }
    if (this.btnMakeWave) {
      const handleWave = (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        if (this.teddyRenderer) {
          try {
            this.teddyRenderer.triggerWave();
          } catch (err) {}
          this.showToast('Teddy is waving happily at you! 👋🧸');
          try {
            this.audioManager.playBloomChime();
          } catch (e) {}
        }
      };
      this.btnMakeWave.addEventListener('click', handleWave);
      this.btnMakeWave.addEventListener('touchend', handleWave, { passive: false });
    }
    if (this.btnPulseHeart) {
      let isPulsing = false;
      const handlePulse = (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        if (e) e.stopPropagation();

        if (isPulsing) return;
        isPulsing = true;
        setTimeout(() => { isPulsing = false; }, 400);

        // Instant tactile visual feedback
        this.btnPulseHeart.classList.add('pulse-active');
        setTimeout(() => this.btnPulseHeart.classList.remove('pulse-active'), 400);

        // 1. Immediately bloom the enchanted personalized love blessing modal!
        try {
          this.openHeartBlessing();
        } catch (modalErr) {
          console.warn('Modal open error:', modalErr);
        }

        // 2. Auto-unmute and play heartbeat symphony & harp arpeggio
        try {
          if (this.audioManager) {
            if (this.audioManager.isMuted) {
              this.audioManager.toggleMute();
              if (this.soundToggleBtn) this.soundToggleBtn.classList.add('active');
              if (this.soundIcon) this.soundIcon.textContent = '🎵';
              if (this.soundLabel) this.soundLabel.textContent = 'Playing';
            }
            if (typeof this.audioManager.playHeartbeatSymphony === 'function') {
              this.audioManager.playHeartbeatSymphony();
            } else if (typeof this.audioManager.playHeartBurst === 'function') {
              this.audioManager.playHeartBurst();
            }
          }
        } catch (err) {
          console.warn('Audio play error:', err);
        }

        // 3. High-intensity heart pulse & happy bounce on Teddy
        try {
          if (this.teddyRenderer && typeof this.teddyRenderer.triggerHeartPulse === 'function') {
            this.teddyRenderer.triggerHeartPulse();
          }
        } catch (err) {}

        // 4. Screen-wide cascade of rising glowing hearts & golden stardust
        try {
          if (this.ambientParticles && typeof this.ambientParticles.burstLoveConfetti === 'function') {
            this.ambientParticles.burstLoveConfetti();
          }
        } catch (err) {}

        // 5. Toast notification
        try {
          this.showToast(`Teddy's heart beats especially for ${this.recipientName}! 💖`);
        } catch (err) {}
      };

      this.btnPulseHeart.addEventListener('click', handlePulse);
      this.btnPulseHeart.addEventListener('touchend', handlePulse, { passive: false });
    }

    // Handlers for Personalized Blessing Modal
    if (this.btnDismissBlessing) {
      const handleDismiss = (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        if (e) e.stopPropagation();
        this.closeHeartBlessing();
      };
      this.btnDismissBlessing.addEventListener('click', handleDismiss);
      this.btnDismissBlessing.addEventListener('touchend', handleDismiss, { passive: false });
    }

    if (this.btnReceiveLove) {
      const handleReceive = (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        if (e) e.stopPropagation();
        this.closeHeartBlessing();
        this.showToast(`Infinite love received! Teddy is giving you the biggest hug! 🧸💖`);
        try {
          if (this.teddyRenderer && typeof this.teddyRenderer.triggerWave === 'function') {
            this.teddyRenderer.triggerWave();
          }
        } catch (err) {}
        try {
          if (this.audioManager && typeof this.audioManager.playBloomChime === 'function') {
            this.audioManager.playBloomChime();
          }
        } catch (err) {}
        try {
          if (this.ambientParticles && typeof this.ambientParticles.burstLoveConfetti === 'function') {
            this.ambientParticles.burstLoveConfetti(null, null, 40);
          }
        } catch (err) {}
      };
      this.btnReceiveLove.addEventListener('click', handleReceive);
      this.btnReceiveLove.addEventListener('touchend', handleReceive, { passive: false });
    }

    // Close blessing modal on clicking outer backdrop
    const blessingBackdrop = this.heartBlessingModal ? this.heartBlessingModal.querySelector('.blessing-backdrop') : null;
    if (blessingBackdrop) {
      blessingBackdrop.addEventListener('click', () => this.closeHeartBlessing());
      blessingBackdrop.addEventListener('touchend', () => this.closeHeartBlessing());
    }
    if (this.btnToggleCard) {
      this.btnToggleCard.addEventListener('click', () => {
        if (this.giftActionCard) {
          this.giftActionCard.classList.add('minimized');
        }
        if (this.btnCardPill) {
          this.btnCardPill.classList.add('visible');
        }
        this.showToast('Dedication card minimized. Tap pill to reopen anytime! ✨');
      });
    }
    if (this.btnCardPill) {
      this.btnCardPill.addEventListener('click', () => {
        if (this.giftActionCard) {
          this.giftActionCard.classList.remove('minimized');
          this.giftActionCard.classList.add('visible');
        }
        if (this.btnCardPill) {
          this.btnCardPill.classList.remove('visible');
        }
      });
    }
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.restartExperience());
    }
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

      // Use dedicated master keepsake renderer for 100% unclipped, unsquashed 1200x1200 quality
      if (this.teddyRenderer && typeof this.teddyRenderer.renderKeepsakeSnapshot === 'function') {
        this.teddyRenderer.renderKeepsakeSnapshot(sCtx, w, h, this.recipientName);
      } else {
        // Fallback
        const grad = sCtx.createRadialGradient(w * 0.5, h * 0.5, 100, w * 0.5, h * 0.5, 700);
        grad.addColorStop(0, '#15132d');
        grad.addColorStop(0.5, '#0b0c1c');
        grad.addColorStop(1, '#05050d');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, w, h);
        if (this.teddyCanvas) {
          sCtx.drawImage(this.teddyCanvas, 100, 100, 1000, 1000);
        }
      }

      const link = document.createElement('a');
      link.download = `Teddy_Gift_For_${this.recipientName.replace(/\s+/g, '_')}.png`;
      link.href = snapCanvas.toDataURL('image/png');
      link.click();

      this.showToast(`Keepsake downloaded for ${this.recipientName}! 🎁✨`);
    } catch (err) {
      console.error(err);
      this.showToast('Unable to export snapshot in this browser.');
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

    // 1. Fade out delivery screen
    if (this.deliveryScreen) {
      this.deliveryScreen.classList.remove('active');
    }

    setTimeout(() => {
      if (this.pigeonRenderer) this.pigeonRenderer.stop();
      if (this.envelopeRenderer) this.envelopeRenderer.stop();
      if (this.deliveryScreen) this.deliveryScreen.style.display = 'none';

      // 2. Fade in teddy screen
      if (this.teddyScreen) {
        this.teddyScreen.style.display = 'flex';
        this.teddyScreen.classList.add('active');
      }
      if (this.giftActionCard) {
        this.giftActionCard.classList.remove('visible');
        this.giftActionCard.classList.remove('minimized');
      }
      if (this.btnCardPill) {
        this.btnCardPill.classList.remove('visible');
      }

      // 3. Show up-side (top) teddy selector bar
      if (this.teddySelectorBar) {
        this.teddySelectorBar.classList.add('visible');
      }

      // 4. Start living teddy: reveals slowly from bottom upward!
      if (this.teddyRenderer) {
        this.teddyRenderer.resize();
        this.teddyRenderer.reset(false);
        this.teddyRenderer.start();
        setTimeout(() => {
          this.teddyRenderer.triggerHeartPulse();
        }, 120);
      }

      this.isTransitioning = false;
    }, 450);
  }

  restartExperience() {
    this.isTransitioning = true;
    this.currentScreen = 'delivery';

    if (this.teddyRenderer) this.teddyRenderer.stop();
    if (this.teddyScreen) {
      this.teddyScreen.classList.remove('active');
      this.teddyScreen.style.display = 'none';
    }
    if (this.teddySelectorBar) {
      this.teddySelectorBar.classList.remove('visible');
    }
    if (this.giftActionCard) {
      this.giftActionCard.classList.remove('visible');
      this.giftActionCard.classList.remove('minimized');
    }
    if (this.btnCardPill) {
      this.btnCardPill.classList.remove('visible');
    }

    setTimeout(() => {
      if (this.pigeonRenderer) {
        this.pigeonRenderer.reset();
        this.pigeonRenderer.start();
      }

      if (this.envelopeRenderer) {
        this.envelopeRenderer.reset();
        this.envelopeRenderer.start();
      }

      if (this.envelopeHint) {
        this.envelopeHint.classList.remove('visible');
      }

      if (this.envelopeCanvas) {
        this.envelopeCanvas.classList.remove('visible');
      }

      if (this.deliveryScreen) {
        this.deliveryScreen.style.display = '';
        this.deliveryScreen.classList.add('active');
      }

      this.isTransitioning = false;
    }, 400);
  }

  start() {
    // Start ambient floating stardust & love confetti physics loop (60 FPS)
    if (this.ambientParticles) {
      let lastTime = performance.now();
      const ambientLoop = (now) => {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        this.ambientParticles.update(dt);
        this.ambientParticles.render();
        requestAnimationFrame(ambientLoop);
      };
      requestAnimationFrame(ambientLoop);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam) {
      this.applyRecipientName(nameParam);
    } else {
      this.refreshDisplays();
    }

    if (urlParams.get('scene') === 'teddy' || urlParams.get('screen') === 'teddy' || urlParams.get('testScene') === 'reveal') {
      this.currentScreen = 'teddy';
      if (this.deliveryScreen) {
        this.deliveryScreen.classList.remove('active');
        this.deliveryScreen.style.display = 'none';
      }
      if (this.teddyScreen) {
        this.teddyScreen.style.display = 'flex';
        this.teddyScreen.classList.add('active');
        this.teddyScreen.style.transition = 'none';
        this.teddyScreen.style.opacity = '1';
      }
      if (this.teddySelectorBar) {
        this.teddySelectorBar.classList.add('visible');
        this.teddySelectorBar.style.transition = 'none';
        this.teddySelectorBar.style.opacity = '1';
      }
      if (this.giftActionCard) {
        this.giftActionCard.classList.add('visible');
        this.giftActionCard.style.transition = 'none';
        this.giftActionCard.style.opacity = '1';
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
      // Start Carrier Pigeon flight & envelope engine
      if (this.pigeonRenderer) {
        this.pigeonRenderer.start();
      }
      if (this.envelopeRenderer) {
        this.envelopeRenderer.start();
      }
    }
  }
}

// Bootstrap once DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.__pigeonTeddyApp = new PigeonTeddyApp();
  });
}
