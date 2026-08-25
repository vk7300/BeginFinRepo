/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beginfin-blue': '#5656D4',
        'beginfin-primary': '#5656D4',
        brand: {
          50: '#F5F5FE',
          100: '#ECECFC',
          200: '#DCDCFB',
          300: '#C3C3F8',
          400: '#7F7FFA',
          500: '#6868EB',
          600: '#5656D4',
          700: '#4343B2',
          800: '#353590',
          900: '#262670',
        },
        indigo: {
          50: '#F5F5FE',
          100: '#ECECFC',
          200: '#DCDCFB',
          300: '#C3C3F8',
          400: '#7F7FFA',
          500: '#6868EB',
          600: '#5656D4', // Primary interactive base (5.71:1 on white, passes AA)
          700: '#4343B2', // Hover state (7.82:1 on white, passes AAA)
          800: '#353590',
          900: '#262670',
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
