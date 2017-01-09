var path = require('path')
var webpack = require('webpack')


module.exports = {
  entry: [
    'babel-polyfill',
    './src/main.less',
    './src/main/DisjointSet.js',
    './src/main/EventEmitter.js',
    './src/main/Image.js',
    './src/main/Math.js',
    './src/main/ObjectTracker.js',
    './src/main/Tracker.js',
    './src/main/TrackerTask.js',
    './src/main/Tracking.js',
    './src/main/ViolaJones.js',
    './src/main/index.js',
    './src/main',
    'webpack-dev-server/client?http://localhost:8080'
  ],
  output: {
    publicPath: '/',
    filename: 'main.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader',
        query: {
          presets: ["es2015"]
        }
      },
      {
        test: /\.less$/,
        loader: "style!css!autoprefixer!less"
      }
    ]
  },
  devServer: {
    contentBase: './src'
  },
  debug: true
}
