/**
 * teddyGiftScene.js
 * ============================================================================
 * Master Three.js Cinematic Scene Pipeline for the 3D Teddy Bear Gift.
 * Orchestrates:
 * 1. WebGLRenderer with Tone Mapping & Anti-aliasing
 * 2. Teddy3DCharacter & TeddyGiftBox
 * 3. TeddyCharacterAnimation Controller
 * 4. Cinematic Lighting (Ambient, Key, Fill, Rim & Heart Point Light)
 * 5. Particle Systems:
 *    - 3D Twinkling Starfield with Mouse Parallax
 *    - 3D Floating Rose/Sakura Petals with 3D Turbulence
 *    - Radiating Heart Particles
 *    - Animated Fluttering Golden Firefly / Butterfly
 * 6. Interactive Raycasting for Teddy & Secret Heart Badge
 * 7. Camera Movements & Seamless Portal Warp
 * ============================================================================
 */

class TeddyGiftScene {
  constructor(canvasElement, visitorName = "Someone Special") {
    this.canvas = canvasElement;
    this.name = visitorName;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Components
    this.teddy = null;
    this.giftBox = null;
    this.animation = null;

    // Particles & Details
    this.starsMesh = null;
    this.petalsMesh = null;
    this.petalData = [];
    this.heartParticlesMesh = null;
    this.fireflyGroup = null;
    this.fireflyLight = null;

    // Dynamic Lights
    this.heartPointLight = null;
    this.ambientLight = null;
    this.rimLight = null;

    // Mouse & Raycasting
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.targetCameraPos = new THREE.Vector3(0, 1.2, 9.2);

    // Callbacks
    this.onBadgeClicked = null;
    this.onTeddyClicked = null;

    // Animation Loop
    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.rafId = null;

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (Cinematic 42mm equivalent)
    const aspect = this.canvas.clientWidth / (this.canvas.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.copy(this.targetCameraPos);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting Rig
    this.setupLighting();

    // 5. 3D Gift Box & Teddy Character
    this.giftBox = new TeddyGiftBox();
    this.scene.add(this.giftBox.group);

    this.teddy = new Teddy3DCharacter(this.name);
    this.scene.add(this.teddy.group);

    // 6. Animation Controller
    this.animation = new TeddyCharacterAnimation(this.teddy, this.giftBox);

    // 7. Particle Systems
    this.setupStarfield(500);
    this.setupPetals(45);
    this.setupHeartParticles(35);
    this.setupFirefly();

    // 8. Event Listeners
    this.bindEvents();
  }

  setupLighting() {
    // Soft romantic ambient light
    this.ambientLight = new THREE.AmbientLight(0x281238, 0.85);
    this.scene.add(this.ambientLight);

    // Warm key directional light (top-left)
    const keyLight = new THREE.DirectionalLight(0xffecd1, 1.25);
    keyLight.position.set(-4.5, 7.5, 6.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Soft lavender fill light (right)
    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.55);
    fillLight.position.set(5.0, 2.0, 4.0);
    this.scene.add(fillLight);

    // Vibrant pink-rose rim light (behind teddy for fur halo)
    this.rimLight = new THREE.DirectionalLight(0xff4d88, 1.85);
    this.rimLight.position.set(0.0, 5.0, -6.5);
    this.scene.add(this.rimLight);

    // Radiant Heart Point Light on Teddy's Chest
    this.heartPointLight = new THREE.PointLight(0xff2a6d, 1.8, 6.5);
    this.heartPointLight.position.set(0, 1.3, 1.6);
    this.scene.add(this.heartPointLight);
  }

  setupStarfield(count) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0xffb3c6);
    const c2 = new THREE.Color(0xffe066);
    const c3 = new THREE.Color(0x90e0ef);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = -10 - Math.random() * 35;

      const pick = Math.random();
      const col = pick < 0.4 ? c1 : (pick < 0.7 ? c2 : c3);
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.starsMesh = new THREE.Points(geo, mat);
    this.scene.add(this.starsMesh);
  }

  setupPetals(count) {
    const petalGeo = new THREE.PlaneGeometry(0.32, 0.24, 2, 2);
    // Slight curve in geometry
    const pos = petalGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = Math.sin(pos.getX(i) * 5.0) * 0.05;
      pos.setZ(i, z);
    }
    petalGeo.computeVertexNormals();

    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xff7096,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    this.petalsMesh = new THREE.InstancedMesh(petalGeo, petalMat, count);
    this.petalData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = 3 + Math.random() * 10;
      const z = (Math.random() - 0.5) * 12 + 2;

      this.petalData.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.6 - Math.random() * 0.8,
        vz: (Math.random() - 0.5) * 0.4,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        rotSpeedX: (Math.random() - 0.5) * 2.0,
        rotSpeedY: (Math.random() - 0.5) * 2.0,
        rotSpeedZ: (Math.random() - 0.5) * 2.0,
        scale: 0.75 + Math.random() * 0.55
      });

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      this.petalsMesh.setMatrixAt(i, dummy.matrix);
    }
    this.petalsMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.petalsMesh);
  }

  setupHeartParticles(count) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3.5;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
      positions[i * 3 + 2] = 0.5 + (Math.random() - 0.5) * 2.5;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.28,
      color: 0xff3366,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.heartParticlesMesh = new THREE.Points(geo, mat);
    this.scene.add(this.heartParticlesMesh);
  }

  setupFirefly() {
    this.fireflyGroup = new THREE.Group();

    // Glowing core
    const coreGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff382 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    this.fireflyGroup.add(core);

    // Point Light cast by firefly
    this.fireflyLight = new THREE.PointLight(0xffea00, 1.2, 3.5);
    this.fireflyGroup.add(this.fireflyLight);

    // Translucent fluttering wings
    const wingGeo = new THREE.PlaneGeometry(0.12, 0.08);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.08, 0.04, 0);
    this.fireflyGroup.add(wingL);
    this.wingL = wingL;

    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0.08, 0.04, 0);
    this.fireflyGroup.add(wingR);
    this.wingR = wingR;

    this.fireflyGroup.position.set(1.8, 2.2, 1.5);
    this.scene.add(this.fireflyGroup);
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize(), { passive: true });

    // Mouse Tracking
    const onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);

      this.mouse.x = nx;
      this.mouse.y = ny;

      if (this.animation) {
        this.animation.setMouse(nx, ny);
      }
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    // Raycast Interaction (Click on Teddy or Heart Badge)
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.raycaster.setFromCamera({ x, y }, this.camera);
      const intersects = this.raycaster.intersectObjects(this.teddy.group.children, true);

      if (intersects.length > 0) {
        let isBadge = false;
        for (const hit of intersects) {
          if (hit.object && (hit.object.name === "heartBadge" || hit.object === this.teddy.badgeMesh)) {
            isBadge = true;
            break;
          }
        }

        if (isBadge) {
          if (this.onBadgeClicked) this.onBadgeClicked();
        } else {
          this.animation.triggerBounce();
          if (this.onTeddyClicked) this.onTeddyClicked();
        }
      }
    });
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / (h || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.animation.startSequence();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  animate() {
    if (!this.isRunning) return;
    const dt = Math.min(0.08, this.clock.getDelta());
    const t = this.clock.getElapsedTime();

    // 1. Update Animations & Physics
    if (this.animation) {
      this.animation.update(dt);
    }

    // 2. Camera Parallax & Subtle Breathing
    const targetCamX = this.mouse.x * 0.65;
    const targetCamY = 1.2 + this.mouse.y * 0.45;
    this.camera.position.x += (targetCamX - this.camera.position.x) * (dt * 2.5);
    this.camera.position.y += (targetCamY - this.camera.position.y) * (dt * 2.5);
    this.camera.lookAt(0, 0.9, 0);

    // 3. Heart Light Pulsing (Lub-Dub rhythm)
    if (this.heartPointLight) {
      const beat = 0.5 + 0.5 * Math.sin(t * 3.5);
      this.heartPointLight.intensity = 1.4 + 1.2 * Math.pow(beat, 2.0);
    }

    // 4. Update Petals System
    if (this.petalsMesh && this.petalData.length > 0) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.petalData.length; i++) {
        const p = this.petalData[i];
        p.y += p.vy * dt;
        p.x += Math.sin(t * 1.5 + i) * dt * 0.45;
        p.z += Math.cos(t * 1.2 + i) * dt * 0.35;

        p.rotX += p.rotSpeedX * dt;
        p.rotY += p.rotSpeedY * dt;
        p.rotZ += p.rotSpeedZ * dt;

        // Reset when fallen below screen
        if (p.y < -3.5) {
          p.y = 8.5;
          p.x = (Math.random() - 0.5) * 14;
        }

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        this.petalsMesh.setMatrixAt(i, dummy.matrix);
      }
      this.petalsMesh.instanceMatrix.needsUpdate = true;
    }

    // 5. Update Heart Particles (Floating upward)
    if (this.heartParticlesMesh) {
      const posAttr = this.heartParticlesMesh.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let py = posAttr.getY(i) + dt * 0.75;
        let px = posAttr.getX(i) + Math.sin(t * 2.0 + i) * dt * 0.25;
        if (py > 5.5) {
          py = 0.2;
          px = (Math.random() - 0.5) * 2.5;
        }
        posAttr.setY(i, py);
        posAttr.setX(i, px);
      }
      posAttr.needsUpdate = true;
    }

    // 6. Update Fluttering Firefly
    if (this.fireflyGroup) {
      const fx = Math.sin(t * 1.2) * 2.4;
      const fy = 1.6 + Math.cos(t * 1.8) * 0.95;
      const fz = 1.2 + Math.cos(t * 1.2) * 1.8;
      this.fireflyGroup.position.set(fx, fy, fz);

      const wingFlap = Math.sin(t * 32.0) * 0.85;
      if (this.wingL && this.wingR) {
        this.wingL.rotation.y = wingFlap;
        this.wingR.rotation.y = -wingFlap;
      }
    }

    // 7. Render Frame
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  setTheme(themeKey) {
    if (this.teddy) {
      this.teddy.setTheme(themeKey);
    }
  }

  setName(newName) {
    this.name = newName;
    if (this.teddy) {
      this.teddy.setName(newName);
    }
  }
}

window.TeddyGiftScene = TeddyGiftScene;

