import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        navy: "#0B1120",
        accent: "#00A8E8",
      },
    },
  },
  plugins: [],
};
export default {
content: [
"./app/**/*.{ts,tsx}",
"./components/**/*.{ts,tsx}",
],
theme: {
extend: {
colors: {
brand: {
DEFAULT: "#06B6D4", // cyan‑600 vibe for CTA
50: "#ECFEFF",
100: "#CFFAFE",
200: "#A5F3FC",
300: "#67E8F9",
400: "#22D3EE",
500: "#06B6D4",
600: "#0891B2",
700: "#0E7490",
800: "#155E75",
900: "#164E63",
},
surface: "#0F1116", // near‑black background
ink: "#E6E8EC", // subtle light ink
},
boxShadow: {
soft: "0 8px 30px rgba(0,0,0,0.12)",
},
borderRadius: {
xl2: "1.25rem",
},
},
},
plugins: [],
};
