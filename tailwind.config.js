/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "main-bg": "#4A352F",
        "second-bg": "#d8ceb8",
        "main-accent": "#e48a4e",
        "main-text": "#4A352F",
        "second-text" : "#d8ceb8"
      },
      fontFamily: {
        sans: ["Kumbh Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}