/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom': {
          DEFAULT: '#171936',
          50: '#E8E9F0',
          100: '#C5C7DB',
          200: '#A2A5C6',
          300: '#7F83B1',
          400: '#5C619C',
          500: '#171936',
          600: '#14152E',
          700: '#111226',
          800: '#0E0F1E',
          900: '#0B0C16',
        },
      },
    },
  },
  plugins: [],
};
