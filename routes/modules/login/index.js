const express = require("express");
const app = express();
const router = express.Router();
const uuidv1 = require("uuid/v1");
const CryptoJS = require("crypto-js");

const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const jwt = require("jsonwebtoken");

const db = new Dao();

const MSG = "用户名或者密码错误";
const MSG2 = "登录成功!";
const MSG3 = "请进行滑动检测";
const MSG4 = "账号已被锁定，请1分钟后再试";
const MSG5 = "滑动过期请刷新页面重新登录";

const tokenExpiredTime = 2 * 60 * 60; // 过期时间两个小时

router.post("/loginTest", async (req, res) => {
	const { username, password, slideCode } = req.body;
	const ip = req.ip;
	const now = Date.now();
	const blackList = await getBlackIpList(ip);
	
	if (blackList.length && blackList[0].errorTimes > 5 && (now - blackList[0].timecreate) < 60000) {
		res.status(200).send({ msg: MSG4, code: 406, result: [] });
		return ;
	}
	if (blackList.length && blackList[0].errorTimes >= 3) {
		if (!slideCode) {
			res.status(200).send({ msg: MSG3, code: 405, result: [] });
			return;
		} 
		if (slideCode !== blackList[0].id) {
			res.status(200).send({ msg: MSG5, code: 405, result: [] });
			return;
		}	
	} 	

	db.find("admin_user", {username: username}).then((data) => {
		/** 用户名不存在 */
		if (data.length === 0) {
			if (blackList.length === 0) {
				db.insertOne("admin_black_list", {ip: ip, id: uuidv1(), timecreate: now, errorTimes: 1}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return ;
			} else {
				db.updateOne("admin_black_list", {ip: ip}, { $set: {errorTimes: parseInt(blackList[0].errorTimes) + 1, id: uuidv1(), timecreate: now }}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return ;
			}	
		}
		/** 密码错误 */
		let pwd = CryptoJS.SHA256(password + data[0].uid).toString();
		if (pwd !== data[0].password) {
			if (blackList.length === 0) {
				db.insertOne("admin_black_list", {ip: ip, id: uuidv1(), timecreate: now, errorTimes: 1}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return;
			} else {
				db.updateOne("admin_black_list", {ip: ip}, { $set: {errorTimes: parseInt(blackList[0].errorTimes) + 1, id: uuidv1(), timecreate: now }}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return ;
			}
			res.status(200).send({ msg: MSG, code: 400, result: [] });
		} else {
			db.deleteOne("admin_black_list", {ip: ip}).then((cn) => {
				const token = getToken(data[0], tokenExpiredTime);
				res.status(200).send({ msg: MSG2, code: 200, result: token });
			});
		}
	});
});

router.post("/login", async (req, res) => {
	const { username, password, slideCode } = req.body;
	const ip = req.ip;
	const now = Date.now();
	const blackList = await getBlackIpList(ip);
	
	if (blackList.length && blackList[0].errorTimes > 5 && (now - blackList[0].timecreate) < 60000) {
		res.status(200).send({ msg: MSG4, code: 406, result: [] });
		return ;
	}
	if (blackList.length && blackList[0].errorTimes >= 3) {
		if (!slideCode) {
			res.status(200).send({ msg: MSG3, code: 405, result: [] });
			return;
		} 
		if (slideCode !== blackList[0].id) {
			res.status(200).send({ msg: MSG5, code: 405, result: [] });
			return;
		}	
	} 	

	db.find("admin_user", {username: username}).then((data) => {
		/** 用户名不存在 */
		if (data.length === 0) {
			if (blackList.length === 0) {
				db.insertOne("admin_black_list", {ip: ip, id: uuidv1(), timecreate: now, errorTimes: 1}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return ;
			} else {
				db.updateOne("admin_black_list", {ip: ip}, { $set: {errorTimes: parseInt(blackList[0].errorTimes) + 1, id: uuidv1(), timecreate: now }}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return ;
			}	
		}
		/** 密码错误 */
		let pwd = CryptoJS.SHA256(password + data[0].uid).toString();
		if (pwd !== data[0].password) {
			if (blackList.length === 0) {
				db.insertOne("admin_black_list", {ip: ip, id: uuidv1(), timecreate: now, errorTimes: 1}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return;
			} else {
				db.updateOne("admin_black_list", {ip: ip}, { $set: {errorTimes: parseInt(blackList[0].errorTimes) + 1, id: uuidv1(), timecreate: now }}).then((cn) => res.status(200).send({ msg: MSG, code: 400, result: [] }));
				return ;
			}
			res.status(200).send({ msg: MSG, code: 400, result: [] });
		} else {
			db.deleteOne("admin_black_list", {ip: ip}).then(async (cn) => {
				const token = getToken(data[0], tokenExpiredTime);
				const expires = new Date(Date.now() + tokenExpiredTime * 1000);
				res.cookie("Authorization", token, {sameSite: "none", secure: true, domain: ".smxsdezx.cn", path: "/", expires: expires});

				const departmentName = await db.find("system_department", {id: data[0].departmentId });

				res.status(200).send({ msg: MSG2, code: 200, result: {
					username: username,
					auths: data[0].auths,
					departmentId: data[0].departmentId,
					departmentName: departmentName[0].name
				}});
			});
		}
	});
});

router.post("/getToken", async (req, res) => {
	const { username } = req.body;
	db.find("admin_user", {username: username}).then((data) => {
		const token = getToken(data[0], tokenExpiredTime);
		const refresh_token = getToken(data[0], 2 * tokenExpiredTime)
		res.status(200).send({ msg: "", result: { author: data[0].author, role: data[0].role, token: token, refresh_token: refresh_token, expiresIn:  Date.now()} });
	});
});

// router.post("/refreshToken", (req, res) => {
// 	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
// 	const { username } = req.body;
// 	if (token) {
// 		jwt.verify(token, "smxsdezx-website", (err, decode) => {
// 			if (err) {
// 				const message = err.message === "invalid token" ? "授权失败，请重新登录" : err.message === "jwt expired" ? "登录超时，请重新登录" : "位置错误，请重新登录";
// 				res.status(403).send({ msg: message, code: 403, result: {}});
// 			} else {
// 				db.find("admin_user", {username: username}).then((data) => {
// 					const token = getToken(data[0], tokenExpiredTime);
// 					const refresh_token = getToken(data[0], 2 * tokenExpiredTime)
// 					res.status(200).send({ msg: "", result: { author: data[0].author, role: data[0].role, token: token, refresh_token: refresh_token, expiresIn:  Date.now()} });
// 				});
// 			}			
// 		});
// 	} else {
// 		res.status(401).send({ msg: "未授权，请登录", code: 401, result: {}});
// 	}
// });

router.post("/ipCheck", async (req, res) => {
	const ip = req.ip;
	const black = await getBlackIpList(ip);
	if (black.length === 0 || black[0].errorTimes <= 2) {
		res.status(200).send({ msg: "", code: 200, result: {}});
	} else {
		res.status(200).send({ msg: "", code: 405, result: {}});
	}
});

router.post("/getSlideCode", async (req, res) => {
	const ip = req.ip;
	db.find("admin_black_list", {ip: ip}).then((cn) => {
		res.status(200).send({ msg: "", code: 200, result: cn[0].id });
	})
});

const getBlackIpList = (ip) => {
	return db.find("admin_black_list", {ip: ip});
}

const getToken = (data, expiresTime) => {
	return jwt.sign({
		username: data.username,
		uid: data.uid
	}, "smxsdezx-website", { expiresIn: expiresTime });
};

module.exports = router;