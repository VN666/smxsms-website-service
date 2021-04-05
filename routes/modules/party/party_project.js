const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const fs = require("fs");

const db = new Dao();

/** 二中党建-活动项目-添加 */
router.post("/add", async (req, res) => {
	let { headline, author, timecreate, isTop, content, picSrc, fileList, fileListSrc, checked, removeSrc } = req.body;
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
    const publisher = utils.getJwtCode(token).username;
    const publisherDepartmentId = (await utils.getUserData(publisher)).departmentId;
    const publisherDepartmentName = (await db.find("system_department", {id: publisherDepartmentId}))[0].name;
	try { 
		await utils.removeAssets(removeSrc);
	} catch (e) { 
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}

	const insertStr = {	headline: headline,	author: author,	publisher: publisher, timecreate: timecreate, isTop: isTop,	topTime: timecreate, content: content, picSrc: picSrc, fileList: fileList, fileListSrc: fileListSrc, checked: checked,
		id: uuidv1(), views: 0, publisherDepartmentId: publisherDepartmentId, publisherDepartmentName: publisherDepartmentName
	}
	db.insertOne("party_project", insertStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 二中党建-活动项目-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, headline, author, startTime, endTime } = req.body;

	/** 参数校验区域 */
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	const limitStr = {};
	const regHeadline = new RegExp(headline, "i");
	const regAuthor = new RegExp(author, "i");
	const whereStr = {
		"headline": { $regex: regHeadline },
		"author": { $regex: regAuthor },
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!headline) delete whereStr.headline;
	if (!author) delete whereStr.author;
	if (!startTime && !endTime) delete whereStr.$and;
	
	await Promise.all([db.findByPage("party_project", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("party_project")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 二中党建-活动项目-置顶/取消 */
router.post("/changeIsTop", (req, res) => {
	let { id, isTop, timecreate } = req.body;	
	let whereStr = { "id": id };
	let updateStr = { $set: {
		"isTop": isTop ? true : false, 
		"topTime": isTop ? moment().format("YYYY-MM-DD HH:mm:ss") : timecreate
	}};

	db.updateOne("party_project", whereStr, updateStr).then((success) => {
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

/** 二中党建-活动项目-删除 */
router.post("/del", async (req, res) => {
	let { id, fileListSrc, picSrc } = req.body;
	const delStr = { "id": id };
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
    const publisher = utils.getJwtCode(token).username;
    const publisherDepartmentId = (await utils.getUserData(publisher)).departmentId;
    const publisherDepartmentName = (await db.find("system_department", {id: publisherDepartmentId}))[0].name;
    const notHasDelAuth = await utils.notHasDelAuth(token, id, "party_project");

    if (notHasDelAuth) {
    	res.status(200).send({ msg: "删除失败，没有权限", code: 500, result: {} });
    	return;
    } 
	db.deleteOne("party_project", delStr).then(async (success) => {
		try {
			await utils.removeAssets([...fileListSrc, ...picSrc]);
			res.status(200).send({ msg: "删除成功", code: 200, result: success });
		} catch (e) {
			res.status(200).send({ code: 500, msg: "图片删除失败", result: e.message })
		}
		
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

/** 二中党建-活动项目-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { id, addViews } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("party_project", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("party_project", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 二中党建-活动项目-编辑 */
router.post("/edit", async (req, res) => {
	let { id, headline, author, timecreate, isTop, content, picSrc, fileList, fileListSrc, checked, topTime, removeSrc } = req.body;
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];
    const publisher = utils.getJwtCode(token).username;
    const publisherDepartmentId = (await utils.getUserData(publisher)).departmentId;
    const publisherDepartmentName = (await db.find("system_department", {id: publisherDepartmentId}))[0].name;
    const notHasDelAuth = await utils.notHasDelAuth(token, id, "party_project");

    if (notHasDelAuth) {
    	res.status(200).send({ msg: "编辑失败，没有权限", code: 500, result: {} });
    	return;
    }
	try {
		await utils.removeAssets(removeSrc);
	} catch (e) {
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null });
	}

	let whereStr = { "id": id };

	let updateStr = { $set: {
		"headline": headline,
		"author": author,	
		"timecreate": timecreate,		
		"isTop": isTop,
		"content": content,
		"picSrc": picSrc,
		"fileList": fileList,
		"fileListSrc": fileListSrc,
		"checked": checked,
		"topTime": isTop ? topTime : timecreate,
		"publisher": publisher,
		"publisherDepartmentId": publisherDepartmentId,
		"publisherDepartmentName": publisherDepartmentName
	}};

	db.updateOne("party_project", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

/** 二中党建-活动项目-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	await Promise.all([db.findByPage("party_project", {}, {"content": 0}, sortStr, pageNo, pageSize), db.getTotal("party_project")]).then((array) => {
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