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
      screens: {
        'xs': '375px',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'xs': '2px',
      },
      fontFamily: {
        serif: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
