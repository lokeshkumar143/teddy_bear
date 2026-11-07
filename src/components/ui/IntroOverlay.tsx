import React from 'react';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { useTeddyStore } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const IntroOverlay: React.FC = () => {
  const { currentWorld, startWarpTransition } = useTeddyStore();

  if (currentWorld !== 'intro') return null;

  const handleEnter = () => {
    AudioManager.playPortalWarp();
    AudioManager.startMelody();
    startWarpTransition('island');
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-white text-xs font-bold tracking-widest font-mono">
              TEDDYVERSE 3.0
            </h3>
            <p className="text-[10px] text-pink-300/80 tracking-wider">
              INTERACTIVE 3D UNIVERSE
            </p>
          </div>
        </div>

        <button
          onClick={handleEnter}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          Skip Intro ↗
        </button>
      </div>

      {/* Center Cinematic Typography & CTA */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto my-auto pointer-events-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-6 shadow-lg shadow-pink-500/10">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span className="text-xs font-medium text-pink-200 tracking-widest uppercase">
            A Little Universe • Made With Love
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-white tracking-tight mb-4 drop-shadow-[0_4px_30px_rgba(255,100,160,0.35)]">
          WELCOME TO <br />
          <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
            TEDDYVERSE
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300/90 font-light max-w-lg mb-8 leading-relaxed">
          "Somewhere between dreams and stars, a little world is waiting for you."
        </p>

        {/* Enter Portal CTA Button */}
        <button
          onClick={handleEnter}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-sm tracking-widest uppercase shadow-2xl shadow-pink-500/50 transition-all hover:scale-105 active:scale-95"
        >
          <span>ENTER MY UNIVERSE</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-25 pointer-events-none" />
        </button>
      </div>

      {/* Bottom Footer Credit */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span>Crafted with</span>
          <span className="text-rose-500 animate-pulse">❤️</span>
          <span>by Lokesh Kumar for Loki</span>
        </div>
        <div>
          <span>Three.js • WebGL • R3F</span>
        </div>
      </div>
    </div>
  );
};

