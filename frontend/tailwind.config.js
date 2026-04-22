/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        gallery: {
          cream: '#FAF8F5',
          dark:  '#1A1714',
          stone: '#8C8580',
          gold:  '#C9A84C',
          warm:  '#F0EAE0',
        }
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadeIn:  'fadeIn 0.4s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      }
    },
  },
  plugins: [],
}
