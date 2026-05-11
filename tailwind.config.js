/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1C1C',
        muted: '#6A6A6A',
        line: '#e8e8e8',
        surface: '#f7f7f7',
        brand: '#1ea0ff',
        canvas: '#f2f3f5',
      },
      fontFamily: {
        sans: ['Graphik', '"DM Sans"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
