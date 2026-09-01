/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./assets/js/**/*.js",
    "./src/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          accent: '#22d3ee', // Cyan-400
          accentMuted: 'rgba(34, 211, 238, 0.1)',
          bgDark: '#09090b', // Zinc-950
          cardDark: 'rgba(24, 24, 27, 0.6)', // Zinc-900 con opacidad
          borderDark: '#27272a', // Zinc-800
        }
      }
    },
  },
  plugins: [],
}
