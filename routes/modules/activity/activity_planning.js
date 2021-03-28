const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const fs = require("fs");

const db = new Dao();

/** 德育活动-德育规划-添加 */
router.post("/add", async (req, res) => {
	let { headline, department, author, publisher, timecreate, isTop, content, picSrc, fileList, fileListSrc, checked, removeSrc } = req.body;
	
	try { 
		await utils.removeAssets(removeSrc);
	} catch (e) { 
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}

	const insertStr = {	headline: headline,	department: department,	author: author,	publisher: publisher, timecreate: timecreate, isTop: isTop,	topTime: timecreate, content: content, picSrc: picSrc, fileList: fileList, fileListSrc: fileListSrc, checked: checked,
		id: uuidv1(), views: 0
	}
	db.insertOne("activity_planning", insertStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 德育活动-德育规划-分页查询 */
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
	
	await Promise.all([db.findByPage("activity_planning", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("activity_planning")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 德育活动-德育规划-置顶/取消 */
router.post("/changeIsTop", (req, res) => {
	let { id, isTop, timecreate } = req.body;	
	let whereStr = { "id": id };
	let updateStr = { $set: {
		"isTop": isTop ? true : false, 
		"topTime": isTop ? moment().format("YYYY-MM-DD HH:mm:ss") : timecreate
	}};

	db.updateOne("activity_planning", whereStr, updateStr).then((success) => {
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

/** 德育活动-德育规划-删除 */
router.post("/del", async (req, res) => {
	let { id, fileListSrc, picSrc } = req.body;
	const delStr = { "id": id };
	db.deleteOne("activity_planning", delStr).then(async (success) => {
		try {
			await utils.removeAssets([...fileListSrc, ...picSrc]);
			res.status(200).send({ msg: "删除成功", code: 200, result: success });
		} catch (e) {
			res.status(200).send({ code: 500, msg: "图片删除失败", result: e.message })
		}
		
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

/** 德育活动-德育规划-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { id, addViews } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("activity_planning", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("activity_planning", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 德育活动-德育规划-编辑 */
router.post("/edit", async (req, res) => {
	let { id, headline, department, author, publisher, timecreate, isTop, content, picSrc, fileList, fileListSrc, checked, topTime, removeSrc } = req.body;

	try {
		await utils.removeAssets(removeSrc);
	} catch (e) {
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}

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

	db.updateOne("activity_planning", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

/** 德育活动-德育规划-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	await Promise.all([db.findByPage("activity_planning", {}, {"content": 0}, sortStr, pageNo, pageSize), db.getTotal("activity_planning")]).then((array) => {
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