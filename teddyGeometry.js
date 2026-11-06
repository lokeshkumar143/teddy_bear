/**
 * teddyGeometry.js
 * ============================================================================
 * Mathematical Anatomy, Parametric Curves & Signed Distance Fields (SDF)
 * for the Professional Chibi Teddy Bear Character.
 * ============================================================================
 */

class TeddyGeometry {
  constructor() {
    // Coordinate space mapping (Hero center in 1080x1920)
    this.CENTER_X = 540.0;
    this.CENTER_Y = 800.0;
    this.SCENE_SCALE = 1050.0;
  }

  /**
   * Evaluates the anatomical shapes at normalized scene coordinate (nx, ny).
   * Returns: { part, z, depth, isBadge, badgeChar, localU, localV }
   */
  evalPoint(nx, ny, animState, nameStr = "", isBadgeCol = false, bChar = "") {
    const heartScale = animState ? animState.heartScale : 1.0;
    const isWaving = animState ? animState.isWaving : false;
    const waveProgress = animState ? animState.waveTimer : 0.0;
    const blinkValue = animState ? animState.blinkValue : 0.0;

    // ------------------------------------------------------------------------
    // 1. Radiant Cardioid Heart (held against chest)
    // ------------------------------------------------------------------------
    const hx = nx / (0.22 * heartScale);
    const hy = -(ny - 0.16) / (0.20 * heartScale); // Positive upwards
    const cL = Math.pow(hx + 0.38, 2) + Math.pow(hy - 0.20, 2) <= 0.44 * 0.44;
    const cR = Math.pow(hx - 0.38, 2) + Math.pow(hy - 0.20, 2) <= 0.44 * 0.44;
    const inWedge = (hy <= 0.20) && (hy >= 1.15 * Math.abs(hx) - 0.85) && (Math.abs(hx) <= 0.82);
    const isHeart = cL || cR || inWedge;

    // Single-line clean embroidered badge across center of heart (Row 40)
    let isBadge = isHeart && isBadgeCol;
    let badgeChar = isBadge ? bChar : "";

    // ------------------------------------------------------------------------
    // 2. Ears (Round puffy spheres with inner cavity)
    // ------------------------------------------------------------------------
    const earL = Math.pow((nx + 0.25) / 0.098, 2) + Math.pow((ny + 0.38) / 0.082, 2) <= 1.0;
    const earR = Math.pow((nx - 0.25) / 0.098, 2) + Math.pow((ny + 0.38) / 0.082, 2) <= 1.0;
    const isEar = earL || earR;

    const earInL = Math.pow((nx + 0.25) / 0.055, 2) + Math.pow((ny + 0.38) / 0.048, 2) <= 1.0;
    const earInR = Math.pow((nx - 0.25) / 0.055, 2) + Math.pow((ny + 0.38) / 0.048, 2) <= 1.0;
    const isEarIn = earInL || earInR;

    // ------------------------------------------------------------------------
    // 3. Head & Cheeks (Rounded dome with chubby cheeks)
    // ------------------------------------------------------------------------
    const headD = Math.pow(nx / 0.28, 2) + Math.pow((ny + 0.18) / 0.22, 2);
    const isHead = headD <= 1.0;

    // ------------------------------------------------------------------------
    // 4. Snout (Distinct forward muzzle)
    // ------------------------------------------------------------------------
    const snoutD = Math.pow(nx / 0.115, 2) + Math.pow((ny + 0.10) / 0.068, 2);
    const isSnout = snoutD <= 1.0;

    // ------------------------------------------------------------------------
    // 5. Nose & Sweet Smile
    // ------------------------------------------------------------------------
    const noseD = Math.pow(nx / 0.035, 2) + Math.pow((ny + 0.125) / 0.022, 2);
    const isNose = noseD <= 1.0;

    const isMouth = (Math.abs(nx) < 0.038) && (-0.095 <= ny && ny <= -0.072);

    // ------------------------------------------------------------------------
    // 6. Eyes & Highlights (Large glossy anime kawaii eyes)
    // ------------------------------------------------------------------------
    const eyeH = 0.040 * Math.max(0.15, 1.0 - blinkValue * 0.85);
    const eyeL = Math.pow((nx + 0.11) / 0.032, 2) + Math.pow((ny + 0.20) / eyeH, 2) <= 1.0;
    const eyeR = Math.pow((nx - 0.11) / 0.032, 2) + Math.pow((ny + 0.20) / eyeH, 2) <= 1.0;
    const isEye = eyeL || eyeR;

    const eyeHlL = Math.pow((nx + 0.118) / 0.012, 2) + Math.pow((ny + 0.215) / 0.014, 2) <= 1.0;
    const eyeHlR = Math.pow((nx - 0.098) / 0.012, 2) + Math.pow((ny + 0.215) / 0.014, 2) <= 1.0;
    const isEyeHl = (blinkValue < 0.5) && (eyeHlL || eyeHlR);

    // ------------------------------------------------------------------------
    // 7. Rosy Cheeks Blush
    // ------------------------------------------------------------------------
    const blushL = Math.pow((nx + 0.185) / 0.045, 2) + Math.pow((ny + 0.12) / 0.030, 2) <= 1.0;
    const blushR = Math.pow((nx - 0.185) / 0.045, 2) + Math.pow((ny + 0.12) / 0.030, 2) <= 1.0;
    const isBlush = blushL || blushR;

    // ------------------------------------------------------------------------
    // 8. Silk Bowtie under chin
    // ------------------------------------------------------------------------
    const bowKnot = Math.pow(nx / 0.026, 2) + Math.pow((ny + 0.015) / 0.020, 2) <= 1.0;
    const bowL = Math.pow((nx + 0.058) / 0.040, 2) + Math.pow((ny + 0.015) / 0.025, 2) <= 1.0;
    const bowR = Math.pow((nx - 0.058) / 0.040, 2) + Math.pow((ny + 0.015) / 0.025, 2) <= 1.0;
    const isBow = bowL || bowR;

    // ------------------------------------------------------------------------
    // 9. Arms & Paws Hugging Heart
    // ------------------------------------------------------------------------
    // Dynamic right arm during wave:
    let rpawX = 0.17;
    let rpawY = 0.14;
    let rarmX = 0.20;
    let rarmY = 0.07;
    if (isWaving) {
      rpawX = 0.28 + Math.sin(waveProgress * 8.0) * 0.04;
      rpawY = -0.04 + Math.cos(waveProgress * 8.0) * 0.02;
      rarmX = 0.24 + Math.sin(waveProgress * 8.0) * 0.02;
      rarmY = 0.02;
    }

    const pawL = Math.pow((nx + 0.17) / 0.065, 2) + Math.pow((ny - 0.14) / 0.055, 2) <= 1.0;
    const pawR = Math.pow((nx - rpawX) / 0.065, 2) + Math.pow((ny - rpawY) / 0.055, 2) <= 1.0;
    const isPaw = pawL || pawR;

    const pawPadL = Math.pow((nx + 0.17) / 0.035, 2) + Math.pow((ny - 0.14) / 0.028, 2) <= 1.0;
    const pawPadR = Math.pow((nx - rpawX) / 0.035, 2) + Math.pow((ny - rpawY) / 0.028, 2) <= 1.0;
    const isPawPad = pawPadL || pawPadR;

    const armL = Math.pow((nx + 0.20) / 0.065, 2) + Math.pow((ny - 0.07) / 0.065, 2) <= 1.0;
    const armR = Math.pow((nx - rarmX) / 0.065, 2) + Math.pow((ny - rarmY) / 0.065, 2) <= 1.0;
    const isArm = armL || armR;

    // ------------------------------------------------------------------------
    // 10. Torso / Body (Plush pear shape)
    // ------------------------------------------------------------------------
    const bw = 0.25 * (1.0 + 0.18 * (ny - 0.02));
    const bodyD = Math.pow(nx / bw, 2) + Math.pow((ny - 0.18) / 0.20, 2);
    const isBody = (bodyD <= 1.0) && (ny <= 0.34);

    // ------------------------------------------------------------------------
    // 11. Legs, Feet & Toe Beans
    // ------------------------------------------------------------------------
    const legL = Math.pow((nx + 0.18) / 0.08, 2) + Math.pow((ny - 0.32) / 0.06, 2) <= 1.0;
    const legR = Math.pow((nx - 0.18) / 0.08, 2) + Math.pow((ny - 0.32) / 0.06, 2) <= 1.0;
    const isLeg = legL || legR;

    const footL = Math.pow((nx + 0.22) / 0.095, 2) + Math.pow((ny - 0.38) / 0.068, 2) <= 1.0;
    const footR = Math.pow((nx - 0.22) / 0.095, 2) + Math.pow((ny - 0.38) / 0.068, 2) <= 1.0;
    const isFoot = footL || footR;

    const footPadL = Math.pow((nx + 0.22) / 0.055, 2) + Math.pow((ny - 0.38) / 0.042, 2) <= 1.0;
    const footPadR = Math.pow((nx - 0.22) / 0.055, 2) + Math.pow((ny - 0.38) / 0.042, 2) <= 1.0;
    const isFootPad = footPadL || footPadR;

    const toe_l1 = Math.pow((nx + 0.25) / 0.016, 2) + Math.pow((ny - 0.33) / 0.014, 2) <= 1.0;
    const toe_l2 = Math.pow((nx + 0.22) / 0.016, 2) + Math.pow((ny - 0.325) / 0.014, 2) <= 1.0;
    const toe_l3 = Math.pow((nx + 0.19) / 0.016, 2) + Math.pow((ny - 0.33) / 0.014, 2) <= 1.0;
    const toe_r1 = Math.pow((nx - 0.19) / 0.016, 2) + Math.pow((ny - 0.33) / 0.014, 2) <= 1.0;
    const toe_r2 = Math.pow((nx - 0.22) / 0.016, 2) + Math.pow((ny - 0.325) / 0.014, 2) <= 1.0;
    const toe_r3 = Math.pow((nx - 0.25) / 0.016, 2) + Math.pow((ny - 0.33) / 0.014, 2) <= 1.0;
    const isToe = toe_l1 || toe_l2 || toe_l3 || toe_r1 || toe_r2 || toe_r3;

    // ------------------------------------------------------------------------
    // Layer Priority Selection
    // ------------------------------------------------------------------------
    if (isBadge) {
      return { part: "badge", z: 1.2, depth: 1.0, badgeChar: badgeChar, isBadge: true };
    }
    if (isEyeHl) {
      return { part: "eye_hl", z: 1.0, depth: 1.0, isBadge: false };
    }
    if (isEye) {
      return { part: "eye", z: 0.95, depth: 1.0, isBadge: false };
    }
    if (isNose) {
      return { part: "nose", z: 1.1, depth: 1.0, isBadge: false };
    }
    if (isMouth) {
      return { part: "mouth", z: 1.0, depth: 1.0, isBadge: false };
    }
    if (bowKnot) {
      return { part: "bow_knot", z: 1.0, depth: 1.0, isBadge: false };
    }
    if (isBow) {
      return { part: "bow", z: 0.95, depth: 1.0, isBadge: false, isLeft: nx < 0 };
    }
    if (isBlush) {
      return { part: "blush", z: 0.85, depth: 1.0, isBadge: false };
    }
    if (isSnout) {
      const z = Math.sqrt(Math.max(0, 1.0 - snoutD));
      return { part: "snout", z: z, depth: z, isBadge: false };
    }
    if (isToe) {
      return { part: "toe", z: 0.85, depth: 0.85, isBadge: false };
    }
    if (isFootPad) {
      return { part: "foot_pad", z: 0.8, depth: 0.8, isBadge: false };
    }
    if (isPawPad) {
      return { part: "paw_pad", z: 0.9, depth: 0.9, isBadge: false };
    }
    if (isPaw) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(pawL, pawR)));
      return { part: "paw", z: z, depth: z, isBadge: false };
    }
    if (isHeart) {
      const z = Math.sqrt(Math.max(0, 1.0 - (hx * hx + hy * hy) / 2.0));
      return { part: "heart", z: z, depth: z, isBadge: false, hy: hy };
    }
    if (isFoot) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(footL, footR)));
      return { part: "foot", z: z, depth: z, isBadge: false };
    }
    if (isArm) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(armL, armR)));
      return { part: "arm", z: z, depth: z, isBadge: false };
    }
    if (isHead) {
      const z = Math.sqrt(Math.max(0, 1.0 - headD));
      return { part: "head", z: z, depth: z, isBadge: false };
    }
    if (isEarIn) {
      return { part: "ear_in", z: 0.4, depth: 0.4, isBadge: false };
    }
    if (isEar) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(earL, earR)));
      return { part: "ear_out", z: z, depth: z, isBadge: false };
    }
    if (isLeg) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(legL, legR)));
      return { part: "leg", z: z, depth: z, isBadge: false };
    }
    if (isBody) {
      const z = Math.sqrt(Math.max(0, 1.0 - bodyD));
      return { part: "body", z: z, depth: z, isBadge: false };
    }

    return { part: "bg", z: 0, depth: 0, isBadge: false };
  }

  formatBadgeText(name) {
    const clean = (name || "").toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim();
    if (!clean) return "✧ ♥ ✧";
    if (clean.length <= 6) return `✧  ${clean.split("").join(" ")}  ✧`;
    if (clean.length <= 10) return `✧ ${clean} ✧`;
    if (clean.length <= 16) return `♥ ${clean} ♥`;
    return clean.slice(0, 18);
  }

  calcRevealStage(part, nx, ny) {
    const seed = Math.abs(Math.floor((nx + 2.0) * 800) ^ Math.floor((ny + 2.0) * 1200)) % 100;
    const jitter = (seed / 100.0 - 0.5) * 0.024;

    if (part === "heart" || part === "badge") {
      const hx = nx / 0.22;
      const hy = -(ny - 0.16) / 0.20;
      const d = Math.sqrt(hx * hx + hy * hy);
      return Math.min(0.22, Math.max(0.0, 0.18 * d)) + jitter;
    }
    if (part === "paw" || part === "paw_pad") {
      return 0.22 + 0.10 * Math.min(1.0, Math.abs(nx) / 0.20) + jitter;
    }
    if (part === "body" || part === "arm") {
      const d = Math.sqrt(Math.pow(nx / 0.26, 2) + Math.pow((ny - 0.18) / 0.20, 2));
      return 0.32 + 0.16 * Math.min(1.0, d) + jitter;
    }
    if (part === "leg" || part === "foot" || part === "foot_pad" || part === "toe") {
      return 0.48 + 0.10 * Math.min(1.0, Math.abs(nx) / 0.25) + jitter;
    }
    if (part === "head") {
      const p = (-0.02 - ny) / 0.36;
      return 0.58 + 0.16 * Math.min(1.0, Math.max(0.0, p)) + jitter;
    }
    if (part === "ear_out" || part === "ear_in") {
      const p = (-0.22 - ny) / 0.20;
      return 0.74 + 0.12 * Math.min(1.0, Math.max(0.0, p)) + jitter;
    }
    if (part === "snout" || part === "nose" || part === "mouth" || part === "eye" || part === "eye_hl" || part === "blush" || part === "bow" || part === "bow_knot") {
      return 0.86 + 0.12 * (seed / 100.0);
    }
    return 0.5;
  }
}

window.TeddyGeometry = TeddyGeometry;
