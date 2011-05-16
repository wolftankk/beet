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

//导航目录
//这一部分需要重写 ext自身的始终无法达到我们的需求
Ext.define("Beet.apps.Menu", {
	extend: "Ext.tab.Panel",
	width: '100%',
	height: 100,
	shadow: true,
	renderTo: 'header',
	border: false,
	titleCollapse: true,
	resizeTabs: true,
	minTabWidth: 150,
	items: [
		{
			title: '客户管理',
			html: '123131',
		},
		{
			title: "库存管理"
		}
	],
	initComponent: function(){
		this.callParent(arguments);
	}
	/*
	tools:{
		type: "help",
		qtip: "获得帮助",
		handler: function(event, toolEl, panel){

		}
	}
	*/
	/*
			items: [
				{
					title: "库存管理",
				},
				{
					title: "人事管理"
				},
				{
					title: "排班管理"
				},
				{
					title: "客户管理"
				}
			]
	*/

})

Ext.define("Beet.apps.StatusBar", {


});


Ext.namespace("Beet.apps.Grid", "Beet.apps.Grid.Model", "Beet.apps.Grid.Store");

Ext.define("Beet.apps.Grid.Model.CRecord", {
	extend: 'Ext.data.Model',
	fields: [
		{name:'GUIDID'},
		{name:'HOST',type: 'integer'},
		{name:'CHANNEL',type: 'integer'},
		{name:'IPADDRESS',type: 'integer'},
		{name:'FILENAME'},
		{name:'CALLID',type: 'integer'},
		{name:'LOCK',type: 'integer'},
		{name:'CONNECTEDCOUNT',type: 'integer'},
		{name:'DIALUP'},
		{name:'AGENT'},
		{name:'HOLDSECONDS'},
		{name:'HOLDCOUNT'},
		{name:'RINGSECONDS'},
		{name: 'EXTENSION'},         
		{name: 'DIRECTION',type: 'integer'},
		{name: 'CALLER'},
		{name: 'CALLED'},
		{name: 'SECONDS',type: 'integer'},
		{name: 'SYSTEMTIM'}
	],
	idProperty: "GUIDID"
});

Ext.define("Beet.apps.Grid.Store.CRecord", {
	extend: "Ext.data.Store",
	pageSize: 50,
	model: Beet.apps.Grid.Model.CRecord,
	proxy: {
		type: 'jsonp',
		url: "http://192.168.1.100:6661/GetRecDataToJson",
		reader: {
			root: "Data",
			totalProperty: "TotalCount"
		}
	}
});

Ext.define("Beet.apps.Grid.DataView", {
	extend: "Ext.panel.Panel",
	shadow: true,
	width: '100%',
	height: 400,
	renderTo: 'viewport',
	bodyStyle: {
		border: 0,
	},
	initComponent: function(){
		Ext.apply(this, {
			layout: 'fit',
			storeProxy : Ext.create(this.store),
			groupFeature: Ext.create("Ext.grid.feature.Grouping", {
				groupHeaderTpl: 'HOST: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
				groupByText: "按此列分组",
				showGroupsText: "显示分组",
				groupField: "HOST"
			})
		});

		this.callParent(arguments);
	},
	createGrid: function(){
		var that = this, grid = that.grid, store = this.config.store;

		that.grid = Ext.create("Ext.grid.Panel", {
			store: this.storeProxy,
			lookMask: true,
			frame: true,
			collapsible: false,
			rorder: false,
			width: '100%',
			features: [this.groupFeature],
			groupField: "HOST",
			height: 400,
			viewConfig: {
				trackOver: false,
				stripeRows: false,
			},
			columns: [
				{
					dataIndex:'GUIDID',width:20,
				},
				{
					header: "工号", width: 90, dataIndex: 'AGENT', sortable: true
				},{
					header: "主机", width: 90, dataIndex: "HOST", sortable: true, flex: 1
				},
				{
					header: "分机号", width: 90, dataIndex: 'EXTENSION', sortable: true
				},{
					header: "呼叫方向", width: 100, dataIndex: 'DIRECTION', sortable: true,renderer:function(value){
						switch(value){
							case 0:return '呼入';break;
							case 1:return '呼出';break;
							case 2:return '无应答';break;
							case 3:return '断线';break;
						}
					}
				},{
					header: "主叫", width: 100, dataIndex: 'CALLER', sortable: true
				},{
					header: "被叫", width: 100, dataIndex: 'CALLED', sortable: true
				},{
					header: "保留次数", width: 100, dataIndex: 'HOLDCOUNT', sortable: true
				},{
					header: "保留时长", width: 100, dataIndex: 'RINGSECONDS', sortable: true
				},{
					header: "振铃时长", width: 100, dataIndex: 'RINGSECONDS', sortable: true
				},{
					header: "通话时长(秒)", width: 100, dataIndex: 'SECONDS', sortable: true
				},{
					header: "通话开始时间", width: 180, dataIndex: 'SYSTEMTIM', sortable: true
				}
			
			],
			bbar: Ext.create('Ext.PagingToolbar', {
				store: this.storeProxy,
				displayInfo: true,
				displayMsg: 'Displaying topics {0} - {1} of {2}',
				emptyMsg: "No topics to display",
				items: [
					'-', {
						text: "Show Preview"
					}
				]
			}),
			fbar  : ['->', {
				text:'Clear Grouping',
				iconCls: 'icon-clear-group',
				handler : function(){
					//groupingFeature.disable();
				}
			}],
			renderTo: that.body
		});
	},
	afterRender: function(){
		this.createGrid()
		this.callParent(arguments);
	}
});
