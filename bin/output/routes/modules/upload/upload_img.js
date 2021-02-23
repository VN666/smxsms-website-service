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
		cb(null, `${global.API.assetsPath}imgs/`);
	},
	filename: function (req, file, cb) {
		cb(null, utils.getFileHashName(file.originalname));
	}
});

const upload = multer({ storage: storage });

router.post("/", upload.single('file'), function(req, res, next) {
	let file = req.file;
	category = req.body.category;
	const sourceUrl = path.join(`${global.API.assetsPath}imgs`, file.filename);
	const destUrl = path.join(`${global.API.assetsPath}imgs`, category, file.filename);
	fs.rename(sourceUrl, destUrl, (err) => {
		if (err) {
			throw err;
		} else {	
			res.json({ url: `${global.API.domain}oss/${global.API.projectPath}imgs/${category}/${file.filename}` });
		}
	});
    
});

module.exports = router;