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
	width : 300,
	height: 180,
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
	bodyStyle: "padding:5px;margin:5px;",
	frame: true,
	defaults: {
		labelWidth: 50,
		xtype: "textfield",
		flex: 1
	},
	items : [
		//@TODO: 这里需要加一个logo
		{
			xtype : "textfield",
			name : "username",
			fieldLabel: "用户名",
			allowBlank: false,
			anchor: '90%',
			enableKeyEvents: true,
			listen: {
				keypress: function(field, e){
					var keyCode = e.getKey();
					if (keyCode == 13){
						this.nextSibling().focus();
					}
				}
			}
		},
		{
			xtype: "textfield",
			inputType: "password",
			fieldLabel: "密码",
			allowBlank: false,
			anchor: '90%',
			enableKeyEvents: true,
			listen: {
				keypress: function(field, e){
					if (e.getKey() == 13){
						this.nextSibling().focus()
					}
				}
			}
		}
	],
	buttons: [
		{
			text: "重置",		
			handler: function(){
				console.log(this.up('form').getForm().reset())
			}
		},
		{
			text: "确定",
			handler: function(){
				//提交控制区
				//登陆成功后 跳转到main.html

			}
		}
	]

});
