import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gaib Capital Partners brand colors
        navy: {
          DEFAULT: '#0A1628',
          dark: '#0D1B2A',
          card: '#1A3050',
          light: '#2A4060',
        },
        gold: {
          DEFAULT: '#B8965A',
          light: '#D4B87A',
          dark: '#96784A',
        },
        offwhite: '#F7F5F2',
        // Status colors
        success: '#27AE60',
        warning: '#F39C12',
        danger: '#E74C3C',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Arial', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
