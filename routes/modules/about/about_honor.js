const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 学校荣誉-添加 */
router.post("/add", (req, res) => {
	let { headline, subTitle, author, timecreate, publisher, origin, originDes, isTop, content, checked, views, picSrc, category, tempSrc } = req.body;
	
	/** 参数校验区域 */

	const assets = utils.assetsHandle(content, picSrc, tempSrc, category);

	const insertStr = { 
		headline: headline,	timecreate: timecreate,	publisher: publisher, isTop: isTop, topTime: timecreate, content: assets.content, checked: checked, id: uuidv1(), views: 0, picSrc: assets.picSrc
	};

	db.insertOne("about_honor", insertStr).then((success) => {
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

/** 学校荣誉-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, headline, publisher, startTime, endTime } = req.body;

	/** 参数校验区域 */
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	const limitStr = {};
	const regHeadline = new RegExp(headline, "i");
	const regPublisher = new RegExp(publisher, "i");
	const whereStr = {
		"headline": { $regex: regHeadline },
		"publisher": { $regex: regPublisher },
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!headline) delete whereStr.headline;
	if (!publisher) delete whereStr.publisher;
	if (!startTime && !endTime) delete whereStr.$and;
	
	await Promise.all([db.findByPage("about_honor", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("about_honor")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 学校荣誉-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	await Promise.all([db.findByPage("about_honor", {}, {"content": 0}, sortStr, pageNo, pageSize), db.getTotal("about_honor")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

/** 学校荣誉-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { id, addViews } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("about_honor", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("about_honor", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 学校荣誉-置顶/取消 */
router.post("/changeIsTop", (req, res) => {
	let { id, isTop, timecreate } = req.body;	
	let whereStr = { "id": id };
	let updateStr = { $set: {
		"isTop": isTop ? true : false, 
		"topTime": isTop ? moment().format("YYYY-MM-DD HH:mm:ss") : timecreate
	}};

	db.updateOne("about_honor", whereStr, updateStr).then((success) => {
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

/** 学校荣誉-编辑 */
router.post("/edit", (req, res) => {
	let { headline, timecreate, publisher, isTop, content, checked, id, topTime, picSrc, tempSrc, category} = req.body;

	const assets = utils.assetsHandle(content, picSrc, tempSrc, category);

	let whereStr = { "id": id };
	let updateStr = { $set: {
		"headline": headline,
		"timecreate": timecreate,
		"publisher": publisher,
		"isTop": isTop,
		"content": assets.content,
		"checked": checked,
		"topTime": isTop ? topTime : timecreate,
		"picSrc": assets.picSrc
	}};

	db.updateOne("about_honor", whereStr, updateStr).then((success) => {
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

/** 学校荣誉-删除 */
router.post("/del", (req, res) => {
	let { id, picSrc } = req.body;
	const delStr = { "id": id };
	db.deleteOne("about_honor", delStr).then((success) => {
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

module.exports = router;
