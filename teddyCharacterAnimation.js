/**
 * teddyCharacterAnimation.js
 * ============================================================================
 * Cinematic Character & Sequence Animation Controller for the 3D Teddy Experience.
 * Manages:
 * 1. Intro Sequence (Particle Gathering -> Box Materialize -> Lid Open -> Teddy Rise & Wave)
 * 2. Continuous Organic Idle (Breathing, Blinking, Ear Twitches, Gentle Sway)
 * 3. 3D Mouse Look-At Tracking with Natural Slerp Damping
 * 4. Interactive Arm Waving Gesture
 * 5. Interactive Warm Plush Hugging Animation (Reaching towards user)
 * 6. Portal Transition Physics
 * ============================================================================
 */

class TeddyCharacterAnimation {
  constructor(teddyChar, giftBox) {
    this.teddy = teddyChar;
    this.box = giftBox;

    this.time = 0.0;

    // Sequence Stages:
    // "GATHER" -> "BOX_OPEN" -> "RISE" -> "INTRO_WAVE" -> "IDLE" -> "HUG" -> "PORTAL"
    this.stage = "GATHER";
    this.stageTime = 0.0;

    // Durations in seconds
    this.durations = {
      gather: 1.8,
      boxOpen: 2.2,
      rise: 2.5,
      introWave: 2.8
    };

    // Breathing & Idle Physics
    this.breathFactor = 0.0;
    this.bounce = 0.0;

    // Blinking
    this.blinkTimer = 2.0;
    this.isBlinking = false;
    this.blinkProgress = 0.0;

    // Ear Twitching
    this.earTimer = 3.2;
    this.earTwitch = 0.0;

    // Mouse Tracking (Normalized [-1, 1])
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false };
    this.lookOffset = { x: 0, y: 0 };
    this.headTilt = 0.0;
    this.shyReaction = 0.0;

    // Hugging Action
    this.isHugging = false;
    this.hugTimer = 0.0;
    this.hugDuration = 3.6;

    // Waving Action
    this.isWaving = false;
    this.waveTimer = 0.0;
    this.waveDuration = 3.2;

    // Callbacks
    this.onSequenceComplete = null;
    this.onHugTriggered = null;

    // Initial transforms
    this.box.setMaterializeProgress(0.01);
    this.box.setOpenProgress(0.0);
    this.teddy.group.position.set(0, -1.8, 0); // Inside box
    this.teddy.group.scale.set(0.01, 0.01, 0.01);
  }

  startSequence() {
    this.stage = "GATHER";
    this.stageTime = 0.0;
  }

  triggerWave() {
    this.isWaving = true;
    this.waveTimer = 0.0;
  }

  triggerHug() {
    this.isHugging = true;
    this.hugTimer = 0.0;
    this.shyReaction = 1.0;
  }

  triggerBounce() {
    this.bounce = 0.8;
    this.shyReaction = Math.min(1.0, this.shyReaction + 0.4);
  }

  setMouse(nx, ny) {
    this.mouse.targetX = Math.max(-1, Math.min(1, nx));
    this.mouse.targetY = Math.max(-1, Math.min(1, ny));
    const dist = Math.hypot(nx, ny);
    this.mouse.isHovering = dist < 0.6;
  }

  update(dt) {
    this.time += dt;
    this.stageTime += dt;

    // Smooth Mouse Look-At Interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * (dt * 5.0);
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * (dt * 5.0);

    // Blushing decay
    this.shyReaction = Math.max(0.0, this.shyReaction - dt * 0.35);
    if (this.teddy.blushLeftMesh && this.teddy.blushRightMesh) {
      const blushOpacity = 0.45 + this.shyReaction * 0.45;
      this.teddy.materials.blush.opacity = blushOpacity;
    }

    // Sequence Progression
    switch (this.stage) {
      case "GATHER": {
        // Box materializes from particles
        const p = Math.min(1.0, this.stageTime / this.durations.gather);
        const ease = p * p * (3.0 - 2.0 * p);
        this.box.setMaterializeProgress(ease);
        this.box.group.rotation.y = (1.0 - ease) * 0.5;

        if (p >= 1.0) {
          this.stage = "BOX_OPEN";
          this.stageTime = 0.0;
        }
        break;
      }

      case "BOX_OPEN": {
        // Ribbon unties and lid swings open
        const p = Math.min(1.0, this.stageTime / this.durations.boxOpen);
        this.box.setOpenProgress(p);

        // Teddy starts scaling up inside the box
        if (p > 0.4) {
          const tp = (p - 0.4) / 0.6;
          const tScale = 0.2 + tp * 0.8;
          this.teddy.group.scale.set(tScale, tScale, tScale);
        }

        if (p >= 1.0) {
          this.stage = "RISE";
          this.stageTime = 0.0;
        }
        break;
      }

      case "RISE": {
        // Teddy rises triumphantly out of the box with plush bounce
        const p = Math.min(1.0, this.stageTime / this.durations.rise);
        const ease = p * p * (3.0 - 2.0 * p);

        // Elevate from inside box (-1.8) to seated height (+1.1)
        const targetY = -1.8 + ease * 2.9;
        this.teddy.group.position.y = targetY;
        this.teddy.group.scale.set(1.0, 1.0, 1.0);

        // Slight anticipatory forward tilt then settle
        this.teddy.group.rotation.x = Math.sin(p * Math.PI) * 0.2;

        if (p >= 1.0) {
          this.stage = "INTRO_WAVE";
          this.stageTime = 0.0;
          this.triggerWave();
        }
        break;
      }

      case "INTRO_WAVE": {
        // Teddy looks around cheerfully, tilts head, and waves
        const p = Math.min(1.0, this.stageTime / this.durations.introWave);
        this.updateWaving(dt);
        this.updateIdleOrganic(dt);

        if (p >= 1.0) {
          this.stage = "IDLE";
          this.stageTime = 0.0;
          if (this.onSequenceComplete) {
            this.onSequenceComplete();
          }
        }
        break;
      }

      case "IDLE":
      default: {
        this.updateIdleOrganic(dt);

        if (this.isHugging) {
          this.updateHugging(dt);
        } else if (this.isWaving) {
          this.updateWaving(dt);
        } else {
          this.updateDefaultArms(dt);
        }
        break;
      }
    }
  }

  /**
   * Continuous Breathing, Blinking, Ear Twitches, and Head Look-At
   */
  updateIdleOrganic(dt) {
    // 1. Torso Breathing
    this.breathFactor = Math.sin(this.time * 2.6) * 0.025;
    if (this.teddy.bodyGroup) {
      this.teddy.bodyGroup.scale.set(
        1.0 + this.breathFactor * 0.6,
        1.0 + this.breathFactor,
        1.0 + this.breathFactor * 0.6
      );
    }

    // 2. Natural Blinking
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      this.blinkTimer = 2.8 + Math.random() * 3.2;
    }
    if (this.isBlinking) {
      this.blinkProgress += dt * 8.0;
      const blinkScale = Math.sin(this.blinkProgress * Math.PI);
      if (this.teddy.eyelidLeftNode && this.teddy.eyelidRightNode) {
        this.teddy.eyelidLeftNode.scale.z = Math.max(0.001, blinkScale * 1.05);
        this.teddy.eyelidRightNode.scale.z = Math.max(0.001, blinkScale * 1.05);
      }
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0.0;
        if (this.teddy.eyelidLeftNode && this.teddy.eyelidRightNode) {
          this.teddy.eyelidLeftNode.scale.z = 0.001;
          this.teddy.eyelidRightNode.scale.z = 0.001;
        }
      }
    }

    // 3. Playful Ear Twitches
    this.earTimer -= dt;
    if (this.earTimer <= 0) {
      this.earTwitch = Math.sin(this.time * 16.0) * 0.12;
      if (this.earTimer < -0.35) {
        this.earTwitch = 0;
        this.earTimer = 3.0 + Math.random() * 3.5;
      }
    }
    if (this.teddy.earLeftNode && this.teddy.earRightNode) {
      this.teddy.earLeftNode.rotation.z = 0.25 + this.earTwitch;
      this.teddy.earRightNode.rotation.z = -0.25 - this.earTwitch;
    }

    // 4. 3D Head Rotation & Mouse Look-At
    if (this.teddy.headNode) {
      const targetYaw = this.mouse.x * 0.42;
      const targetPitch = -this.mouse.y * 0.28;
      const targetRoll = -this.mouse.x * 0.12 + Math.sin(this.time * 1.2) * 0.04;

      this.teddy.headNode.rotation.y += (targetYaw - this.teddy.headNode.rotation.y) * 0.1;
      this.teddy.headNode.rotation.x += (targetPitch - this.teddy.headNode.rotation.x) * 0.1;
      this.teddy.headNode.rotation.z += (targetRoll - this.teddy.headNode.rotation.z) * 0.1;
    }

    // 5. Gentle Body Squash-and-Stretch Bounce
    if (this.bounce > 0.001) {
      this.bounce *= Math.pow(0.02, dt);
      const bounceS = Math.sin(this.time * 20.0) * this.bounce * 0.15;
      this.teddy.group.scale.set(1.0 + bounceS, 1.0 - bounceS, 1.0 + bounceS);
    } else {
      this.bounce = 0;
      this.teddy.group.scale.set(1, 1, 1);
    }
  }

  /**
   * Arm Waving Animation
   */
  updateWaving(dt) {
    this.waveTimer += dt;
    const waveAngle = Math.sin(this.time * 8.5) * 0.45;

    // Right Arm raised high, waving paw side-to-side
    if (this.teddy.armRightNode) {
      this.teddy.armRightNode.position.set(1.35, 1.45, 0.4);
      this.teddy.armRightNode.rotation.set(-0.25, 0.2, -1.95 + waveAngle);
    }

    // Left Arm resting gently
    if (this.teddy.armLeftNode) {
      this.teddy.armLeftNode.position.set(-1.42, 0.65, 0.1);
      this.teddy.armLeftNode.rotation.set(0.35, 0.15, 0.45);
    }

    if (this.waveTimer >= this.waveDuration && this.stage === "IDLE") {
      this.isWaving = false;
    }
  }

  /**
   * Warm Plush Hugging Animation (Reaching forward towards camera/user)
   */
  updateHugging(dt) {
    this.hugTimer += dt;
    const prog = Math.min(1.0, this.hugTimer / this.hugDuration);

    // Ease-in and ease-out curve for the hug
    const hugWeight = Math.sin(prog * Math.PI);

    // Both Arms open wide then reach forward towards camera
    if (this.teddy.armLeftNode && this.teddy.armRightNode) {
      // Left arm reaches forward-center
      this.teddy.armLeftNode.position.set(-1.15 - 0.2 * hugWeight, 0.85 + 0.3 * hugWeight, 0.3 + 0.9 * hugWeight);
      this.teddy.armLeftNode.rotation.set(0.85 * hugWeight, -0.65 * hugWeight, 0.95 * (1.0 - hugWeight) + 0.35 * hugWeight);

      // Right arm reaches forward-center
      this.teddy.armRightNode.position.set(1.15 + 0.2 * hugWeight, 0.85 + 0.3 * hugWeight, 0.3 + 0.9 * hugWeight);
      this.teddy.armRightNode.rotation.set(0.85 * hugWeight, 0.65 * hugWeight, -0.95 * (1.0 - hugWeight) - 0.35 * hugWeight);
    }

    // Teddy leans forward affectionately
    this.teddy.group.position.z = hugWeight * 0.95;
    this.teddy.group.rotation.x = -hugWeight * 0.15;

    if (this.hugTimer >= this.hugDuration) {
      this.isHugging = false;
      this.hugTimer = 0.0;
      this.teddy.group.position.z = 0;
      this.teddy.group.rotation.x = 0;
    }
  }

  /**
   * Default resting arm posture holding sides of chest
   */
  updateDefaultArms(dt) {
    if (this.teddy.armLeftNode && this.teddy.armRightNode) {
      // Smooth lerp back to resting pose
      this.teddy.armLeftNode.position.set(-1.42, 0.65, 0.1);
      this.teddy.armLeftNode.rotation.set(0.35, 0.15, 0.45);

      this.teddy.armRightNode.position.set(1.42, 0.65, 0.1);
      this.teddy.armRightNode.rotation.set(0.35, -0.15, -0.45);
    }
  }
}

window.TeddyCharacterAnimation = TeddyCharacterAnimation;
