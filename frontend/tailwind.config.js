/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#280812',
          dim: '#280812',
          bright: '#552d38',
          lowest: '#21040d',
          low: '#32101a',
          container: '#37141e',
          high: '#431e29',
          highest: '#502933',
        },
        'on-surface': {
          DEFAULT: '#ffd9e0',
          variant: '#dac0c2'
        },
        wine: {
          950: '#1D050D',
          900: '#2A0A14',
          850: '#280812',
          800: '#431220',
          700: '#6B1E2E',
          600: '#8A263B',
          500: '#994251'
        },
        gold: {
          light: '#F0D9A0',
          DEFAULT: '#D4AF6A',
          dark: '#9E7836',
          deep: '#785623',
          pale: '#F7E8C3',
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDEFC2',
          300: '#FCE49E',
          400: '#F9D154',
          500: '#D4AF6A',
          600: '#B48A3F',
          700: '#9E7836',
          800: '#785623'
        },
        secondary: {
          DEFAULT: '#e8c17a',
          container: '#5c4205',
          fixed: '#ffdea5',
          'fixed-dim': '#e8c17a',
          on: '#412d00'
        },
        tertiary: {
          DEFAULT: '#dbc58d',
          container: '#bea974',
          fixed: '#f8e1a7',
          'fixed-dim': '#dbc58d'
        },
        ivory: {
          DEFAULT: '#FBF6EE',
          surface: '#F4ECE0',
          muted: '#E9DEC9'
        },
        charcoal: {
          DEFAULT: '#26211E',
          muted: '#625852',
          light: '#8E827B'
        },
        outline: {
          DEFAULT: '#a28b8d',
          variant: '#544244'
        }
      },
      fontFamily: {
        serif: ['"EB Garamond"', '"Cormorant Garamond"', 'Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'floating-gold': '0 18px 36px -10px rgba(212, 175, 106, 0.28), 0 8px 18px -6px rgba(42, 10, 20, 0.45)',
        'floating-card': '0 20px 40px -12px rgba(42, 10, 20, 0.35), 0 8px 16px -6px rgba(42, 10, 20, 0.25)',
        'deep-3d': '0 26px 50px -12px rgba(23, 4, 9, 0.65), 0 12px 24px -8px rgba(0, 0, 0, 0.55)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        'glass-inset-dark': 'inset 0 1px 1px 0 rgba(240, 217, 160, 0.25)'
      }
    },
  },
  plugins: [],
}
