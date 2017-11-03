import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as path from 'path'

const extractSass = new ExtractTextPlugin({
  disable: process.env.NODE_ENV === 'development',
  filename: 'index.css',
})

const commonConfig = {
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        exclude: /(node_modules)/,
        loader: 'tslint-loader',
        test: /\.ts?$/,
      },
      {
        exclude: /node_modules/,
        loader: 'ts-loader',
        test: /\.ts$/,
      },
      {
        loader: 'file-loader?name=[name].[ext]',
        test: /\.html$/,
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: [{
              loader: 'css-loader',
          }, {
              loader: 'sass-loader',
          }],
        }),
      },
    ],
  },
  plugins: [
    extractSass,
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [ process.env.NODE_PATH || '', 'node_modules' ],
  },
}

module.exports = [
  Object.assign(
    {
      entry: ['./timeline/index.ts', './timeline/index.scss', './timeline/index.html'],
      output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
      },
      target: 'web',
    },
    commonConfig),
  ]
