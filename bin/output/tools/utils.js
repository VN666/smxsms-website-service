const uuidv1 = require("uuid/v1");

module.exports.getAbsolutePath = function (url) {
	const tempUrl = url.split("//")[1];
	return tempUrl.substring(tempUrl.indexOf("/") + 1, tempUrl.length);
}

module.exports.getFileHashName = function (filename) {
	const index = filename.lastIndexOf(".");
	return filename.substr(0, index) + "-oss-" + uuidv1() + filename.substring(index, filename.length);
}