/**
 * universeController.js — Master Experience State Machine
 * ============================================================================
 * States:
 *   UNIVERSE_INTRO      → auto ~8s narration
 *   CONSTELLATION       → user connects 6+ stars
 *   INVITATION          → click LET'S CREATE SOMETHING
 *   NAME_ENTRY          → user types name, presses Enter
 *   NAME_ANIMATION      → auto ~3s name flies to stars
 *   TEDDY_BIRTH         → auto ~6s planet cracks, teddy blooms
 *   TEDDY_INTERACTION   → idle animations loop
 *   PHOTO_UPLOAD_OR_SKIP → user decision
 *   PHOTO_GENERATION    → auto ~2s canvas compositing
 *   FINAL_REVEAL        → cinematic reveal + action buttons
 *   PORTFOLIO           → portfolio screen
 *
 * Manages a single <canvas id="universeCanvas"> for all rendering.
 * Manages DOM overlay sections for text/input/buttons.
 * Has a master RAF loop calling update(dt) and render() on active systems.
 * Handles window resize, visibility changes, touch events.
 * ============================================================================
 */

class UniverseController {
  constructor(options = {}) {
    this.canvas = options.canvas || document.getElementById('universeCanvas') || document.getElementById('artCanvas');
    this.ctx = this.canvas.getContext('2d');

    // ── State ─────────────────────────────────────────────────────────────
    this.STATE = {
      UNIVERSE_INTRO: 'UNIVERSE_INTRO',
      CONSTELLATION: 'CONSTELLATION',
      INVITATION: 'INVITATION',
      NAME_ENTRY: 'NAME_ENTRY',
      NAME_ANIMATION: 'NAME_ANIMATION',
      TEDDY_BIRTH: 'TEDDY_BIRTH',
      TEDDY_INTERACTION: 'TEDDY_INTERACTION',
      PHOTO_UPLOAD_OR_SKIP: 'PHOTO_UPLOAD_OR_SKIP',
      PHOTO_GENERATION: 'PHOTO_GENERATION',
      FINAL_REVEAL: 'FINAL_REVEAL',
      PORTFOLIO: 'PORTFOLIO'
    };

    this.currentState = this.STATE.UNIVERSE_INTRO;
    this.visitorName = '';
    this.giftDataUrl = null;
    this.photoDataUrl = null;
    this.photoFile = null;

    // ── Timing ────────────────────────────────────────────────────────────
    this.lastTimestamp = 0;
    this.time = 0;
    this.rafId = null;
    this.stateTime = 0;   // time elapsed in current state

    // ── Narration ────────────────────────────────────────────────────────
    this.narrationLines = [
      { text: 'Somewhere between the stars…', delay: 0, duration: 2.5 },
      { text: 'a little universe is waking up.', delay: 2.5, duration: 2.5 },
      { text: 'It has been waiting for someone special.', delay: 5.0, duration: 3.0 }
    ];
    this.currentNarrationIndex = -1;
    this.narrationAlpha = 0;
    this.narrationTargetAlpha = 0;
    this.narrationText = '';

    // ── Subsystems (created in start()) ───────────────────────────────────
    this.universeScene = null;
    this.particles = null;
    this.constellation = null;
    this.nameConstellation = null;
    this.teddyBirth = null;
    this.teddyFinalReveal = null;
    this.photoUpload = null;
    this.aiService = null;

    // ── DOM References ────────────────────────────────────────────────────
    this.domNarration = document.getElementById('narrationText');
    this.domSceneIntro = document.getElementById('sceneIntro');
    this.domSceneConst = document.getElementById('sceneConstellation');
    this.domConstellationMsg = document.getElementById('constellationMsg');
    this.domBtnCreate = document.getElementById('btnCreateSomething');
    this.domSceneNameEntry = document.getElementById('sceneNameEntry');
    this.domScenePhoto = document.getElementById('scenePhotoUpload');
    this.domSceneFinal = document.getElementById('sceneFinalReveal');
    this.domTopBar = document.getElementById('topBar');
    this.domBtnSound = document.getElementById('btnSound');
    this.domPortfolio = document.getElementById('portfolioScreen');
    this.domBtnBackTeddy = document.getElementById('btnBackToTeddy');

    // Skip button (we add it ourselves if not present)
    this._ensureSkipButton();

    this._bindGlobalEvents();
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  start() {
    this._resizeCanvas();
    this._initSubsystems();
    this._transitionTo(this.STATE.UNIVERSE_INTRO);
    this._startLoop();
  }

  _initSubsystems() {
    const canvas = this.canvas;

    // 1. Particle system (must come first)
    this.particles = new UniverseParticles(canvas);

    // 2. Universe scene background
    this.universeScene = new UniverseScene(canvas);

    // 3. Constellation interaction
    this.constellation = new ConstellationInteraction(canvas, this.particles);
    this.constellation.onConnectionMade = (count) => {
      this._onConstellationConnection(count);
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
      const note = notes[(count - 1) % notes.length];
      this._playCelestialTone(note, 0.45, 'sine', 0.08);
    };
    this.constellation.onReady = () => {
      this._playCelestialTone(1046.5, 0.8, 'sine', 0.1);
      this._onConstellationReady();
    };
    this.constellation.onIntensityChange = (val) => {
      if (this.universeScene) this.universeScene.setIntensity(val);
    };

    // 4. Name constellation
    this.nameConstellation = new NameConstellation(canvas, this.particles);
    this.nameConstellation.onNameReady = (name) => this._onNameReady(name);

    // 5. Teddy birth animation
    this.teddyBirth = new TeddyBirthAnimation(canvas, this.particles, 'Someone Special');
    this.teddyBirth.onBirthComplete = () => this._onBirthComplete();

    // 6. Final reveal
    this.teddyFinalReveal = new TeddyFinalReveal(canvas, this.particles);
    this.teddyFinalReveal.onReplay = () => this._handleReplay();
    this.teddyFinalReveal.onPortfolio = () => this._transitionTo(this.STATE.PORTFOLIO);

    // 7. Photo upload
    this.photoUpload = new TeddyPhotoUpload();
    this.photoUpload.onPhotoReady = (file, dataUrl) => this._onPhotoReady(file, dataUrl);
    this.photoUpload.onPhotoSkipped = () => this._onPhotoSkipped();

    // 8. AI service (canvas compositor)
    this.aiService = new TeddyAIService();
    this.aiService.onGiftReady = (dataUrl) => this._onGiftReady(dataUrl);

    // DOM button wiring
    if (this.domBtnCreate) {
      this.domBtnCreate.addEventListener('click', () => {
        if (this.currentState === this.STATE.INVITATION ||
          this.currentState === this.STATE.CONSTELLATION) {
          this._transitionTo(this.STATE.NAME_ENTRY);
        }
      });
    }

    if (this.domBtnBackTeddy) {
      this.domBtnBackTeddy.addEventListener('click', () => {
        this._hidePortfolio();
      });
    }

    this._initAudio();

    if (this.domBtnSound) {
      this.domBtnSound.addEventListener('click', () => {
        this._toggleSound();
      });
    }
  }

  _initAudio() {
    this.soundMuted = true;
    this.audioCtx = null;
  }

  _toggleSound() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.soundMuted = !this.soundMuted;
    if (this.domBtnSound) {
      this.domBtnSound.textContent = this.soundMuted ? '🔇' : '🔊';
    }
    if (!this.soundMuted) {
      this._playCelestialTone(523.25, 0.4, 'sine', 0.08);
    }
  }

  _playCelestialTone(freq = 440, duration = 0.5, type = 'sine', gainVal = 0.08) {
    if (this.soundMuted || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) { }
  }

  _ensureSkipButton() {
    // Add a skip intro button if one doesn't exist in HTML
    if (!document.getElementById('btnSkipIntro')) {
      const skipBtn = document.createElement('button');
      skipBtn.id = 'btnSkipIntro';
      skipBtn.className = 'btn-skip-intro';
      skipBtn.textContent = 'skip intro →';
      skipBtn.style.cssText = `
        position:fixed; bottom:30px; right:30px; z-index:100;
        background:transparent; border:1px solid rgba(200,180,255,0.3);
        color:rgba(200,180,255,0.6); font-family:'Fira Code',monospace;
        font-size:12px; padding:8px 16px; border-radius:20px; cursor:pointer;
        transition:all 0.3s;
      `;
      skipBtn.addEventListener('mouseenter', () => {
        skipBtn.style.borderColor = 'rgba(200,180,255,0.8)';
        skipBtn.style.color = 'rgba(220,210,255,1)';
      });
      skipBtn.addEventListener('mouseleave', () => {
        skipBtn.style.borderColor = 'rgba(200,180,255,0.3)';
        skipBtn.style.color = 'rgba(200,180,255,0.6)';
      });
      skipBtn.addEventListener('click', () => this._skipIntro());
      document.body.appendChild(skipBtn);
      this.domBtnSkipIntro = skipBtn;
    }
  }

  _skipIntro() {
    if (this.currentState === this.STATE.UNIVERSE_INTRO) {
      this.stateTime = 999;
      this._transitionTo(this.STATE.CONSTELLATION);
    }
  }

  // ─── State Machine ────────────────────────────────────────────────────────

  _transitionTo(state) {
    const prev = this.currentState;
    this.currentState = state;
    this.stateTime = 0;

    // Hide all overlays by default
    this._hideAllOverlays();

    switch (state) {

      case this.STATE.UNIVERSE_INTRO:
        this._showOverlay(this.domSceneIntro);
        this._scheduleNarration();
        break;

      case this.STATE.CONSTELLATION:
        this._showOverlay(this.domSceneIntro);
        this._setNarration('Connect the stars to build your universe.', true);
        this.constellation.show();
        if (this.domBtnSkipIntro) this.domBtnSkipIntro.style.display = 'none';
        break;

      case this.STATE.INVITATION:
        this._hideAllOverlays();
        this._showOverlay(this.domSceneConst);
        if (this.domConstellationMsg) {
          this.domConstellationMsg.textContent = 'Every little world needs someone special.';
        }
        if (this.domBtnCreate) {
          this.domBtnCreate.classList.remove('hidden');
        }
        break;

      case this.STATE.NAME_ENTRY:
        this._hideAllOverlays();
        this.constellation.hide();
        this.nameConstellation.show();
        if (this.domBtnSkipIntro) this.domBtnSkipIntro.style.display = 'none';
        break;

      case this.STATE.NAME_ANIMATION:
        this._hideAllOverlays();
        // nameConstellation handles its own canvas rendering
        break;

      case this.STATE.TEDDY_BIRTH:
        this._hideAllOverlays();
        this.constellation.hide();
        // Start the birth animation
        if (this.teddyBirth) {
          this.teddyBirth.start(this.visitorName);
        }
        break;

      case this.STATE.TEDDY_INTERACTION:
        this._hideAllOverlays();
        // Teddy keeps rendering via birth animation (it's in complete phase)
        // Show a brief hint
        this._showInteractionHint();
        setTimeout(() => {
          this._transitionTo(this.STATE.PHOTO_UPLOAD_OR_SKIP);
        }, 3500);
        break;

      case this.STATE.PHOTO_UPLOAD_OR_SKIP:
        this._hideAllOverlays();
        if (this.photoUpload) {
          this.photoUpload.show();
        }
        break;

      case this.STATE.PHOTO_GENERATION:
        this._hideAllOverlays();
        this._showGeneratingOverlay();
        if (this.aiService && this.photoDataUrl) {
          this.aiService.compose(this.photoDataUrl, this.canvas, this.visitorName);
        } else if (this.aiService) {
          this.aiService.composeNoPhoto(this.canvas, this.visitorName);
        }
        break;

      case this.STATE.FINAL_REVEAL:
        this._hideAllOverlays();
        if (this.teddyFinalReveal) {
          this.teddyFinalReveal.start(this.visitorName, this.giftDataUrl);
        }
        break;

      case this.STATE.PORTFOLIO:
        this._showPortfolio();
        break;
    }
  }

  // ─── State Callbacks ──────────────────────────────────────────────────────

  _onConstellationConnection(count) {
    // Update any UI counter
    if (count >= 3 && this.universeScene) {
      this.universeScene.setIntensity(1.2);
    }
  }

  _onConstellationReady() {
    this._transitionTo(this.STATE.INVITATION);
  }

  _onNameReady(name) {
    this.visitorName = name;
    this._playCelestialTone(659.25, 0.6, 'sine', 0.08);
    this._transitionTo(this.STATE.NAME_ANIMATION);
    // After name animation (~3.5s), begin teddy birth
    setTimeout(() => {
      this._transitionTo(this.STATE.TEDDY_BIRTH);
    }, 3600);
  }

  _onBirthComplete() {
    this._playCelestialTone(880.00, 1.2, 'sine', 0.1);
    this._transitionTo(this.STATE.TEDDY_INTERACTION);
  }

  _onPhotoReady(file, dataUrl) {
    this.photoFile = file;
    this.photoDataUrl = dataUrl;
    this._transitionTo(this.STATE.PHOTO_GENERATION);
  }

  _onPhotoSkipped() {
    this.photoFile = null;
    this.photoDataUrl = null;
    // Compose gift without photo
    if (this.aiService) {
      this.aiService.composeNoPhoto(this.canvas, this.visitorName);
      this._transitionTo(this.STATE.PHOTO_GENERATION);
    } else {
      this._transitionTo(this.STATE.FINAL_REVEAL);
    }
  }

  _onGiftReady(dataUrl) {
    this.giftDataUrl = dataUrl;
    this._transitionTo(this.STATE.FINAL_REVEAL);
  }

  _handleReplay() {
    // Reset everything and restart
    this.visitorName = '';
    this.giftDataUrl = null;
    this.photoDataUrl = null;
    this.photoFile = null;
    this.currentNarrationIndex = -1;
    this.narrationAlpha = 0;

    // Reset subsystems
    if (this.teddyBirth) {
      this.teddyBirth.active = false;
      this.teddyBirth.phase = 'idle';
      this.teddyBirth.bloomProgress = 0;
    }
    if (this.constellation) {
      this.constellation.connections = [];
      this.constellation.isAlive = false;
      this.constellation.readyFired = false;
      this.constellation.showMessage = false;
      this.constellation.messageAlpha = 0;
      this.constellation.miniPlanet = null;
      for (const s of this.constellation.stars) {
        s.connected = false;
        s.hovered = false;
      }
    }
    if (this.nameConstellation) {
      this.nameConstellation.phase = 'idle';
      this.nameConstellation.letterStars = [];
      this.nameConstellation.name = '';
      this.nameConstellation.welcomeAlpha = 0;
    }
    if (this.teddyFinalReveal) {
      this.teddyFinalReveal.hide();
    }
    if (this.universeScene) {
      this.universeScene.setIntensity(1.0);
    }
    if (this.domBtnSkipIntro) {
      this.domBtnSkipIntro.style.display = '';
    }

    this._transitionTo(this.STATE.UNIVERSE_INTRO);
  }

  // ─── Overlay Helpers ──────────────────────────────────────────────────────

  _hideAllOverlays() {
    const overlays = [
      this.domSceneIntro,
      this.domSceneConst,
      this.domSceneNameEntry,
      this.domScenePhoto,
      this.domSceneFinal
    ];
    for (const el of overlays) {
      if (el) {
        el.classList.add('hidden');
        el.style.pointerEvents = 'none';
      }
    }
    // Hide generating overlay if present
    const genOverlay = document.getElementById('generatingOverlay');
    if (genOverlay) genOverlay.style.display = 'none';
  }

  _showOverlay(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.style.pointerEvents = 'all';
  }

  _showGeneratingOverlay() {
    let genOverlay = document.getElementById('generatingOverlay');
    if (!genOverlay) {
      genOverlay = document.createElement('div');
      genOverlay.id = 'generatingOverlay';
      genOverlay.style.cssText = `
        position:fixed; inset:0; display:flex; flex-direction:column;
        align-items:center; justify-content:center; pointer-events:none; z-index:50;
      `;
      genOverlay.innerHTML = `
        <p style="font-family:'Fira Code',monospace; color:rgba(220,200,255,0.9);
                  font-size:clamp(14px,2vw,22px); text-shadow:0 0 20px rgba(180,150,255,0.8);
                  animation: cosmicPulse 1.5s ease-in-out infinite;">
          ✦ Wrapping your gift… ✦
        </p>
      `;
      document.body.appendChild(genOverlay);
    }
    genOverlay.style.display = 'flex';
  }

  _showInteractionHint() {
    let hint = document.getElementById('interactionHint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'interactionHint';
      hint.style.cssText = `
        position:fixed; bottom:60px; left:50%; transform:translateX(-50%);
        font-family:'Plus Jakarta Sans',sans-serif; font-style:italic;
        color:rgba(220,200,255,0.8); font-size:clamp(13px,1.8vw,20px);
        text-shadow:0 0 15px rgba(180,150,255,0.7);
        pointer-events:none; z-index:50; animation:fadeIn 0.8s ease both;
        text-align:center;
      `;
      document.body.appendChild(hint);
    }
    hint.textContent = `✦ Say hello, ${this.visitorName}! ✦`;
    hint.style.display = 'block';
    setTimeout(() => { if (hint) hint.style.display = 'none'; }, 3200);
  }

  // ─── Narration System ─────────────────────────────────────────────────────

  _scheduleNarration() {
    this.currentNarrationIndex = -1;
    // We drive narration from update() using stateTime
  }

  _setNarration(text, persistent = false) {
    this.narrationText = text;
    this.narrationTargetAlpha = 1;
    if (this.domNarration) {
      this.domNarration.textContent = text;
    }
  }

  _updateNarration(dt) {
    if (this.currentState !== this.STATE.UNIVERSE_INTRO) return;

    // Drive narration lines by stateTime
    for (let i = 0; i < this.narrationLines.length; i++) {
      const line = this.narrationLines[i];
      if (this.stateTime >= line.delay && this.stateTime < line.delay + line.duration + 0.5) {
        if (this.currentNarrationIndex !== i) {
          this.currentNarrationIndex = i;
          this.narrationText = line.text;
          this.narrationTargetAlpha = 1;
          if (this.domNarration) this.domNarration.textContent = line.text;
        }
        // Fade in
        const lineT = this.stateTime - line.delay;
        if (lineT < 0.4) {
          this.narrationTargetAlpha = lineT / 0.4;
        } else if (lineT > line.duration - 0.4) {
          this.narrationTargetAlpha = (line.duration - lineT) / 0.4;
        } else {
          this.narrationTargetAlpha = 1;
        }
      }
    }

    // Smooth alpha
    this.narrationAlpha += (this.narrationTargetAlpha - this.narrationAlpha) * Math.min(1, dt * 4);
    if (this.domNarration) this.domNarration.style.opacity = this.narrationAlpha.toString();

    // Auto advance to constellation after all narration lines complete
    const lastLine = this.narrationLines[this.narrationLines.length - 1];
    if (this.stateTime >= lastLine.delay + lastLine.duration + 0.8) {
      this._transitionTo(this.STATE.CONSTELLATION);
    }
  }

  // ─── Portfolio ────────────────────────────────────────────────────────────

  _showPortfolio() {
    if (this.domPortfolio) {
      this.domPortfolio.classList.remove('hidden');
      this.domPortfolio.scrollTop = 0;
    }
  }

  _hidePortfolio() {
    if (this.domPortfolio) this.domPortfolio.classList.add('hidden');
    this._transitionTo(this.STATE.FINAL_REVEAL);
  }

  // ─── Master RAF Loop ──────────────────────────────────────────────────────

  _startLoop() {
    const loop = (timestamp) => {
      const dt = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;
      this.time += dt;
      this.stateTime += dt;

      this._update(dt);
      this._render();

      this.rafId = requestAnimationFrame(loop);
    };
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(loop);
  }

  _stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  _update(dt) {
    const state = this.currentState;

    // Always update universe scene background
    if (this.universeScene && state !== this.STATE.PORTFOLIO) {
      this.universeScene.update(dt);
    }

    // Always update particles
    if (this.particles && state !== this.STATE.PORTFOLIO) {
      this.particles.update(dt);
    }

    switch (state) {
      case this.STATE.UNIVERSE_INTRO:
        this._updateNarration(dt);
        break;

      case this.STATE.CONSTELLATION:
      case this.STATE.INVITATION:
        if (this.constellation) this.constellation.update(dt);
        break;

      case this.STATE.NAME_ENTRY:
        if (this.nameConstellation) this.nameConstellation.update(dt);
        break;

      case this.STATE.NAME_ANIMATION:
        if (this.nameConstellation) this.nameConstellation.update(dt);
        break;

      case this.STATE.TEDDY_BIRTH:
        if (this.teddyBirth) {
          this.teddyBirth.update(dt);
          // Update the anim time for the ASCII renderer
          if (this.teddyBirth.anim) {
            this.teddyBirth.anim.time = this.time;
          }
        }
        break;

      case this.STATE.TEDDY_INTERACTION:
        if (this.teddyBirth) {
          this.teddyBirth.update(dt);
          if (this.teddyBirth.anim) this.teddyBirth.anim.time = this.time;
        }
        break;

      case this.STATE.PHOTO_UPLOAD_OR_SKIP:
        if (this.teddyBirth) {
          this.teddyBirth.update(dt);
          if (this.teddyBirth.anim) this.teddyBirth.anim.time = this.time;
        }
        break;

      case this.STATE.PHOTO_GENERATION:
        // Brief wait state
        break;

      case this.STATE.FINAL_REVEAL:
        if (this.teddyBirth) {
          this.teddyBirth.update(dt);
          if (this.teddyBirth.anim) this.teddyBirth.anim.time = this.time;
        }
        if (this.teddyFinalReveal) this.teddyFinalReveal.update(dt);
        break;

      case this.STATE.PORTFOLIO:
        // No canvas updates needed
        break;
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  _render() {
    const state = this.currentState;
    const ctx = this.ctx;
    const W = this.canvas.width / (window.devicePixelRatio || 1);
    const H = this.canvas.height / (window.devicePixelRatio || 1);

    if (state === this.STATE.PORTFOLIO) return;

    // Clear canvas (universe scene will draw its own background)
    // If teddyBirth is in bloom/complete phase, it draws its own background via ASCII renderer
    const inTeddyPhase = (
      state === this.STATE.TEDDY_BIRTH ||
      state === this.STATE.TEDDY_INTERACTION ||
      state === this.STATE.PHOTO_UPLOAD_OR_SKIP ||
      state === this.STATE.FINAL_REVEAL
    );

    if (inTeddyPhase && this.teddyBirth && (this.teddyBirth.phase === 'bloom' || this.teddyBirth.phase === 'complete')) {
      // ASCII renderer draws the full background + stars + teddy
      this.teddyBirth.render();
    } else {
      // Universe scene draws the background
      if (this.universeScene) this.universeScene.render();

      // Overlay constellation / name animations
      if (state === this.STATE.CONSTELLATION || state === this.STATE.INVITATION) {
        if (this.constellation) this.constellation.render();
      }

      if (state === this.STATE.NAME_ENTRY || state === this.STATE.NAME_ANIMATION) {
        if (this.nameConstellation) this.nameConstellation.render();
      }

      if (state === this.STATE.TEDDY_BIRTH &&
        this.teddyBirth &&
        (this.teddyBirth.phase === 'approach' || this.teddyBirth.phase === 'crack' || this.teddyBirth.phase === 'burst')) {
        this.teddyBirth.render();
      }
    }

    // Particles always on top
    if (this.particles) this.particles.render();

    // Final reveal canvas overlay (portal ring, polaroid)
    if (state === this.STATE.FINAL_REVEAL && this.teddyFinalReveal) {
      this.teddyFinalReveal.render();
    }
  }

  // ─── Resize & Visibility ──────────────────────────────────────────────────

  _resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;

    this.canvas.width = Math.floor(W * dpr);
    this.canvas.height = Math.floor(H * dpr);
    this.canvas.style.width = W + 'px';
    this.canvas.style.height = H + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Notify subsystems
    if (this.universeScene) this.universeScene.resize(W, H);
    if (this.particles) this.particles.resize(W, H);
    if (this.constellation) this.constellation.resize(W, H);
    if (this.nameConstellation) this.nameConstellation.resize(W, H);
    if (this.teddyBirth) {
      this.teddyBirth.resize(W, H);
    }
    if (this.teddyFinalReveal) this.teddyFinalReveal.resize(W, H);
  }

  _bindGlobalEvents() {
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._resizeCanvas(), 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._stopLoop();
      } else {
        this.lastTimestamp = performance.now();
        if (!this.rafId) this._startLoop();
      }
    });
  }
}

window.UniverseController = UniverseController;

