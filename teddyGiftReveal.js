/**
 * teddyGiftReveal.js
 * ============================================================================
 * Scene Nine: Final Gift Presentation & Cinematic Actions
 *
 * Handles:
 * - Animated greeting presentation ("Hey, [NAME]! ✨")
 * - "SAVE MY GIFT 🎁" (High-Res Canvas Snapshot Download)
 * - "MAKE TEDDY WAVE 👋" (Interactive Wave Trigger + Sparkles)
 * - "WATCH AGAIN ↺" (Restart Experience)
 * - "EXPLORE MY WORLD ✨" (Smooth transition to Developer Portfolio)
 * - Floating Polaroid Photo Frame in DOM or Canvas
 * ============================================================================
 */

class TeddyGiftReveal {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.renderer = options.renderer;
    this.anim = options.animation;
    this.sound = options.sound;

    this.onExplore = options.onExplore || null;
    this.onRestart = options.onRestart || null;

    this.visitorName = "";
    this.userPhoto = null;

    // DOM Elements
    this.giftDialog = document.getElementById("giftRevealDialog");
    this.giftTitle = document.getElementById("giftTitle");
    this.giftSub1 = document.getElementById("giftSub1");
    this.giftSub2 = document.getElementById("giftSub2");
    this.giftActionGroup = document.getElementById("giftActionGroup");

    this.btnSaveGift = document.getElementById("btnSaveGift");
    this.btnWave = document.getElementById("btnGiftWave");
    this.btnRestart = document.getElementById("btnGiftRestart");
    this.btnExplore = document.getElementById("btnGiftExplore");
    this.toastEl = document.getElementById("giftToast");

    // Floating Polaroid Frame in Scene
    this.floatingPolaroid = document.getElementById("floatingPolaroidFrame");
    this.floatingImg = document.getElementById("floatingPolaroidImg");
    this.floatingCaption = document.getElementById("floatingPolaroidCaption");

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnWave) {
      this.btnWave.addEventListener("click", () => {
        if (this.sound) {
          this.sound.init();
          this.sound.playChime([880, 1174], 0.35);
        }
        if (this.anim) {
          this.anim.triggerWave();
        }
        this.showToast(`Teddy is waving at you, ${this.visitorName}! 👋❤️`);
      });
    }

    if (this.btnSaveGift) {
      this.btnSaveGift.addEventListener("click", () => {
        this.saveGiftSnapshot();
      });
    }

    if (this.btnRestart) {
      this.btnRestart.addEventListener("click", () => {
        if (this.onRestart) this.onRestart();
      });
    }

    if (this.btnExplore) {
      this.btnExplore.addEventListener("click", () => {
        if (this.sound) {
          this.sound.init();
          this.sound.playMagicChime();
        }
        if (this.onExplore) this.onExplore();
      });
    }

    if (this.floatingPolaroid) {
      this.floatingPolaroid.addEventListener("click", () => {
        this.floatingPolaroid.classList.toggle("enlarged");
      });
    }
  }

  start(name, photo = null, photoUrl = null) {
    this.visitorName = name || "Friend";
    this.userPhoto = photo;

    // Show floating Polaroid frame if photo is uploaded
    if (photoUrl && this.floatingPolaroid && this.floatingImg) {
      this.floatingImg.src = photoUrl;
      if (this.floatingCaption) {
        this.floatingCaption.textContent = `Best Friends Forever ❤️ ${this.visitorName}`;
      }
      this.floatingPolaroid.classList.remove("hidden");
      this.floatingPolaroid.classList.add("polaroid-float-in");
    } else if (this.floatingPolaroid) {
      this.floatingPolaroid.classList.add("hidden");
    }

    // Show Gift Dialog Card
    if (this.giftDialog) {
      this.giftDialog.classList.remove("hidden");
      this.giftDialog.classList.add("fade-in");
    }

    this.runRevealNarration();
  }

  async runRevealNarration() {
    if (this.giftTitle) {
      await this.typeWriter(`Hey, ${this.visitorName}! ✨`, this.giftTitle, 40);
    }
    await this.delay(300);

    if (this.giftSub1) {
      this.giftSub1.textContent = "This little teddy was made just for you.";
      this.giftSub1.classList.add("fade-in");
    }
    await this.delay(400);

    if (this.giftSub2) {
      this.giftSub2.textContent = "Sending you warmth, comfort, and happiness. ❤️";
      this.giftSub2.classList.add("fade-in");
    }
    await this.delay(300);

    if (this.giftActionGroup) {
      this.giftActionGroup.classList.remove("hidden");
      this.giftActionGroup.classList.add("fade-in");
    }
  }

  hide() {
    if (this.giftDialog) {
      this.giftDialog.classList.add("hidden");
    }
    if (this.floatingPolaroid) {
      this.floatingPolaroid.classList.add("hidden");
    }
  }

  /**
   * Save Gift Snapshot as PNG
   */
  saveGiftSnapshot() {
    if (!this.canvas) return;

    this.showToast("Preparing your special gift snapshot... 🎁");

    setTimeout(() => {
      try {
        // Ensure canvas renders the polaroid into the downloaded snapshot image
        if (this.renderer && this.userPhoto) {
          this.renderer.renderPolaroidToCanvas = true;
          this.renderer.render(1.0, true);
        }

        const dataUrl = this.canvas.toDataURL("image/png");

        if (this.renderer && this.userPhoto) {
          this.renderer.renderPolaroidToCanvas = false;
          this.renderer.render(1.0, true);
        }

        const link = document.createElement("a");
        const safeName = this.visitorName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "friend";
        link.download = `teddy_gift_for_${safeName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast("Gift saved to your downloads! 💖");
      } catch (err) {
        console.error("Save snapshot error:", err);
        this.showToast("Snapshot captured! Right-click or long-press canvas to save.");
      }
    }, 200);
  }

  showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove("hidden");
    this.toastEl.classList.add("toast-show");

    setTimeout(() => {
      this.toastEl.classList.remove("toast-show");
      setTimeout(() => this.toastEl.classList.add("hidden"), 300);
    }, 3000);
  }

  typeWriter(text, element, speed = 35) {
    if (!element) return Promise.resolve();
    return new Promise((resolve) => {
      element.textContent = "";
      let idx = 0;
      const cursor = document.createElement("span");
      cursor.className = "typewriter-cursor";
      element.appendChild(cursor);

      const interval = setInterval(() => {
        if (idx < text.length) {
          element.insertBefore(document.createTextNode(text.charAt(idx)), cursor);
          idx++;
        } else {
          clearInterval(interval);
          cursor.remove();
          resolve();
        }
      }, speed);
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

window.TeddyGiftReveal = TeddyGiftReveal;

