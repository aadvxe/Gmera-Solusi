import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#7983ff", // Muted Purple
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#76c893", // Muted Green
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#f08a5d", // Muted Coral/Red
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#ffd166", // Muted Yellow
          foreground: "#2D3436",
        },
        info: {
          DEFAULT: "#62b6cb", // Muted Blue
          foreground: "#FFFFFF",
        },
        background: "#F8FAFC", // Cleaner light gray
        surface: "#FFFFFF",
        border: "#E2E8F0",
        text: {
          primary: "#1E293B", // Deeper blue-gray
          secondary: "#64748B",
          muted: "#94A3B8",
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
