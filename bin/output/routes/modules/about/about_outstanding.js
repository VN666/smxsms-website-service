const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 学校领导-添加 */
router.post("/add", (req, res) => {
	let { headSrc, picSrc, name, job, introduction, order } = req.body;
	const insertStr = {
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

	db.insertOne("about_outstanding", insertStr).then((success) => {
		res.status(200).send({
			msg: "添加成功",
			code: 200,
			result: success
		});
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		});
	});
});

/** 学校领导-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "order": -1 };
	await Promise.all([db.findByPage("about_outstanding", {}, {"introduction": 0}, sortStr, pageNo, pageSize), db.getTotal("about_leader")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

/** 学校领导-编辑 */
router.post("/edit", (req, res) => {
	let { id, headSrc, picSrc, name, job, introduction } = req.body;
	const whereStr = { "id": id };
	const updateStr = { $set: {
		"timecreate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"headSrc": headSrc,
		"picSrc": picSrc,
		"name": name,
		"job": job,
		"introduction": introduction,
		"id": id,

	}};
	db.updateOne("about_outstanding", whereStr, updateStr).then((success) => {
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

/** 学校领导-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	let whereStr = {};
	/** 参数校验区域 */
	const sortStr = { "order": -1 };
	const limitStr = {};
	
	await Promise.all([db.findByPage("about_outstanding", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("about_outstanding")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 新闻快讯-删除 */
router.post("/del", (req, res) => {
	let { id, picSrc } = req.body;
	const delStr = { "id": id };
	db.deleteOne("about_outstanding", delStr).then((success) => {
		picSrc.forEach((item) => {
			let target = utils.getAbsolutePath(item);
			if (fs.existsSync(target)) {
				fs.unlink(target, (err) => {
					if (err) throw new Error("删除失败");
				});
			}
		});
		res.status(200).send({
			msg: "删除成功",
			code: 200,
			result: success
		});
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		});
	});
});

/** 学校领导-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { addViews, id } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("about_outstanding", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("about_outstanding", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 学校领导-移动 */
router.post("/move", (req, res) => {
	const { fromId, fromOrder, toId, toOrder } = req.body;
	fromFindStr = { "id": fromId };
	fromUpdateStr = { $set: { "order": toOrder }};
	toFindStr = { "id": toId };
	toUpdateStr = { $set: { "order": fromOrder }};
	
	db.updateOne("about_outstanding", fromFindStr, fromUpdateStr).then((move) => {
		db.updateOne("about_outstanding", toFindStr, toUpdateStr).then((move2) => {
			res.status(200).send({ msg: "移动成功", code: 200 });
		});
	}).catch((err) => {
		res.status(200).send({ msg: "移动失败", code: 500 });
	});
});

module.exports = router;