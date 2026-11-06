/**
 * main.js
 * ============================================================================
 * Application Bootstrap, High-Performance 60 FPS Master Loop, Clamped DPR Resize,
 * Visibility Management, and Unified Subsystem Integration.
 * ============================================================================
 */

(function () {
  "use strict";

  // Subsystem instances
  let canvas = null;
  let particleWorld = null;
  let introScene = null;
  let invitation = null;
  let personalization = null;
  let geometry = null;
  let parts = null;
  let lighting = null;
  let animation = null;
  let renderer = null;
  let controller = null;

  // Render loop tracking
  let lastTimestamp = 0;
  let isPageVisible = true;
  let rafId = null;

  function init() {
    canvas = document.getElementById("artCanvas");
    if (!canvas) {
      console.error("Master artCanvas element not found!");
      return;
    }

    // 1. Initialize Particle Universe & Audio Synthesizer
    particleWorld = new TeddyParticleWorld(canvas);

    // 2. Initialize Geometry, Shading & ASCII Character Ramps
    geometry = new TeddyGeometry();
    parts = new TeddyCharacterParts();
    lighting = new TeddyLighting();
    animation = new TeddyCharacterAnimation();

    // 3. Initialize Full-Screen ASCII Renderer
    renderer = new TeddyAsciiRenderer(canvas, geometry, parts, lighting, animation);

    // 4. Initialize Interactive Personalization & File Picker
    personalization = new TeddyPersonalization();

    // 5. Initialize Intro & Invitation Scenes
    introScene = new TeddyIntroScene(canvas, particleWorld, () => {
      if (controller) controller.startInvitation();
    });

    invitation = new TeddyInvitation(canvas, () => {
      if (controller) controller.startNameEntry();
    });

    // 6. Initialize Master Experience Controller
    controller = new TeddyExperienceController({
      canvas: canvas,
      particleWorld: particleWorld,
      introScene: introScene,
      invitation: invitation,
      personalization: personalization,
      renderer: renderer,
      animation: animation,
      sound: particleWorld.sound
    });

    // 7. Window Resize & Page Visibility Listeners
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", () => {
      setTimeout(onResize, 100);
    }, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Initial resize calculation
    onResize();

    // 8. Boot Experience (Starts Scene 1: Cosmic Intro)
    controller.start();

    // 9. Start Master Animation Loop
    lastTimestamp = performance.now();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function onResize() {
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (particleWorld) particleWorld.resize();
    if (renderer) renderer.setupCanvas(w, h);
  }

  function onVisibilityChange() {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      lastTimestamp = performance.now();
      if (!rafId) {
        rafId = requestAnimationFrame(loop);
      }
    } else {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }

  /**
   * Master 60 FPS Animation & Render Loop
   */
  function loop(now) {
    if (!isPageVisible) return;

    const dt = Math.min(0.08, (now - lastTimestamp) / 1000.0);
    lastTimestamp = now;

    if (controller) {
      controller.update(dt);
      controller.render();
    }

    rafId = requestAnimationFrame(loop);
  }

  // Boot on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
