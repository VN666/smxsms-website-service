const express = require("express");
const multer = require("multer");
const app = express();
const router = express.Router();
const fs = require("fs");
const path = require("path");
const utils = require("../../../tools/utils.js");

let category = "";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const target = utils.getAssetsRoute("files");
		cb(null, target);
	},
	filename: function (req, file, cb) {
		cb(null, utils.getFileHashName(file.originalname));
	}
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), function(req, res, next) {
	let file = req.file;
	const callbackUrl = `https://${global.domain}/${file.path}`;
	res.status(200).send({ code: 200, msg: "上传成功", url: callbackUrl });
});

module.exports = router;