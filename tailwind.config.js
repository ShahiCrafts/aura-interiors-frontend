/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ['"Lato"', "sans-serif"],
        playfair: ['"Playfair Display"', "serif"],
      },
      colors: {
        // Primary brand color - Teal (used for buttons, links, accents)
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e", // Main brand color (replaces teal-700)
          800: "#115e59", // Hover state (replaces teal-800)
          900: "#134e4a",
          950: "#042f2e",
        },
        // Secondary brand color - Amber (used for logo, badges)
        secondary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Badge color (replaces amber-500)
          600: "#d97706",
          700: "#b45309",
          800: "#92400e", // Logo color (replaces amber-800)
          900: "#78350f",
          950: "#451a03",
        },
        // Accent color - Sage green (for subtle accents)
        accent: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
    },
  },
  plugins: [],
};
