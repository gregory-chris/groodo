/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#701E2E',
        secondary: '#CF904E',
        accent: '#BB1E3A',
      },
      gridTemplateColumns: {
        '5-responsive': 'repeat(5, 1fr)',
        '3-responsive': 'repeat(3, 1fr)',
        '2-responsive': 'repeat(2, 1fr)',
        '1-responsive': '1fr',
      }
    },
  },
  plugins: [],
}
