import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0B0B0B',
        card: '#111111',
        cyberGreen: '#FF007A',
        cyberGlow: '#A855F7',
        cyberYellow: '#FFD54A',
        cyberDark: '#080808',
        cyberBorder: 'rgba(255, 0, 122, 0.12)',
        cyberBorderGlow: 'rgba(168, 85, 247, 0.25)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'Geist', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 10px rgba(255, 0, 122, 0.25), 0 0 20px rgba(255, 0, 122, 0.1)',
        neonGlow: '0 0 12px rgba(168, 85, 247, 0.3), 0 0 24px rgba(168, 85, 247, 0.15)',
        neonYellow: '0 0 12px rgba(255, 213, 74, 0.2), 0 0 24px rgba(255, 213, 74, 0.1)',
        glass: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px 0 rgba(0, 0, 0, 0.7)',
        cyberCard: '0 0 12px rgba(255, 0, 122, 0.08), inset 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        card: '24px',
        input: '20px',
        button: '999px'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'blink': 'blink 4s infinite',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        blink: {
          '0%, 96%, 100%': { transform: 'scaleY(1)' },
          '98%': { transform: 'scaleY(0.1)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
