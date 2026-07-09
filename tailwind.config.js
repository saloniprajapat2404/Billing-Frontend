/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66ff',
          600: '#2546eb',
          700: '#1d33d6',
          800: '#1c2bb3',
          900: '#1b278f',
          950: '#111757',
        },
      },
    },
  },
  plugins: [],
}
