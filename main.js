/**
 * main.js
 * ============================================================================
 * Application Bootstrap, High-Performance 60 FPS Master Loop, Resize &
 * Visibility Management, Subsystem Integration.
 * ============================================================================
 */

(function () {
  "use strict";

  let controller = null;

  function init() {
    const canvas = document.getElementById("universeCanvas") || document.getElementById("artCanvas");
    if (!canvas) {
      console.error("Master canvas element not found!");
      return;
    }

    // Initialize Master Universe Controller
    controller = new UniverseController({ canvas: canvas });
    controller.start();

    // Export globally for debugging / interactive inspection
    window.universeController = controller;
  }

  // Boot on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
