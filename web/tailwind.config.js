/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3",
          800: "#312E81",
          900: "#1E1B4B",
        },
        info: {
          400: "#38BDF8",
          500: "#0284C7",
          600: "#0369A1",
        },
        accent: {
          400: "#22D3EE",
          500: "#06B6D4",
        },
        surface: "#FFFFFF",
        canvas: "#F4F7FB",
        ink: {
          DEFAULT: "#0B1220",
          soft: "#5B6B80",
        },
        line: "#E2E8F0",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 10px 28px -16px rgba(79,70,229,0.22)",
        pop: "0 16px 40px -16px rgba(11,18,32,0.28)",
        glow: "0 0 0 4px rgba(79,70,229,0.12)",
      },
      backgroundImage: {
        ai: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        "ai-soft": "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 52%, #ECFEFF 100%)",
        "hero-grid": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.16), transparent)",
        mesh:
          "radial-gradient(38rem 22rem at 92% -8%, rgba(124,58,237,0.10), transparent), radial-gradient(30rem 20rem at -6% 18%, rgba(37,99,235,0.08), transparent)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
