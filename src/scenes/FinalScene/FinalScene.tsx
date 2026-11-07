import React from 'react';
import { Html } from '@react-three/drei';
import { Stars } from '@/environment/Stars';
import { Lighting } from '@/environment/Lighting';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { useTeddyStore } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const FinalScene: React.FC = () => {
  const { startWarpTransition } = useTeddyStore();

  const handleReplay = () => {
    AudioManager.playPortalWarp();
    startWarpTransition('intro');
  };

  return (
    <group>
      <Lighting />
      <Stars count={1400} />

      {/* Floating Crescent Moon Island */}
      <mesh position={[0, -2.2, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.8, 0.4, 32]} />
        <meshStandardMaterial
          color="#1e1b4b"
          roughness={0.5}
          metalness={0.2}
          emissive="#311042"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Large Glowing Crescent Moon in Background */}
      <mesh position={[4.5, 3.2, -6.5]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color="#fff1e6"
          emissive="#ffd8a8"
          emissiveIntensity={0.9}
          roughness={0.1}
        />
        <pointLight color="#fff1e6" intensity={2.0} distance={15} />
      </mesh>

      {/* Teddy Sitting Contentedly on the Moon Platform */}
      <TeddyModel
        position={[0, -1.8, 0.2]}
        scale={1.15}
        interactive={true}
      />

      {/* Heartfelt Farewell Message in 3D */}
      <Html position={[0, 1.8, -1.0]} center distanceFactor={8}>
        <div className="flex flex-col items-center justify-center text-center max-w-md px-6 py-6 rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-rose-500/30 shadow-2xl shadow-rose-950/50">
          <span className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-2">
            Eternal Celestial Bond
          </span>
          <h2 className="text-2xl font-serif text-white font-bold mb-3 tracking-wide">
            Thank You, Loki 🌙✨
          </h2>
          <p className="text-sm text-rose-100/90 leading-relaxed font-light mb-6">
            "Wherever you wander in this vast universe, may warmth always find your heart, peace shelter your soul, and happiness follow your footsteps."
          </p>
          <button
            onClick={handleReplay}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-400 hover:to-purple-400 text-white font-medium text-xs tracking-wider shadow-lg shadow-pink-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>✨</span> REPLAY THE JOURNEY <span>🧸</span>
          </button>
        </div>
      </Html>
    </group>
  );
};
