module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { dusk: '#0D2B45', chalk: '#EEF3F6', field: '#2F6B4F', marigold: '#F2B230', fog: '#C9D6DF' },
      fontFamily: { display: ['var(--font-display)', 'sans-serif'], body: ['var(--font-body)', 'sans-serif'] },
    },
  },
  plugins: [],
};
