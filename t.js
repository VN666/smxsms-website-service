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
		title: "教研动态",
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

const map = [];

const deep = (arr) => {
	arr.forEach((item) => {
		const temp = [];
		temp[0] = item.code;
		temp[1] = item.title;
		map.push(temp);
		if (item.children && item.children.length !== 0) deep(item.children)
	});
};

deep(authMenu);

console.log(map);