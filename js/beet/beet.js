//导航空间
Ext.namespace("Beet.apps.Menu", "Beet.apps.Menu.Tabs");

//设定目录菜单
Beet.apps.Menu.Items = [
	{
		title: "客户管理",
		items: [
			{
				xtype: "container",
				layout: "hbox",
				defaults: {
					height: 100,
					width: 250
				},
				defaultType: "buttongroup",
				items: [
					{
						xtype: 'buttongroup',
						title: '会员会籍',
						width: 250,
						layout: "anchor",
						defaults: {
							scale: "large",
							rowspan: 3
						},
						items: [
							{
								xtype: "button",
								text: "增加会员",
								tooltip: "点击打开新增会员界面",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["addCustomer"];
									if (!item){
										//get serviceItems
										var timer;
										Beet.cache.serviceItems = []
										Beet.apps.Viewport.getServiceItems(Beet.cache.serviceItems);
										if (!timer){
											timer = setInterval(function(){
												if (Beet.cache.serviceItems.length > 0){
													if (timer){
														clearInterval(timer);
														timer = null;
														Beet.workspace.addPanel("addCustomer", "添加会员", {
															items: [
																Ext.create("Beet.apps.Viewport.AddUser")
															]
														});	
													}
												}
											}, 100);
										}

									}else{
										Beet.workspace.workspace.setActiveTab(item);
									}
								}
							},
							{
								xtype: "button",
								text: "编辑会员",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["editCustomer"];
									if (!item){
										Beet.workspace.addPanel("editCustomer", "编辑会员", {
											items: [
												Ext.create("Beet.apps.Viewport.CustomerList")
											]	
										});
									}else{
										Beet.workspace.workspace.setActiveTab(item);
									}
								}
							},
							{
								xtype: "button",
								text: "删除会员",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["deleteCustomer"];
									if (!item){
										Beet.workspace.addPanel("deleteCustomer", "删除会员", {

										});
									}else{
										Beet.workspace.workspace.setActiveTab(item);
									}
								}
							}
						]
					},
					{
						xtype: 'buttongroup',
						title: '312313',
						layout: 'anchor'
					},
					{
						xtype: 'buttongroup',
						title: "other",
						layout: "anchor"
					}
				]
			}
		]
	},
	{
		title: "库存管理",
		html : "<div style='border: 1px solid #ff0000'>we1231</div>"
	},
	{
		title: "人事管理",
		html: "23131412412"
	},
	{
		title: "排班管理"
	},
	{
		title: "设置",
		items: [
			{
				xtype: "container",
				layout: "hbox",
				defaultType: "buttongroup",
				defaults: {
					height: 100,
					width: 250
				},
				items: [
					{
						title: '客户管理',
						width: 250,
						layout: "anchor",
						defaults: {
							scale: "large",
							rowspan: 3
						},
						items: [
							{
								text: "会员级别",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["memberLvls"];
									if (!item){
										Beet.workspace.addPanel("memberLvls", "会员级别", {
											items: [
												Ext.create("Beet.apps.Viewport.memberLvlsList")
											]
										});	
									}else{
										Beet.workspace.workspace.setActiveTab(item);
									}
								}
							}
						]
					}
				]
			}
		]
	}
];

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
		
		//当框体变动的时候 进行自动调整大小
		Ext.EventManager.onWindowResize(that.fireResize, that);
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
			items: Beet.apps.Menu.Items
		}

		return config
	},
	fireResize: function(w, h){
		if (w < 960){
			//donothing
		}else{
			this.setWidth(w);
		}
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
		//导航栏toolbar
		that.navigationToolbar = new Ext.toolbar.Toolbar(that.getNavitionConfig());
		that.navigationToolbar.parent = that;

		//username
		that.userName = new Ext.toolbar.TextItem({ text: Ext.util.Cookies.get("userName")});
		that.logoutButton = new Ext.toolbar.Toolbar(that.getLogoutButtonConfig());
		that.helpButton = new Ext.toolbar.Toolbar(that.getHelpButtonConfig());
		that.toggleButton = new Ext.toolbar.Toolbar(that.getToggleButtonConfig());

		that.items = [
			//about button / menu
			{
				xtype: "splitbutton",
				text: "ICON"
			}, "-",
			//menu category button
			that.navigationToolbar,
			
			//username
			"->",//设定到右边区域
			'-',
			//help
			that.userName, ' ', 
			that.logoutButton, ' ',
			that.toggleButton, ' ',
			that.helpButton,
			//add clock
			{
				xtype: "trayclock"
			}
		];
		
		that.callParent();
		Ext.defer(function(){
			Ext.EventManager.on(that.configurePanel.getTabBar().body, "click", that.onTabBarClick, that);
		}, 1);
		/*
		*/
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
			enableOverflow: false
		}
		return config
	},
	getLogoutButtonConfig: function(){
		var that = this, config;
		config = {
			layout: "fit",
			items: [
				{
					xtype: "button",
					text: "退出",
					handler: function(){
						var customerLoginServer = Beet.constants.customerLoginServer;
						customerLoginServer.Logout({
							success: function(){
								Ext.util.Cookies.clear("userName");
								Ext.util.Cookies.clear("userId");
								Ext.util.Cookies.clear("sessionId");
								window.location = "index.html";	
							},
							failure: function(){}
						});	
					}
				}
			]
		};
		return config;
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

		var h = Ext.core.Element.getViewHeight();
		if (Beet.workspace){
			Beet.workspace.setHeight(h - 132)
		}

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
		var h = Ext.core.Element.getViewHeight();

		that.b_collapsed = true;
		
		if (Beet.workspace){
			Beet.workspace.setHeight(h - 32)
		}

		if (that.collapseTool){
			that.collapseTool.setType("expand-"+that.b_expandDirection);
		}

		if (that.collapseTool){
			that.collapseTool.enable();
		}
	},
	onTabBarClick: function(){
		var that = this;
		if (that.b_collapsed){
			//fire expand
			//设置延迟执行函数 避免点击的时候界面乱掉
			Ext.defer(function(){
				that.toggleCollapse();
			}, 1);
		}
	}
})


Ext.define("Beet.apps.Viewport", {
	extend: "Ext.container.Container",	
	renderTo: "viewport",
	layout: "fit",
	floatable: false,
	border: false,
	plain: true,
	initComponent: function(){
		var that=this;
		Ext.apply(this, {});

		that.items = [
			that.createMainPanel()
		];

		Ext.EventManager.onWindowResize(that.fireResize, that);

		that.callParent();	
	},
	onRender: function(){
		var that = this, h = Ext.core.Element.getViewHeight();
		//自动计算高度 总高度 - menu高度
		that.setHeight(h-132);
		that.callParent(arguments);
	},
	createMainPanel: function(){
		var panel = Ext.create("Ext.tab.Panel", {
			border: false,
			maxTabWidth: 230,
			minTabWidth: 150,
			region: "top",
			shadow: true,
			layout: "fit",
			frame: true,
			defaults: {
				autoScroll: true,
				border: false,
				closable: true
			},
			/*
			plugins: [
				{
					ptype: "tabscrollmenu",
					maxText: 15,
					pageSize: 5,
					menuPrefixText: ""	
				}
			],*/
			items: [
			],
			onRemove: function(item){
				var name = item.b_name;
				if (Beet.apps.Menu.Tabs[name]){
					Beet.apps.Menu.Tabs[name] = null;
				}
			}
		})
		this.workspace = panel;
		return panel
	},
	fireResize: function(w, h){
		if (w >= 960){
			this.setWidth(w);
		}
		if (h > 300){
			this.setHeight(h - 132);
		}
	},
	//add panel
	addPanel: function(name, title, config){
		var item = this.workspace.add(Ext.apply({
			inTab: true, 
			title: title,
			tabTip: title
		}, config));
		//设置一个私有的name名称, 为了能直接摧毁
		item.b_name = name;
		Beet.apps.Menu.Tabs[name] = item;
		this.workspace.setActiveTab(item);
	}
});

Beet.apps.Viewport.getServiceItems = function(serviceItems){
	Beet.constants.customerServer.GetServiceItems({
		success: function(data){
			data = Ext.JSON.decode(data)
			if (data["Data"] && Ext.isArray(data["Data"])){
				var datz = data["Data"];
				for (var item in datz){
					var p = datz[item];
					serviceItems.push({
						boxLabel: p["ServiceName"],
						name: "serverName",
						inputValue: p["ServiceType"]
					})
				}
			}
		},
		failure: function(){
			
		}
	})
}

Ext.define("Beet.apps.Viewport.AddUser", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: "100%",
	activeItem: 0,
	defaults: {
		border: 0	
	},
	suspendLayout: true,
	initComponent: function(){
		var that = this;
		Ext.apply(this, {});

		//base info
		that.serviceItems = Beet.cache.serviceItems;
		that.baseInfoPanel = Ext.create("Ext.form.Panel", that.getBaseInfoPanelConfig());
		that.items = [
			that.baseInfoPanel
		]
		that.callParent(arguments);
	},
	getBaseInfoPanelConfig: function(){
		var that = this, config

		config = {
			frame: true,
			bodyPadding: 10,
			height: "100%",
			fieldDefaults: {
				msgTarget: 'side',
				labelAlign: "left",
				labelWidth: 75
			},
			items: [
				{
					xtype: "container",
					layout: "hbox",
					frame: true,
					border: false,
					items: [
						{
							title: "基础信息",
							xtype: "fieldset",
							flex: 1,
							defaultType: "textfield",
							layout: "anchor",
							fieldDefaults: {
								msgTarget: 'side',
								labelAlign: "left",
								labelWidth: 75
							},
							items: [
								{
									fieldLabel: "会员姓名",
									name: "Name",
									allowBlanks: false
								},
								{
									fieldLabel: "会员卡号",
									name: "CardNo"
								},
								{
									fieldLabel: "身份证",
									name: "PersonID"
								},
								{
									fieldLabel: "出生日期",
									xtype: "datefield",
									name: "BirthDay",
									format: 'Y年m月d日',
								},
								{
									fieldLabel: "手机号码",
									name: "Mobile",
									allowBlank: false
								},
								{
									fieldLabel: "座机号码",
									name: "Phone"
								},
								{
									fieldLabel: "QQ/MSN",
									name: "IM"
								},
								{
									fieldLabel: "地址",
									name: "Address"
								},
								{
									fieldLabel: "职业",
									name: "Job"
								}
							]
						},
						{
							xtype: "component",
							width: 5
						}
					]
				},
				{
					xtype: "component",
					width: 15
				},
				{
					xtype: "container",
					frame: true,
					border: false,
					layout: "hbox",
					items: [
						{
							xtype: "container",
							frame: true,
							flex: 1,
							layout: "anchor",
							items: [
								{
									xtype: 'checkboxgroup',
									fieldLabel: '拥有项目',
									fieldDefaults: {
										labelAlign: "left",
										labelWidth: 75
									},
									items: that.serviceItems
								}
							]
						},
						{
							xtype: "container",
							frame: true,
							layout: "anchor",
							flex: 1
						},
						{
							xtype: "button",
							id : "move-next",
							scale: "large",
							text: "下一步",
							handler: that.addUser
						}
					]
				}
			]
		}
		return config
	},
	addUser: function(direction, e){
		var that = this,
			form = that.up("form").getForm(),
			result = form.getValues(), needSubmitData, serverItems, customerServer = Beet.constants.customerServer;
		if (result["Name"] != "" && result["Mobile"] != ""){
			if (result["BirthDay"] != ""){
				result["BirthDay"] = Beet.constants.GRANDMADATE;
			}else{
				var now = new Date(), timezoneOffset = now.getTimezoneOffset() * 60;
				result["BirthDay"] = ((+Ext.Date.parse(result["BirthDay"], "Y年m月d日")) / 1000) - timezoneOffset
			}
			serverItems = result["serverName"];
			needSubmitData = Ext.JSON.encode(result);
			/*
			customerServer.AddCustomer(needSubmitData, {
				success: function(uid){
					//caching
					Beet.cache.Users[uid] = {
						serverName : serverName			
					}
					if (serverName){
						//点击注册下一步
					}else{
						//添加成功弹窗
						//直接清空上次填入的数据
					}
				},
				failure: function(error){
					Ext.Error.railse("创建用户失败")
					//console.log("failure", error)
				}
			});
			*/
		}
	}
	/*
	 * 重新触发生产panel
	 */
});

Ext.define("Beet.apps.Viewport.CustomerList.Model", {
	extend: "Ext.data.Model",
	fields: [
		"CTID",
		"CTCardNo",
		"CTName",
		"CTBirthday",
		"CTMobile",
		"CTPhone",
		"CTJob",
		"CTIM",
		"CTAddress"
	]
});

Ext.define("Beet.apps.Viewport.CustomerList.Store", {
	extend: "Ext.data.Store",
	model: Beet.apps.Viewport.CustomerList.Model,
	autoLoad: true,
	proxy: {
		type: "b_proxy",
		b_method: Beet.constants.customerServer.GetCustomerToJSON,
		b_scope: Beet.constants.customerServer,
		reader: {
			type: "json",
			root: "Data"
		}
	}
});

Ext.define("Beet.apps.Viewport.CustomerList", {
	extend: "Ext.panel.Panel",
	anchor: "anchor",
	height: "100%",
	defaults: {
		border: 0
	},
	initComponent: function(){
		var that = this
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.Viewport.CustomerList.Store"),
			layout: "fit"
		});
		that.callParent(arguments);
	},
	afterRender: function(){
		var that = this;
		that.createCustomerGrid();

		that.callParent(arguments);
	},
	createCustomerGrid: function(){
		var that = this, grid = that.grid, store = that.storeProxy;
		that.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			lookMask: true,
			frame: true,
			collapsible: false,	
			rorder: false,
			width: "100%",
			height: "100%",
			layout: "anchor",
			viewConfig: {
				trackOver: false,
				stripeRows: false
			},
			columns: [
				/*{
					dataIndex:'CTGUID',width:20,
				},*/
				{
					header: "会员卡号", dataIndex: 'CTCardNo', sortable: true
				},
				{
					header: "会员名字", dataIndex: "CTName", sortable: true, flex: 1
				},
				{
					header: "生日日期", dataIndex: "CTBirthday", flex: 1
				},
				{
					header: "手机号码", dataIndex: "CTMobile"
				},
				{
					header: "座机号码", dataIndex: "CTPhone"
				},
				{
					header: "地址", dataIndex: "CTAddress", flex: 1
				},
				{
					header: "职业", dataIndex: "CTJob"
				},
				{
					header: "QQ/MSN", dataIndex: "CTIM"
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
		})
	}
})

Ext.namespace("Beet.apps.Viewport.memberLvls");
Ext.define("Beet.apps.Viewport.memberLvls.Model", {
	extend: "Ext.data.Model",
	fields: [
		'id',
		'name',
		'description',
		{name:'active', type: 'boolean'}
	]
})

Ext.define("Beet.apps.Viewport.memberLvls.Store", {
	extend: "Ext.data.Store",
	autoDestroy: true,
	model: "Beet.apps.Viewport.memberLvls.Model",
	pageSize: 50,
	data: [
		{
			id: 1,
			name: "白金",
			description: "白金会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
		{
			id: 2,
			name: "钻石",
			description: "钻石会员描述",
			active: true
		},
	]
	/*
	proxy: {
		type: "jsonp",
		url: "http://192.168.1.100:6660/GetRecDataToJson",
		reader: {
			root: "Data",
			totalProperty: "TotalCount"
		}
	}*/
});

Ext.define("Beet.apps.Viewport.memberLvlsList", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	shadow: true,
	defaults: {
		border: 0
	},
	initComponent: function(){
		var that = this;
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.Viewport.memberLvls.Store")
		});

		that.callParent(arguments);
	},
	afterRender: function(){
		var that = this;
		that.createMemberLvlsList();
		that.callParent(arguments);
	},
	createMemberLvlsList: function(){
		var that = this, store = that.storeProxy
		that.memberLvlsList = Ext.create("Ext.grid.Panel", {
			renderTo: that.body,
			store: store,
			frame: true,
			lookMask: true,
			rorder: true,
			tbar: [
				{
					xtype: "button",
					text: "增加"	
				},"-",
				{
					xtype: "button",
					text: '删除'
				},"-",
				{
					xtype: 'button',
					text: '编辑'
				}
			],
			columns: [
				{
					header: "ID",
					dataIndex: "id",
					sortable: true
				},
				{
					header: "级别名称",
					dataIndex: "name",
					sortable: true
				},
				{
					header: "描述",
					dataIndex: "description",
					flex: 1
				},
				{
					header: "启用",
					dataIndex: "Active",
					xtype: "checkcolumn"
				}	
			]
		});
	}
});
