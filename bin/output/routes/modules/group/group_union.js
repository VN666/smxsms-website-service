const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const fs = require("fs");

const db = new Dao();

/** 招生信息-添加 */
router.post("/add", (req, res) => {
	let { headline, department, author, publisher, timecreate, isTop, content, picSrc, fileList, fileListSrc, checked } = req.body;
	const insertStr = {	headline: headline,	department: department,	author: author,	publisher: publisher, timecreate: timecreate, isTop: isTop,	topTime: timecreate, content: content, picSrc: picSrc, fileList: fileList, fileListSrc: fileListSrc, checked: checked,
		id: uuidv1(), views: 0
	}
	db.insertOne("group_union", insertStr).then((success) => {
		res.status(200).send({
			msg: "保存成功",
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

/** 招生信息-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, headline, author, department, startTime, endTime } = req.body;

	/** 参数校验区域 */
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	const limitStr = {};
	const regHeadline = new RegExp(headline, "i");
	const regAuthor = new RegExp(author, "i");
	const regDepartment = new RegExp(department, "i");
	const whereStr = {
		"headline": { $regex: regHeadline },
		"author": { $regex: regAuthor },
		"department": { $regex: regDepartment },
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!headline) delete whereStr.headline;
	if (!author) delete whereStr.author;
	if (!department) delete whereStr.publisher;
	if (!startTime && !endTime) delete whereStr.$and;
	
	await Promise.all([db.findByPage("group_union", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("group_union")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 招生信息-置顶/取消 */
router.post("/changeIsTop", (req, res) => {
	let { id, isTop, timecreate } = req.body;	
	let whereStr = { "id": id };
	let updateStr = { $set: {
		"isTop": isTop ? true : false, 
		"topTime": isTop ? moment().format("YYYY-MM-DD HH:mm:ss") : timecreate
	}};

	db.updateOne("group_union", whereStr, updateStr).then((success) => {
		res.status(200).send({
			msg: isTop ? "置顶成功" : "取消置顶成功",
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

/** 招生信息-删除 */
router.post("/del", (req, res) => {
	let { id, fileListSrc, picSrc } = req.body;
	const delStr = { "id": id };
	db.deleteOne("group_union", delStr).then((success) => {
		[...fileListSrc, ...picSrc].forEach((item) => {
			let target = utils.getAbsolutePath(item);
			if (fs.existsSync(target)) {
				fs.unlink(target, (err) => {
					if (err) throw new Error("删除失败");
				});
			}
		});
		res.status(200).send({ msg: "删除成功", code: 200, result: success });
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		});
	});
});

/** 招生信息-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { id, addViews } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("group_union", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("group_union", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 招生信息-编辑 */
router.post("/edit", (req, res) => {
	let { id, headline, department, author, publisher, timecreate, isTop, content, picSrc, fileList, fileListSrc, checked, topTime } = req.body;
	let whereStr = { "id": id };

	let updateStr = { $set: {
		"headline": headline,
		"department": department,
		"author": author,
		"publisher": publisher,		
		"timecreate": timecreate,		
		"isTop": isTop,
		"content": content,
		"picSrc": picSrc,
		"fileList": fileList,
		"fileListSrc": fileListSrc,
		"checked": checked,
		"topTime": isTop ? topTime : timecreate
	}};

	db.updateOne("group_union", whereStr, updateStr).then((success) => {
		res.status(200).send({
			msg: "保存成功",
			code: 200,
			result: success
		})
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		})
	});
});

/** 招生信息-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	await Promise.all([db.findByPage("group_union", {}, {"content": 0}, sortStr, pageNo, pageSize), db.getTotal("group_union")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

module.exports = router;