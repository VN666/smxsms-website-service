const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const Dao = require("./DAO.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const db = new Dao();

module.exports.getAssetsRoute = function (route) {
	const targetRoute = path.join("public/assets", route, moment().format("YYYY-MM"));
	if (fs.existsSync(targetRoute)) return targetRoute
	else {
		fs.mkdirSync(targetRoute); 	
		return targetRoute
	}
}

module.exports.getAbsolutePath = function (url) {
	const tempUrl = url.split("//")[1];
	return tempUrl.substring(tempUrl.indexOf("/") + 1, tempUrl.length);
}

module.exports.getFileHashName = function (filename) {
	const index = filename.lastIndexOf(".");
	return filename.substr(0, index) + "-oss-" + moment().format("YYYYMMDDHHmmss") + "-" + uuidv1().replace(/-/g, "") + filename.substring(index, filename.length);
}

module.exports.removeAssets = function (removeSrc) {	
	return new Promise((resolve, reject) => {
		removeSrc.forEach((src) => {
			src = src.match(/public(\S*)/gi)[0];
			if (fs.existsSync(src)) fs.unlink(src, (err) =>reject(err));			
		});
		resolve();
	});
}

module.exports.getJwtCode = function (token) {
	return jwt.verify(token, global.salt, (err, code) => code);
}

const treeDataFilter = (treeData, codes, id = "code", children = "children") => {
	return treeData.filter((node) => {
		if (node[children] && codes.includes(node[id])) node[children] = treeDataFilter(node[children], codes, id, children);
		return codes.includes(node[id]);
	})
};

module.exports.encodeBase64 = (words) => {
	return CryptoJS.SHA256(words + global.salt2).toString();
}

module.exports.treeDataFilter = treeDataFilter;

