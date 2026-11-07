import React from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  BookOpen, 
  Gamepad2, 
  Code2, 
  Moon, 
  Volume2, 
  VolumeX, 
  Sun, 
  Compass,
  Heart
} from 'lucide-react';
import { useTeddyStore, WorldType, EnvironmentTheme } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const MagicNavbar: React.FC = () => {
  const { 
    currentWorld, 
    startWarpTransition, 
    environmentTheme, 
    setEnvironmentTheme,
    soundMuted,
    toggleSound,
    score
  } = useTeddyStore();

  const navItems: { id: WorldType; label: string; icon: React.ReactNode }[] = [
    { id: 'island', label: 'Teddy Island', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'memory', label: 'Memories', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'library', label: 'Dream Letters', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'playground', label: 'Playground', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'portfolio', label: 'My World', icon: <Code2 className="w-4 h-4" /> },
    { id: 'final', label: 'Moonlight', icon: <Moon className="w-4 h-4" /> },
  ];

  const themes: { id: EnvironmentTheme; label: string; icon: string }[] = [
    { id: 'dream', label: 'Dream', icon: '🌸' },
    { id: 'moonlight', label: 'Moonlight', icon: '🌙' },
    { id: 'sunset', label: 'Sunset', icon: '🌅' },
    { id: 'forest', label: 'Forest', icon: '🍃' },
  ];

  const handleNavigate = (targetWorld: WorldType) => {
    if (currentWorld === targetWorld) return;
    AudioManager.playPortalWarp();
    startWarpTransition(targetWorld);
  };

  const handleThemeChange = (theme: EnvironmentTheme) => {
    AudioManager.playClick();
    setEnvironmentTheme(theme);
  };

  const handleSoundToggle = () => {
    toggleSound();
    if (soundMuted) {
      AudioManager.startMelody();
    } else {
      AudioManager.stopMelody();
    }
  };

  // If in intro scene, keep UI minimal
  if (currentWorld === 'intro') {
    return (
      <header className="fixed top-5 right-5 z-40 flex items-center gap-3">
        <button
          onClick={handleSoundToggle}
          aria-label={soundMuted ? 'Unmute celestial melody' : 'Mute celestial melody'}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-pink-500/40 transition-all text-xs"
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
          <span>{soundMuted ? 'Muted' : 'Melody'}</span>
        </button>
      </header>
    );
  }

  return (
    <header className="fixed top-4 inset-x-0 z-40 px-4 pointer-events-none flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-between w-full max-w-5xl pointer-events-auto">
        
        {/* Left: Branding & Current World Indicator */}
        <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-lg">
          <span className="text-pink-400 text-sm font-semibold tracking-wider flex items-center gap-1.5 font-serif">
            <Compass className="w-4 h-4 animate-spin-slow text-pink-400" />
            TEDDYVERSE
          </span>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-xs text-slate-300 font-medium capitalize">
            {currentWorld === 'island' ? 'Island Center' : currentWorld}
          </span>
          {currentWorld === 'playground' && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-[11px] font-bold text-pink-300 flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              {score} pts
            </span>
          )}
        </div>

        {/* Center: Main World Navigation Dock */}
        <nav className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-2xl">
          {navItems.map((item) => {
            const isActive = currentWorld === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 font-semibold scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Environment Theme & Audio Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-lg">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              title={`${t.label} Theme`}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                environmentTheme === t.id
                  ? 'bg-pink-500/30 border border-pink-500/60 scale-110'
                  : 'hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              {t.icon}
            </button>
          ))}

          <span className="text-white/20 text-xs px-0.5">|</span>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            aria-label={soundMuted ? 'Unmute celestial melody' : 'Mute celestial melody'}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

      </div>
    </header>
  );
};

