const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 关于二中-师资概况-编辑 */
router.post("/edit", async (req, res) => {
	let { id, content, picSrc, removeSrc } = req.body;

	try {
		await utils.removeAssets(removeSrc);
	} catch (err) {
		res.status(200).send({ code: 500, msg: "图片删除失败", result: err.message });
	}

	const whereStr = { "id": id };
	const updateStr = { $set: {
		"timecreate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"content": content,
		"picSrc": picSrc
	}};
	db.updateOne("about_team", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 关于二中-师资概况-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { addViews } = req.body;
	const findStr = {};
	let res1 = await db.find("about_team", findStr).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
	if (addViews) {
		let res2 = await db.addViews("about_team", findStr).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
	}
	res.status(200).send({ msg: "查询成功", code: 200, data: res1[0] });
});
module.exports = router;