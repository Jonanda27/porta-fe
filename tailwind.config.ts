import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        harbor: {
          950: "#0A1C17", // Ultra Deep Spruce Obsidian
          900: "#0F2E26", // Deep Harbor Spruce Green (Primary Navigation & Authority)
          800: "#174338", // Lighter Spruce Hover
          700: "#1F594B",
          600: "#2B7A67",
          100: "#E3ECE8",
          50: "#F1F6F4",
        },
        signal: {
          amber: "#D97706", // Maritime Safety Amber / Beacon Gold
          "amber-hover": "#B45309",
          "amber-light": "#FEF3C7",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Avenir Next", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
