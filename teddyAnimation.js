/**
 * teddyAnimation.js
 * ============================================================================
 * Cyber-Romantic Holographic Teddy Bear Animation Engine
 * Features:
 * - Multi-theme chromatic colorways (Cyber Rose, Golden Honey, Cosmic Aurora, Dreamy Lavender)
 * - Delicate, soft-plush ASCII & binary character matrix with 3D spherical lighting
 * - Dual-pulse physiological heartbeat with radiating light shockwaves
 * - Interactive cursor stardust trail & shooting stars
 * - Personalized glowing name badge & embedded algorithmic fur runes
 * - Organic smoothstep bloom reveal & interactive waving paw physics
 * ============================================================================
 */

class TeddyAnimation {
  constructor() {
    this.name = "Someone Special";
    this.nameLetters = [];

    // Screen dimensions & placement (Hero center in 1080x1920)
    this.COLS = 66;
    this.ROWS = 64;
    this.CELL_W = 14;
    this.CELL_H = 20;
    this.GRID_X0 = Math.floor((1080 - this.COLS * this.CELL_W) / 2); // 78px margin
    this.GRID_Y0 = 180;

    this.CENTER_X = 540.0;
    this.CENTER_Y = 820.0;
    this.SCENE_SCALE = 1080.0;

    // Timeline state
    this.bloomProgress = 0.0;
    this.bloomDuration = 9.0;
    this.isBloomed = false;
    this.time = 0.0;

    // Interactive gestures
    this.mouse = { x: 540, y: 820, nx: 0, ny: 0, isNear: false, isHovering: false };
    this.lookOffset = { x: 0, y: 0 };
    this.headTilt = 0.0;
    this.bounce = 0.0;

    // Blinking
    this.blinkValue = 0.0;
    this.blinkTimer = 2.5;
    this.isBlinking = false;

    // Ear wiggling
    this.earWiggleTimer = 3.5;
    this.earWiggleAmount = 0.0;

    // Waving paw
    this.isWaving = false;
    this.waveTimer = 0.0;
    this.waveDuration = 3.5;

    // Shy reaction
    this.shyReaction = 0.0;

    // Heartbeat physics (Lub-Dub rhythm)
    this.heartScale = 1.0;
    this.heartBeatIntensity = 0.0;
    this.lastBeatTime = 0.0;

    // Concentric heartbeat shockwaves
    this.shockwaves = [];

    // Shooting stars / Cosmic meteors
    this.shootingStars = [];
    this.shootingStarTimer = 3.0;

    // Cursor fairy dust trail
    this.cursorParticles = [];

    // Themes
    this.themes = {
      cyberRose: {
        name: "Cyber Rose",
        icon: "💖",
        furBase: [255, 115, 145],
        furShadow: [215, 80, 110],
        furGlow: "rgba(255, 75, 125, 0.45)",
        heartCore: [255, 12, 65],
        heartHighlight: [255, 60, 120],
        heartEdge: [255, 230, 242],
        heartGlow: "rgba(255, 15, 75, 1.0)",
        bow: [52, 211, 153],
        bowGlow: "rgba(52, 211, 153, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(254, 240, 138, 1.0)",
        snout: [255, 245, 235],
        nebula: "rgba(255, 45, 95, 0.12)"
      },
      goldenHoney: {
        name: "Golden Honey",
        icon: "🍯",
        furBase: [245, 175, 80],
        furShadow: [210, 135, 45],
        furGlow: "rgba(245, 170, 70, 0.45)",
        heartCore: [255, 25, 25],
        heartHighlight: [255, 75, 45],
        heartEdge: [255, 240, 220],
        heartGlow: "rgba(255, 30, 35, 1.0)",
        bow: [239, 68, 68],
        bowGlow: "rgba(239, 68, 68, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(255, 245, 180, 1.0)",
        snout: [255, 250, 235],
        nebula: "rgba(245, 160, 50, 0.12)"
      },
      cosmicAurora: {
        name: "Cosmic Aurora",
        icon: "🌌",
        furBase: [130, 175, 255],
        furShadow: [85, 130, 215],
        furGlow: "rgba(100, 160, 255, 0.45)",
        heartCore: [255, 15, 125],
        heartHighlight: [255, 90, 185],
        heartEdge: [245, 230, 255],
        heartGlow: "rgba(255, 20, 130, 1.0)",
        bow: [56, 189, 248],
        bowGlow: "rgba(56, 189, 248, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(186, 230, 253, 1.0)",
        snout: [240, 248, 255],
        nebula: "rgba(147, 51, 234, 0.12)"
      },
      dreamyLavender: {
        name: "Dreamy Lavender",
        icon: "💜",
        furBase: [195, 145, 245],
        furShadow: [155, 105, 210],
        furGlow: "rgba(180, 130, 240, 0.45)",
        heartCore: [255, 15, 90],
        heartHighlight: [255, 80, 145],
        heartEdge: [255, 230, 250],
        heartGlow: "rgba(255, 20, 95, 1.0)",
        bow: [251, 146, 60],
        bowGlow: "rgba(251, 146, 60, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(245, 208, 254, 1.0)",
        snout: [250, 245, 255],
        nebula: "rgba(192, 132, 252, 0.12)"
      }
    };
    this.currentThemeKey = "cyberRose";

    // Grid data
    this.canonicalGrid = [];

    // Cosmic background elements
    this.stars = [];
    this.sparkleStars = [];
    this.initStarfield(150, 16);

    this.ambientParticles = [];
    this.initAmbientParticles(65);

    this.floatingHearts = [];
    this.initFloatingHearts(20);

    this.precomputeGrid();
  }

  getTheme() {
    return this.themes[this.currentThemeKey] || this.themes.cyberRose;
  }

  setTheme(themeKey) {
    if (this.themes[themeKey]) {
      this.currentThemeKey = themeKey;
      this.precomputeGrid();
      this.triggerShockwave();
    }
  }

  setName(name) {
    if (!name || !name.trim()) name = "Someone Special";
    this.name = name.trim();
    const cleaned = this.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
    this.nameLetters = cleaned.length > 0 ? Array.from(cleaned) : ["♥", "★", "A"];
    this.precomputeGrid();
  }

  getBadgeText() {
    const clean = this.name.toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim();
    if (!clean) return "✧ ♥ ✧";
    if (clean.length <= 6) return `✧  ${clean.split("").join(" ")}  ✧`;
    if (clean.length <= 10) return `✧ ${clean} ✧`;
    if (clean.length <= 16) return `♥ ${clean} ♥`;
    return clean.slice(0, 18);
  }

  initStarfield(dotCount, sparkleCount) {
    let s = 1337;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

    this.stars = [];
    for (let i = 0; i < dotCount; i++) {
      this.stars.push({
        x: 15 + rnd() * 1050,
        y: 20 + rnd() * 1880,
        freq: 0.8 + rnd() * 2.8,
        phase: rnd() * Math.PI * 2,
        baseBrightness: 0.35 + rnd() * 0.65,
        colorType: rnd() > 0.7 ? "rose" : (rnd() > 0.4 ? "gold" : "blue")
      });
    }

    const sparkleCoords = [
      [110, 140], [970, 170], [130, 520], [950, 550],
      [160, 960], [920, 930], [140, 1420], [940, 1390],
      [540, 90],  [280, 320], [800, 310], [540, 1750],
      [360, 680], [720, 680], [220, 1200], [860, 1200]
    ];
    this.sparkleStars = sparkleCoords.map(([sx, sy], i) => ({
      x: sx, y: sy,
      freq: 0.85 + (i % 4) * 0.35,
      phase: i * 1.2
    }));
  }

  initAmbientParticles(count) {
    let s = 777;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: rnd() * 1080,
        y: rnd() * 1920,
        vx: (rnd() - 0.5) * 16,
        vy: -12 - rnd() * 22,
        size: 1.5 + rnd() * 3.5,
        alpha: 0.2 + rnd() * 0.7,
        hue: rnd() > 0.4 ? 345 : (rnd() > 0.5 ? 355 : 45),
        phase: rnd() * Math.PI * 2
      });
    }
  }

  initFloatingHearts(count) {
    let s = 999;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    this.floatingHearts = [];
    for (let i = 0; i < count; i++) {
      this.floatingHearts.push({
        xRel: -0.22 + rnd() * 0.44,
        speed: 0.12 + rnd() * 0.14,
        wobbleFreq: 1.8 + rnd() * 1.5,
        wobbleAmp: 0.025 + rnd() * 0.035,
        phase: rnd() * Math.PI * 2,
        period: 3.2 + rnd() * 1.8,
        timeOffset: i * 0.28,
        char: ["♥", "♡", "★", "✧", "o"][Math.floor(rnd() * 5)],
        colR: Math.floor(250 + rnd() * 5),
        colG: Math.floor(70 + rnd() * 60),
        colB: Math.floor(130 + rnd() * 60)
      });
    }
  }

  safeChar(arr, idx, fallback = "♥") {
    if (!arr || arr.length === 0) return fallback;
    const i = ((idx % arr.length) + arr.length) % arr.length;
    return arr[i] || fallback;
  }

  /**
   * Precomputes cell geometry with delicate plush ASCII and theme colorway
   */
  precomputeGrid() {
    this.canonicalGrid = [];
    const badgeText = this.getBadgeText();
    const badgeStartC = Math.floor((this.COLS - badgeText.length) / 2);
    const BADGE_ROW = 38; // Aligns with central heart belly (ny ~ 0.14)
    const theme = this.getTheme();

    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      const py = this.GRID_Y0 + r * this.CELL_H + this.CELL_H / 2;
      const ny = (py - this.CENTER_Y) / this.SCENE_SCALE;

      const isBadgeRow = (r === BADGE_ROW);

      for (let c = 0; c < this.COLS; c++) {
        const px = this.GRID_X0 + c * this.CELL_W + this.CELL_W / 2;
        const nx = (px - this.CENTER_X) / this.SCENE_SCALE;

        const badgeIdx = c - badgeStartC;
        const isBadgeCol = isBadgeRow && (badgeIdx >= 0 && badgeIdx < badgeText.length);
        const bChar = isBadgeCol ? badgeText[badgeIdx] : "";

        const evaluated = this.evalSceneShapes(nx, ny, 1.0, isBadgeCol, bChar, theme);
        const rv = evaluated.part !== "bg" ? this.calcRevealStage(evaluated.part, nx, ny) : 999.0;

        row.push({
          nx, ny,
          part: evaluated.part,
          char: evaluated.char,
          color: evaluated.color,
          glow: evaluated.glow,
          reveal: rv,
          hash: Math.abs((c * 37 + r * 17)) % 7
        });
      }
      this.canonicalGrid.push(row);
    }
  }

  /**
   * Anatomically Sculpted Mathematical Shape Evaluation with Soft Plush Aesthetic
   */
  evalSceneShapes(nx, ny, heartScale = 1.0, isBadgeCol = false, badgeChar = "", theme = null) {
    if (!theme) theme = this.getTheme();

    // ------------------------------------------------------------------------
    // 1. Radiant Glowing Heart (Cardioid Circle-Wedge Geometry)
    // ------------------------------------------------------------------------
    const hx = nx / (0.24 * heartScale);
    const hy = -(ny - 0.14) / (0.22 * heartScale);
    const distSqL = Math.pow(hx + 0.38, 2) + Math.pow(hy - 0.20, 2);
    const distSqR = Math.pow(hx - 0.38, 2) + Math.pow(hy - 0.20, 2);
    const cL = distSqL <= 0.44 * 0.44;
    const cR = distSqR <= 0.44 * 0.44;
    const inWedge = (hy <= 0.20) && (hy >= 1.15 * Math.abs(hx) - 0.85) && (Math.abs(hx) <= 0.82);
    const isHeart = cL || cR || inWedge;

    const isEdgeL = cL && (distSqL >= 0.35 * 0.35);
    const isEdgeR = cR && (distSqR >= 0.35 * 0.35);
    const isEdgeW = inWedge && (Math.abs(hy - (1.15 * Math.abs(hx) - 0.85)) < 0.12 || Math.abs(hx) >= 0.72);
    const isHeartEdge = isHeart && (isEdgeL || isEdgeR || isEdgeW);

    // Single-line clean embroidered badge on heart
    const isBadge = isHeart && isBadgeCol;

    // ------------------------------------------------------------------------
    // 2. Ears (Round & Puffy with soft inner ear cushions)
    // ------------------------------------------------------------------------
    const earL = Math.pow((nx + 0.19) / 0.088, 2) + Math.pow((ny + 0.285) / 0.070, 2) <= 1.0;
    const earR = Math.pow((nx - 0.19) / 0.088, 2) + Math.pow((ny + 0.285) / 0.070, 2) <= 1.0;
    const isEarOut = earL || earR;

    const earInL = Math.pow((nx + 0.19) / 0.050, 2) + Math.pow((ny + 0.285) / 0.040, 2) <= 1.0;
    const earInR = Math.pow((nx - 0.19) / 0.050, 2) + Math.pow((ny + 0.285) / 0.040, 2) <= 1.0;
    const isEarIn = earInL || earInR;

    // ------------------------------------------------------------------------
    // 3. Head (Chubby, round chibi head with soft cheeks)
    // ------------------------------------------------------------------------
    const headD = Math.pow(nx / 0.25, 2) + Math.pow((ny + 0.14) / 0.19, 2);
    const isHead = headD <= 1.0;

    // ------------------------------------------------------------------------
    // 4. Soulful Eyes & Specular Star Highlights
    // ------------------------------------------------------------------------
    const eyeL = Math.pow((nx + 0.10) / 0.028, 2) + Math.pow((ny + 0.16) / 0.036, 2) <= 1.0;
    const eyeR = Math.pow((nx - 0.10) / 0.028, 2) + Math.pow((ny + 0.16) / 0.036, 2) <= 1.0;
    const isEye = eyeL || eyeR;

    const eyeHlL = Math.pow((nx + 0.105) / 0.012, 2) + Math.pow((ny + 0.17) / 0.014, 2) <= 1.0;
    const eyeHlR = Math.pow((nx - 0.095) / 0.012, 2) + Math.pow((ny + 0.17) / 0.014, 2) <= 1.0;
    const isEyeHl = (this.blinkValue < 0.5) && (eyeHlL || eyeHlR);

    // ------------------------------------------------------------------------
    // 5. Snout (Muzzle), Cute Chocolate Button Nose, and Sweet Smile
    // ------------------------------------------------------------------------
    const snoutD = Math.pow(nx / 0.105, 2) + Math.pow((ny + 0.09) / 0.060, 2);
    const isSnout = snoutD <= 1.0;

    const noseD = Math.pow(nx / 0.035, 2) + Math.pow((ny + 0.11) / 0.022, 2);
    const isNose = noseD <= 1.0;

    const isMouth = (Math.abs(nx) < 0.035) && (-0.085 <= ny && ny <= -0.065);

    // ------------------------------------------------------------------------
    // 6. Rosy Cheeks Blush
    // ------------------------------------------------------------------------
    const blushL = Math.pow((nx + 0.165) / 0.040, 2) + Math.pow((ny + 0.11) / 0.026, 2) <= 1.0;
    const blushR = Math.pow((nx - 0.165) / 0.040, 2) + Math.pow((ny + 0.11) / 0.026, 2) <= 1.0;
    const isBlush = blushL || blushR;

    // ------------------------------------------------------------------------
    // 7. Silk Bowtie under chin
    // ------------------------------------------------------------------------
    const bowKnot = Math.pow(nx / 0.025, 2) + Math.pow((ny + 0.02) / 0.020, 2) <= 1.0;
    const bowL = Math.pow((nx + 0.055) / 0.038, 2) + Math.pow((ny + 0.02) / 0.024, 2) <= 1.0;
    const bowR = Math.pow((nx - 0.055) / 0.038, 2) + Math.pow((ny + 0.02) / 0.024, 2) <= 1.0;
    const isBow = bowL || bowR;

    // ------------------------------------------------------------------------
    // 8. Paws Hugging the Heart Sides
    // ------------------------------------------------------------------------
    const pawL = Math.pow((nx + 0.17) / 0.065, 2) + Math.pow((ny - 0.13) / 0.055, 2) <= 1.0;
    const pawR = Math.pow((nx - 0.17) / 0.065, 2) + Math.pow((ny - 0.13) / 0.055, 2) <= 1.0;
    const isPaw = pawL || pawR;

    const pawPadL = Math.pow((nx + 0.17) / 0.035, 2) + Math.pow((ny - 0.13) / 0.028, 2) <= 1.0;
    const pawPadR = Math.pow((nx - 0.17) / 0.035, 2) + Math.pow((ny - 0.13) / 0.028, 2) <= 1.0;
    const isPawPad = pawPadL || pawPadR;

    // ------------------------------------------------------------------------
    // 9. Pear-shaped Plush Torso (Behind the heart)
    // ------------------------------------------------------------------------
    const bw = 0.26 * (1.0 + 0.15 * (ny - 0.05));
    const bodyD = Math.pow(nx / bw, 2) + Math.pow((ny - 0.18) / 0.18, 2);
    const isBody = (bodyD <= 1.0) && (ny <= 0.32);

    // ------------------------------------------------------------------------
    // 10. Seated Feet Paws with Soft Cream Soles
    // ------------------------------------------------------------------------
    const footL = Math.pow((nx + 0.20) / 0.095, 2) + Math.pow((ny - 0.35) / 0.065, 2) <= 1.0;
    const footR = Math.pow((nx - 0.20) / 0.095, 2) + Math.pow((ny - 0.35) / 0.065, 2) <= 1.0;
    const isFoot = footL || footR;

    const footPadL = Math.pow((nx + 0.20) / 0.055, 2) + Math.pow((ny - 0.35) / 0.042, 2) <= 1.0;
    const footPadR = Math.pow((nx - 0.20) / 0.055, 2) + Math.pow((ny - 0.35) / 0.042, 2) <= 1.0;
    const isFootPad = footPadL || footPadR;

    // ------------------------------------------------------------------------
    // Priority Layer Order (Front to Back with Creative Cyber-Plush Contrast)
    // ------------------------------------------------------------------------
    if (isBadge) {
      if (badgeChar === " ") {
        return { part: "badge", char: "♥", color: `rgb(${theme.heartHighlight.join(",")})`, glow: theme.heartGlow };
      }
      return { part: "badge", char: badgeChar, color: `rgb(${theme.badge.join(",")})`, glow: theme.badgeGlow };
    }
    if (isEyeHl) {
      return { part: "eye_hl", char: "✦", color: "rgb(255, 255, 255)", glow: "rgba(255, 255, 255, 0.95)" };
    }
    if (isEye) {
      const eyeChar = this.blinkValue > 0.6 ? "⌒" : "●";
      return { part: "eye", char: eyeChar, color: "rgb(18, 8, 14)", glow: null };
    }
    if (isNose) {
      return { part: "nose", char: "▼", color: "rgb(48, 18, 24)", glow: "rgba(48, 18, 24, 0.6)" };
    }
    if (isMouth) {
      return { part: "mouth", char: "w", color: `rgb(${theme.heartCore.join(",")})`, glow: null };
    }
    if (bowKnot) {
      return { part: "bow_knot", char: "✦", color: "rgb(255, 255, 255)", glow: theme.bowGlow };
    }
    if (isBow) {
      const ch = nx < 0 ? "◄" : "►";
      return { part: "bow", char: ch, color: `rgb(${theme.bow.join(",")})`, glow: theme.bowGlow };
    }
    if (isBlush) {
      return { part: "blush", char: "♥", color: "rgb(255, 140, 180)", glow: "rgba(255, 120, 160, 0.75)" };
    }
    if (isSnout) {
      const snoutChars = ["o", "·", "*", "+", "."];
      const ch = this.safeChar(snoutChars, Math.floor(nx * 100 + ny * 100), "o");
      return { part: "snout", char: ch, color: `rgb(${theme.snout.join(",")})`, glow: null };
    }
    if (isPawPad) {
      return { part: "paw_pad", char: "o", color: `rgb(${theme.snout.join(",")})`, glow: null };
    }
    if (isPaw) {
      const pawChars = ["•", "s", "o", "f", "t", "♥", "8"];
      const ch = this.safeChar(pawChars, Math.floor(nx * 80 + ny * 80), "•");
      return { part: "paw", char: ch, color: `rgb(${theme.furBase.join(",")})`, glow: null };
    }
    if (isHeart) {
      const heartChars = ["♥", "❤", "#", "♥", "%", "♥", "@", "♥"];
      const ch = isHeartEdge ? "█" : this.safeChar(heartChars, Math.floor(nx * 70 + ny * 70), "♥");
      let col;
      if (isHeartEdge && theme.heartEdge) {
        col = `rgb(${theme.heartEdge.join(",")})`;
      } else {
        col = hy > 0.15 ? `rgb(${theme.heartHighlight.join(",")})` : `rgb(${theme.heartCore.join(",")})`;
      }
      return { part: "heart", char: ch, color: col, glow: theme.heartGlow };
    }
    if (isFootPad) {
      return { part: "foot_pad", char: "o", color: `rgb(${theme.snout.join(",")})`, glow: null };
    }
    if (isFoot) {
      const footChars = ["•", "o", "*", "#", "s", "8"];
      const ch = this.safeChar(footChars, Math.floor(nx * 60 + ny * 60), "•");
      return { part: "foot", char: ch, color: `rgb(${theme.furShadow.join(",")})`, glow: null };
    }
    if (isHead) {
      // Soft plush fur with personalized cyber-romantic symbols
      const furChars = ["•", "·", "*", "+", "s", "o", "0", "1", "♥", "e", "x"];
      let ch = this.safeChar(furChars, Math.floor(nx * 50 + ny * 50), "•");
      if (this.nameLetters.length > 0 && Math.abs(Math.floor(nx * 30)) % 7 === 0) {
        ch = this.safeChar(this.nameLetters, Math.floor(ny * 20), ch);
      }
      const depth = 1.0 - Math.sqrt(headD) * 0.35;
      const r = Math.floor(theme.furBase[0] * depth);
      const g = Math.floor(theme.furBase[1] * depth);
      const b = Math.floor(theme.furBase[2] * depth);
      return { part: "head", char: ch, color: `rgb(${r}, ${g}, ${b})`, glow: null };
    }
    if (isEarIn) {
      return { part: "ear_in", char: "+", color: "rgb(255, 230, 235)", glow: null };
    }
    if (isEarOut) {
      const earChars = ["•", "·", "*", "+", "s", "8"];
      const ch = this.safeChar(earChars, Math.floor(nx * 50 + ny * 50), "•");
      return { part: "ear_out", char: ch, color: `rgb(${theme.furShadow.join(",")})`, glow: null };
    }
    if (isBody) {
      const furChars = ["•", "·", "*", "+", "s", "o", "0", "1", "♥", "e", "8"];
      let ch = this.safeChar(furChars, Math.floor(nx * 50 + ny * 50), "•");
      if (this.nameLetters.length > 0 && Math.abs(Math.floor(ny * 30)) % 7 === 0) {
        ch = this.safeChar(this.nameLetters, Math.floor(nx * 20), ch);
      }
      const depth = 1.0 - Math.sqrt(bodyD) * 0.35;
      const r = Math.floor(theme.furShadow[0] * depth);
      const g = Math.floor(theme.furShadow[1] * depth);
      const b = Math.floor(theme.furShadow[2] * depth);
      return { part: "body", char: ch, color: `rgb(${r}, ${g}, ${b})`, glow: null };
    }

    return { part: "bg", char: " ", color: "transparent", glow: null };
  }

  calcRevealStage(part, nx, ny) {
    const seed = Math.abs(Math.floor((nx + 2.0) * 800) ^ Math.floor((ny + 2.0) * 1200)) % 100;
    const jitter = (seed / 100.0 - 0.5) * 0.024;

    if (part === "heart" || part === "badge") {
      const hx = nx / 0.24;
      const hy = -(ny - 0.14) / 0.22;
      const d = Math.sqrt(hx * hx + hy * hy);
      return Math.min(0.22, Math.max(0.0, 0.18 * d)) + jitter;
    }
    if (part === "paw" || part === "paw_pad") {
      return 0.22 + 0.10 * Math.min(1.0, Math.abs(nx) / 0.20) + jitter;
    }
    if (part === "body") {
      const d = Math.sqrt(Math.pow(nx / 0.26, 2) + Math.pow((ny - 0.18) / 0.20, 2));
      return 0.32 + 0.16 * Math.min(1.0, d) + jitter;
    }
    if (part === "foot" || part === "foot_pad") {
      return 0.48 + 0.10 * Math.min(1.0, Math.abs(nx) / 0.25) + jitter;
    }
    if (part === "head") {
      const p = (-0.02 - ny) / 0.36;
      return 0.58 + 0.16 * Math.min(1.0, Math.max(0.0, p)) + jitter;
    }
    if (part === "ear_out" || part === "ear_in") {
      const p = (-0.22 - ny) / 0.20;
      return 0.74 + 0.10 * Math.min(1.0, Math.max(0.0, p)) + jitter;
    }
    if (part === "snout" || part === "blush") {
      return 0.84 + 0.06 * Math.min(1.0, Math.abs(nx) / 0.18) + jitter;
    }
    if (part === "nose" || part === "mouth") {
      return 0.90 + 0.04 * Math.min(1.0, Math.max(0.0, (ny + 0.15) / 0.10)) + jitter;
    }
    if (part === "eye" || part === "eye_hl" || part === "bow" || part === "bow_knot") {
      return 0.94 + 0.06 * Math.min(1.0, Math.abs(nx) / 0.15) + jitter;
    }
    return 1.0;
  }

  triggerWave() {
    this.isWaving = true;
    this.waveTimer = 0.0;
    this.triggerShockwave();
    // Burst hearts from waving paw
    for (let i = 0; i < 8; i++) {
      this.cursorParticles.push({
        x: this.CENTER_X + 0.28 * this.SCENE_SCALE + (Math.random() - 0.5) * 60,
        y: this.CENTER_Y - 0.05 * this.SCENE_SCALE + (Math.random() - 0.5) * 60,
        vx: 30 + Math.random() * 80,
        vy: -40 - Math.random() * 90,
        alpha: 1.0,
        life: 1.2,
        size: 14 + Math.random() * 8,
        char: ["♥", "♡", "✨", "✦"][Math.floor(Math.random() * 4)],
        color: this.getTheme().heartHighlight
      });
    }
  }

  triggerBounce() {
    this.bounce = 1.0;
    this.triggerShockwave();
    this.shyReaction = Math.min(1.0, this.shyReaction + 0.3);
  }

  triggerShockwave() {
    this.shockwaves.push({
      cx: this.CENTER_X,
      cy: this.CENTER_Y + 0.14 * this.SCENE_SCALE,
      r: 30,
      maxR: 480,
      alpha: 0.9,
      color: this.getTheme().heartGlow
    });
  }

  spawnShootingStar() {
    const startX = 60 + Math.random() * 300;
    const startY = 80 + Math.random() * 400;
    const len = 180 + Math.random() * 120;
    const angle = 0.55 + (Math.random() - 0.5) * 0.25; // angled down-right
    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * 750,
      vy: Math.sin(angle) * 750,
      len: len,
      alpha: 1.0,
      life: 0.85
    });
  }

  setMouse(clientX, clientY, canvasRect) {
    if (!canvasRect || canvasRect.width === 0 || canvasRect.height === 0) return;
    const scaleX = 1080 / canvasRect.width;
    const scaleY = 1920 / canvasRect.height;
    const cx = (clientX - canvasRect.left) * scaleX;
    const cy = (clientY - canvasRect.top) * scaleY;

    this.mouse.x = cx;
    this.mouse.y = cy;
    this.mouse.nx = (cx - this.CENTER_X) / this.SCENE_SCALE;
    this.mouse.ny = (cy - this.CENTER_Y) / this.SCENE_SCALE;

    const distToCenter = Math.hypot(this.mouse.nx, this.mouse.ny);
    this.mouse.isNear = distToCenter < 0.45;
    this.mouse.isHovering = distToCenter < 0.32;

    if (this.mouse.isNear) {
      this.shyReaction = Math.min(1.0, this.shyReaction + 0.08);
    } else {
      this.shyReaction = Math.max(0.0, this.shyReaction - 0.04);
    }

    // Spawn subtle fairy dust stardust under cursor
    if (Math.random() < 0.6) {
      const theme = this.getTheme();
      this.cursorParticles.push({
        x: cx + (Math.random() - 0.5) * 16,
        y: cy + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 30,
        vy: -15 - Math.random() * 30,
        alpha: 0.9,
        life: 0.65,
        size: 10 + Math.random() * 6,
        char: ["✦", "✧", "♥", "•", "°"][Math.floor(Math.random() * 5)],
        color: Math.random() > 0.5 ? theme.heartHighlight : [255, 255, 255]
      });
    }
  }

  update(dt) {
    this.time += dt;

    // 1. Organic Bloom Timeline
    if (!this.isBloomed) {
      this.bloomProgress += dt / this.bloomDuration;
      if (this.bloomProgress >= 1.0) {
        this.bloomProgress = 1.0;
        this.isBloomed = true;
      }
    }

    // 2. Realistic Lub-Dub Heartbeat Rhythm
    const hbPhase = (this.time * 2.2) % (Math.PI * 2);
    let beat = 0.0;
    if (hbPhase < 0.8) {
      beat = Math.sin((hbPhase / 0.8) * Math.PI); // Lub
    } else if (hbPhase >= 0.9 && hbPhase < 1.5) {
      beat = 0.65 * Math.sin(((hbPhase - 0.9) / 0.6) * Math.PI); // Dub
    }
    this.heartScale = 1.0 + 0.08 * Math.pow(beat, 1.5);
    this.heartBeatIntensity = beat;

    // Trigger shockwave at peak beat
    if (beat > 0.95 && (this.time - this.lastBeatTime) > 0.6) {
      this.lastBeatTime = this.time;
      if (this.bloomProgress > 0.25) {
        this.triggerShockwave();
      }
    }

    // 3. Shockwave propagation
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += 320 * dt;
      sw.alpha = 0.9 * (1.0 - sw.r / sw.maxR);
      if (sw.r >= sw.maxR || sw.alpha <= 0.02) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 4. Shooting Stars
    this.shootingStarTimer -= dt;
    if (this.shootingStarTimer <= 0) {
      this.spawnShootingStar();
      this.shootingStarTimer = 4.5 + Math.random() * 4.0;
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt;
      ss.y += ss.vy * dt;
      ss.alpha -= dt / ss.life;
      if (ss.alpha <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }

    // 5. Cursor Fairy Dust Particles
    for (let i = this.cursorParticles.length - 1; i >= 0; i--) {
      const cp = this.cursorParticles[i];
      cp.x += cp.vx * dt;
      cp.y += cp.vy * dt;
      cp.alpha -= dt / cp.life;
      if (cp.alpha <= 0) {
        this.cursorParticles.splice(i, 1);
      }
    }

    // 6. Natural Eye Blinking
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      this.blinkValue = 1.0;
      this.blinkTimer = 3.0 + Math.random() * 2.5;
    }
    if (this.isBlinking) {
      this.blinkValue -= dt * 7.0;
      if (this.blinkValue <= 0) {
        this.blinkValue = 0;
        this.isBlinking = false;
      }
    }

    // 7. Ear Wiggle Physics
    this.earWiggleTimer -= dt;
    if (this.earWiggleTimer <= 0) {
      this.earWiggleAmount = Math.sin(this.time * 16.0) * 0.03;
      if (this.earWiggleTimer < -0.4) {
        this.earWiggleAmount = 0.0;
        this.earWiggleTimer = 3.5 + Math.random() * 2.5;
      }
    }

    // 8. Waving Paw Timer
    if (this.isWaving) {
      this.waveTimer += dt;
      if (this.waveTimer >= this.waveDuration) {
        this.isWaving = false;
        this.waveTimer = 0.0;
      }
    }

    // 9. Interactive Bounce decay
    if (this.bounce > 0.001) {
      this.bounce *= Math.pow(0.04, dt);
    } else {
      this.bounce = 0.0;
    }

    // 10. Interactive Look-at Damping
    const targetLx = this.mouse.isNear ? Math.max(-0.25, Math.min(0.25, this.mouse.nx * 0.45)) : 0;
    const targetLy = this.mouse.isNear ? Math.max(-0.25, Math.min(0.25, this.mouse.ny * 0.45)) : 0;
    this.lookOffset.x += (targetLx - this.lookOffset.x) * 0.08;
    this.lookOffset.y += (targetLy - this.lookOffset.y) * 0.08;

    // 11. Head tilt (playful & shy)
    const targetTilt = this.mouse.isNear ? (this.mouse.nx * 0.08 + this.shyReaction * 0.04) : (Math.sin(this.time * 0.9) * 0.025);
    this.headTilt += (targetTilt - this.headTilt) * 0.06;

    // 12. Ambient Dust Movement
    for (const p of this.ambientParticles) {
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      if (p.y < -20) p.y = 1940;
      if (p.x < -20) p.x = 1100;
      if (p.x > 1100) p.x = -20;
    }
  }
}

window.TeddyAnimation = TeddyAnimation;
