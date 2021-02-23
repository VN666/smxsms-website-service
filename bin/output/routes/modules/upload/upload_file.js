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
		cb(null, `${global.API.assetsPath}files/`);
	},
	filename: function (req, file, cb) {
		cb(null, utils.getFileHashName(file.originalname));
	}
});

const upload = multer({ storage: storage });

router.post("/", upload.array("file"), function(req, res, next) {
	category = req.body.category;
	let files = req.files;
	responseUrls = [];
	files.forEach((item) => {
		let sourceUrl = path.join(`${global.API.assetsPath}files`, item.filename);
		let destUrl = path.join(`${global.API.assetsPath}files`, category, item.filename);
		fs.rename(sourceUrl, destUrl, (err) => {
			if (err) res.status(200).send({ code: 500, msg: "文件上传失败" });
		});
		let responseUrl = `${global.API.domain}oss/${global.API.projectPath}files/${category}/${item.filename}`
		responseUrls.push(responseUrl);	
	});
	res.status(200).send({ code: 200, msg: "上传成功", url: responseUrls });
    
});

module.exports = router;