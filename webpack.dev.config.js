var path = require('path');
const webpack = require('webpack');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    entry: [path.resolve(__dirname, '/src/index.jsx')],
    output: {
        path: path.resolve(__dirname, 'app/js'),
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader?cacheDirectory=true'
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            uglifyOptions: {
              compress: true,
              ecma: 6,
              mangle: true
            },
            sourceMap: true
        }),
        new webpack.DefinePlugin(
            {
                'process.env': {
                    NODE_ENV: JSON.stringify('development')
                }
            }
        )],
    externals: {
        'fs': 'commonjs2 fs',
        'path': 'commonjs2 path'
    }
};
