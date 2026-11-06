/**
 * constellationInteraction.js — Interactive Constellation Builder
 * ============================================================================
 * - 20 large clickable/hoverable stars in a beautiful cluster arrangement
 * - Hover → star glows and pulses
 * - Click-drag between stars → luminous light thread connects them
 * - Connected stars remain linked with animated flowing light + particles
 * - After 3+ connections → small procedural planet materializes near center
 * - After 6+ connections → environment "comes alive" (nebula brightens)
 * - Tracks connections, fires onReady() callback when enough made
 * - Shows floating text: "Every little world needs someone special."
 * ============================================================================
 */

class ConstellationInteraction {
  constructor(canvas, particleSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem || null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.active = false;

    // Callbacks
    this.onReady = null;
    this.onConnectionMade = null;
    this.onIntensityChange = null;

    // State
    this.connections = [];      // { a, b, particles, flowOffset, flowSpeed }
    this.dragging = false;
    this.dragFrom = null;       // star index
    this.dragX = 0;
    this.dragY = 0;
    this.hoveredStar = null;
    this.miniPlanet = null;     // appears at 3 connections
    this.planetBirthProgress = 0;
    this.isAlive = false;       // true at 6 connections
    this.readyFired = false;
    this.showMessage = false;
    this.messageAlpha = 0;
    this.messageTarget = 0;
    this.showInviteBtn = false;

    // Stars cluster – 20 stars placed in a visually pleasing arrangement
    this.stars = this._buildStarCluster();

    // Per-star animation state
    this.starPulse = new Array(20).fill(0).map(() => ({
      scale: 1.0,
      glow: 0,
      glowTarget: 0,
      connectedAt: null
    }));

    this._bindEvents();
  }

  // ─── Star Cluster Layout ──────────────────────────────────────────────────

  _buildStarCluster() {
    const cx = this.width * 0.5;
    const cy = this.height * 0.48;
    const stars = [];

    // Layered arrangement: inner ring, outer ring, scattered
    const positions = [
      // Center cluster (5 stars)
      { r: 0, a: 0 },
      { r: 0.08, a: 0 },
      { r: 0.08, a: Math.PI * 0.6667 },
      { r: 0.08, a: Math.PI * 1.3333 },
      { r: 0.11, a: Math.PI * 0.333 },
      // Inner ring (7 stars)
      { r: 0.17, a: Math.PI * 0 },
      { r: 0.17, a: Math.PI * 0.286 },
      { r: 0.17, a: Math.PI * 0.571 },
      { r: 0.17, a: Math.PI * 0.857 },
      { r: 0.17, a: Math.PI * 1.143 },
      { r: 0.17, a: Math.PI * 1.429 },
      { r: 0.17, a: Math.PI * 1.714 },
      // Outer ring (8 stars)
      { r: 0.27, a: Math.PI * 0.125 },
      { r: 0.27, a: Math.PI * 0.375 },
      { r: 0.27, a: Math.PI * 0.625 },
      { r: 0.27, a: Math.PI * 0.875 },
      { r: 0.27, a: Math.PI * 1.125 },
      { r: 0.27, a: Math.PI * 1.375 },
      { r: 0.27, a: Math.PI * 1.625 },
      { r: 0.27, a: Math.PI * 1.875 }
    ];

    const scale = Math.min(this.width, this.height) * 0.95;

    for (let i = 0; i < 20; i++) {
      const pos = positions[i];
      const jitterX = (Math.random() - 0.5) * scale * 0.025;
      const jitterY = (Math.random() - 0.5) * scale * 0.025;
      const baseSize = 3 + Math.random() * 4;
      stars.push({
        id: i,
        x: cx + Math.cos(pos.a) * pos.r * scale + jitterX,
        y: cy + Math.sin(pos.a) * pos.r * scale * 0.7 + jitterY,
        baseSize,
        colorHue: 240 + Math.random() * 120,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleFreq: 0.8 + Math.random() * 1.5,
        connected: false,
        hovered: false
      });
    }

    return stars;
  }

  // ─── Event Binding ────────────────────────────────────────────────────────

  _bindEvents() {
    this._onMouseMove = (e) => this._handleMove(e.clientX, e.clientY);
    this._onMouseDown = (e) => this._handleDown(e.clientX, e.clientY);
    this._onMouseUp   = (e) => this._handleUp(e.clientX, e.clientY);
    this._onTouchStart = (e) => {
      if (e.touches.length > 0) this._handleDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    this._onTouchMove = (e) => {
      if (e.touches.length > 0) this._handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    this._onTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      if (touch) this._handleUp(touch.clientX, touch.clientY);
    };

    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  _nearestStar(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const star of this.stars) {
      const dx = x - star.x;
      const dy = y - star.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) { bestDist = d; best = star; }
    }
    return bestDist < 50 ? best : null;
  }

  _handleMove(x, y) {
    if (!this.active) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = (x - rect.left) * (this.width / rect.width);
    const cy = (y - rect.top) * (this.height / rect.height);

    this.hoveredStar = this._nearestStar(cx, cy);
    if (this.dragging) {
      this.dragX = cx;
      this.dragY = cy;
    }

    for (const star of this.stars) {
      star.hovered = (this.hoveredStar === star);
    }
  }

  _handleDown(x, y) {
    if (!this.active) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = (x - rect.left) * (this.width / rect.width);
    const cy = (y - rect.top) * (this.height / rect.height);
    const star = this._nearestStar(cx, cy);
    if (star) {
      this.dragging = true;
      this.dragFrom = star;
      this.dragX = cx;
      this.dragY = cy;
    }
  }

  _handleUp(x, y) {
    if (!this.active || !this.dragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = (x - rect.left) * (this.width / rect.width);
    const cy = (y - rect.top) * (this.height / rect.height);
    const starTo = this._nearestStar(cx, cy);

    if (starTo && starTo !== this.dragFrom) {
      this._makeConnection(this.dragFrom, starTo);
    }

    this.dragging = false;
    this.dragFrom = null;
  }

  _makeConnection(a, b) {
    // Check not already connected
    const exists = this.connections.some(
      (c) => (c.a === a && c.b === b) || (c.a === b && c.b === a)
    );
    if (exists) return;

    const conn = {
      a, b,
      flowOffset: Math.random(),
      flowSpeed: 0.15 + Math.random() * 0.2,
      alpha: 0,
      targetAlpha: 1,
      particles: Array.from({ length: 5 }, (_, i) => ({
        t: i / 5,
        speed: 0.08 + Math.random() * 0.08
      }))
    };

    this.connections.push(conn);
    a.connected = true;
    b.connected = true;

    // Trigger pulse on connected stars
    this.starPulse[a.id].glowTarget = 1;
    this.starPulse[b.id].glowTarget = 1;
    this.starPulse[a.id].connectedAt = this.time;
    this.starPulse[b.id].connectedAt = this.time;

    // Emit particles at connection point
    if (this.particles) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      this.particles.emit('starbursts', mx, my, { count: 8 });
    }

    if (this.onConnectionMade) this.onConnectionMade(this.connections.length);

    // Milestone: 3 connections → planet appears
    if (this.connections.length === 3 && !this.miniPlanet) {
      this._spawnMiniPlanet();
    }

    // Milestone: 6 connections → environment comes alive
    if (this.connections.length >= 6 && !this.isAlive) {
      this.isAlive = true;
      this.messageTarget = 1;
      this.showMessage = true;
      if (this.onIntensityChange) this.onIntensityChange(1.5);
    }

    // Milestone: 8 connections → trigger onReady
    if (this.connections.length >= 8 && !this.readyFired) {
      this.readyFired = true;
      this.showInviteBtn = true;
      if (this.onReady) {
        setTimeout(() => this.onReady(), 2200);
      }
    }
  }

  _spawnMiniPlanet() {
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    this.miniPlanet = {
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 60,
      radius: 0,
      targetRadius: 18 + Math.random() * 12,
      hue: 260 + Math.random() * 100,
      rotation: 0,
      alpha: 0
    };
  }

  // ─── Activation ───────────────────────────────────────────────────────────

  show() {
    this.active = true;
  }

  hide() {
    this.active = false;
  }

  resize(w, h) {
    const oldW = this.width;
    const oldH = this.height;
    this.width = w;
    this.height = h;
    // Reposition stars proportionally
    for (const star of this.stars) {
      star.x = star.x * (w / oldW);
      star.y = star.y * (h / oldH);
    }
    if (this.miniPlanet) {
      this.miniPlanet.x = this.miniPlanet.x * (w / oldW);
      this.miniPlanet.y = this.miniPlanet.y * (h / oldH);
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    this.time += dt;

    if (!this.active) return;

    // Update star pulse states
    for (let i = 0; i < this.stars.length; i++) {
      const ps = this.starPulse[i];
      ps.glow += (ps.glowTarget - ps.glow) * Math.min(1, dt * 4);
      // Fade glow back after connection pulse
      if (ps.connectedAt !== null && this.time - ps.connectedAt > 1.5) {
        ps.glowTarget = this.stars[i].connected ? 0.6 : 0;
      }
    }

    // Update connection alpha fade-in
    for (const conn of this.connections) {
      conn.alpha += (conn.targetAlpha - conn.alpha) * Math.min(1, dt * 3);
      // Advance flow particles
      for (const fp of conn.particles) {
        fp.t = (fp.t + fp.speed * dt) % 1;
      }
    }

    // Update mini planet birth
    if (this.miniPlanet) {
      this.miniPlanet.radius += (this.miniPlanet.targetRadius - this.miniPlanet.radius) * Math.min(1, dt * 2);
      this.miniPlanet.alpha += (1 - this.miniPlanet.alpha) * Math.min(1, dt * 2);
      this.miniPlanet.rotation += dt * 0.3;
    }

    // Message fade
    if (this.showMessage) {
      this.messageAlpha += (this.messageTarget - this.messageAlpha) * Math.min(1, dt * 1.5);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.active) return;
    const ctx = this.ctx;
    const t = this.time;

    // Draw connections
    this._drawConnections(ctx, t);

    // Draw drag preview line
    if (this.dragging && this.dragFrom) {
      this._drawDragLine(ctx);
    }

    // Draw mini planet
    if (this.miniPlanet) {
      this._drawMiniPlanet(ctx, t);
    }

    // Draw stars
    this._drawStars(ctx, t);

    // Draw message text
    if (this.showMessage && this.messageAlpha > 0.01) {
      this._drawMessage(ctx);
    }
  }

  _drawConnections(ctx, t) {
    for (const conn of this.connections) {
      if (conn.alpha < 0.01) continue;
      const ax = conn.a.x;
      const ay = conn.a.y;
      const bx = conn.b.x;
      const by = conn.b.y;
      const cpx = (ax + bx) / 2 + (ay - by) * 0.15;
      const cpy = (ay + by) / 2 + (bx - ax) * 0.15;

      // Thread glow
      ctx.save();
      ctx.shadowColor = 'rgba(200, 180, 255, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cpx, cpy, bx, by);
      ctx.strokeStyle = `rgba(200, 180, 255, ${conn.alpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Brighter core line
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cpx, cpy, bx, by);
      ctx.strokeStyle = `rgba(230, 220, 255, ${conn.alpha * 0.9})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Flowing particles along the thread
      for (const fp of conn.particles) {
        const ft = fp.t;
        const fpx = (1-ft)*(1-ft)*ax + 2*(1-ft)*ft*cpx + ft*ft*bx;
        const fpy = (1-ft)*(1-ft)*ay + 2*(1-ft)*ft*cpy + ft*ft*by;
        const particleAlpha = Math.sin(fp.t * Math.PI) * conn.alpha;
        if (particleAlpha > 0.05) {
          ctx.save();
          ctx.shadowColor = 'rgba(255,220,255,0.9)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = `rgba(255, 240, 255, ${particleAlpha})`;
          ctx.beginPath();
          ctx.arc(fpx, fpy, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  _drawDragLine(ctx) {
    const ax = this.dragFrom.x;
    const ay = this.dragFrom.y;
    const bx = this.dragX;
    const by = this.dragY;

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = 'rgba(200, 180, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawMiniPlanet(ctx, t) {
    const mp = this.miniPlanet;
    if (mp.alpha < 0.01) return;

    ctx.save();
    ctx.globalAlpha = mp.alpha;
    ctx.translate(mp.x, mp.y);
    ctx.rotate(mp.rotation);

    const r = mp.radius;

    // Outer glow
    const outerGlow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.5);
    outerGlow.addColorStop(0, `hsla(${mp.hue}, 80%, 70%, 0.15)`);
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Planet body
    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    bodyGrad.addColorStop(0, `hsla(${mp.hue + 30}, 90%, 85%, 1)`);
    bodyGrad.addColorStop(0.6, `hsla(${mp.hue}, 70%, 65%, 1)`);
    bodyGrad.addColorStop(1, `hsla(${mp.hue - 20}, 60%, 45%, 1)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Ring
    ctx.save();
    ctx.scale(1, 0.35);
    ctx.strokeStyle = `hsla(${mp.hue}, 70%, 75%, 0.4)`;
    ctx.lineWidth = r * 0.25;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Specular
    const specGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, -r * 0.2, -r * 0.2, r * 0.5);
    specGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _drawStars(ctx, t) {
    for (const star of this.stars) {
      const ps = this.starPulse[star.id];
      const twinkle = 0.7 + 0.3 * Math.sin(t * star.twinkleFreq + star.twinklePhase);
      const isHovered = star.hovered;
      const scale = isHovered ? 1.6 : (1.0 + ps.glow * 0.4);
      const r = star.baseSize * scale * twinkle;
      const hue = star.colorHue;

      // Glow aura
      const glowStrength = isHovered ? 1.0 : (ps.glow * 0.8 + 0.2);
      const glowR = r * (3 + glowStrength * 4);
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowR);
      glow.addColorStop(0, `hsla(${hue}, 90%, 80%, ${glowStrength * 0.5})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Star core
      ctx.save();
      if (isHovered) {
        ctx.shadowColor = `hsla(${hue}, 100%, 85%, 0.9)`;
        ctx.shadowBlur = 15;
      } else if (star.connected) {
        ctx.shadowColor = `hsla(${hue}, 90%, 75%, 0.7)`;
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = `hsla(${hue}, 80%, 92%, 1)`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Cross sparkle on hovered / connected stars
      if (isHovered || (star.connected && ps.glow > 0.3)) {
        const arm = r * (isHovered ? 3.5 : 2.5);
        ctx.save();
        ctx.strokeStyle = `hsla(${hue}, 80%, 90%, ${isHovered ? 0.8 : 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(star.x - arm, star.y); ctx.lineTo(star.x + arm, star.y);
        ctx.moveTo(star.x, star.y - arm); ctx.lineTo(star.x, star.y + arm);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  _drawMessage(ctx) {
    const W = this.width;
    const H = this.height;
    const alpha = this.messageAlpha;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';

    // "Every little world needs someone special."
    const fontSize = Math.min(28, Math.max(16, W * 0.028));
    ctx.font = `italic ${fontSize}px 'Plus Jakarta Sans', 'Caveat', serif`;
    ctx.fillStyle = 'rgba(220, 200, 255, 1)';
    ctx.shadowColor = 'rgba(180, 150, 255, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('Every little world needs someone special.', W * 0.5, H * 0.88);

    ctx.restore();
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  destroy() {
    this.active = false;
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
  }
}

window.ConstellationInteraction = ConstellationInteraction;

