/**
 * teddy3DCharacter.js
 * ============================================================================
 * Procedural 3D Plush Teddy Bear Character Model for Three.js.
 * Features:
 * - High-quality soft caramel/cream plush fur materials with subtle rim highlights
 * - Large rounded chibi head, circular ears with inner ear cavities
 * - Glossy anime eyes with specular glints & realistic blinking eyelids
 * - Snout with button nose, sweet smiling mouth, and blushing rosy cheeks
 * - Cozy pink hoodie with hood collar and pockets
 * - 3D Heart-shaped chest badge with live personalized name rendering
 * - Rigged hierarchical arms, paws with pads/toe beans, and legs
 * - Theme-reactive materials (Cyber Rose, Golden Honey, Cosmic Aurora, Dreamy Lavender)
 * ============================================================================
 */

class Teddy3DCharacter {
  constructor(name = "Someone Special") {
    this.name = name;
    this.group = new THREE.Group();

    // Theme color definitions
    this.themes = {
      cyberRose: {
        fur: 0xe6b382,
        furInner: 0xfce4d6,
        snout: 0xfff2e6,
        hoodie: 0xff5c8a,
        hoodieTrim: 0xff7aa2,
        ribbon: 0x34d399,
        heartBadge: 0xff1e56,
        blush: 0xff8fa3
      },
      goldenHoney: {
        fur: 0xdf9d5b,
        furInner: 0xffeedb,
        snout: 0xfff6ec,
        hoodie: 0xff9f1c,
        hoodieTrim: 0xffb74d,
        ribbon: 0xe63946,
        heartBadge: 0xf72585,
        blush: 0xffb4a2
      },
      cosmicAurora: {
        fur: 0xd2a581,
        furInner: 0xf5e8dd,
        snout: 0xf8f9fa,
        hoodie: 0x38bdf8,
        hoodieTrim: 0x7dd3fc,
        ribbon: 0xf43f5e,
        heartBadge: 0x8b5cf6,
        blush: 0xf472b6
      },
      dreamyLavender: {
        fur: 0xd8a98b,
        furInner: 0xfbeee6,
        snout: 0xfff5f8,
        hoodie: 0xa855f7,
        hoodieTrim: 0xc084fc,
        ribbon: 0xfbbf24,
        heartBadge: 0xf43f5e,
        blush: 0xf472b6
      }
    };

    this.currentThemeKey = "cyberRose";
    this.materials = {};

    // Animation nodes
    this.headNode = null;
    this.earLeftNode = null;
    this.earRightNode = null;
    this.armLeftNode = null;
    this.armRightNode = null;
    this.eyelidLeftNode = null;
    this.eyelidRightNode = null;
    this.blushLeftMesh = null;
    this.blushRightMesh = null;
    this.badgeMesh = null;
    this.badgeTexture = null;

    this.initMaterials();
    this.buildTeddyModel();
  }

  initMaterials() {
    const t = this.themes[this.currentThemeKey];

    // Plush Fur Material
    this.materials.fur = new THREE.MeshStandardMaterial({
      color: t.fur,
      roughness: 0.88,
      metalness: 0.05
    });

    // Soft Cream Snout
    this.materials.snout = new THREE.MeshStandardMaterial({
      color: t.snout,
      roughness: 0.82,
      metalness: 0.02
    });

    // Inner Ears & Pads
    this.materials.furInner = new THREE.MeshStandardMaterial({
      color: t.furInner,
      roughness: 0.92,
      metalness: 0.02
    });

    // Glossy Button Nose
    this.materials.nose = new THREE.MeshStandardMaterial({
      color: 0x2b141e,
      roughness: 0.25,
      metalness: 0.25
    });

    // Glossy Anime Eyes
    this.materials.eye = new THREE.MeshStandardMaterial({
      color: 0x08040a,
      roughness: 0.1,
      metalness: 0.3
    });

    // Eye Specular Highlight
    this.materials.eyeGlint = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    // Blushing Cheeks
    this.materials.blush = new THREE.MeshBasicMaterial({
      color: t.blush,
      transparent: true,
      opacity: 0.55
    });

    // Cozy Fabric Hoodie
    this.materials.hoodie = new THREE.MeshStandardMaterial({
      color: t.hoodie,
      roughness: 0.75,
      metalness: 0.08
    });

    this.materials.hoodieTrim = new THREE.MeshStandardMaterial({
      color: t.hoodieTrim,
      roughness: 0.8,
      metalness: 0.05
    });

    // Silk Bowtie
    this.materials.ribbon = new THREE.MeshStandardMaterial({
      color: t.ribbon,
      roughness: 0.35,
      metalness: 0.2
    });
  }

  buildTeddyModel() {
    // ------------------------------------------------------------------------
    // 1. Torso / Body & Cozy Hoodie
    // ------------------------------------------------------------------------
    const bodyGroup = new THREE.Group();
    this.bodyGroup = bodyGroup;

    // Plush Torso
    const bodyGeo = new THREE.SphereGeometry(1.4, 32, 32);
    bodyGeo.scale(1.05, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.fur);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyGroup.add(bodyMesh);

    // Hoodie Sweater Vest
    const hoodieGeo = new THREE.CylinderGeometry(1.36, 1.48, 1.45, 32);
    const hoodieMesh = new THREE.Mesh(hoodieGeo, this.materials.hoodie);
    hoodieMesh.position.y = -0.05;
    hoodieMesh.castShadow = true;
    bodyGroup.add(hoodieMesh);

    // Hoodie Neck Collar / Roll
    const collarGeo = new THREE.TorusGeometry(1.22, 0.22, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, this.materials.hoodieTrim);
    collarMesh.position.y = 0.72;
    bodyGroup.add(collarMesh);

    // Heart Badge with Personalized Name
    this.createHeartBadge(bodyGroup);

    this.group.add(bodyGroup);

    // ------------------------------------------------------------------------
    // 2. Head, Ears & Expressive Face
    // ------------------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.9, 0.05);
    this.headNode = headGroup;

    // Head Sphere
    const headGeo = new THREE.SphereGeometry(1.38, 32, 32);
    headGeo.scale(1.06, 0.98, 1.02);
    const headMesh = new THREE.Mesh(headGeo, this.materials.fur);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Chubby Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.55, 20, 20);
    const cheekL = new THREE.Mesh(cheekGeo, this.materials.fur);
    cheekL.position.set(-0.75, -0.28, 0.55);
    headGroup.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, this.materials.fur);
    cheekR.position.set(0.75, -0.28, 0.55);
    headGroup.add(cheekR);

    // Rounded Plush Ears
    this.buildEars(headGroup);

    // Soft Forward Snout
    const snoutGeo = new THREE.SphereGeometry(0.52, 24, 24);
    snoutGeo.scale(1.18, 0.85, 0.75);
    const snoutMesh = new THREE.Mesh(snoutGeo, this.materials.snout);
    snoutMesh.position.set(0, -0.15, 1.08);
    headGroup.add(snoutMesh);

    // Button Nose
    const noseGeo = new THREE.SphereGeometry(0.16, 20, 20);
    noseGeo.scale(1.15, 0.8, 0.9);
    const noseMesh = new THREE.Mesh(noseGeo, this.materials.nose);
    noseMesh.position.set(0, -0.05, 1.48);
    headGroup.add(noseMesh);

    // Smile Line
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.16, -0.22, 1.42),
      new THREE.Vector3(0, -0.32, 1.44),
      new THREE.Vector3(0.16, -0.22, 1.42)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.024, 8, false);
    const smileMesh = new THREE.Mesh(smileGeo, this.materials.nose);
    headGroup.add(smileMesh);

    // Eyes with Specular Highlights & Blinking Eyelids
    this.buildEyes(headGroup);

    // Blushing Cheeks
    const blushGeo = new THREE.CircleGeometry(0.24, 24);
    const blushL = new THREE.Mesh(blushGeo, this.materials.blush);
    blushL.position.set(-0.78, -0.24, 1.15);
    blushL.rotation.y = -0.4;
    blushL.rotation.x = -0.1;
    headGroup.add(blushL);
    this.blushLeftMesh = blushL;

    const blushR = new THREE.Mesh(blushGeo, this.materials.blush);
    blushR.position.set(0.78, -0.24, 1.15);
    blushR.rotation.y = 0.4;
    blushR.rotation.x = -0.1;
    headGroup.add(blushR);
    this.blushRightMesh = blushR;

    // Emerald/Gold Silk Bowtie
    this.buildBowtie(headGroup);

    this.group.add(headGroup);

    // ------------------------------------------------------------------------
    // 3. Arms & Paws (Rigged for waving & hugging)
    // ------------------------------------------------------------------------
    this.buildArms();

    // ------------------------------------------------------------------------
    // 4. Seated Plush Legs & Feet with Toe Beans
    // ------------------------------------------------------------------------
    this.buildLegs();
  }

  buildEars(headGroup) {
    const earGeo = new THREE.SphereGeometry(0.52, 24, 24);
    earGeo.scale(1.0, 1.0, 0.4);

    const innerEarGeo = new THREE.SphereGeometry(0.34, 20, 20);
    innerEarGeo.scale(1.0, 1.0, 0.25);

    // Left Ear
    const earLGroup = new THREE.Group();
    earLGroup.position.set(-1.08, 1.15, 0.0);
    earLGroup.rotation.z = 0.25;

    const earLOuter = new THREE.Mesh(earGeo, this.materials.fur);
    earLOuter.castShadow = true;
    earLGroup.add(earLOuter);

    const earLInner = new THREE.Mesh(innerEarGeo, this.materials.furInner);
    earLInner.position.set(0, 0, 0.12);
    earLGroup.add(earLInner);

    headGroup.add(earLGroup);
    this.earLeftNode = earLGroup;

    // Right Ear
    const earRGroup = new THREE.Group();
    earRGroup.position.set(1.08, 1.15, 0.0);
    earRGroup.rotation.z = -0.25;

    const earROuter = new THREE.Mesh(earGeo, this.materials.fur);
    earROuter.castShadow = true;
    earRGroup.add(earROuter);

    const earRInner = new THREE.Mesh(innerEarGeo, this.materials.furInner);
    earRInner.position.set(0, 0, 0.12);
    earRGroup.add(earRInner);

    headGroup.add(earRGroup);
    this.earRightNode = earRGroup;
  }

  buildEyes(headGroup) {
    const eyeGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const glintGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const glintSubGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const eyelidGeo = new THREE.SphereGeometry(0.19, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);

    // Left Eye
    const eyeLGroup = new THREE.Group();
    eyeLGroup.position.set(-0.46, 0.08, 1.25);
    eyeLGroup.rotation.y = -0.25;

    const eyeL = new THREE.Mesh(eyeGeo, this.materials.eye);
    eyeLGroup.add(eyeL);

    const glintL1 = new THREE.Mesh(glintGeo, this.materials.eyeGlint);
    glintL1.position.set(-0.04, 0.06, 0.14);
    eyeLGroup.add(glintL1);

    const glintL2 = new THREE.Mesh(glintSubGeo, this.materials.eyeGlint);
    glintL2.position.set(0.05, -0.05, 0.14);
    eyeLGroup.add(glintL2);

    // Eyelid for blinking
    const eyelidL = new THREE.Mesh(eyelidGeo, this.materials.fur);
    eyelidL.rotation.x = -Math.PI / 2;
    eyelidL.scale.set(1, 1, 0.001); // Closed by default via scale
    eyeLGroup.add(eyelidL);
    this.eyelidLeftNode = eyelidL;

    headGroup.add(eyeLGroup);

    // Right Eye
    const eyeRGroup = new THREE.Group();
    eyeRGroup.position.set(0.46, 0.08, 1.25);
    eyeRGroup.rotation.y = 0.25;

    const eyeR = new THREE.Mesh(eyeGeo, this.materials.eye);
    eyeRGroup.add(eyeR);

    const glintR1 = new THREE.Mesh(glintGeo, this.materials.eyeGlint);
    glintR1.position.set(-0.04, 0.06, 0.14);
    eyeRGroup.add(glintR1);

    const glintR2 = new THREE.Mesh(glintSubGeo, this.materials.eyeGlint);
    glintR2.position.set(0.05, -0.05, 0.14);
    eyeRGroup.add(glintR2);

    // Eyelid for blinking
    const eyelidR = new THREE.Mesh(eyelidGeo, this.materials.fur);
    eyelidR.rotation.x = -Math.PI / 2;
    eyelidR.scale.set(1, 1, 0.001);
    eyeRGroup.add(eyelidR);
    this.eyelidRightNode = eyelidR;

    headGroup.add(eyeRGroup);
  }

  buildBowtie(headGroup) {
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, -0.85, 1.2);

    // Center Knot
    const knotGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const knot = new THREE.Mesh(knotGeo, this.materials.ribbon);
    bowGroup.add(knot);

    // Wings
    const wingGeo = new THREE.ConeGeometry(0.26, 0.45, 16);
    wingGeo.rotateZ(Math.PI / 2);

    const wingL = new THREE.Mesh(wingGeo, this.materials.ribbon);
    wingL.position.x = -0.26;
    wingL.scale.set(1, 0.7, 0.7);
    bowGroup.add(wingL);

    const wingR = new THREE.Mesh(wingGeo, this.materials.ribbon);
    wingR.position.x = 0.26;
    wingR.rotation.y = Math.PI;
    wingR.scale.set(1, 0.7, 0.7);
    bowGroup.add(wingR);

    headGroup.add(bowGroup);
  }

  buildArms() {
    const armGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.1, 24);
    armGeo.translate(0, -0.55, 0);

    const pawGeo = new THREE.SphereGeometry(0.42, 24, 24);
    pawGeo.scale(1.0, 0.9, 0.9);

    const padMainGeo = new THREE.SphereGeometry(0.18, 16, 16);
    padMainGeo.scale(1.1, 0.9, 0.3);

    const toeBeanGeo = new THREE.SphereGeometry(0.065, 12, 12);
    toeBeanGeo.scale(1.0, 1.0, 0.3);

    // Left Arm Hierarchy
    const armL = new THREE.Group();
    armL.position.set(-1.42, 0.65, 0.1);
    armL.rotation.set(0.35, 0.15, 0.45);

    const armLMesh = new THREE.Mesh(armGeo, this.materials.fur);
    armLMesh.castShadow = true;
    armL.add(armLMesh);

    const pawL = new THREE.Mesh(pawGeo, this.materials.fur);
    pawL.position.set(0, -1.1, 0.05);
    pawL.castShadow = true;

    // Pads
    const padL = new THREE.Mesh(padMainGeo, this.materials.furInner);
    padL.position.set(0, -0.05, 0.38);
    pawL.add(padL);

    for (let i = -1; i <= 1; i++) {
      const bean = new THREE.Mesh(toeBeanGeo, this.materials.furInner);
      bean.position.set(i * 0.12, 0.16, 0.36);
      pawL.add(bean);
    }

    armL.add(pawL);
    this.armLeftNode = armL;
    this.group.add(armL);

    // Right Arm Hierarchy (Active for Waving and Hugging)
    const armR = new THREE.Group();
    armR.position.set(1.42, 0.65, 0.1);
    armR.rotation.set(0.35, -0.15, -0.45);

    const armRMesh = new THREE.Mesh(armGeo, this.materials.fur);
    armRMesh.castShadow = true;
    armR.add(armRMesh);

    const pawR = new THREE.Mesh(pawGeo, this.materials.fur);
    pawR.position.set(0, -1.1, 0.05);
    pawR.castShadow = true;

    // Pads
    const padR = new THREE.Mesh(padMainGeo, this.materials.furInner);
    padR.position.set(0, -0.05, 0.38);
    pawR.add(padR);

    for (let i = -1; i <= 1; i++) {
      const bean = new THREE.Mesh(toeBeanGeo, this.materials.furInner);
      bean.position.set(i * 0.12, 0.16, 0.36);
      pawR.add(bean);
    }

    armR.add(pawR);
    this.armRightNode = armR;
    this.group.add(armR);
  }

  buildLegs() {
    const legGeo = new THREE.CylinderGeometry(0.44, 0.48, 1.0, 24);
    legGeo.translate(0, -0.5, 0);

    const footGeo = new THREE.SphereGeometry(0.55, 24, 24);
    footGeo.scale(1.0, 0.75, 1.25);

    const footPadGeo = new THREE.SphereGeometry(0.24, 16, 16);
    footPadGeo.scale(1.1, 0.2, 1.0);

    const toePadGeo = new THREE.SphereGeometry(0.08, 12, 12);
    toePadGeo.scale(1.0, 0.2, 1.0);

    // Left Seated Leg
    const legL = new THREE.Group();
    legL.position.set(-0.95, -1.0, 0.35);
    legL.rotation.set(-0.35, -0.45, 0.2);

    const legLMesh = new THREE.Mesh(legGeo, this.materials.fur);
    legL.add(legLMesh);

    const footL = new THREE.Mesh(footGeo, this.materials.fur);
    footL.position.set(0, -0.95, 0.25);
    footL.rotation.x = 0.35;
    footL.castShadow = true;

    // Foot Pad & 3 Toe Beans
    const padL = new THREE.Mesh(footPadGeo, this.materials.furInner);
    padL.position.set(0, 0.22, 0.15);
    footL.add(padL);

    for (let i = -1; i <= 1; i++) {
      const toe = new THREE.Mesh(toePadGeo, this.materials.furInner);
      toe.position.set(i * 0.16, 0.24, 0.52);
      footL.add(toe);
    }

    legL.add(footL);
    this.group.add(legL);

    // Right Seated Leg
    const legR = new THREE.Group();
    legR.position.set(0.95, -1.0, 0.35);
    legR.rotation.set(-0.35, 0.45, -0.2);

    const legRMesh = new THREE.Mesh(legGeo, this.materials.fur);
    legR.add(legRMesh);

    const footR = new THREE.Mesh(footGeo, this.materials.fur);
    footR.position.set(0, -0.95, 0.25);
    footR.rotation.x = 0.35;
    footR.castShadow = true;

    // Foot Pad & 3 Toe Beans
    const padR = new THREE.Mesh(footPadGeo, this.materials.furInner);
    padR.position.set(0, 0.22, 0.15);
    footR.add(padR);

    for (let i = -1; i <= 1; i++) {
      const toe = new THREE.Mesh(toePadGeo, this.materials.furInner);
      toe.position.set(i * 0.16, 0.24, 0.52);
      footR.add(toe);
    }

    legR.add(footR);
    this.group.add(legR);
  }

  createHeartBadge(bodyGroup) {
    // 3D Cardioid Heart Shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x, y + 0.25);
    heartShape.bezierCurveTo(x, y + 0.5, x - 0.45, y + 0.75, x - 0.65, y + 0.75);
    heartShape.bezierCurveTo(x - 0.95, y + 0.75, x - 0.95, y + 0.35, x - 0.95, y + 0.35);
    heartShape.bezierCurveTo(x - 0.95, y, x - 0.65, y - 0.35, x, y - 0.85);
    heartShape.bezierCurveTo(x + 0.65, y - 0.35, x + 0.95, y, x + 0.95, y + 0.35);
    heartShape.bezierCurveTo(x + 0.95, y + 0.35, x + 0.95, y + 0.75, x + 0.65, y + 0.75);
    heartShape.bezierCurveTo(x + 0.45, y + 0.75, x, y + 0.5, x, y + 0.25);

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    heartGeo.scale(0.85, 0.85, 0.85);

    // Create Canvas Texture for Badge Name
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    this.badgeCanvas = canvas;
    this.badgeTexture = new THREE.CanvasTexture(canvas);
    this.updateBadgeTexture();

    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.badgeTexture,
      roughness: 0.4,
      metalness: 0.1
    });

    const badgeMesh = new THREE.Mesh(heartGeo, badgeMat);
    badgeMesh.position.set(0, 0.15, 1.38);
    badgeMesh.rotation.x = -0.15;
    badgeMesh.name = "heartBadge";
    bodyGroup.add(badgeMesh);
    this.badgeMesh = badgeMesh;
  }

  updateBadgeTexture() {
    if (!this.badgeCanvas) return;
    const ctx = this.badgeCanvas.getContext("2d");
    const W = this.badgeCanvas.width;
    const H = this.badgeCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // Heart gradient fill
    const grad = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 220);
    grad.addColorStop(0, "#ff4071");
    grad.addColorStop(0.7, "#e11d48");
    grad.addColorStop(1, "#9f1239");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Golden embroidered border
    ctx.strokeStyle = "rgba(255, 235, 150, 0.85)";
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // Text formatting
    const rawName = (this.name || "YOU").toUpperCase().trim();
    const cleanName = rawName.slice(0, 14);

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 235, 150, 0.9)";
    ctx.shadowBlur = 18;
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("✧  MADE FOR  ✧", W / 2, H / 2 - 45);

    ctx.font = 'bold 56px "Fira Code", monospace';
    ctx.fillStyle = "#fffae0";
    ctx.fillText(cleanName, W / 2, H / 2 + 35);

    if (this.badgeTexture) {
      this.badgeTexture.needsUpdate = true;
    }
  }

  setName(newName) {
    this.name = newName;
    this.updateBadgeTexture();
  }

  setTheme(themeKey) {
    if (!this.themes[themeKey]) return;
    this.currentThemeKey = themeKey;
    const t = this.themes[themeKey];

    this.materials.fur.color.setHex(t.fur);
    this.materials.furInner.color.setHex(t.furInner);
    this.materials.snout.color.setHex(t.snout);
    this.materials.hoodie.color.setHex(t.hoodie);
    this.materials.hoodieTrim.color.setHex(t.hoodieTrim);
    this.materials.ribbon.color.setHex(t.ribbon);
    this.materials.blush.color.setHex(t.blush);
    this.updateBadgeTexture();
  }
}

window.Teddy3DCharacter = Teddy3DCharacter;
