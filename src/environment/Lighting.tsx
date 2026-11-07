import React, { useMemo } from 'react';
import { useTeddyStore } from '@/app/store';

export const Lighting: React.FC = () => {
  const { environmentTheme } = useTeddyStore();

  const themeLighting = useMemo(() => {
    switch (environmentTheme) {
      case 'dream':
        return {
          ambient: '#4a2559',
          ambientIntensity: 0.8,
          dirColor: '#ff9ebb',
          dirIntensity: 1.6,
          dirPos: [6, 12, 8] as [number, number, number],
          rimColor: '#c77dff',
          rimIntensity: 1.2,
          fogColor: '#170c2a',
        };
      case 'sunset':
        return {
          ambient: '#401824',
          ambientIntensity: 0.75,
          dirColor: '#ff9e00',
          dirIntensity: 1.8,
          dirPos: [-8, 7, 10] as [number, number, number],
          rimColor: '#ff5400',
          rimIntensity: 1.4,
          fogColor: '#1f0d1a',
        };
      case 'forest':
        return {
          ambient: '#0b291e',
          ambientIntensity: 0.7,
          dirColor: '#70e000',
          dirIntensity: 1.4,
          dirPos: [5, 10, 6] as [number, number, number],
          rimColor: '#38b000',
          rimIntensity: 1.1,
          fogColor: '#05130e',
        };
      case 'moonlight':
      default:
        return {
          ambient: '#131b3b',
          ambientIntensity: 0.7,
          dirColor: '#90e0ef',
          dirIntensity: 1.5,
          dirPos: [7, 12, 9] as [number, number, number],
          rimColor: '#48cae4',
          rimIntensity: 1.0,
          fogColor: '#070a1a',
        };
    }
  }, [environmentTheme]);

  return (
    <>
      <color attach="background" args={[themeLighting.fogColor]} />
      <fog attach="fog" args={[themeLighting.fogColor, 12, 38]} />

      <ambientLight color={themeLighting.ambient} intensity={themeLighting.ambientIntensity} />

      {/* Main directional sun/moon light */}
      <directionalLight
        position={themeLighting.dirPos}
        intensity={themeLighting.dirIntensity}
        color={themeLighting.dirColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Rim light for plush teddy fur backlighting */}
      <directionalLight
        position={[-themeLighting.dirPos[0], -themeLighting.dirPos[1] * 0.5, -themeLighting.dirPos[2]]}
        intensity={themeLighting.rimIntensity}
        color={themeLighting.rimColor}
      />

      {/* Subtle floor bounce light */}
      <hemisphereLight
        color={themeLighting.dirColor}
        groundColor={themeLighting.ambient}
        intensity={0.4}
      />
    </>
  );
};
