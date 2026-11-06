/**
 * teddyAIService.js — Photo Gift Compositor
 * ============================================================================
 * Since no backend API key is available, this creates a beautiful
 * canvas-composited "gift photo" showing the uploaded photo beside the teddy:
 * - Takes visitor photo and teddy canvas screenshot
 * - Creates a beautiful 2-panel gift photo with decorative border
 * - Adds visitor's name as elegant text overlay
 * - Adds floating hearts and star particles drawn on canvas
 * - Applies warm vignette effect
 * - Outputs a data URL for download
 * - Never stores or transmits the photo anywhere
 * Fires onGiftReady(dataUrl)
 * ============================================================================
 */

class TeddyAIService {
  constructor() {
    this.onGiftReady = null;
  }

  /**
   * Compose the gift image.
   * @param {string} photoDataUrl  Visitor's photo as data URL
   * @param {HTMLCanvasElement} teddyCanvas  The main canvas with the teddy
   * @param {string} visitorName   Visitor's name for text overlay
   */
  compose(photoDataUrl, teddyCanvas, visitorName) {
    // Output canvas: 1200 x 630 (nice landscape ratio, shareable)
    const outW = 1200;
    const outH = 630;

    const offscreen = document.createElement('canvas');
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext('2d');

    // We load the visitor photo, then composite everything
    const photoImg = new Image();
    photoImg.onload = () => {
      this._composite(ctx, outW, outH, photoImg, teddyCanvas, visitorName);
      const dataUrl = offscreen.toDataURL('image/png');
      if (this.onGiftReady) this.onGiftReady(dataUrl);
    };
    photoImg.onerror = () => {
      // If photo fails, still make a gift without it
      this._composite(ctx, outW, outH, null, teddyCanvas, visitorName);
      const dataUrl = offscreen.toDataURL('image/png');
      if (this.onGiftReady) this.onGiftReady(dataUrl);
    };
    photoImg.src = photoDataUrl;
  }

  /**
   * Compose a gift without a photo (just teddy + name)
   */
  composeNoPhoto(teddyCanvas, visitorName) {
    const outW = 900;
    const outH = 600;
    const offscreen = document.createElement('canvas');
    offscreen.width = outW;
    offscreen.height = outH;
    const ctx = offscreen.getContext('2d');
    this._compositeTeddyOnly(ctx, outW, outH, teddyCanvas, visitorName);
    const dataUrl = offscreen.toDataURL('image/png');
    if (this.onGiftReady) this.onGiftReady(dataUrl);
  }

  // ─── Core Compositor ──────────────────────────────────────────────────────

  _composite(ctx, W, H, photoImg, teddyCanvas, name) {
    // 1. Deep space background
    this._drawBackground(ctx, W, H);

    // 2. Decorative border frame
    this._drawBorderFrame(ctx, W, H);

    // 3. Left panel: teddy snapshot
    const teddyPanelW = photoImg ? W * 0.5 : W * 0.7;
    this._drawTeddyPanel(ctx, 0, 0, teddyPanelW, H, teddyCanvas);

    // 4. Right panel: visitor photo (if available)
    if (photoImg) {
      this._drawPhotoPanel(ctx, teddyPanelW, 0, W - teddyPanelW, H, photoImg, name);
    }

    // 5. Floating decorative hearts
    this._drawFloatingHearts(ctx, W, H);

    // 6. Floating star particles
    this._drawFloatingStars(ctx, W, H);

    // 7. Name overlay (top-center)
    this._drawNameBanner(ctx, W, H, name);

    // 8. Bottom caption
    this._drawBottomCaption(ctx, W, H, name);

    // 9. Warm vignette overlay
    this._drawVignette(ctx, W, H);

    // 10. Corner decorations
    this._drawCornerDecorations(ctx, W, H);
  }

  _compositeTeddyOnly(ctx, W, H, teddyCanvas, name) {
    this._drawBackground(ctx, W, H);
    this._drawBorderFrame(ctx, W, H);
    this._drawTeddyPanel(ctx, W * 0.1, 0, W * 0.8, H, teddyCanvas);
    this._drawFloatingHearts(ctx, W, H);
    this._drawFloatingStars(ctx, W, H);
    this._drawNameBanner(ctx, W, H, name);
    this._drawBottomCaption(ctx, W, H, name);
    this._drawVignette(ctx, W, H);
    this._drawCornerDecorations(ctx, W, H);
  }

  // ─── Panel Drawers ────────────────────────────────────────────────────────

  _drawBackground(ctx, W, H) {
    ctx.fillStyle = '#05030C';
    ctx.fillRect(0, 0, W, H);

    // Nebula gradient
    const nebula = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    nebula.addColorStop(0, 'rgba(100, 40, 160, 0.4)');
    nebula.addColorStop(0.4, 'rgba(50, 20, 100, 0.2)');
    nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, W, H);

    // Mini stars
    const rng = this._seededRng(42);
    for (let i = 0; i < 200; i++) {
      const sx = rng() * W;
      const sy = rng() * H;
      const sr = 0.5 + rng() * 1.5;
      const sa = 0.3 + rng() * 0.7;
      ctx.fillStyle = `rgba(220, 215, 255, ${sa})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawBorderFrame(ctx, W, H) {
    const margin = 12;
    const r = 20;

    // Outer glow border
    ctx.save();
    ctx.shadowColor = 'rgba(200, 150, 255, 0.5)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(200, 150, 255, 0.5)';
    ctx.lineWidth = 2;
    this._roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, r);
    ctx.stroke();
    ctx.restore();

    // Inner border line
    ctx.strokeStyle = 'rgba(255, 200, 240, 0.25)';
    ctx.lineWidth = 1;
    this._roundRect(ctx, margin + 6, margin + 6, W - (margin + 6) * 2, H - (margin + 6) * 2, r - 4);
    ctx.stroke();
  }

  _drawTeddyPanel(ctx, x, y, w, h, teddyCanvas) {
    ctx.save();
    ctx.beginPath();
    this._roundRect(ctx, x + 20, y + 20, w - 40, h - 40, 12);
    ctx.clip();

    if (teddyCanvas) {
      try {
        // Draw a snapshot of the teddy canvas
        ctx.drawImage(teddyCanvas, x + 20, y + 20, w - 40, h - 40);
      } catch (e) {
        // Fallback: draw a placeholder
        ctx.fillStyle = 'rgba(60, 20, 90, 0.8)';
        ctx.fillRect(x + 20, y + 20, w - 40, h - 40);
        ctx.fillStyle = 'rgba(200, 150, 255, 0.5)';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧸', x + w / 2, y + h / 2);
      }
    } else {
      ctx.fillStyle = 'rgba(60, 20, 90, 0.8)';
      ctx.fillRect(x + 20, y + 20, w - 40, h - 40);
      ctx.fillStyle = 'rgba(200, 150, 255, 0.5)';
      ctx.font = 'bold 60px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧸', x + w / 2, y + h / 2);
    }

    ctx.restore();
  }

  _drawPhotoPanel(ctx, x, y, w, h, photoImg, name) {
    // Rounded photo frame
    const pad = 25;
    const frameW = w - pad * 2;
    const frameH = h - pad * 2;
    const frameX = x + pad;
    const frameY = y + pad;

    // White polaroid-style frame
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#ffffff';
    this._roundRect(ctx, frameX - 6, frameY - 6, frameW + 12, frameH + 12, 10);
    ctx.fill();
    ctx.restore();

    // Photo inside frame with rounded clip
    ctx.save();
    ctx.beginPath();
    this._roundRect(ctx, frameX, frameY, frameW, frameH * 0.82, 6);
    ctx.clip();

    // Cover-fit the photo
    const photoAspect = photoImg.width / photoImg.height;
    const panelAspect = frameW / (frameH * 0.82);
    let dw, dh, dx, dy;
    if (photoAspect > panelAspect) {
      dh = frameH * 0.82;
      dw = dh * photoAspect;
      dx = frameX - (dw - frameW) / 2;
      dy = frameY;
    } else {
      dw = frameW;
      dh = dw / photoAspect;
      dx = frameX;
      dy = frameY - (dh - frameH * 0.82) / 2;
    }
    ctx.drawImage(photoImg, dx, dy, dw, dh);
    ctx.restore();

    // Caption area below photo
    const captionY = frameY + frameH * 0.82 + 12;
    ctx.font = `italic bold ${Math.max(14, frameW * 0.055)}px 'Plus Jakarta Sans', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a0a2e';
    ctx.fillText(`My Universe Creator ✦ ${name}`, frameX + frameW / 2, captionY + (frameH * 0.18) / 2);
  }

  _drawFloatingHearts(ctx, W, H) {
    const positions = [
      { x: 0.08, y: 0.12 }, { x: 0.92, y: 0.08 },
      { x: 0.15, y: 0.85 }, { x: 0.88, y: 0.80 },
      { x: 0.5,  y: 0.06 }, { x: 0.5,  y: 0.95 },
      { x: 0.03, y: 0.5  }, { x: 0.97, y: 0.5  }
    ];
    const rng = this._seededRng(123);
    for (const pos of positions) {
      const hx = pos.x * W;
      const hy = pos.y * H;
      const size = 10 + rng() * 10;
      ctx.save();
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 160, 200, ${0.4 + rng() * 0.4})`;
      ctx.shadowColor = 'rgba(255, 100, 180, 0.6)';
      ctx.shadowBlur = 10;
      ctx.fillText('♥', hx, hy);
      ctx.restore();
    }
  }

  _drawFloatingStars(ctx, W, H) {
    const rng = this._seededRng(77);
    for (let i = 0; i < 20; i++) {
      const sx = rng() * W;
      const sy = rng() * H;
      const size = 6 + rng() * 10;
      const alpha = 0.3 + rng() * 0.5;
      ctx.save();
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 240, 180, ${alpha})`;
      ctx.shadowColor = 'rgba(255, 220, 100, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('✦', sx, sy);
      ctx.restore();
    }
  }

  _drawNameBanner(ctx, W, H, name) {
    if (!name) return;

    // Elegant centered name at top
    const bannerY = H * 0.1;
    const fontSize = Math.min(36, Math.max(22, W * 0.03));

    ctx.save();
    // Soft background pill
    const text = `✦ ${name.toUpperCase()} ✦`;
    ctx.font = `bold ${fontSize}px 'Fira Code', monospace`;
    const textW = ctx.measureText(text).width;

    const pillX = W * 0.5 - textW * 0.5 - 24;
    const pillW = textW + 48;
    const pillH = fontSize * 1.8;
    const pillY = bannerY - pillH * 0.5;

    ctx.fillStyle = 'rgba(10, 5, 25, 0.5)';
    this._roundRect(ctx, pillX, pillY, pillW, pillH, pillH * 0.5);
    ctx.fill();

    ctx.strokeStyle = 'rgba(200, 150, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Name text with glow
    ctx.fillStyle = 'rgba(230, 210, 255, 1)';
    ctx.shadowColor = 'rgba(200, 150, 255, 0.9)';
    ctx.shadowBlur = 15;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W * 0.5, bannerY);
    ctx.restore();
  }

  _drawBottomCaption(ctx, W, H, name) {
    const captionY = H * 0.93;
    const fontSize = Math.min(18, Math.max(12, W * 0.015));

    ctx.save();
    ctx.font = `italic ${fontSize}px 'Plus Jakarta Sans', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(200, 180, 240, 0.7)';
    ctx.fillText('Made with ✦ in The Little Universe', W * 0.5, captionY);
    ctx.restore();
  }

  _drawVignette(ctx, W, H) {
    // Warm-tinted vignette
    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.6, 'rgba(5, 2, 15, 0.1)');
    vignette.addColorStop(1, 'rgba(5, 2, 15, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  _drawCornerDecorations(ctx, W, H) {
    const corners = [
      { x: 30, y: 30 }, { x: W - 30, y: 30 },
      { x: 30, y: H - 30 }, { x: W - 30, y: H - 30 }
    ];
    const decorChars = ['✧', '✦', '✧', '✦'];

    for (let i = 0; i < corners.length; i++) {
      const c = corners[i];
      ctx.save();
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(200, 180, 255, 0.5)';
      ctx.shadowColor = 'rgba(200, 150, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(decorChars[i], c.x, c.y);
      ctx.restore();
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _seededRng(seed) {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
}

window.TeddyAIService = TeddyAIService;

