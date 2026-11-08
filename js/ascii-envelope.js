/**
 * Majestic Living 24-Bit ASCII Celestial Letter & Unsealing Ceremony Engine
 * 
 * Features:
 * - High-definition dual-canvas true-color ASCII rasterization matching DPR.
 * - Ornate Gilded Celestial Envelope with gold-leaf filigree, corner flourishes (✦ ✧ ⋆),
 *   rich ivory/rose-gold parchment shading, and royal crimson satin ribbons.
 * - Dimensional 3D Ruby & Gold Wax Seal with embossed heart (❤) and living heartbeat pulse.
 * - Interactive 3D Parallax & Floating Buoyancy reacting smoothly to cursor/touch movement.
 * - Cursor Stardust Trail: moving near the letter spawns swirling golden fairy sparks.
 * - Spectacular 4-Phase Unsealing Ceremony:
 *   1. Seal Crack & Shockwave: golden light rings and 80+ flying glowing crystal shards.
 *   2. Flap Unfold & Letter Ascent: 3D perspective flap flip, revealing glowing love decree.
 *   3. Cosmic Portal Dissolution: entire letter dissolves into ascending golden stardust & hearts.
 *   4. Seamless Teddy Handover: triggers onBurnComplete callback into Teddy Bear emergence.
 */

export class AsciiEnvelope {
  constructor(canvas, onBurnComplete = null) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onBurnComplete = onBurnComplete;

    this.isRunning = false;
    this.isUnsealing = false;
    this.unsealStartTime = 0;
    this.animId = null;
    this.hasTriggeredComplete = false;

    // Simulation & Staging Canvases
    this.simCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.simCtx = this.simCanvas ? this.simCanvas.getContext('2d', { willReadFrequently: true }) : null;

    this.stageCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.stageCtx = this.stageCanvas ? this.stageCanvas.getContext('2d') : null;

    // Interactive mouse / touch state
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.currTiltX = 0;
    this.currTiltY = 0;

    // Particle systems
    this.stardustParticles = [];
    this.sealShards = [];
    this.shockwaves = [];
    this.dissolveParticles = [];

    // Dynamic recipient name
    this.recipientName = 'Loki';
    this.multiLang = null;

    // ASCII Density Characters (high fidelity)
    this.densityChars = " .':;!~+=*#%@$";

    this.init();
  }

  setRecipientName(name, multiLangObj = null) {
    this.recipientName = (name || 'Loki').trim();
    this.multiLang = multiLangObj;
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    this.bindEvents();
  }

  bindEvents() {
    if (typeof window === 'undefined') return;

    const onMove = (e) => {
      const x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (x === null || y === null) return;

      const normX = (x / window.innerWidth) * 2 - 1;
      const normY = (y / window.innerHeight) * 2 - 1;
      this.mouseX = normX;
      this.mouseY = normY;

      // Spawn subtle ambient cursor stardust
      if (this.isRunning && !this.isUnsealing && Math.random() < 0.35) {
        this.spawnCursorStardust(x, y);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
  }

  spawnCursorStardust(clientX, clientY) {
    if (this.stardustParticles.length > 50) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const symbols = ['✦', '✧', '⋆', '·', '♡', '•'];
    this.stardustParticles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 40,
      vy: -15 - Math.random() * 35,
      life: 0,
      maxLife: 0.8 + Math.random() * 0.7,
      char: symbols[Math.floor(Math.random() * symbols.length)],
      color: Math.random() > 0.4 ? [255, 218, 110] : [255, 140, 180]
    });
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

    this.cssW = cssW;
    this.cssH = cssH;
    this.charAspect = 0.55;

    // High density grid for ultra-crisp readable ASCII artwork
    const isMobile = cssW < 768;
    const targetCellH = isMobile ? Math.max(7.0, cssH / 110) : Math.max(7.5, cssH / 125);
    this.rows = Math.max(80, Math.min(140, Math.round(cssH / targetCellH)));
    this.columns = Math.round(this.rows * (w / h) / this.charAspect);

    if (this.simCanvas) {
      this.simCanvas.width = this.columns;
      this.simCanvas.height = this.rows;
    }

    // High resolution vector staging canvas
    if (this.stageCanvas) {
      this.stageCanvas.width = 680;
      this.stageCanvas.height = 460;
    }
  }

  smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // =========================================================================
  // Vector Stage Drawing: Ornate Gilded Celestial Envelope & 3D Ruby Wax Seal
  // =========================================================================
  drawEnvelopeStage(ctx, t, unsealProgress) {
    const sW = this.stageCanvas.width;
    const sH = this.stageCanvas.height;
    ctx.clearRect(0, 0, sW, sH);

    const cx = sW * 0.5;
    const cy = sH * 0.5;

    // Envelope dimensions
    const envW = 540;
    const envH = 340;
    const x0 = cx - envW * 0.5;
    const y0 = cy - envH * 0.5;
    const x1 = cx + envW * 0.5;
    const y1 = cy + envH * 0.5;

    // Flap progress for unsealing (0 = fully closed, 1 = flipped wide open)
    const flapOpenProgress = Math.min(1.0, Math.max(0.0, (unsealProgress - 0.25) / 0.65));
    // Letter emerging upward from inside envelope
    const letterAscentProgress = Math.min(1.0, Math.max(0.0, (unsealProgress - 0.45) / 0.70));

    ctx.save();

    // 1. Soft Cosmic Nebula Glow Aura Behind Envelope
    const auraPulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    const auraRad = envW * (0.65 + 0.08 * auraPulse);
    const auraGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, auraRad);
    auraGrad.addColorStop(0, 'rgba(255, 190, 110, 0.28)');
    auraGrad.addColorStop(0.4, 'rgba(255, 70, 120, 0.16)');
    auraGrad.addColorStop(0.7, 'rgba(140, 60, 220, 0.08)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, auraRad, 0, Math.PI * 2);
    ctx.fill();

    // 2. Emerging Glowing Love Letter (Rises out when unsealing)
    if (letterAscentProgress > 0) {
      const letterShiftY = -letterAscentProgress * 150;
      ctx.save();
      ctx.translate(cx, cy + letterShiftY);

      // Letter Parchment
      const lW = envW * 0.88;
      const lH = envH * 0.78;
      const lGrad = ctx.createLinearGradient(-lW * 0.5, -lH * 0.5, lW * 0.5, lH * 0.5);
      lGrad.addColorStop(0, '#fffbf2');
      lGrad.addColorStop(0.5, '#faeed7');
      lGrad.addColorStop(1, '#f4dfbf');
      ctx.fillStyle = lGrad;
      ctx.shadowColor = 'rgba(255, 210, 140, 0.6)';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.roundRect(-lW * 0.5, -lH * 0.5, lW, lH, 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Golden Letter Filigree Border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(-lW * 0.5 + 8, -lH * 0.5 + 8, lW - 16, lH - 16);

      // Inscribed Love Dedication
      ctx.fillStyle = '#b8860b';
      ctx.font = 'bold 15px "Cinzel", "Cormorant Garamond", system-ui, sans-serif';
      ctx.textAlign = 'center';
      const safeName = (this.recipientName || 'Loki');
      ctx.fillText(`✦  A SACRED MESSAGE FOR ${safeName}  ✦`, 0, -lH * 0.5 + 38);

      ctx.font = 'italic 18px "Caveat", cursive';
      ctx.fillStyle = '#3a2113';
      ctx.fillText('"In a sky full of stars, you shine the brightest."', 0, -lH * 0.5 + 72);
      ctx.fillText('"Every gentle moment with you is a cherished gift."', 0, -lH * 0.5 + 104);
      ctx.fillText('Sending you boundless warmth & eternal affection...', 0, -lH * 0.5 + 132);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#e81d45';
      ctx.fillText('❤  L O K E S H   K U M A R  ❤', 0, -lH * 0.5 + 164);

      ctx.restore();
    }

    // 3. Envelope Body Backing & Pocket
    // Rich Warm Parchment Gradient
    const bodyGrad = ctx.createLinearGradient(x0, y0, x1, y1);
    bodyGrad.addColorStop(0, '#f9ecd7');
    bodyGrad.addColorStop(0.5, '#edd5b6');
    bodyGrad.addColorStop(1, '#dfc19c');

    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.beginPath();
    ctx.roundRect(x0, y0, envW, envH, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 4. Ornate Gilded Outer Filigree Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(x0 + 6, y0 + 6, envW - 12, envH - 12);

    ctx.strokeStyle = '#f3e5ab';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x0 + 12, y0 + 12, envW - 24, envH - 24);

    // Gilded Corner Stars
    ctx.fillStyle = '#f5c542';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', x0 + 18, y0 + 18);
    ctx.fillText('✦', x1 - 18, y0 + 18);
    ctx.fillText('✦', x0 + 18, y1 - 18);
    ctx.fillText('✦', x1 - 18, y1 - 18);

    // 5. Envelope Diagonal Crease Folds (Left & Right Flaps)
    ctx.strokeStyle = '#9e7b54';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    // Bottom fold to center
    ctx.moveTo(x0 + 6, y1 - 6);
    ctx.lineTo(cx, cy + 30);
    ctx.lineTo(x1 - 6, y1 - 6);
    // Side folds
    ctx.moveTo(x0 + 6, y0 + 6);
    ctx.lineTo(cx, cy + 30);
    ctx.moveTo(x1 - 6, y0 + 6);
    ctx.lineTo(cx, cy + 30);
    ctx.stroke();

    // 6. Gilded Royal Crimson Satin Ribbon Cross
    // Horizontal ribbon
    const ribH = 42;
    const ribGrad = ctx.createLinearGradient(x0, cy - ribH * 0.5, x0, cy + ribH * 0.5);
    ribGrad.addColorStop(0, '#c91838');
    ribGrad.addColorStop(0.4, '#ff3b65');
    ribGrad.addColorStop(0.7, '#a8102b');
    ribGrad.addColorStop(1, '#6b0619');

    ctx.fillStyle = ribGrad;
    ctx.fillRect(x0 + 12, cy - ribH * 0.5, envW - 24, ribH);

    // Gold borders along ribbon
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x0 + 12, cy - ribH * 0.5 - 2, envW - 24, 2.5);
    ctx.fillRect(x0 + 12, cy + ribH * 0.5 - 0.5, envW - 24, 2.5);

    // 7. Envelope Top Triangular Flap (Folds open during unsealing)
    const flapApexY = y0 + envH * 0.54;
    ctx.save();

    if (flapOpenProgress > 0) {
      // 3D Flap flip upward: flip scaleY from 1.0 to -1.0 anchored at y0
      const flapScaleY = 1.0 - 2.0 * flapOpenProgress;
      ctx.translate(0, y0);
      ctx.scale(1, flapScaleY);
      ctx.translate(0, -y0);
    }

    // Triangular Flap Shape
    ctx.beginPath();
    ctx.moveTo(x0 + 6, y0 + 6);
    ctx.lineTo(cx, flapApexY);
    ctx.lineTo(x1 - 6, y0 + 6);
    ctx.closePath();

    const flapGrad = ctx.createLinearGradient(cx, y0, cx, flapApexY);
    flapGrad.addColorStop(0, '#fff3df');
    flapGrad.addColorStop(0.85, '#edd1ad');
    flapGrad.addColorStop(1, '#dcb88f');

    ctx.fillStyle = flapGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Flap Gilded Edges
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    ctx.restore();

    // 8. Elegant Inscription Calligraphy On Front
    if (flapOpenProgress < 0.25) {
      ctx.font = 'bold 18px "Cinzel", "Cormorant Garamond", serif';
      ctx.fillStyle = '#b8860b';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fillText('✦  A  C E L E S T I A L   D E L I V E R Y  ✦', cx, y0 + 52);
      ctx.shadowBlur = 0;

      ctx.font = 'bold 18px "Inter", "Noto Sans Tamil", "Noto Sans Arabic", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      const rawRecipient = (this.recipientName || 'Loki').trim();
      const isPureLatin = /^[A-Za-z0-9 ]+$/.test(rawRecipient);
      const formattedTitle = isPureLatin
        ? `S P E C I A L L Y   F O R   ${rawRecipient.toUpperCase().split('').join(' ')}`
        : `SPECIALLY FOR  ${rawRecipient}`;
      ctx.fillText(formattedTitle, cx, cy - 38);
      ctx.shadowBlur = 0;
    }

    // 9. Grand 3D Ruby & Gold Wax Seal (Breaks during unsealing)
    const sealApexY = cy + 18;
    const sealBroken = unsealProgress > 0.15;

    if (!sealBroken) {
      const sealRad = 48;
      // Lub-dub realistic heartbeat pulse
      const hbTime = (t * 3.2) % (Math.PI * 2);
      const hbPulse = Math.sin(hbTime) > 0.4 ? 1.0 + 0.09 * Math.sin(hbTime * 2) : 1.0;
      const curSealRad = sealRad * hbPulse;

      // Radiant Golden Aura Waves radiating from Seal
      const auraWave1 = (t * 40) % 75;
      const auraWave2 = ((t * 40) + 38) % 75;
      ctx.strokeStyle = `rgba(255, 215, 0, ${Math.max(0, 0.55 - auraWave1 / 75)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, sealApexY, curSealRad + auraWave1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 100, 160, ${Math.max(0, 0.45 - auraWave2 / 75)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, sealApexY, curSealRad + auraWave2, 0, Math.PI * 2);
      ctx.stroke();

      // Scalloped Realistic Molten Wax Edge
      ctx.save();
      ctx.translate(cx, sealApexY);
      ctx.beginPath();
      const numTeeth = 18;
      for (let i = 0; i <= numTeeth * 2; i++) {
        const theta = (i / (numTeeth * 2)) * Math.PI * 2;
        const r = (i % 2 === 0 ? curSealRad + 5 : curSealRad - 1) + 2.5 * Math.sin(i * 3 + t);
        const px = Math.cos(theta) * r;
        const py = Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // 3D Shaded Molten Ruby Wax Gradient
      const waxGrad = ctx.createRadialGradient(-10, -12, 5, 0, 0, curSealRad + 8);
      waxGrad.addColorStop(0, '#ff476f');
      waxGrad.addColorStop(0.3, '#d8113b');
      waxGrad.addColorStop(0.75, '#990724');
      waxGrad.addColorStop(1, '#500110');

      ctx.fillStyle = waxGrad;
      ctx.shadowColor = 'rgba(255, 30, 80, 0.8)';
      ctx.shadowBlur = 26;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gilded Outer Rim Ring
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, curSealRad - 8, 0, Math.PI * 2);
      ctx.stroke();

      // Embossed Gilded Heart In Center
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffeaa7';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 30px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤', 0, 2);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // Unsealing Fireworks & Stardust Dissolution Mechanics
  // =========================================================================
  triggerClick() {
    if (this.isUnsealing) return;
    this.isUnsealing = true;
    this.unsealStartTime = performance.now() / 1000;

    const cx = this.cssW * 0.5;
    const cy = this.cssH * 0.5;

    // 1. Shatter Wax Seal into 80+ glowing crystal shards
    for (let i = 0; i < 90; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 280;
      const symbols = ['✦', '✧', '⋆', '♥', '♡', '•', '*'];
      this.sealShards.push({
        x: cx,
        y: cy + 18,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 50,
        life: 0,
        maxLife: 1.2 + Math.random() * 1.1,
        char: symbols[Math.floor(Math.random() * symbols.length)],
        color: Math.random() > 0.45 ? [255, 40, 95] : [255, 215, 0]
      });
    }

    // 2. Expanding Shockwave Rings
    this.shockwaves.push(
      { r: 10, maxR: Math.max(this.cssW, this.cssH) * 0.65, life: 0, maxLife: 1.2, color: [255, 215, 110] },
      { r: 5, maxR: Math.max(this.cssW, this.cssH) * 0.55, life: 0, maxLife: 1.5, color: [255, 80, 140] }
    );
  }

  // =========================================================================
  // Main True-Color 24-Bit ASCII Rendering Loop
  // =========================================================================
  render(tNow, dt) {
    if (!this.canvas || !this.ctx || !this.simCanvas || !this.simCtx) return;

    const unsealT = this.isUnsealing ? (tNow - this.unsealStartTime) : 0;
    const unsealProgress = this.isUnsealing ? Math.min(1.0, unsealT / 2.3) : 0;

    // Trigger complete callback once unsealing ceremony dissolves
    if (this.isUnsealing && unsealT > 2.4 && !this.hasTriggeredComplete) {
      this.hasTriggeredComplete = true;
      if (this.onBurnComplete) {
        this.onBurnComplete();
      }
    }

    // Smooth lerping 3D mouse parallax tilt
    this.currTiltX += (this.mouseX * 0.08 - this.currTiltX) * 0.12;
    this.currTiltY += (this.mouseY * 0.06 - this.currTiltY) * 0.12;

    // Floating celestial buoyancy
    const floatY = Math.sin(tNow * 1.8) * 8.0;

    // Step 1: Render vector artwork onto stageCanvas
    this.drawEnvelopeStage(this.stageCtx, tNow, unsealProgress);

    // Step 2: Draw transformed stageCanvas onto simCanvas
    const cols = this.columns;
    const rows = this.rows;
    this.simCtx.clearRect(0, 0, cols, rows);

    const sW = this.stageCanvas.width;
    const sH = this.stageCanvas.height;

    // Scale envelope to fit comfortably in viewport
    const isMobile = this.cssW < 768;
    const targetScale = isMobile ? 0.88 : (this.cssW > 1200 ? 0.68 : 0.74);
    const drawW = Math.round(cols * targetScale);
    const drawH = Math.round(drawW * (sH / sW) * this.charAspect);

    const drawX = Math.round((cols - drawW) * 0.5);
    const drawY = Math.round((rows - drawH) * 0.40 + (floatY / this.cssH) * rows);

    this.simCtx.save();
    // Parallax tilt translation
    this.simCtx.translate(drawX + drawW * 0.5, drawY + drawH * 0.5);
    this.simCtx.rotate(this.currTiltX * 0.5);
    this.simCtx.translate(-(drawX + drawW * 0.5), -(drawY + drawH * 0.5));

    // Envelope dissolution fade during final portal transition
    if (unsealProgress > 0.75) {
      this.simCtx.globalAlpha = Math.max(0, 1.0 - (unsealProgress - 0.75) / 0.25);
    }

    this.simCtx.drawImage(this.stageCanvas, 0, 0, sW, sH, drawX, drawY, drawW, drawH);
    this.simCtx.restore();

    // Step 3: Sample simCanvas pixels and render 24-Bit Glowing ASCII Cells
    const simImg = this.simCtx.getImageData(0, 0, cols, rows);
    const data = simImg.data;

    const W = this.canvas.width;
    const H = this.canvas.height;
    const cellW = W / cols;
    const cellH = H / rows;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    const fontSize = Math.max(8, Math.round(cellH * 1.16));
    ctx.font = `bold ${fontSize}px Menlo, Consolas, "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numChars = this.densityChars.length;

    for (let r = 0; r < rows; r++) {
      const posY = r * cellH + cellH * 0.5;
      const rowOffset = r * cols * 4;

      for (let c = 0; c < cols; c++) {
        const offset = rowOffset + c * 4;
        const alpha = data[offset + 3] / 255;
        if (alpha < 0.05) continue;

        const red = data[offset];
        const grn = data[offset + 1];
        const blu = data[offset + 2];

        // Perceptual luminance calculation
        const lum = (0.299 * red + 0.587 * grn + 0.114 * blu) / 255;
        const charIdx = Math.min(numChars - 1, Math.floor(lum * (numChars - 1)));
        const ch = this.densityChars[charIdx];

        const posX = c * cellW + cellW * 0.5;

        // True color glow
        ctx.fillStyle = `rgba(${red}, ${grn}, ${blu}, ${alpha.toFixed(2)})`;
        ctx.fillText(ch, posX, posY);
      }
    }

    // =========================================================================
    // Step 4: Overlay Dynamic Particles (Stardust, Wax Shards, Shockwaves)
    // =========================================================================
    const dpr = this.dpr || 1;

    // A. Expanding Shockwave Rings
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      if (sw.life >= sw.maxLife) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      const k = sw.life / sw.maxLife;
      const curR = (sw.r + (sw.maxR - sw.r) * Math.pow(k, 0.7)) * dpr;
      const alpha = (1 - k) * 0.75;
      const [cr, cg, cb] = sw.color;

      ctx.save();
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(2)})`;
      ctx.lineWidth = (3.5 - 2.5 * k) * dpr;
      ctx.shadowColor = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.shadowBlur = 14 * dpr;
      ctx.beginPath();
      ctx.arc(this.cssW * 0.5 * dpr, (this.cssH * 0.5 + 18) * dpr, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // B. Wax Shards & Exploding Heart Embers
    for (let i = this.sealShards.length - 1; i >= 0; i--) {
      const p = this.sealShards[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.sealShards.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity

      const k = 1.0 - (p.life / p.maxLife);
      const [pr, pg, pb] = p.color;

      ctx.save();
      ctx.font = `bold ${Math.round(15 * dpr)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${k.toFixed(2)})`;
      ctx.shadowColor = `rgb(${pr}, ${pg}, ${pb})`;
      ctx.shadowBlur = 8 * dpr;
      ctx.fillText(p.char, p.x * dpr, p.y * dpr);
      ctx.restore();
    }

    // C. Cursor Stardust Particles
    for (let i = this.stardustParticles.length - 1; i >= 0; i--) {
      const sp = this.stardustParticles[i];
      sp.life += dt;
      if (sp.life >= sp.maxLife) {
        this.stardustParticles.splice(i, 1);
        continue;
      }
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;

      const k = 1.0 - (sp.life / sp.maxLife);
      const [sr, sg, sb] = sp.color;

      ctx.save();
      ctx.font = `bold ${Math.round(13 * dpr)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${k.toFixed(2)})`;
      ctx.fillText(sp.char, sp.x * dpr, sp.y * dpr);
      ctx.restore();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.hasTriggeredComplete = false;
    let lastTime = performance.now();

    const loop = (now) => {
      if (!this.isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      this.render(now / 1000, dt);
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
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  reset() {
    this.stop();
    this.isUnsealing = false;
    this.unsealStartTime = 0;
    this.hasTriggeredComplete = false;
    this.sealShards = [];
    this.shockwaves = [];
    this.stardustParticles = [];
  }
}
