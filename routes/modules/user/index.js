const express = require("express");
const app = express();
const router = express.Router();

const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const db = new Dao();


router.post("/getUserInfo", (req, res) => {
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
	
	db.find("admin_user", { username: utils.getJwtCode(token).username }).then((data) => {
		res.status(200).send({ msg: "查询成功", code: 200, result: { 
			username: data[0].username,
			departmentId: data[0].departmentId,
			auths: data[0].auths
		}});
	})	
});

module.exports = router;