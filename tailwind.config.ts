import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          bg: '#0f172a',      // Dark background
          card: '#1e293b',    // Dark card/sidebar background
          border: '#334155',  // Dark borders
          text: '#e2e8f0',    // Dark mode text
          muted: '#94a3b8',   // Muted text in dark mode
        }
      },
      boxShadow: {
        'theme-xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'theme-sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'theme-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'theme-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      fontSize: {
        'theme-xs': ['0.75rem', { lineHeight: '1rem' }],
        'theme-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'theme-base': ['1rem', { lineHeight: '1.5rem' }],
        'theme-lg': ['1.125rem', { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [],
}

export default config
