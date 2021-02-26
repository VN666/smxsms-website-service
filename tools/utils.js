const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("./DAO.js");
const fs = require("fs");
const db = new Dao();

module.exports.getAbsolutePath = function (url) {
	const tempUrl = url.split("//")[1];
	return tempUrl.substring(tempUrl.indexOf("/") + 1, tempUrl.length);
}

module.exports.getFileHashName = function (filename) {
	const index = filename.lastIndexOf(".");
	return filename.substr(0, index) + "-oss-" + moment().format("YYYYMMDDHHmmss") + "-" + uuidv1().replace(/-/g, "") + filename.substring(index, filename.length);
}

module.exports.assetsHandle = function (content, picSrc, tempSrc, category) {
	picSrc.forEach((src) => content = content.replace(RegExp(src, "g"), src.replace(/temp/g, category)));
	
	picSrc = picSrc.map((src) => src.replace(RegExp(src, "g"), src.replace(/temp/g), category));
	tempSrc = tempSrc.map((src) => path.basename(src));
	picSrc = picSrc.map((src) => path.basename(src));
	const addSrc = picSrc.filter((src) => !tempSrc.includes(src));
	const removeSrc = tempSrc.filter((src) => !picSrc.includes(src));	
	addSrc.forEach((src) => {
		if (src.includes(".mp4")) {
			const sourceUrl = path.join("public/video/temp", path.basename(src));
			const destUrl = path.join("public/video", category, path.basename(src));
			fs.rename(sourceUrl, destUrl, async (err) => {
				if (err) res.status(200).send({ msg: "图片添加失败", code: 500 });
			});			
		} else {
			const sourceUrl = path.join("public/imgs/temp", path.basename(src));
			const destUrl = path.join("public/imgs", category, path.basename(src));
			fs.rename(sourceUrl, destUrl, async (err) => {
				if (err) res.status(200).send({ msg: "图片添加失败", code: 500 });
			});
		}		
	});
	removeSrc.forEach((src) => {
		if (src.includes(".mp4")) {
			const targetUrl = path.join("public/video", category, path.basename(src));
			if (fs.existsSync(targetUrl)) {
				fs.unlink(targetUrl, (err) => {
					if (err) res.status(200).send({ msg: "图片删除失败", code: 500 });
				});
			}
		} else {
			const targetUrl = path.join("public/imgs", category, path.basename(src));
			if (fs.existsSync(targetUrl)) {
				fs.unlink(targetUrl, (err) => {
					if (err) res.status(200).send({ msg: "图片删除失败", code: 500 });
				});
			}
		}		
	});
	picSrc = picSrc.map((src) => src.includes(".mp4") ? `https://${global.domain}/public/video/${category}/${src}` :`https://${global.domain}/public/imgs/${category}/${src}`);
	return {
		picSrc: picSrc,
		content: content
	}
}