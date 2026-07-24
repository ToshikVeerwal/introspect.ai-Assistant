import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#04030a',
        violet: '#7c3aed',
        cyan: '#38bdf8',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(124,58,237,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;