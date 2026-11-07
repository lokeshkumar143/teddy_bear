import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTeddyStore } from '@/app/store';

export const FloatingIsland: React.FC = () => {
  const islandRef = useRef<THREE.Group>(null);
  const waterfallMistRef = useRef<THREE.Points>(null);
  const { environmentTheme } = useTeddyStore();

  const themeColors = useMemo(() => {
    switch (environmentTheme) {
      case 'dream':
        return {
          grass: '#84dcc6',
          rock: '#5e548e',
          shroomCap: '#ff5c8a',
          water: '#90e0ef',
          foliage: '#ffb5a7'
        };
      case 'sunset':
        return {
          grass: '#606c38',
          rock: '#4a2810',
          shroomCap: '#f77f00',
          water: '#fcbf49',
          foliage: '#d62828'
        };
      case 'forest':
        return {
          grass: '#2d6a4f',
          rock: '#1b4332',
          shroomCap: '#70e000',
          water: '#52b788',
          foliage: '#007200'
        };
      case 'moonlight':
      default:
        return {
          grass: '#2b5876',
          rock: '#1e293b',
          shroomCap: '#38bdf8',
          water: '#38bdf8',
          foliage: '#4e54c8'
        };
    }
  }, [environmentTheme]);

  // Waterfall Mist Particles
  const mistCount = 65;
  const [mistPositions, mistSpeeds] = useMemo(() => {
    const pos = new Float32Array(mistCount * 3);
    const spd = new Float32Array(mistCount);
    for (let i = 0; i < mistCount; i++) {
      pos[i * 3] = 2.4 + (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 1] = -0.6 - Math.random() * 2.8;
      pos[i * 3 + 2] = 0.8 + (Math.random() - 0.5) * 0.8;
      spd[i] = 0.04 + Math.random() * 0.05;
    }
    return [pos, spd];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Subtle breathing float for the whole island
    if (islandRef.current) {
      islandRef.current.position.y = Math.sin(t * 1.2) * 0.12;
    }

    // Animate waterfall mist particles falling
    if (waterfallMistRef.current) {
      const positions = waterfallMistRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < mistCount; i++) {
        positions[i * 3 + 1] -= mistSpeeds[i];
        if (positions[i * 3 + 1] < -3.6) {
          positions[i * 3 + 1] = -0.6;
        }
      }
      waterfallMistRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={islandRef} position={[0, -0.6, 0]}>
      {/* ============================================================== */}
      {/* MAIN ISLAND BODY (GRASS PLATEAU + ROCKY CONE BASE)             */}
      {/* ============================================================== */}
      {/* Lush Grass Top Plateau */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[4.2, 4.4, 0.65, 36]} />
        <meshStandardMaterial color={themeColors.grass} roughness={0.85} />
      </mesh>

      {/* Underbelly Rocky Inverted Cone */}
      <mesh receiveShadow position={[0, -1.8, 0]}>
        <coneGeometry args={[4.2, 3.2, 24]} />
        <meshStandardMaterial color={themeColors.rock} roughness={0.95} />
      </mesh>

      {/* Hanging Stalactite Rocks under island */}
      <mesh position={[-1.2, -2.8, 0.8]} rotation={[0, 0, 0.1]}>
        <coneGeometry args={[0.55, 2.0, 8]} />
        <meshStandardMaterial color={themeColors.rock} roughness={0.9} />
      </mesh>
      <mesh position={[1.4, -2.5, -0.6]} rotation={[0, 0, -0.15]}>
        <coneGeometry args={[0.6, 1.8, 8]} />
        <meshStandardMaterial color={themeColors.rock} roughness={0.9} />
      </mesh>

      {/* ============================================================== */}
      {/* MINIATURE WATERFALL                                            */}
      {/* ============================================================== */}
      <mesh position={[2.5, -0.8, 0.8]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.7, 2.2, 0.15]} />
        <meshStandardMaterial
          color={themeColors.water}
          emissive={themeColors.water}
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
          roughness={0.1}
        />
      </mesh>

      {/* Waterfall Mist Particles */}
      <points ref={waterfallMistRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[mistPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ============================================================== */}
      {/* FANTASY TREES WITH BLOSSOMS                                    */}
      {/* ============================================================== */}
      {/* Left Tree */}
      <group position={[-2.8, 0.35, -1.2]}>
        {/* Tree Trunk */}
        <mesh castShadow position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 2.0, 12]} />
          <meshStandardMaterial color="#4a2810" roughness={0.9} />
        </mesh>
        {/* Blossom Foliage Spheres */}
        <mesh castShadow position={[0, 2.2, 0]}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshStandardMaterial color={themeColors.foliage} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0.4, 2.5, 0.3]}>
          <sphereGeometry args={[0.65, 14, 14]} />
          <meshStandardMaterial color={themeColors.foliage} roughness={0.6} />
        </mesh>
      </group>

      {/* Right Tree */}
      <group position={[2.6, 0.35, -1.8]}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.16, 0.24, 1.7, 12]} />
          <meshStandardMaterial color="#4a2810" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.85, 16, 16]} />
          <meshStandardMaterial color={themeColors.foliage} roughness={0.6} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* GLOWING MAGICAL MUSHROOMS                                      */}
      {/* ============================================================== */}
      <group position={[-1.8, 0.35, 1.8]}>
        {/* Stem */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.09, 0.4, 10]} />
          <meshStandardMaterial color="#ffeedd" />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial
            color={themeColors.shroomCap}
            emissive={themeColors.shroomCap}
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
        <pointLight color={themeColors.shroomCap} intensity={0.9} distance={1.8} position={[0, 0.4, 0]} />
      </group>

      {/* Small companion mushroom */}
      <group position={[-1.5, 0.35, 1.95]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.25, 10]} />
          <meshStandardMaterial color="#ffeedd" />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <sphereGeometry args={[0.16, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial
            color={themeColors.shroomCap}
            emissive={themeColors.shroomCap}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Stepping Stones on Grass */}
      <mesh position={[0.2, 0.34, 1.2]} rotation={[-Math.PI * 0.5, 0, 0.4]}>
        <circleGeometry args={[0.32, 12]} />
        <meshStandardMaterial color="#8d99ae" roughness={0.9} />
      </mesh>
      <mesh position={[-0.4, 0.34, 1.8]} rotation={[-Math.PI * 0.5, 0, -0.2]}>
        <circleGeometry args={[0.26, 12]} />
        <meshStandardMaterial color="#8d99ae" roughness={0.9} />
      </mesh>
    </group>
  );
};

