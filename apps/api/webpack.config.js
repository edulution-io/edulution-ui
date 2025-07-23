const { NxWebpackPlugin } = require('@nx/webpack');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset/source',
      },
      {
        test: /\.SurveyTemplate\.json$/,
        type: 'asset/source',
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].json',
            outputPath: `surveys/default-templates/`,
            emitFile: true,
          },
        },
      },
      {
        test: /surveys-default-logo.png$/,
        type: 'asset/source',
        use: {
          loader: 'file-loader',
          options: {
            name: 'surveys-default-logo.png',
            outputPath: `surveys/default-files/`,
            emitFile: true,
          },
        },
      },
    ],
  },
  plugins: [
    new NxWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      outputFileName: 'main.js',
      generatePackageJson: true,
    }),
  ],
};
