import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Stars } from '@/environment/Stars';
import { Lighting } from '@/environment/Lighting';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { AudioManager } from '@/audio/AudioManager';

interface SkillItem {
  name: string;
  color: string;
  level: string;
  position: [number, number, number];
}

const skills: SkillItem[] = [
  { name: 'Three.js & WebGL', color: '#06d6a0', level: 'Mastery', position: [-2.8, 1.6, -1.2] },
  { name: 'React & TypeScript', color: '#118ab2', level: 'Expert', position: [-1.2, 2.4, -2.0] },
  { name: 'AI & Creative Coding', color: '#ef476f', level: 'Advanced', position: [1.2, 2.4, -2.0] },
  { name: '3D Interaction & UI', color: '#ffd166', level: 'Visionary', position: [2.8, 1.6, -1.2] },
];

export const CreativeWorldScene: React.FC = () => {
  const skillsGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (skillsGroupRef.current) {
      skillsGroupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group>
      <Lighting />
      <Stars count={1300} />

      {/* Cyber Floating Cyber-Pedestal */}
      <mesh position={[0, -2.0, 0]} receiveShadow>
        <cylinderGeometry args={[3.8, 4.2, 0.4, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.8}
          emissive="#1e1b4b"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Futuristic Holo Grid Ring */}
      <mesh position={[0, -1.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.6, 3.75, 64]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
      </mesh>

      {/* Creative Teddy in Dev Glasses & Hoodie */}
      <TeddyModel
        position={[0, -1.6, 0]}
        scale={1.05}
        interactive={true}
      />

      {/* Floating 3D Skill Orbs */}
      <group ref={skillsGroupRef}>
        {skills.map((skill, i) => (
          <group key={i} position={skill.position}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                AudioManager.playClick();
              }}
            >
              <sphereGeometry args={[0.42, 32, 32]} />
              <meshStandardMaterial
                color={skill.color}
                emissive={skill.color}
                emissiveIntensity={0.7}
                metalness={0.6}
                roughness={0.2}
              />
              <pointLight color={skill.color} intensity={1.5} distance={2.5} />
            </mesh>

            <Html position={[0, 0.65, 0]} center distanceFactor={10}>
              <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-full shadow-lg shadow-cyan-500/20 text-center pointer-events-none whitespace-nowrap">
                <span className="text-xs font-bold text-white tracking-wide block">{skill.name}</span>
                <span className="text-[10px] text-cyan-400 font-medium">{skill.level}</span>
              </div>
            </Html>
          </group>
        ))}
      </group>

      {/* Floating Developer Identity Hologram in 3D */}
      <Html position={[0, 2.8, -2.5]} center distanceFactor={9}>
        <div className="flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-slate-950/85 backdrop-blur-xl border border-pink-500/30 px-6 py-4 rounded-2xl shadow-2xl shadow-pink-500/20 text-center max-w-sm">
            <div className="inline-block px-3 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-[11px] font-semibold text-pink-300 mb-2">
              CREATIVE DEVELOPER & ARCHITECT
            </div>
            <h2 className="text-xl font-black text-white tracking-wider mb-1">
              LOKESH KUMAR
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-light">
              Crafting immersive 3D universes, generative interactive art, and intelligent web experiences.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://github.com/lokeshkumar143"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                GitHub Profile ↗
              </a>
              <a
                href="https://github.com/lokeshkumar143/teddy_bear"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-medium transition-transform hover:scale-105"
              >
                View Source 🚀
              </a>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};
