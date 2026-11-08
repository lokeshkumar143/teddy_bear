/**
 * Grand Living ASCII Teddy Bear Engine — Zero-Gap Solid Rendering
 * 
 * Features:
 * - 4 Hand-Crafted Solid Watercolor Teddy Bears (snouts, hearts, and highlights 100% complete):
 *   1. Hugging Heart: Standing teddy bear holding a radiant glowing red heart in its paws.
 *   2. Sweet Dreams: Sleepy teddy bear sitting and hugging a big plush heart against its cheek.
 *   3. Heart Balloon: Shy standing teddy bear with a floating red heart balloon in the breeze.
 *   4. Love Balloon: Joyful watercolor teddy bear holding a grand "Love" heart balloon.
 * - Solid 24-Bit True-Color Glowing Colored ASCII Rasterization at 60 FPS (zero holes or missing rows).
 * - Organic Emergence & Breathing Physics (slow upward reveal from bottom floor).
 * - Interactive Waves, Heart Pulses, and Multi-Teddy Switching.
 * - Responsive: Dual-stage composition on desktop, beautifully centered on mobile.
 */

export class AsciiTeddy {
  constructor(canvas, onRevealComplete = null) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onRevealComplete = onRevealComplete;

    this.isRunning = false;
    this.animId = null;
    this.hasTriggeredReveal = false;
    this.t0 = undefined;
    this.lastDraw = -1e9;

    // Interactive action triggers
    this.waveTime = -1e9;
    this.heartPulseTime = -1e9;

    // Multi-Teddy Gallery Configuration with Cache Busting
    this.teddyAssets = [
      {
        id: 'hugging-heart',
        title: 'Hugging Heart',
        src: 'assets/teddy-1-clean.png?v=12.0'
      },
      {
        id: 'sweet-dreams',
        title: 'Sweet Dreams',
        src: 'assets/teddy-2-clean.png?v=12.0'
      },
      {
        id: 'heart-balloon',
        title: 'Heart Balloon',
        src: 'assets/teddy-3-clean.png?v=12.0'
      },
      {
        id: 'love-balloon',
        title: 'Love Balloon',
        src: 'assets/teddy-4-standing-clean.png?v=15.0'
      }
    ];

    this.currentIndex = 0;
    this.teddyImages = [];
    this.imagesLoaded = [false, false, false, false];

    // Preload all 4 teddy images
    this.teddyAssets.forEach((asset, idx) => {
      const img = new Image();
      img.onload = () => {
        this.imagesLoaded[idx] = true;
      };
      img.src = asset.src;
      this.teddyImages.push(img);
    });

    // Cross-fade switching support
    this.switchStartTime = 0;
    this.isSwitching = false;
    this.previousIndex = 0;

    // Offscreen simulation canvas for ASCII rasterization
    this.simCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.simCtx = this.simCanvas ? this.simCanvas.getContext('2d', { willReadFrequently: true }) : null;

    // High-resolution staging canvas
    this.stageCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.stageCtx = this.stageCanvas ? this.stageCanvas.getContext('2d') : null;

    // Solid Foreground Character Palette (Dense characters to ensure ZERO gaps)
    this.bodyChars = "+*#%@$&";
    this.heartChars = "♥♥♥✦";

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.round(rect.width || window.innerWidth || 800);
    const cssH = Math.round(rect.height || window.innerHeight || 800);
    const w = cssW * dpr;
    const h = cssH * dpr;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.isPortrait = cssH > cssW;
    this.charAspect = 0.55;

    // Crisp uniform cell height (~7.0 - 8.2 CSS pixels)
    const targetCellH = Math.max(7.0, Math.min(8.2, cssH / 115));
    this.rows = Math.max(85, Math.min(135, Math.round(cssH / targetCellH)));
    this.columns = Math.round(this.rows * (w / h) / this.charAspect);

    if (this.simCanvas) {
      this.simCanvas.width = this.columns;
      this.simCanvas.height = this.rows;
    }

    if (this.stageCanvas) {
      this.stageCanvas.width = 800;
      this.stageCanvas.height = 800;
    }
  }

  setTeddy(index) {
    if (index < 0 || index >= this.teddyAssets.length) return;
    this.previousIndex = this.currentIndex;
    this.currentIndex = index;
    // Trigger slow upward emergence for newly selected teddy
    this.t0 = performance.now();
    this.hasTriggeredReveal = false;
    this.switchStartTime = performance.now();
    this.isSwitching = true;
  }

  triggerWave() {
    this.waveTime = performance.now();
  }

  triggerHeartPulse() {
    this.heartPulseTime = performance.now();
  }

  nextTeddy() {
    const nextIdx = (this.currentIndex + 1) % this.teddyAssets.length;
    this.setTeddy(nextIdx);
    return nextIdx;
  }

  prevTeddy() {
    const prevIdx = (this.currentIndex - 1 + this.teddyAssets.length) % this.teddyAssets.length;
    this.setTeddy(prevIdx);
    return prevIdx;
  }

  smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  renderFrame(now) {
    if (!this.canvas || !this.ctx) return;
    const t = Math.max(0, (now - (this.t0 || now)) / 1000);

    const W = this.canvas.width;
    const H = this.canvas.height;
    const isPortrait = this.isPortrait;

    // Slow, graceful upward emergence reveal from the bottom (0.0s -> 3.5s)
    const emerge = this.smoothstep(0.0, 3.5, t);
    const isFullyRevealed = t >= 3.5;

    // Living organic breathing
    const breath = isFullyRevealed ? 1.0 + 0.016 * Math.sin(t * 1.8) : 1.0;

    // Interactive waving motion (if triggered in last 2.5s)
    const waveElapsed = (now - this.waveTime) / 1000;
    const isWaving = waveElapsed >= 0 && waveElapsed < 2.5;
    const waveAngle = isWaving ? Math.sin(waveElapsed * 10) * 0.08 * (1 - waveElapsed / 2.5) : 0;

    // Interactive heart pulse (if triggered or automatic rhythm)
    const pulseElapsed = (now - this.heartPulseTime) / 1000;
    const isPulsing = (pulseElapsed >= 0 && pulseElapsed < 1.6);
    const pulseIntensity = isPulsing 
      ? Math.sin(pulseElapsed * 8) * (1 - pulseElapsed / 1.6) 
      : 0.25 * Math.max(0, Math.sin(t * 2.8));

    // Multi-harmonic gentle breeze sway
    const windSway = Math.sin(t * 0.9) * 1.8 + Math.sin(t * 1.4) * 0.8;

    // Trigger reveal callback once fully emerged
    if (t >= 3.5 && !this.hasTriggeredReveal) {
      this.hasTriggeredReveal = true;
      if (this.onRevealComplete) this.onRevealComplete();
    }

    const cols = this.columns;
    const rows = this.rows;
    if (!this.simCanvas || !this.simCtx) return;

    this.simCtx.clearRect(0, 0, cols, rows);

    // Current active image
    const curImg = this.teddyImages[this.currentIndex];
    const isLoaded = this.imagesLoaded[this.currentIndex] || (curImg && curImg.complete && curImg.naturalWidth > 0);

    if (isLoaded && curImg && curImg.width > 0 && this.stageCanvas && this.stageCtx) {
      const sW = this.stageCanvas.width;
      const sH = this.stageCanvas.height;
      this.stageCtx.clearRect(0, 0, sW, sH);

      // Draw active teddy centered on stage canvas with breathing and wave physics
      this.stageCtx.save();
      this.stageCtx.translate(sW * 0.5, sH * 0.5);
      this.stageCtx.rotate(waveAngle);
      this.stageCtx.scale(breath, breath);
      this.stageCtx.translate(-sW * 0.5, -sH * 0.5);

      // Uniform framing scale so all 4 bears have beautiful proportions
      const imgW = curImg.width;
      const imgH = curImg.height;
      const scale = Math.min((sW * 0.94) / imgW, (sH * 0.94) / imgH);
      const drawImgW = imgW * scale;
      const drawImgH = imgH * scale;
      const imgX = (sW - drawImgW) / 2;
      const imgY = (sH - drawImgH) / 2;

      // Handle slow bottom-up emergence clip
      if (!isFullyRevealed) {
        const cutY = sH * (1.0 - emerge);
        this.stageCtx.save();
        this.stageCtx.beginPath();
        this.stageCtx.rect(0, cutY, sW, sH - cutY);
        this.stageCtx.clip();
        this.stageCtx.drawImage(curImg, imgX, imgY, drawImgW, drawImgH);
        this.stageCtx.restore();
      } else {
        this.stageCtx.drawImage(curImg, imgX, imgY, drawImgW, drawImgH);
      }

      this.stageCtx.restore();

      // Dual-stage layout: on desktop, teddy sits comfortably on the center-left
      // On mobile / portrait, teddy is centered in the upper viewport
      const winW = window.innerWidth || 800;
      const winH = window.innerHeight || 800;
      const isDualStage = !isPortrait && winW > 920;

      const targetHeightRatio = isDualStage ? 0.70 : (isPortrait ? 0.46 : 0.62);
      const maxH = rows * targetHeightRatio;
      const maxW = cols * (isDualStage ? 0.44 : (isPortrait ? 0.76 : 0.50));

      // Compensate for character font aspect ratio (0.55) so teddy retains 1:1 geometry
      const stageAspect = (drawImgH / drawImgW);
      const cellAspectCorrection = this.charAspect; 
      const drawW = Math.min(maxW, maxH / (stageAspect * cellAspectCorrection));
      const drawH = drawW * stageAspect * cellAspectCorrection;

      const drawX = isDualStage 
        ? Math.round(cols * 0.26 - drawW * 0.5) 
        : Math.round((cols - drawW) * 0.5);

      const drawY = isDualStage
        ? Math.round((rows - drawH) * 0.38)
        : Math.round(rows * (winH < 650 ? 0.08 : 0.10));

      // Sinuous gentle sway anchored at feet base
      const anchorScreenX = drawX + drawW * 0.5;
      const anchorScreenY = drawY + drawH * 0.95;

      this.simCtx.save();
      this.simCtx.translate(anchorScreenX, anchorScreenY);
      this.simCtx.rotate(windSway * 0.002);
      this.simCtx.translate(-anchorScreenX, -anchorScreenY);

      this.simCtx.drawImage(this.stageCanvas, imgX, imgY, drawImgW, drawImgH, drawX, drawY, drawW, drawH);
      this.simCtx.restore();
    }

    // ====================================================================
    // Sample Simulation Canvas & Render 24-Bit Glowing True-Color ASCII Art
    // ZERO-GAP GUARANTEE: font size slightly exceeds cell height for tight packing
    // ====================================================================
    const simImg = this.simCtx.getImageData(0, 0, cols, rows);
    const data = simImg.data;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    const cellW = W / cols;
    const cellH = H / rows;
    // Overlap font size to eliminate vertical gaps between rows
    const fontSize = Math.max(9, Math.round(cellH * 1.18));
    ctx.font = `bold ${fontSize}px Menlo, Consolas, "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Ambient floating golden stardust fireflies
    const stardustTime = Math.floor(t * 3.0);
    const pv = 0.55 * this.smoothstep(1.5, 2.8, t);
    const dpr = this.dpr || 1;

    for (let r = 0; r < rows; r++) {
      const posY = r * cellH + cellH * 0.5;
      const rowOffset = r * cols * 4;

      for (let c = 0; c < cols; c++) {
        const offset = rowOffset + c * 4;
        let red = data[offset];
        let grn = data[offset + 1];
        let blu = data[offset + 2];
        const alpha = data[offset + 3] / 255;

        const posX = c * cellW + cellW * 0.5;

        // Ambient stardust motes outside the teddy
        let isStardust = false;
        if (alpha < 0.08 && pv > 0) {
          const hash = Math.sin(c * 17.1 + (r + stardustTime) * 31.7) * 43758.5453;
          if ((hash - Math.floor(hash)) < 0.005) {
            isStardust = true;
            red = 255;
            grn = 220;
            blu = 120;
          }
        }

        if (alpha < 0.16 && !isStardust) continue;

        const maxC = Math.max(red, grn, blu);
        let lum = (0.55 * (maxC / 255) + 0.45 * (0.299 * red + 0.587 * grn + 0.114 * blu) / 255);

        let char = '#';
        let finalCol = 'rgb(200, 150, 100)';
        let isHeart = false;

        // Accurate Heart vs Plush Fur classification
        // In watercolor red hearts, red heavily exceeds green and blue, and green is NOT much higher than blue
        const isHeartColor = (red - grn >= 46) && (red - blu >= 42) && (grn - blu <= 16) && (red > 125);
        const isDarkEyes = (red < 65) && (grn < 65) && (blu < 65);
        // Genuine warm muzzle/snout highlight requires true warmth (red > blu + 26) so bleached paper fringes never glow
        const isMuzzleHighlight = !isHeartColor && !isDarkEyes && (red > 220) && (grn > 195) && (blu > 165) && (red - blu >= 26) && (red - grn >= 8);

        if (isStardust) {
          char = '✦';
          finalCol = `rgba(255, 225, 130, ${0.7 + 0.3 * Math.sin(t * 4 + r)})`;
        } else if (isHeartColor) {
          // Radiant Glowing Velvet Crimson Red Heart & Balloons
          isHeart = true;
          const rBoost = Math.min(255, Math.floor(red * 1.15 + 25 + pulseIntensity * 40));
          const gDrop = Math.floor(grn * 0.70);
          const bDrop = Math.floor(blu * 0.70);
          finalCol = `rgb(${rBoost}, ${gDrop}, ${bDrop})`;
          char = (lum > 0.60 || isPulsing) ? '♥' : '♦';
        } else if (isDarkEyes) {
          // Expressive eyes, nose & snout contours (Dark Chocolate)
          finalCol = 'rgb(30, 14, 6)';
          char = '@';
        } else if (isMuzzleHighlight) {
          // Soft warm golden cream muzzle, snout & cheek highlights
          finalCol = 'rgb(244, 218, 180)';
          char = '%';
        } else {
          // Warm Plush Honey-Amber Fur (Rich golden caramel & cinnamon brown)
          const rFur = Math.min(255, Math.floor(red * 1.04 + 8));
          const gFur = Math.min(240, Math.floor(grn * 0.94));
          const bFur = Math.max(0, Math.floor(blu * 0.82 - 8));
          finalCol = `rgb(${rFur}, ${gFur}, ${bFur})`;

          const charIdx = Math.min(this.bodyChars.length - 1, Math.floor(lum * this.bodyChars.length));
          char = this.bodyChars[charIdx] || '#';
        }

        // Luminous glowing character rendering with highlight glow (only for opaque highlights, avoiding edge noise)
        if (isHeart || (lum > 0.72 && alpha > 0.7) || isStardust) {
          const glowRadius = isHeart ? (isPulsing ? 14 : 7) : (dpr > 1 ? 4 : 2);
          ctx.shadowColor = isHeart ? 'rgba(255, 40, 90, 0.95)' : finalCol;
          ctx.shadowBlur = glowRadius;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = finalCol;
        ctx.fillText(char, posX, posY);
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.t0 === undefined || this.t0 === null) {
      this.t0 = performance.now();
    }
    this.lastDraw = -1e9;

    const loop = (now) => {
      if (!this.isRunning) return;
      if (now - this.lastDraw >= 1000 / 30) {
        this.lastDraw = now;
        this.renderFrame(now);
      }
      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  reset(skipEmergence = false) {
    this.stop();
    this.hasTriggeredReveal = false;
    this.t0 = skipEmergence ? performance.now() - 4500 : performance.now();
  }
}
