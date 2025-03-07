import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Scans all source files for Tailwind classes
  ],
  darkMode: 'class', // Enables class-based dark mode
  theme: {
    extend: {}, // Add customizations here if needed (e.g., colors, spacing)
  },
  plugins: [], // Add Tailwind plugins here if needed (e.g., forms, typography)
};

export default config;