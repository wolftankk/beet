//Beet 框架 namespace  所有子元素 继承于此
//使用namespace 规范代码机制 方便调用
Ext.namespace("Beet");
//app namespace
Ext.namespace("Beet.apps");
//constant namespace

Beet.constants = {
	FAILURE: "{00000000-0000-0000-0000-000000000000}",
	GRANDMADATE: -2208988800,
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
