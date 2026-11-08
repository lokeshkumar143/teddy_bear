/**
 * Romantic Celestial Universe & Living ASCII Teddy Bear Experience (v12.0)
 * 
 * Interactive Flow:
 * 1. Carrier Pigeon Delivery:
 *    - Majestically flies in across the starry sky carrying a sealed romantic letter.
 *    - Drops the letter into the center of the screen, then swoops away into the cosmos.
 * 2. Interactive Name Entry & Multi-Language Generation:
 *    - When the user taps the letter / "TOUCH THE LETTER TO OPEN", an enchanting modal opens.
 *    - Asking: "Who is this surprise for? ✨"
 *    - User types their name (e.g. Loki, Priya, Rahul, Alex, etc.).
 *    - In real time, the multi-language transliteration engine translates and previews their name
 *      across 10+ languages: Tamil, Hindi, Telugu, Japanese, Korean, Chinese, Arabic, Russian, Greek, English!
 * 3. Sacred Wax Unsealing Ceremony:
 *    - 3D wax seal shatters into 80+ glowing crystal shards and light shockwaves.
 *    - The envelope unrolls with an illuminated love decree addressed to their name in multi-languages!
 *    - The letter dissolves into ascending golden stardust and hearts.
 * 4. Living ASCII Teddy Bear & Global Name Dedication:
 *    - The 24-bit True-Color ASCII Teddy Bear emerges slowly from the bottom upward.
 *    - Up-side (top) selector bar allows switching between 4 unique teddy bears.
 *    - Floating Polaroid photo of Loki framed with love and user's name in native script.
 *    - Top header badge features a dynamic rotating multi-language ribbon of their name.
 *    - Interactive dedication card showcases their name across all 10 world languages with an "Edit Name ✎" option.
 *    - Pure ASCII signature dynamically adapts to spell their name in ASCII keys and hex bytes.
 */

import { AmbientParticles } from './ambient-particles.js?v=12.0';
import { AsciiPigeon } from './ascii-pigeon.js?v=12.0';
import { AsciiEnvelope } from './ascii-envelope.js?v=12.0';
import { AsciiTeddy } from './ascii-teddy.js?v=12.0';
import { AudioManager } from './audio-fx.js?v=12.0';
import { generateMultiLangName, getLanguageList } from './name-multilang.js?v=12.0';

class PigeonTeddyApp {
  constructor() {
    this.currentScreen = 'delivery'; // 'delivery' or 'teddy'
    this.isTransitioning = false;
    this.recipientName = 'Loki';
    this.multiLangData = generateMultiLangName(this.recipientName);

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
    this.pigeonCanvas = document.getElementById('pigeon-canvas');
    this.envelopeCanvas = document.getElementById('envelope-canvas');
    this.envelopeHint = document.getElementById('envelope-hint');
    this.unsealBtn = document.getElementById('unseal-btn');
    this.unsealSubcaption = document.getElementById('unseal-subcaption');

    // Name Entry & Multi-Language Modal
    this.nameModal = document.getElementById('name-modal');
    this.nameForm = document.getElementById('name-form');
    this.nameInput = document.getElementById('recipient-name-input');
    this.previewChips = document.getElementById('preview-chips');
    this.btnConfirmName = document.getElementById('btn-confirm-name');

    // Teddy Screen elements
    this.teddyCanvas = document.getElementById('teddy-canvas');
    this.teddySelectorBar = document.getElementById('teddy-selector-bar');
    this.headerNameDisplay = document.getElementById('header-name-display');
    this.headerMultilangTicker = document.getElementById('header-multilang-ticker');

    this.floatingPolaroid = document.getElementById('floating-polaroid');
    this.polaroidImg = document.getElementById('polaroid-img');
    this.photoUploadInput = document.getElementById('photo-upload-input');
    this.polaroidName = document.getElementById('polaroid-name');
    this.polaroidNativeScript = document.getElementById('polaroid-native-script');

    this.giftActionCard = document.getElementById('gift-action-card');
    this.cardName = document.getElementById('card-name');
    this.langGridDisplay = document.getElementById('lang-grid-display');
    this.btnEditName = document.getElementById('btn-edit-name');

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
        // On envelope unseal & burn complete:
        () => {
          this.transitionToTeddy();
        }
      );
      this.envelopeRenderer.setRecipientName(this.recipientName, this.multiLangData);
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

  openNameModal() {
    if (!this.nameModal) return;
    this.nameModal.classList.add('visible');
    this.nameModal.setAttribute('aria-hidden', 'false');
    if (this.nameInput) {
      this.nameInput.value = this.recipientName || 'Loki';
      this.updateLivePreview(this.nameInput.value);
      setTimeout(() => this.nameInput.focus(), 150);
    }
  }

  closeNameModal() {
    if (!this.nameModal) return;
    this.nameModal.classList.remove('visible');
    this.nameModal.setAttribute('aria-hidden', 'true');
  }

  updateLivePreview(nameStr) {
    if (!this.previewChips) return;
    const data = generateMultiLangName(nameStr || 'Loki');
    const list = getLanguageList(data);

    this.previewChips.innerHTML = list.map(item => `
      <div class="preview-chip" title="${item.label} (${item.script})">
        <span class="chip-flag">${item.flag}</span>
        <span class="chip-lang">${item.script}:</span>
        <span class="chip-text">${item.text}</span>
      </div>
    `).join('');
  }

  applyRecipientName(nameStr) {
    const cleanName = (nameStr || 'Loki').trim() || 'Loki';
    this.recipientName = cleanName;
    this.multiLangData = generateMultiLangName(cleanName);

    // 1. Update Envelope Renderer
    if (this.envelopeRenderer) {
      this.envelopeRenderer.setRecipientName(this.recipientName, this.multiLangData);
    }

    // 2. Update Header Banner Display & Ticker
    if (this.headerNameDisplay) {
      this.headerNameDisplay.textContent = this.recipientName.toUpperCase();
    }
    if (this.headerMultilangTicker) {
      this.headerMultilangTicker.textContent = `${this.multiLangData.ta} • ${this.multiLangData.hi} • ${this.multiLangData.ja} • ${this.multiLangData.ko} • ${this.multiLangData.zh} • ${this.multiLangData.ar}`;
    }

    // 3. Update Polaroid Caption
    if (this.polaroidName) {
      this.polaroidName.textContent = this.recipientName;
    }
    if (this.polaroidNativeScript) {
      this.polaroidNativeScript.textContent = this.multiLangData.ta || this.multiLangData.hi;
    }

    // 4. Update Dedication Card
    if (this.cardName) {
      this.cardName.textContent = this.recipientName;
    }

    // 5. Update Multi-Language Showcase Grid in Dedication Card
    if (this.langGridDisplay) {
      const list = getLanguageList(this.multiLangData);
      this.langGridDisplay.innerHTML = list.map(item => `
        <div class="lang-pill" title="${item.label}">
          <div class="lang-pill-left">
            <span>${item.flag}</span>
            <span>${item.script}</span>
          </div>
          <div class="lang-pill-text">${item.text}</div>
        </div>
      `).join('');
    }

    // 6. Update ASCII Signature Key cluster
    this.updateAsciiSignature(this.recipientName);
  }

  updateAsciiSignature(name) {
    if (!this.cornerSignature) return;
    const cluster = this.cornerSignature.querySelector('.ascii-key-cluster');
    const bytesDiv = this.cornerSignature.querySelector('.ascii-sig-bytes');
    if (!cluster) return;

    const upper = name.toUpperCase().replace(/[^A-Z]/g, '') || 'LOKI';
    cluster.innerHTML = `
      <div class="ascii-key-word">
        ${upper.split('').map(ch => `<span class="ascii-key">${ch}</span>`).join('')}
      </div>
    `;

    if (bytesDiv) {
      const hexBytes = upper.split('').map(ch => ch.charCodeAt(0).toString(16).toUpperCase()).join(' ');
      bytesDiv.innerHTML = `<span class="ascii-code">ASCII_KEY:</span> ${hexBytes} <span class="sig-star">✦</span>`;
    }
  }

  initInteractions() {
    // Click letter / envelope to ask name
    const handleLetterOpenRequest = () => {
      if (this.currentScreen !== 'delivery' || this.isTransitioning) return;
      try {
        this.audioManager.init();
        this.audioManager.playClick();
      } catch (e) {}
      this.openNameModal();
    };

    if (this.envelopeCanvas) {
      this.envelopeCanvas.addEventListener('click', handleLetterOpenRequest);
    }
    if (this.unsealBtn) {
      this.unsealBtn.addEventListener('click', handleLetterOpenRequest);
    }

    // Real-time input typing transliteration
    if (this.nameInput) {
      this.nameInput.addEventListener('input', (e) => {
        this.updateLivePreview(e.target.value);
      });
      this.nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitName();
        }
      });
    }

    // Confirm Name Form Submit
    if (this.nameForm) {
      this.nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitName();
      });
    }
    if (this.btnConfirmName) {
      this.btnConfirmName.addEventListener('click', () => {
        this.submitName();
      });
    }

    // Edit Name button in Dedication card
    if (this.btnEditName) {
      this.btnEditName.addEventListener('click', () => {
        this.openNameModal();
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
          this.showToast(`Teddy waves happily to you, ${this.recipientName}! 👋✨`);
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
          this.showToast(`Glowing heart pulses with love for ${this.recipientName}! 💖`);
          try {
            this.audioManager.playHeartBurst();
          } catch (e) {}
        }
      });
    }

    // Interactive Action 4: Explore Developer Portfolio Modal
    if (this.btnExploreWorld) {
      this.btnExploreWorld.addEventListener('click', () => {
        if (this.worldModal) {
          this.worldModal.classList.add('visible');
          this.worldModal.setAttribute('aria-hidden', 'false');
        }
        try {
          this.audioManager.playClick();
        } catch (e) {}
      });
    }

    if (this.btnCloseWorld) {
      this.btnCloseWorld.addEventListener('click', () => {
        if (this.worldModal) {
          this.worldModal.classList.remove('visible');
          this.worldModal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    // Replay Experience (Watch Again)
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.restartExperience();
      });
    }

    // Custom Photo Upload Input
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
      if (e.key === 'Escape') {
        if (this.nameModal && this.nameModal.classList.contains('visible')) {
          this.closeNameModal();
        } else if (this.worldModal && this.worldModal.classList.contains('visible')) {
          this.worldModal.classList.remove('visible');
        }
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
      if (this.pigeonRenderer) this.pigeonRenderer.resize();
      if (this.envelopeRenderer) this.envelopeRenderer.resize();
      if (this.teddyRenderer) this.teddyRenderer.resize();
    });
  }

  submitName() {
    const nameVal = this.nameInput ? this.nameInput.value : 'Loki';
    this.applyRecipientName(nameVal);
    this.closeNameModal();

    if (this.currentScreen === 'delivery') {
      try {
        this.audioManager.playHeartBurst();
        this.audioManager.playBloomChime();
      } catch (e) {}

      // Trigger spectacular envelope unsealing ceremony
      if (this.envelopeRenderer) {
        this.envelopeRenderer.triggerClick();
      } else {
        this.transitionToTeddy();
      }
    } else {
      this.showToast(`Updated name to ${this.recipientName} across all languages! ✨`);
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

      // Title & multi-language dedication overlay
      sCtx.fillStyle = '#ffd700';
      sCtx.font = 'bold 36px serif';
      sCtx.textAlign = 'center';
      sCtx.fillText(`✦ SPECIALLY CRAFTED FOR ${this.recipientName.toUpperCase()} ✦`, w * 0.5, 90);

      sCtx.fillStyle = '#ff7b9c';
      sCtx.font = '22px sans-serif';
      sCtx.fillText(`${this.multiLangData.ta} • ${this.multiLangData.hi} • ${this.multiLangData.ja} • ${this.multiLangData.ar}`, w * 0.5, 130);

      // Footer
      sCtx.fillStyle = '#c5d0e8';
      sCtx.font = 'italic 20px "Cormorant Garamond", serif';
      sCtx.fillText('Living 24-Bit Procedural ASCII Art • Handcrafted with love by Lokesh Kumar', w * 0.5, h - 50);

      const link = document.createElement('a');
      link.download = `Teddy_Gift_For_${this.recipientName}.png`;
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
    this.currentScreen = 'delivery';

    if (this.teddyRenderer) this.teddyRenderer.stop();
    if (this.teddyScreen) {
      this.teddyScreen.classList.remove('active');
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
    this.applyRecipientName('Loki');

    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam) {
      this.applyRecipientName(nameParam);
    }

    if (urlParams.get('scene') === 'teddy' || urlParams.get('testScene') === 'reveal') {
      this.currentScreen = 'teddy';
      if (this.deliveryScreen) {
        this.deliveryScreen.classList.remove('active');
        this.deliveryScreen.style.display = 'none';
      }
      if (this.teddyScreen) {
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
      if (this.floatingPolaroid) {
        this.floatingPolaroid.classList.add('visible');
        this.floatingPolaroid.style.transition = 'none';
        this.floatingPolaroid.style.opacity = '1';
      }
      if (this.cornerSignature) {
        this.cornerSignature.classList.add('visible');
        this.cornerSignature.style.transition = 'none';
        this.cornerSignature.style.opacity = '1';
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
