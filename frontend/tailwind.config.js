/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        isro: {
          blue: '#002B49',
          orange: '#FF671F',
          green: '#046A38',
          sky: '#007ACC',
          dark: '#0A192F',
        }
      }
    },
  },
  plugins: [],
}
