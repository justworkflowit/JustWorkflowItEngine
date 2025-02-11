const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/browser.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'browser.js',
    library: 'JustWorkflowItEngine',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      preloadedSchemas: path.resolve(__dirname, 'dist/js/src/preloadedSchemas.js'), // Alias to compiled JS
    },
    fallback: {
      fs: false,
      path: false,
      process: require.resolve('process'),
      buffer: require.resolve('buffer'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
