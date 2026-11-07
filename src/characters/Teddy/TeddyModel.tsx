import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTeddyStore } from '@/app/store';

interface TeddyModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  interactive?: boolean;
}

export const TeddyModel: React.FC<TeddyModelProps> = ({
  scale = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  interactive = true,
}) => {
  const { 
    teddyAnimation, 
    outfit, 
    accessory, 
    triggerTeddyReaction 
  } = useTeddyStore();

  // Joint References for Articulated Animation
  const rootRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftLidRef = useRef<THREE.Group>(null);
  const rightLidRef = useRef<THREE.Group>(null);

  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Group>(null);

  // Blinking State
  const blinkState = useRef({
    isBlinking: false,
    blinkProgress: 0,
    nextBlinkTime: 2.0,
  });

  // Cursor Tracking Lerp Vector
  const lookTarget = useRef(new THREE.Vector2(0, 0));

  // Plush Fur & Material Palette
  const materials = useMemo(() => {
    // Warm plush fur shader material
    const furColor = new THREE.Color('#c27b38');
    const muzzleColor = new THREE.Color('#f4dfc8');
    const innerEarColor = new THREE.Color('#e8a598');
    const noseColor = new THREE.Color('#2b1708');
    const heartColor = new THREE.Color('#ff2a6d');

    return {
      fur: new THREE.MeshStandardMaterial({
        color: furColor,
        roughness: 0.88,
        metalness: 0.04,
      }),
      muzzle: new THREE.MeshStandardMaterial({
        color: muzzleColor,
        roughness: 0.82,
        metalness: 0.02,
      }),
      innerEar: new THREE.MeshStandardMaterial({
        color: innerEarColor,
        roughness: 0.85,
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: '#0d0d12',
        roughness: 0.12,
        metalness: 0.1,
      }),
      glint: new THREE.MeshBasicMaterial({
        color: '#ffffff',
      }),
      nose: new THREE.MeshStandardMaterial({
        color: noseColor,
        roughness: 0.6,
      }),
      heart: new THREE.MeshStandardMaterial({
        color: heartColor,
        emissive: heartColor,
        emissiveIntensity: 0.55,
        roughness: 0.35,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#ffd700',
        metalness: 0.85,
        roughness: 0.25,
      }),
      clothesHoodie: new THREE.MeshStandardMaterial({
        color: '#ff4d6d',
        roughness: 0.75,
      }),
      clothesPajamas: new THREE.MeshStandardMaterial({
        color: '#64b5f6',
        roughness: 0.8,
      }),
      clothesFormal: new THREE.MeshStandardMaterial({
        color: '#1a1a24',
        roughness: 0.5,
      }),
      clothesWinter: new THREE.MeshStandardMaterial({
        color: '#e76f51',
        roughness: 0.85,
      }),
      clothesFantasy: new THREE.MeshStandardMaterial({
        color: '#7b2cbf',
        roughness: 0.6,
      }),
    };
  }, []);

  // Frame Animation Loop (Handles all 15 Animation States + Procedural Kinematics)
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();

    // 1. Cursor Tracking (Smooth Lerp)
    if (interactive) {
      lookTarget.current.x = THREE.MathUtils.lerp(lookTarget.current.x, pointer.x, 0.08);
      lookTarget.current.y = THREE.MathUtils.lerp(lookTarget.current.y, pointer.y, 0.08);
    }

    // 2. Procedural Eye Blinking
    if (t > blinkState.current.nextBlinkTime) {
      blinkState.current.isBlinking = true;
      blinkState.current.blinkProgress += 0.18;
      if (blinkState.current.blinkProgress >= 1.0) {
        blinkState.current.isBlinking = false;
        blinkState.current.blinkProgress = 0;
        // Schedule next blink in 2.5 to 5.5 seconds
        blinkState.current.nextBlinkTime = t + 2.5 + Math.random() * 3.0;
      }
    }
    const lidScaleY = blinkState.current.isBlinking
      ? Math.sin(blinkState.current.blinkProgress * Math.PI)
      : (teddyAnimation === 'sleep' ? 1.0 : 0.0);

    if (leftLidRef.current && rightLidRef.current) {
      leftLidRef.current.scale.y = 1.0 - lidScaleY * 0.95;
      rightLidRef.current.scale.y = 1.0 - lidScaleY * 0.95;
    }

    // 3. Heart Accessory Glow & Breathing Pulse
    if (heartRef.current) {
      const heartPulse = 1.0 + Math.sin(t * 3.5) * 0.08;
      heartRef.current.scale.set(heartPulse, heartPulse, heartPulse);
    }

    // 4. Base Breathing Oscillation (Spine expansion)
    const breath = Math.sin(t * 2.2);
    if (spineRef.current) {
      spineRef.current.scale.y = 1.0 + breath * 0.025;
      spineRef.current.scale.x = 1.0 - breath * 0.015;
      spineRef.current.scale.z = 1.0 + breath * 0.02;
    }

    // 5. Head Tracking & Gentle Tilt
    if (headRef.current) {
      if (teddyAnimation === 'sleep') {
        headRef.current.rotation.x = 0.35;
        headRef.current.rotation.y = 0.15;
        headRef.current.rotation.z = -0.2;
      } else {
        const targetRotY = lookTarget.current.x * 0.45;
        const targetRotX = -lookTarget.current.y * 0.35 + breath * 0.03;
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotX, 0.1);
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.04;
      }
    }

    // 6. Kinematic State Machine for Teddy Animations
    if (!leftArmRef.current || !rightArmRef.current || !leftLegRef.current || !rightLegRef.current || !rootRef.current) {
      return;
    }

    switch (teddyAnimation) {
      case 'wave': // Left hand waving
        leftArmRef.current.rotation.z = 1.8 + Math.sin(t * 8.0) * 0.35;
        leftArmRef.current.rotation.x = 0.4 + Math.cos(t * 8.0) * 0.15;
        rightArmRef.current.rotation.z = -0.3 + breath * 0.05;
        rightArmRef.current.rotation.x = 0.2;
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
        rootRef.current.position.y = 0;
        break;

      case 'bothWave': // Both hands waving joyfully
        leftArmRef.current.rotation.z = 1.9 + Math.sin(t * 7.5) * 0.3;
        rightArmRef.current.rotation.z = -1.9 - Math.sin(t * 7.5 + 0.5) * 0.3;
        leftArmRef.current.rotation.x = 0.3;
        rightArmRef.current.rotation.x = 0.3;
        rootRef.current.position.y = Math.abs(Math.sin(t * 4.0)) * 0.15;
        break;

      case 'jump': // Excited jumping
        const jumpY = Math.abs(Math.sin(t * 5.0)) * 0.65;
        rootRef.current.position.y = jumpY;
        leftArmRef.current.rotation.z = 1.6 + Math.sin(t * 10) * 0.4;
        rightArmRef.current.rotation.z = -1.6 - Math.sin(t * 10) * 0.4;
        leftLegRef.current.rotation.x = jumpY > 0.2 ? -0.4 : 0;
        rightLegRef.current.rotation.x = jumpY > 0.2 ? 0.4 : 0;
        break;

      case 'dance': // Happy dance
        const sway = Math.sin(t * 4.5);
        rootRef.current.rotation.y = sway * 0.35;
        rootRef.current.position.y = Math.abs(Math.sin(t * 4.5)) * 0.25;
        leftArmRef.current.rotation.z = 1.2 + Math.sin(t * 9) * 0.5;
        rightArmRef.current.rotation.z = -1.2 - Math.cos(t * 9) * 0.5;
        leftLegRef.current.rotation.x = Math.sin(t * 4.5) * 0.4;
        rightLegRef.current.rotation.x = -Math.sin(t * 4.5) * 0.4;
        break;

      case 'hug': // Hugging heart tightly
        leftArmRef.current.rotation.z = 0.8;
        leftArmRef.current.rotation.x = 1.1 + Math.sin(t * 3) * 0.12;
        leftArmRef.current.rotation.y = 0.5;
        rightArmRef.current.rotation.z = -0.8;
        rightArmRef.current.rotation.x = 1.1 + Math.sin(t * 3) * 0.12;
        rightArmRef.current.rotation.y = -0.5;
        rootRef.current.position.y = 0;
        break;

      case 'sit': // Sitting down adorably
        rootRef.current.position.y = -0.45;
        leftLegRef.current.rotation.x = -1.45;
        rightLegRef.current.rotation.x = -1.45;
        leftLegRef.current.position.z = 0.25;
        rightLegRef.current.position.z = 0.25;
        leftArmRef.current.rotation.z = 0.4;
        rightArmRef.current.rotation.z = -0.4;
        leftArmRef.current.rotation.x = 0.6;
        rightArmRef.current.rotation.x = 0.6;
        break;

      case 'sleep': // Sleeping
        rootRef.current.position.y = -0.6;
        rootRef.current.rotation.z = 1.45; // lying down sideways
        leftArmRef.current.rotation.z = 0.5;
        rightArmRef.current.rotation.z = -0.3;
        leftLegRef.current.rotation.x = -0.3;
        rightLegRef.current.rotation.x = 0.2;
        break;

      case 'shy': // Shy cute blush
        headRef.current.rotation.y = -0.25;
        headRef.current.rotation.z = 0.15;
        headRef.current.rotation.x = 0.2;
        leftArmRef.current.rotation.x = 0.9;
        leftArmRef.current.rotation.z = 0.5;
        rightArmRef.current.rotation.x = 0.9;
        rightArmRef.current.rotation.z = -0.5;
        rootRef.current.position.y = 0;
        break;

      case 'surprise': // Surprise reaction!
        rootRef.current.position.y = 0.35;
        leftArmRef.current.rotation.z = 1.7;
        rightArmRef.current.rotation.z = -1.7;
        leftArmRef.current.rotation.x = -0.2;
        rightArmRef.current.rotation.x = -0.2;
        if (headRef.current) headRef.current.rotation.x = -0.25;
        break;

      case 'heartPulse': // Heart pulse expansion
        const hp = Math.sin(t * 8.0);
        leftArmRef.current.rotation.z = 0.5 + hp * 0.2;
        rightArmRef.current.rotation.z = -0.5 - hp * 0.2;
        leftArmRef.current.rotation.x = 0.8;
        rightArmRef.current.rotation.x = 0.8;
        rootRef.current.position.y = hp * 0.05;
        break;

      case 'idle':
      default: // Normal gentle breathing idle
        rootRef.current.position.y = Math.sin(t * 1.5) * 0.04;
        leftArmRef.current.rotation.z = 0.32 + breath * 0.04;
        rightArmRef.current.rotation.z = -0.32 - breath * 0.04;
        leftArmRef.current.rotation.x = 0.15;
        rightArmRef.current.rotation.x = 0.15;
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
        rootRef.current.rotation.set(0, 0, 0);
        break;
    }
  });

  return (
    <group 
      scale={scale} 
      position={position} 
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        triggerTeddyReaction();
      }}
    >
      <group ref={rootRef}>
        {/* ============================================================== */}
        {/* SPINAL / TORSO ASSEMBLY                                        */}
        {/* ============================================================== */}
        <group ref={spineRef} position={[0, 1.25, 0]}>
          {/* Main Plush Body */}
          <mesh castShadow receiveShadow material={materials.fur}>
            <sphereGeometry args={[0.92, 32, 32]} />
          </mesh>

          {/* Soft Cream Belly Patch */}
          <mesh position={[0, -0.05, 0.42]} rotation={[-0.15, 0, 0]} material={materials.muzzle}>
            <sphereGeometry args={[0.62, 28, 28]} />
          </mesh>

          {/* Outfit: Hoodie / Clothes overlay if selected */}
          {outfit === 'hoodie' && (
            <group position={[0, 0.05, 0]}>
              <mesh material={materials.clothesHoodie}>
                <sphereGeometry args={[0.95, 32, 24]} />
              </mesh>
              {/* Pocket pouch */}
              <mesh position={[0, -0.25, 0.85]} material={materials.clothesHoodie}>
                <boxGeometry args={[0.65, 0.3, 0.15]} />
              </mesh>
            </group>
          )}

          {outfit === 'pajamas' && (
            <mesh material={materials.clothesPajamas}>
              <sphereGeometry args={[0.94, 32, 24]} />
            </mesh>
          )}

          {outfit === 'formal' && (
            <group position={[0, 0.65, 0.55]}>
              {/* White collar */}
              <mesh material={materials.muzzle} position={[0, 0, 0]}>
                <boxGeometry args={[0.45, 0.12, 0.1]} />
              </mesh>
              {/* Black velvet bow-tie */}
              <mesh material={materials.clothesFormal} position={[0, -0.08, 0.08]}>
                <boxGeometry args={[0.26, 0.12, 0.08]} />
              </mesh>
            </group>
          )}

          {/* Glowing Heart Accessory held in front */}
          <group ref={heartRef} position={[0, 0.15, 0.95]}>
            <mesh castShadow material={materials.heart}>
              <dodecahedronGeometry args={[0.34, 1]} />
            </mesh>
            {/* Soft point light radiating from heart */}
            <pointLight color="#ff4d8d" intensity={1.8} distance={3.5} />
          </group>

          {/* ============================================================ */}
          {/* HEAD & FACIAL EXPRESSIONS                                   */}
          {/* ============================================================ */}
          <group ref={headRef} position={[0, 1.25, 0]}>
            {/* Main Round Head */}
            <mesh castShadow material={materials.fur}>
              <sphereGeometry args={[0.82, 32, 32]} />
            </mesh>

            {/* Snout Muzzle */}
            <mesh position={[0, -0.12, 0.58]} material={materials.muzzle}>
              <sphereGeometry args={[0.38, 28, 28]} />
            </mesh>

            {/* Embroidered Cute Nose */}
            <mesh position={[0, 0.04, 0.92]} material={materials.nose}>
              <sphereGeometry args={[0.11, 20, 20]} />
            </mesh>

            {/* Eyes & Blinking Lids */}
            {/* Left Eye */}
            <group position={[-0.26, 0.12, 0.68]}>
              <mesh ref={leftEyeRef} material={materials.eyes}>
                <sphereGeometry args={[0.10, 24, 24]} />
              </mesh>
              {/* Glossy White Glint */}
              <mesh position={[-0.03, 0.03, 0.08]} material={materials.glint}>
                <sphereGeometry args={[0.028, 12, 12]} />
              </mesh>
              {/* Eyelid for Blinking */}
              <group ref={leftLidRef} position={[0, 0.04, 0.02]}>
                <mesh material={materials.fur}>
                  <sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                </mesh>
              </group>
            </group>

            {/* Right Eye */}
            <group position={[0.26, 0.12, 0.68]}>
              <mesh ref={rightEyeRef} material={materials.eyes}>
                <sphereGeometry args={[0.10, 24, 24]} />
              </mesh>
              {/* Glossy White Glint */}
              <mesh position={[-0.03, 0.03, 0.08]} material={materials.glint}>
                <sphereGeometry args={[0.028, 12, 12]} />
              </mesh>
              {/* Eyelid for Blinking */}
              <group ref={rightLidRef} position={[0, 0.04, 0.02]}>
                <mesh material={materials.fur}>
                  <sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                </mesh>
              </group>
            </group>

            {/* Rounded Teddy Ears */}
            {/* Left Ear */}
            <group position={[-0.62, 0.65, 0]} rotation={[0, 0, -0.25]}>
              <mesh castShadow material={materials.fur}>
                <sphereGeometry args={[0.32, 24, 24]} />
              </mesh>
              <mesh position={[0, 0, 0.12]} material={materials.innerEar}>
                <sphereGeometry args={[0.20, 20, 20]} />
              </mesh>
            </group>

            {/* Right Ear */}
            <group position={[0.62, 0.65, 0]} rotation={[0, 0, 0.25]}>
              <mesh castShadow material={materials.fur}>
                <sphereGeometry args={[0.32, 24, 24]} />
              </mesh>
              <mesh position={[0, 0, 0.12]} material={materials.innerEar}>
                <sphereGeometry args={[0.20, 20, 20]} />
              </mesh>
            </group>

            {/* Accessories on Head */}
            {accessory === 'glasses' && (
              <group position={[0, 0.12, 0.74]}>
                {/* Left Frame */}
                <mesh position={[-0.26, 0, 0]} material={materials.gold}>
                  <torusGeometry args={[0.14, 0.02, 16, 32]} />
                </mesh>
                {/* Right Frame */}
                <mesh position={[0.26, 0, 0]} material={materials.gold}>
                  <torusGeometry args={[0.14, 0.02, 16, 32]} />
                </mesh>
                {/* Bridge */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI * 0.5]} material={materials.gold}>
                  <cylinderGeometry args={[0.015, 0.015, 0.18]} />
                </mesh>
              </group>
            )}

            {accessory === 'hat' && (
              <group position={[0, 0.75, 0]} rotation={[-0.1, 0, 0.15]}>
                {/* Wizard / Party Hat */}
                <mesh material={materials.clothesFantasy}>
                  <coneGeometry args={[0.45, 0.9, 32]} />
                </mesh>
                <mesh position={[0, 0.45, 0]} material={materials.gold}>
                  <sphereGeometry args={[0.12, 16, 16]} />
                </mesh>
              </group>
            )}
          </group>

          {/* ============================================================ */}
          {/* ARMS & PAWS (ARTICULATED JOINTS)                             */}
          {/* ============================================================ */}
          {/* Left Arm */}
          <group ref={leftArmRef} position={[-0.95, 0.35, 0]}>
            <mesh castShadow material={materials.fur} position={[-0.25, -0.35, 0]}>
              <capsuleGeometry args={[0.26, 0.65, 16, 16]} />
            </mesh>
            {/* Paw Pad */}
            <mesh position={[-0.32, -0.7, 0.1]} material={materials.innerEar}>
              <sphereGeometry args={[0.12, 16, 16]} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={rightArmRef} position={[0.95, 0.35, 0]}>
            <mesh castShadow material={materials.fur} position={[0.25, -0.35, 0]}>
              <capsuleGeometry args={[0.26, 0.65, 16, 16]} />
            </mesh>
            {/* Paw Pad */}
            <mesh position={[0.32, -0.7, 0.1]} material={materials.innerEar}>
              <sphereGeometry args={[0.12, 16, 16]} />
            </mesh>
          </group>

          {/* Scarf Accessory */}
          {accessory === 'scarf' && (
            <group position={[0, 0.72, 0]}>
              <mesh rotation={[Math.PI * 0.5, 0, 0]} material={materials.clothesWinter}>
                <torusGeometry args={[0.55, 0.14, 16, 32]} />
              </mesh>
              <mesh position={[0.32, -0.35, 0.52]} rotation={[0, 0, -0.2]} material={materials.clothesWinter}>
                <boxGeometry args={[0.22, 0.65, 0.08]} />
              </mesh>
            </group>
          )}

          {/* Backpack Accessory */}
          {accessory === 'backpack' && (
            <group position={[0, 0.1, -0.85]}>
              <mesh material={materials.clothesWinter}>
                <boxGeometry args={[0.7, 0.8, 0.35]} />
              </mesh>
              <mesh position={[0, 0.3, 0.18]} rotation={[0, 0, Math.PI * 0.5]} material={materials.gold}>
                <cylinderGeometry args={[0.04, 0.04, 0.5]} />
              </mesh>
            </group>
          )}

          {/* Heart Pendant Necklace */}
          {accessory === 'necklace' && (
            <group position={[0, 0.68, 0.48]}>
              <mesh rotation={[Math.PI * 0.4, 0, 0]} material={materials.gold}>
                <torusGeometry args={[0.42, 0.02, 16, 32]} />
              </mesh>
              <mesh position={[0, -0.25, 0.35]} material={materials.heart}>
                <dodecahedronGeometry args={[0.14, 0]} />
              </mesh>
            </group>
          )}
        </group>

        {/* ============================================================== */}
        {/* LEGS & PAWS (HIP PIVOTS)                                       */}
        {/* ============================================================== */}
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.45, 0.65, 0]}>
          <mesh castShadow material={materials.fur} position={[0, -0.45, 0]}>
            <capsuleGeometry args={[0.30, 0.65, 16, 16]} />
          </mesh>
          {/* Left Foot Pad */}
          <mesh position={[0, -0.82, 0.14]} rotation={[-0.3, 0, 0]} material={materials.innerEar}>
            <cylinderGeometry args={[0.18, 0.22, 0.06, 16]} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.45, 0.65, 0]}>
          <mesh castShadow material={materials.fur} position={[0, -0.45, 0]}>
            <capsuleGeometry args={[0.30, 0.65, 16, 16]} />
          </mesh>
          {/* Right Foot Pad */}
          <mesh position={[0, -0.82, 0.14]} rotation={[-0.3, 0, 0]} material={materials.innerEar}>
            <cylinderGeometry args={[0.18, 0.22, 0.06, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
