const { NxWebpackPlugin } = require('@nx/webpack');
const { join } = require('path');

module.exports = {
  devtool: 'source-map',
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    sourceMapFilename: '[name].js.map',
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset/source',
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
