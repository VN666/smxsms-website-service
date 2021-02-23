const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uuidv1 = require("uuid/v1");
const Dao = require("../../../tools/DAO.js");
const moment = require("moment");
const utils = require("../../../tools/utils.js");

const db = new Dao();

/** 封面图片-删除 */
router.post("/", (req, res) => {
	const { src } = req.body;
	const target = global.API.staticPath + utils.getAbsolutePath(src).replace(/oss\//g, "");
	if (fs.existsSync(target)) {
		fs.unlink(target, (err) => {
			if (err) res.status(200).send({ msg: err, code: 500 });
			else res.status(200).send({ msg: "删除成功", code: 200, result: "" });
		});
	} else {
		res.status(200).send({ msg: "文件不存在", code: 500, type: "continue" });
	}
});

module.exports = router;