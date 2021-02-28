const express = require("express");
const multer = require("multer");
const app = express();
const router = express.Router();
const fs = require("fs");
const path = require("path");
const utils = require("../../../tools/utils.js");


router.post("/", async function (req, res, next) {
	const filePath = req.body.filePath;
	try {
		await utils.removeAssets([filePath]);
		res.status(200).send({ msg: "删除成功", code: 200, result: success });
	} catch (e) {
		res.status(200).send({ code: 500, msg: "图片删除失败", result: null })
	}
});

module.exports = router;