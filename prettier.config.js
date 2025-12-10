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
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      options: {
        parser: 'typescript',
        quoteProps: 'as-needed',
      },
    },
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
