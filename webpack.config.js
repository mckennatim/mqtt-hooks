var webpack = require('webpack');

const config = {
  mode: 'development',
  output: {
    filename: 'mqtt-hooks.js'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, 
        exclude: /node_modules/,
        use: [
          "babel-loader"
        ]
      }    
    ],

  },
  plugins: [],
  externals: {
    react: 'react',
  }
}

module.exports = config;