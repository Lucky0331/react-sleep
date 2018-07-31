/** 用于开发环境的服务启动 **/
const path = require("path"); // 获取绝对路径有用
const express = require("express"); // express服务器端框架
const bodyParser = require("body-parser");
const env = process.env.NODE_ENV; // 模式（dev开发环境，production生产环境）
const webpack = require("webpack"); // webpack核心
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("./webpack.dev.config.js");

const app = express();
const DIST_DIR = webpackConfig.output.path;
const PORT = 80;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (env === "production") {
  app.use(express.static("build"));
  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
} else {
  const compiler = webpack(webpackConfig);
  app.use(express.static("dll"));
  app.use(
    webpackDevMiddleware(compiler, {
      // 挂载webpack小型服务器
      publicPath: webpackConfig.output.publicPath,
      quiet: true, // 是否不输出启动时的相关信息
      stats: {
        colors: true,
        timings: true
      }
    })
  );
  app.use(webpackHotMiddleware(compiler));
  app.get("*", (req, res, next) => {
    const filename = path.join(DIST_DIR, "index.html");

    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err);
      }
      res.set("content-type", "text/html");
      res.send(result);
      res.end();
    });
  });
}

/** 启动服务 **/
app.listen(PORT, () => {
  console.log("本地服务启动地址: http://localhost:%s", PORT);
});
