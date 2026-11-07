import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars } from '@/environment/Stars';
import { Lighting } from '@/environment/Lighting';
import { TeddyModel } from '@/characters/Teddy/TeddyModel';
import { useTeddyStore, BookItem } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

const FloatingBook: React.FC<{
  book: BookItem;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  onSelect: () => void;
}> = ({ book, position, rotation, isActive, onSelect }) => {
  const bookRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bookRef.current) {
      bookRef.current.position.y = position[1] + Math.sin(t * 1.8 + position[0]) * 0.12;
      bookRef.current.rotation.y = rotation[1] + Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group
      ref={bookRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        AudioManager.playClick();
        onSelect();
      }}
    >
      {/* Book Cover */}
      <mesh castShadow>
        <boxGeometry args={[1.6, 2.2, 0.35]} />
        <meshStandardMaterial
          color={book.color}
          roughness={0.4}
          metalness={0.1}
          emissive={isActive ? book.color : '#000000'}
          emissiveIntensity={isActive ? 0.6 : 0.0}
        />
      </mesh>

      {/* Pages Rim */}
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[1.5, 2.1, 0.28]} />
        <meshStandardMaterial color="#fefae0" roughness={0.8} />
      </mesh>

      {/* Gilded Title Ribbon */}
      <mesh position={[0, 0, 0.19]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Floating Sparkles around Book */}
      <pointLight color={book.color} intensity={1.2} distance={2.5} />
    </group>
  );
};

export const DreamLibraryScene: React.FC = () => {
  const { books, activeBookId, setActiveBook } = useTeddyStore();

  const bookPositions: [number, number, number][] = [
    [-2.8, 1.4, -1.8],
    [0.0, 1.8, -2.4],
    [2.8, 1.4, -1.8],
  ];

  const bookRotations: [number, number, number][] = [
    [0.1, 0.35, -0.1],
    [0.15, 0, 0],
    [0.1, -0.35, 0.1],
  ];

  return (
    <group>
      <Lighting />
      <Stars count={1100} />

      {/* Floating Bookshelves Arch in the background */}
      <mesh position={[0, 3.2, -5.5]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[5.2, 0.25, 16, 64, Math.PI]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Floating Magical Tomes */}
      {books.map((b, idx) => (
        <FloatingBook
          key={b.id}
          book={b}
          position={bookPositions[idx] || [0, 0, -2]}
          rotation={bookRotations[idx] || [0, 0, 0]}
          isActive={activeBookId === b.id}
          onSelect={() => setActiveBook(b.id)}
        />
      ))}

      {/* Scholar Teddy sitting with spectacles */}
      <TeddyModel
        position={[0, -1.6, 0.2]}
        scale={0.95}
        interactive={true}
      />
    </group>
  );
};
