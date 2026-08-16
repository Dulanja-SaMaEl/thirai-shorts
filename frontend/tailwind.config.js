/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0A0A0C",
        "surface-card": "#121216",
        "surface-border": "#22222A",
        gold: {
          400: "#FACC15",
          500: "#D4AF37",
          600: "#CA8A04",
          700: "#A16207",
          glow: "#FFD700"
        },
        amber: {
          500: "#F59E0B",
          600: "#D97706"
        },
        orange: {
          500: "#FF8C00",
          600: "#EA580C"
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #F59E0B 50%, #FF8C00 100%)',
        'gold-glow': 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(0,0,0,0) 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(20,20,26,0.8) 0%, rgba(10,10,12,0.95) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.4)',
        'gold-glow-lg': '0 0 35px -2px rgba(255, 215, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
