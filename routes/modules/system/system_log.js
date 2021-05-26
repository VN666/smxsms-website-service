const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const CryptoJS = require("crypto-js");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const fs = require("fs");
// const nodeExcel = require("excel-export");

const db = new Dao();

/** 网站管理-操作日志-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, username, opType, modulename, startTime, endTime  } = req.body;
	
	const regUsername = new RegExp(username, "i");
	whereStr = {
		"username": { $regex: regUsername },
		"opCode": opType,
		"module": modulename,
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!username) delete whereStr.username;
	if (!opType) delete whereStr.opCode;
	if (!modulename) delete whereStr.module;
	if (!startTime && !endTime) delete whereStr.$and;
	limitStr = {};
	sortStr = { "timecreate": -1 }; 

	
	await Promise.all([db.findByPage("operation_log", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("operation_log")]).then((array) => {
		res.status(200).send({ msg: "查询成功", code: 200, data: { list: array[0], total: array[1], opTypes: opTypes }});
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

// router.post("/export", async (req, res) => {
// 	let { pageNo, pageSize, username, opType, modulename, startTime, endTime  } = req.body;
	
// 	const regUsername = new RegExp(username, "i");
// 	whereStr = {
// 		"username": { $regex: regUsername },
// 		"opCode": opType,
// 		"module": modulename,
// 		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
// 	};
// 	if (!username) delete whereStr.username;
// 	if (!opType) delete whereStr.opCode;
// 	if (!modulename) delete whereStr.module;
// 	if (!startTime && !endTime) delete whereStr.$and;
// 	limitStr = {};
// 	sortStr = { "timecreate": -1 };

// 	db.findByPage("operation_log", whereStr, limitStr, sortStr, pageNo, pageSize).then((data) => {
// 		try {
// 			let conf = {};
// 			conf.name = "sheet";
// 			conf.cols = [
// 				{ caption: "IP", type: "string" },
// 				{ caption: "用户名", type: "string" },
// 				{ caption: "操作类型", type: "string" },
// 				{ caption: "模块", type: "string" },
// 				{ caption: "操作内容", type: "string" },
// 				{ caption: "实践", type: "string" },
// 			];
// 			let arr = [];
// 			data.forEach((item) => {
// 				let keys = Object.kes(item);
// 				let temp = [];
// 				keys.forEach((key) => temp.push(item[key]));
// 				arr.push(temp);
// 			});
// 			conf.rows = arr;
// 			let resTemp = nodeExcel.execute(conf);
// 	        res.setHeader("Content-Type", "application/vnd.openxmlformats");
// 	        res.setHeader("Content-Disposition", "attachment; filename=" + "log.xlsx");
// 	        res.end(resTemp, "binary");
// 		} catch(err) {
// 			res.status(200).send({ msg: err.message, code: 500 });
// 		}
// 	});

// });

const opTypes = [
	{ label: "删除", value: "0" },
	{ label: "添加", value: "1" },
	{ label: "编辑", value: "2" },
	{ label: "移动", value: "3" },
	{ label: "置顶/取消置顶", value: "4" },
	{ label: "登录", value: "5" },
]

module.exports = router;