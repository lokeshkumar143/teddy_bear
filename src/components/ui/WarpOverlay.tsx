import React from 'react';
import { useTeddyStore } from '@/app/store';

export const WarpOverlay: React.FC = () => {
  const { isWarping } = useTeddyStore();

  if (!isWarping) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm transition-all duration-700 animate-pulse">
      {/* Radial Warp Glow Ring */}
      <div className="w-[120vw] h-[120vw] rounded-full bg-gradient-to-r from-pink-500/30 via-purple-600/40 to-cyan-400/30 animate-spin-slow blur-3xl opacity-70" />
      
      {/* Center Warp Core Flash */}
      <div className="absolute w-48 h-48 rounded-full bg-white shadow-[0_0_120px_60px_rgba(255,100,200,0.8)] animate-ping" />

      {/* Warp Text */}
      <div className="absolute text-center">
        <span className="text-white font-serif text-2xl tracking-[0.35em] font-light drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
          WARPING DIMENSIONS...
        </span>
      </div>
    </div>
  );
};
