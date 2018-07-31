const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin"); // 为了单独打包css
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 生成html
const CleanWebpackPlugin = require("clean-webpack-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin"); // 预加载所有chunk
module.exports = {
  mode: "production",
  entry: ["babel-polyfill", path.resolve(__dirname, "src", "index")],
  output: {
    path: path.resolve(__dirname, "build/dist"), // 将文件打包到此目录下
    publicPath: "/dist/", // 在生成的html中，文件的引入路径会相对于此地址，生成的css中，以及各类图片的URL都会相对于此地址
    filename: "[name].[hash:6].js",
    chunkFilename: "[name].[hash:6].chunk.js"
  },
  context: __dirname,
  module: {
    rules: [
      {
        // .js .jsx用babel解析
        test: /\.js?$/,
        include: path.resolve(__dirname, "src"),
          use: [
              "babel-loader"
          ]
      },
      {
        // .css 解析
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
              "css-loader",
            "postcss-loader"
          ]
        })
      },
      {
        // .less 解析
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
              "css-loader",
            "postcss-loader",
            {loader: "less-loader", options:{javascriptEnabled: true}}
          ]
        })
      },
      {
        // .scss 解析
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
              "css-loader",
            "postcss-loader",
            "sass-loader"
          ]
        }),
      },
      {
        // 文件解析
        test: /\.(eot|woff|svg|ttf|woff2|appcache|mp3|mp4|pdf)(\?|$)/,
        include: path.resolve(__dirname, "src"),
          use: [
              "file-loader?name=assets/[name].[ext]"
          ]
      },
      {
        // 图片解析
        test: /\.(png|jpg|gif)$/,
        include: path.resolve(__dirname, "src"),
        use: [
            "url-loader?limit=8192&name=assets/[name].[ext]",
        ]
      },
      {
        // CSV/TSV文件解析
        test: /\.(csv|tsv)$/,
        use: [
            'csv-loader'
        ]
      },
      {
        // xml文件解析
        test: /\.xml$/,
        use: [
            'xml-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["build"]),
    new ExtractTextPlugin({
      filename: "[name].[hash:6].css", // 生成的文件名
      allChunks: true // 从所有chunk中提取
    }),
    new HtmlWebpackPlugin({
      //根据模板插入css/js等生成最终HTML
      filename: "../index.html", //生成的html存放路径，相对于 output.path
      template: "./index.ejs", //html模板路径
      favicon: "./favicon.ico", // 自动把根目录下的favicon.ico图片加入html
      inject: true, // 是否将js放在body的末尾
        templateParameters: {
            "dll" : "",
        }
    }),
      new PreloadWebpackPlugin(),
  ],
  // 解析器， webpack提供的各种方便的工具函数
  resolve: {
    extensions: [".js", ".jsx", ".less", ".css", ".scss"] //后缀名自动补全
  }
};
