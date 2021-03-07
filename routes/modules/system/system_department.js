const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const fs = require("fs");

const db = new Dao();

/** 网站管理-科室管理-添加 */
router.post("/add", async (req, res) => {
	let { name, description } = req.body;
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
	const publisher = utils.getJwtCode(token).username;

	if (!name) {
		res.status(200).send({ code: 500, msg: "添加失败，科室名称不能为空" });
		return;
	}
	if (!publisher) {
		res.status(200).send({ code: 500, msg: "添加失败，用户存在异常" });
		return;
	}
	if (name.length >= 32) {
		res.status(200).send({ code: 500, msg: "添加失败，科室名称超过32位" });
		return;
	}
	if (description >= 64) {
		res.status(200).send({ code: 500, msg: "添加失败，科室名称超过64位" });
		return
	}

	const findStr = { name: name };
	let res1 = await db.find("system_department", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
		return;
	});

	if (!!res1.length) {
		res.status(200).send({ msg: "添加失败，科室名称被占用", code: 500 });
		return;
	}

	const id = uuidv1();	
	const timecreate = moment().format("YYYY-MM-DD HH:mm:ss");
	const timeedit = moment().format("YYYY-MM-DD HH:mm:ss");
	const insertStr = { id: id, name: name, description: description, publisher: publisher, timecreate: timecreate, timeedit: timeedit };

	db.insertOne("system_department", insertStr).then((success) => {
		res.status(200).send({ msg: "添加成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 网站管理-科室管理-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, name, description, publisher, startTime, endTime } = req.body;

	/** 参数校验区域 */
	const sortStr = { "timecreate": -1 };
	const limitStr = {};
	const regName = new RegExp(name, "i");
	const regDescription = new RegExp(description, "i");
	const regPublisher = new RegExp(publisher, "i");
	const whereStr = {
		"name": { $regex: regName },
		"description": { $regex: regDescription },
		"publisher": { $regex: regPublisher },
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!name) delete whereStr.name;
	if (!description) delete whereStr.description;
	if (!publisher) delete whereStr.publisher;
	if (!startTime && !endTime) delete whereStr.$and;
	
	await Promise.all([db.findByPage("system_department", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("system_department")]).then((array) => {
		res.status(200).send({ msg: "查询成功", code: 200, data: { list: array[0], total: array[1] }});
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));	
});

/** 网站管理-科室管理-科室名称唯一性校验 */
router.post("/isOne", async (req, res) => {
	const { name } = req.body;
	const findStr = { name: name };
	db.find("system_department", findStr).then((data) => {
		res.status(200).send({ isOne: !data.length});
	});
});

/** 网站管理-科室管理-编辑 */
router.post("/edit", async (req, res) => {
	let { id, name, description, timecreate } = req.body;
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
	const publisher = utils.getJwtCode(token).username;

	if (id === 0) {
		res.status(200).send({ code: 500, msg: "无法编辑管理员" });
		return;
	}
	if (!id) {
		res.status(200).send({ code: 500, msg: "编辑失败，id不能为空" });
		if (id === 0) res.status(200).send({ code: 500, msg: "无法编辑管理员" });
		return;
	}
	if (!name) {
		res.status(200).send({ code: 500, msg: "编辑失败，科室名称不能为空" });
		return;
	}
	if (!publisher) {
		res.status(200).send({ code: 500, msg: "编辑失败，用户存在异常" });
		return;
	}
	if (name.length >= 32) {
		res.status(200).send({ code: 500, msg: "编辑失败，科室名称超过32位" });
		return;
	}
	if (description >= 64) {
		res.status(200).send({ code: 500, msg: "编辑失败，科室名称超过64位" });
		return
	}

	const findStr2 = { id: id };
	let res2 = await db.find("system_department", findStr2).catch((err) => {
		res.status(200).send({ msg: err.message, code: 500});
		return;
	});
	if (!res2.length) {
		res.status(200).send({ msg: "用户不存在", code: 500});
		return;
	}

	const findStr = { name: name };
	let res1 = await db.find("system_department", findStr).catch((err) => {
		res.status(200).send({ msg: err.message, code: 500});
		return;	
	});
	if (!!res1.length && !!res1.find((item) => item.name === name) && res1.find((item) => item.name === name).id !== id) {
		res.status(200).send({ msg: "添加失败，科室名称被占用", code: 500 });
		return;
	}

	let whereStr = { "id": id };
	let updateStr = { $set: {
		"name": name,
		"description": description,
		"publisher": publisher,
		"timecreate": timecreate,		
		"timeedit": moment().format("YYYY-MM-DD HH:mm:ss")
	}};

	db.updateOne("system_department", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "编辑成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

router.post("/del", async (req, res) => {
	const { id } =  req.body;

	if (id === 0) {
		res.status(200).send({ code: 500, msg: "无法删除管理员" });
		return;
	}

	const findStr = { departmentId: id };
	let res1 = await db.find("admin_user", findStr).catch((err) => res.status(200).send({ msg: "id异常", code: 500 }));
	if (!!res1.length) {
		res.status(200).send({ code: 500, msg: "该科室下存在用户，请先删除用户再删除该科室" });
		return;
	}

	const delStr = { id: id };

	db.deleteOne("system_department", delStr).then((success) => {
		res.status(200).send({ msg: "删除成功", code: 200, result: success });
		return;
	}).catch((err) => res.status(200).send({ msg: "删除失败", code: 500, result: err.message }));
});


module.exports = router;