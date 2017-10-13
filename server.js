const path = require("path");
const express = require("express");
const webpack = require("webpack");

const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require('./webpack.dev.config.js');

const app = express();
const DIST_DIR = webpackConfig.output.path;
const PORT = 8888;
const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: false, // 清静模式，是否不输入启动时的相关信息
    stats: {
        colors: true // 不同信息不同颜色
    },
}));
app.use(webpackHotMiddleware(compiler));

app.get("*", (req, res, next) =>{ // 所有请求都返回index.html
    const filename = path.join(DIST_DIR, 'index.html');

    compiler.outputFileSystem.readFile(filename, (err, result) =>{
        if(err){
            return(next(err))
        }
        res.set('content-type', 'text/html');
        res.send(result);
        res.end();
    })
});

app.listen(PORT, function(){
    console.log('启动地址: http://localhost:'+PORT);
});
