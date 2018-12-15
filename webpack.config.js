const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

    mode: 'production',
    entry: './index.js',

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.js'
    },

    resolve: {
        extensions: ['.mjs', '.js', '.json']
    },

    devtool: 'source-map',
    context: __dirname,
    target: 'node',
    externals: [nodeExternals()],

    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: { mangle: false },
                sourceMap: true
            })
        ]
    },

    plugins: [
        new CopyWebpackPlugin(['package.json'], { to: './build' })
    ]
};