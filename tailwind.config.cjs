/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Existing component accents use emerald utilities; map them centrally
        // to the new violet identity while components migrate to semantic tokens.
        emerald: {
          50: '#f5f3ff', 100: '#ece8ff', 200: '#d9d2ff', 300: '#c7beff',
          400: '#b8acfb', 500: '#6655b5', 600: '#5847a1', 700: '#483b87',
          800: '#483b87', 900: '#30275d', 950: '#211b42'
        },
        teal: {
          50: '#f5f3ff', 100: '#ece8ff', 200: '#d9d2ff', 300: '#c7beff',
          400: '#b8acfb', 500: '#6655b5', 600: '#5847a1', 700: '#483b87',
          800: '#483b87', 900: '#30275d', 950: '#211b42'
        },
        night: {
          background: '#101827',
          sidebar: '#111B2A',
          surface: '#192537',
          border: '#304058',
          primary: '#A394F5',
          selected: '#494B83',
          gold: '#E3BD79',
          text: '#F5F3F0',
          muted: '#BAC2D0'
        },
        wird: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        slate: {
          850: '#172033',
          950: '#0b1120'
        }
      },
      fontFamily: {
        sans: [
          'Readex Pro',
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
}

