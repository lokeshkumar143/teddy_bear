/**
 * teddyPhotoUpload.js — The Teddy Takes a Picture
 * ============================================================================
 * - Cinematic overlay: "Can I keep a picture of the person who created my world?"
 * - File input triggered by clicking a camera icon (NOT a standard button)
 * - Preview shows uploaded photo in a rounded floating frame
 * - Explicit consent checkbox: "I allow this photo to be processed"
 * - Replace option to change photo
 * - Skip option ("Maybe later") that gracefully skips without uploading
 * - Fires onPhotoReady(file, dataUrl) or onPhotoSkipped()
 * ============================================================================
 */

class TeddyPhotoUpload {
  constructor() {
    this.onPhotoReady = null;
    this.onPhotoSkipped = null;

    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.consentGiven = false;

    this.overlayEl = null;
    this.fileInput = null;

    this._buildOverlay();
  }

  // ─── DOM Construction ─────────────────────────────────────────────────────

  _buildOverlay() {
    this.overlayEl = document.getElementById('scenePhotoUpload');
    if (!this.overlayEl) return;

    // Build inner content dynamically
    this.overlayEl.innerHTML = `
      <div class="photo-upload-inner">
        <p class="narration-small photo-ask-text">
          ✦ Can I keep a picture of the person who created my world? ✦
        </p>

        <div class="photo-preview-area" id="photoPreviewArea">
          <div class="camera-icon-wrapper" id="cameraIconWrapper" title="Choose a photo">
            <div class="camera-icon">📷</div>
            <div class="camera-label">tap to add your photo</div>
          </div>
          <div class="photo-preview-frame hidden" id="photoPreviewFrame">
            <img id="photoPreviewImg" src="" alt="Your photo" />
            <button class="btn-replace-photo" id="btnReplacePhoto" title="Change photo">↺ change</button>
          </div>
        </div>

        <div class="photo-consent-row hidden" id="photoConsentRow">
          <label class="consent-label">
            <input type="checkbox" id="consentCheck" class="consent-check" />
            <span class="consent-text">I allow this photo to be used for my gift image</span>
          </label>
        </div>

        <div class="photo-actions" id="photoActions">
          <button class="btn-universe-primary hidden" id="btnUsePhoto">Create My Gift ✦</button>
          <button class="btn-universe-secondary" id="btnSkipPhoto">Maybe later →</button>
        </div>

        <p class="photo-privacy-note">Your photo never leaves your device. No upload, no servers.</p>
      </div>
    `;

    // Hidden native file input
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.style.display = 'none';
    this.fileInput.id = 'hiddenPhotoInput';
    document.body.appendChild(this.fileInput);

    this._bindEvents();
  }

  _bindEvents() {
    if (!this.overlayEl) return;

    // Camera icon → open file picker
    const cameraWrapper = document.getElementById('cameraIconWrapper');
    if (cameraWrapper) {
      cameraWrapper.addEventListener('click', () => this.fileInput && this.fileInput.click());
    }

    // Replace photo button
    const replaceBtn = document.getElementById('btnReplacePhoto');
    if (replaceBtn) {
      replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.fileInput) this.fileInput.click();
      });
    }

    // File input change
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this._handleFile(file);
      });
    }

    // Consent checkbox
    const consentCheck = document.getElementById('consentCheck');
    if (consentCheck) {
      consentCheck.addEventListener('change', () => {
        this.consentGiven = consentCheck.checked;
        this._updateUseButton();
      });
    }

    // Use photo
    const useBtn = document.getElementById('btnUsePhoto');
    if (useBtn) {
      useBtn.addEventListener('click', () => this._handleUsePhoto());
    }

    // Skip
    const skipBtn = document.getElementById('btnSkipPhoto');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this._handleSkip());
    }
  }

  // ─── File Handling ────────────────────────────────────────────────────────

  _handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedDataUrl = e.target.result;
      this._showPreview(this.selectedDataUrl);
    };
    reader.readAsDataURL(file);
  }

  _showPreview(dataUrl) {
    const cameraWrapper = document.getElementById('cameraIconWrapper');
    const previewFrame = document.getElementById('photoPreviewFrame');
    const previewImg = document.getElementById('photoPreviewImg');
    const consentRow = document.getElementById('photoConsentRow');
    const useBtn = document.getElementById('btnUsePhoto');

    if (cameraWrapper) cameraWrapper.classList.add('hidden');
    if (previewFrame) previewFrame.classList.remove('hidden');
    if (previewImg) previewImg.src = dataUrl;
    if (consentRow) consentRow.classList.remove('hidden');
    if (useBtn) useBtn.classList.remove('hidden');

    // Reset consent on new photo
    this.consentGiven = false;
    const consentCheck = document.getElementById('consentCheck');
    if (consentCheck) consentCheck.checked = false;
    this._updateUseButton();
  }

  _updateUseButton() {
    const useBtn = document.getElementById('btnUsePhoto');
    if (!useBtn) return;
    if (this.selectedDataUrl && this.consentGiven) {
      useBtn.disabled = false;
      useBtn.style.opacity = '1';
      useBtn.style.cursor = 'pointer';
    } else {
      useBtn.disabled = true;
      useBtn.style.opacity = '0.45';
      useBtn.style.cursor = 'not-allowed';
    }
  }

  _handleUsePhoto() {
    if (!this.selectedFile || !this.selectedDataUrl || !this.consentGiven) return;
    this.hide();
    if (this.onPhotoReady) {
      this.onPhotoReady(this.selectedFile, this.selectedDataUrl);
    }
  }

  _handleSkip() {
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.hide();
    if (this.onPhotoSkipped) {
      this.onPhotoSkipped();
    }
  }

  // ─── Visibility ───────────────────────────────────────────────────────────

  show() {
    if (this.overlayEl) {
      this.overlayEl.classList.remove('hidden');
      this.overlayEl.style.pointerEvents = 'all';
    }
  }

  hide() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
      this.overlayEl.style.pointerEvents = 'none';
    }
  }

  destroy() {
    this.hide();
    if (this.fileInput && this.fileInput.parentNode) {
      this.fileInput.parentNode.removeChild(this.fileInput);
    }
    if (this.overlayEl) {
      this.overlayEl.innerHTML = '';
    }
  }
}

window.TeddyPhotoUpload = TeddyPhotoUpload;

