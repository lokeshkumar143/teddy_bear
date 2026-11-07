import { create } from 'zustand';

export type WorldType = 'intro' | 'island' | 'memory' | 'library' | 'playground' | 'portfolio' | 'final';
export type EnvironmentTheme = 'dream' | 'moonlight' | 'sunset' | 'forest';
export type TeddyAnimation = 
  | 'idle' 
  | 'wave' 
  | 'bothWave' 
  | 'jump' 
  | 'hug' 
  | 'sit' 
  | 'sleep' 
  | 'dance' 
  | 'heartPulse' 
  | 'shy' 
  | 'surprise' 
  | 'happy';

export type TeddyOutfit = 'classic' | 'hoodie' | 'pajamas' | 'formal' | 'winter' | 'fantasy';
export type TeddyAccessory = 'none' | 'glasses' | 'hat' | 'scarf' | 'backpack' | 'necklace';

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
}

export interface BookItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  color: string;
  content: string[];
}

interface TeddyVerseState {
  currentWorld: WorldType;
  previousWorld: WorldType;
  environmentTheme: EnvironmentTheme;
  isWarping: boolean;
  
  // Teddy State
  teddyAnimation: TeddyAnimation;
  outfit: TeddyOutfit;
  accessory: TeddyAccessory;
  teddyInteractionCount: number;
  lastReactionMessage: string;

  // Audio State
  soundMuted: boolean;
  soundVolume: number;

  // Playground Mini-Game State
  score: number;
  starsCollected: number;
  heartsCollected: number;
  highScore: number;

  // Memory Galaxy State
  memories: MemoryItem[];
  activeMemoryId: string | null;

  // Dream Library State
  books: BookItem[];
  activeBookId: string | null;

  // Actions
  setWorld: (world: WorldType) => void;
  setEnvironmentTheme: (theme: EnvironmentTheme) => void;
  setTeddyAnimation: (anim: TeddyAnimation) => void;
  setOutfit: (outfit: TeddyOutfit) => void;
  setAccessory: (accessory: TeddyAccessory) => void;
  triggerTeddyReaction: (message?: string) => void;
  setSoundMuted: (muted: boolean) => void;
  toggleSound: () => void;
  setSoundVolume: (vol: number) => void;
  addScore: (points: number, type: 'star' | 'heart') => void;
  resetPlayground: () => void;
  setActiveMemory: (id: string | null) => void;
  addCustomMemory: (memory: MemoryItem) => void;
  setActiveBook: (id: string | null) => void;
  startWarpTransition: (targetWorld: WorldType, callback?: () => void) => void;
}

export const useTeddyStore = create<TeddyVerseState>((set, get) => ({
  currentWorld: 'intro',
  previousWorld: 'intro',
  environmentTheme: 'moonlight',
  isWarping: false,

  teddyAnimation: 'idle',
  outfit: 'classic',
  accessory: 'none',
  teddyInteractionCount: 0,
  lastReactionMessage: '',

  soundMuted: false,
  soundVolume: 0.7,

  score: 0,
  starsCollected: 0,
  heartsCollected: 0,
  highScore: 0,

  memories: [
    {
      id: 'loki-main',
      title: 'Our Best Friend Loki',
      date: 'Celestial Keepsake',
      caption: 'A smile that lights up the entire galaxy. True warmth and eternal friendship.',
      imageUrl: 'assets/loki-portrait.jpg'
    },
    {
      id: 'mem-1',
      title: 'Moments of Pure Joy',
      date: 'Under the Stars',
      caption: 'In a world of fleeting moments, having someone special brings peace and comfort.',
      imageUrl: 'assets/teddy-1-clean.png'
    },
    {
      id: 'mem-2',
      title: 'Sweet Dreams & Quiet Nights',
      date: 'Moonlight Hour',
      caption: 'Soft lullabies, starry skies, and quiet thoughts that always find their way to you.',
      imageUrl: 'assets/teddy-2-clean.png'
    },
    {
      id: 'mem-3',
      title: 'Love That Floats High',
      date: 'Infinite Sky',
      caption: 'Like balloons drifting above the clouds, happiness rises wherever you are.',
      imageUrl: 'assets/teddy-4-standing-clean.png'
    }
  ],
  activeMemoryId: null,

  books: [
    {
      id: 'book-dedication',
      title: 'Letter To Loki',
      subtitle: 'From the heart of the cosmos',
      author: 'Lokesh Kumar',
      color: '#e63946',
      content: [
        "Dear Loki,",
        "In a vast galaxy with billions of stars, finding someone who brings genuine warmth and joy into your life is the greatest wonder.",
        "This entire interactive 3D universe was built line by line, thought by thought, just for you.",
        "Whenever the world feels loud or overwhelming, remember this little island among the stars is always here to welcome you.",
        "Sending you infinite smiles, peace, and love.",
        "— Yours always, Lokesh Kumar"
      ]
    },
    {
      id: 'book-wisdom',
      title: 'Starlight Whispers',
      subtitle: 'Ancient Celestial Tales',
      author: 'Cosmic Chronicler',
      color: '#457b9d',
      content: [
        "They say every star you see at night was once a wish made by someone with a kind soul.",
        "When the teddy hugs the heart, a new star is born in the upper sky.",
        "May your days be as gentle as clouds, and your nights as peaceful as the starry sea."
      ]
    },
    {
      id: 'book-adventure',
      title: 'The Island of Teddy',
      subtitle: 'Chronicles of Wonder',
      author: 'The Starlight Navigator',
      color: '#2a9d8f',
      content: [
        "Beyond the nebula gates lies an island where moss never fades, waterfalls sing melodies, and fireflies dance with little teddy bears.",
        "Here, every hug gives energy to the flowers, and every song makes the glowing mushrooms sparkle.",
        "Step lightly, dream deeply, and stay as long as you wish."
      ]
    }
  ],
  activeBookId: null,

  setWorld: (world) => set((state) => ({ 
    previousWorld: state.currentWorld, 
    currentWorld: world 
  })),

  setEnvironmentTheme: (theme) => set({ environmentTheme: theme }),
  
  setTeddyAnimation: (anim) => set({ teddyAnimation: anim }),

  setOutfit: (outfit) => set({ outfit }),

  setAccessory: (accessory) => set({ accessory }),

  triggerTeddyReaction: (message) => {
    const defaultMessages = [
      'Teddy hugs you tightly! 💖',
      'Teddy says: You are wonderful, Loki! ✨',
      'Teddy twirls with excitement! 🌸',
      'Sending a warm heartbeat to your soul! 💓',
      'Teddy waves both hands joyfully! 👋🧸',
      'You found a secret starlight spark! 🌟'
    ];
    const msg = message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
    const reactions: TeddyAnimation[] = ['wave', 'bothWave', 'jump', 'hug', 'dance', 'heartPulse', 'happy', 'shy'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

    set((state) => ({
      teddyAnimation: randomReaction,
      teddyInteractionCount: state.teddyInteractionCount + 1,
      lastReactionMessage: msg
    }));
  },

  setSoundMuted: (muted) => set({ soundMuted: muted }),

  toggleSound: () => set((state) => ({ soundMuted: !state.soundMuted })),

  setSoundVolume: (vol) => set({ soundVolume: Math.max(0, Math.min(1, vol)) }),

  addScore: (points, type) => set((state) => {
    const newScore = state.score + points;
    return {
      score: newScore,
      highScore: Math.max(state.highScore, newScore),
      starsCollected: type === 'star' ? state.starsCollected + 1 : state.starsCollected,
      heartsCollected: type === 'heart' ? state.heartsCollected + 1 : state.heartsCollected,
    };
  }),

  resetPlayground: () => set({ score: 0, starsCollected: 0, heartsCollected: 0 }),

  setActiveMemory: (id) => set({ activeMemoryId: id }),

  addCustomMemory: (memory) => set((state) => ({
    memories: [memory, ...state.memories],
    activeMemoryId: memory.id
  })),

  setActiveBook: (id) => set({ activeBookId: id }),

  startWarpTransition: (targetWorld, callback) => {
    set({ isWarping: true });
    setTimeout(() => {
      set((state) => ({
        previousWorld: state.currentWorld,
        currentWorld: targetWorld,
        isWarping: false
      }));
      if (callback) callback();
    }, 1100);
  }
}));

