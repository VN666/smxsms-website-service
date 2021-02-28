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

/** 封面图片-查询数量  */
router.post("/getTotal", (req, res) => {
	db.getTotal("bg_imgs").then((len) => {
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

/** 封面图片-上传 */
router.post("/add", (req, res) => {
	const { order, picSrc } = req.body;
	const insertStr = { id: uuidv1(), picSrc: picSrc, timecreate: moment().format("YYYY-MM-DD HH:mm:ss"), order: order };
	db.insertOne("bg_imgs", insertStr).then((success) => {
		res.status(200).send({ msg: "添加成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 封面图片-查询 */
router.post("/query", async (req, res) => {
	const { pageNo, pageSize } = req.body;
	const findStr = {};
	const limitStr = {};
	const sortStr = { "order": -1 };

	await Promise.all([db.findByPage("bg_imgs", findStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("bg_imgs")]).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: { list: array[0], total: array[1] }
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

/** 封面图片-删除 */
router.post("/del", (req, res) => {
	const { id, picSrc } = req.body;
	const delStr = { "id": id};
	db.deleteOne("bg_imgs", delStr).then(async (success) => {		
		try {
			await utils.removeAssets(picSrc);
			res.status(200).send({ msg: "删除成功", code: 200, result: success });
		} catch (e) {
			res.status(200).send({ code: 500, msg: "图片删除失败", result: e.message })
		}
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));
});

/** 封面图片-移动 */
router.post("/move", (req, res) => {
	const { fromId, fromOrder, toId, toOrder } = req.body;
	fromFindStr = { "id": fromId };
	fromUpdateStr = { $set: { "order": toOrder }};
	toFindStr = { "id": toId };
	toUpdateStr = { $set: { "order": fromOrder }};
	
	db.updateOne("bg_imgs", fromFindStr, fromUpdateStr).then((move) => {
		db.updateOne("bg_imgs", toFindStr, toUpdateStr).then((move2) => {
			res.status(200).send({ msg: "移动成功", code: 200 });
		});
	}).catch((err) => {
		res.status(200).send({ msg: "移动失败", code: 500 });
	});
});

router.post("/delTest", (req, res) => {
	const {id, picSrc} = req.body;
	const target = utils.getAbsolutePath(picSrc);
	if (fs.existsSync(target)) {
		fs.unlink(target, (err) => {
			if (err) res.status(200).send({ msg: "删除失败", code: 500 });
			res.status(200).send({ msg: "删除成功", code: 200, result:res });
		})
		res.status(200).send({ msg: "存在", code: 200, result:"ok" });
	} else {
		res.status(200).send({ msg: "不存在", code: 200, result:"ku" });
	}
});


module.exports = router;