/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080808',
          sidebar: '#0B0B0B',
          nav: '#080808',
          card: '#101010',
          'card-hover': '#141414',
          input: '#0D0D0D',
          text: '#F5F5F5',
          muted: '#A1A1AA',
          border: '#303030',
          blue: '#2589FF',
          positive: '#34D399',
          negative: '#FB7185',
          subtle: '#737373',
        },
        brand: {
          blue: '#1685F8',
          'blue-hover': '#0E6FD8',
          'blue-dark': '#0B59B3',
          'light-blue': '#BFE9FF',
          'pale-blue': '#E9F5FE',
          navy: '#10274A',
          bg: '#F1F9FF',
          mint: '#DDF8EE',
          green: '#16B890',
          'soft-red': '#FFE9EC',
          red: '#EF4444',
          slate: '#64748B',
          border: '#D8E9FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'clay-sm': '14px',
        'clay-md': '20px',
        'clay-lg': '24px',
        'clay-xl': '30px',
      },
      boxShadow: {
        'clay-card': '0 20px 40px -15px rgba(16, 39, 74, 0.07), 0 4px 12px -2px rgba(22, 133, 248, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        'clay-card-hover': '0 25px 50px -12px rgba(22, 133, 248, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
        'clay-btn': '0 10px 25px -5px rgba(22, 133, 248, 0.42), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
        'clay-btn-hover': '0 14px 28px -5px rgba(22, 133, 248, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
        'clay-input': 'inset 0 2px 4px 0 rgba(16, 39, 74, 0.04), 0 1px 2px 0 rgba(22, 133, 248, 0.04)',
        'clay-float': '0 30px 60px -20px rgba(16, 39, 74, 0.18), 0 12px 24px -8px rgba(22, 133, 248, 0.12)',
        'clay-green': '0 8px 20px -4px rgba(22, 184, 144, 0.35)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
