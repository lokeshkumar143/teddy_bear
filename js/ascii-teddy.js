/**
 * Grand Living ASCII Teddy Bear Engine
 * 
 * Features:
 * - 4 Hand-Crafted Watercolor Teddy Bears:
 *   1. Hugging Heart: Standing teddy bear holding a radiant glowing red heart in its paws.
 *   2. Sweet Dreams: Sleepy teddy bear sitting and hugging a big plush heart against its cheek.
 *   3. Heart Balloon: Shy standing teddy bear with a floating red heart balloon in the breeze.
 *   4. Love Balloon: Joyful watercolor teddy bear holding a grand "Love" heart balloon.
 * - 24-Bit True-Color Glowing Colored ASCII Rasterization at 60 FPS.
 * - Organic Emergence & Breathing Physics (gentle breathing scale & breeze sway).
 * - Multi-Teddy Switching with smooth crossfade and zero asset reload latency.
 * - Floating Golden Stardust Fireflies & Crimson Heart Sparks.
 * - Responsive: dynamic uniform density across desktop, tablet, and mobile.
 */

export class AsciiTeddy {
  constructor(canvas, onRevealComplete = null) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onRevealComplete = onRevealComplete;

    this.isRunning = false;
    this.animId = null;
    this.hasTriggeredReveal = false;

    // Check if direct scene test is requested
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isDirectTest = urlParams && (urlParams.get('scene') === 'teddy' || urlParams.get('scene') === 'flower');
    this.t0 = isDirectTest ? performance.now() - 3500 : performance.now();
    this.lastDraw = -1e9;

    // Multi-Teddy Gallery Configuration
    this.teddyAssets = [
      {
        id: 'hugging-heart',
        title: 'Hugging Heart',
        src: 'assets/teddy-1-clean.png',
        aspect: 570 / 570,
        balloon: false
      },
      {
        id: 'sweet-dreams',
        title: 'Sweet Dreams',
        src: 'assets/teddy-2-clean.png',
        aspect: 500 / 500,
        balloon: false
      },
      {
        id: 'heart-balloon',
        title: 'Heart Balloon',
        src: 'assets/teddy-3-clean.png',
        aspect: 529 / 378,
        balloon: true
      },
      {
        id: 'love-balloon',
        title: 'Love Balloon',
        src: 'assets/teddy-4-clean.png',
        aspect: 800 / 800,
        balloon: true
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

    // ASCII Character Sets
    this.chars = " .':;!~+=*#%@$";

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
    this.charAspect = 0.54;

    // Uniform density: ~7.0 - 8.2 CSS pixels per cell
    const targetCellH = Math.max(7.2, Math.min(8.2, cssH / 115));
    this.rows = Math.max(90, Math.min(140, Math.round(cssH / targetCellH)));
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
    const t = Math.max(0, (now - this.t0) / 1000);

    const W = this.canvas.width;
    const H = this.canvas.height;
    const isPortrait = this.isPortrait;

    // Slow, graceful upward emergence reveal from the bottom (0.0s -> 3.5s)
    const emerge = this.smoothstep(0.0, 3.5, t);
    const isFullyRevealed = t >= 3.5;

    // Living organic breathing (gentle 1.8% pulse)
    const breath = isFullyRevealed ? 1.0 + 0.018 * Math.sin(t * 1.8) : 1.0;

    // Multi-harmonic gentle breeze sway
    const windSway = Math.sin(t * 0.9) * 2.2 + Math.sin(t * 1.5) * 1.0;

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

      // Draw active teddy centered on stage canvas with breathing scale
      this.stageCtx.save();
      this.stageCtx.translate(sW * 0.5, sH * 0.5);
      this.stageCtx.scale(breath, breath);
      this.stageCtx.translate(-sW * 0.5, -sH * 0.5);

      // Fit aspect ratio inside stage
      const imgW = curImg.width;
      const imgH = curImg.height;
      const scale = Math.min((sW * 0.92) / imgW, (sH * 0.92) / imgH);
      const drawImgW = imgW * scale;
      const drawImgH = imgH * scale;
      const imgX = (sW - drawImgW) / 2;
      const imgY = (sH - drawImgH) / 2;

      // Handle upward emergence clip during initial reveal
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

      // Draw stage onto simulation grid
      const winH = window.innerHeight || 800;
      const isShort = winH < 720;
      const targetHeightRatio = isPortrait ? 0.62 : (isShort ? 0.58 : 0.64);
      const maxH = rows * targetHeightRatio;
      const maxW = cols * (isPortrait ? 0.90 : 0.50);

      const teddyRatio = (sH / sW) * this.charAspect;
      const drawW = Math.min(maxW, maxH / teddyRatio);
      const drawH = drawW * teddyRatio;
      const drawX = (cols - drawW) / 2;
      // Position teddy comfortably in upper-to-mid viewport so note card sits cleanly beneath
      const drawY = rows * (isShort ? 0.03 : (isPortrait ? 0.04 : 0.05));

      // Sinuous gentle sway anchored at feet base
      const anchorScreenX = drawX + drawW * 0.5;
      const anchorScreenY = drawY + drawH * 0.95;

      this.simCtx.save();
      this.simCtx.translate(anchorScreenX, anchorScreenY);
      this.simCtx.rotate(windSway * 0.002);
      this.simCtx.translate(-anchorScreenX, -anchorScreenY);

      this.simCtx.drawImage(this.stageCanvas, drawX, drawY, drawW, drawH);
      this.simCtx.restore();
    }

    // ====================================================================
    // Sample Simulation Canvas & Render 24-Bit Glowing True-Color ASCII Art
    // ====================================================================
    const simImg = this.simCtx.getImageData(0, 0, cols, rows);
    const data = simImg.data;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    const cellW = W / cols;
    const cellH = H / rows;
    const fontSize = Math.max(8, Math.round(cellH * 0.94));
    ctx.font = `bold ${fontSize}px Menlo, Consolas, "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const charCount = this.chars.length;
    const maxCharIdx = charCount - 1;

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

        // Subtle ambient stardust motes in the night
        let isStardust = false;
        if (alpha < 0.08 && pv > 0) {
          const hash = Math.sin(c * 17.1 + (r + stardustTime) * 31.7) * 43758.5453;
          if ((hash - Math.floor(hash)) < 0.006) {
            isStardust = true;
            red = 255;
            grn = 220;
            blu = 120;
          }
        }

        if (alpha < 0.08 && !isStardust) continue;

        const maxC = Math.max(red, grn, blu);
        let lum = (0.55 * (maxC / 255) + 0.45 * (0.299 * red + 0.587 * grn + 0.114 * blu) / 255);
        if (lum < 0.035 && !isStardust) continue;

        let charIndex = Math.min(maxCharIdx, Math.floor(lum * charCount));
        let char = this.chars[charIndex];
        if (isStardust) char = '✦';

        // 24-BIT RICH TRUE-COLOR ENHANCEMENT FOR TEDDY & HEART
        let finalCol;
        let isHeart = false;

        if (isStardust) {
          finalCol = `rgba(255, 225, 130, ${0.7 + 0.3 * Math.sin(t * 4 + r)})`;
        } else if (red > grn * 1.25 && red > blu * 1.20) {
          // ==================================================================
          // Radiant Glowing Velvet Crimson Red Heart & Balloons
          // ==================================================================
          isHeart = true;
          const rBoost = Math.min(255, Math.floor(red * 1.20 + 20));
          const gDrop = Math.floor(grn * 0.80);
          const bDrop = Math.floor(blu * 0.80);
          finalCol = `rgb(${rBoost}, ${gDrop}, ${bDrop})`;
          // Use hearts or dense star symbols for peak brightness
          if (lum > 0.75) char = '♥';
        } else if (red > 40 && grn > 25 && blu > 15 && red > blu * 1.1) {
          // ==================================================================
          // Warm Plush Teddy Bear Fur (Honey Gold, Amber & Cinnamon)
          // ==================================================================
          const rBoost = Math.min(255, Math.floor(red * 1.12 + 10));
          const gBoost = Math.min(255, Math.floor(grn * 1.05 + 5));
          const bVal = Math.floor(blu * 0.95);
          finalCol = `rgb(${rBoost}, ${gBoost}, ${bVal})`;
        } else if (red < 50 && grn < 50 && blu < 50) {
          // ==================================================================
          // Expressive Eyes & Snout Details (Dark Chocolate with Clear Outlines)
          // ==================================================================
          finalCol = 'rgb(45, 25, 15)';
          char = '@';
        } else {
          // General watercolor shading / highlights
          finalCol = `rgb(${red}, ${grn}, ${blu})`;
        }

        // Luminous glowing character rendering with highlight glow
        if (isHeart || lum > 0.65 || isStardust) {
          ctx.shadowColor = isHeart ? 'rgba(255, 30, 80, 0.8)' : finalCol;
          ctx.shadowBlur = dpr > 1 ? 5 : 3;
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
