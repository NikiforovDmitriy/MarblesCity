const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
    mode: 'development',
    target: 'node',
    entry: './src/server/index.js',
    output: {
        path: path.resolve(__dirname, './src/server'),
        filename: 'server.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    externals: [nodeExternals()],
    module: {
        rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
    },
}
