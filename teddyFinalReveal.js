/**
 * teddyFinalReveal.js — The Final Gift
 * ============================================================================
 * - Cinematic zoom animation: teddy grows and moves toward viewer
 * - Soft glowing portal ring behind teddy (pulsing radial gradient)
 * - Teddy wave animation + reaching arms forward
 * - If photo gift available: slides in as floating polaroid from right
 * - Text: "Look, [NAME]! A little friend from your own universe."
 * - Action buttons: Save Gift | Replay | Explore Portfolio
 * - Save downloads the composited gift photo PNG
 * ============================================================================
 */

class TeddyFinalReveal {
  constructor(canvas, particleSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem || null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.active = false;

    // State
    this.visitorName = '';
    this.giftDataUrl = null;    // composited gift photo
    this.phase = 'idle';        // idle → zoom → polaroid → text → buttons
    this.phaseTime = 0;

    // Zoom animation
    this.zoomScale = 0.6;       // starts small, grows to 1.0
    this.zoomAlpha = 0;

    // Portal ring
    this.portalPulse = 0;
    this.portalRadius = 0;

    // Polaroid slide-in
    this.polaroidX = 0;         // starts off-screen right
    this.polaroidAlpha = 0;

    // Text reveal
    this.textAlpha = 0;
    this.textLine1Alpha = 0;
    this.textLine2Alpha = 0;

    // Action buttons
    this.buttonsVisible = false;

    // DOM overlay
    this.overlayEl = document.getElementById('sceneFinalReveal');
    this.textEl = document.getElementById('finalRevealText');
    this.actionsEl = document.getElementById('finalRevealActions');
    this.saveBtn = document.getElementById('btnSaveGift');
    this.replayBtn = document.getElementById('btnReplay');
    this.portfolioBtn = document.getElementById('btnPortfolio');

    // Callback hooks
    this.onReplay = null;
    this.onPortfolio = null;

    this._bindEvents();
  }

  // ─── Event Binding ────────────────────────────────────────────────────────

  _bindEvents() {
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => this._downloadGift());
    }
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        if (this.onReplay) this.onReplay();
      });
    }
    if (this.portfolioBtn) {
      this.portfolioBtn.addEventListener('click', () => {
        if (this.onPortfolio) this.onPortfolio();
      });
    }
  }

  // ─── Activation ───────────────────────────────────────────────────────────

  start(visitorName, giftDataUrl) {
    this.visitorName = visitorName || 'Friend';
    this.giftDataUrl = giftDataUrl || null;
    this.active = true;
    this.phase = 'zoom';
    this.phaseTime = 0;
    this.zoomScale = 0.5;
    this.zoomAlpha = 0;
    this.portalRadius = 0;
    this.polaroidX = this.width + 300;
    this.polaroidAlpha = 0;
    this.textAlpha = 0;
    this.textLine1Alpha = 0;
    this.textLine2Alpha = 0;
    this.buttonsVisible = false;

    if (this.overlayEl) {
      this.overlayEl.classList.remove('hidden');
    }
    if (this.textEl) {
      this.textEl.innerHTML = '';
      this.textEl.style.opacity = '0';
    }
    if (this.actionsEl) {
      this.actionsEl.classList.add('hidden');
      this.actionsEl.style.opacity = '0';
    }

    // Update save button
    if (this.saveBtn) {
      this.saveBtn.style.display = this.giftDataUrl ? 'inline-flex' : 'none';
    }
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    this.time += dt;
    if (!this.active) return;

    this.phaseTime += dt;
    this.portalPulse = this.time;

    switch (this.phase) {

      case 'zoom': {
        // 2.5s: teddy zooms toward viewer
        const t = Math.min(1, this.phaseTime / 2.5);
        this.zoomScale = 0.5 + this._easeOutBack(t) * 0.55;
        this.zoomAlpha = Math.min(1, t * 2.5);
        this.portalRadius = t * Math.min(this.width, this.height) * 0.32;

        // Emit ambient particles
        if (this.particles && Math.random() < dt * 15) {
          const angle = Math.random() * Math.PI * 2;
          const dist = this.portalRadius * (0.8 + Math.random() * 0.3);
          this.particles.emit('embers', this.width * 0.5 + Math.cos(angle) * dist, this.height * 0.42 + Math.sin(angle) * dist, { count: 1, speed: 1.5 });
        }

        if (t >= 1) {
          this.phase = 'polaroid';
          this.phaseTime = 0;
          // Burst of celebration particles
          if (this.particles) {
            this.particles.emit('starbursts', this.width * 0.5, this.height * 0.42, { count: 20, speed: 4 });
            this.particles.emit('petals', this.width * 0.5, this.height * 0.3, { count: 12 });
          }
        }
        break;
      }

      case 'polaroid': {
        // 1.5s: polaroid slides in from right (only if gift available)
        const t = Math.min(1, this.phaseTime / 1.5);
        const ease = this._easeOutCubic(t);
        const targetX = this.width * 0.75;
        this.polaroidX = this.width + 300 - (this.width + 300 - targetX) * ease;
        this.polaroidAlpha = t;

        if (t >= 1) {
          this.phase = 'text';
          this.phaseTime = 0;
        }
        break;
      }

      case 'text': {
        // 2.0s: text fades in line by line
        const t = Math.min(1, this.phaseTime / 2.0);
        this.textLine1Alpha = Math.min(1, this.phaseTime / 0.8);
        this.textLine2Alpha = Math.min(1, (this.phaseTime - 0.6) / 0.8);

        if (this.textEl) {
          this.textEl.style.opacity = this.textLine1Alpha.toString();
          this.textEl.innerHTML = `
            <p class="reveal-line-1" style="opacity:${this.textLine1Alpha}">Look, <span class="reveal-name">${this.visitorName}</span>!</p>
            <p class="reveal-line-2" style="opacity:${Math.max(0, this.textLine2Alpha)}">A little friend from your own universe.</p>
          `;
        }

        if (t >= 1) {
          this.phase = 'buttons';
          this.phaseTime = 0;
        }
        break;
      }

      case 'buttons': {
        // Reveal action buttons
        const t = Math.min(1, this.phaseTime / 1.0);
        if (!this.buttonsVisible && t > 0.3) {
          this.buttonsVisible = true;
          if (this.actionsEl) {
            this.actionsEl.classList.remove('hidden');
            this.actionsEl.style.opacity = '0';
            this.actionsEl.style.transition = 'opacity 0.8s ease';
            requestAnimationFrame(() => {
              this.actionsEl.style.opacity = '1';
            });
          }
        }
        break;
      }
    }
  }

  // ─── Canvas Render ────────────────────────────────────────────────────────

  render() {
    if (!this.active) return;
    const ctx = this.ctx;

    // Portal glow ring behind teddy
    if (this.portalRadius > 5) {
      this._drawPortalRing(ctx);
    }

    // The main ASCII teddy is drawn by TeddyBirthAnimation (which keeps rendering)
    // We just overlay the polaroid here

    if (this.giftDataUrl && this.polaroidAlpha > 0.01) {
      this._drawPolaroid(ctx);
    }
  }

  _drawPortalRing(ctx) {
    const cx = this.width * 0.5;
    const cy = this.height * 0.42;
    const r = this.portalRadius;
    const pulse = 0.85 + 0.15 * Math.sin(this.portalPulse * 2.5);

    ctx.save();

    // Outer soft glow
    const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.5);
    outerGlow.addColorStop(0, `rgba(200, 150, 255, ${0.12 * this.zoomAlpha})`);
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ring strokes (3 concentric rings)
    const rings = [
      { r: r,        alpha: 0.5, width: 3 },
      { r: r * 0.85, alpha: 0.3, width: 2 },
      { r: r * 1.12, alpha: 0.2, width: 1.5 }
    ];
    for (const ring of rings) {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 160, 255, ${ring.alpha * this.zoomAlpha})`;
      ctx.lineWidth = ring.width;
      ctx.shadowColor = 'rgba(200, 150, 255, 0.6)';
      ctx.shadowBlur = 15;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Rotating star ring
    const starCount = 12;
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + this.time * 0.5;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      const starAlpha = (0.4 + 0.6 * Math.sin(this.time * 3 + i * 1.2)) * this.zoomAlpha;
      ctx.fillStyle = `rgba(220, 200, 255, ${starAlpha})`;
      ctx.shadowColor = 'rgba(200, 180, 255, 0.9)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.sin(this.time * 4 + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawPolaroid(ctx) {
    if (!this.giftDataUrl) return;

    const pw = Math.min(220, this.width * 0.2);
    const ph = pw * 1.28;
    const py = this.height * 0.5 - ph * 0.5;

    ctx.save();
    ctx.globalAlpha = this.polaroidAlpha;

    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 10;

    // White polaroid frame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(this.polaroidX - pw * 0.5, py, pw, ph);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Photo inside (draw image from data URL)
    // We draw it as a placeholder since we can't load URL synchronously
    // The actual image is loaded lazily
    if (!this._polaroidImg && this.giftDataUrl) {
      this._polaroidImg = new Image();
      this._polaroidImg.src = this.giftDataUrl;
    }

    const pad = pw * 0.06;
    const imgW = pw - pad * 2;
    const imgH = imgW;

    if (this._polaroidImg && this._polaroidImg.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.polaroidX - pw * 0.5 + pad, py + pad, imgW, imgH);
      ctx.clip();
      ctx.drawImage(this._polaroidImg, this.polaroidX - pw * 0.5 + pad, py + pad, imgW, imgH);
      ctx.restore();
    } else {
      // Placeholder
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(this.polaroidX - pw * 0.5 + pad, py + pad, imgW, imgH);
      ctx.font = `${imgW * 0.3}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(200, 150, 255, 0.6)';
      ctx.fillText('✦', this.polaroidX, py + pad + imgH * 0.5);
    }

    // Caption
    ctx.font = `italic bold ${Math.max(10, pw * 0.07)}px 'Plus Jakarta Sans', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a0a2e';
    ctx.fillText(`For ${this.visitorName} ♥`, this.polaroidX, py + ph - pw * 0.11);

    ctx.restore();
  }

  // ─── Gift Download ────────────────────────────────────────────────────────

  _downloadGift() {
    if (!this.giftDataUrl) return;
    const a = document.createElement('a');
    a.href = this.giftDataUrl;
    a.download = `teddy-gift-${(this.visitorName || 'friend').toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  _easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  hide() {
    this.active = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
  }

  destroy() {
    this.hide();
  }
}

window.TeddyFinalReveal = TeddyFinalReveal;

