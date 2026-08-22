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
        // Existing main app tokens
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
        },
        // Membre interface design tokens (Unified with main application)
        bg: "#0d0e0e",
        card: "#141515",
        "card-hover": "#1e2020",
        accent: "#fca311",
        "accent-dark": "#d48508",
        "accent-light": "#ffc887",
        steel: "#fca311",
        "steel-dark": "#d48508",
        text: "#ffffff",
        muted: "#888888",
        "blue-900": "#141515",
        "blue-800": "#1e2020",
        "blue-700": "#2a2c2c",
        "gold-700": "#d48508",
        "gold-600": "#e59400",
        "gold-500": "#fca311",
        "gold-400": "#ffc887",
        membre_surface: "#141515",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
        "xl": "12px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 18px -6px rgba(197, 152, 48, 0.5)",
        "gold-glow-lg": "0 0 30px -8px rgba(197, 152, 48, 0.55)",
        "blue-glow": "0 0 18px -6px rgba(38, 77, 145, 0.55)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        panel: "0 10px 30px -20px rgba(0, 0, 0, 0.9)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #E5C66A 0%, #B58C2A 50%, #7E6219 100%)",
        "gradient-navy": "linear-gradient(180deg, #0A1633 0%, #040A17 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(12, 20, 38, 0.88) 0%, rgba(7, 13, 29, 0.94) 100%)",
        "gradient-steel": "linear-gradient(135deg, #2F5C9F 0%, #1C3768 100%)",
        "gradient-industrial": "linear-gradient(120deg, rgba(12, 20, 38, 0.96) 0%, rgba(23, 53, 117, 0.34) 54%, rgba(181, 140, 42, 0.22) 100%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3.2s infinite ease-in-out",
        "spin-slow": "spin 20s linear infinite",
        shimmer: "shimmer 2.8s infinite linear",
        "float-gentle": "float-gentle 6s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px -1px rgba(181, 140, 42, 0.22)" },
          "50%": { boxShadow: "0 0 24px 2px rgba(181, 140, 42, 0.42)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scanline: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 48px" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
