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
        background: "#07080B",
        canvas: "#07080B",
        surface: "#0D1017",
        "surface-card": "#131722",
        "surface-elevated": "#1A2030",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        "surface-border-subtle": "rgba(255, 255, 255, 0.04)",
        "surface-border-gold": "rgba(212, 175, 55, 0.22)",
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#E5A93C",
          600: "#D4AF37",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
          champagne: "#F5E6C8",
          glow: "#E5A93C",
        },
        amber: {
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        orange: {
          500: "#F97316",
          600: "#EA580C",
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(180deg, #E8B34E 0%, #D49B30 100%)',
        'gold-gradient-subtle': 'linear-gradient(180deg, rgba(229, 169, 60, 0.12) 0%, rgba(229, 169, 60, 0.04) 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(19, 23, 34, 0.9) 0%, rgba(13, 16, 23, 0.98) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 2px 12px -2px rgba(229, 169, 60, 0.15)',
        'gold-glow-lg': '0 4px 20px -3px rgba(229, 169, 60, 0.2)',
        'cinema-card': '0 8px 24px -6px rgba(0, 0, 0, 0.6)',
        'cinema-elevated': '0 16px 36px -10px rgba(0, 0, 0, 0.75)',
      }
    },
  },
  plugins: [],
}
