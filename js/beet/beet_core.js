//Beet 框架 namespace  所有子元素 继承于此
//使用namespace 规范代码机制 方便调用
Ext.namespace("Beet");
//app namespace
Ext.namespace("Beet.apps");
//constant namespace

Beet.constants = {
	FAILURE: "{00000000-0000-0000-0000-000000000000}",
	GRANDMADATE: -2208988800,
	
	CTServiceType : {
		"{C3DCAA88-D92F-435F-96B2-50BDC665F407}" : "美容",
		"{BC6B8E96-51A4-40EB-9896-2BC26E97FAE4}" : "美发",
		"{8CB1DD70-0669-4421-B9BF-EB20015FB03D}" : "瑜伽",
		"{BA33BC91-FE7F-44A0-8C9D-D53147992B0E}" : "美甲"
	},

	CTInputMode : {
		0 : "textfield",
		1 : "radiogroup",
		2 : "checkboxgroup"
	},

	RES_CUSTOMER_IID: '{83456921-B754-4F13-B858-22E59EC1F827}',//客户表
	RES_CUSTERMTYPE_IID: '{033CB335-645E-485F-AE1E-CB1C241AEB21}',//客户项目		
	ACT_ALLACT_IID: '{B6CC3DDC-4D92-4792-A667-311568B80AB9}',
	ACT_INSERT_IID: '{91677AFA-78C0-4A61-A4C0-C73C9F415819}',
	ACT_UPDATE_IID: '{C8D8D41F-6885-4C66-A25D-58A6E4D4F116}',
	ACT_DELETE_IID: '{593DD697-70AC-44AE-892E-5588041054A1}',
	ACT_SELECT_IID: '{D61570E6-EB82-4B22-A218-8881C71D692A}',

	privileges: {
		customer_addBtn : [
			'{91677AFA-78C0-4A61-A4C0-C73C9F415819}'
		],
		customer_editBtn : [
			'{D61570E6-EB82-4B22-A218-8881C71D692A}' 
		]
	}
}
if (!Beet.constants.now){
	now = new Date();
	Beet.constants.now = +now;	
	Beet.constants.timezoneOffset = now.getTimezoneOffset() * 60;
}

//临时数据表
Ext.namespace("Beet.cache");
Beet.cache.Users = {};

//plugin
Ext.namespace("Beet.plugins");

Beet.constants.OperatorsList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: ">", name: "大于"},
		{ attr: ">=", name: "大于等于"},
		{ attr: "<", name: "小于"},
		{ attr: "<=", name: "小于等于"},
		{ attr: "=", name: "等于"},
		{ attr: "!=", name: "不等于"}	
	]
});

Beet.constants.monthesList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: 1, name: "01"},
		{ attr: 2, name: "02"},
		{ attr: 3, name: "03"},
		{ attr: 4, name: "04"},
		{ attr: 5, name: "05"},
		{ attr: 6, name: "06"},
		{ attr: 7, name: "07"},
		{ attr: 8, name: "08"},
		{ attr: 9, name: "09"},
		{ attr: 10, name: "10"},
		{ attr: 11, name: "11"},
		{ attr: 12, name: "12"}
	]	
})


Beet.constants.daysList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: 1, name: "01"},
		{ attr: 2, name: "02"},
		{ attr: 3, name: "03"},
		{ attr: 4, name: "04"},
		{ attr: 5, name: "05"},
		{ attr: 6, name: "06"},
		{ attr: 7, name: "07"},
		{ attr: 8, name: "08"},
		{ attr: 9, name: "09"},
		{ attr: 10, name: "10"},
		{ attr: 11, name: "11"},
		{ attr: 12, name: "12"},
		{ attr: 13, name: "13"},
		{ attr: 14, name: "14"},
		{ attr: 15, name: "15"},
		{ attr: 16, name: "16"},
		{ attr: 17, name: "17"},
		{ attr: 18, name: "18"},
		{ attr: 19, name: "19"},
		{ attr: 20, name: "20"},
		{ attr: 21, name: "21"},
		{ attr: 22, name: "22"},
		{ attr: 23, name: "23"},
		{ attr: 24, name: "24"},
		{ attr: 25, name: "25"},
		{ attr: 26, name: "26"},
		{ attr: 27, name: "27"},
		{ attr: 28, name: "28"},
		{ attr: 29, name: "29"},
		{ attr: 30, name: "30"},
		{ attr: 31, name: "31"}
	]	
})
