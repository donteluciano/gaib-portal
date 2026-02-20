import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          dark: '#0D1B2A',
          card: '#1A3050',
        },
        gold: {
          DEFAULT: '#B8965A',
          light: '#D4B87A',
          dark: '#9A7B48',
        },
        offwhite: '#F7F5F2',
        body: '#333333',
        // Improved muted colors for better readability on dark backgrounds
        muted: '#9CA3AF', // gray-400 - much more readable
        'muted-dark': '#6B7280', // gray-500 - for light backgrounds
        'light-gray': '#D1D5DB', // gray-300
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
};

export default config;
