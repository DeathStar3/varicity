const path = require("path");
const fs = require("fs");

module.exports = {
    entry: {
      'crossCheckTest': './tests/crossCheck.test.js'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
            test: /\.ya?ml$/,
            type: "json",
            use: "yaml-loader",
            exclude: /node_modules/
        }
      ]
    },
    mode: "development"
  }