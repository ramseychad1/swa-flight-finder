/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'swa-blue': '#304CB2',
        'swa-yellow': '#FFBF27',
        'swa-red': '#C4262E',
      },
    },
  },
  plugins: [],
}
