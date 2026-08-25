/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand system from the spec (§3). Purple is primary, blue secondary.
        brand: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7C3AED", // primary purple
          600: "#6D28D9",
          700: "#5B21B6", // deep purple
          800: "#4C1D95",
          900: "#3B0764",
        },
        info: {
          400: "#3B82F6", // light blue
          500: "#2563EB", // blue (secondary actions, links, analytics)
          600: "#1D4ED8",
        },
        surface: "#FFFFFF",
        canvas: "#F8FAFC", // page background
        ink: {
          DEFAULT: "#0F172A", // dark text
          soft: "#64748B", // secondary text
        },
        line: "#E2E8F0", // borders
      },
      fontFamily: {
        // Deliberate pairing: Space Grotesk for headings/numerals (a technical,
        // geometric face suited to a meeting-intelligence product), Inter for body.
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Premium detail: 14–16px rounded corners (§59).
        xl: "14px",
        "2xl": "16px",
      },
      boxShadow: {
        // Soft, low-contrast shadows — not the default Tailwind harshness.
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)",
        pop: "0 8px 32px -8px rgba(15,23,42,0.18)",
      },
      backgroundImage: {
        // Reserved for AI elements ONLY (§59) — not general decoration.
        ai: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
      },
    },
  },
  plugins: [],
};
