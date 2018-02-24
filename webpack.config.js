'use struct';

// const NODE_ENV = process.env.NODE_ENV || 'production';
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach(mod => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  context: path.join(__dirname, 'src/backend'),
  entry: { app: './app.js' },
  target: 'node',
  output: {
    path: path.join(__dirname, 'distr'),
    filename: '[name].js',
    library: '[name]',
    publicPath: '/'
  },

  node: {
    // We are outputting a real node app!
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },

  watch: true, // NODE_ENV === 'dewelopment',

  watchOptions: {
    aggregateTimeout: 100
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.pug$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'pug-loader',
          options: {}
        }
      }
    ]
  },
  //   node: {
  //     fs: "empty"
  //   },
  //   loaders: [{
  //     test: /\.jsx?$/,
  //     exclude: /node_modules/,
  //     loader: 'babel',
  //     query: {
  //       "presets": ["react", "es2015", "stage-0", "react-hmre"]
  //     }
  //   }

  resolve: {
    modules: [path.resolve(__dirname, 'src/backend/libs'), 'node_modules'],
    extensions: ['.js']
  }
  //   resolveLoader: {
  //     modules: ["node_modules"],
  //     mainFields: ["loader"],
  //     extensions: [".js"]
  //   }
};
