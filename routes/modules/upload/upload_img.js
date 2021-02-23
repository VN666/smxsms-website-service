const express = require("express");
const multer = require("multer");
const app = express();
const router = express.Router();
const fs = require("fs");
const path = require("path");
const utils = require("../../../tools/utils.js");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/imgs/temp");
	},
	filename: function (req, file, cb) {
		cb(null, utils.getFileHashName(file.originalname));
	}
});

const upload = multer({ storage: storage });

router.post("/", upload.single('file'), function(req, res, next) {
	let file = req.file;
	const tempUrl = "https://" + global.domain + "/public/imgs/temp/" + file.filename;
	res.json({ url: tempUrl });    
});

module.exports = router;