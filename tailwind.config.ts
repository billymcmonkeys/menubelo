import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#F3F7F1",
          100: "#E2EDE0",
          200: "#C5D9C0",
          300: "#9DC195",
          400: "#72A568",
          500: "#4D8A42",
          600: "#3D7034",
          700: "#2E5527",
          800: "#1F3A1B",
          900: "#111F0F",
        },
        cream: {
          50: "#FFFDF7",
          100: "#FFF8EC",
          200: "#FFF0D5",
          300: "#FFE5B8",
        },
        peach: {
          50: "#FFF5F0",
          100: "#FFE8DC",
          200: "#FFCDB5",
          300: "#FFAB87",
          400: "#FF8A57",
          500: "#F06830",
        },
        neutral: {
          0: "#FFFFFF",
          100: "#F5F5F2",
          300: "#D1D0CC",
          500: "#8A8880",
          700: "#4A4845",
          900: "#1A1916",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(26,25,22,0.06), 0 0 1px rgba(26,25,22,0.04)",
        md: "0 2px 6px rgba(26,25,22,0.08), 0 0 2px rgba(26,25,22,0.04)",
        lg: "0 4px 16px rgba(26,25,22,0.10), 0 1px 4px rgba(26,25,22,0.06)",
        xl: "0 8px 32px rgba(26,25,22,0.12), 0 2px 8px rgba(26,25,22,0.06)",
        "2xl": "0 16px 48px rgba(26,25,22,0.16), 0 4px 12px rgba(26,25,22,0.08)",
        brand: "0 4px 16px rgba(77,138,66,0.18), 0 1px 4px rgba(77,138,66,0.10)",
        inset: "inset 0 1px 3px rgba(26,25,22,0.10)",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
      },
      spacing: {
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
        in: "cubic-bezier(0.4, 0.0, 1.0, 1.0)",
        "in-out": "cubic-bezier(0.4, 0.0, 0.2, 1.0)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1.0)",
      },
      transitionDuration: {
        instant: "50ms",
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
        slowest: "600ms",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
