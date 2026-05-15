/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        gray: {
          750: '#2d3748',
        },
        // Custom color scheme
        light: {
          bg: '#FFFFFF',
          text: '#333333',
          secondaryText: '#6B7280',
          heading: '#6A5AE0',
          gradientStart: '#6EE7E7',
          gradientEnd: '#A78BFA',
          link: '#7C3AED',
          border: '#E5E7EB',
          icon: '#5B21B6',
          price: '#1E40AF',
        },
        dark: {
          bg: '#121212',
          text: '#F9FAFB',
          heading: '#A78BFA',
          gradientStart: '#14B8A6',
          gradientEnd: '#6D28D9',
          link: '#60A5FA',
          border: '#374151',
        },
      },
    },
  },
  plugins: [],
}
