/**
 * teddyGeometry.js
 * ============================================================================
 * Mathematical Anatomy, Parametric Curves & Signed Distance Fields (SDF)
 * for the Adorable Chibi Plush Teddy Bear holding a Glowing Heart.
 * ============================================================================
 */

class TeddyGeometry {
  constructor() {
    this.CENTER_X = 540.0;
    this.CENTER_Y = 800.0;
    this.SCENE_SCALE = 1050.0;
  }

  /**
   * Evaluates the anatomical shapes at normalized scene coordinate (nx, ny).
   * Returns: { part, z, depth, isBadge, badgeChar, isEdge, hy }
   */
  evalPoint(nx, ny, animState, nameStr = "", isBadgeCol = false, bChar = "") {
    const heartScale = animState ? animState.heartScale : 1.0;
    const isWaving = animState ? animState.isWaving : false;
    const waveProgress = animState ? animState.waveTimer : 0.0;
    const blinkValue = animState ? animState.blinkValue : 0.0;

    // Normalization mapping to fit comfortably inside the 70x68 grid
    const nxN = nx * 0.95;
    const nyN = ny * 1.25 + 0.02;

    // ------------------------------------------------------------------------
    // 1. Radiant Algebraic Cardioid Heart (nestled in center of chest)
    // ------------------------------------------------------------------------
    const hx = nxN / (0.19 * heartScale);
    const hy = -(nyN - 0.17) / (0.16 * heartScale); // Positive upwards
    const hEq = Math.pow(hx * hx + hy * hy - 1.0, 3) - (hx * hx) * Math.pow(hy, 3);
    const isHeart = (hEq <= 0.0);
    const isHeartEdge = isHeart && (hEq >= -0.28);

    // Single-line clean embroidered badge across center of heart (Row 42)
    let isBadge = isHeart && isBadgeCol;
    let badgeChar = isBadge ? bChar : "";

    // ------------------------------------------------------------------------
    // 2. Paws Holding the Heart (Left and Right)
    // ------------------------------------------------------------------------
    let rpawX = 0.17;
    let rpawY = 0.17;
    if (isWaving) {
      rpawX = 0.28 + Math.sin(waveProgress * 8.0) * 0.04;
      rpawY = -0.05 + Math.cos(waveProgress * 8.0) * 0.02;
    }

    const lpawD = Math.pow((nxN + 0.17) / 0.080, 2) + Math.pow((nyN - 0.17) / 0.060, 2);
    const rpawD = Math.pow((nxN - rpawX) / 0.080, 2) + Math.pow((nyN - rpawY) / 0.060, 2);
    const isPaw = (lpawD <= 1.0) || (rpawD <= 1.0);
    const isPawPad = (lpawD <= 0.35) || (rpawD <= 0.35);

    // ------------------------------------------------------------------------
    // 3. Silk Ribbon Bow on collar (under chin, above heart)
    // ------------------------------------------------------------------------
    const bowKnot = Math.pow(nxN / 0.030, 2) + Math.pow((nyN + 0.01) / 0.024, 2) <= 1.0;
    const bowL = Math.pow((nxN + 0.062) / 0.050, 2) + Math.pow((nyN + 0.01) / 0.032, 2) <= 1.0;
    const bowR = Math.pow((nxN - 0.062) / 0.050, 2) + Math.pow((nyN + 0.01) / 0.032, 2) <= 1.0;
    const isBow = bowKnot || bowL || bowR;

    // ------------------------------------------------------------------------
    // 4. Large Sparkling Eyes & Specular Highlights
    // ------------------------------------------------------------------------
    const eyeH = 0.038 * Math.max(0.15, 1.0 - blinkValue * 0.85);
    const eyeL = Math.pow((nxN + 0.115) / 0.030, 2) + Math.pow((nyN + 0.26) / eyeH, 2) <= 1.0;
    const eyeR = Math.pow((nxN - 0.115) / 0.030, 2) + Math.pow((nyN + 0.26) / eyeH, 2) <= 1.0;
    const isEye = eyeL || eyeR;

    const eyeHlL = Math.pow((nxN + 0.12) / 0.012, 2) + Math.pow((nyN + 0.27) / 0.015, 2) <= 1.0;
    const eyeHlR = Math.pow((nxN - 0.10) / 0.012, 2) + Math.pow((nyN + 0.27) / 0.015, 2) <= 1.0;
    const isEyeHl = (blinkValue < 0.5) && (eyeHlL || eyeHlR);

    // ------------------------------------------------------------------------
    // 5. Cute Button Nose & Sweet Smile
    // ------------------------------------------------------------------------
    const noseD = Math.pow(nxN / 0.038, 2) + Math.pow((nyN + 0.19) / 0.024, 2);
    const isNose = (noseD <= 1.0);

    const isMouth = (Math.abs(nxN) < 0.012 && -0.17 <= nyN && nyN <= -0.13) ||
                    ((nxN * nxN + Math.pow(nyN + 0.13, 2) <= 0.032 * 0.032) && nyN >= -0.13 && Math.abs(nxN) < 0.040);

    // ------------------------------------------------------------------------
    // 6. Snout (Muzzle) & Soft Rosy Cheek Blush
    // ------------------------------------------------------------------------
    const snoutD = Math.pow(nxN / 0.13, 2) + Math.pow((nyN + 0.16) / 0.08, 2);
    const isSnout = (snoutD <= 1.0);

    const blushL = Math.pow((nxN + 0.18) / 0.032, 2) + Math.pow((nyN + 0.18) / 0.020, 2) <= 1.0;
    const blushR = Math.pow((nxN - 0.18) / 0.032, 2) + Math.pow((nyN + 0.18) / 0.020, 2) <= 1.0;
    const isBlush = blushL || blushR;

    // ------------------------------------------------------------------------
    // 7. Ears (Round puffy outer ears + softer inner cavity)
    // ------------------------------------------------------------------------
    const earL_out = Math.pow((nxN + 0.26) / 0.130, 2) + Math.pow((nyN + 0.44) / 0.130, 2) <= 1.0;
    const earR_out = Math.pow((nxN - 0.26) / 0.130, 2) + Math.pow((nyN + 0.44) / 0.130, 2) <= 1.0;
    const isEar = earL_out || earR_out;

    const earL_in = Math.pow((nxN + 0.26) / 0.075, 2) + Math.pow((nyN + 0.44) / 0.075, 2) <= 1.0;
    const earR_in = Math.pow((nxN - 0.26) / 0.075, 2) + Math.pow((nyN + 0.44) / 0.075, 2) <= 1.0;
    const isEarIn = earL_in || earR_in;

    // ------------------------------------------------------------------------
    // 8. Head (Round plush dome with gentle chubby cheeks)
    // ------------------------------------------------------------------------
    const headD = Math.pow(nxN / 0.31, 2) + Math.pow((nyN + 0.23) / 0.24, 2);
    const isHead = (headD <= 1.0);

    // ------------------------------------------------------------------------
    // 9. Sitting Feet & Forward-Facing Foot Pads
    // ------------------------------------------------------------------------
    const footL = Math.pow((nxN + 0.22) / 0.11, 2) + Math.pow((nyN - 0.42) / 0.085, 2) <= 1.0;
    const footR = Math.pow((nxN - 0.22) / 0.11, 2) + Math.pow((nyN - 0.42) / 0.085, 2) <= 1.0;
    const isFoot = footL || footR;

    const footPadL = Math.pow((nxN + 0.22) / 0.070, 2) + Math.pow((nyN - 0.42) / 0.055, 2) <= 1.0;
    const footPadR = Math.pow((nxN - 0.22) / 0.070, 2) + Math.pow((nyN - 0.42) / 0.055, 2) <= 1.0;
    const isFootPad = footPadL || footPadR;

    // ------------------------------------------------------------------------
    // 10. Torso / Body (Chubby cuddly pear shape)
    // ------------------------------------------------------------------------
    const bw = 0.33 * (1.0 + 0.22 * (nyN - 0.05));
    const bodyD = Math.pow(nxN / bw, 2) + Math.pow((nyN - 0.18) / 0.30, 2);
    const isBody = (bodyD <= 1.0) && (nyN <= 0.48);

    // ------------------------------------------------------------------------
    // Layer Priority Selection (Front to Back)
    // ------------------------------------------------------------------------
    if (isBadge) {
      return { part: "badge", z: 1.25, depth: 1.0, badgeChar: badgeChar, isBadge: true, isEdge: false };
    }
    if (isPawPad) {
      return { part: "paw_pad", z: 1.15, depth: 0.95, isBadge: false };
    }
    if (isPaw) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(lpawD, rpawD)));
      return { part: "paw", z: z, depth: z, isBadge: false };
    }
    if (bowKnot) {
      return { part: "bow_knot", z: 1.10, depth: 1.0, isBadge: false };
    }
    if (isBow) {
      return { part: "bow", z: 1.05, depth: 1.0, isBadge: false, isLeft: nxN < 0 };
    }
    if (isEyeHl) {
      return { part: "eye_hl", z: 1.00, depth: 1.0, isBadge: false };
    }
    if (isNose) {
      return { part: "nose", z: 1.10, depth: 1.0, isBadge: false };
    }
    if (isEye) {
      return { part: "eye", z: 0.95, depth: 1.0, isBadge: false };
    }
    if (isMouth) {
      return { part: "mouth", z: 1.00, depth: 1.0, isBadge: false };
    }
    if (isBlush) {
      return { part: "blush", z: 0.88, depth: 1.0, isBadge: false };
    }
    if (isSnout) {
      const z = Math.sqrt(Math.max(0, 1.0 - snoutD));
      return { part: "snout", z: z, depth: z, isBadge: false };
    }
    if (isFootPad) {
      return { part: "foot_pad", z: 0.90, depth: 0.90, isBadge: false };
    }
    if (isFoot) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(footL, footR)));
      return { part: "foot", z: z, depth: z, isBadge: false };
    }
    if (isHeart) {
      const z = Math.sqrt(Math.max(0, 1.0 - (hx * hx + hy * hy) / 2.0));
      return { part: "heart", z: z, depth: z, isBadge: false, isEdge: isHeartEdge, hy: hy };
    }
    if (isHead) {
      const z = Math.sqrt(Math.max(0, 1.0 - headD));
      return { part: "head", z: z, depth: z, isBadge: false };
    }
    if (isEarIn) {
      return { part: "ear_in", z: 0.65, depth: 0.65, isBadge: false };
    }
    if (isEar) {
      const z = Math.sqrt(Math.max(0, 1.0 - Math.min(earL_out, earR_out)));
      return { part: "ear_out", z: z, depth: z, isBadge: false };
    }
    if (isBody) {
      const z = Math.sqrt(Math.max(0, 1.0 - bodyD));
      return { part: "body", z: z, depth: z, isBadge: false };
    }

    return { part: "bg", z: 0, depth: 0, isBadge: false };
  }

  formatBadgeText(name) {
    const clean = (name || "").toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim();
    if (!clean) return "♥ ♥ ♥";
    if (clean.length <= 6) return `♥  ${clean.split("").join(" ")}  ♥`;
    if (clean.length <= 10) return `♥ ${clean} ♥`;
    return clean.slice(0, 18);
  }

  calcRevealStage(part, nx, ny) {
    const seed = Math.abs(Math.floor((nx + 2.0) * 800) ^ Math.floor((ny + 2.0) * 1200)) % 100;
    const jitter = (seed / 100.0 - 0.5) * 0.024;

    if (part === "heart" || part === "badge") {
      const hx = nx / 0.20;
      const hy = -(ny - 0.17) / 0.16;
      const d = Math.sqrt(hx * hx + hy * hy);
      return Math.min(0.24, Math.max(0.0, 0.20 * d)) + jitter;
    }
    if (part === "paw" || part === "paw_pad") {
      return 0.24 + 0.10 * Math.min(1.0, Math.abs(nx) / 0.22) + jitter;
    }
    if (part === "body") {
      const d = Math.sqrt(Math.pow(nx / 0.33, 2) + Math.pow((ny - 0.18) / 0.30, 2));
      return 0.30 + 0.18 * Math.min(1.0, d) + jitter;
    }
    if (part === "foot" || part === "foot_pad") {
      return 0.48 + 0.10 * Math.min(1.0, Math.abs(nx) / 0.22) + jitter;
    }
    if (part === "head") {
      const p = (-0.02 - ny) / 0.40;
      return 0.54 + 0.18 * Math.min(1.0, Math.max(0.0, p)) + jitter;
    }
    if (part === "ear_out" || part === "ear_in") {
      const p = (-0.25 - ny) / 0.25;
      return 0.70 + 0.14 * Math.min(1.0, Math.max(0.0, p)) + jitter;
    }
    if (part === "snout" || part === "blush") {
      return 0.82 + 0.06 * Math.min(1.0, Math.abs(nx) / 0.18) + jitter;
    }
    if (part === "nose" || part === "mouth" || part === "eye") {
      return 0.88 + 0.06 * Math.min(1.0, Math.max(0.0, (ny + 0.25) / 0.20)) + jitter;
    }
    if (part === "eye_hl" || part === "bow" || part === "bow_knot") {
      return 0.94 + 0.05 * Math.min(1.0, Math.abs(nx) / 0.12) + jitter;
    }
    return 0.5;
  }
}

window.TeddyGeometry = TeddyGeometry;
