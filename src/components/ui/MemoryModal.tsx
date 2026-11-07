import React, { useRef } from 'react';
import { X, Upload, Heart, Calendar } from 'lucide-react';
import { useTeddyStore } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const MemoryModal: React.FC = () => {
  const { memories, activeMemoryId, setActiveMemory, addCustomMemory } = useTeddyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeMemoryId) return null;

  const memory = memories.find((m) => m.id === activeMemoryId);
  if (!memory) return null;

  const handleClose = () => {
    AudioManager.playClick();
    setActiveMemory(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        AudioManager.playStarCollect();
        addCustomMemory({
          id: `custom-${Date.now()}`,
          title: 'Special Memory',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          caption: 'A cherished moment captured in the cosmos.',
          imageUrl: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
      onClick={handleClose}
    >
      <div 
        className="relative max-w-lg w-full bg-slate-950/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close memory modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Polarized Image Container */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 mb-4 max-h-80 flex items-center justify-center">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Memory Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {memory.date}
            </span>
            <span className="flex items-center gap-1 text-pink-400">
              <Heart className="w-3.5 h-3.5 fill-pink-400" />
              Cherished Moment
            </span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-wide font-serif">
            {memory.title}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed font-light">
            "{memory.caption}"
          </p>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all hover:scale-105"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Your Own Photo</span>
            </button>

            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors"
            >
              Back to Galaxy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
