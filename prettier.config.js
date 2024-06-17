module.exports = {
  insertPragma: false,
  endOfLine: 'lf',
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  semi: true,
  bracketSameLine: false,
  singleAttributePerLine: true,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'babel-ts',
        quoteProps: 'as-needed',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      options: {
        parser: 'babel-flow',
        quoteProps: 'as-needed',
      },
    },
    {
      files: ['*.ts', '*.js'],
      options: {
        singleQuote: true,
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
