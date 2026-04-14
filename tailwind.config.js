/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E0F2F1', // rgb(224, 242, 241)
          DEFAULT: '#00796B', // Teal
          dark: '#004D40',
        },
        secondary: {
          DEFAULT: '#0288D1', // Blue
        },
      },
    },
  },
  plugins: [],
}