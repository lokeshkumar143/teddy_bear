import React from 'react';
import { X, Feather } from 'lucide-react';
import { useTeddyStore } from '@/app/store';
import { AudioManager } from '@/audio/AudioManager';

export const BookLetterModal: React.FC = () => {
  const { books, activeBookId, setActiveBook } = useTeddyStore();

  if (!activeBookId) return null;

  const book = books.find((b) => b.id === activeBookId);
  if (!book) return null;

  const handleClose = () => {
    AudioManager.playClick();
    setActiveBook(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={handleClose}
    >
      <div 
        className="relative max-w-xl w-full bg-[#fdfbf7] text-[#2b2d42] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-rose-950/40 border-8 border-[#f4ece1]"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: 'radial-gradient(#e5d9c5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close letter modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Vintage Header */}
        <div className="flex items-center gap-2 text-rose-800 text-xs font-serif tracking-widest uppercase mb-1">
          <Feather className="w-4 h-4 text-rose-700" />
          <span>{book.subtitle}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950 mb-6 border-b-2 border-rose-900/10 pb-3">
          {book.title}
        </h3>

        {/* Handwritten Letter Body */}
        <div className="space-y-4 font-serif text-base sm:text-lg leading-relaxed text-stone-800 italic">
          {book.content.map((paragraph, idx) => (
            <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-rose-900">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Vintage Seal & Author */}
        <div className="mt-8 pt-4 border-t border-stone-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-serif shadow-inner">
              LK
            </div>
            <span className="text-xs font-serif text-stone-600">
              Pen of {book.author}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-1.5 rounded-full bg-rose-900 hover:bg-rose-800 text-rose-50 text-xs font-serif tracking-wide shadow transition-all hover:scale-105"
          >
            Fold Letter ✉️
          </button>
        </div>
      </div>
    </div>
  );
};

