/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#050614',
          deep: '#0a0d24',
          card: 'rgba(18, 22, 50, 0.65)',
          border: 'rgba(255, 255, 255, 0.12)',
          accent: '#ff5c8a',
          gold: '#ffd166',
          cyan: '#06d6a0',
          purple: '#a78bfa'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cursive: ['Caveat', 'Alex Brush', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(255, 92, 138, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(255, 92, 138, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
