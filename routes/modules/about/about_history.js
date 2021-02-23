const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 二中校史-编辑 */
router.post("/edit", (req, res) => {
	let { id, content, picSrc, category, tempSrc } = req.body;

	picSrc.forEach((src) => content = content.replace(RegExp(src, "g"), src.replace(/temp/g, category)));
	picSrc = picSrc.map((src) => src.replace(RegExp(src, "g"), src.replace(/temp/g), category));
	tempSrc = tempSrc.map((src) => path.basename(src));
	picSrc = picSrc.map((src) => path.basename(src));
	const addSrc = picSrc.filter((src) => !tempSrc.includes(src));
	const removeSrc = tempSrc.filter((src) => !picSrc.includes(src));
	
	addSrc.forEach((src) => {
		const sourceUrl = path.join("public/imgs/temp", path.basename(src));
		const destUrl = path.join("public/imgs", category, path.basename(src));
		fs.rename(sourceUrl, destUrl, async (err) => {
			if (err) res.status(200).send({ msg: "图片添加失败", code: 500 });
		});
	});

	removeSrc.forEach((src) => {
		const targetUrl = path.join("public/imgs", category, path.basename(src));
		if (fs.existsSync(targetUrl)) {
			fs.unlink(targetUrl, (err) => {
				if (err) res.status(200).send({ msg: "图片删除失败", code: 500 });
			});
		}
	});	

	picSrc = picSrc.map((src) => `https://${global.domain}/public/imgs/${category}/${src}`);

	const whereStr = { "id": id };
	const updateStr = { $set: {
		"timecreate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"content": content,
		"picSrc": picSrc
	}};
	db.updateOne("about_history", whereStr, updateStr).then((success) => {
		res.status(200).send({
			msg: "保存成功",
			code: 200,
			result: success
		});
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		})
	});
});

/** 二中校史-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { addViews } = req.body;
	const findStr = {};
	let res1 = await db.find("about_history", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("about_history", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

module.exports = router;