/**
 * teddyExperienceController.js
 * ============================================================================
 * Master Experience State Machine for the Full-Screen Cinematic Personalized
 * Teddy Bear Experience.
 *
 * Sequence of 10 Stages:
 * 1. INTRO (Scene 1): Midnight cosmos, particle universe, ambient depth
 * 2. MAGIC_ANIMATION (Scene 2): Stars converge, heart sketch, morphs to gift box,
 *    typewriter: "Hey there, stranger..." -> "Someone has prepared a little surprise for you."
 * 3. INVITATION (Scene 3): Gift box slightly ajar with peeking teddy silhouette,
 *    prompts: "Would you like me to create a special teddy bear just for you?"
 *    Buttons: "YES! CREATE MY TEDDY ❤️" vs "MAYBE LATER"
 * 4. NAME_ENTRY (Scene 4): Collects visitor's name for chest badge & arch
 * 5. PHOTO_UPLOAD_OR_SKIP (Scene 5): Optional photo with instant Polaroid preview or skip
 * 6. TEDDY_GENERATION (Scene 6): "Crafting your special teddy bear..." + procedural bloom
 * 7. TEDDY_REVEAL (Scene 7): Fully bloomed ASCII teddy with idle physics & custom badge
 * 8. PHOTO_INTEGRATION (Scene 8): Floating Polaroid beside teddy with heartfelt caption
 * 9. FINAL_GIFT (Scene 9): Final interactive dialog, Save snapshot, Wave trigger, Watch again
 * 10. PORTFOLIO (Scene 10): Camera warp into developer portfolio, with revisit pill
 * ============================================================================
 */

class TeddyExperienceController {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.particleWorld = options.particleWorld;
    this.introScene = options.introScene;
    this.invitation = options.invitation;
    this.personalization = options.personalization;
    this.renderer = options.renderer;
    this.anim = options.animation;
    this.sound = options.sound;

    // Current State
    this.state = "INTRO";
    this.visitorName = "Friend";
    this.userPhoto = null;
    this.userPhotoUrl = null;

    // Generation progress
    this.generationTimer = 0;
    this.generationSteps = [
      "Gathering stardust and sweet dreams...",
      "Weaving soft plush ASCII fur...",
      "Embroidering your name with pure love...",
      "Lighting up the radiant chest heart...",
      "Bringing your teddy bear to life! ✨"
    ];
    this.generationStepIndex = 0;

    // DOM UI Elements
    this.viewport = document.getElementById("experienceViewport");
    this.introOverlay = document.getElementById("introOverlay");
    this.btnSkipIntro = document.getElementById("btnSkipIntro");
    this.generatingOverlay = document.getElementById("generatingOverlay");
    this.generatingStepText = document.getElementById("generatingStepText");

    this.topControls = document.getElementById("topControlsBar");
    this.btnSoundToggle = document.getElementById("btnSoundToggle");
    this.soundIcon = document.getElementById("soundIcon");

    this.portfolioScreen = document.getElementById("portfolioScreen");
    this.btnBackToTeddy = document.getElementById("btnBackToTeddy");

    // Initialize Sub-module: Gift Reveal
    this.giftReveal = new TeddyGiftReveal({
      canvas: this.canvas,
      renderer: this.renderer,
      animation: this.anim,
      sound: this.sound,
      onExplore: () => this.transitionToPortfolio(),
      onRestart: () => this.restart()
    });

    this.bindEvents();
  }

  bindEvents() {
    // Sound Toggle
    if (this.btnSoundToggle) {
      this.btnSoundToggle.addEventListener("click", () => {
        const isSoundOn = this.sound.toggle();
        if (this.soundIcon) {
          this.soundIcon.textContent = isSoundOn ? "🔊" : "🔇";
        }
      });
    }

    // Skip Intro
    if (this.btnSkipIntro) {
      this.btnSkipIntro.addEventListener("click", () => {
        if (this.state === "INTRO") {
          this.introScene.skip();
        }
      });
    }

    // Theme selector pills
    document.querySelectorAll(".theme-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const themeKey = pill.getAttribute("data-theme");
        if (themeKey && this.anim) {
          this.sound.init();
          this.sound.playChime([720, 960], 0.25);
          this.anim.setTheme(themeKey);

          document.querySelectorAll(".theme-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
        }
      });
    });

    // Revisit Teddy from Portfolio
    if (this.btnBackToTeddy) {
      this.btnBackToTeddy.addEventListener("click", () => {
        this.revisitTeddy();
      });
    }

    // Interactive canvas pointer tracking
    const handlePointer = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      const rect = this.canvas.getBoundingClientRect();
      this.anim.setMouse(clientX, clientY, rect);
    };

    window.addEventListener("mousemove", handlePointer, { passive: true });
    window.addEventListener("touchmove", handlePointer, { passive: true });

    this.canvas.addEventListener("click", () => {
      if (this.state === "TEDDY_REVEAL" || this.state === "FINAL_GIFT") {
        this.sound.init();
        this.anim.triggerBounce();
        this.sound.playChime([680, 850], 0.2);
      }
    });

    // Sub-modules Callbacks
    this.personalization.onNameSubmitted = (name) => {
      this.visitorName = name;
      this.anim.setName(this.visitorName);
      this.startPhotoUpload();
    };

    this.personalization.onPhotoSubmitted = (photoImg, photoUrl) => {
      this.userPhoto = photoImg;
      this.userPhotoUrl = photoUrl;
      this.renderer.setPhoto(photoImg, photoUrl);
      this.startTeddyGeneration();
    };

    this.personalization.onPhotoSkipped = () => {
      this.userPhoto = null;
      this.userPhotoUrl = null;
      this.renderer.setPhoto(null, null);
      this.startTeddyGeneration();
    };
  }

  /**
   * Boot the experience with Scene 1: Cosmic Intro
   */
  start() {
    // Check for testing / deep link fast-forward URL parameters
    const urlParams = (typeof window !== "undefined" && window.location) ? new URLSearchParams(window.location.search) : null;
    if (urlParams && urlParams.get("testScene") === "reveal") {
      const testName = urlParams.get("name") || "Loki";
      const withPhoto = urlParams.get("photo") !== "0";
      this.fastForwardToReveal(testName, withPhoto);
      return;
    } else if (urlParams && urlParams.get("testScene") === "portfolio") {
      this.fastForwardToPortfolio();
      return;
    }

    this.state = "INTRO";
    this.anim.bloomProgress = 0.0;
    this.anim.isBloomed = false;

    if (this.introOverlay) this.introOverlay.classList.remove("hidden");
    if (this.topControls) this.topControls.classList.remove("hidden");

    this.introScene.start();
  }

  fastForwardToReveal(name = "Loki", withPhoto = true) {
    this.visitorName = name;
    this.anim.setName(name);
    this.anim.bloomProgress = 1.0;
    this.anim.isBloomed = true;

    if (this.introOverlay) this.introOverlay.classList.add("hidden");
    if (this.invitation && this.invitation.container) this.invitation.container.classList.add("hidden");
    if (this.personalization && this.personalization.nameSection) this.personalization.nameSection.classList.add("hidden");
    if (this.personalization && this.personalization.photoSection) this.personalization.photoSection.classList.add("hidden");
    if (this.generatingOverlay) this.generatingOverlay.classList.add("hidden");
    if (this.topControls) this.topControls.classList.remove("hidden");

    if (withPhoto) {
      const c = document.createElement("canvas");
      c.width = 240;
      c.height = 240;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ff4d79";
      ctx.fillRect(0, 0, 240, 240);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name.toUpperCase() + " ✨", 120, 120);
      const samplePhotoUrl = c.toDataURL("image/png");
      const sampleImg = new Image();
      sampleImg.src = samplePhotoUrl;
      this.userPhoto = sampleImg;
      this.userPhotoUrl = samplePhotoUrl;
      this.renderer.setPhoto(sampleImg, samplePhotoUrl);
    } else {
      this.userPhoto = null;
      this.userPhotoUrl = null;
      this.renderer.setPhoto(null, null);
    }

    this.state = "FINAL_GIFT";
    this.renderer.setupCanvas();
    this.giftReveal.start(this.visitorName, this.userPhoto, this.userPhotoUrl);
  }

  fastForwardToPortfolio() {
    this.state = "PORTFOLIO";
    if (this.viewport) this.viewport.classList.add("hidden");
    if (this.portfolioScreen) {
      this.portfolioScreen.classList.remove("hidden");
    }
  }

  /**
   * Scene 2 ends -> Transition to Scene 3: Invitation
   */
  startInvitation() {
    this.state = "INVITATION";
    if (this.introOverlay) this.introOverlay.classList.add("hidden");
    this.invitation.start();
  }

  /**
   * Scene 3 YES clicked -> Transition to Scene 4: Name Entry
   */
  startNameEntry() {
    this.state = "NAME_ENTRY";
    this.sound.init();
    this.sound.playChime([659, 880], 0.3);
    this.personalization.startNameEntry();
  }

  /**
   * Scene 4 Name submitted -> Transition to Scene 5: Photo Upload
   */
  startPhotoUpload() {
    this.state = "PHOTO_UPLOAD";
    this.sound.playChime([783, 1046], 0.3);
    this.personalization.startPhotoUpload();
  }

  /**
   * Scene 5 Finished -> Transition to Scene 6: Teddy Generation
   */
  async startTeddyGeneration() {
    this.state = "TEDDY_GENERATION";
    this.sound.init();
    this.sound.playMagicChime();

    if (this.generatingOverlay) {
      this.generatingOverlay.classList.remove("hidden");
      this.generatingOverlay.classList.add("fade-in");
    }

    this.generationTimer = 0;
    this.generationStepIndex = 0;
    this.updateGenerationText();

    // Start bloom reveal
    this.anim.bloomProgress = 0.0;
  }

  updateGenerationText() {
    if (!this.generatingStepText) return;
    if (this.generationStepIndex < this.generationSteps.length) {
      let txt = this.generationSteps[this.generationStepIndex];
      txt = txt.replace("your name", `${this.visitorName}'s name`);
      this.generatingStepText.textContent = txt;
      this.generationStepIndex++;
    }
  }

  /**
   * Scene 6 Bloom completes -> Transition to Scene 7, 8, 9
   */
  finishTeddyGeneration() {
    this.state = "TEDDY_REVEAL";
    this.anim.bloomProgress = 1.0;
    this.anim.isBloomed = true;

    if (this.generatingOverlay) {
      this.generatingOverlay.classList.add("fade-out");
      setTimeout(() => this.generatingOverlay.classList.add("hidden"), 500);
    }

    this.sound.playChime([523, 659, 783, 1046], 0.7);

    // After brief reveal pause, show Scene 9 gift card
    setTimeout(() => {
      this.state = "FINAL_GIFT";
      this.giftReveal.start(this.visitorName, this.userPhoto, this.userPhotoUrl);
    }, 1200);
  }

  /**
   * Scene 10: Cosmic Dimensional Warp to Creative Multiverse
   */
  transitionToPortfolio() {
    this.state = "PORTAL";
    this.renderer.portalActive = true;
    this.renderer.portalProgress = 0.0;

    if (this.sound) {
      this.sound.init();
      if (typeof this.sound.playWarpSweep === "function") {
        this.sound.playWarpSweep();
      }
    }

    let p = 0;
    const portalDuration = 1.6;
    const startT = performance.now();

    const portalStep = (now) => {
      p = Math.min(1.0, (now - startT) / (portalDuration * 1000));
      this.renderer.portalProgress = p;

      if (p < 1.0) {
        requestAnimationFrame(portalStep);
      } else {
        // Complete transition to portfolio
        this.renderer.portalActive = false;
        this.state = "PORTFOLIO";

        if (this.viewport) this.viewport.classList.add("hidden");
        if (this.portfolioScreen) {
          this.portfolioScreen.classList.remove("hidden");
          this.portfolioScreen.classList.add("fade-in");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    requestAnimationFrame(portalStep);
  }

  /**
   * Return Across Space from Multiverse to Teddy Bear Realm
   */
  revisitTeddy() {
    if (this.sound) {
      this.sound.init();
      if (typeof this.sound.playMagicChime === "function") {
        this.sound.playMagicChime();
      }
    }

    if (this.portfolioScreen) {
      this.portfolioScreen.classList.add("fade-out");
      setTimeout(() => {
        this.portfolioScreen.classList.add("hidden");
        this.portfolioScreen.classList.remove("fade-out");
      }, 350);
    }

    if (this.viewport) {
      this.viewport.classList.remove("hidden");
      this.viewport.classList.add("fade-in");
    }

    this.state = "FINAL_GIFT";
    this.anim.bloomProgress = 1.0;
    this.anim.isBloomed = true;
    this.renderer.setupCanvas();

    if (this.topControls) this.topControls.classList.remove("hidden");
    this.giftReveal.start(this.visitorName, this.userPhoto, this.userPhotoUrl);
  }

  /**
   * Restart from Scene 1
   */
  restart() {
    this.giftReveal.hide();
    this.start();
  }

  /**
   * Master Update Step (called in RAF loop)
   */
  update(dt) {
    if (this.state === "INTRO") {
      this.particleWorld.update(dt);
      this.introScene.update(dt);
    } else if (this.state === "INVITATION") {
      this.particleWorld.update(dt);
      this.invitation.update(dt);
    } else if (this.state === "NAME_ENTRY" || this.state === "PHOTO_UPLOAD") {
      this.particleWorld.update(dt);
    } else if (this.state === "TEDDY_GENERATION") {
      this.particleWorld.update(dt);
      this.anim.update(dt);

      this.generationTimer += dt;
      if (this.generationTimer >= 1.4) {
        this.generationTimer = 0;
        this.updateGenerationText();
      }

      // Advance bloom
      const bloomRate = 1.0 / 6.5;
      this.anim.bloomProgress = Math.min(1.0, this.anim.bloomProgress + dt * bloomRate);

      if (this.anim.bloomProgress >= 1.0) {
        this.finishTeddyGeneration();
      }
    } else if (this.state === "TEDDY_REVEAL" || this.state === "FINAL_GIFT" || this.state === "PORTAL") {
      this.anim.update(dt);
    }
  }

  /**
   * Master Render Step (called in RAF loop)
   */
  render() {
    if (this.state === "PORTFOLIO") return;

    if (this.state === "INTRO") {
      this.particleWorld.render();
      this.introScene.render();
    } else if (this.state === "INVITATION") {
      this.particleWorld.render();
      this.invitation.render();
    } else if (this.state === "NAME_ENTRY" || this.state === "PHOTO_UPLOAD") {
      this.particleWorld.render();
    } else if (this.state === "TEDDY_GENERATION") {
      const u = this.anim.bloomProgress;
      const easedBloom = u * u * (3.0 - 2.0 * u);
      this.renderer.render(easedBloom, false);
    } else if (this.state === "TEDDY_REVEAL" || this.state === "FINAL_GIFT" || this.state === "PORTAL") {
      this.renderer.render(1.0, true);
    }
  }
}

window.TeddyExperienceController = TeddyExperienceController;

