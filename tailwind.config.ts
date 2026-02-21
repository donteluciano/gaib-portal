import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable-based colors for theme support
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        border: 'var(--border)',
        card: 'var(--bg-card)',
        background: 'var(--bg-primary)',
        input: 'var(--bg-input)',
        // Status colors (these stay the same in both themes)
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        // Navy colors using CSS variables
        navy: {
          DEFAULT: 'var(--bg-secondary)',
          dark: 'var(--bg-primary)',
          card: 'var(--bg-card)',
        },
        // Gold accent using CSS variable
        gold: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent)',
          dark: 'var(--accent-hover)',
        },
      },
      backgroundColor: {
        'navy': 'var(--bg-secondary)',
        'navy-dark': 'var(--bg-primary)',
        'navy-card': 'var(--bg-card)',
      },
      borderColor: {
        'navy': 'var(--border)',
        'navy-card': 'var(--border-card)',
      },
      textColor: {
        'gold': 'var(--accent)',
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
