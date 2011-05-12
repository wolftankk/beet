//Beet 框架 namespace  所有子元素 继承于此
//使用namespace 规范代码机制 方便调用
Ext.namespace("Beet");


//app namespace
Ext.namespace("Beet.apps");
//constant namespace
Ext.namespace("Beet.constants");

//register Login
Ext.namespace("Beet.apps.Login");
Ext.define("Beet.apps.Login.LoginDialog", {
	extend : "Ext.Window", //继承
	title : "登陆",

	//config
	plain: true,
	closable: false,
	closeAction: 'hide',
	width : 400,
	height: 300,
	layout: 'fit',
	border: false,
	modal: true,
	items: {
		itemId: "LoginFormPanel",
		xtype: "LoginFormPanel"
	}
});

Ext.define("Beet.apps.Login.LoginFormPanel", {
	extend: 'Ext.form.FormPanel',
	initComponent: function(){
		Ext.apply(this, {});
		this.callParent();
	},
	alias: "widget.LoginFormPanel",
	labelAlign: "left",
	buttonAlign: "center",
	bodyStyle: "padding:5px;margin:10px;",
	frame: true,
	labelWidth: 80,
	items : [

	],
	buttons: [
		{
			text: "重置",		
			handler: function(){
				console.log(this.up('form').getForm())
			}
		},
		{
			text: "确定",
			handler: function(){

			}
		}
	]

});
