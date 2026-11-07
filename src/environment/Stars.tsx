import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Stars: React.FC<{ count?: number }> = ({ count = 900 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const shootingStarRef = useRef<THREE.Mesh>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffc6ff'),
      new THREE.Color('#9bf6ff'),
      new THREE.Color('#ffd166'),
      new THREE.Color('#c77dff')
    ];

    for (let i = 0; i < count; i++) {
      // Sphere distribution around camera
      const r = 25 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      sz[i] = 1.0 + Math.random() * 2.2;
    }

    return [pos, col, sz];
  }, [count]);

  // Shooting star animation state
  const shootingStar = useRef({
    active: false,
    x: -30,
    y: 20,
    z: -20,
    vx: 18,
    vy: -12,
    nextTime: 4.0
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.015;
      pointsRef.current.rotation.x = Math.sin(t * 0.01) * 0.05;
    }

    // Shooting star trajectory
    if (shootingStarRef.current) {
      if (t > shootingStar.current.nextTime) {
        shootingStar.current.active = true;
        shootingStar.current.x = -25 - Math.random() * 15;
        shootingStar.current.y = 15 + Math.random() * 15;
        shootingStar.current.z = -15 - Math.random() * 15;
        shootingStar.current.nextTime = t + 5.0 + Math.random() * 6.0;
      }

      if (shootingStar.current.active) {
        shootingStar.current.x += shootingStar.current.vx * 0.035;
        shootingStar.current.y += shootingStar.current.vy * 0.035;
        shootingStarRef.current.position.set(
          shootingStar.current.x,
          shootingStar.current.y,
          shootingStar.current.z
        );

        if (shootingStar.current.y < -15) {
          shootingStar.current.active = false;
        }
      }
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Occasional shooting star */}
      <mesh ref={shootingStarRef} position={[-100, -100, -100]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
