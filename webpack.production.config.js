//var path = require('path');
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const outdir = 'hello'

module.exports={
  mode:'production',
  entry: {
    app: "./src/index.js"
  },
  output: {
    filename: 'mqtt-hooks.min.js',
  },
  module: {
    rules: [
      { test: /\.jsx?$/, 
        exclude: /node_modules/,
        use: [{
          loader: "babel-loader" 
        }]
      },
      { test: /\.html$/, loader: "html-loader" }
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true
        },
        sourceMap: true
      })
    ]
  },
  plugins: []
}