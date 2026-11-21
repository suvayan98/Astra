/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terra: {
          bg: '#07111F',
          secondary: '#0D1928',
          card: '#111F30',
          elevated: '#17283A',
          dark: '#07111F',
          surface: '#111F30',
          border: '#1E2D42',
          muted: '#94A3B8',
          cyan: '#22D3EE',
          emerald: '#34D399',
          blue: '#60A5FA',
          amber: '#FBBF24',
          coral: '#F87171',
          rose: '#F87171',
          indigo: '#818CF8'
        },
        primary: {
          DEFAULT: '#07111F',
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#334155',
          600: '#1E293B',
          700: '#17283A',
          800: '#111F30',
          900: '#0D1928',
          950: '#07111F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'orbit 20s linear infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
