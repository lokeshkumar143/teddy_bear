/**
 * teddyExperience.js
 * ============================================================================
 * State machine, typewriter dialogue sequencer, user input handling,
 * audio-visual effects, theme switcher, and seamless portal transition.
 * ============================================================================
 */

class SoundEngine {
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
      this.playChime(750, 0.3);
    }
    return !this.muted;
  }

  playChime(freq = 600, duration = 0.4) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playHeartbeat() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(75, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }
}

class TeddyExperience {
  constructor(renderer, animation) {
    this.renderer = renderer;
    this.anim = animation;
    this.sound = new SoundEngine();

    // DOM Elements
    this.welcomeScreen = document.getElementById("welcomeScreen");
    this.typewriterText = document.getElementById("typewriterText");
    this.nameInputSection = document.getElementById("nameInputSection");
    this.visitorNameInput = document.getElementById("visitorNameInput");
    this.btnCreateTeddy = document.getElementById("btnCreateTeddy");
    this.inputError = document.getElementById("inputError");
    this.miniBearCanvas = document.getElementById("miniBearCanvas");

    this.experienceScreen = document.getElementById("experienceScreen");
    this.greetingDialog = document.getElementById("greetingDialog");
    this.greetingLine1 = document.getElementById("greetingLine1");
    this.greetingLine2 = document.getElementById("greetingLine2");
    this.greetingLine3 = document.getElementById("greetingLine3");
    this.greetingQuestion = document.getElementById("greetingQuestion");
    this.greetingActionGroup = document.getElementById("greetingActionGroup");
    this.btnExplore = document.getElementById("btnExplore");
    this.btnWave = document.getElementById("btnWave");
    this.waveToast = document.getElementById("waveToast");

    this.btnSoundToggle = document.getElementById("btnSoundToggle");
    this.soundIcon = document.getElementById("soundIcon");

    this.portfolioScreen = document.getElementById("portfolioScreen");
    this.portfolioGreeting = document.getElementById("portfolioGreeting");
    this.btnBackToTeddy = document.getElementById("btnBackToTeddy");

    // Flow State
    this.currentStep = "WELCOME"; // WELCOME -> BLOOMING -> GREETING -> PORTAL -> PORTFOLIO
    this.visitorName = "";
    this.isTyping = false;

    this.initEvents();
    this.startWelcomeSequence();
  }

  /**
   * Bind interactive UI events
   */
  initEvents() {
    // Enter key submits name
    this.visitorNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.submitName();
      }
    });

    this.btnCreateTeddy.addEventListener("click", () => {
      this.submitName();
    });

    // Make teddy wave button
    this.btnWave.addEventListener("click", () => {
      this.sound.init();
      this.anim.triggerWave();
      this.sound.playChime(880, 0.4);
      this.showWaveToast(`Teddy is waving at you, ${this.visitorName}! 👋✨`);
    });

    // Explore portfolio transition
    this.btnExplore.addEventListener("click", () => {
      this.sound.init();
      this.sound.playChime(580, 0.6);
      this.startPortalTransition();
    });

    // Sound toggle
    if (this.btnSoundToggle) {
      this.btnSoundToggle.addEventListener("click", () => {
        const isSoundOn = this.sound.toggle();
        if (this.soundIcon) {
          this.soundIcon.textContent = isSoundOn ? "🔊" : "🔇";
        }
      });
    }

    // Theme selector pills
    document.querySelectorAll(".theme-pill").forEach((pill) => {
      pill.addEventListener("click", (e) => {
        const targetTheme = pill.getAttribute("data-theme");
        if (targetTheme) {
          this.sound.init();
          this.sound.playChime(720, 0.2);
          this.anim.setTheme(targetTheme);

          document.querySelectorAll(".theme-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          this.showWaveToast(`Theme switched to ${this.anim.getTheme().name}! ✨`);
        }
      });
    });

    // Revisit Teddy from Portfolio
    if (this.btnBackToTeddy) {
      this.btnBackToTeddy.addEventListener("click", () => {
        this.revisitTeddy();
      });
    }

    // Interactive canvas mouse proximity tracking
    const mainCanvas = this.renderer.canvas;
    const handlePointer = (e) => {
      const rect = mainCanvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      this.anim.setMouse(clientX, clientY, rect);
    };

    window.addEventListener("mousemove", handlePointer, { passive: true });
    window.addEventListener("touchmove", handlePointer, { passive: true });

    mainCanvas.addEventListener("click", (e) => {
      this.sound.init();
      this.anim.triggerBounce();
      this.sound.playChime(700, 0.25);
      if (this.currentStep === "GREETING" || this.currentStep === "BLOOMING") {
        this.showWaveToast("Teddy sends you love! 💖✨");
      }
    });
  }

  /**
   * Step 1: Initial Welcome Typewriter Sequence
   */
  async startWelcomeSequence() {
    this.currentStep = "WELCOME";
    await this.delay(400);

    // Message 1
    await this.typeWriter("Hey! Someone special just arrived...", this.typewriterText);
    await this.delay(1200);

    // Message 2
    this.typewriterText.textContent = "";
    await this.typeWriter("Before I create something special, may I know your name?", this.typewriterText);

    // Fade in input section
    this.nameInputSection.classList.remove("hidden");
    this.nameInputSection.classList.add("fade-in");
    this.visitorNameInput.focus();
  }

  /**
   * Step 2: Validate and submit user name
   */
  submitName() {
    const rawVal = this.visitorNameInput.value.trim();
    if (!rawVal) {
      this.showInputError("Please enter your name to begin ✨");
      return;
    }
    if (rawVal.length < 2) {
      this.showInputError("Please enter at least 2 letters ✨");
      return;
    }

    this.inputError.classList.add("hidden");
    this.visitorName = rawVal;

    // Pass name to animation engine
    this.anim.setName(this.visitorName);

    // Trigger transition to Bloom Experience
    this.startBloomExperience();
  }

  showInputError(msg) {
    this.inputError.textContent = msg;
    this.inputError.classList.remove("hidden");
    this.visitorNameInput.classList.add("shake-error");
    setTimeout(() => {
      this.visitorNameInput.classList.remove("shake-error");
    }, 500);
  }

  /**
   * Step 3: Transition from Welcome Screen to ASCII Bloom
   */
  async startBloomExperience() {
    this.sound.init();
    this.sound.playChime(660, 0.5);

    // Fade out Welcome screen
    this.welcomeScreen.classList.add("fade-out");
    await this.delay(600);
    this.welcomeScreen.classList.add("hidden");

    // Reveal Experience Screen
    this.experienceScreen.classList.remove("hidden");
    this.experienceScreen.classList.add("fade-in");

    // Set State to BLOOMING
    this.currentStep = "BLOOMING";
    this.anim.bloomProgress = 0.0;
    this.anim.isBloomed = false;
  }

  /**
   * Step 4: Trigger Special Greeting Dialogue after Bloom
   */
  async triggerGreeting() {
    if (this.currentStep === "GREETING") return;
    this.currentStep = "GREETING";

    this.sound.playChime(880, 0.5);

    // Reveal dialogue box
    this.greetingDialog.classList.remove("hidden");
    this.greetingDialog.classList.add("slide-up");

    // Line 1: "Hey, [NAME]!"
    await this.typeWriter(`Hey, ${this.visitorName}! ✨`, this.greetingLine1, 45);
    await this.delay(500);

    // Line 2: "I made this little teddy just for you."
    await this.typeWriter("I made this little teddy just for you.", this.greetingLine2, 35);
    await this.delay(500);

    // Line 3: "Hope it makes you smile."
    await this.typeWriter("Hope it makes you smile. ❤️", this.greetingLine3, 35);
    await this.delay(600);

    // Line 4: "Shall we explore this little world together?"
    await this.typeWriter("Shall we explore this little world together?", this.greetingQuestion, 35);
    await this.delay(400);

    // Reveal Action Buttons
    this.greetingActionGroup.classList.remove("hidden");
    this.greetingActionGroup.classList.add("fade-in");

    // Initial friendly wave
    setTimeout(() => {
      this.anim.triggerWave();
    }, 600);
  }

  /**
   * Step 5: Magical Heart Portal Transition to Portfolio
   */
  async startPortalTransition() {
    this.currentStep = "PORTAL";

    // Hide greeting dialog
    this.greetingDialog.classList.add("fade-out");

    // Teddy waves goodbye
    this.anim.triggerWave();

    // Start Portal Expansion
    this.renderer.portalActive = true;
    this.renderer.portalProgress = 0.0;

    const portalDuration = 2200; // 2.2s explosion
    const startTime = performance.now();

    const animatePortal = (now) => {
      const elapsed = now - startTime;
      const prog = Math.min(1.0, elapsed / portalDuration);
      // Ease in cubic
      this.renderer.portalProgress = prog * prog * (3.0 - 2.0 * prog);

      if (prog < 1.0) {
        requestAnimationFrame(animatePortal);
      } else {
        this.finishPortalTransition();
      }
    };

    requestAnimationFrame(animatePortal);
  }

  /**
   * Finish Transition & Reveal Portfolio
   */
  finishPortalTransition() {
    this.currentStep = "PORTFOLIO";
    this.renderer.portalActive = false;

    // Hide experience screen
    this.experienceScreen.classList.add("hidden");

    // Personalize Portfolio Heading
    if (this.portfolioGreeting) {
      this.portfolioGreeting.textContent = `Welcome to My Creative World, ${this.visitorName}! ✨`;
    }

    // Reveal Portfolio Screen
    this.portfolioScreen.classList.remove("hidden");
    this.portfolioScreen.classList.add("fade-in");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Revisit Teddy Bear from Portfolio
   */
  revisitTeddy() {
    this.portfolioScreen.classList.add("hidden");
    this.experienceScreen.classList.remove("hidden");
    this.greetingDialog.classList.remove("fade-out");
    this.currentStep = "GREETING";
    this.anim.triggerWave();
  }

  showWaveToast(msg) {
    if (!this.waveToast) return;
    this.waveToast.textContent = msg;
    this.waveToast.classList.remove("hidden");
    this.waveToast.classList.add("show-toast");
    setTimeout(() => {
      this.waveToast.classList.remove("show-toast");
      this.waveToast.classList.add("hidden");
    }, 2800);
  }

  typeWriter(text, element, speed = 40) {
    return new Promise((resolve) => {
      element.textContent = "";
      let idx = 0;
      const cursorSpan = document.createElement("span");
      cursorSpan.className = "typewriter-cursor";
      element.appendChild(cursorSpan);

      const interval = setInterval(() => {
        if (idx < text.length) {
          element.insertBefore(document.createTextNode(text.charAt(idx)), cursorSpan);
          idx++;
        } else {
          clearInterval(interval);
          cursorSpan.remove();
          resolve();
        }
      }, speed);
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

window.TeddyExperience = TeddyExperience;
