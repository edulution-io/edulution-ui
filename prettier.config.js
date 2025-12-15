/** @type {import("prettier").Config} */
module.exports = {
  endOfLine: 'lf',
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSameLine: false,
  insertPragma: false,
  singleAttributePerLine: true,

  overrides: [
    {
      files: ['*.css', '*.html', '*.json'],
      options: {
        singleQuote: false,
      },
    },
  ],

  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: 'apps/frontend/tailwind.config.ts',
};
