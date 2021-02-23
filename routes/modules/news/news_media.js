const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");

const fs = require("fs");
const db = new Dao();

/** 媒体报道-添加 */
router.post("/add", (req, res) => {

	let { headline, link, author, publisher, timecreate, isTop, content, checked, picSrc, category, tempSrc } = req.body;
	
	/** 参数校验区域 */
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

	const insertStr = { 
		headline: headline, link: link, author: author,	publisher: publisher, timecreate: timecreate, isTop: isTop, topTime: timecreate, content: content, checked: checked, id: uuidv1(), views: 0, picSrc: picSrc
	};

	db.insertOne("news_media", insertStr).then((success) => {
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

/** 媒体报道-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, headline, author, publisher, startTime, endTime } = req.body;

	/** 参数校验区域 */
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	const limitStr = {};
	const regHeadline = new RegExp(headline, "i");
	const regAuthor = new RegExp(author, "i");
	const regPublisher = new RegExp(publisher, "i");
	const whereStr = {
		"headline": { $regex: regHeadline },
		"author": { $regex: regAuthor },
		"publisher": { $regex: regPublisher },
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!headline) delete whereStr.headline;
	if (!author) delete whereStr.author;
	if (!publisher) delete whereStr.publisher;
	if (!startTime && !endTime) delete whereStr.$and;
	
	await Promise.all([db.findByPage("news_media", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("news_media")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});	
});

/** 媒体报道-置顶/取消 */
router.post("/changeIsTop", (req, res) => {
	let { id, isTop, timecreate } = req.body;	
	let whereStr = { "id": id };
	let updateStr = { $set: {
		"isTop": isTop ? true : false, 
		"topTime": isTop ? moment().format("YYYY-MM-DD HH:mm:ss") : timecreate
	}};

	db.updateOne("news_media", whereStr, updateStr).then((success) => {
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

/** 媒体报道-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { id, addViews } = req.body;
	const findStr = { "id": id };
	let res1 = await db.find("news_media", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	if (addViews) {
		let res2 = await db.addViews("news_media", findStr).catch((err) => {
			res.status(200).send({ msg: err, code: 500});
		});
	}
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: res1[0]
	});
});

/** 媒体报道-编辑 */
router.post("/edit", (req, res) => {
	let { headline, subTitle, author, timecreate, publisher, origin, originDes, isTop, content, checked, id, topTime, picSrc, tempSrc, category} = req.body;

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
	
	let whereStr = { "id": id };
	let updateStr = { $set: {
		"headline": headline,
		"author": author,
		"timecreate": timecreate,
		"publisher": publisher,
		"isTop": isTop,
		"content": content,
		"checked": checked,
		"topTime": isTop ? topTime : timecreate,
		"picSrc": picSrc
	}};

	db.updateOne("news_media", whereStr, updateStr).then((success) => {
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

/** 媒体报道-删除 */
router.post("/del", (req, res) => {
	let { id, picSrc } = req.body;
	const delStr = { "id": id };
	db.deleteOne("news_media", delStr).then((success) => {
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

/** 媒体报道-查询列表 */
router.post("/queryList", async (req, res) => {
	let { pageNo, pageSize } = req.body;
	const sortStr = { "isTop": -1, "createtime": -1, "topTime": -1 };
	await Promise.all([db.findByPage("news_media", {}, {"content": 0}, sortStr, pageNo, pageSize), db.getTotal("news_media")]).then((array) => {
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