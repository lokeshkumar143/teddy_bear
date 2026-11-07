import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Stars } from '@/environment/Stars';
import { Lighting } from '@/environment/Lighting';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { useTeddyStore } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

interface CollectibleItem {
  id: number;
  type: 'star' | 'heart';
  position: [number, number, number];
  speed: number;
  rotationSpeed: number;
  scale: number;
}

export const StarPlaygroundScene: React.FC = () => {
  const { addScore, triggerTeddyReaction } = useTeddyStore();

  // Create pool of 12 falling collectibles (stars and hearts)
  const [items, setItems] = useState<CollectibleItem[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      type: i % 3 === 0 ? 'heart' : 'star',
      position: [
        (Math.random() - 0.5) * 8,
        3.5 + Math.random() * 5,
        -1 + (Math.random() - 0.5) * 4,
      ],
      speed: 0.8 + Math.random() * 0.9,
      rotationSpeed: 1 + Math.random() * 2,
      scale: 0.35 + Math.random() * 0.2,
    }));
  });

  const itemRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    setItems((prevItems) =>
      prevItems.map((item, idx) => {
        let newY = item.position[1] - item.speed * delta;
        // If it falls below ground level, wrap back to top
        if (newY < -1.8) {
          newY = 5.5 + Math.random() * 2;
          return {
            ...item,
            position: [(Math.random() - 0.5) * 8, newY, -1 + (Math.random() - 0.5) * 4],
          };
        }

        // Apply rotation to mesh group
        const group = itemRefs.current[idx];
        if (group) {
          group.rotation.y += item.rotationSpeed * delta;
          group.rotation.z += item.rotationSpeed * 0.5 * delta;
        }

        return {
          ...item,
          position: [item.position[0], newY, item.position[2]],
        };
      })
    );
  });

  const handleCollect = (item: CollectibleItem, index: number, event: any) => {
    event.stopPropagation();
    
    if (item.type === 'star') {
      AudioManager.playStarCollect();
      addScore(10, 'star');
      triggerTeddyReaction('Teddy caught a shining star with you! 🌟');
    } else {
      AudioManager.playHeartBurst();
      addScore(25, 'heart');
      triggerTeddyReaction('Infinite warmth! Loving heart collected! 💖');
    }

    // Trigger visual confetti burst
    confetti({
      particleCount: 28,
      spread: 60,
      origin: {
        x: event.clientX ? event.clientX / window.innerWidth : 0.5,
        y: event.clientY ? event.clientY / window.innerHeight : 0.5,
      },
      colors: item.type === 'star' ? ['#ffd700', '#ffea00', '#ffffff'] : ['#ff2a6d', '#ff758c', '#ffffff'],
    });

    // Respawn collectible at top immediately
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        position: [
          (Math.random() - 0.5) * 8,
          6 + Math.random() * 2,
          -1 + (Math.random() - 0.5) * 4,
        ],
      };
      return copy;
    });
  };

  return (
    <group>
      <Lighting />
      <Stars count={1100} />

      {/* Floating Playground Island Platform */}
      <mesh position={[0, -2.1, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.6, 0.45, 32]} />
        <meshStandardMaterial
          color="#3a0ca3"
          roughness={0.4}
          metalness={0.3}
          emissive="#240046"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Glowing Playground Energy Rings */}
      <mesh position={[0, -2.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.4, 4.6, 64]} />
        <meshBasicMaterial color="#4cc9f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -2.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.0, 3.15, 64]} />
        <meshBasicMaterial color="#f72585" side={THREE.DoubleSide} />
      </mesh>

      {/* Cheering Playful Teddy at the Center of the Playground */}
      <TeddyModel
        position={[0, -1.8, 0]}
        scale={1.1}
        interactive={true}
      />

      {/* Falling Collectibles (3D Stars & Hearts) */}
      {items.map((item, idx) => (
        <group
          key={item.id}
          ref={(el) => (itemRefs.current[idx] = el)}
          position={item.position}
          scale={item.scale}
          onClick={(e) => handleCollect(item, idx, e)}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {item.type === 'star' ? (
            // 3D Star shape composed of two pyramids / octohedron
            <mesh castShadow>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#ffd700"
                emissive="#ffb703"
                emissiveIntensity={0.8}
                metalness={0.7}
                roughness={0.2}
              />
              <pointLight color="#ffd700" intensity={1.2} distance={3} />
            </mesh>
          ) : (
            // 3D Glowing Heart shape
            <group scale={0.85}>
              <mesh position={[-0.4, 0.35, 0]}>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshStandardMaterial
                  color="#ff2a6d"
                  emissive="#ff0055"
                  emissiveIntensity={0.9}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[0.4, 0.35, 0]}>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshStandardMaterial
                  color="#ff2a6d"
                  emissive="#ff0055"
                  emissiveIntensity={0.9}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.85, 1.25, 16]} />
                <meshStandardMaterial
                  color="#ff2a6d"
                  emissive="#ff0055"
                  emissiveIntensity={0.9}
                  roughness={0.3}
                />
              </mesh>
              <pointLight color="#ff2a6d" intensity={1.5} distance={3} />
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

