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
          bg: '#0a0f1d',
          card: '#111827',
          panel: '#151d30',
          border: '#1f293d',
          accent: '#06b6d4',
          emerald: '#10b981',
          gold: '#f59e0b',
          rose: '#f43f5e',
          sky: '#38bdf8',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
