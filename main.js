const express = require("express");
const app = express();
const https = require("https");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const ip = require("ip");
const cookieParser = require("cookie-parser");
require("./config/global.js");

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());
app.use(bodyParser.json({limit : "50000000kb"}));  


/*const options = {
	key: fs.readFileSync("./cert/2843397_web.shamiao.xyz.key"),
	cert: fs.readFileSync("./cert/2843397_web.shamiao.xyz.pem")
};*/

const options = {
    key: fs.readFileSync("./cert/private.pem"),
    cert: fs.readFileSync("./cert/csr.crt")
};

/*app.get("/", (req, res) => {
	res.send("hello world");
	res.end();
});*/

/*app.use('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
    //res.header('Access-Control-Allow-Origin', 'https://192.168.0.10'); //这样写，只有www.baidu.com 可以访问。
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');//设置方法
    if (req.method == 'OPTIONS') {
        res.sendStatus(200); // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
    }
    else {
        next();
    }
});*/


// app.use("/", express.static("public/"));

const routes = require("./routes/index.js");

app.use("/api", routes);

app.listen(7777, "0.0.0.0", () => console.log("http listen on 7777"));
