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
Ext.namespace("Beet.apps.Menu");
Ext.define("Beet.apps.Menu.Panel", {
	extend: "Ext.panel.Panel",
	width: "100%",	
	layout: "fit",
	renderTo: "header",
	shadow: true,
	initComponent: function(){
		var that = this;
		//目录设置面板
		that.configurePanel = new Ext.tab.Panel(that.getCPanelConfig());
		that.dockedItems = [
			//顶部导航条
			{
				xtype: "BeetMenuBar",
				configurePanel: that.configurePanel,
				dock: "top"
			},
			that.configurePanel
		]
		this.callParent(arguments);
	},
	getCPanelConfig: function(){
		var config = {
			border: 1,
			width: '100%',
			height: 100,
			layout: "fit",
			id: "configurePanel",
			dock: "bottom",
			plain: true,
			minTabWidth: 100,
			items: [
				{
					title: "客户管理",
					items: [
						{
							xtype: "container",
							layout: "hbox",
							items: [
								{
									xtype: 'fieldset',
									title: '会员会籍',
									flex: 1,
									layout: "anchor",
									items: [
										{
											xtype: "menu",
											plain: true,
											items: [
												{text: "23131"},
												{text: "23131"},
												{text: "23131"},
											]
										},
										{
											xtype: "button",
											text: "增加会员"
										}
									]
								},{
									xtype: "component",
									width: 5
								},
								{
									xtype: 'fieldset',
									flex: 1,
									title: '312313',
									layout: 'anchor'
								},
								{
									xtype: "component",
									width: 5	
								},
								{
									xtype: 'fieldset',
									flex: 1,
									title: "other",
									layout: "anchor"
								}
							]
						}
					]
				},
				{
					title: "库存管理",
					html : "<div style='border: 1px solid #ff0000'>we1231</div>",
				},
				{
					title: "人事管理",
					html: "23131412412"
				},
				{
					title: "排班管理"
				}
			]
		}

		return config
	}
})

Ext.define("Beet.apps.Menu.Toolbar", {
	extend: "Ext.toolbar.Toolbar",
	alias: "widget.BeetMenuBar",
	height: 30,
	cls: "beet-navigationbar",
	useQuickTips: true,
	//设置两个私有属性, 为了与ext不冲突 使用 b_xxx 命名
	b_collapseDirection : 'top',
	b_collapsed: false,
	b_collapsedCls: 'collapsed',
	initComponent: function(){
		var that = this;
		if (that.useQuickTips){
			Ext.QuickTips.init();
		}
		//create menu start menu button
		//that.startMenu 

		//导航栏toolbar
		that.navigationToolbar = new Ext.toolbar.Toolbar(that.getNavitionConfig());
		that.navigationToolbar.parent = that;

		//username
		that.userName = new Ext.toolbar.TextItem({ text: "userName"});
		that.helpButton = new Ext.toolbar.Toolbar(that.getHelpButtonConfig());
		that.toggleButton = new Ext.toolbar.Toolbar(that.getToggleButtonConfig());

		that.items = [
			//about button
			{
				xtype: "button",
				text: "start Menu",
			}, "-",
			//menu category button
			that.navigationToolbar,
			
			//username
			"->",//设定到右边区域
			'-',
			//help
			that.userName, ' ',
			that.toggleButton, ' ',
			that.helpButton
		];

		that.callParent();

		that.b_collapseDirection = that.b_collapseDirection || Ext.Component.DIRECTION_TOP;
	},
	afterLayout: function(){
		var that = this;
		that.callParent();
	},
	//获取导航栏配置
	getNavitionConfig: function(){
		var that = this, config,
		configurePanel = that.configurePanel, navigationTab = configurePanel.getTabBar();
		navigationTab.ownerCt = that.parent;
		navigationTab.dock = "";
		navigationTab.width = 600;
		navigationTab.height=23;
		navigationTab.border=0;
		config = {
			cls: "beet-navtoolbar",
			width: 600,
			items: [
				"&#160;",
				navigationTab	
			],
			enableOverflow: false,
		}
		return config
	},
	//右边区域
	getHelpButtonConfig: function(){
		var that = this, config;
		config = {
			layout: "fit",
			items: [
				{
					xtype: "tool",
					type: "help",
					handler: function(){
						Ext.Msg.alert("Help", "2313123");//点击按钮后 触发函数
					},
					tooltip: "点击获得帮助"
				}
			]
		}
		return config
	},
	getToggleButtonConfig: function(){
		var that = this, config;
		
		//创建expand/collapse工具
		that.collapseTool = that.expandTool = that.createComponent({
			xtype: 'tool',
			type: 'collapse-' + that.b_collapseDirection,
			//expandType:
			handler: Ext.Function.bind(that.toggleCollapse, that, []),
			scope: that
		});
		config = {
			layout: "fit",
			items: [
				that.collapseTool
			]
		};
		return config;
	},
	toggleCollapse: function(){
		var that = this;
		if (that.b_collapsed){
			that.expand();
		}else{
			that.collapse(that.b_collapseDirection);
		}
		return that
	},
	expand: function(){
		if (!this.b_collapsed || this.fireEvent('beforeexpand', this) === false ){
			return false;
		}
		var that = this, parent = that.ownerCt, configurePanel = that.configurePanel, c = Ext.Component,
		direction=that.b_expandDirection, anim,
		toolbarHeight = that.getHeight(), toolbarWidth = that.getWidth();
		
		if (that.collapseTool){
			that.collapseTool.disable();
		}

		//update tool style
		if (that.collapseTool){
			that.collapseTool.setType("collapse-"+that.b_collapseDirection);
		}
		that.b_collapsed = false;

		configurePanel.show();

		that.removeClsWithUI(that.b_collapsedCls);
		anim = {
			to: {

			},
			from: {
				height: toolbarHeight,
				width: toolbarWidth
			},
			listeners: {
				afteranimate: that.afterExpand,
				scope: that
			}
		}
		
		if (direction == c.DIRECTION_TOP || direction == c.DIRECTION_BOTTOM){
			parent.setCalculatedSize(parent.width, null);
			anim.to.height = parent.getHeight();
			parent.setCalculatedSize(parent.width, anim.from.height);
		}
		
		parent.animate(anim);
		return that;
	},
	afterExpand: function(){
		var that = this, parent = that.ownerCt, configurePanel = that.configurePanel;
		parent.setAutoScroll(parent.initialConfig.autoScroll);
		parent.suspendLayout=null;
		if (parent.ownerCt){
			parent.ownerCt.doLayout();
		}
		that.fireEvent("expand", that);
		if (that.collapseTool){
			that.collapseTool.enable();
		}
	},
	getOppositeDirection: function(direction){
		var c = Ext.Component;
		switch (direction){
			case c.DIRECTION_TOP:
				return c.DIRECTION_BOTTOM;
			case c.DIRECTION_BOTTOM:
				return c.DIRECTION_TOP;
		}
	},
	collapse: function(direction){
		var that = this, parent = that.ownerCt, configurePanel = that.configurePanel, c = Ext.Component, newSize = 0,
		toolbarHeight = that.getHeight() + 2, toolbarWidth = that.getWidth(),
		parentHeight = parent.getHeight(), parentWidth= parent.getWidth(), 
		panelHeight = configurePanel.getHeight(), panelWidth = configurePanel.getWidth(), pos = 0,
		anim = {
			from:{
				height: parentHeight,
				width: parentWidth
			},
			to: {
				height: toolbarHeight,
				width: toolbarWidth
			},
			listeners: {
				afteranimate: that.afterCollapse,
				scope: that
			},
			duration: Ext.Number.from(true, Ext.fx.Anim.prototype.duration)
		};

		if (!direction){
			direction = that.b_collapseDirection;
		}

		if (that.b_collapsed || that.fireEvent('beforecollapse', that, direction) === false){
			return false;
		}
		that.b_expandDirection = that.getOppositeDirection(direction);

		if (direction == c.DIRECTION_TOP){
			that.b_expandedSize = parent.getHeight();
		}
		
		//no scrollbars	
		parent.setAutoScroll(false);
		parent.suspendLayout = true;
		parent.body.setVisibilityMode(Ext.core.Element.DISPLAY);

		if (that.collapseTool){
			that.collapseTool.disable();
		}
		that.addClsWithUI(that.b_collapsedCls)

		//开始动画
		configurePanel.hide()
		parent.animate(anim);
		return that;
	},
	afterCollapse: function(){
		var that = this, configurePanel = that.configurePanel;

		that.b_collapsed = true;
		if (that.collapseTool){
			that.collapseTool.setType("expand-"+that.b_expandDirection);
		}

		if (that.collapseTool){
			that.collapseTool.enable();
		}
	},
	onRender: function(ct, position){
		var that = this;
		
		//初始化是否需要collaps.
		if (that.b_collapsed){
			that.b_collapsed = false;
			//TODO:
		}

		that.callParent(arguments);
	}
})

//主观察入口
Ext.namespace("Beet.apps.Viewport");
Ext.define("Beet.apps.Viewport.Main", {
	extend: "Ext.container.Viewport"

});

Ext.define("Beet.apps.Viewport.Statusbar", {

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
