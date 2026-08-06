import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#040A17', // Deep Midnight Blue
        card: '#0C1426', // Rich Slate Navy Card
        'card-hover': '#15243F',
        accent: '#B58C2A', // Dark Gold
        'accent-dark': '#7E6219',
        'accent-light': '#E5C66A',
        steel: '#2F5C9F', // Industrial Blue
        'steel-dark': '#1C3768',
        text: '#F3F6FD',
        muted: '#91A3BE',
        border: 'rgba(181, 140, 42, 0.18)',
        'blue-900': '#06112A',
        'blue-800': '#0B1C45',
        'blue-700': '#173575',
        'gold-700': '#8C6A1F',
        'gold-600': '#A67E28',
        'gold-500': '#C29A36',
        'gold-400': '#D8B76A',
        surface: '#101C34',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'gold-glow': '0 0 18px -6px rgba(197, 152, 48, 0.5)',
        'gold-glow-lg': '0 0 30px -8px rgba(197, 152, 48, 0.55)',
        'blue-glow': '0 0 18px -6px rgba(38, 77, 145, 0.55)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        panel: '0 10px 30px -20px rgba(0, 0, 0, 0.9)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #E5C66A 0%, #B58C2A 50%, #7E6219 100%)',
        'gradient-navy': 'linear-gradient(180deg, #0A1633 0%, #040A17 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(12, 20, 38, 0.88) 0%, rgba(7, 13, 29, 0.94) 100%)',
        'gradient-steel': 'linear-gradient(135deg, #2F5C9F 0%, #1C3768 100%)',
        'gradient-industrial': 'linear-gradient(120deg, rgba(12, 20, 38, 0.96) 0%, rgba(23, 53, 117, 0.34) 54%, rgba(181, 140, 42, 0.22) 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3.2s infinite ease-in-out',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 2.8s infinite linear',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px -1px rgba(181, 140, 42, 0.22)' },
          '50%': { boxShadow: '0 0 24px 2px rgba(181, 140, 42, 0.42)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 48px' },
        },
      },
    },
  },
  plugins: [],
}
export default config