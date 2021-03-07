const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const whiteList = require("./whiteList.js");
const news = require("./modules/news/index.js");
const upload = require("./modules/upload/index.js");
const bg = require("./modules/bg/index.js");
const contact = require("./modules/contact/index.js");
const about = require("./modules/about/index.js");
const group = require("./modules/group/index.js");
const education = require("./modules/education/index.js");
const student = require("./modules/student/index.js");
const parent = require("./modules/parent/index.js");
const school = require("./modules/school/index.js");
const happy = require("./modules/happy/index.js");
const service = require("./modules/service/index.js");
const login = require("./modules/login/index.js");
const user = require("./modules/user/index.js");
const download = require("./modules/download/index.js");
const system = require("./modules/system/index.js");

app.use("*", (req, res, next) => {
	if (whiteList.includes(req.baseUrl)) {
		next();
		return;
	}
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
	if (token) {
		jwt.verify(token, "smxsdezx-website", (err, decode) => {
			if (err) {
				const message = err.message === "invalid token" ? "授权失败，请重新登录" : err.message === "jwt expired" ? "登录超时，请重新登录" : "位置错误，请重新登录";
				res.status(403).send({ msg: message, code: 403, result: {}});
			} else {
				const token = getToken(decode, tokenExpiredTime);
				const expires = new Date(Date.now() + tokenExpiredTime * 1000);
				res.cookie("Authorization", token, {sameSite: "none", secure: true, domain: ".smxsdezx.cn", path: "/", expires: expires});
				next();
			}			
		});
	} else {
		res.status(401).send({ msg: "未授权，请登录", code: 401, result: {}});
	}
});


app.use("/news", news);

app.use("/upload", upload);

app.use("/bg", bg);

app.use("/contact", contact);

app.use("/about", about);

app.use("/group", group);

app.use("/education", education);

app.use("/student", student);

app.use("/parent", parent);

app.use("/school", school);

app.use("/happy", happy);

app.use("/service", service);

app.use("/login", login);

app.use("/user", user);

app.use("/download", download);

app.use("/system", system);

const getToken = (data, expiresTime) => {
	return jwt.sign({
		username: data.username,
		uid: data.uid
	}, "smxsdezx-website", { expiresIn: expiresTime });
};

const tokenExpiredTime = 2 * 60 * 60; // 过期时间两个小时

module.exports = app;