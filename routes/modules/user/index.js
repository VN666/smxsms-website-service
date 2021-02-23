const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/getUserInfo", (req, res) => {
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
	if (token) {
		jwt.verify(token, "smxsdezx-website", (err, decode) => {
			res.status(200).send({ msg: "查询成功", code: 200, result: { username: decode.username } });		
		});
	} else {
		res.status(401).send({ msg: "用户信息获取失败", code: 500, result: {}});
	}
});

module.exports = router;