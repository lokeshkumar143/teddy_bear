/**
 * teddyIntroScene.js
 * ============================================================================
 * Scene One & Scene Two: The Mysterious Cinematic Animation
 * Sequence:
 * 1. Stars converge towards center (t = 0..2.5s)
 * 2. Glowing pink cosmic core appears (t = 2..4s)
 * 3. Orbiting ember hearts circle around it (t = 3.5..5.5s)
 * 4. Light trails sketch a luminous cardioid heart (t = 5.0..7.5s)
 * 5. Heart morphs into a floating magical glowing gift box (t = 7..9.5s)
 * 6. Smooth typewriter narration:
 *    "Hey there, stranger..." -> "Someone has prepared a little surprise for you."
 * ============================================================================
 */

class TeddyIntroScene {
  constructor(canvas, particleWorld, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.world = particleWorld;
    this.onComplete = onComplete;

    this.time = 0;
    this.isActive = false;

    // Converging stars
    this.convergingStars = [];
    this.initConvergingStars(60);

    // Orbiting hearts
    this.orbitHearts = [];
    this.initOrbitHearts(8);

    // Heart drawing progress
    this.heartDrawProgress = 0;

    // Gift box morph progress
    this.boxMorphProgress = 0;

    // DOM Elements for typewriter narration
    this.narrationElement = document.getElementById("introNarrationText");
    this.introCard = document.getElementById("introCard");
  }

  initConvergingStars(count) {
    this.convergingStars = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 280 + Math.random() * 450;
      this.convergingStars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        speed: 120 + Math.random() * 140,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.1 + Math.random() * 0.7,
        color: Math.random() > 0.5 ? "#ff4d79" : "#ffffff"
      });
    }
  }

  initOrbitHearts(count) {
    this.orbitHearts = [];
    for (let i = 0; i < count; i++) {
      this.orbitHearts.push({
        angle: (i / count) * Math.PI * 2,
        radius: 65 + (i % 2) * 20,
        speed: 1.8 + (i % 3) * 0.4,
        size: 14 + (i % 2) * 6,
        glyph: i % 2 === 0 ? "♥" : "✧"
      });
    }
  }

  start() {
    this.isActive = true;
    this.time = 0;
    this.heartDrawProgress = 0;
    this.boxMorphProgress = 0;

    if (this.introCard) {
      this.introCard.classList.remove("hidden");
      this.introCard.classList.add("fade-in");
    }

    this.runNarration();
  }

  async runNarration() {
    await this.delay(600);
    if (!this.isActive) return;

    await this.typeWriter("Hey there, stranger...", this.narrationElement, 45);
    await this.delay(1600);
    if (!this.isActive) return;

    this.narrationElement.textContent = "";
    await this.typeWriter("Someone has prepared a little surprise for you.", this.narrationElement, 35);
  }

  skip() {
    this.isActive = false;
    if (this.introCard) this.introCard.classList.add("hidden");
    if (this.onComplete) this.onComplete();
  }

  update(dt) {
    if (!this.isActive) return;
    this.time += dt;

    // 1. Converging Stars
    for (const s of this.convergingStars) {
      const dist = Math.hypot(s.x, s.y);
      if (dist > 8) {
        s.x -= (s.x / dist) * s.speed * dt;
        s.y -= (s.y / dist) * s.speed * dt;
      }
    }

    // 2. Orbiting Hearts
    for (const h of this.orbitHearts) {
      h.angle += h.speed * dt;
    }

    // 3. Heart sketch progression (t = 4.5 -> 7.5s)
    if (this.time > 4.5) {
      this.heartDrawProgress = Math.min(1.0, (this.time - 4.5) / 2.8);
    }

    // 4. Gift box morph progression (t = 7.0 -> 9.2s)
    if (this.time > 7.0) {
      this.boxMorphProgress = Math.min(1.0, (this.time - 7.0) / 2.2);
    }

    // Sequence completion trigger
    if (this.time >= 9.6) {
      this.skip();
    }
  }

  render() {
    if (!this.isActive) return;
    const ctx = this.ctx;
    const cx = this.canvas.width / (2 * (window.devicePixelRatio || 1));
    const cy = this.canvas.height / (2 * (window.devicePixelRatio || 1)) - 30;

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Converging Stars
    if (this.time < 5.0) {
      for (const s of this.convergingStars) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * Math.min(1.0, this.time * 0.8);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // 2. Central Glowing Light Core (t > 1.8s)
    if (this.time > 1.8) {
      const coreAlpha = Math.min(1.0, (this.time - 1.8) * 0.8);
      const pulse = 1.0 + 0.12 * Math.sin(this.time * 4.0);
      const rad = 75 * pulse;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      grad.addColorStop(0, `rgba(255, 77, 121, ${coreAlpha * 0.85})`);
      grad.addColorStop(0.4, `rgba(255, 117, 151, ${coreAlpha * 0.4})`);
      grad.addColorStop(1, "rgba(255, 77, 121, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Orbiting Hearts (t > 3.2s)
    if (this.time > 3.2 && this.boxMorphProgress < 0.8) {
      const hAlpha = Math.min(1.0, (this.time - 3.2) * 0.8) * (1.0 - this.boxMorphProgress);
      ctx.font = 'bold 16px "Fira Code", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const h of this.orbitHearts) {
        const hx = Math.cos(h.angle) * h.radius;
        const hy = Math.sin(h.angle) * (h.radius * 0.45);
        ctx.fillStyle = `rgba(255, 130, 175, ${hAlpha})`;
        ctx.shadowColor = "rgba(255, 77, 121, 0.9)";
        ctx.shadowBlur = 12;
        ctx.fillText(h.glyph, hx, hy);
      }
      ctx.shadowBlur = 0;
    }

    // 4. Luminous Heart Sketch (t > 4.5s)
    if (this.heartDrawProgress > 0 && this.boxMorphProgress < 0.95) {
      const hFade = 1.0 - this.boxMorphProgress;
      ctx.strokeStyle = `rgba(255, 77, 121, ${0.9 * hFade})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "rgba(255, 77, 121, 0.85)";
      ctx.shadowBlur = 18;

      ctx.beginPath();
      const points = 100;
      const maxPts = Math.floor(points * this.heartDrawProgress);
      const scale = 110.0;

      for (let i = 0; i <= maxPts; i++) {
        const t = (i / points) * Math.PI * 2;
        // Parametric heart formula
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const px = (hx / 16) * scale;
        const py = (hy / 16) * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 5. Floating Glowing Gift Box (t > 7.0s)
    if (this.boxMorphProgress > 0) {
      const bAlpha = this.boxMorphProgress;
      const bobY = Math.sin(this.time * 2.5) * 8;
      ctx.translate(0, bobY);

      const bw = 150 * bAlpha;
      const bh = 125 * bAlpha;

      // Box body
      ctx.fillStyle = `rgba(180, 24, 75, ${0.85 * bAlpha})`;
      ctx.strokeStyle = `rgba(255, 215, 100, ${0.9 * bAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(255, 77, 121, 0.7)";
      ctx.shadowBlur = 20;

      ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

      // Gold Ribbon cross
      ctx.fillStyle = `rgba(255, 215, 100, ${0.9 * bAlpha})`;
      ctx.fillRect(-12 * bAlpha, -bh / 2, 24 * bAlpha, bh);
      ctx.fillRect(-bw / 2, -10 * bAlpha, bw, 20 * bAlpha);

      // Box Lid
      const lw = bw + 14 * bAlpha;
      const lh = 28 * bAlpha;
      ctx.fillStyle = `rgba(215, 30, 95, ${0.95 * bAlpha})`;
      ctx.fillRect(-lw / 2, -bh / 2 - lh, lw, lh);
      ctx.strokeRect(-lw / 2, -bh / 2 - lh, lw, lh);

      // Golden Ribbon Bow on top
      ctx.font = `bold ${32 * bAlpha}px "Fira Code", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(255, 235, 150, ${bAlpha})`;
      ctx.fillText("🎀", 0, -bh / 2 - lh - 8 * bAlpha);

      ctx.shadowBlur = 0;
    }

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

window.TeddyIntroScene = TeddyIntroScene;

