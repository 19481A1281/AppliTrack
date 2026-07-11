/** @type {import('tailwindcss').Config} */
const { heroui } = require('@heroui/react');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: { DEFAULT: '#6366f1', foreground: '#ffffff' },
            secondary: { DEFAULT: '#8b5cf6', foreground: '#ffffff' },
          },
        },
        dark: {
          colors: {
            primary: { DEFAULT: '#6366f1', foreground: '#ffffff' },
            secondary: { DEFAULT: '#8b5cf6', foreground: '#ffffff' },
          },
        },
      },
    }),
  ],
};
