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

/** multer配置 */
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/imgs/");
	},
	filename: function (req, file, cb) {
		cb(null, utils.getFileHashName(file.originalname));
	}
});
const upload = multer({ storage: storage });

/** 关于二中-校园风貌-添加  */
router.post("/getTotal", (req, res) => {
	db.getTotal("about_landscape").then((len) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			total: len
		});
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		});
	});
});

/** 关于二中-校园风貌-上传 */
router.post("/add", (req, res) => {
	const { name, picSrc, order } = req.body;
	const insertStr = { id: uuidv1(), picSrc: picSrc, timecreate: moment().format("YYYY-MM-DD HH:mm:ss"), order: order, name: name, views: 0 };	
	db.insertOne("about_landscape", insertStr).then((success) => {
		res.status(200).send({ msg: "上传成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 关于二中-校园风貌-查询 */
router.post("/query", async (req, res) => {
	const { pageNo, pageSize } = req.body;
	const findStr = {};
	const limitStr = {};
	const sortStr = { "order": -1 };

	await Promise.all([db.findByPage("about_landscape", findStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("about_landscape")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

/** 关于二中-校园风貌-删除 */
router.post("/del", (req, res) => {
	const { id, picSrc } = req.body;
	const delStr = { "id": id};

	db.deleteOne("about_landscape", delStr).then(async (success) => {
		try {
			await utils.removeAssets(picSrc);
			res.status(200).send({ msg: "删除成功", code: 200, result: success });
		} catch (err) {
			res.status(200).send({ code: 500, msg: "图片删除失败", result: err.message })
		}
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 关于二中-校园风貌-移动 */
router.post("/move", (req, res) => {
	const { fromId, fromOrder, toId, toOrder } = req.body;
	fromFindStr = { "id": fromId };
	fromUpdateStr = { $set: { "order": toOrder }};
	toFindStr = { "id": toId };
	toUpdateStr = { $set: { "order": fromOrder }};
	
	db.updateOne("about_landscape", fromFindStr, fromUpdateStr).then((move) => {
		db.updateOne("about_landscape", toFindStr, toUpdateStr).then((move2) => {
			res.status(200).send({ msg: "移动成功", code: 200 });
		});
	}).catch((err) => {
		res.status(200).send({ msg: "移动失败", code: 500 });
	});
});

/** 关于二中-校园风貌-编辑 */
router.post("/edit", (req, res) => {
	const { id, name } = req.body;
	const findStr = { "id": id };
	const updateStr = { "$set": { "name": name }};
	db.updateOne("about_landscape", findStr, updateStr).then((success) => {
		res.status(200).send({ msg: "修改成功", code: 200});
	}).catch((err) => {
		res.status(200).send({ msg: "修改失败", code: 500 });
	});
});

/** 关于二中-校园风貌-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { addViews, id } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("about_landscape", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("about_landscape", findStr).catch((err) => {
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