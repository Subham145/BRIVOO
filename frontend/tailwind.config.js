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
          bg: "#FBF6F0",
          card: "#F2E5D8",
          border: "#E9DED5",
          dark: "#211A18",
          charcoal: "#211A18",
          muted: "#746963",
          gold: "#D6A63A",
          goldDark: "#B58726",
          accent: "#D6A63A",
          light: "#FBF6F0",
          maroon: "#781C35",
          maroonDark: "#541326",
          maroonLight: "#962645",
          cream: "#FBF6F0",
          beige: "#F2E5D8",
        },
        maroon: {
          DEFAULT: "#781C35",
          dark: "#541326",
          light: "#962645",
          50: "#FAF0F2",
          100: "#F5DFE4",
          200: "#EAC0CB",
          500: "#781C35",
          600: "#6B182F",
          700: "#541326",
          800: "#410F1D",
          900: "#2E0A14",
        },
        cream: {
          DEFAULT: "#FBF6F0",
          50: "#FFFFFF",
          100: "#FDFBF7",
          200: "#FBF6F0",
          300: "#F2E5D8",
          400: "#E9DED5",
        },
        gold: {
          DEFAULT: "#D6A63A",
          light: "#E5BE5E",
          dark: "#B88927",
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
        'luxury': '0 10px 30px -5px rgba(120, 28, 53, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'xs': '2px',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
