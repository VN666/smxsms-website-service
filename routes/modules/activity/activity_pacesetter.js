const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 德育活动-德育标兵-添加 */
router.post("/add", async (req, res) => {
	let { headSrc, picSrc, name, job, introduction, order, removeSrc, publisher } = req.body;
	
	try { 
		await utils.removeAssets(removeSrc);
	} catch (e) { 
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}
	const insertStr = {
		"publisher": publisher,
		"headSrc": headSrc,
		"picSrc": picSrc,
		"name": name,
		"job": job,
		"introduction": introduction,
		"timecreate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"views": 0,
		"order": order,
		"id": uuidv1()
	};
	db.insertOne("activity_pacesetter", insertStr).then((success) => {
		res.status(200).send({ msg: "添加成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 德育活动-德育标兵-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "order": -1 };
	await Promise.all([db.findByPage("activity_pacesetter", {}, {"introduction": 0}, sortStr, pageNo, pageSize), db.getTotal("activity_pacesetter")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

/** 德育活动-德育标兵-编辑 */
router.post("/edit", async (req, res) => {
	let { id, headSrc, picSrc, name, job, introduction, removeSrc, publisher } = req.body;

	try {
		await utils.removeAssets(removeSrc);
	} catch (e) {
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}

	const whereStr = { "id": id };
	const updateStr = { $set: {
		"publisher": publisher,
		"timecreate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"headSrc": headSrc,
		"picSrc": picSrc,
		"name": name,
		"job": job,
		"introduction": introduction,
		"id": id,

	}};
	db.updateOne("activity_pacesetter", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 德育活动-德育标兵-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	let whereStr = {};
	/** 参数校验区域 */
	const sortStr = { "order": -1 };
	const limitStr = {};
	
	await Promise.all([db.findByPage("activity_pacesetter", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("activity_pacesetter")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 德育活动-德育标兵-删除 */
router.post("/del", async (req, res) => {
	let { id, picSrc } = req.body;
	const delStr = { "id": id };

	db.deleteOne("activity_pacesetter", delStr).then(async (success) => {		
		try {
			await utils.removeAssets(picSrc);
			res.status(200).send({ msg: "删除成功", code: 200, result: success });
		} catch (e) {
			res.status(200).send({ code: 500, msg: "图片删除失败", result: e.message })
		}
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 德育活动-德育标兵-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { addViews, id } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("activity_pacesetter", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("activity_pacesetter", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 德育活动-德育标兵-移动 */
router.post("/move", (req, res) => {
	const { fromId, fromOrder, toId, toOrder } = req.body;
	fromFindStr = { "id": fromId };
	fromUpdateStr = { $set: { "order": toOrder }};
	toFindStr = { "id": toId };
	toUpdateStr = { $set: { "order": fromOrder }};
	
	db.updateOne("activity_pacesetter", fromFindStr, fromUpdateStr).then((move) => {
		db.updateOne("activity_pacesetter", toFindStr, toUpdateStr).then((move2) => {
			res.status(200).send({ msg: "移动成功", code: 200 });
		});
	}).catch((err) => {
		res.status(200).send({ msg: "移动失败", code: 500 });
	});
});

module.exports = router;