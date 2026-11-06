/**
 * teddyGiftInteractions.js
 * ============================================================================
 * Interactive Experience Controller, Dialogue Sequencer, Sound Synthesis,
 * and Seamless Portfolio Portal Transitions.
 * ============================================================================
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.init();
    this.muted = !this.muted;
    if (!this.muted) {
      this.playChime([523.25, 659.25, 783.99], 0.35); // C Major chord
    }
    return !this.muted;
  }

  playChime(notes = [659.25, 880.0], duration = 0.45) {
    if (this.muted || !this.ctx) return;
    try {
      const freqs = Array.isArray(notes) ? notes : [notes];
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.08 + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + duration);
      });
    } catch (e) {}
  }

  playHugMelody() {
    if (this.muted || !this.ctx) return;
    // Ascending soft romantic harp arpeggio
    this.playChime([392.0, 523.25, 659.25, 783.99, 1046.5], 0.6);
  }
}

class TeddyGiftInteractions {
  constructor(giftScene, photoFrame, visitorName = "Someone Special") {
    this.scene = giftScene;
    this.photoFrame = photoFrame;
    this.name = visitorName;
    this.sound = new SoundSynthesizer();

    // DOM Elements
    this.greetingOverlay = document.getElementById("giftGreetingOverlay");
    this.titleElement = document.getElementById("greetingMainTitle");
    this.subElement = document.getElementById("greetingSubMessage");
    this.highlightElement = document.getElementById("greetingHighlightLine");
    this.nameBadgeElement = document.getElementById("greetingNameBadge");

    this.btnExplore = document.getElementById("btnExploreWorld");
    this.btnHug = document.getElementById("btnTeddyHug");
    this.btnSoundToggle = document.getElementById("btnSoundToggle");
    this.soundIcon = document.getElementById("soundIcon");
    this.toastElement = document.getElementById("giftToast");

    // Secret Badge Modal
    this.secretModal = document.getElementById("secretBadgeModal");
    this.btnCloseSecret = document.getElementById("btnCloseSecret");

    // Portfolio Screen Integration
    this.portfolioScreen = document.getElementById("portfolioScreen");
    this.portfolioGreeting = document.getElementById("portfolioGreeting");
    this.btnBackToTeddy = document.getElementById("btnBackToTeddy");
    this.welcomeScreen = document.getElementById("welcomeScreen");
    this.experienceScreen = document.getElementById("experienceScreen");

    this.initEvents();
  }

  initEvents() {
    // Sound Toggle
    if (this.btnSoundToggle) {
      this.btnSoundToggle.addEventListener("click", () => {
        const isSoundOn = this.sound.toggle();
        if (this.soundIcon) {
          this.soundIcon.textContent = isSoundOn ? "🔊" : "🔇";
        }
        this.showToast(isSoundOn ? "Sound enabled 🎵" : "Sound muted 🔇");
      });
    }

    // Theme selector pills
    document.querySelectorAll(".theme-pill-btn").forEach((pill) => {
      pill.addEventListener("click", () => {
        const targetTheme = pill.getAttribute("data-theme");
        if (targetTheme && this.scene) {
          this.sound.init();
          this.sound.playChime(784, 0.25);
          this.scene.setTheme(targetTheme);

          document.querySelectorAll(".theme-pill-btn").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          this.showToast(`Switched theme ✨`);
        }
      });
    });

    // Make the Teddy Hug You Button (Section 7)
    if (this.btnHug) {
      this.btnHug.addEventListener("click", () => {
        this.sound.init();
        this.sound.playHugMelody();
        if (this.scene && this.scene.animation) {
          this.scene.animation.triggerHug();
        }
        this.showToast(`Teddy gives you the warmest, softest hug! 🤗💖`);
      });
    }

    // Open Your Little World (Transition to Portfolio)
    if (this.btnExplore) {
      this.btnExplore.addEventListener("click", () => {
        this.sound.init();
        this.sound.playChime([523.25, 783.99, 1046.5], 0.7);
        this.triggerPortfolioTransition();
      });
    }

    // Revisit Teddy from Portfolio
    if (this.btnBackToTeddy) {
      this.btnBackToTeddy.addEventListener("click", () => {
        this.revisitTeddy();
      });
    }

    // Raycast Event from Scene: Secret Badge Clicked (Section 8)
    this.scene.onBadgeClicked = () => {
      this.sound.init();
      this.sound.playChime([880, 1046.5], 0.3);
      this.openSecretBadgeModal();
    };

    // Raycast Event from Scene: Teddy Body Clicked
    this.scene.onTeddyClicked = () => {
      this.sound.init();
      this.sound.playChime(660, 0.2);
      this.showToast(`Teddy loves you, ${this.name}! ✨`);
    };

    // Close Secret Badge Modal
    if (this.btnCloseSecret) {
      this.btnCloseSecret.addEventListener("click", () => {
        this.closeSecretBadgeModal();
      });
    }
  }

  /**
   * Starts Sequence & Floating Typewriter Greeting (Section 6)
   */
  startGreetingSequence() {
    if (this.nameBadgeElement) {
      this.nameBadgeElement.textContent = `✧ SPECIALLY CRAFTED FOR ${this.name.toUpperCase()} ✧`;
    }

    // Hook onto teddy sequence emergence
    this.scene.animation.onSequenceComplete = async () => {
      // Step 1: "Hey, [NAME]!"
      await this.typeWriter(`Hey, ${this.name}! ✨`, this.titleElement, 40);
      await this.delay(500);

      // Step 2: "I have a little surprise for you."
      await this.typeWriter("I have a little surprise for you.", this.subElement, 32);
      await this.delay(600);

      // Step 3: "This little friend was made especially for you. ❤️"
      await this.typeWriter("This little friend was made especially for you. ❤️", this.highlightElement, 32);
    };

    // Start 3D Scene animation
    this.scene.start();
  }

  showToast(msg) {
    if (!this.toastElement) return;
    this.toastElement.textContent = msg;
    this.toastElement.classList.add("show");
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toastElement.classList.remove("show");
    }, 2800);
  }

  openSecretBadgeModal() {
    if (this.secretModal) {
      this.secretModal.classList.add("open");
    }
  }

  closeSecretBadgeModal() {
    if (this.secretModal) {
      this.secretModal.classList.remove("open");
    }
  }

  /**
   * Smooth Cinematic Transition to Portfolio (Section 7)
   */
  triggerPortfolioTransition() {
    if (this.scene && this.scene.animation) {
      this.scene.animation.triggerWave();
    }

    // Camera rushes into portal
    const startZ = this.scene.camera.position.z;
    const startTime = performance.now();
    const duration = 1800;

    const animateTransition = (now) => {
      const elapsed = now - startTime;
      const prog = Math.min(1.0, elapsed / duration);
      const ease = prog * prog * prog; // Cubic ease in

      // Rush camera toward teddy & glowing heart
      this.scene.camera.position.z = startZ - ease * 6.5;
      this.scene.camera.position.y = 1.2 - ease * 0.4;
      this.scene.renderer.toneMappingExposure = 1.15 + ease * 3.5; // Flash burst

      if (prog < 1.0) {
        requestAnimationFrame(animateTransition);
      } else {
        this.finishPortfolioTransition();
      }
    };

    requestAnimationFrame(animateTransition);
  }

  finishPortfolioTransition() {
    if (this.experienceScreen) {
      this.experienceScreen.classList.add("hidden");
    }

    if (this.portfolioGreeting) {
      this.portfolioGreeting.textContent = `Welcome to My Creative World, ${this.name}! ✨`;
    }

    if (this.portfolioScreen) {
      this.portfolioScreen.classList.remove("hidden");
      this.portfolioScreen.classList.add("fade-in");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  revisitTeddy() {
    if (this.portfolioScreen) {
      this.portfolioScreen.classList.add("hidden");
    }

    if (this.experienceScreen) {
      this.experienceScreen.classList.remove("hidden");
    }

    if (this.scene) {
      this.scene.camera.position.set(0, 1.2, 9.2);
      this.scene.renderer.toneMappingExposure = 1.15;
      if (this.scene.animation) {
        this.scene.animation.triggerWave();
      }
    }
  }

  typeWriter(text, element, speed = 35) {
    if (!element) return Promise.resolve();
    return new Promise((resolve) => {
      element.textContent = "";
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < text.length) {
          element.textContent += text.charAt(idx);
          idx++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

window.TeddyGiftInteractions = TeddyGiftInteractions;

