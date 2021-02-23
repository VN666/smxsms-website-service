const uuidv1 = require("uuid/v1");
const moment = require("moment");

module.exports.getAbsolutePath = function (url) {
	const tempUrl = url.split("//")[1];
	return tempUrl.substring(tempUrl.indexOf("/") + 1, tempUrl.length);
}

module.exports.getFileHashName = function (filename) {
	const index = filename.lastIndexOf(".");
	return filename.substr(0, index) + "-oss-" + moment().format("YYYYMMDDHHmmss") + "-" + uuidv1().replace(/-/g, "") + filename.substring(index, filename.length);
}