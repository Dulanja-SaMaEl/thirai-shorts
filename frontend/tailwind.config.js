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
        'gold-gradient': 'linear-gradient(135deg, #FDE047 0%, #E5A93C 50%, #D97706 100%)',
        'gold-gradient-subtle': 'linear-gradient(135deg, rgba(253, 224, 71, 0.15) 0%, rgba(229, 169, 60, 0.08) 50%, transparent 100%)',
        'gold-glow': 'radial-gradient(circle, rgba(229, 169, 60, 0.18) 0%, rgba(7, 8, 11, 0) 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(19, 23, 34, 0.85) 0%, rgba(13, 16, 23, 0.95) 100%)',
        'cinema-radial': 'radial-gradient(ellipse at 50% 0%, rgba(229, 169, 60, 0.12) 0%, rgba(7, 8, 11, 0) 75%)',
      },
      boxShadow: {
        'gold-glow': '0 4px 20px -2px rgba(229, 169, 60, 0.25)',
        'gold-glow-lg': '0 8px 32px -4px rgba(229, 169, 60, 0.35)',
        'cinema-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'cinema-elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(229, 169, 60, 0.15)',
      }
    },
  },
  plugins: [],
}
