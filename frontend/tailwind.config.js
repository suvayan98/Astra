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
          bg: '#101113',
          secondary: '#16171A',
          card: '#1A1B1E',
          elevated: '#242529',
          dark: '#101113',
          surface: '#1A1B1E',
          border: '#282A2E',
          borderSubtle: '#202225',
          muted: '#71717A',
          textSecondary: '#A1A1AA',
          textPrimary: '#F4F4F5',
          accent: '#06B6D4',
          accentDark: '#0891B2',
          cyan: '#06B6D4',
          emerald: '#10B981',
          blue: '#3B82F6',
          amber: '#F59E0B',
          coral: '#EF4444',
          rose: '#F43F5E',
          indigo: '#6366F1'
        },
        primary: {
          DEFAULT: '#101113',
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#101113'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
}
