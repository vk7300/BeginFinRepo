/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beginfin-blue': '#7F7FFA',
        'beginfin-primary': '#7F7FFA',
        brand: {
          50: '#F5F5FE',
          100: '#ECECFC',
          200: '#DCDCFB',
          300: '#C3C3F8',
          400: '#A1A1F6',
          500: '#7F7FFA',
          600: '#6868EB',
          700: '#5656D4',
          800: '#4343B2',
          900: '#353590',
        },
        indigo: {
          50: '#F5F5FE',
          100: '#ECECFC',
          200: '#DCDCFB',
          300: '#C3C3F8',
          400: '#A1A1F6',
          500: '#7F7FFA', // Core BeginFin Brand Primary #7F7FFA
          600: '#6868EB', // Primary interactive base
          700: '#5656D4', // Hover state
          800: '#4343B2',
          900: '#353590',
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
