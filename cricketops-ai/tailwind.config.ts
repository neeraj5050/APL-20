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
        background: "#0A0E1A",
        foreground: "#F9FAFB",
        card: "#1A2235",
        "card-hover": "#1E2A40",
        sidebar: "#0D1220",
        topbar: "#0C1019",
        muted: "#6B7280",
        border: "#1F2D40",
        accent: {
          blue: "#3B82F6",
          green: "#10B981",
          yellow: "#F59E0B",
          red: "#EF4444",
          purple: "#8B5CF6",
        },
        agent: {
          meme: "#F59E0B",
          prediction: "#3B82F6",
          stats: "#10B981",
          hype: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
