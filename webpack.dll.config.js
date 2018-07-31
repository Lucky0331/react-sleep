var path    = require('path');
var webpack = require("webpack");
var packageJson = require("./package.json");
module.exports = {
    entry: {
        vendor: Object.keys(packageJson.dependencies),
    },
    output: {
        path: path.join(__dirname, 'dll'),
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, 'dll', '[name]-manifest.json'),
            name: '[name]_library', // 与上面output中配置对应
            context: __dirname,
        })
    ]
};