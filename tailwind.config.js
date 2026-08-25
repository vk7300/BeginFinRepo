/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beginfin-blue': '#94a4ff',
        indigo: {
          50: '#f5f6ff',
          100: '#ebedff',
          200: '#d1d7ff',
          300: '#b5c0ff',
          400: '#a4b2ff',
          500: '#94a4ff', // Core BeginFin Blue
          600: '#7888e0', // Indigo-600 / hover state base
          700: '#5e6ec7', // Indigo-700
          800: '#4554ab',
          900: '#2e3b8f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
