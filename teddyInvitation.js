/**
 * teddyInvitation.js
 * ============================================================================
 * Scene Three: Ask Before Creating (The Interactive Invitation)
 * - Gift box floats with lid slightly ajar, emitting soft golden-pink light
 * - Subtle teddy silhouette peeks out with twinkling sparkle eyes
 * - Primary button: "YES! CREATE MY TEDDY ❤️"
 * - Secondary button: "MAYBE LATER"
 * - Reversible polite rejection without data collection
 * ============================================================================
 */

class TeddyInvitation {
  constructor(canvas, onAccept) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onAccept = onAccept;

    this.isActive = false;
    this.time = 0;
    this.boxOpen = 0.28; // slightly open
    this.isRejected = false;

    // DOM Elements
    this.container = document.getElementById("invitationContainer");
    this.titleElement = document.getElementById("inviteTitle");
    this.questionElement = document.getElementById("inviteQuestion");
    this.btnYes = document.getElementById("btnAcceptTeddy");
    this.btnLater = document.getElementById("btnDeclineTeddy");
    this.btnReady = document.getElementById("btnReadyNow");
    this.rejectedCard = document.getElementById("rejectedNotice");
    this.actionGroup = document.getElementById("inviteActionGroup");

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnYes) {
      this.btnYes.addEventListener("click", () => {
        this.accept();
      });
    }

    if (this.btnLater) {
      this.btnLater.addEventListener("click", () => {
        this.decline();
      });
    }

    if (this.btnReady) {
      this.btnReady.addEventListener("click", () => {
        this.reopen();
      });
    }
  }

  start() {
    this.isActive = true;
    this.time = 0;
    this.boxOpen = 0.28;
    this.isRejected = false;

    if (this.container) {
      this.container.classList.remove("hidden");
      this.container.classList.add("fade-in");
    }

    if (this.rejectedCard) this.rejectedCard.classList.add("hidden");
    if (this.actionGroup) this.actionGroup.classList.remove("hidden");

    this.runTypewriter();
  }

  async runTypewriter() {
    if (this.titleElement) {
      await this.typeWriter("I have a little surprise waiting for you...", this.titleElement, 35);
    }
    await this.delay(500);
    if (this.questionElement && this.isActive && !this.isRejected) {
      await this.typeWriter("Would you like me to create a special teddy bear just for you?", this.questionElement, 30);
    }
  }

  accept() {
    this.isActive = false;
    if (this.container) {
      this.container.classList.add("fade-out");
      setTimeout(() => this.container.classList.add("hidden"), 500);
    }
    if (this.onAccept) {
      this.onAccept();
    }
  }

  decline() {
    this.isRejected = true;
    this.boxOpen = 0.0; // closes box

    if (this.actionGroup) this.actionGroup.classList.add("hidden");
    if (this.titleElement) this.titleElement.textContent = "Take all the time you need ✨";
    if (this.questionElement) this.questionElement.textContent = "I'll be right here waiting whenever you're ready.";
    if (this.rejectedCard) {
      this.rejectedCard.classList.remove("hidden");
      this.rejectedCard.classList.add("fade-in");
    }
  }

  reopen() {
    this.isRejected = false;
    this.boxOpen = 0.28;
    if (this.rejectedCard) this.rejectedCard.classList.add("hidden");
    if (this.actionGroup) this.actionGroup.classList.remove("hidden");
    this.runTypewriter();
  }

  update(dt) {
    if (!this.isActive) return;
    this.time += dt;
  }

  render() {
    if (!this.isActive) return;
    const ctx = this.ctx;
    const cx = this.canvas.width / (2 * (window.devicePixelRatio || 1));
    const cy = this.canvas.height / (2 * (window.devicePixelRatio || 1)) - 60;

    ctx.save();
    ctx.translate(cx, cy);

    const bobY = Math.sin(this.time * 2.5) * 8;
    ctx.translate(0, bobY);

    const bw = 170;
    const bh = 140;

    // 1. Soft Warm Light Erupting from inside cracked lid
    if (this.boxOpen > 0.05) {
      const glowR = 120 * (1.0 + 0.1 * Math.sin(this.time * 4.0));
      const radGrad = ctx.createRadialGradient(0, -bh / 2, 0, 0, -bh / 2, glowR);
      radGrad.addColorStop(0, "rgba(255, 120, 160, 0.75)");
      radGrad.addColorStop(0.4, "rgba(255, 77, 121, 0.35)");
      radGrad.addColorStop(1, "rgba(255, 77, 121, 0)");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, -bh / 2, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Cute Teddy Silhouette peeking inside with twinkling sparkle eyes
      ctx.font = '16px "Fira Code", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 8;
      ctx.fillText("✦     ✦", 0, -bh / 2 - 12);
      ctx.font = '22px "Fira Code", monospace';
      ctx.fillStyle = "rgba(255, 140, 180, 0.85)";
      ctx.fillText("ʕ•ᴥ•ʔ", 0, -bh / 2 + 10);
      ctx.shadowBlur = 0;
    }

    // 2. Box Body
    ctx.fillStyle = "#881337";
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(255, 77, 121, 0.6)";
    ctx.shadowBlur = 24;
    ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

    // Golden Ribbon bands
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(-14, -bh / 2, 28, bh);
    ctx.fillRect(-bw / 2, -12, bw, 24);

    // 3. Hinged / Cracked Open Lid
    const lw = bw + 16;
    const lh = 30;
    const openOffset = this.boxOpen * 45;

    ctx.save();
    ctx.translate(0, -bh / 2);
    ctx.rotate(-this.boxOpen * 0.45); // slight angle

    ctx.fillStyle = "#9f1239";
    ctx.fillRect(-lw / 2, -lh - openOffset, lw, lh);
    ctx.strokeRect(-lw / 2, -lh - openOffset, lw, lh);

    // Bow
    ctx.font = '36px "Fira Code", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe066";
    ctx.fillText("🎀", 0, -lh - openOffset - 12);

    ctx.restore();
    ctx.restore();
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
        if (!this.isActive) {
          clearInterval(interval);
          resolve();
          return;
        }
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

window.TeddyInvitation = TeddyInvitation;

