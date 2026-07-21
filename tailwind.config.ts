import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        custom: {
          black: "#000000",
          navy: "#14213d",
          amber: "#fca311",
          gray: "#e5e5e5",
          white: "#ffffff",
        },
        surface: {
          dim: "#121414",
          bright: "#38393a",
          container: {
            lowest: "#0d0f0f",
            low: "#1a1c1c",
            DEFAULT: "#1e2020",
            high: "#282a2b",
            highest: "#333535",
          }
        }
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
        "xl": "12px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
