/**
 * teddyPhotoFrame.js
 * ============================================================================
 * Floating Polaroid Photo Frame & Heart-Link System.
 * Adheres strictly to Section 5:
 * - Checks if an uploaded or generated photo is available.
 * - If no photo exists, gracefully skips and hides the frame.
 * - If available (or when user uploads a photo via the UI), displays a chic,
 *   floating Polaroid frame beside the teddy with drifting heart particles.
 * ============================================================================
 */

class TeddyPhotoFrame {
  constructor(containerElement, onPhotoAvailable) {
    this.container = containerElement;
    this.onPhotoAvailable = onPhotoAvailable;

    this.frameElement = null;
    this.photoElement = null;
    this.captionElement = null;
    this.fileInputElement = null;

    this.currentPhotoSrc = null;
    this.isVisible = false;

    this.initDOM();
    this.checkExistingPhoto();
  }

  initDOM() {
    // Hidden file input to allow visitor to upload their memory anytime
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    fileInput.id = "userPhotoInput";
    document.body.appendChild(fileInput);
    this.fileInputElement = fileInput;

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.setPhoto(event.target.result);
          try {
            localStorage.setItem("visitorTeddyPhoto", event.target.result);
          } catch (err) {}
        };
        reader.readAsDataURL(file);
      }
    });

    // Polaroid DOM Frame
    const frame = document.createElement("div");
    frame.className = "polaroid-frame-wrapper gift-hidden";
    frame.id = "polaroidFrame";

    frame.innerHTML = `
      <div class="polaroid-pin"></div>
      <img class="polaroid-photo" id="polaroidImg" alt="Personalized Memory" src="" />
      <p class="polaroid-caption" id="polaroidCap">With My Little Friend ❤️</p>
    `;

    frame.addEventListener("click", () => {
      // Clicking the photo allows uploading a new memory
      this.fileInputElement.click();
    });

    if (this.container) {
      this.container.appendChild(frame);
    }
    this.frameElement = frame;
    this.photoElement = frame.querySelector("#polaroidImg");
    this.captionElement = frame.querySelector("#polaroidCap");
  }

  checkExistingPhoto() {
    try {
      const savedPhoto = localStorage.getItem("visitorTeddyPhoto");
      if (savedPhoto && savedPhoto.startsWith("data:image")) {
        this.setPhoto(savedPhoto);
        return;
      }
    } catch (e) {}

    // Gracefully skip and remain hidden if no photo is available
    this.hide();
  }

  setPhoto(srcUrl, caption = "With My Little Friend ❤️") {
    if (!srcUrl) {
      this.hide();
      return;
    }
    this.currentPhotoSrc = srcUrl;
    if (this.photoElement) {
      this.photoElement.src = srcUrl;
    }
    if (this.captionElement) {
      this.captionElement.textContent = caption;
    }
    this.show();

    if (this.onPhotoAvailable) {
      this.onPhotoAvailable(srcUrl);
    }
  }

  show() {
    if (!this.currentPhotoSrc || !this.frameElement) return;
    this.frameElement.classList.remove("gift-hidden");
    this.isVisible = true;
  }

  hide() {
    if (this.frameElement) {
      this.frameElement.classList.add("gift-hidden");
    }
    this.isVisible = false;
  }

  triggerUploadDialog() {
    if (this.fileInputElement) {
      this.fileInputElement.click();
    }
  }
}

window.TeddyPhotoFrame = TeddyPhotoFrame;

