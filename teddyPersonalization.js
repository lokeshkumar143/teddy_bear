/**
 * teddyPersonalization.js
 * ============================================================================
 * Scene Four: Name Entry & Personalization
 * Scene Five: Photo Upload (Optional) or Skip
 *
 * Handles:
 * - Animated typewriter prompts
 * - Real-time name validation (min 1 char, max 20 chars)
 * - Optional photo upload with client-side image reading & Polaroid preview
 * - Unforced skip option
 * ============================================================================
 */

class TeddyPersonalization {
  constructor(options = {}) {
    this.onNameSubmitted = options.onNameSubmitted || null;
    this.onPhotoSubmitted = options.onPhotoSubmitted || null;
    this.onPhotoSkipped = options.onPhotoSkipped || null;

    this.visitorName = "";
    this.userPhoto = null; // Image object or data URL
    this.userPhotoUrl = null;

    // Scene 4 Elements
    this.nameSection = document.getElementById("sceneNameEntry");
    this.nameTitle = document.getElementById("namePromptTitle");
    this.nameSubtitle = document.getElementById("namePromptSubtitle");
    this.nameInput = document.getElementById("personNameInput");
    this.btnNameContinue = document.getElementById("btnNameContinue");
    this.nameError = document.getElementById("nameInputError");

    // Scene 5 Elements
    this.photoSection = document.getElementById("scenePhotoUpload");
    this.photoTitle = document.getElementById("photoPromptTitle");
    this.photoSubtitle = document.getElementById("photoPromptSubtitle");
    this.btnUploadPhoto = document.getElementById("btnUploadPhoto");
    this.fileInput = document.getElementById("photoFileInput");
    this.btnSkipPhoto = document.getElementById("btnSkipPhoto");
    this.polaroidPreview = document.getElementById("polaroidPreview");
    this.polaroidImg = document.getElementById("polaroidImg");
    this.polaroidCaption = document.getElementById("polaroidCaption");
    this.btnConfirmPhoto = document.getElementById("btnConfirmPhoto");
    this.btnChangePhoto = document.getElementById("btnChangePhoto");

    this.bindEvents();
  }

  bindEvents() {
    // Name Continue button
    if (this.btnNameContinue) {
      this.btnNameContinue.addEventListener("click", () => this.submitName());
    }

    // Name Enter key
    if (this.nameInput) {
      this.nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.submitName();
      });
      this.nameInput.addEventListener("input", () => {
        if (this.nameError) this.nameError.classList.add("hidden");
      });
    }

    // Photo Upload Trigger
    if (this.btnUploadPhoto && this.fileInput) {
      this.btnUploadPhoto.addEventListener("click", () => {
        this.fileInput.click();
      });
    }

    // Photo File Changed
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => this.handleFileSelected(e));
    }

    // Skip Photo
    if (this.btnSkipPhoto) {
      this.btnSkipPhoto.addEventListener("click", () => this.skipPhoto());
    }

    // Confirm Photo
    if (this.btnConfirmPhoto) {
      this.btnConfirmPhoto.addEventListener("click", () => this.confirmPhoto());
    }

    // Change Photo
    if (this.btnChangePhoto && this.fileInput) {
      this.btnChangePhoto.addEventListener("click", () => {
        this.fileInput.click();
      });
    }
  }

  /**
   * Start Scene 4: Name Entry
   */
  async startNameEntry() {
    if (this.nameSection) {
      this.nameSection.classList.remove("hidden");
      this.nameSection.classList.add("fade-in");
    }

    if (this.nameTitle) {
      await this.typeWriter("First, what should I call you?", this.nameTitle, 35);
    }
    await this.delay(200);

    if (this.nameSubtitle) {
      this.nameSubtitle.textContent = "Your name will be embroidered right onto your teddy's glowing heart. ❤️";
      this.nameSubtitle.classList.add("fade-in");
    }

    if (this.nameInput) {
      this.nameInput.focus();
    }
  }

  submitName() {
    if (!this.nameInput) return;
    const raw = this.nameInput.value.trim();

    if (!raw) {
      this.showNameError("Please enter your name so your teddy knows you! ✨");
      return;
    }
    if (raw.length > 20) {
      this.showNameError("Please keep it under 20 characters ✨");
      return;
    }

    this.visitorName = raw;
    if (this.nameError) this.nameError.classList.add("hidden");

    // Fade out Scene 4
    if (this.nameSection) {
      this.nameSection.classList.add("fade-out");
      setTimeout(() => this.nameSection.classList.add("hidden"), 400);
    }

    if (this.onNameSubmitted) {
      this.onNameSubmitted(this.visitorName);
    }
  }

  showNameError(msg) {
    if (this.nameError) {
      this.nameError.textContent = msg;
      this.nameError.classList.remove("hidden");
    }
    if (this.nameInput) {
      this.nameInput.classList.add("shake-error");
      setTimeout(() => this.nameInput.classList.remove("shake-error"), 500);
    }
  }

  /**
   * Start Scene 5: Photo Upload or Skip
   */
  async startPhotoUpload() {
    if (this.photoSection) {
      this.photoSection.classList.remove("hidden");
      this.photoSection.classList.add("fade-in");
    }

    if (this.photoTitle) {
      await this.typeWriter("Lovely! Now I need one more thing...", this.photoTitle, 35);
    }
    await this.delay(200);

    if (this.photoSubtitle) {
      this.photoSubtitle.textContent = "Would you like to add a photo so the teddy can hold a special memory with you?";
      this.photoSubtitle.classList.add("fade-in");
    }
  }

  handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      this.userPhotoUrl = loadEvent.target.result;
      const img = new Image();
      img.onload = () => {
        this.userPhoto = img;
        this.showPolaroidPreview();
      };
      img.src = this.userPhotoUrl;
    };
    reader.readAsDataURL(file);
  }

  showPolaroidPreview() {
    if (this.polaroidPreview && this.polaroidImg) {
      this.polaroidImg.src = this.userPhotoUrl;
      if (this.polaroidCaption) {
        this.polaroidCaption.textContent = `Best Friends Forever ❤️ ${this.visitorName}`;
      }
      this.polaroidPreview.classList.remove("hidden");
      this.polaroidPreview.classList.add("fade-in");

      // Hide upload / skip buttons while previewing
      const choiceGroup = document.getElementById("photoChoiceGroup");
      if (choiceGroup) choiceGroup.classList.add("hidden");
    }
  }

  confirmPhoto() {
    if (this.photoSection) {
      this.photoSection.classList.add("fade-out");
      setTimeout(() => this.photoSection.classList.add("hidden"), 400);
    }

    if (this.onPhotoSubmitted) {
      this.onPhotoSubmitted(this.userPhoto, this.userPhotoUrl);
    }
  }

  skipPhoto() {
    this.userPhoto = null;
    this.userPhotoUrl = null;

    if (this.photoSection) {
      this.photoSection.classList.add("fade-out");
      setTimeout(() => this.photoSection.classList.add("hidden"), 400);
    }

    if (this.onPhotoSkipped) {
      this.onPhotoSkipped();
    }
  }

  typeWriter(text, element, speed = 35) {
    if (!element) return Promise.resolve();
    return new Promise((resolve) => {
      element.textContent = "";
      let idx = 0;
      const cursor = document.createElement("span");
      cursor.className = "typewriter-cursor";
      element.appendChild(cursor);

      const interval = setInterval(() => {
        if (idx < text.length) {
          element.insertBefore(document.createTextNode(text.charAt(idx)), cursor);
          idx++;
        } else {
          clearInterval(interval);
          cursor.remove();
          resolve();
        }
      }, speed);
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

window.TeddyPersonalization = TeddyPersonalization;

