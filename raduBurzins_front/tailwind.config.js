/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial'],
      },
      colors: {
        'dark-purple': '#2d232e',
        'medium-purple': '#474448',
        'light-purple': '#534b52',
        'off-white': '#f1f0ea',
        'warm-beige': '#e0ddcf',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(120deg, #474448, #2d232e)',
        'gradient-light': 'linear-gradient(145deg, #f1f0ea, #e0ddcf)',
        'gradient-hover': 'linear-gradient(120deg, #534b52, #474448)',
      },
      zIndex: {
        'base': '1',
        'overlay': '900',
        'modal': '1000',
        'profile': '1100',
        'tooltip': '2000',
      },
    },
  },
  plugins: [],
}
