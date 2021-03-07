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
		array[0].forEach((account) => account.departmentName = deparmentMap.get(account.departmentId));
		res.status(200).send({ msg: "查询成功", code: 200, data: { list: array[0], total: array[1], departments: array[2]}});
	}).catch((err) => res.status(200).send({ msg: err.message, code: 500 }));	
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
	}
	if (!departmentId) {
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
				title: "学校简介",
				path: "profile-content",
				code: "admin_about_profile"
			},
			{
				title: "学校领导",
				path: "leader-list",
				code: "admin_about_leader"
			},
			{
				title: "校长寄语",
				path: "proverb-content",
				code: "admin_about_proverb"
			},
			{
				title: "内部机构",
				path: "organization-content",
				code: "admin_about_organization"
			},
			{
				title: "师资概况",
				path: "team-content",
				code: "admin_about_team"
			},
			{
				title: "名师风采",
				path: "outstanding-list",
				code: "admin_about__outstanding"
			},
			{
				title: "学校荣誉",
				path: "honor-list",
				code: "admin_about_honor"
			},
			{
				title: "二中校史",
				path: "history-content",
				code: "admin_about_history"
			},
			{
				title: "校园风貌",
				path: "landscape-list",
				code: "admin_about_landscape"
			}
		]
	},
	{
		title: "新闻动态",
		code: "admin_news",
		icon: "el-icon-notebook-2",
		children: [
			{
				title: "新闻快讯",
				path: "campus-list",
				code: "admin_news_campus"
			},
			{
				title: "通知公告",
				path: "notice-list",
				code: "admin_news_notice"
			},
			{
				title: "媒体报道",
				path: "media-list",
				code: "admin_news_media"
			},
			{
				title: "招生信息",
				path: "enroll-list",
				code: "admin_news_enroll"
			}
		]
	},
	{
		title: "党团工会",
		code: "admin_group",
		path: "admin-group",
		icon: "el-icon-star-off",
		children: [
			{
				title: "党建动态",
				path: "party-list",
				code: "admin_group_party"
			},
			{
				title: "团建工作",
				path: "ccyl-list",
				code: "admin_group_ccyl"
			},
			{
				title: "工会活动",
				path: "union-list",
				code: "admin_group_union"
			},
			{
				title: "创先争优",
				path: "excellent-list",
				code: "admin_group_excellent"
			}
		]
	},
	{
		title: "教学科研",
		code: "admin_education",
		path: "admin-education",
		icon: "el-icon-data-analysis",
		children: [
			{
				title: "教研动态",
				path: "research-list",
				code: "admin_education_research"
			},
			{
				title: "教学案例",
				path: "case-list",
				code: "admin_education_case"
			},
			{
				title: "教学反思",
				path: "summary-list",
				code: "admin_education_summary"
			},
			{
				title: "教学课件",
				path: "ppt-list",
				code: "admin_education_ppt"
			},
			{
				title: "试题集锦",
				path: "paper-list",
				code: "admin_education_paper"
			},
			{
				title: "特色教育",
				path: "feature-list",
				code: "admin_education_feature"
			}
		]
	},
	{
		title: "学生天地",
		code: "admin_student",
		path: "admin-student",
		icon: "el-icon-basketball",
		children: [
			{
				title: "班级活动",
				path: "activity-list",
				code: "admin_student_activity"
			},
			{
				title: "荣誉表彰",
				path: "prize-list",
				code: "admin_student_prize"
			},
			{
				title: "纪律卫生",
				path: "flag-list",
				code: "admin_student_flag"
			},
			{
				title: "学生作品",
				path: "exhibition-list",
				code: "admin_student_exhibition"
			},
			{
				title: "毕业留念",
				path: "graduation-list",
				code: "admin_student_graduation"
			}
		]
	},
	{
		title: "家长学校",
		code: "admin_parent",
		path: "admin-parent",
		icon: "el-icon-user",
		children: [
			{
				title: "活动掠影",
				path: "pratice-list",
				code: "admin_parent_pratice"
			},
			{
				title: "家教知识",
				path: "knowledge-list",
				code: "admin_parent_knowledge"
			},
			{
				title: "学校沟通",
				path: "communication-list",
				code: "admin_parent_communication"
			}
		]
	},
	{
		title: "七彩校园",
		code: "admin_school",
		path: "admin-school",
		icon: "el-icon-orange",
		children: [
			{
				title: "活动报道",
				path: "display-list",
				code: "admin_school_display"
			}
		]
	},
	{
		title: "幸福教育",
		code: "admin_happy",
		path: "admin-happy",
		icon: "el-icon-ship",
		children: [
			{
				title: "幸福理念",
				path: "idea-list",
				code: "admin_happy_idea"
			},
			{
				title: "幸福感言",
				path: "speech-list",
				code: "admin_happy_speech"
			},
			{
				title: "幸福教育活动",
				path: "exercise-list",
				code: "admin_happy_exercise"
			}
		]
	},
	{
		title: "为您服务",
		code: "admin_service",
		path: "admin-service",
		icon: "el-icon-help",
		children: [
			{
				title: "办事指南",
				path: "guide-list",
				code: "admin_service_guide"
			},
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
		title: "联系我们",
		path: "admin_contact",
		icon: "el-icon-phone",
		path: "admin-contact",
		code: "admin_service_contact"
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
				code: "admin_system_accoumnt"
			}
		]
	}
];

const authMap = new Map([
    ["admin_bg", "背景封面"],
    ["admin_about", "关于二中"],
    ["admin_about_profile", "学校简介"],
    ["admin_about_leader", "学校领导"],
    ["admin_about_proverb", "校长寄语"],
    ["admin_about_organization", "内部机构"],
    ["admin_about_team", "师资概况"],
    ["admin_about__outstanding", "名师风采"],
    ["admin_about_honor", "学校荣誉"],
    ["admin_about_history", "二中校史"],
    ["admin_about_landscape", "校园风貌"],
    ["admin_news", "新闻动态"],
    ["admin_news_campus", "新闻快讯"],
    ["admin_news_notice", "通知公告"],
    ["admin_news_media", "媒体报道"],
    ["admin_news_enroll", "招生信息"],
    ["admin_group", "党团工会"],
    ["admin_group_party", "党建动态"],
    ["admin_group_ccyl", "团建工作"],
    ["admin_group_union", "工会活动"],
    ["admin_group_excellent", "创优争先"],
    ["admin_education", "教学科研"],
    ["admin_education_research", "教研动态"],
    ["admin_education_case", "教学案例"],
    ["admin_education_summary", "教学反思"],
    ["admin_education_ppt", "教学课件"],
    ["admin_education_paper", "试题集锦"],
    ["admin_education_feature", "特色教育"],
    ["admin_student", "学生天地"],
    ["admin_student_activity", "班级活动"],
    ["admin_student_prize", "荣誉表彰"],
    ["admin_student_flag", "纪律卫生"],
    ["admin_student_exhibition", "学生作品"],
    ["admin_student_graduation", "毕业留念"],
    ["admin_parent", "家长学校"],
    ["admin_parent_pratice", "活动掠影"],
    ["admin_parent_knowledge", "家教知识"],
    ["admin_parent_communication", "学校沟通"],
    ["admin_school", "七彩校园"],
    ["admin_school_display", "活动报道"],
    ["admin_happy", "幸福教育"],
    ["admin_happy_idea", "幸福理念"],
    ["admin_happy_speech", "幸福感言"],
    ["admin_happy_exercise", "幸福教育活动"],
    ["admin_service", "为您服务"],
    ["admin_service_guide", "办事指南"],
    ["admin_service_guarantee", "后勤保障"],
    ["admin_service_computer", "电教知识"],
    ["admin_service_contact", "联系我们"],
    ["admin_system", "网站管理"],
    ["admin_system_department", "科室管理"],
    ["admin_system_accoumnt", "账号管理"]
]);

module.exports = router;