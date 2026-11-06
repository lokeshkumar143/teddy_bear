/**
 * main.js
 * ============================================================================
 * Application Bootstrap, High-Performance Animation Loop, Resize & Visibility
 * Management, and Subsystem Orchestration.
 * ============================================================================
 */

(function () {
  "use strict";

  // Subsystem instances
  let animation = null;
  let renderer = null;
  let experience = null;

  // Render loop tracking
  let lastTimestamp = 0;
  let isPageVisible = true;
  let rafId = null;

  // Mini bear preview on welcome screen
  let miniCanvas = null;

  function init() {
    const mainCanvas = document.getElementById("artCanvas");
    miniCanvas = document.getElementById("miniBearCanvas");

    if (!mainCanvas) {
      console.error("Art canvas element not found!");
      return;
    }

    // 1. Initialize Modular Subsystems
    const geometry = new TeddyGeometry();
    const parts = new TeddyCharacterParts();
    const lighting = new TeddyLighting();
    animation = new TeddyCharacterAnimation();
    renderer = new TeddyAsciiRenderer(mainCanvas, geometry, parts, lighting, animation);

    // 2. Initialize Experience Controller
    experience = new TeddyExperience(renderer, animation);

    // 3. Window & Visibility Event Handlers
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 4. Initial layout calculation
    onResize();

    // 5. Start Master Animation Loop
    lastTimestamp = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function onResize() {
    if (!renderer) return;
    renderer.setupCanvas();
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
   * Master 60 FPS Animation Loop
   */
  function loop(now) {
    if (!isPageVisible) return;

    const dt = Math.min(0.1, (now - lastTimestamp) / 1000.0);
    lastTimestamp = now;

    // Always update physics & timers
    animation.update(dt);

    // Branch behavior according to experience state
    const currentStep = experience.currentStep;

    if (currentStep === "WELCOME") {
      // Render cute mini preview bear in the welcome card
      if (miniCanvas) {
        renderer.renderMiniBear(miniCanvas, animation.time);
      }
    } else if (currentStep === "BLOOMING") {
      // Advance bloom progress (e.g. over 9 seconds)
      const bloomRate = 1.0 / animation.bloomDuration;
      animation.bloomProgress = Math.min(1.0, animation.bloomProgress + dt * bloomRate);

      // Smoothstep easing for blooming characters
      const u = animation.bloomProgress;
      const easedBloom = u * u * (3.0 - 2.0 * u);

      // Render full canvas frame
      renderer.render(easedBloom, false);

      // Check if bloom finished
      if (animation.bloomProgress >= 1.0) {
        experience.triggerGreeting();
      }
    } else if (currentStep === "GREETING" || currentStep === "PORTAL") {
      // Fully bloomed interactive state (waving, breathing, heartbeat, mouse reaction)
      renderer.render(1.0, true);
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
