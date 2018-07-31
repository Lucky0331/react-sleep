/** 这是用于开发环境的webpack配置文件 **/

const path = require("path"); // 获取绝对路径用
const webpack = require("webpack"); // webpack核心
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 动态生成html插件

module.exports = {
  mode: "development",
  entry: [
    "webpack-hot-middleware/client?reload=true&path=/__webpack_hmr",
    "babel-polyfill",
    "./src/index.js" // 项目入口
  ],
  output: {
    path: "/",
    publicPath: "/", // 文件解析路径，index.html中引用的路径会被设置为相对于此路径
    filename: "bundle.js", //编译后的文件名字
  },
  devtool: "inline-source-map", // 报错的时候在控制台输出哪一行报错
  context: __dirname, // entry 和 module.rules.loader 选项相对于此目录开始解析
  module: {
    rules: [
      // {
      //   // 编译前通过eslint检查代码 (注释掉即可取消eslint检测)
      //   test: /\.js?$/,
      //   enforce: "pre",
      //   use: ["eslint-loader"],
      //   include: path.resolve(__dirname, "src")
      // },
      {
        // .js .jsx用babel解析
        test: /\.js?$/,
        use: ["babel-loader"],
        include: path.resolve(__dirname, "src")
      },
      {
        // .css 解析
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader"
        ]
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader",
          {loader: "less-loader", options:{javascriptEnabled: true}}
        ]
      },
      {
        // .scss 解析
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        // 文件解析
        test: /\.(eot|woff|otf|svg|ttf|woff2|appcache|mp3|mp4|pdf)(\?|$)/,
        include: path.resolve(__dirname, "src"),
        use: [
          "file-loader?name=assets/[name].[ext]"
        ]
      },
      {
        // 图片解析
        test: /\.(png|jpg|gif)(\?|$)/,
        include: path.resolve(__dirname, "src"),
        use: [
          "url-loader?limit=8192&name=assets/[name].[ext]"
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
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dll/vendor-manifest.json')
    }),
    new HtmlWebpackPlugin({
      filename: "./index.html",
      favicon: "./favicon.ico",
      template: "./index.ejs",
      inject: true,
      templateParameters: {
        "dll" : "<script src='/vendor.dll.js'></script>",
      }
    }),
    new webpack.ProvidePlugin({
      $:"jquery",
      jQuery:"jquery",
      "window.jQuery":"jquery"
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: [".js", ".jsx", ".less", ".css", ".scss"]
  }
};
