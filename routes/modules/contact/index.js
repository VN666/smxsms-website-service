const express = require("express");
const router = express.Router();
const Dao = require("../../../tools/DAO.js");
const moment = require("moment");
const utils = require("../../../tools/utils.js");
const uuidv1 = require("uuid/v1");
const db = new Dao();

router.post("/query", (req, res) => {
	db.find("admin_contact", {}).then((array) => {
		res.status(200).send({
			msg: "查询成功",
			code: 200,
			data: array[0]
		});
	}).catch((err) => {
		res.status(200).send({ msg: err, code: 500 });
	});
});

router.post("/update", (req, res) => {
	// let { id, phone, email, address, postCode } = req.body;
	let { id, phone, address, postCode } = req.body;
	const whereStr = { "id": id };
	const updateStr = { $set: {
		"phone": phone,
		// "email": email,
		"address": address,
		"postCode": postCode
	}};
	db.updateOne("admin_contact", whereStr, updateStr).then((success) => {
		res.status(200).send({
			msg: "保存成功",
			code: 200,
			result: success
		});
	}).catch((err) => {
		res.status(200).send({
			msg: err,
			code: 500
		})
	});
});

module.exports = router;