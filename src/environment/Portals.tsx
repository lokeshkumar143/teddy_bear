import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PortalProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  onHover?: () => void;
  onClick?: () => void;
}

export const Portal: React.FC<PortalProps> = ({
  position = [0, 0, 0],
  scale = 1.0,
  color = '#ff5c8a',
  onHover,
  onClick,
}) => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const vortexRef = useRef<THREE.Points>(null);

  // Particle Swarm Vortex
  const particleCount = 180;
  const particlePositions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 0.9;
      const angle = (i / particleCount) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.45;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.65;
    }
    if (vortexRef.current) {
      vortexRef.current.rotation.z = t * 0.85;
    }
  });

  return (
    <group position={position} scale={scale} onClick={onClick} onPointerOver={onHover}>
      {/* Event Horizon Shimmer Disk */}
      <mesh>
        <circleGeometry args={[2.1, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Runed Gold Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.2, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.2}
          emissive="#ffbe0b"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Inner Glowing Crystal Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.9, 0.05, 16, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Swirling Stardust Particle Ring */}
      <points ref={vortexRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#ffffff"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Portal Center Light */}
      <pointLight color={color} intensity={2.5} distance={7} />
    </group>
  );
};

