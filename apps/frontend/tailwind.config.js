/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sunset: '#FF8C42',
        forest: '#3E8914',
        sky: '#3FB8AF',
        berry: '#D72638',
        sand: '#FFEBC1',
        ink: '#2B2D42',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
