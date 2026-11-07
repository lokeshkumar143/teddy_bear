import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useTeddyStore } from './store';

// 3D World Scenes
import { IntroScene } from '@/scenes/IntroScene/IntroScene';
import { TeddyIslandScene } from '@/scenes/TeddyIsland/TeddyIslandScene';
import { MemoryGalaxyScene } from '@/scenes/MemoryGalaxy/MemoryGalaxyScene';
import { DreamLibraryScene } from '@/scenes/DreamLibrary/DreamLibraryScene';
import { StarPlaygroundScene } from '@/scenes/StarPlayground/StarPlaygroundScene';
import { CreativeWorldScene } from '@/scenes/CreativeWorld/CreativeWorldScene';
import { FinalScene } from '@/scenes/FinalScene/FinalScene';

// UI Overlays
import { IntroOverlay } from '@/components/ui/IntroOverlay';
import { MagicNavbar } from '@/components/navigation/MagicNavbar';
import { TeddyControlPanel } from '@/components/ui/TeddyControlPanel';
import { MemoryModal } from '@/components/ui/MemoryModal';
import { BookLetterModal } from '@/components/ui/BookLetterModal';
import { WarpOverlay } from '@/components/ui/WarpOverlay';

export const App: React.FC = () => {
  const { currentWorld } = useTeddyStore();

  const renderWorld = () => {
    switch (currentWorld) {
      case 'intro':
        return <IntroScene />;
      case 'island':
        return <TeddyIslandScene />;
      case 'memory':
        return <MemoryGalaxyScene />;
      case 'library':
        return <DreamLibraryScene />;
      case 'playground':
        return <StarPlaygroundScene />;
      case 'portfolio':
        return <CreativeWorldScene />;
      case 'final':
        return <FinalScene />;
      default:
        return <TeddyIslandScene />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Layer */}
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 6.5], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {renderWorld()}
        </Suspense>

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minPolarAngle={Math.PI / 4}
          minDistance={3.5}
          maxDistance={12}
          dampingFactor={0.06}
          enableDamping
        />
      </Canvas>

      {/* HTML / 2D UI Overlays Layer */}
      <IntroOverlay />
      <MagicNavbar />
      <TeddyControlPanel />
      <MemoryModal />
      <BookLetterModal />
      <WarpOverlay />
    </div>
  );
};

export default App;
