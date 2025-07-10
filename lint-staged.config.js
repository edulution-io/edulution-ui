module.exports = {
  '{apps,libs}/**/*.{ts,tsx,js,jsx}': (filenames) => [`npx eslint --fix ${filenames.join(' ')}`],
};
