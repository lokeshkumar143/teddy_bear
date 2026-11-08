/**
 * Multilingual Cosmic Heart Canvas & Flight Engine (v15.0)
 * 
 * Creates a glowing celestial heart assembled from personal name transliterations
 * across world writing systems (Tamil, Hindi, Telugu, Japanese, Korean, Chinese,
 * Arabic, Russian, Greek, English, etc.).
 * 
 * Sequence:
 * 1. COSMIC GATHERING: Multilingual names fly inward from deep space to form the heart.
 * 2. HEARTBEAT PULSE: The completed multilingual heart pulses with physical heartbeat physics.
 * 3. HEART FLIGHT: The glowing heart flies across the screen directly into the Teddy Bear's chest!
 * 4. IMPACT BURST: The heart merges into the teddy's chest, waking the living teddy bear!
 */

import { getLanguageList, generateMultiLangName } from './name-multilang.js?v=20.0';

export class MultilingualHeart {
  constructor(canvas, audioManager, onTransferComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audioManager = audioManager;
    this.onTransferComplete = onTransferComplete;

    this.isRunning = false;
    this.rafId = null;

    // State machine: 'gather' -> 'pulse' -> 'flight' -> 'impact'
    this.state = 'idle';
    this.startTime = 0;
    this.stateStartTime = 0;

    // Heart geometry & positioning
    this.cx = 0;
    this.cy = 0;
    this.radius = 180;

    // Flight kinematics
    this.flightStart = { x: 0, y: 0, scale: 1 };
    this.flightTarget = { x: 0, y: 0, scale: 0.28 };
    this.flightDuration = 1400; // ms

    // Heart elements & particles
    this.nameNodes = [];
    this.boundaryParticles = [];
    this.trailParticles = [];
    this.burstParticles = [];

    // Heartbeat tracking
    this.lastBeatTime = 0;
    this.beatCount = 0;
    this.maxAutoBeats = 4; // auto-fly after 4 beats

    this.resize();
    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.w = w;
    this.h = h;
    this.cx = w * 0.5;
    this.cy = h * 0.44;

    // Responsive radius: fits beautifully on mobile (360px) and 4K desktop
    const minDim = Math.min(w, h);
    this.radius = Math.max(110, Math.min(230, minDim * 0.32));
  }

  /**
   * Mathematical parametric heart curve
   * t in [0, 2*PI]
   * Returns normalized x, y in [-1, 1] range
   */
  getHeartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
      x: x / 16.5,
      y: (y + 2.0) / 16.5
    };
  }

  /**
   * Calculate exact position of teddy's chest on target screen
   */
  getTeddyChestTarget() {
    const winW = this.w;
    const winH = this.h;
    const isDualStage = winW >= 921 && (winW / winH) > 1.05;

    if (isDualStage) {
      // Desktop: teddy sits centered in left 52% stage
      return {
        x: winW * 0.26,
        y: winH * 0.46,
        scale: 0.22
      };
    } else {
      // Mobile portrait: teddy sits in upper portion of the screen
      return {
        x: winW * 0.50,
        y: Math.max(140, winH * 0.28),
        scale: 0.24
      };
    }
  }

  /**
   * 34 Balanced slots filling the entire heart geometry:
   * 21 outer perimeter slots shaping the contour + 13 interior slots filling the heart volume
   */
  getHeartSlots() {
    // 21 Perimeter slots tracing the exact heart silhouette in sequence
    const perimeterSlots = [
      { x:  0.52, y: -0.62, isPerimeter: true, scale: 1.05 },
      { x:  0.72, y: -0.46, isPerimeter: true, scale: 1.0 },
      { x:  0.85, y: -0.27, isPerimeter: true, scale: 1.0 },
      { x:  0.88, y: -0.09, isPerimeter: true, scale: 1.0 },
      { x:  0.80, y:  0.09, isPerimeter: true, scale: 1.0 },
      { x:  0.68, y:  0.28, isPerimeter: true, scale: 1.0 },
      { x:  0.52, y:  0.46, isPerimeter: true, scale: 1.0 },
      { x:  0.32, y:  0.66, isPerimeter: true, scale: 0.95 },
      { x:  0.16, y:  0.84, isPerimeter: true, scale: 0.90 },
      { x:  0.00, y:  1.02, isPerimeter: true, scale: 0.92 },
      { x: -0.16, y:  0.84, isPerimeter: true, scale: 0.90 },
      { x: -0.32, y:  0.66, isPerimeter: true, scale: 0.95 },
      { x: -0.52, y:  0.46, isPerimeter: true, scale: 1.0 },
      { x: -0.68, y:  0.28, isPerimeter: true, scale: 1.0 },
      { x: -0.80, y:  0.09, isPerimeter: true, scale: 1.0 },
      { x: -0.88, y: -0.09, isPerimeter: true, scale: 1.0 },
      { x: -0.85, y: -0.27, isPerimeter: true, scale: 1.0 },
      { x: -0.72, y: -0.46, isPerimeter: true, scale: 1.0 },
      { x: -0.52, y: -0.62, isPerimeter: true, scale: 1.05 },
      { x: -0.20, y: -0.48, isPerimeter: true, scale: 0.98 },
      { x:  0.20, y: -0.48, isPerimeter: true, scale: 0.98 }
    ];

    // 13 Interior slots completely filling the heart volume
    const interiorSlots = [
      { x: -0.36, y: -0.32, isPerimeter: false, scale: 0.92 },
      { x:  0.36, y: -0.32, isPerimeter: false, scale: 0.92 },
      { x: -0.52, y: -0.16, isPerimeter: false, scale: 0.92 },
      { x: -0.22, y: -0.18, isPerimeter: false, scale: 0.90 },
      { x:  0.22, y: -0.18, isPerimeter: false, scale: 0.90 },
      { x:  0.52, y: -0.16, isPerimeter: false, scale: 0.92 },
      { x: -0.46, y:  0.04, isPerimeter: false, scale: 0.92 },
      { x:  0.46, y:  0.04, isPerimeter: false, scale: 0.92 },
      { x: -0.34, y:  0.22, isPerimeter: false, scale: 0.90 },
      { x:  0.34, y:  0.22, isPerimeter: false, scale: 0.90 },
      { x: -0.20, y:  0.42, isPerimeter: false, scale: 0.88 },
      { x:  0.20, y:  0.42, isPerimeter: false, scale: 0.88 },
      { x:  0.00, y:  0.58, isPerimeter: false, scale: 0.88 }
    ];

    return [...perimeterSlots, ...interiorSlots];
  }

  /**
   * Generates a rich catalog of 34 multilingual name tokens
   * to fill both the perimeter and interior of the heart
   */
  buildMultilingualTokens(nameProfile) {
    const orig = (nameProfile.displayName || nameProfile.originalName || 'Loki').trim();
    const translit = nameProfile.transliterations || {};

    const words = orig.split(/\s+/);
    const shortName = words.length > 1 ? words[0] : (orig.toLowerCase() === 'lokesh kumar' ? 'Loki' : orig);
    const shortTranslit = (typeof generateMultiLangName === 'function')
      ? generateMultiLangName(shortName)
      : translit;

    // 1. Primary Full Name tokens in 13 major writing systems
    const primary = [
      { code: 'ta', label: 'Tamil', script: 'தமிழ்', text: translit.ta || orig, flag: '🇮🇳' },
      { code: 'hi', label: 'Hindi', script: 'हिन्दी', text: translit.hi || orig, flag: '🇮🇳' },
      { code: 'te', label: 'Telugu', script: 'తెలుగు', text: translit.te || orig, flag: '🇮🇳' },
      { code: 'ja', label: 'Japanese', script: '日本語', text: translit.ja || orig, flag: '🇯🇵' },
      { code: 'ko', label: 'Korean', script: '한국어', text: translit.ko || orig, flag: '🇰🇷' },
      { code: 'zh', label: 'Chinese', script: '中文', text: translit.zh || orig, flag: '🇨🇳' },
      { code: 'ar', label: 'Arabic', script: 'العربية', text: translit.ar || orig, flag: '🇸🇦', dir: 'rtl' },
      { code: 'ru', label: 'Russian', script: 'Русский', text: translit.ru || orig, flag: '🇷🇺' },
      { code: 'el', label: 'Greek', script: 'Ελληνικά', text: translit.el || orig, flag: '🇬🇷' },
      { code: 'en', label: 'Latin', script: 'English', text: translit.en || orig, flag: '🌐' },
      { code: 'kn', label: 'Kannada', script: 'ಕನ್ನಡ', text: translit.kn || orig, flag: '🇮🇳' },
      { code: 'ml', label: 'Malayalam', script: 'മലയാളം', text: translit.ml || orig, flag: '🇮🇳' },
      { code: 'bn', label: 'Bengali', script: 'বাংলা', text: translit.bn || orig, flag: '🇮🇳' }
    ];

    // 2. Extra Global & Indian Writing Systems
    const globalTokens = [
      { code: 'gu', label: 'Gujarati', script: 'ગુજરાતી', text: (orig.toLowerCase().includes('lokesh') ? 'લોકેશ કુમાર' : orig), flag: '🇮🇳' },
      { code: 'pa', label: 'Punjabi', script: 'ਪੰਜਾਬੀ', text: (orig.toLowerCase().includes('lokesh') ? 'ਲੋਕੇਸ਼ ਕੁਮਾਰ' : orig), flag: '🇮🇳' },
      { code: 'he', label: 'Hebrew', script: 'עברית', text: (orig.toLowerCase().includes('lokesh') ? 'לוקש קומאר' : orig), flag: '🇮🇱', dir: 'rtl' },
      { code: 'th', label: 'Thai', script: 'ไทย', text: (orig.toLowerCase().includes('lokesh') ? 'โลเกศ กุมาร' : orig), flag: '🇹🇭' },
      { code: 'fa', label: 'Persian', script: 'فارسی', text: (orig.toLowerCase().includes('lokesh') ? 'لوکیش کومار' : orig), flag: '🇮🇷', dir: 'rtl' },
      { code: 'ur', label: 'Urdu', script: 'اردو', text: (orig.toLowerCase().includes('lokesh') ? 'لوکیش کمار' : orig), flag: '🇵🇰', dir: 'rtl' },
      { code: 'fr', label: 'French', script: 'Français', text: orig, flag: '🇫🇷' },
      { code: 'es', label: 'Spanish', script: 'Español', text: orig, flag: '🇪🇸' }
    ];

    // 3. Short / Affectionate Native Tokens for Interior Heart Filling
    const shortList = [
      { code: 'ta-s', label: 'Tamil', script: 'தமிழ்', text: shortTranslit.ta || (orig.toLowerCase().includes('lokesh') ? 'லோகி' : shortName), flag: '🇮🇳' },
      { code: 'hi-s', label: 'Hindi', script: 'हिन्दी', text: shortTranslit.hi || (orig.toLowerCase().includes('lokesh') ? 'लोकी' : shortName), flag: '🇮🇳' },
      { code: 'te-s', label: 'Telugu', script: 'తెలుగు', text: shortTranslit.te || (orig.toLowerCase().includes('lokesh') ? 'లోకి' : shortName), flag: '🇮🇳' },
      { code: 'ja-s', label: 'Japanese', script: '日本語', text: shortTranslit.ja || (orig.toLowerCase().includes('lokesh') ? 'ロキ' : shortName), flag: '🇯🇵' },
      { code: 'ko-s', label: 'Korean', script: '한국어', text: shortTranslit.ko || (orig.toLowerCase().includes('lokesh') ? '로키' : shortName), flag: '🇰🇷' },
      { code: 'zh-s', label: 'Chinese', script: '中文', text: shortTranslit.zh || (orig.toLowerCase().includes('lokesh') ? '洛基' : shortName), flag: '🇨🇳' },
      { code: 'ar-s', label: 'Arabic', script: 'العربية', text: shortTranslit.ar || (orig.toLowerCase().includes('lokesh') ? 'لوكي' : shortName), flag: '🇸🇦', dir: 'rtl' },
      { code: 'ru-s', label: 'Russian', script: 'Русский', text: shortTranslit.ru || (orig.toLowerCase().includes('lokesh') ? 'Локи' : shortName), flag: '🇷🇺' },
      { code: 'el-s', label: 'Greek', script: 'Ελληνικά', text: shortTranslit.el || (orig.toLowerCase().includes('lokesh') ? 'Λόκι' : shortName), flag: '🇬🇷' },
      { code: 'kn-s', label: 'Kannada', script: 'ಕನ್ನಡ', text: shortTranslit.kn || (orig.toLowerCase().includes('lokesh') ? 'ಲೋಕಿ' : shortName), flag: '🇮🇳' },
      { code: 'ml-s', label: 'Malayalam', script: 'മലയാളം', text: shortTranslit.ml || (orig.toLowerCase().includes('lokesh') ? 'ലോകി' : shortName), flag: '🇮🇳' },
      { code: 'bn-s', label: 'Bengali', script: 'বাংলা', text: shortTranslit.bn || (orig.toLowerCase().includes('lokesh') ? 'লোকি' : shortName), flag: '🇮🇳' },
      { code: 'it-s', label: 'Italian', script: 'Italiano', text: shortName, flag: '🇮🇹' }
    ];

    return [...primary, ...globalTokens, ...shortList];
  }

  /**
   * Initialize heart elements with user's name across world languages
   */
  initData(nameProfile) {
    this.nameProfile = nameProfile;
    this.originalName = (nameProfile.displayName || nameProfile.originalName || 'Loki').trim();
    
    // Build full set of multilingual name tokens
    const tokens = this.buildMultilingualTokens(nameProfile);

    // 21 Perimeter slots + 13 Interior slots
    const slots = this.getHeartSlots();

    this.nameNodes = [];
    const numSlots = Math.min(slots.length, tokens.length);

    for (let idx = 0; idx < numSlots; idx++) {
      const slot = slots[idx];
      const item = tokens[idx];

      // Random starting position in outer space
      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist = Math.max(this.w, this.h) * (0.6 + Math.random() * 0.4);

      this.nameNodes.push({
        code: item.code,
        label: item.label,
        script: item.script,
        text: item.text,
        flag: item.flag,
        dir: item.dir || 'ltr',
        isPerimeter: slot.isPerimeter,
        isInterior: !slot.isPerimeter,
        targetRelX: slot.x,
        targetRelY: slot.y,
        slotScale: slot.scale || 1.0,
        startX: this.cx + Math.cos(spawnAngle) * spawnDist,
        startY: this.cy + Math.sin(spawnAngle) * spawnDist,
        x: this.cx + Math.cos(spawnAngle) * spawnDist,
        y: this.cy + Math.sin(spawnAngle) * spawnDist,
        opacity: 0,
        scale: 0.5,
        hue: 35 + (idx * 26) % 330,
        delay: idx * 55 // staggered celestial arrival
      });
    }

    // Central Radiant Name (The Core Heart Soul at 0, 0.08)
    this.centerNode = {
      text: this.originalName,
      isCenter: true,
      targetRelX: 0,
      targetRelY: 0.08,
      startX: this.cx,
      startY: this.cy,
      x: this.cx,
      y: this.cy + this.radius * 0.08,
      opacity: 0,
      scale: 0.1,
      rotation: 0,
      hue: 45
    };

    // 96 glowing stardust particles tracing the heart boundary
    this.boundaryParticles = [];
    const numBoundary = 96;
    for (let i = 0; i < numBoundary; i++) {
      const t = (i / numBoundary) * Math.PI * 2;
      const pt = this.getHeartPoint(t);
      this.boundaryParticles.push({
        t: t,
        relX: pt.x,
        relY: pt.y,
        baseSize: 1.5 + Math.random() * 2.2,
        twinkleSpeed: 2.5 + Math.random() * 3.5,
        twinklePhase: Math.random() * Math.PI * 2,
        hue: 340 + Math.random() * 50
      });
    }

    // 42 interior floating stardust particles inside the heart volume
    this.interiorStardust = [];
    for (let i = 0; i < 42; i++) {
      const s = 0.2 + Math.random() * 0.7;
      const t = Math.random() * Math.PI * 2;
      const pt = this.getHeartPoint(t);
      this.interiorStardust.push({
        relX: pt.x * s,
        relY: pt.y * s,
        baseSize: 1.0 + Math.random() * 1.8,
        twinkleSpeed: 2.0 + Math.random() * 4.0,
        twinklePhase: Math.random() * Math.PI * 2,
        hue: 40 + Math.random() * 300
      });
    }

    this.trailParticles = [];
    this.burstParticles = [];
  }

  start(nameProfile) {
    this.resize();
    this.initData(nameProfile);
    this.state = 'gather';
    this.startTime = performance.now();
    this.stateStartTime = this.startTime;
    this.lastBeatTime = this.startTime;
    this.beatCount = 0;
    this.isRunning = true;

    try {
      this.audioManager?.playCelestialTone?.(0);
    } catch (e) {}

    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * User or auto-trigger initiates heart flight toward teddy's chest
   */
  triggerHeartFlight() {
    if (this.state === 'flight' || this.state === 'impact') return;

    this.state = 'flight';
    this.stateStartTime = performance.now();
    this.flightStart = {
      x: this.cx,
      y: this.cy,
      scale: 1.0
    };
    this.flightTarget = this.getTeddyChestTarget();

    try {
      this.audioManager?.playBloomChime?.();
      this.audioManager?.playHeartBurst?.();
    } catch (e) {}
  }

  loop() {
    if (!this.isRunning) return;
    this.render();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  render() {
    const now = performance.now();
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    ctx.clearRect(0, 0, w, h);

    // State timing
    const elapsed = now - this.startTime;
    const stateElapsed = now - this.stateStartTime;

    let heartCenterX = this.cx;
    let heartCenterY = this.cy;
    let heartScale = 1.0;
    let heartAlpha = 1.0;

    // ====================================================================
    // STATE 1: GATHERING (0 - 2400ms)
    // ====================================================================
    if (this.state === 'gather') {
      const gatherProgress = Math.min(1.0, stateElapsed / 2200);

      // Interpolate each language name to its spot
      this.nameNodes.forEach(node => {
        const nodeElapsed = Math.max(0, stateElapsed - node.delay);
        const nodeProg = Math.min(1.0, nodeElapsed / 1400);
        // Cubic ease-out
        const ease = 1 - Math.pow(1 - nodeProg, 3);

        const targetX = this.cx + node.targetRelX * this.radius;
        const targetY = this.cy + node.targetRelY * this.radius;

        node.x = node.startX + (targetX - node.startX) * ease;
        node.y = node.startY + (targetY - node.startY) * ease;
        node.opacity = ease;
        node.scale = (node.slotScale || 1.0) * (0.3 + ease * 0.7);

        // Emit sparkling stardust trail as names fly inward
        if (nodeProg < 0.95 && Math.random() < 0.35) {
          this.trailParticles.push({
            x: node.x + (Math.random() - 0.5) * 10,
            y: node.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 1.2 + Math.random() * 2.0,
            life: 1.0,
            decay: 0.035,
            hue: node.hue
          });
        }
      });

      // Core name emerges in center
      const coreProg = Math.min(1.0, stateElapsed / 1800);
      const coreEase = 1 - Math.pow(1 - coreProg, 3);
      this.centerNode.scale = 0.2 + coreEase * 0.9;
      this.centerNode.opacity = coreEase;

      // Transition to pulse phase once gathered
      if (gatherProgress >= 1.0) {
        this.state = 'pulse';
        this.stateStartTime = now;
        this.lastBeatTime = now;
        try {
          this.audioManager?.playHeartBurst?.();
        } catch (e) {}
      }
    }

    // ====================================================================
    // STATE 2: HEARTBEAT PULSATION
    // ====================================================================
    if (this.state === 'pulse') {
      const beatInterval = 1100; // ms between heartbeat pairs
      const timeSinceBeat = (now - this.lastBeatTime);

      // Physical dual-peak heartbeat wave: lub-dub
      let beatScale = 0;
      if (timeSinceBeat < 600) {
        const bt = timeSinceBeat / 600;
        // Peak 1 at 0.15, Peak 2 at 0.45
        beatScale = Math.sin(bt * Math.PI * 3) * Math.exp(-bt * 3.5) * 0.16;
      }

      heartScale = 1.0 + Math.max(0, beatScale);

      // Trigger periodic heartbeat audio and burst waves
      if (timeSinceBeat >= beatInterval) {
        this.lastBeatTime = now;
        this.beatCount++;
        try {
          this.audioManager?.playHeartBurst?.();
        } catch (e) {}

        // Emit radiant pulse ring
        this.emitHeartPulseRing(this.cx, this.cy, this.radius);

        // Auto advance after max beats
        if (this.beatCount >= this.maxAutoBeats) {
          this.triggerHeartFlight();
        }
      }

      // Names rest gently at their positions with subtle breathing
      this.nameNodes.forEach(node => {
        node.x = this.cx + node.targetRelX * this.radius * heartScale;
        node.y = this.cy + node.targetRelY * this.radius * heartScale;
        node.opacity = 1.0;
        node.scale = (node.slotScale || 1.0) * (1.0 + beatScale * 0.35);
      });

      this.centerNode.x = this.cx;
      this.centerNode.y = this.cy + this.radius * 0.08 * heartScale;
      this.centerNode.scale = 1.1 + beatScale * 0.5;
      this.centerNode.opacity = 1.0;
    }

    // ====================================================================
    // STATE 3: HEART FLIGHT TO TEDDY BEAR'S CHEST
    // ====================================================================
    if (this.state === 'flight') {
      const flightProg = Math.min(1.0, stateElapsed / this.flightDuration);
      // Smooth cubic bezier easing
      const t = flightProg;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Arc trajectory: arch upward slightly in the middle of flight
      const startX = this.flightStart.x;
      const startY = this.flightStart.y;
      const endX = this.flightTarget.x;
      const endY = this.flightTarget.y;

      const midX = (startX + endX) * 0.5;
      const midY = Math.min(startY, endY) - 80; // parabolic arc apex

      // Quadratic Bezier interpolation for majestic flight arc
      const inv = 1 - ease;
      heartCenterX = inv * inv * startX + 2 * inv * ease * midX + ease * ease * endX;
      heartCenterY = inv * inv * startY + 2 * inv * ease * midY + ease * ease * endY;

      // Scale down from full size to snug fit in teddy's chest
      const curScale = 1.0 + (this.flightTarget.scale - 1.0) * ease;
      heartScale = curScale;

      // Position nodes scaled with flying heart
      this.nameNodes.forEach(node => {
        node.x = heartCenterX + node.targetRelX * this.radius * heartScale;
        node.y = heartCenterY + node.targetRelY * this.radius * heartScale;
        node.scale = (node.slotScale || 1.0) * heartScale;
        node.opacity = Math.max(0.2, 1.0 - ease * 0.6);
      });

      this.centerNode.x = heartCenterX;
      this.centerNode.y = heartCenterY + this.radius * 0.08 * heartScale;
      this.centerNode.scale = (1.1 + (this.flightTarget.scale - 1.1) * ease);

      // Emit comet stardust trail streaming behind the moving heart
      for (let k = 0; k < 4; k++) {
        this.trailParticles.push({
          x: heartCenterX + (Math.random() - 0.5) * (this.radius * heartScale * 0.8),
          y: heartCenterY + (Math.random() - 0.5) * (this.radius * heartScale * 0.8),
          vx: -(endX - startX) * 0.005 + (Math.random() - 0.5) * 1.5,
          vy: -(endY - startY) * 0.005 + (Math.random() - 0.5) * 1.5,
          size: 2.0 + Math.random() * 3.0,
          life: 1.0,
          decay: 0.025,
          hue: 35 + Math.random() * 300
        });
      }

      // Reached destination: trigger impact explosion into teddy's chest!
      if (flightProg >= 1.0) {
        this.state = 'impact';
        this.stateStartTime = now;
        this.triggerImpactBurst(endX, endY);
      }
    }

    // ====================================================================
    // STATE 4: IMPACT BURST & HANDOFF TO TEDDY
    // ====================================================================
    if (this.state === 'impact') {
      const impactProg = Math.min(1.0, stateElapsed / 600);
      heartAlpha = 1.0 - impactProg;

      if (impactProg >= 1.0) {
        this.stop();
        if (this.onTransferComplete) {
          this.onTransferComplete();
        }
        return;
      }
    }

    // ====================================================================
    // RENDER: GLOWING BACKGROUND NEBULA & HEART SHAPE AURA
    // ====================================================================
    if (heartAlpha > 0.01) {
      this.drawHeartAura(ctx, heartCenterX, heartCenterY, this.radius * heartScale, heartAlpha);
    }

    // ====================================================================
    // RENDER: STARDUST TRAIL PARTICLES
    // ====================================================================
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life * heartAlpha;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 75%)`;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ====================================================================
    // RENDER: HEART BOUNDARY STARDUST PARTICLES & INTERIOR STARDUST
    // ====================================================================
    if (heartAlpha > 0.05) {
      ctx.save();
      this.boundaryParticles.forEach(bp => {
        const bx = heartCenterX + bp.relX * this.radius * heartScale;
        const by = heartCenterY + bp.relY * this.radius * heartScale;
        const twinkle = 0.6 + 0.4 * Math.sin(now * 0.003 * bp.twinkleSpeed + bp.twinklePhase);

        ctx.globalAlpha = twinkle * heartAlpha;
        ctx.fillStyle = `hsl(${bp.hue}, 95%, 75%)`;
        ctx.shadowColor = `hsl(${bp.hue}, 100%, 60%)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bx, by, bp.baseSize * heartScale * twinkle, 0, Math.PI * 2);
        ctx.fill();
      });

      if (this.interiorStardust) {
        this.interiorStardust.forEach(sp => {
          const sx = heartCenterX + sp.relX * this.radius * heartScale;
          const sy = heartCenterY + sp.relY * this.radius * heartScale;
          const twinkle = 0.5 + 0.5 * Math.sin(now * 0.003 * sp.twinkleSpeed + sp.twinklePhase);

          ctx.globalAlpha = twinkle * heartAlpha * 0.75;
          ctx.fillStyle = `hsl(${sp.hue}, 90%, 75%)`;
          ctx.shadowColor = `hsl(${sp.hue}, 100%, 65%)`;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(sx, sy, sp.baseSize * heartScale * twinkle, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    }

    // ====================================================================
    // RENDER: MULTILINGUAL PERSONALIZED NAMES
    // ====================================================================
    if (heartAlpha > 0.05) {
      this.nameNodes.forEach(node => {
        if (node.opacity <= 0.01) return;
        this.renderNameNode(ctx, node, heartAlpha);
      });

      // Render Central Golden Soul Name
      if (this.centerNode.opacity > 0.01) {
        this.renderCenterNode(ctx, this.centerNode, heartAlpha, heartScale);
      }
    }

    // ====================================================================
    // RENDER: IMPACT BURST PARTICLES
    // ====================================================================
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vx *= 0.94;
      bp.vy *= 0.94;
      bp.life -= bp.decay;

      if (bp.life <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = bp.life;
      ctx.fillStyle = bp.color;
      ctx.shadowColor = bp.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, bp.size * bp.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draw glowing celestial nebula aura in the heart shape
   */
  drawHeartAura(ctx, cx, cy, rad, alpha) {
    ctx.save();
    ctx.globalAlpha = 0.35 * alpha;

    // Multi-layer radial glow
    const grad = ctx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad * 1.35);
    grad.addColorStop(0, 'rgba(255, 60, 120, 0.45)');
    grad.addColorStop(0.4, 'rgba(255, 180, 50, 0.25)');
    grad.addColorStop(0.7, 'rgba(160, 80, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Outline path of the heart in glowing rose gold
    ctx.globalAlpha = 0.65 * alpha;
    ctx.strokeStyle = 'rgba(255, 215, 120, 0.7)';
    ctx.lineWidth = Math.max(1.5, 2.5 * (rad / 180));
    ctx.shadowColor = '#ff3b68';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const pt = this.getHeartPoint(t);
      const px = cx + pt.x * rad;
      const py = cy + pt.y * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render an individual language name word directly inside the heart (Pure Typography, NO BOXES)
   */
  renderNameNode(ctx, node, globalAlpha) {
    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.scale(node.scale, node.scale);
    ctx.globalAlpha = node.opacity * globalAlpha;

    // Responsive font size
    const baseFont = Math.max(9.5, Math.min(15.5, this.radius * 0.080 * (node.slotScale || 1.0)));
    const scriptFont = Math.max(7, baseFont * 0.64);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = node.text || '';
    const scriptLabel = node.script || '';

    // Line 1: Subtle celestial script tag floating above the word
    ctx.font = `600 ${scriptFont}px 'Inter', sans-serif`;
    ctx.fillStyle = `hsla(${node.hue}, 90%, 82%, 0.75)`;
    ctx.shadowColor = `hsla(${node.hue}, 100%, 70%, 0.6)`;
    ctx.shadowBlur = 4;
    ctx.fillText(`${node.flag} ${scriptLabel}`, 0, -baseFont * 0.58);

    // Line 2: The native translated user name - Pure Radiant Glowing Typography (NO BOX!)
    ctx.font = `700 ${baseFont}px "Noto Sans Tamil", "Noto Sans Devanagari", "Noto Sans Telugu", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Noto Sans Arabic", "Inter", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = `hsla(${node.hue}, 100%, 65%, 0.95)`;
    ctx.shadowBlur = 10;
    ctx.fillText(text, 0, baseFont * 0.38);

    ctx.restore();
  }

  /**
   * Render central golden glowing soul name
   */
  renderCenterNode(ctx, node, globalAlpha, heartScale) {
    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.scale(node.scale, node.scale);
    ctx.globalAlpha = node.opacity * globalAlpha;

    const mainFontSize = Math.max(16, Math.min(30, this.radius * 0.14 * heartScale));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top small badge
    const badgeFont = Math.max(7.5, mainFontSize * 0.30);
    ctx.font = `700 ${badgeFont}px "Inter", sans-serif`;
    ctx.fillStyle = '#ff7b9c';
    ctx.letterSpacing = '1.5px';
    ctx.shadowColor = '#ff3b68';
    ctx.shadowBlur = 8;
    ctx.fillText('✦ SACRED HEART ✦', 0, -mainFontSize * 0.75);

    // Radiant User Name in Center
    ctx.font = `800 ${mainFontSize}px "Alex Brush", "Cormorant Garamond", "Inter", serif`;
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.fillText(node.text, 0, 0);

    // Subtle heart icon underneath
    const heartIconSize = Math.max(10, mainFontSize * 0.45);
    ctx.font = `${heartIconSize}px sans-serif`;
    ctx.fillStyle = '#ff3b68';
    ctx.shadowColor = '#ff3b68';
    ctx.shadowBlur = 8;
    ctx.fillText('💖', 0, mainFontSize * 0.72);

    ctx.restore();
  }

  /**
   * Render central golden glowing soul name
   */
  renderCenterNode(ctx, node, globalAlpha, heartScale) {
    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.scale(node.scale, node.scale);
    ctx.globalAlpha = node.opacity * globalAlpha;

    const mainFontSize = Math.max(18, Math.min(36, this.radius * 0.18 * heartScale));
    ctx.font = `800 ${mainFontSize}px "Alex Brush", "Cormorant Garamond", "Inter", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top small badge
    ctx.font = `700 ${Math.max(8, mainFontSize * 0.32)}px "Inter", sans-serif`;
    ctx.fillStyle = '#ff7b9c';
    ctx.letterSpacing = '2px';
    ctx.shadowColor = '#ff3b68';
    ctx.shadowBlur = 10;
    ctx.fillText('✦ SACRED HEART ✦', 0, -mainFontSize * 0.9);

    // Radiant User Name in Center
    ctx.font = `800 ${mainFontSize}px "Inter", "Cormorant Garamond", serif`;
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 22;
    ctx.fillText(node.text, 0, 0);

    // Subtle heart icon underneath
    ctx.font = `${Math.max(12, mainFontSize * 0.55)}px sans-serif`;
    ctx.fillStyle = '#ff3b68';
    ctx.shadowColor = '#ff3b68';
    ctx.shadowBlur = 12;
    ctx.fillText('💖', 0, mainFontSize * 0.85);

    ctx.restore();
  }

  /**
   * Helper: round rectangle
   */
  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * Emit radial pulse shockwave ring on each heartbeat
   */
  emitHeartPulseRing(cx, cy, radius) {
    const numRings = 24;
    for (let i = 0; i < numRings; i++) {
      const angle = (i / numRings) * Math.PI * 2;
      const speed = 1.8 + Math.random() * 1.5;
      this.trailParticles.push({
        x: cx + Math.cos(angle) * (radius * 0.8),
        y: cy + Math.sin(angle) * (radius * 0.8),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        life: 1.0,
        decay: 0.03,
        hue: 340 + Math.random() * 40
      });
    }
  }

  /**
   * Final explosion when heart lands in teddy's chest
   */
  triggerImpactBurst(x, y) {
    const numParticles = 65;
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 6.0;
      this.burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.0 + Math.random() * 4.0,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.02,
        color: i % 2 === 0 ? '#ffd700' : '#ff3b68'
      });
    }

    try {
      this.audioManager?.playHeartBurst?.();
      this.audioManager?.playBloomChime?.();
    } catch (e) {}
  }
}

