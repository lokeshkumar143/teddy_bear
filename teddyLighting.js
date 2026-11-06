/**
 * teddyLighting.js
 * ============================================================================
 * 3D Spherical Normal Mapping, Radial Light Emission from Heart,
 * Ambient Key/Fill Lighting, Rim Highlights, and Scalar Intensity Mapping.
 * ============================================================================
 */

class TeddyLighting {
  constructor() {
    // Primary key light (Top-Left elevated)
    this.keyLightDir = this.normalize([-0.35, -0.55, 0.75]);

    // Secondary fill light (Top-Right soft)
    this.fillLightDir = this.normalize([0.45, -0.30, 0.85]);

    // Position of radiant heart light source in normalized scene space
    this.heartLightPos = [0.0, 0.16, 0.25];
  }

  normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1.0;
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  /**
   * Computes lighting scalar intensity [0.0, 1.0] for a point in space
   */
  computeIntensity(nx, ny, z, part, heartPulse = 1.0) {
    // Flat or emissive elements get full fixed intensity
    if (part === "badge" || part === "eye_hl" || part === "heart") {
      return 1.0;
    }
    if (part === "eye" || part === "nose") {
      return 0.9;
    }

    // Normal approximation based on local spherical curvature
    const Nz = Math.max(0.1, z);
    const Nx = nx * 1.5;
    const Ny = ny * 1.5;
    const N = this.normalize([Nx, Ny, Nz]);

    // 1. Ambient baseline
    const ambient = 0.35;

    // 2. Key directional light
    const keyNdotL = Math.max(0, this.dot(N, this.keyLightDir));
    const keyDiffuse = keyNdotL * 0.40;

    // 3. Fill directional light
    const fillNdotL = Math.max(0, this.dot(N, this.fillLightDir));
    const fillDiffuse = fillNdotL * 0.15;

    // 4. Point light radiation from glowing heart
    const dx = nx - this.heartLightPos[0];
    const dy = ny - this.heartLightPos[1];
    const dz = Nz - this.heartLightPos[2];
    const distSq = dx * dx + dy * dy + dz * dz;
    const heartDist = Math.sqrt(distSq) || 0.1;
    const heartDir = [-dx / heartDist, -dy / heartDist, -dz / heartDist];
    const heartNdotL = Math.max(0, this.dot(N, heartDir));
    const heartAttenuation = 1.0 / (1.0 + 4.0 * distSq);
    const heartLight = heartNdotL * heartAttenuation * 0.35 * heartPulse;

    // 5. Rim highlight along outer silhouette
    const rim = Math.pow(1.0 - Nz, 2.5) * 0.18;

    // Total intensity
    const total = ambient + keyDiffuse + fillDiffuse + heartLight + rim;
    return Math.max(0.0, Math.min(1.0, total));
  }
}

window.TeddyLighting = TeddyLighting;

