/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './*.tsx', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: { 850: '#151b23', 900: '#0f172a', 950: '#020617' },
        taupe: { 400: '#a39785', 500: '#8b8070' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
}
