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

import { AmbientParticles } from './ambient-particles.js?v=12.0';
import { AsciiPigeon } from './ascii-pigeon.js?v=12.0';
import { AsciiEnvelope } from './ascii-envelope.js?v=13.0';
import { AsciiTeddy } from './ascii-teddy.js?v=15.0';
import { AudioManager } from './audio-fx.js?v=12.0';
import { 
  MultiLangNameProfile, 
  generateMultiLangName, 
  getLanguageList, 
  detectScript 
} from './name-multilang.js?v=14.0';
import { i18n, SUPPORTED_LOCALES } from './i18n.js?v=13.0';

class PigeonTeddyApp {
  constructor() {
    this.currentScreen = 'delivery'; // 'delivery' or 'teddy'
    this.isTransitioning = false;

    // Load or initialize Name Profile (Default: 'Loki')
    this.nameProfile = MultiLangNameProfile.load() || new MultiLangNameProfile('Loki');
    this.recipientName = this.nameProfile.originalName;
    this.multiLangData = this.nameProfile.transliterations;

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
    this.initI18n();
    this.initRenderers();
    this.initInteractions();
    this.start();
  }

  initElements() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.deliveryScreen = document.getElementById('delivery-screen');
    this.teddyScreen = document.getElementById('teddy-screen');

    // Language Dropdown elements
    this.langSelectorWrapper = document.getElementById('lang-selector-wrapper');
    this.langSelectorBtn = document.getElementById('lang-selector-btn');
    this.langFlag = document.getElementById('lang-flag');
    this.langLabel = document.getElementById('lang-label');
    this.langDropdown = document.getElementById('lang-dropdown');

    // Delivery Screen elements
    this.deliveryScreen = document.getElementById('delivery-screen');
    this.pigeonCanvas = document.getElementById('pigeon-canvas');
    this.envelopeCanvas = document.getElementById('envelope-canvas');
    this.envelopeHint = document.getElementById('envelope-hint');
    this.unsealBtn = document.getElementById('unseal-btn');
    this.unsealSubcaption = document.getElementById('unseal-subcaption');

    // First Screen: Name Prompt Modal
    this.nameModal = document.getElementById('name-modal');
    this.nameForm = document.getElementById('name-form');
    this.nameInput = document.getElementById('recipient-name-input');
    this.btnConfirmName = document.getElementById('btn-confirm-name');

    // Teddy Screen elements
    this.experienceHeaderBadge = document.getElementById('experience-header-badge');
    this.teddyCanvas = document.getElementById('teddy-canvas');
    this.teddySelectorBar = document.getElementById('teddy-selector-bar');
    this.headerNameDisplay = document.getElementById('header-name-display');

    this.giftActionCard = document.getElementById('gift-action-card');
    this.cardName = document.getElementById('card-name');

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

  initI18n() {
    // Populate Language dropdown
    if (this.langDropdown) {
      this.langDropdown.innerHTML = SUPPORTED_LOCALES.map(loc => `
        <button class="lang-option ${loc.code === i18n.currentLocale ? 'active' : ''}" 
                data-locale="${loc.code}" 
                type="button" 
                role="menuitem">
          <span>${loc.flag} ${loc.name}</span>
          <span class="lang-opt-native">${loc.native}</span>
        </button>
      `).join('');
    }

    // Subscribe to language changes
    i18n.subscribe((locale) => {
      this.updateLanguageUI(locale);
      this.applyTranslations();
    });

    this.updateLanguageUI(i18n.currentLocale);
    this.applyTranslations();
  }

  updateLanguageUI(localeCode) {
    const loc = SUPPORTED_LOCALES.find(l => l.code === localeCode) || SUPPORTED_LOCALES[0];
    if (this.langFlag) this.langFlag.textContent = loc.flag;
    if (this.langLabel) this.langLabel.textContent = loc.native;

    if (this.langDropdown) {
      this.langDropdown.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-locale') === localeCode);
      });
    }
  }

  applyTranslations() {
    // Top Header Badge
    const headerTitleSpan = this.experienceHeaderBadge?.querySelector('span:nth-child(2)');
    if (headerTitleSpan) headerTitleSpan.textContent = i18n.t('header_crafted_for');

    // Action Card
    const cardBadge = this.giftActionCard?.querySelector('.card-sparkle-pill');
    if (cardBadge) cardBadge.textContent = i18n.t('card_badge');

    const cardSub1 = document.getElementById('gift-card-sub1');
    if (cardSub1) cardSub1.textContent = i18n.t('card_sub1');

    const cardSub2 = document.getElementById('gift-card-sub2');
    if (cardSub2) cardSub2.textContent = i18n.t('card_sub2');

    // Action Buttons
    if (this.btnSaveGift) this.btnSaveGift.querySelector('.btn-text').textContent = i18n.t('btn_save_gift');
    if (this.btnMakeWave) this.btnMakeWave.querySelector('.btn-text').textContent = i18n.t('btn_make_wave');
    if (this.btnPulseHeart) this.btnPulseHeart.querySelector('.btn-text').textContent = i18n.t('btn_pulse_heart');
    if (this.btnExploreWorld) this.btnExploreWorld.querySelector('.btn-text').textContent = i18n.t('btn_explore_world');
    if (this.replayBtn) this.replayBtn.textContent = i18n.t('btn_replay');

    // Teddy Selector Tabs
    if (this.teddySelectorBar) {
      const tabs = this.teddySelectorBar.querySelectorAll('.teddy-tab-btn');
      tabs.forEach((tab, idx) => {
        const label = tab.querySelector('.tab-label');
        if (label) label.textContent = i18n.t(`tab_teddy_${idx}`);
      });
    }

    // Delivery Screen CTA
    if (this.unsealBtn) {
      const btnText = this.unsealBtn.querySelector('span:first-child');
      if (btnText) btnText.textContent = i18n.t('envelope_touch_seal');
    }
    if (this.envelopeHint) this.envelopeHint.textContent = i18n.t('envelope_hint');
    if (this.unsealSubcaption) this.unsealSubcaption.textContent = i18n.t('envelope_subcaption');

    // Initial Name Modal
    const modalBadge = document.querySelector('.name-modal-badge');
    if (modalBadge) modalBadge.textContent = i18n.t('modal_badge');

    const modalTitle = document.querySelector('.name-modal-title');
    if (modalTitle) modalTitle.textContent = i18n.t('modal_title');

    const modalSub = document.querySelector('.name-modal-subtitle');
    if (modalSub) modalSub.textContent = i18n.t('modal_sub');

    if (this.nameInput) this.nameInput.placeholder = i18n.t('modal_placeholder');

    const previewLbl = document.querySelector('.preview-label');
    if (previewLbl) previewLbl.textContent = i18n.t('modal_preview_label');

    if (this.btnConfirmName) {
      const span = this.btnConfirmName.querySelector('span:nth-child(2)');
      if (span) span.textContent = i18n.t('modal_btn_confirm');
    }

    // Refresh recipient displays
    this.refreshDisplays();
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
    this.nameModal.removeAttribute('inert');
    this.nameModal.classList.add('visible');
    this.nameModal.removeAttribute('aria-hidden');
    if (this.nameInput) {
      this.nameInput.value = this.recipientName || 'Loki';
      setTimeout(() => this.nameInput.focus(), 150);
    }
  }

  closeNameModal() {
    if (!this.nameModal) return;
    if (document.activeElement && this.nameModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    this.nameModal.classList.remove('visible');
    this.nameModal.setAttribute('aria-hidden', 'true');
    this.nameModal.setAttribute('inert', '');
  }

  openWorldModal() {
    if (!this.worldModal) return;
    this.worldModal.removeAttribute('inert');
    this.worldModal.classList.add('visible');
    this.worldModal.removeAttribute('aria-hidden');
  }

  closeWorldModal() {
    if (!this.worldModal) return;
    if (document.activeElement && this.worldModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    this.worldModal.classList.remove('visible');
    this.worldModal.setAttribute('aria-hidden', 'true');
    this.worldModal.setAttribute('inert', '');
  }

  applyRecipientProfile(profile) {
    this.nameProfile = profile;
    this.recipientName = profile.originalName;
    this.multiLangData = profile.transliterations;
    this.nameProfile.save();
    this.refreshDisplays();
  }

  applyRecipientName(rawName) {
    const clean = String(rawName || 'Loki').normalize('NFC').trim() || 'Loki';
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

    // 4. Unicode Dynamic Signature
    this.updateAsciiSignature(displayName);
  }

  updateAsciiSignature(name) {
    if (!this.cornerSignature) return;
    const cluster = this.cornerSignature.querySelector('.ascii-key-cluster');
    const bytesDiv = this.cornerSignature.querySelector('.ascii-sig-bytes');
    if (!cluster) return;

    // Unicode safe grapheme cluster handling
    let chars = [];
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      chars = Array.from(segmenter.segment(name), s => s.segment);
    } else {
      chars = Array.from(name);
    }

    // Limit to max 16 clusters for graceful styling
    chars = chars.slice(0, 16);

    cluster.innerHTML = `
      <div class="ascii-key-word" dir="auto">
        ${chars.map(ch => `<span class="ascii-key">${ch}</span>`).join('')}
      </div>
    `;

    if (bytesDiv) {
      const hexBytes = chars
        .map(ch => ch.codePointAt(0).toString(16).toUpperCase().padStart(2, '0'))
        .slice(0, 8)
        .join(' ');
      bytesDiv.innerHTML = `<span class="ascii-code">UNICODE_KEY:</span> ${hexBytes} <span class="sig-star">✦</span>`;
    }
  }

  initInteractions() {
    // Language Dropdown open / close
    if (this.langSelectorBtn && this.langSelectorWrapper) {
      this.langSelectorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.langSelectorWrapper.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!this.langSelectorWrapper.contains(e.target)) {
          this.langSelectorWrapper.classList.remove('open');
        }
      });
    }

    // Language Option click
    if (this.langDropdown) {
      this.langDropdown.addEventListener('click', (e) => {
        const opt = e.target.closest('.lang-option');
        if (!opt) return;
        const code = opt.getAttribute('data-locale');
        if (code) {
          i18n.setLocale(code);
          this.langSelectorWrapper?.classList.remove('open');
          this.showToast(`Switched interface language to ${opt.textContent.trim()} 🌐`);
          try {
            this.audioManager.playClick();
          } catch (err) {}
        }
      });
    }

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

    // Name input Enter key handler
    if (this.nameInput) {
      this.nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitInitialName();
        }
      });
    }

    // Confirm Initial Name Form Submit
    if (this.nameForm) {
      this.nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitInitialName();
      });
    }
    if (this.btnConfirmName) {
      this.btnConfirmName.addEventListener('click', () => {
        this.submitInitialName();
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
      });
    }

    // Action button handlers
    if (this.btnSaveGift) {
      this.btnSaveGift.addEventListener('click', () => this.saveGiftSnapshot());
    }
    if (this.btnMakeWave) {
      this.btnMakeWave.addEventListener('click', () => {
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerWave();
          this.showToast('Teddy is waving happily at you! 👋🧸');
          try {
            this.audioManager.playBloomChime();
          } catch (e) {}
        }
      });
    }
    if (this.btnPulseHeart) {
      this.btnPulseHeart.addEventListener('click', () => {
        if (this.teddyRenderer) {
          this.teddyRenderer.triggerHeartPulse();
          this.showToast("Teddy's glowing heart is pulsing with love! 💖");
          try {
            this.audioManager.playHeartBurst();
          } catch (e) {}
        }
      });
    }
    if (this.btnExploreWorld) {
      this.btnExploreWorld.addEventListener('click', () => {
        this.openWorldModal();
      });
    }
    if (this.btnCloseWorld) {
      this.btnCloseWorld.addEventListener('click', () => {
        this.closeWorldModal();
      });
    }
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.restartExperience());
    }
  }

  submitInitialName() {
    const rawVal = this.nameInput ? this.nameInput.value : '';
    this.applyRecipientName(rawVal || 'Loki');
    this.closeNameModal();

    if (this.currentScreen === 'delivery') {
      try {
        this.audioManager.playHeartBurst();
        this.audioManager.playBloomChime();
      } catch (e) {}

      if (this.envelopeRenderer) {
        this.envelopeRenderer.triggerClick();
      } else {
        this.transitionToTeddy();
      }
    } else {
      this.showToast(`Updated name to ${this.recipientName}! ✨`);
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

      // Title & dedication overlay
      sCtx.fillStyle = '#ffd700';
      sCtx.font = 'bold 36px "Inter", "Cinzel", serif';
      sCtx.textAlign = 'center';
      sCtx.fillText(`✦ SPECIALLY CRAFTED FOR ${this.recipientName} ✦`, w * 0.5, 90);

      sCtx.fillStyle = '#ff7b9c';
      sCtx.font = '22px "Inter", sans-serif';
      sCtx.fillText('Sending you warmth, comfort, and happiness. ❤️', w * 0.5, 135);

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
        this.teddyScreen.style.display = 'flex';
        this.teddyScreen.classList.add('active');
      }
      if (this.giftActionCard) {
        this.giftActionCard.classList.remove('visible');
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
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam) {
      this.applyRecipientName(nameParam);
    } else {
      this.refreshDisplays();
    }

    const langParam = urlParams.get('lang');
    if (langParam) {
      i18n.setLocale(langParam);
    }

    if (urlParams.get('scene') === 'teddy' || urlParams.get('screen') === 'teddy' || urlParams.get('testScene') === 'reveal') {
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
