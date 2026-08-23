/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          wishlist: '#9ca3af', // gray
          applied: '#3b82f6', // blue
          'follow-up': '#8b5cf6', // purple (screenshot card accent)
          interview: '#f59e0b', // amber
          offer: '#22c55e', // green
          rejected: '#ef4444', // red
        },
      },
    },
  },
  plugins: [],
}