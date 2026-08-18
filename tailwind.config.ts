import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Tailwind's smallest default breakpoint is sm:640px, which leaves every phone
      // (360–430px) on the same base styles as a 600px tablet. `xs` splits that range.
      screens: {
        xs: "475px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        brand: {
          50:  "#EFFFFB",
          100: "#D6FBF3",
          200: "#A9F3E5",
          300: "#72E6D3",
          400: "#35D6BE",
          500: "#0ECFB7",
          600: "#0DAF9B",
          700: "#0D9B8A",
          800: "#0F766E",
          900: "#115E59",
          950: "#042f2e",
        },
        ink: {
          DEFAULT: "#07090F",
          surface: "#0D1018",
          raised: "#0A0D14",
        },
        paper: {
          DEFAULT: "#F5F5F2",
          card: "#FFFFFF",
          border: "#E8E8E4",
        },
        cream: "#EAE6DF",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        "line-in": "lineIn 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
        flash: "flashError 0.25s ease",
        "slide-in-right": "slideInRight 0.25s cubic-bezier(0.22,1,0.36,1) both",
        shake: "shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-6px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(6px)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(28px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseGlow: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "0.6" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        lineIn: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        flashError: { "0%,100%": { background: "transparent" }, "50%": { background: "rgba(239,68,68,0.08)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(24px)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
