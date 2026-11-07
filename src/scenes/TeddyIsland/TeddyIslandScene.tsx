import React from 'react';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { FloatingIsland } from '@/environment/FloatingIsland';
import { Stars } from '@/environment/Stars';
import { Clouds } from '@/environment/Clouds';
import { Lighting } from '@/environment/Lighting';

export const TeddyIslandScene: React.FC = () => {
  return (
    <group>
      <Lighting />
      <Stars count={950} />
      <Clouds />

      {/* Floating Fantasy Terrain */}
      <FloatingIsland />

      {/* The Adorable 3D Plush Teddy Bear at Island Center */}
      <TeddyModel
        position={[0, 0.4, 0]}
        scale={1.25}
        rotation={[0, 0, 0]}
        interactive={true}
      />

      {/* Magical Moon in Distance */}
      <mesh position={[-12, 10, -22]}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshStandardMaterial
          color="#ffeedd"
          emissive="#ffd8a8"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
        <pointLight color="#ffe8d6" intensity={1.5} distance={30} />
      </mesh>
    </group>
  );
};

