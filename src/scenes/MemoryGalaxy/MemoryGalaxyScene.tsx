import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Stars } from '@/environment/Stars';
import { Lighting } from '@/environment/Lighting';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { useTeddyStore, MemoryItem } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

// Single 3D Floating Photo Frame Component
const FloatingFrame: React.FC<{
  memory: MemoryItem;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  onSelect: () => void;
}> = ({ memory, position, rotation, isActive, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(memory.imageUrl);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.15;
      meshRef.current.rotation.y = rotation[1] + Math.sin(t * 0.8) * 0.05;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        AudioManager.playClick();
        onSelect();
      }}
    >
      {/* Golden Frame Border */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.2, 0.14]} />
        <meshStandardMaterial
          color={isActive ? '#ff5c8a' : '#d4af37'}
          metalness={0.8}
          roughness={0.25}
          emissive={isActive ? '#ff2a6d' : '#ffd700'}
          emissiveIntensity={isActive ? 0.6 : 0.25}
        />
      </mesh>

      {/* Photo Surface with Texture */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Decorative Washi Tape on Top */}
      <mesh position={[0, 1.55, 0.12]} rotation={[0, 0, -0.06]}>
        <planeGeometry args={[0.9, 0.28]} />
        <meshStandardMaterial color="#ffc2d1" transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

export const MemoryGalaxyScene: React.FC = () => {
  const { memories, activeMemoryId, setActiveMemory } = useTeddyStore();

  const framePositions: [number, number, number][] = [
    [-3.8, 1.2, -1.5],
    [0.0, 1.8, -3.2],
    [3.8, 1.2, -1.5],
    [-2.2, -1.4, -2.0],
  ];

  const frameRotations: [number, number, number][] = [
    [0, 0.35, -0.05],
    [0, 0, 0],
    [0, -0.35, 0.05],
    [0, 0.2, 0.08],
  ];

  return (
    <group>
      <Lighting />
      <Stars count={1200} />

      {/* Floating 3D Photo Frames in Cosmos */}
      {memories.slice(0, 4).map((mem, index) => (
        <FloatingFrame
          key={mem.id}
          memory={mem}
          position={framePositions[index] || [0, 0, -3]}
          rotation={frameRotations[index] || [0, 0, 0]}
          isActive={activeMemoryId === mem.id}
          onSelect={() => setActiveMemory(mem.id)}
        />
      ))}

      {/* Miniature Cute Teddy Guardian of Memories */}
      <TeddyModel
        position={[0, -2.4, 0.5]}
        scale={0.85}
        interactive={true}
      />
    </group>
  );
};

