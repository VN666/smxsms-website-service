const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 二中概况-校长寄语-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { addViews } = req.body;
	const findStr = {};
	let res1 = await db.find("about_proverb", findStr).catch((err) => res.status(200).send({ msg: err, code: 500}));
	if (addViews) {
		let res2 = await db.addViews("about_proverb", findStr).catch((err) => res.status(200).send({ msg: err, code: 500}));
	}
	res.status(200).send({ msg: "查询成功", code: 200, data: res1[0] });
});

/** 二中概况-校长寄语-编辑 */
router.post("/edit", async (req, res) => {
	let { id, content, picSrc, headSrc, removeSrc } = req.body;

	picSrc.push(headSrc);
	
	try {
		await utils.removeAssets(removeSrc);
	} catch (e) {
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}

	const whereStr = { "id": id };
	const updateStr = { $set: {
		"timecreate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"content": content,
		"picSrc": picSrc,
		"headSrc": headSrc
	}};
	db.updateOne("about_proverb", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});



module.exports = router;