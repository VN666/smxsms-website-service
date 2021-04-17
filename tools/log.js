const express = require("express");
const logger = require("morgan");
const fileStreamRotato = require("file-stream-rotator");
const app = express();
const fs = require("fs");
const path = require("path");
const Dao = require("./DAO.js");
const uuidv1 = require("uuid/v1");
const moment = require("moment");
const utils = require("./utils.js");

const db = new Dao();

const LogJson = [
	{ url: "/api/bg/add", opCode: "1", opType: "添加", module: "封面背景", func: (body) => "添加:" + body.picSrc[0] },
	{ url: "/api/bg/del", opCode: "0", opType: "删除", module: "封面背景", func: (body) => "删除id:" + body.id},
	{ url: "/api/bg/move", opCode: "3", opType: "移动", module: "封面背景", func: (body) => "id:" + body.fromId + (body.fromOrder < body.toOrder ? "上移" : "下移") },
	{ url: "/api/about/profile/edit", opCode: "2", opType: "编辑", module: "二中概况-学校简介", func: () => "编辑"},
	{ url: "/api/about/concept/edit", opCode: "2", opType: "编辑", module: "二中概况-办学理念", func: () => "编辑" },
	{ url: "/api/about/proverb/edit", opCode: "2", opType: "编辑", module: "二中概况-校长寄语", func: () => "编辑" },
	{ url: "/api/about/leader/add", opCode: "1", opType: "添加", module: "二中概况-领导风采", func: (body) => "添加:" + body.name },
	{ url: "/api/about/leader/edit", opCode: "2", opType: "编辑", module: "二中概况-领导风采", func: (body) => "编辑id:" + body.id },
	{ url: "/api/about/leader/del", opCode: "0", opType: "删除", module: "二中概况-领导风采", func: (body) => "删除id:" + body.id },
	{ url: "/api/about/leader/move", opCode: "3", opType: "移动", module: "二中概况-领导风采", func: (body) => "id:"  + body.fromId + (body.fromOrder < body.toOrder ? "上移" : "下移") },
	{ url: "/api/about/honor/add", opCode: "1", opType: "添加", module: "二中概况-学校荣誉", func: (body) => "添加:" + body.headline},
	{ url: "/api/about/honor/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中概况-学校荣誉", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/about/honor/del", opCode: "0", opType: "删除", module: "二中概况-学校荣誉", func: (body) => "删除id:" + body.id },
	{ url: "/api/about/honor/edit", opCode: "2", opType: "编辑", module: "二中概况-学校荣誉", func: (body) => "编辑id:" + body.id },
	{ url: "/api/education/research/add", opCode: "1", opType: "添加", module: "教学动态", func: (body) => "添加:" + body.headline },
	{ url: "/api/education/research/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "教学动态", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/education/research/del", opCode: "0", opType: "删除", module: "教学动态", func: (body) => "删除id:" + body.id },
	{ url: "/api/education/research/edit", opCode: "2", opType: "编辑", module: "教学动态", func: (body) => "编辑id:" + body.id },
	{ url: "/api/activity/planning/add", opCode: "1", opType: "添加", module: "德育教育-德育规划", func: (body) => "添加:" + body.headline },
	{ url: "/api/activity/planning/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "德育教育-德育规划", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/activity/planning/del", opCode: "0", opType: "删除", module: "德育教育-德育规划", func: (body) => "删除id:" + body.id },
	{ url: "/api/activity/planning/edit", opCode: "2", opType: "编辑", module: "德育教育-德育规划", func: (body) => "编辑id:" + body.id },
	{ url: "/api/activity/pacesetter/edit", opCode: "2", opType: "编辑", module: "德育教育-德育标兵", func: (body) => "编辑id:" + body.id },
	{ url: "/api/activity/pacesetter/add", opCode: "1", opType: "添加", module: "德育教育-德育标兵", func: (body) => "添加:" + body.name },
	{ url: "/api/activity/pacesetter/del", opCode: "0", opType: "删除", module: "德育教育-德育标兵", func: (body) => "删除id:" + body.id },
	{ url: "/api/activity/pacesetter/move", opCode: "3", opType: "移动", module: "德育教育-德育标兵", func: (body) => "id:"  + body.fromId + (body.fromOrder < body.toOrder ? "上移" : "下移") },
	{ url: "/api/activity/health/add", opCode: "1", opType: "添加", module: "德育教育-健康教育", func: (body) => "添加:" + body.headline },
	{ url: "/api/activity/health/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "德育教育-健康教育", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/activity/health/del", opCode: "0", opType: "删除", module: "德育教育-健康教育", func: (body) => "删除id:" + body.id },
	{ url: "/api/activity/health/edit", opCode: "2", opType: "编辑", module: "德育教育-健康教育", func: (body) => "编辑id:" + body.id },
	{ url: "/api/activity/culture/add", opCode: "1", opType: "添加", module: "德育教育-班级文化", func: (body) => "添加:" + body.headline },
	{ url: "/api/activity/culture/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "德育教育-班级文化", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/activity/culture/del", opCode: "0", opType: "删除", module: "德育教育-班级文化", func: (body) => "删除id:" + body.id },
	{ url: "/api/activity/culture/edit", opCode: "2", opType: "编辑", module: "德育教育-班级文化", func: (body) => "编辑id:" + body.id },
	{ url: "/api/activity/teacher/add", opCode: "1", opType: "添加", module: "德育教育-班主任专栏", func: (body) => "添加:" + body.headline },
	{ url: "/api/activity/teacher/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "德育教育-班主任专栏", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/activity/teacher/del", opCode: "0", opType: "删除", module: "德育教育-班主任专栏德育教育-班主任专栏", func: (body) => "删除id:" + body.id },
	{ url: "/api/activity/teacher/edit", opCode: "2", opType: "编辑", module: "德育教育-班主任专栏", func: (body) => "编辑id:" + body.id },
	{ url: "/api/activity/gym/add", opCode: "1", opType: "添加", module: "德育教育-体艺活动", func: (body) => "添加:" + body.headline },
	{ url: "/api/activity/gym/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "德育教育-体艺活动", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/activity/gym/del", opCode: "0", opType: "删除", module: "德育教育-体艺活动", func: (body) => "删除id:" + body.id },
	{ url: "/api/activity/gym/edit", opCode: "2", opType: "编辑", module: "德育教育-体艺活动", func: (body) => "编辑id:" + body.id },
	{ url: "/api/training/study/add", opCode: "1", opType: "添加", module: "校本研修", func: (body) => "添加:" + body.headline },
	{ url: "/api/training/study/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "校本研修", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/training/study/del", opCode: "0", opType: "删除", module: "校本研修", func: (body) => "删除id:" + body.id },
	{ url: "/api/training/study/edit", opCode: "2", opType: "编辑", module: "校本研修", func: (body) => "编辑id:" + body.id },
	{ url: "/api/service/guarantee/add", opCode: "1", opType: "添加", module: "为您服务-后勤保障", func: (body) => "添加:" + body.headline },
	{ url: "/api/service/guarantee/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "为您服务-后勤保障", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/service/guarantee/del", opCode: "0", opType: "删除", module: "为您服务-后勤保障", func: (body) => "删除id:" + body.id },
	{ url: "/api/service/guarantee/edit", opCode: "2", opType: "编辑", module: "为您服务-后勤保障", func: (body) => "编辑id:" + body.id },
	{ url: "/api/service/computer/add", opCode: "1", opType: "添加", module: "为您服务-电教知识", func: (body) => "添加:" + body.headline },
	{ url: "/api/service/computer/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "为您服务-电教知识", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/service/computer/del", opCode: "0", opType: "删除", module: "为您服务-电教知识", func: (body) => "删除id:" + body.id },
	{ url: "/api/service/computer/edit", opCode: "2", opType: "编辑", module: "为您服务-电教知识", func: (body) => "编辑id:" + body.id },
	{ url: "/api/group/ccyl/add", opCode: "1", opType: "添加", module: "二中团建", func: (body) => "添加:" + body.headline },
	{ url: "/api/group/ccyl/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中团建", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/group/ccyl/del", opCode: "0", opType: "删除", module: "二中团建", func: (body) => "删除id:" + body.id },
	{ url: "/api/group/ccyl/edit", opCode: "2", opType: "编辑", module: "二中团建", func: (body) => "编辑id:" + body.id },	
	{ url: "/api/party/theory/add", opCode: "1", opType: "添加", module: "二中党建-理论学习", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/theory/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-理论学习", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/theory/del", opCode: "0", opType: "删除", module: "二中党建-理论学习", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/theory/edit", opCode: "2", opType: "编辑", module: "二中党建-理论学习", func: (body) => "编辑id:" + body.id },
	{ url: "/api/party/construct/add", opCode: "1", opType: "添加", module: "二中党建-组织建设", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/construct/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-组织建设", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/construct/del", opCode: "0", opType: "删除", module: "二中党建-组织建设", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/construct/edit", opCode: "2", opType: "编辑", module: "二中党建-组织建设", func: (body) => "编辑id:" + body.id },
	{ url: "/api/party/life/add", opCode: "1", opType: "添加", module: "二中党建-组织生活", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/life/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-组织生活", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/life/del", opCode: "0", opType: "删除", module: "二中党建-组织生活", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/life/edit", opCode: "2", opType: "编辑", module: "二中党建-组织生活", func: (body) => "编辑id:" + body.id },	
	{ url: "/api/party/institution/add", opCode: "1", opType: "添加", module: "二中党建-制度建设", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/institution/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-制度建设", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/institution/del", opCode: "0", opType: "删除", module: "二中党建-制度建设", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/institution/edit", opCode: "2", opType: "编辑", module: "二中党建-制度建设", func: (body) => "编辑id:" + body.id },
	{ url: "/api/party/book/add", opCode: "1", opType: "添加", module: "二中党建-台账管理", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/book/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-台账管理", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/book/del", opCode: "0", opType: "删除", module: "二中党建-台账管理", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/book/edit", opCode: "2", opType: "编辑", module: "二中党建-台账管理", func: (body) => "编辑id:" + body.id },
	{ url: "/api/party/project/add", opCode: "1", opType: "添加", module: "二中党建-活动项目", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/project/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-活动项目二中党建-活动项目", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/project/del", opCode: "0", opType: "删除", module: "二中党建-活动项目", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/project/edit", opCode: "2", opType: "编辑", module: "二中党建-活动项目", func: (body) => "编辑id:" + body.id },	
	{ url: "/api/party/position/add", opCode: "1", opType: "添加", module: "二中党建-阵地建设", func: (body) => "添加:" + body.headline },
	{ url: "/api/party/position/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-阵地建设", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/party/position/del", opCode: "0", opType: "删除", module: "二中党建-阵地建设", func: (body) => "删除id:" + body.id },
	{ url: "/api/party/position/edit", opCode: "2", opType: "编辑", module: "二中党建-阵地建设", func: (body) => "编辑id:" + body.id },
	{ url: "/api/union/staff/add", opCode: "1", opType: "添加", module: "职工之家", func: (body) => "添加:" + body.headline },
	{ url: "/api/union/staff/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "职工之家", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/union/staff/del", opCode: "0", opType: "删除", module: "职工之家", func: (body) => "删除id:" + body.id },
	{ url: "/api/union/staff/edit", opCode: "2", opType: "编辑", module: "职工之家", func: (body) => "编辑id:" + body.id },
	{ url: "/api/establish/meeting/add", opCode: "1", opType: "添加", module: "二中党建-创建会议", func: (body) => "添加:" + body.headline },
	{ url: "/api/establish/meeting/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-创建会议", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/establish/meeting/del", opCode: "0", opType: "删除", module: "二中党建-创建会议", func: (body) => "删除id:" + body.id },
	{ url: "/api/establish/meeting/edit", opCode: "2", opType: "编辑", module: "二中党建-创建会议", func: (body) => "编辑id:" + body.id },
	{ url: "/api/establish/classroom/add", opCode: "1", opType: "添加", module: "二中党建-学习大讲堂", func: (body) => "添加:" + body.headline },
	{ url: "/api/establish/classroom/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-学习大讲堂", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/establish/classroom/del", opCode: "0", opType: "删除", module: "二中党建-学习大讲堂二中党建-学习大讲堂", func: (body) => "删除id:" + body.id },
	{ url: "/api/establish/classroom/edit", opCode: "2", opType: "编辑", module: "二中党建-学习大讲堂", func: (body) => "编辑id:" + body.id },
	{ url: "/api/establish/volunteer/add", opCode: "1", opType: "添加", module: "二中党建-志愿者风采", func: (body) => "添加:" + body.headline },
	{ url: "/api/establish/volunteer/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-志愿者风采", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/establish/volunteer/del", opCode: "0", opType: "删除", module: "二中党建-志愿者风采", func: (body) => "删除id:" + body.id },
	{ url: "/api/establish/volunteer/edit", opCode: "2", opType: "编辑", module: "二中党建-志愿者风采", func: (body) => "编辑id:" + body.id },
	{ url: "/api/establish/two/add", opCode: "1", opType: "添加", module: "二中党建-结对帮扶", func: (body) => "添加:" + body.headline },
	{ url: "/api/establish/two/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-结对帮扶", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/establish/two/del", opCode: "0", opType: "删除", module: "二中党建-结对帮扶", func: (body) => "删除id:" + body.id },
	{ url: "/api/establish/two/edit", opCode: "2", opType: "编辑", module: "二中党建-结对帮扶", func: (body) => "编辑id:" + body.id },	
	{ url: "/api/establish/practice/add", opCode: "1", opType: "添加", module: "二中党建-新时代文明时间活动", func: (body) => "添加:" + body.headline },
	{ url: "/api/establish/practice/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-新时代文明时间活动", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/establish/practice/del", opCode: "0", opType: "删除", module: "二中党建-新时代文明时间活动", func: (body) => "删除id:" + body.id },
	{ url: "/api/establish/practice/edit", opCode: "2", opType: "编辑", module: "二中党建-新时代文明时间活动", func: (body) => "编辑id:" + body.id },
	{ url: "/api/establish/voice/add", opCode: "1", opType: "添加", module: "二中党建-文明之声", func: (body) => "添加:" + body.headline },
	{ url: "/api/establish/voice/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中党建-文明之声", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/establish/voice/del", opCode: "0", opType: "删除", module: "二中党建-文明之声", func: (body) => "删除id:" + body.id },
	{ url: "/api/establish/voice/edit", opCode: "2", opType: "编辑", module: "二中党建-文明之声", func: (body) => "编辑id:" + body.id },
	{ url: "/api/law/safe/add", opCode: "1", opType: "添加", module: "二中安法", func: (body) => "添加:" + body.headline },
	{ url: "/api/law/safe/changeIsTop", opCode: "4", opType: "置顶/取消置顶", module: "二中安法", func: (body) => (body.isTop === 1 ? "置顶id:" : "取消置顶id:") + body.id },
	{ url: "/api/law/safe/del", opCode: "0", opType: "删除", module: "二中安法", func: (body) => "删除id:" + body.id },
	{ url: "/api/law/safe/edit", opCode: "2", opType: "编辑", module: "二中安法", func: (body) => "编辑id:" + body.id },	
	{ url: "/api/system/department/add", opCode: "1", opType: "添加", module: "网站管理-部门管理", func: (body) => "添加:" + body.name },
	{ url: "/api/system/department/del", opCode: "0", opType: "删除", module: "网站管理-部门管理", func: (body) => "删除id:" + body.id },
	{ url: "/api/system/department/edit", opCode: "2", opType: "编辑", module: "网站管理-部门管理", func: (body) => "编辑id:" + body.id },
	{ url: "/api/system/account/add", opCode: "1", opType: "添加", module: "网站管理-账号管理", func: (body) => "添加:" + body.username },
	{ url: "/api/system/account/edit", opCode: "0", opType: "删除", module: "网站管理-账号管理", func: (body) => "编辑id:" + body.id },
	{ url: "/api/system/account/del", opCode: "2", opType: "编辑", module: "网站管理-账号管理", func: (body) => "删除id:" + body.id },	
	{ url: "/api/contact/update", opCode: "2", opType: "编辑", module: "联系我们", func: () => "编辑" },
	{ url: "/api/login/login", opCode: "5", opType: "登录", module: "登录", func: (body) => body.username + "登录" }
]


var accessLogStream = fileStreamRotato.getStream({
	filename: path.join(__dirname, "../logs/access_%DATE%.log"),
  	frequency: "daily",
  	verbose: false,
  	date_format: 'YYYYMMDD'
});

const opLogStream = {
	write: (data) => {
		const str = JSON.parse(JSON.stringify(data.replace(/[\x00-\x1F\x7F-\x9F]/g, "")));
		const obj = JSON.parse(str.substr(1, str.length - 2));
		const insertStr = Object.assign(obj, {
			timecreate: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
			id: uuidv1()
		});
		db.insertOne("operation_log", insertStr);
	}
}

// const  accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// function formatLog (tokens, req, res) {
// 	return [
// 		req,
// 	    tokens.method(req, res),
// 	    tokens.url(req, res),
// 	    tokens.status(req, res),
// 	    decodeURI(tokens.url(req, res)), // 获取get参数
// 	    JSON.stringify(req.body),
// 	    tokens.res(req, res, 'content-length'), '-',
// 	    tokens['response-time'](req, res), 'ms'
// 	].join(' ')
// }
// 
function getDes (logjson, body) {
	const opCode = logjson.opCode;
	return logjson.module + " " + logjson.func(body); 
}

function formatOpLog (tokens, req, res) {	
	const index = LogJson.findIndex((item) => item.url === tokens.url(req, res));
	const opCode = LogJson[index].opCode;
	return `'{
		"url": "${tokens.url(req, res)}",
		"ip": "${req.headers["x-real-ip"]}",
		"username": "${ req.headers.authorization && utils.getJwtCode(req.headers.authorization).username || req.body.username || ""}",
		"agent": "${req.headers['user-agent']}",
		"opCode": "${LogJson[index].opCode}",
		"opType": "${LogJson[index].opType}",
		"module": "${LogJson[index].module}",
		"des": "${getDes(LogJson[index], req.body)}"
	}'` 
}

function formatAccessLog (tokens, req, res) {
	return [
		moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
		req.headers["x-real-ip"],
		tokens.method(req, res),
	    tokens.url(req, res),
	    tokens.status(req, res),
	    req.headers["user-agent"],
	    tokens.res(req, res, 'content-length'), '-',
	    tokens['response-time'](req, res), 'ms',
	].join(" ")
}

const skip = (req, res) => !LogJson.map((item) => item.url).includes(req.originalUrl);

const opLog = (logger(function (tokens, req, res) {
  	return formatOpLog(tokens, req, res)
}, { skip: skip, stream: opLogStream }));


const accessLog = (logger(function (tokens, req, res) {
  	return formatAccessLog(tokens, req, res)
}, { stream: accessLogStream }));



module.exports = { accessLog, opLog };

