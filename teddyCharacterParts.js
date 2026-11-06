/**
 * teddyCharacterParts.js
 * ============================================================================
 * Anatomical Layer Hierarchy, Character Ramps & Palettes for the Teddy Bear.
 * Implements strict ASCII density ramps (@ # $ % & * + = - : .) and
 * distinct regional color grading for fur, muzzle, ears, eyes, paws, and heart.
 * ============================================================================
 */

class TeddyCharacterParts {
  constructor() {
    // Standard ASCII density ramp from densest to lightest:
    this.STANDARD_RAMP = ["@", "%", "#", "$", "&", "*", "+", "=", "-", ":", "."];
    this.SNOUT_RAMP = ["o", "*", "+", "=", "-", ":", "."];
    this.HEART_RAMP = ["♥", "★", "✧", "♡", "♥", "+", "*"];
    this.PAD_RAMP = ["o", "·", "•"];

    // Default theme colors (Cyber Rose)
    this.defaultTheme = {
      furBase: [255, 115, 145],
      furShadow: [215, 80, 110],
      furHighlight: [255, 160, 185],
      heartCore: [255, 25, 80],
      heartHighlight: [255, 130, 175],
      heartGlow: "rgba(255, 30, 85, 0.9)",
      bow: [52, 211, 153],
      bowGlow: "rgba(52, 211, 153, 0.85)",
      badge: [255, 255, 255],
      badgeGlow: "rgba(254, 240, 138, 1.0)",
      snout: [255, 245, 235],
      nebula: "rgba(255, 45, 95, 0.12)"
    };
  }

  /**
   * Selects character from density ramp based on scalar intensity [0.0, 1.0]
   */
  getCharFromRamp(ramp, intensity) {
    const clamped = Math.max(0.0, Math.min(1.0, intensity));
    const idx = Math.floor((1.0 - clamped) * (ramp.length - 1));
    return ramp[idx] || ramp[ramp.length - 1];
  }

  /**
   * Gets character glyph for a specific anatomical part
   */
  getChar(part, intensity, hash = 0, nameLetters = [], extra = {}) {
    switch (part) {
      case "badge":
        return extra.badgeChar || " ";

      case "eye_hl":
        return "✦";

      case "eye":
        return extra.isBlinking ? "⌒" : "●";

      case "nose":
        return "▼";

      case "mouth":
        return "w";

      case "bow_knot":
        return "✦";

      case "bow":
        return extra.isLeft ? "◄" : "►";

      case "blush":
        return "♥";

      case "snout":
        return this.getCharFromRamp(this.SNOUT_RAMP, intensity);

      case "toe":
        return "•";

      case "foot_pad":
      case "paw_pad":
        return "o";

      case "heart":
        const hIdx = Math.abs(hash) % this.HEART_RAMP.length;
        return this.HEART_RAMP[hIdx];

      case "head":
      case "body":
      case "arm":
      case "paw":
      case "foot":
      case "leg":
      case "ear_out":
        return this.getCharFromRamp(this.STANDARD_RAMP, intensity);

      case "ear_in":
        return "+";

      default:
        return " ";
    }
  }

  /**
   * Computes RGB color and glow string for an anatomical part
   */
  getColor(part, intensity, depth, theme = null, extra = {}) {
    if (!theme) theme = this.defaultTheme;

    switch (part) {
      case "badge":
        return {
          color: (extra.badgeChar === " ") ? "transparent" : `rgb(${theme.badge.join(",")})`,
          glow: (extra.badgeChar === " ") ? null : theme.badgeGlow
        };

      case "eye_hl":
        return { color: "rgb(255, 255, 255)", glow: "rgba(255, 255, 255, 0.95)" };

      case "eye":
        return { color: "rgb(18, 8, 14)", glow: null };

      case "nose":
        return { color: "rgb(48, 18, 24)", glow: "rgba(48, 18, 24, 0.6)" };

      case "mouth":
        return { color: `rgb(${theme.heartCore.join(",")})`, glow: null };

      case "bow_knot":
        return { color: "rgb(255, 255, 255)", glow: theme.bowGlow };

      case "bow":
        return { color: `rgb(${theme.bow.join(",")})`, glow: theme.bowGlow };

      case "blush":
        return { color: "rgb(255, 140, 180)", glow: "rgba(255, 120, 160, 0.75)" };

      case "snout":
        return { color: `rgb(${theme.snout.join(",")})`, glow: null };

      case "toe":
      case "foot_pad":
      case "paw_pad":
        return { color: `rgb(${theme.snout.join(",")})`, glow: null };

      case "heart":
        const isUpper = extra.hy !== undefined ? (extra.hy > 0.15) : (intensity > 0.6);
        const hCol = isUpper ? theme.heartHighlight : theme.heartCore;
        return { color: `rgb(${hCol.join(",")})`, glow: theme.heartGlow };

      case "head": {
        const factor = 0.65 + 0.35 * Math.max(0, depth);
        const r = Math.floor(theme.furBase[0] * factor);
        const g = Math.floor(theme.furBase[1] * factor);
        const b = Math.floor(theme.furBase[2] * factor);
        return { color: `rgb(${r}, ${g}, ${b})`, glow: null };
      }

      case "body":
      case "arm":
      case "paw":
      case "foot":
      case "leg":
      case "ear_out": {
        const factor = 0.65 + 0.35 * Math.max(0, depth);
        const r = Math.floor(theme.furShadow[0] * factor);
        const g = Math.floor(theme.furShadow[1] * factor);
        const b = Math.floor(theme.furShadow[2] * factor);
        return { color: `rgb(${r}, ${g}, ${b})`, glow: null };
      }

      case "ear_in":
        return { color: "rgb(255, 215, 225)", glow: null };

      default:
        return { color: "transparent", glow: null };
    }
  }
}

window.TeddyCharacterParts = TeddyCharacterParts;
