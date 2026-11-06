/**
 * main.js
 * ============================================================================
 * Application Bootstrap, Welcome Sequencer, and 3D Gift Scene Orchestration.
 * ============================================================================
 */

(function () {
  "use strict";

  let giftScene = null;
  let photoFrame = null;
  let giftInteractions = null;

  // DOM Elements
  const welcomeScreen = document.getElementById("welcomeScreen");
  const typewriterText = document.getElementById("typewriterText");
  const nameInputSection = document.getElementById("nameInputSection");
  const visitorNameInput = document.getElementById("visitorNameInput");
  const btnCreateTeddy = document.getElementById("btnCreateTeddy");
  const inputError = document.getElementById("inputError");
  const miniBearCanvas = document.getElementById("miniBearCanvas");
  const experienceScreen = document.getElementById("experienceScreen");
  const threeCanvas = document.getElementById("threeCanvas");
  const giftSceneContainer = document.getElementById("giftSceneContainer");
  const btnUploadMemory = document.getElementById("btnUploadMemory");

  let miniRafId = null;

  function init() {
    // 1. Start Mini Bear Animation on Welcome Screen
    if (miniBearCanvas) {
      animateMiniBear();
    }

    // 2. Start Welcome Typewriter Sequence
    startWelcomeTypewriter();

    // 3. Name Input Event Listeners
    if (visitorNameInput) {
      visitorNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitName();
      });
    }

    if (btnCreateTeddy) {
      btnCreateTeddy.addEventListener("click", submitName);
    }
  }

  /**
   * Mini Kawaii Bear Preview on Welcome Card
   */
  function animateMiniBear() {
    const ctx = miniBearCanvas.getContext("2d");
    const W = miniBearCanvas.width;
    const H = miniBearCanvas.height;

    function renderFrame(time) {
      const t = time / 1000.0;
      ctx.clearRect(0, 0, W, H);

      const blink = (Math.sin(t * 2.5) > 0.94);
      const pulse = 1.0 + 0.16 * Math.sin(t * 5.0);
      const eyeChar = blink ? "⌒" : "●";

      const miniLines = [
        "   ₍ᐢ. ̫ .ᐢ₎   ",
        "  (  (,,)  )  ",
        `   / ${eyeChar}  ${eyeChar} \\   `,
        "  (  .꒳.  )  ",
        "   /╭───╮\\   ",
        "  ( │ ♥ │ )  ",
        "   \\╰───╯/   ",
        "   (,,) (,,)  "
      ];

      ctx.font = '16px "Fira Code", Menlo, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const startY = 32;
      const lineH = 22;

      miniLines.forEach((line, idx) => {
        const y = startY + idx * lineH;
        if (line.includes("♥")) {
          ctx.fillStyle = "rgb(255, 45, 95)";
          ctx.shadowColor = "rgba(255, 45, 95, 0.9)";
          ctx.shadowBlur = 14 * pulse;
        } else if (line.includes(eyeChar)) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = "rgb(255, 125, 155)";
          ctx.shadowColor = "rgba(255, 110, 140, 0.4)";
          ctx.shadowBlur = 6;
        }
        ctx.fillText(line, W / 2, y);
      });
      ctx.shadowBlur = 0;

      miniRafId = requestAnimationFrame(renderFrame);
    }

    miniRafId = requestAnimationFrame(renderFrame);
  }

  async function startWelcomeTypewriter() {
    await delay(350);
    await typeWriter("Hey! Someone special just arrived...", typewriterText, 40);
    await delay(1100);

    typewriterText.textContent = "";
    await typeWriter("Before I create something special, may I know your name?", typewriterText, 35);

    if (nameInputSection) {
      nameInputSection.classList.remove("hidden");
      nameInputSection.classList.add("fade-in");
      if (visitorNameInput) {
        visitorNameInput.focus();
      }
    }
  }

  function submitName() {
    const rawVal = visitorNameInput.value.trim();
    if (!rawVal) {
      showError("Please enter your name to begin ✨");
      return;
    }
    if (rawVal.length < 2) {
      showError("Please enter at least 2 letters ✨");
      return;
    }

    if (inputError) inputError.classList.add("hidden");
    const visitorName = rawVal;

    // Launch 3D Experience
    launch3DExperience(visitorName);
  }

  function showError(msg) {
    if (!inputError || !visitorNameInput) return;
    inputError.textContent = msg;
    inputError.classList.remove("hidden");
    visitorNameInput.classList.add("shake-error");
    setTimeout(() => visitorNameInput.classList.remove("shake-error"), 500);
  }

  async function launch3DExperience(name) {
    // 1. Cancel mini bear loop
    if (miniRafId) {
      cancelAnimationFrame(miniRafId);
      miniRafId = null;
    }

    // 2. Fade out Welcome Screen
    welcomeScreen.classList.add("fade-out");
    await delay(500);
    welcomeScreen.classList.add("hidden");

    // 3. Show Experience Screen
    experienceScreen.classList.remove("hidden");
    experienceScreen.classList.add("fade-in");

    // 4. Initialize Three.js 3D Gift Scene
    if (!giftScene) {
      giftScene = new TeddyGiftScene(threeCanvas, name);
      photoFrame = new TeddyPhotoFrame(giftSceneContainer);
      giftInteractions = new TeddyGiftInteractions(giftScene, photoFrame, name);

      if (btnUploadMemory) {
        btnUploadMemory.addEventListener("click", () => {
          photoFrame.triggerUploadDialog();
        });
      }
    } else {
      giftScene.setName(name);
      giftInteractions.name = name;
    }

    // 5. Trigger Cinematic Gift Box & Greeting Sequence
    giftInteractions.startGreetingSequence();
  }

  function typeWriter(text, element, speed = 35) {
    if (!element) return Promise.resolve();
    return new Promise((resolve) => {
      element.textContent = "";
      let idx = 0;
      const cursorSpan = document.createElement("span");
      cursorSpan.className = "typewriter-cursor";
      element.appendChild(cursorSpan);

      const interval = setInterval(() => {
        if (idx < text.length) {
          element.insertBefore(document.createTextNode(text.charAt(idx)), cursorSpan);
          idx++;
        } else {
          clearInterval(interval);
          cursorSpan.remove();
          resolve();
        }
      }, speed);
    });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Boot on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
