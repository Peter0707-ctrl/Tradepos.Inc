import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E1FFAC",
          50: "#FAFFF0",
          100: "#F4FFE0",
          200: "#EAFEC0",
          300: "#E1FFAC",
          400: "#CEFA82",
          500: "#B8F057",
          600: "#98D631",
          700: "#75A822",
          800: "#557D19",
          900: "#365010",
        },
        surface: {
          DEFAULT: "#F4F6F0",
          card: "#F8FAF5",
          inset: "#EBF0E4",
          border: "#DDE5D4",
        },
        charcoal: {
          DEFAULT: "#1E241E",
          muted: "#4A554A",
          subtle: "#758275",
        }
      },
      fontFamily: {
        sans: ['"Segoe UI Variable"', '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        'neu-flat': '6px 6px 14px rgba(180, 195, 170, 0.35), -6px -6px 14px rgba(255, 255, 255, 0.9)',
        'neu-raised': '8px 8px 18px rgba(175, 190, 165, 0.38), -8px -8px 18px rgba(255, 255, 255, 0.95)',
        'neu-pressed': 'inset 4px 4px 8px rgba(180, 195, 170, 0.35), inset -4px -4px 8px rgba(255, 255, 255, 0.85)',
        'neu-card': '5px 5px 12px rgba(190, 205, 180, 0.28), -5px -5px 12px rgba(255, 255, 255, 0.9)',
        'neu-accent': '0 8px 20px rgba(180, 230, 100, 0.35)',
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
