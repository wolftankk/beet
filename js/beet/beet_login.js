//register Login
Ext.namespace("Beet.apps.Login");
Ext.define("Beet.apps.Login.LoginDialog", {
	extend : "Ext.Window", //继承
	title : "登陆",
	plain: true,
	closable: false,
	closeAction: 'hide',
	width : 300,
	height: 150,
	layout: 'fit',
	border: false,
	modal: true,
	items: {
		itemId: "LoginFormPanel",
		xtype: "LoginFormPanel"
	}
});

Ext.define("Beet.apps.Login.LoginFormPanel", {
	extend: 'Ext.form.Panel',
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
			name: "password",
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
				this.up('form').getForm().reset();
			}
		},
		{
			text: "确定",
			formBind: true,
			disabled: true,
			handler: function(){
				var form = this.up('form').getForm()	
				if (form.isValid()){
					var result = form.getValues();
					var usr = result["username"], passwd = result["password"];	
					var loginServer = Beet.constants.customerLoginServer;
					//firstRun
					//Ext.util.Cookies.set("firstRun", true);

					loginServer.Login(usr, xxtea_encrypt(passwd), '', '', {
						success: function(uid){
							if (uid && uid != Beet.constants.FAILURE){
								Ext.util.Cookies.set("userName", usr);
								Ext.util.Cookies.set("userId", uid);
								window.location = "main.html"
							}else{
								Ext.Msg.alert("警告", "用户名或密码错误, 请重新输入! ");
							}
						},
						failure: function(error){
							Ext.Msg.alert("警告", "无法链接到服务器: " + error);
						}
					});	
				}
			}
		}
	]
});

