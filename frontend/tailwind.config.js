/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brivoo: {
          bg: "#FAF7F2",
          card: "#F3EEE7",
          border: "#E6DFC5",
          dark: "#141414",
          charcoal: "#1A1A1A",
          muted: "#66625D",
          gold: "#C5A059",
          goldDark: "#A6823C",
          accent: "#B58A44",
          light: "#F7F3EE"
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
