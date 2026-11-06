/**
 * teddyCharacter.js — Procedural Plush Teddy Character
 * ============================================================================
 * Draws a cute, detailed teddy bear using Canvas2D arcs and paths:
 * - Large rounded caramel-colored head (#D4956A)
 * - Two circular ears with darker inner ear (#C07850)
 * - Cream muzzle oval (#F5E6D3)
 * - Tiny dark brown nose ellipse
 * - Two large shiny eyes with white highlight specular dot
 * - Curved smile line
 * - Rounded body slightly smaller than head
 * - Two small rounded arms
 * - Two short legs with paw pads
 * - A small colorful scarf with visitor's name on it
 * Supports scale parameter for different sizes
 * ============================================================================
 */

class TeddyCharacter {
  constructor() {
    // Color palette
    this.colors = {
      fur:        '#D4956A',
      furShadow:  '#B87040',
      furLight:   '#E8B990',
      earInner:   '#C07850',
      muzzle:     '#F5E6D3',
      nose:       '#3D1F0A',
      eye:        '#1A0A00',
      eyeShine:   '#FFFFFF',
      eyeGlow:    '#6B3A2A',
      paw:        '#B87040',
      pawPad:     '#C07850',
      scarf1:     '#E05080',
      scarf2:     '#3080E0',
      scarfText:  '#FFFFFF'
    };
  }

  /**
   * Draw the full teddy at (cx, cy) with given scale (1.0 = default ~200px tall)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx   Center X
   * @param {number} cy   Center Y
   * @param {number} scale  Scale multiplier (default 1.0)
   * @param {string} name   Visitor's name for scarf text
   * @param {object} anim   Optional animation offsets { breathe, bounce, wave, blink, sway }
   */
  draw(ctx, cx, cy, scale = 1.0, name = '', anim = {}) {
    const s = scale;
    const breathe = anim.breathe || 0;
    const bounce = anim.bounce || 0;
    const blink = anim.blink || 0;
    const wave = anim.wave || false;
    const waveAngle = anim.waveAngle || 0;
    const sway = anim.sway || 0;

    const baseY = cy + bounce * s * 5;

    ctx.save();
    ctx.translate(cx, baseY);

    // Gentle body sway
    if (Math.abs(sway) > 0.001) {
      ctx.rotate(sway * 0.05);
    }

    // ── 1. Body ────────────────────────────────────────────────────────────
    const bodyW = 60 * s * (1 + breathe * 0.03);
    const bodyH = 70 * s * (1 + breathe * 0.015);
    const bodyY = 55 * s;

    ctx.save();
    this._drawBodyGradient(ctx, 0, bodyY, bodyW, bodyH);
    this._drawChestHeart(ctx, 0, bodyY + 14 * s, 22 * s);
    ctx.restore();

    // ── 2. Left Arm ───────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(-bodyW - 2 * s, bodyY - 10 * s);
    ctx.rotate(-0.3 + sway * 0.1);
    this._drawArm(ctx, s, false);
    ctx.restore();

    // ── 3. Right Arm (wave if waving) ────────────────────────────────────
    ctx.save();
    ctx.translate(bodyW + 2 * s, bodyY - 10 * s);
    if (wave) {
      ctx.rotate(waveAngle);
    } else {
      ctx.rotate(0.3 - sway * 0.1);
    }
    this._drawArm(ctx, s, true);
    ctx.restore();

    // ── 4. Legs ───────────────────────────────────────────────────────────
    this._drawLeg(ctx, s, -1, bodyY, bodyW);
    this._drawLeg(ctx, s,  1, bodyY, bodyW);

    // ── 5. Scarf ──────────────────────────────────────────────────────────
    const scarfY = bodyY - bodyH * 0.42;
    this._drawScarf(ctx, s, scarfY, name, bodyW);

    // ── 6. Head ───────────────────────────────────────────────────────────
    const headR = 52 * s;
    const headY = -headR * 0.1;
    this._drawHead(ctx, s, headY, headR, blink);

    // ── 7. Ears ───────────────────────────────────────────────────────────
    this._drawEar(ctx, s, headY, headR, -1);
    this._drawEar(ctx, s, headY, headR,  1);

    ctx.restore();
  }

  _drawChestHeart(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    const w = size;
    const h = size * 0.9;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.2);
    ctx.bezierCurveTo(-w * 0.25, -h * 0.6, -w * 0.55, -h * 0.35, -w * 0.55, 0);
    ctx.bezierCurveTo(-w * 0.55, h * 0.35, -w * 0.2, h * 0.65, 0, h * 0.85);
    ctx.bezierCurveTo(w * 0.2, h * 0.65, w * 0.55, h * 0.35, w * 0.55, 0);
    ctx.bezierCurveTo(w * 0.55, -h * 0.35, w * 0.25, -h * 0.6, 0, -h * 0.2);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, -h * 0.1, 0, 0, 0, w * 0.7);
    grad.addColorStop(0, '#ff4d79');
    grad.addColorStop(0.7, '#d61d4e');
    grad.addColorStop(1, '#9e0d34');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255, 45, 95, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.strokeStyle = '#ffe4ec';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // ─── Draw Helpers ─────────────────────────────────────────────────────────

  _drawBodyGradient(ctx, cx, cy, w, h) {
    const grad = ctx.createRadialGradient(cx - w * 0.2, cy - h * 0.2, 0, cx, cy, Math.max(w, h));
    grad.addColorStop(0, this.colors.furLight);
    grad.addColorStop(0.5, this.colors.fur);
    grad.addColorStop(1, this.colors.furShadow);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle fur texture lines
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * w * 0.3 - w, cy - h);
      ctx.lineTo(cx + i * w * 0.3 + w, cy + h);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawArm(ctx, s, isRight) {
    const w = 20 * s;
    const h = 38 * s;
    const grad = ctx.createRadialGradient(-w * 0.2, -h * 0.2, 0, 0, 0, Math.max(w, h));
    grad.addColorStop(0, this.colors.furLight);
    grad.addColorStop(0.6, this.colors.fur);
    grad.addColorStop(1, this.colors.furShadow);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paw pad at the end
    ctx.fillStyle = this.colors.pawPad;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.65, w * 0.6, w * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Toe dots
    ctx.fillStyle = this.colors.paw;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * w * 0.22, h * 0.6, w * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawLeg(ctx, s, side, bodyY, bodyW) {
    const legW = 22 * s;
    const legH = 30 * s;
    const footW = 32 * s;
    const footH = 18 * s;
    const legX = side * bodyW * 0.6;
    const legY = bodyY + 60 * s;

    // Leg
    const grad = ctx.createRadialGradient(legX, legY, 0, legX, legY, legW * 1.5);
    grad.addColorStop(0, this.colors.furLight);
    grad.addColorStop(1, this.colors.furShadow);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(legX, legY, legW, legH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Foot
    ctx.fillStyle = this.colors.fur;
    ctx.beginPath();
    ctx.ellipse(legX + side * 8 * s, legY + legH * 0.5, footW, footH, 0.2 * side, 0, Math.PI * 2);
    ctx.fill();

    // Paw pad
    ctx.fillStyle = this.colors.pawPad;
    ctx.beginPath();
    ctx.ellipse(legX + side * 10 * s, legY + legH * 0.5, footW * 0.55, footH * 0.6, 0.2 * side, 0, Math.PI * 2);
    ctx.fill();

    // Toe dots
    ctx.fillStyle = this.colors.paw;
    for (let t = -1; t <= 1; t++) {
      ctx.beginPath();
      ctx.arc(legX + side * 10 * s + t * footW * 0.25, legY + legH * 0.4, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawScarf(ctx, s, scarfY, name, bodyW) {
    const scarfH = 10 * s;
    const scarfW = bodyW * 1.3;

    // Scarf base strip
    ctx.fillStyle = this.colors.scarf1;
    ctx.beginPath();
    ctx.rect(-scarfW, scarfY - scarfH * 0.5, scarfW * 2, scarfH);
    ctx.fill();

    // Stripe accent
    ctx.fillStyle = this.colors.scarf2;
    ctx.beginPath();
    ctx.rect(-scarfW, scarfY - scarfH * 0.15, scarfW * 2, scarfH * 0.3);
    ctx.fill();

    // Scarf knot on the right
    const knotX = scarfW * 0.6;
    ctx.fillStyle = this.colors.scarf1;
    ctx.beginPath();
    ctx.ellipse(knotX, scarfY, 8 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dangling scarf ends
    ctx.save();
    ctx.translate(knotX, scarfY + 8 * s);
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = i === 0 ? this.colors.scarf1 : this.colors.scarf2;
      ctx.beginPath();
      ctx.rect(i === 0 ? -6 * s : 1 * s, 0, 5 * s, 18 * s);
      ctx.fill();
    }
    ctx.restore();

    // Name text on scarf
    if (name) {
      const displayName = name.length > 10 ? name.slice(0, 9) + '…' : name;
      const fontSize = Math.max(6, Math.min(9, (scarfW * 1.6) / displayName.length));
      ctx.font = `bold ${fontSize * s}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.colors.scarfText;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;
      ctx.fillText(displayName.toUpperCase(), -knotX * 0.5, scarfY);
      ctx.shadowBlur = 0;
    }
  }

  _drawHead(ctx, s, cy, r, blink) {
    // Head shadow/depth
    const shadowGrad = ctx.createRadialGradient(-r * 0.15, cy - r * 0.15, 0, 0, cy, r * 1.1);
    shadowGrad.addColorStop(0, this.colors.furLight);
    shadowGrad.addColorStop(0.55, this.colors.fur);
    shadowGrad.addColorStop(1, this.colors.furShadow);
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Cheek blush (rosy)
    ctx.save();
    for (const side of [-1, 1]) {
      const bx = side * r * 0.52;
      const by = cy + r * 0.1;
      const blushGrad = ctx.createRadialGradient(bx, by, 0, bx, by, r * 0.25);
      blushGrad.addColorStop(0, 'rgba(230, 120, 120, 0.25)');
      blushGrad.addColorStop(1, 'rgba(230, 120, 120, 0)');
      ctx.fillStyle = blushGrad;
      ctx.beginPath();
      ctx.ellipse(bx, by, r * 0.25, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Muzzle (cream oval)
    const muzzleY = cy + r * 0.22;
    ctx.fillStyle = this.colors.muzzle;
    ctx.beginPath();
    ctx.ellipse(0, muzzleY, r * 0.42, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose (dark ellipse)
    ctx.fillStyle = this.colors.nose;
    ctx.beginPath();
    ctx.ellipse(0, muzzleY - r * 0.1, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.save();
    ctx.strokeStyle = this.colors.nose;
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, muzzleY + r * 0.04);
    ctx.quadraticCurveTo(0, muzzleY + r * 0.14, r * 0.12, muzzleY + r * 0.04);
    ctx.stroke();
    // Dimple curves
    ctx.beginPath();
    ctx.moveTo(-r * 0.17, muzzleY);
    ctx.quadraticCurveTo(-r * 0.14, muzzleY + r * 0.04, -r * 0.12, muzzleY + r * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.17, muzzleY);
    ctx.quadraticCurveTo(r * 0.14, muzzleY + r * 0.04, r * 0.12, muzzleY + r * 0.04);
    ctx.stroke();
    ctx.restore();

    // Eyes
    for (const side of [-1, 1]) {
      this._drawEye(ctx, s, side * r * 0.3, cy - r * 0.12, r * 0.11, blink);
    }
  }

  _drawEye(ctx, s, ex, ey, er, blink) {
    const eyeH = er * Math.max(0.15, 1.0 - blink * 0.9);

    // Eye socket dark
    ctx.save();
    ctx.fillStyle = this.colors.eyeGlow;
    ctx.beginPath();
    ctx.ellipse(ex, ey, er * 1.15, eyeH * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main eye
    ctx.fillStyle = this.colors.eye;
    ctx.beginPath();
    ctx.ellipse(ex, ey, er, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner shine (caramel)
    ctx.fillStyle = 'rgba(100, 50, 20, 0.5)';
    ctx.beginPath();
    ctx.ellipse(ex + er * 0.1, ey + eyeH * 0.1, er * 0.5, eyeH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight dot (top-left)
    if (blink < 0.5) {
      ctx.fillStyle = this.colors.eyeShine;
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(ex - er * 0.3, ey - eyeH * 0.3, er * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Secondary smaller dot
      ctx.beginPath();
      ctx.arc(ex + er * 0.15, ey - eyeH * 0.5, er * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  _drawEar(ctx, s, headCY, headR, side) {
    const earX = side * headR * 0.78;
    const earY = headCY - headR * 0.72;
    const earR = headR * 0.32;

    // Outer ear
    const earGrad = ctx.createRadialGradient(earX - earR * 0.2, earY - earR * 0.2, 0, earX, earY, earR);
    earGrad.addColorStop(0, this.colors.furLight);
    earGrad.addColorStop(1, this.colors.furShadow);
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.arc(earX, earY, earR, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear (darker)
    ctx.fillStyle = this.colors.earInner;
    ctx.beginPath();
    ctx.ellipse(earX, earY + earR * 0.1, earR * 0.55, earR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ear shadow where it meets head
    const shadowGrad = ctx.createRadialGradient(earX + side * earR * 0.4, earY + earR * 0.3, 0, earX + side * earR * 0.4, earY + earR * 0.3, earR * 0.4);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.12)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(earX, earY, earR, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Quick snapshot: draw a small teddy at the given position
   * Used for thumbnail/preview rendering
   */
  drawMini(ctx, cx, cy, scale = 0.4, name = '') {
    this.draw(ctx, cx, cy, scale, name, {});
  }
}

window.TeddyCharacter = TeddyCharacter;

