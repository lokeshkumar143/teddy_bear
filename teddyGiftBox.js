/**
 * teddyGiftBox.js
 * ============================================================================
 * 3D Animated Gift Box with Opening Lid, Satin Ribbons & Internal Light Ray.
 * Sequences:
 * 1. Materialization from gathering starburst particles
 * 2. Golden ribbon unties with sparkling dust
 * 3. Hinged lid lifts and swings back smoothly
 * 4. Pink-gold volumetric light beam erupts from inside
 * ============================================================================
 */

class TeddyGiftBox {
  constructor() {
    this.group = new THREE.Group();

    // Box Materials
    this.materials = {
      boxOuter: new THREE.MeshStandardMaterial({
        color: 0x881337,
        roughness: 0.45,
        metalness: 0.15
      }),
      boxInner: new THREE.MeshStandardMaterial({
        color: 0xfff5ea,
        roughness: 0.8,
        metalness: 0.05
      }),
      ribbon: new THREE.MeshStandardMaterial({
        color: 0xffd166,
        roughness: 0.25,
        metalness: 0.65
      }),
      lightRay: new THREE.MeshBasicMaterial({
        color: 0xff6699,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    };

    this.boxBaseGroup = new THREE.Group();
    this.lidHingeGroup = new THREE.Group();
    this.bowGroup = new THREE.Group();
    this.internalLight = null;
    this.lightBeamMesh = null;

    this.buildBox();
  }

  buildBox() {
    const W = 3.8;
    const H = 2.8;
    const D = 3.8;
    const thickness = 0.15;

    // ------------------------------------------------------------------------
    // 1. Five-sided Hollow Box Base
    // ------------------------------------------------------------------------
    // Bottom
    const bottomGeo = new THREE.BoxGeometry(W, thickness, D);
    const bottomMesh = new THREE.Mesh(bottomGeo, this.materials.boxOuter);
    bottomMesh.position.y = -H / 2;
    bottomMesh.receiveShadow = true;
    this.boxBaseGroup.add(bottomMesh);

    // Front Wall
    const frontGeo = new THREE.BoxGeometry(W, H, thickness);
    const frontMesh = new THREE.Mesh(frontGeo, this.materials.boxOuter);
    frontMesh.position.set(0, 0, D / 2 - thickness / 2);
    frontMesh.castShadow = true;
    this.boxBaseGroup.add(frontMesh);

    // Back Wall
    const backMesh = new THREE.Mesh(frontGeo, this.materials.boxOuter);
    backMesh.position.set(0, 0, -D / 2 + thickness / 2);
    backMesh.castShadow = true;
    this.boxBaseGroup.add(backMesh);

    // Left Wall
    const sideGeo = new THREE.BoxGeometry(thickness, H, D - thickness * 2);
    const leftMesh = new THREE.Mesh(sideGeo, this.materials.boxOuter);
    leftMesh.position.set(-W / 2 + thickness / 2, 0, 0);
    leftMesh.castShadow = true;
    this.boxBaseGroup.add(leftMesh);

    // Right Wall
    const rightMesh = new THREE.Mesh(sideGeo, this.materials.boxOuter);
    rightMesh.position.set(W / 2 - thickness / 2, 0, 0);
    rightMesh.castShadow = true;
    this.boxBaseGroup.add(rightMesh);

    // Vertical & Horizontal Ribbon Bands on Walls
    const ribbonVGeo = new THREE.BoxGeometry(0.5, H + 0.02, D + 0.04);
    const ribbonV = new THREE.Mesh(ribbonVGeo, this.materials.ribbon);
    this.boxBaseGroup.add(ribbonV);

    const ribbonHGeo = new THREE.BoxGeometry(W + 0.04, H + 0.02, 0.5);
    const ribbonH = new THREE.Mesh(ribbonHGeo, this.materials.ribbon);
    this.boxBaseGroup.add(ribbonH);

    this.group.add(this.boxBaseGroup);

    // ------------------------------------------------------------------------
    // 2. Hinged Lid with Big Satin Bow
    // ------------------------------------------------------------------------
    // Hinge pivot point at rear-top of the box
    this.lidHingeGroup.position.set(0, H / 2, -D / 2);

    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0, D / 2); // Center lid relative to hinge

    // Lid Top
    const lidW = W + 0.25;
    const lidD = D + 0.25;
    const lidH = 0.55;
    const lidGeo = new THREE.BoxGeometry(lidW, lidH, lidD);
    const lidMesh = new THREE.Mesh(lidGeo, this.materials.boxOuter);
    lidMesh.position.y = lidH / 2;
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // Lid Ribbon Cross
    const lidRibbonX = new THREE.Mesh(new THREE.BoxGeometry(lidW + 0.04, lidH + 0.04, 0.55), this.materials.ribbon);
    lidRibbonX.position.y = lidH / 2;
    lidGroup.add(lidRibbonX);

    const lidRibbonZ = new THREE.Mesh(new THREE.BoxGeometry(0.55, lidH + 0.04, lidD + 0.04), this.materials.ribbon);
    lidRibbonZ.position.y = lidH / 2;
    lidGroup.add(lidRibbonZ);

    // Fluffy 3D Ribbon Bow
    const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), this.materials.ribbon);
    bowCenter.position.y = lidH + 0.2;
    this.bowGroup.add(bowCenter);

    const loopGeo = new THREE.TorusGeometry(0.55, 0.16, 16, 32);
    for (let i = 0; i < 4; i++) {
      const loop = new THREE.Mesh(loopGeo, this.materials.ribbon);
      loop.rotation.y = (i * Math.PI) / 2 + Math.PI / 4;
      loop.rotation.x = Math.PI / 3.5;
      loop.position.y = lidH + 0.35;
      this.bowGroup.add(loop);
    }

    lidGroup.add(this.bowGroup);
    this.lidHingeGroup.add(lidGroup);
    this.group.add(this.lidHingeGroup);

    // ------------------------------------------------------------------------
    // 3. Glowing Volumetric Internal Light Beam
    // ------------------------------------------------------------------------
    this.internalLight = new THREE.PointLight(0xff2a6d, 0, 8);
    this.internalLight.position.set(0, 0, 0);
    this.group.add(this.internalLight);

    const beamGeo = new THREE.CylinderGeometry(2.2, 0.8, 5.0, 32, 1, true);
    beamGeo.translate(0, 2.5, 0);
    this.lightBeamMesh = new THREE.Mesh(beamGeo, this.materials.lightRay);
    this.lightBeamMesh.position.y = 0;
    this.group.add(this.lightBeamMesh);
  }

  /**
   * Sets open progress [0.0 = closed, 1.0 = fully open & glowing]
   */
  setOpenProgress(progress) {
    const p = Math.max(0, Math.min(1, progress));

    // 1. Bow shrinks and unties first (0.0 -> 0.25)
    const bowScale = Math.max(0.001, 1.0 - Math.min(1.0, p * 4.0));
    this.bowGroup.scale.set(bowScale, bowScale, bowScale);

    // 2. Lid swings backwards around hinge (0.15 -> 0.85)
    const lidP = Math.max(0, Math.min(1, (p - 0.15) / 0.70));
    const easedLid = lidP * lidP * (3.0 - 2.0 * lidP); // Smoothstep
    this.lidHingeGroup.rotation.x = -easedLid * 1.95; // Swing backward ~112 deg

    // 3. Internal light erupts as lid opens (0.2 -> 1.0)
    const lightP = Math.max(0, Math.min(1, (p - 0.2) / 0.8));
    if (this.internalLight) {
      this.internalLight.intensity = lightP * 4.0;
    }
    if (this.lightBeamMesh) {
      this.materials.lightRay.opacity = lightP * (1.0 - Math.max(0, (p - 0.7) * 2.0)) * 0.55;
    }
  }

  /**
   * Materialization scale [0.0 = hidden, 1.0 = full size]
   */
  setMaterializeProgress(progress) {
    const p = Math.max(0.001, Math.min(1, progress));
    this.group.scale.set(p, p, p);
  }
}

window.TeddyGiftBox = TeddyGiftBox;

