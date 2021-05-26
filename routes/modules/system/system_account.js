const express = require("express");
const router = express.Router();
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const path = require("path");
const CryptoJS = require("crypto-js");
const Dao = require("../../../tools/DAO.js");
const utils = require("../../../tools/utils.js");
const fs = require("fs");

const db = new Dao();

/** 网站管理-账号管理-分页查询 */
router.post("/query", async (req, res) => {
	let { pageNo, pageSize, startTime, endTime, username, departmentId } = req.body;

	/** 参数校验区域 */
	const sortStr = { "timecreate": -1 };
	const limitStr = {};
	const regUsername = new RegExp(username, "i");
	const whereStr = {
		"username": { $regex: regUsername },
		"departmentId": departmentId,
		"$and": [{"timecreate": { "$gte": startTime }}, {"timecreate": { "$lte": endTime }}]
	};
	if (!username) delete whereStr.username;
	if (!departmentId) delete whereStr.departmentId;
	if (!startTime && !endTime) delete whereStr.$and;
	
	await Promise.all([db.findByPage("admin_user", whereStr, limitStr, sortStr, pageNo, pageSize), db.getTotal("admin_user"), db.find("system_department", {})]).then((array) => {
		let deparmentMap = new Map();
		array[2].forEach((department) => deparmentMap.set(department.id, department.name));
		array[0].forEach((account) => {
			account.departmentName = deparmentMap.get(account.departmentId)
			account.authNames = account.auths.map((auth) => authMap.get(auth));
		});
		res.status(200).send({ msg: "查询成功", code: 200, data: { list: array[0], total: array[1], departments: array[2]}});
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));	
});

/** 网站管理-账号管理-根据ID查询单条 */
router.post("/queryById", async (req, res) => {
	let { id } = req.body;
	const findStr = { "uid": id };
	let res1 = await db.find("admin_user", findStr).catch((err) => {
		res.status(200).send({ msg: err, code: 500});
	});
	const { password, ...accountData } = res1[0];
	res.status(200).send({
		msg: "查询成功",
		code: 200,
		data: accountData
	});
});

/** 网站管理-账号管理-密码修改 */
router.post("/edit", async (req, res) => {
	let { id, password } = req.body;
	let whereStr = { "uid": id };
	if (!password) {
		res.status(200).send({ code: 500, msg: "添加失败，密码不能为空" });
		return;
	}
	if (!/[a-z]/g.test(password) || !/[A-Z]/g.test(password) || !/[0-9]/g.test(password) || !/[\~\!\@\#\$\%\^\&\*\(\)\_\+\=\-\<\>\?]/.test(password)) {
		res.status(200).send({ code: 500, msg: "添加失败，密码不合法" });
		return;
	}
	if (password.length < 6 || password.length > 18) {
		res.status(200).send({ code: 500, msg: "添加失败，密码不合法" });
		return;
	}
	let updateStr = { $set: {
		"password": CryptoJS.SHA256(utils.encodeBase64(password) + id).toString(),
	}};


	db.updateOne("admin_user", whereStr, updateStr).then((success) => {
		res.status(200).send({ msg: "保存成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));

});

router.post("/getAccountData", async (req, res) => {
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];

	try {
		const departments = await db.find("system_department", {});
		const users =  await db.find("admin_user", { username: utils.getJwtCode(token).username });
		const auth = users[0].auths;
		res.status(200).send({ msg: "查询成功", code: 200, data: { departments: departments, auths: utils.treeDataFilter(authMenu, auth, "code", "children") } });
	} catch (err) {
		res.status(200).send({ msg: err.message, code: 500 });
	};
});

router.post("/del", async (req, res) => {
	let { id } = req.body;
	const res1 = await await db.find("admin_user", { uid: id });

	if (res1[0].departmentId === 0 && res1[0].username) {
		res.status(200).send({ code: 500, msg: "无法删除系统管理员" });
		return;
	}

	const delStr = { "uid": id };
	db.deleteOne("admin_user", delStr).then(async (success) => {
		res.status(200).send({ msg: "删除成功", code: 200, result: success });		
	}).catch((err) => res.status(200).send({ msg: err, code: 500 }));
});

/** 网站管理-账号管理-添加 */
router.post("/add", async (req, res) => {
	const { username, password, auths, departmentId } = req.body;
	const token = req.body.Authorization || req.query.token || req.headers["authorization"];

	if (!username) {
		res.status(200).send({ code: 500, msg: "添加失败，用户名不能为空" });
		return;
	}
	if (!password) {
		res.status(200).send({ code: 500, msg: "添加失败，密码不能为空" });
		return;
	}
	if (!departmentId && departmentId !== 0) {
		res.status(200).send({ code: 500, msg: "添加失败，科室不能为空" });
		return;
	}
	if (!Array.isArray(auths) || auths.length === 0) {
		res.status(200).send({ code: 500, msg: "添加失败，权限不能为空" });
		return;
	}
	if (!/^[a-zA-Z0-9_]{1,}$/g.test(username)) {
		res.status(200).send({ code: 500, msg: "添加失败，用户名不合法" });
		return;
	}
	if (username.length < 4 || username.length > 16) {
		res.status(200).send({ code: 500, msg: "添加失败，用户名不合法" });
		return;
	}
	if (!/[a-z]/g.test(password) || !/[A-Z]/g.test(password) || !/[0-9]/g.test(password) || !/[\~\!\@\#\$\%\^\&\*\(\)\_\+\=\-\<\>\?]/.test(password)) {
		res.status(200).send({ code: 500, msg: "添加失败，密码不合法" });
		return;
	}
	if (password.length < 6 || password.length > 18) {
		res.status(200).send({ code: 500, msg: "添加失败，密码不合法" });
		return;
	}
	const res1 = await db.find("system_department", {});
	departments = res1.map((item) => item.id);
	if (!departments.includes(departmentId)) {
		res.status(200).send({ code: 500, msg: "添加失败，科室不合法" });
		return;
	}
	for (let i = 0; i < auths.length; i++) {
		if (!authMap.get(auths[i])) {
			res.status(200).send({ code: 500, msg: "添加失败，权限不合法" });
			return;
		}
	}
	const res2 = await db.find("admin_user", { username: username });
	if (res2.length !== 0) {
		res.status(200).send({ code: 500, msg: "添加失败，用户名被占用" });
		return;
	}

	const publisher = utils.getJwtCode(token).username;
	const timecreate = moment().format("YYYY-MM-DD HH:mm:ss");
	const uid = uuidv1();
	const passwordTemp = CryptoJS.SHA256(utils.encodeBase64(password) + uid).toString();	

	const insertStr = { uid: uid, username: username, password: passwordTemp, timecreate: timecreate, publisher: publisher, role: 1, departmentId: departmentId, auths: auths };
	db.insertOne("admin_user", insertStr).then((success) => {
		res.status(200).send({ msg: "添加成功", code: 200, result: success });
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));	
});

router.post("/isOne", async (req, res) => {
	const { username } = req.body;
	const findStr = { username: username };
	db.find("admin_user", findStr).then((data) => {
		res.status(200).send({ isOne: !data.length });
	});
});

const authMenu = [
	{
		title: "背景封面",
		code: "admin_bg",
		path: "admin-bg",
		icon: "el-icon-picture-outline"
	},
	{
		title: "关于二中",
		code: "admin_about",
		path: "admin-about",
		icon: "el-icon-school",
		children: [
			{
				title: "领导风采",
				path: "leader-list",
				code: "admin_about_leader"
			},
			{
				title: "学校简介",
				path: "profile-content",
				code: "admin_about_profile"
			},		
			{
				title: "二中校史",
				path: "concept-content",
				code: "admin_about_concept"
			},	
			{
				title: "校长寄语",
				path: "proverb-content",
				code: "admin_about_proverb"
			},
			{
				title: "学校荣誉",
				path: "honor-list",
				code: "admin_about_honor"
			}			
		]
	},
	{
		title: "教学动态",
		code: "admin_education",
		path: "admin-education",
		icon: "el-icon-data-analysis"
	},
	{
		title: "德育活动",
		code: "admin_activity",
		path: "admin-activity",
		icon: "el-icon-orange",
		children: [
			{
				title: "德育规划",
				path: "planning-list",
				code: "admin_activity_planning"
			},
			{
				title: "德育标兵",
				path: "pacesetter-list",
				code: "admin_activity_pacesetter"
			},
			{
				title: "健康教育",
				path: "health-list",
				code: "admin_activity_health"
			},
			{
				title: "班级文化",
				path: "culture-list",
				code: "admin_activity_culture"
			},
			{
				title: "班主任专栏",
				path: "teacher-list",
				code: "admin_activity_teacher"
			},
			{
				title: "体艺活动",
				path: "gym-list",
				code: "admin_activity_gym"
			}
		]
	},
	{
		title: "校本研修",
		code: "admin_training",
		path: "admin-training",
		icon: "el-icon-data-analysis"
	},
	{
		title: "为您服务",
		code: "admin_service",
		path: "admin-service",
		icon: "el-icon-help",
		children: [
			{
				title: "后勤保障",
				path: "guarantee-list",
				code: "admin_service_guarantee"
			},
			{
				title: "电教知识",
				path: "computer-list",
				code: "admin_service_computer"
			}
		]
	},
	{
		title: "二中团建",
		code: "admin_group",
		path: "admin-group",
		icon: "el-icon-star-off",
	},
	{
		title: "二中党建",
		code: "admin_party",
		path: "admin-party",
		icon: "el-icon-star-off",
		children: [
			{
				title: "理论学习",
				path: "theory-list",
				code: "admin_party_theory"
			},
			{
				title: "组织建设",
				path: "construct-list",
				code: "admin_party_construct"
			},
			{
				title: "组织生活",
				path: "life-list",
				code: "admin_party_life"
			},
			{
				title: "制度建设",
				path: "institution-list",
				code: "admin_party_institution"
			},
			{
				title: "台账管理",
				path: "book-list",
				code: "admin_party_book"
			},
			{
				title: "活动项目",
				path: "project-list",
				code: "admin_party_project"
			},
			{
				title: "阵地建设",
				path: "position-list",
				code: "admin_party_position"
			}
		]
	},
	{
		title: "职工之家",
		code: "admin_union",
		path: "admin-union",
		icon: "el-icon-star-off"
	},
	{
		title: "二中创建",
		code: "admin_establish",
		path: "admin-establish",
		icon: "el-icon-star-off",
		children: [
			{
				title: "创建会议",
				router: "meeting-list",
				code: "admin_establish_meeting"
			},
			{
				title: "学习大讲堂",
				router: "classroom-list",
				code: "admin_establish_classroom"
			},
			{
				title: "志愿者风采",
				router: "volunteer-list",
				code: "admin_establish_volunteer"
			},
			{
				title: "结对帮扶",
				router: "two-list",
				code: "admin_establish_two"
			},
			{
				title: "新时代文明实践活动",
				router: "practice-list",
				code: "admin_establish_practice"
			},
			{
				title: "文明之声",
				router: "voice-list",
				code: "admin_establish_voice"
			}
		]
	},
	{
		title: "二中安法",
		code: "admin_law",
		path: "admin-law",
		icon: "el-icon-star-off"
	},
	{
		title: "联系我们",
		path: "admin_contact",
		icon: "el-icon-phone",
		path: "admin-contact",
		code: "admin_contact"
	},
	{
		title: "网站管理",
		code: "admin_system",
		path: "admin-system",
		icon: "el-icon-monitor",
		children: [
			{
				title: "科室管理",
				path: "department-list",
				code: "admin_system_department"
			},
			{
				title: "账号管理",
				path: "account-list",
				code: "admin_system_account"
			},
			{
				title: "操作日志",
				path: "log-list",
				code: "admin_system_log"
			}
		]
	}
];

const authMap = new Map([
    [ "admin_bg", "背景封面" ],
    [ "admin_about", "关于二中" ],
    [ "admin_about_leader", "领导风采" ],
    [ "admin_about_profile", "学校简介" ],
    [ "admin_about_concept", "二中校史" ],
    [ "admin_about_proverb", "校长寄语" ],
    [ "admin_about_honor", "学校荣誉" ],
    [ "admin_education", "教学动态" ],
    [ "admin_activity", "德育活动" ],
    [ "admin_activity_planning", "德育规划" ],
    [ "admin_activity_pacesetter", "德育标兵" ],
    [ "admin_activity_health", "健康教育" ],
    [ "admin_activity_culture", "班级文化" ],
    [ "admin_activity_teacher", "班主任专栏" ],
    [ "admin_activity_gym", "体艺活动" ],
    [ "admin_training", "校本研修" ],
    [ "admin_service", "为您服务" ],
    [ "admin_service_guarantee", "后勤保障" ],
    [ "admin_service_computer", "电教知识" ],
    [ "admin_group", "二中团建" ],
    [ "admin_party", "二中党建" ],
    [ "admin_party_theory", "理论学习" ],
    [ "admin_party_construct", "组织建设" ],
    [ "admin_party_life", "组织生活" ],
    [ "admin_party_institution", "制度建设" ],
    [ "admin_party_book", "台账管理" ],
    [ "admin_party_project", "活动项目" ],
    [ "admin_party_position", "阵地建设" ],
    [ "admin_union", "职工之家" ],
    [ "admin_establish", "二中创建" ],
    [ "admin_establish_meeting", "创建会议" ],
    [ "admin_establish_classroom", "学习大讲堂" ],
    [ "admin_establish_volunteer", "志愿者风采" ],
    [ "admin_establish_two", "结对帮扶" ],
    [ "admin_establish_practice", "新时代文明实践活动" ],
    [ "admin_establish_voice", "文明之声" ],
    [ "admin_law", "二中安法" ],
    [ "admin_contact", "联系我们" ],
    [ "admin_system", "网站管理" ],
    [ "admin_system_department", "科室管理" ],
    [ "admin_system_account", "账号管理" ],
    [ "admin_system_log", "操作日志" ]
]);

module.exports = router;