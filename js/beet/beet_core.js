//Beet 框架 namespace  所有子元素 继承于此
//使用namespace 规范代码机制 方便调用
Ext.namespace("Beet");
//app namespace
Ext.namespace("Beet.apps");
//constant namespace
Beet.constants = {
	FAILURE: "{00000000-0000-0000-0000-000000000000}",
	GRANDMADATE: -2208988800
}

//临时数据表
Ext.namespace("Beet.cache");
Beet.cache.Users = {};


//plugin
Ext.namespace("Beet.plugins");
