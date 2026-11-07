import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { Portal } from '@/environment/Portals';
import { Stars } from '@/environment/Stars';
import { Clouds } from '@/environment/Clouds';
import { Lighting } from '@/environment/Lighting';
import { useTeddyStore } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const IntroScene: React.FC = () => {
  const { startWarpTransition } = useTeddyStore();
  const cameraGroupRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (cameraGroupRef.current) {
      cameraGroupRef.current.position.y = Math.sin(t * 1.2) * 0.15;
    }
  });

  const handleEnterUniverse = () => {
    AudioManager.playPortalWarp();
    AudioManager.startMelody();
    startWarpTransition('island');
  };

  return (
    <group ref={cameraGroupRef}>
      <Lighting />
      <Stars count={1100} />
      <Clouds />

      {/* Rotating Stargate Portal */}
      <Portal
        position={[0, 1.8, -4.5]}
        scale={1.3}
        color="#ff5c8a"
        onClick={handleEnterUniverse}
      />

      {/* Cute 3D Teddy Welcoming at the Portal */}
      <TeddyModel
        position={[0, -0.6, 0.4]}
        scale={1.15}
        rotation={[0, 0, 0]}
        interactive={true}
      />

      {/* Distant Floating Moon Island Silhouette */}
      <mesh position={[10, 8, -25]}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshStandardMaterial color="#fff0f5" emissive="#ffd6e0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};

