import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#05030D", violet: "#7C3AED", cyan: "#67E8F9" },
      boxShadow: { aura: "0 0 60px rgba(109, 40, 217, .28)" },
      animation: { drift: "drift 14s ease-in-out infinite", shimmer: "shimmer 2.6s linear infinite" },
      keyframes: {
        drift: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } }
      }
    }
  },
  plugins: []
} satisfies Config;
