/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kollektif', 'sans-serif'],
        kollektif: ['Kollektif', 'sans-serif'],
        'kollektif-bold': ['Kollektif-Bold', 'sans-serif'],
        'kollektif-italic': ['Kollektif-Italic', 'sans-serif'],
      },
      colors: {
        // Keep in sync with constants/theme.ts — that file is for raw JS
        // values (style props, shadow objects); these are for className use.
        brand: {
          text: '#00212C',
          muted: '#656565',
          placeholder: '#9a9a9a',
          primary: '#007CA6',
          button: '#0089b8',
          accent: '#fdbb36',
          dark: '#003F55',
          border: '#CFC5B3',
          error: '#c0392b',
          errorDark: '#e57373',
          bg: '#f5f7f8',
          authBg: '#00202b',
          cardBorder: '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
};
