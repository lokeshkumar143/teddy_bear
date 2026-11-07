import React, { useState } from 'react';
import { 
  Heart, 
  Hand, 
  Music, 
  Moon, 
  Sparkles, 
  Smile, 
  Shirt, 
  Glasses, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { useTeddyStore, TeddyAnimation, TeddyOutfit, TeddyAccessory } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const TeddyControlPanel: React.FC = () => {
  const { 
    currentWorld, 
    setTeddyAnimation, 
    outfit, 
    setOutfit, 
    accessory, 
    setAccessory, 
    triggerTeddyReaction, 
    lastReactionMessage 
  } = useTeddyStore();

  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);

  if (currentWorld !== 'island') return null;

  const handleAction = (anim: TeddyAnimation, sound: () => void, customMsg?: string) => {
    sound();
    setTeddyAnimation(anim);
    triggerTeddyReaction(customMsg);
  };

  const outfits: { id: TeddyOutfit; label: string; icon: string }[] = [
    { id: 'classic', label: 'Classic Fur', icon: '🧸' },
    { id: 'hoodie', label: 'Warm Hoodie', icon: '🧥' },
    { id: 'pajamas', label: 'Star Pajamas', icon: '✨' },
    { id: 'formal', label: 'Bowtie & Tux', icon: '🎩' },
    { id: 'winter', label: 'Winter Coat', icon: '❄️' },
    { id: 'fantasy', label: 'Cosmic Armor', icon: '⚔️' },
  ];

  const accessories: { id: TeddyAccessory; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '✖️' },
    { id: 'glasses', label: 'Cute Glasses', icon: '👓' },
    { id: 'hat', label: 'Beanie Hat', icon: '🧢' },
    { id: 'scarf', label: 'Warm Scarf', icon: '🧣' },
    { id: 'backpack', label: 'Explorer Bag', icon: '🎒' },
    { id: 'necklace', label: 'Heart Gem', icon: '💎' },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-30 flex flex-col items-center pointer-events-none px-4">
      
      {/* Floating Reaction Toast */}
      {lastReactionMessage && (
        <div className="mb-3 px-4 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-pink-500/40 text-pink-200 text-xs font-medium shadow-xl shadow-pink-500/20 animate-bounce pointer-events-auto flex items-center gap-2">
          <span>✨</span>
          <span>{lastReactionMessage}</span>
        </div>
      )}

      {/* Wardrobe Drawer (Expandable) */}
      {isWardrobeOpen && (
        <div className="mb-3 p-4 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl max-w-md w-full pointer-events-auto">
          <div className="mb-3">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block mb-2">
              Select Teddy Outfit
            </span>
            <div className="grid grid-cols-3 gap-2">
              {outfits.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    AudioManager.playClick();
                    setOutfit(o.id);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                    outfit === o.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{o.icon}</span>
                  <span className="truncate">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              Select Accessories
            </span>
            <div className="grid grid-cols-3 gap-2">
              {accessories.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    AudioManager.playClick();
                    setAccessory(a.id);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                    accessory === a.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{a.icon}</span>
                  <span className="truncate">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Control Glass Bar */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-2xl border border-white/15 p-2 rounded-full shadow-2xl pointer-events-auto">
        <button
          onClick={() => handleAction('wave', AudioManager.playClick, 'Teddy waves hello to you, Loki! 👋💖')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-pink-500/20 hover:text-pink-300 text-slate-200 text-xs font-medium transition-all"
        >
          <Hand className="w-3.5 h-3.5 text-amber-400" />
          <span>Wave</span>
        </button>

        <button
          onClick={() => handleAction('hug', AudioManager.playHeartBurst, 'Teddy gives you a big cozy cuddle! 🤗❤️')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-200 text-xs font-medium transition-all"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Hug Heart</span>
        </button>

        <button
          onClick={() => handleAction('dance', AudioManager.playStarCollect, 'Teddy grooves to the cosmic melody! 🎶💃')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 text-slate-200 text-xs font-medium transition-all"
        >
          <Music className="w-3.5 h-3.5 text-purple-400" />
          <span>Dance</span>
        </button>

        <button
          onClick={() => handleAction('jump', AudioManager.playStarCollect, 'Wheee! Teddy jumps with pure excitement! ⭐✨')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-200 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Jump</span>
        </button>

        <button
          onClick={() => handleAction('sleep', AudioManager.playClick, 'Shh... sweet dreams under the starry sky. 💤🌙')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-200 text-xs font-medium transition-all"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sleep</span>
        </button>

        <span className="text-white/20 text-xs px-1">|</span>

        {/* Wardrobe Toggle Button */}
        <button
          onClick={() => {
            AudioManager.playClick();
            setIsWardrobeOpen(!isWardrobeOpen);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
            isWardrobeOpen
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 text-pink-300'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Wardrobe</span>
          {isWardrobeOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

    </div>
  );
};
