import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Clouds: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const cloudPuffs = useMemo(() => {
    return [
      { pos: [-6, 3, -8] as [number, number, number], scale: 1.4 },
      { pos: [7, 4.5, -9] as [number, number, number], scale: 1.6 },
      { pos: [-8, -2, -6] as [number, number, number], scale: 1.2 },
      { pos: [6, -2.5, -7] as [number, number, number], scale: 1.3 },
    ];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(t * 0.1) * 0.8;
      groupRef.current.position.y = Math.cos(t * 0.15) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {cloudPuffs.map((c, idx) => (
        <group key={idx} position={c.pos} scale={c.scale}>
          {/* Compound spheres forming a fluffy cloud puff */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.9} />
          </mesh>
          <mesh position={[0.9, -0.2, 0.2]}>
            <sphereGeometry args={[0.9, 14, 14]} />
            <meshStandardMaterial color="#fff0f5" transparent opacity={0.6} roughness={0.9} />
          </mesh>
          <mesh position={[-0.8, -0.15, -0.1]}>
            <sphereGeometry args={[0.85, 14, 14]} />
            <meshStandardMaterial color="#f8edeb" transparent opacity={0.6} roughness={0.9} />
          </mesh>
          <mesh position={[0.2, 0.5, 0.1]}>
            <sphereGeometry args={[0.75, 14, 14]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

