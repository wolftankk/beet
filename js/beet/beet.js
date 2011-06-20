if (!String.prototype.replaceAll){
	String.prototype.replaceAll = function(reg, str){
		return this.replace(new RegExp(reg, "gm"), str);
	}
}


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
				frame: true,
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
						frame: true,
						defaults: {
							scale: "large",
							rowspan: 3
						},
						items: [
							{
								xtype: "button",
								text: "增加会员",
								id: "customer_addBtn",
								tooltip: "点击打开新增会员界面",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["addCustomer"];
									if (!item){
										Beet.apps.Viewport.getServiceItems(
											function(){
												Beet.workspace.addPanel("addCustomer", "添加会员", {
													items: [
														Ext.create("Beet.apps.Viewport.AddUser")
													]
												});
												Beet.apps.Viewport.getCTTypeData();
										})
									}else{
										Beet.workspace.workspace.setActiveTab(item);
									}
								}
							},
							{
								xtype: "button",
								text: "编辑会员",
								id: "customer_editBtn",
								tooltip: "编辑会员个人资料或者删除会员.",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["editCustomer"];
									if (!item){
										Beet.apps.Viewport.getColumnsData(function(){
											Beet.workspace.addPanel("editCustomer", "编辑会员", {
												items: [
													Ext.create("Beet.apps.Viewport.CustomerList")
												]	
											});
										})

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
		title: "库存管理"
	},
	{
		title: "人事管理"
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
								text: "会员属性",
								handler: function(){
									var item = Beet.apps.Menu.Tabs["customerAttr"];
									if (!item){
										Beet.workspace.addPanel("customerAttr", "会员属性", {
											items: [
												Ext.create("Beet.apps.Viewport.SettingViewPort")
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
		that.getOperatorList();	
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
	getOperatorList: function(__callback){
		//获取权限
		var that = this, customerServer = Beet.constants.customerServer;
		customerServer.GetOperatorList(Beet.constants.RES_CUSTOMER_IID, {
			success: function(data){
				if (Beet.cache.Operator == undefined){
					Beet.cache.Operator = {};	
				}
				Beet.cache.Operator.privilege = data.split(",");
				that.updatePanelStatus();
			},
			failure: function(error){
				//console.log(error);
			}
		});
	},
	updatePanelStatus: function(){
		var that = this;
		//TODO: 权限判断
		
		for (var k in Beet.constants.privileges){
			var privilege = Beet.constants.privileges[k], btn = that.query("#"+k), hidden = false, c = 0;
			while (true){
				var p = privilege[c];
				if (p == undefined){
					break;
				}
				if (Beet.cache.Operator.privilege.indexOf(p) > -1){
					hidden = hidden || false;
				}else{
					hidden = hidden || true;
				}
				c++;
			}
			if (hidden && btn[0]){
				btn[0].hide();
			}
		}
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

		return config;
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
							failure: function(){
								window.location = "index.html";		
							}
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
						//TODO 帮助
					},
					tooltip: "点击获得帮助"
				}
			]
		}
		return config;
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
			Beet.workspace.setHeight(h - 132);
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
		that.addClsWithUI(that.b_collapsedCls);

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
			Beet.workspace.setHeight(h - 32);
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
});

Ext.define("Beet.apps.Viewport", {
	extend: "Ext.container.Container",	
	renderTo: "viewport",
	layout: "fit",
	floatable: false,
	border: 0,
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
			shadow: true,
			layout: "anchor",
			frame: true,
			defaults: {
				autoScroll: true,
				border: 0,
				closable: true,
				plain: true
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

//获取服务项目
Beet.apps.Viewport.getServiceItems = function(__callback){
	if (Beet.cache.serviceItems == undefined){
		Beet.cache.serviceItems = [];
		Beet.constants.customerServer.GetServiceItems({
			success: function(data){
				var data = Ext.JSON.decode(data)
				if (data["Data"] && Ext.isArray(data["Data"])){
					var datz = data["Data"];
					for (var item in datz){
						var p = datz[item];
						Beet.cache.serviceItems.push({
							boxLabel: p["ServiceName"],
							name: "serverName",
							inputValue: p["ServiceType"]
						})
					}
				}
				__callback();
			},
			failure: function(){
				Ext.Error.railse("与服务器断开链接");
			}
		})
	}else{
		__callback();
	}
}

Beet.apps.Viewport.getColumnsData = function(__callback){
	if (Beet.cache.customerColumns == undefined){
		Beet.constants.customerServer.GetCustomerToJSON("", true, {
			success: function(data){
				var data = Ext.JSON.decode(data);
				columnsData = data["MetaData"];
				Beet.cache["customerColumns"] = columnsData;
				__callback();
			},
			failure: function(error){

			}
		})
	}else{
		__callback();
	}
}

Beet.apps.Viewport.getCTTypeData = function(__callback, force){
	if (Beet.cache["advanceProfile"] && !force){ return;}
	var customerServer = Beet.constants.customerServer;
	Beet.cache["advanceProfile"] = {};

	var _preprocess = function(target, cache, isSub){
		var item = {};
		for (var k in target){
			if (k == "category"){
				for (citem in target[k]){
					var _data = target[k][citem];
					if (_data["category"].length == 0){
						if (_data["item"].length > 0){
							var inputmode = _data["item"][0]["inputmode"];
							item["fieldLabel"] = _data["label"];
							item["pid"] = _data["pid"];
							item["_id"] = _data["id"];
							//textfield
							if (inputmode != 0){
								item["xtype"] = Beet.constants.CTInputMode[inputmode];
							}else{
								item["xtype"] = "fieldset";
								item["frame"] = true;
								item["title"] = _data["label"];
							}
							item["flex"] = 1;
							item["items"] = [];
							_preprocess(_data, item["items"], true);
							if (isSub){
								cache.push(item);
								item = {};
							}
						}else{
							//no item
							item["fieldLabel"] = _data["label"];
							item["pid"] = _data["pid"];
							item["_id"] = _data["id"];
							item["flex"] = 1;
							item["title"] = _data["label"];
							item["xtype"] = "fieldset";
						}
					}else if(_data["category"].length > 0 || _data["pid"] == -1){
						item["fieldLabel"] = _data["label"];
						item["pid"] = _data["pid"];
						item["_id"] = _data["id"];
						item["title"] = _data["label"];
						item["xtype"] = "fieldset";
						item["flex"] = 1;
						item["items"] = [];
						_preprocess(_data, item["items"], true);	
						if (isSub){
							cache.push(item);
							item = {};
						}
					}
				}
			}else if(k == "item"){
				for (var iId in target[k]){
					var _data = target[k][iId];
					var inputmode = _data["inputmode"];
					if (inputmode == 0){
						item = {
							xtype: "textfield",
							fieldLabel: _data["label"],
							name: "text_type_" + _data["pid"],
							pid: _data["pid"],
							_id: _data["id"]
						}
					}else{
						item = {
							inputValue : _data["id"],
							pid: _data["pid"],
							boxLabel: _data["label"],
							name: "category_" + _data["pid"]
						}
					}

					if (isSub){
						cache.push(item);
						item = {};
					}
				}
			}else{

			}
		}
		if (!isSub){
			cache.push(item);
		}
	}

	//get data
	for (var st in Beet.constants.CTServiceType){
		customerServer.GetCTTypeDataToJSON("ServiceType='"+st+"'", true, {
			success: function(data){
				data = Ext.JSON.decode(data);	
				var sid = data["category"][0]["serviceid"], _tmp = [];
				_preprocess(data, _tmp);
				//这里直接生产界面
				Beet.cache["advanceProfile"][sid] = _tmp;
			},
			failure: function(error){
				//Ext.Error.raise(error);
			}
		})
	}

	if (__callback && Ext.isFunction(__callback)){
		__callback();
	}
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

		that.serviceItems = Beet.cache.serviceItems;
		that.baseInfoPanel = Ext.create("Ext.form.Panel", that.getBaseInfoPanelConfig());
		
		that.optionTabs = that.createOptionTabs();
		that.advancePanel = that.createAdvancePanel();
		that.items = [
			that.baseInfoPanel,
			that.advancePanel
		]
		that.callParent(arguments);
	},
	getBaseInfoPanelConfig: function(){
		var that = this, config;
		config = {
			frame: true,
			bodyPadding: 10,
			layout: "anchor",
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
									allowBlank: false
								},
								{
									fieldLabel: "会员卡号",
									name: "CardNo",
									allowBlank: false,
								},
								{
									fieldLabel: "身份证",
									name: "PersonID"
								},
								{
									fieldLabel: "出生日期",
									xtype: "datefield",
									name: "Birthday",
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
								}//TODO: 专属顾问选择列表
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
							formBind: true,
							disabled: true,
							text: "下一步",
							handler: that.addUser
						}
					]
				}
			]
		}
		return config;
	},
	addUser: function(direction, e){
		var that = this,
			form = that.up("form").getForm(),
			result = form.getValues(), needSubmitData, serverItems = {}, customerServer = Beet.constants.customerServer;

		if (result["Name"] != "" && result["Mobile"] != ""){
			if (result["Birthday"] == ""){
				result["Birthday"] = Beet.constants.GRANDMADATE;
			}else{
				var now = new Date(), timezoneOffset = now.getTimezoneOffset() * 60;
				result["Birthday"] = ((+Ext.Date.parse(result["Birthday"], "Y年m月d日")) / 1000) - timezoneOffset;
			}
			//取得已勾选的服务项目
			serverItems = result["serverName"];
			needSubmitData = Ext.JSON.encode(result);
			Ext.MessageBox.show({
				title: "增加用户",
				msg: "是否向服务器提交用户资料?",
				buttons: Ext.MessageBox.YESNO,
				icon: Ext.MessageBox.QUESTION,
				fn: function(btn){
					if (btn == "yes") {
						customerServer.AddCustomer(needSubmitData, {
							success: function(uid){
								Beet.cache.Users[uid] = {
									serviceItems: serverItems	
								}
								Beet.cache.currentUid = uid;
								if (serverItems && serverItems.length > 0){
									var __callback = function(){
										var formpanel = that.up("form"), parent = formpanel.ownerCt;
										formpanel.hide();
										if (parent.advancePanel){
											parent.updateAdvancePanel(uid);
										}
									}
									//判断是否有数据 如果含有 直接创建
									if (Beet.cache["advanceProfile"] == undefined){
										Beet.apps.Viewport.getCTTypeData(__callback);
									}else{
										__callback();
									}
								}else{
									//添加成功弹窗
									//直接清空上次填入的数
									Ext.MessageBox.show({
										title: "提示",
										msg: "是否需要再次增加用户?",
										buttons: Ext.MessageBox.YESNO,
										icon: Ext.MessageBox.QUESTION,
										fn: function(btn){
											if (btn == "yes"){
												form.reset();
											}else{
												if (Beet.apps.Menu.Tabs["addCustomer"]){
													Beet.workspace.workspace.getTabBar().closeTab(Beet.apps.Menu.Tabs["addCustomer"].tab)
												}
											}
										}
									});
								}
							},
							failure: function(error){
								Ext.Error.raise("创建用户失败");
							}
						});
					}else{
						//TEST CODE
						var __callback = function(){
							var formpanel = that.up("form"), parent = formpanel.ownerCt;
							formpanel.hide();
							if (parent.advancePanel){
								parent.updateAdvancePanel();
							}
						}
						if (Beet.cache["advanceProfile"] == undefined){
							Beet.apps.Viewport.getCTTypeData(__callback);
						}else{
							__callback();
						}
					}
				}
			});
		}
	},
	createAdvancePanel : function(){
		var that = this, advancePanel = that.advancePanel;
		advancePanel = Ext.create("Ext.form.Panel", {
			frame: true,
			border: 0,
			plain: true,
			layout: "card",
			height: "100%",
			items: [
				that.optionTabs
			],
			buttons : [
				{
					text: "提交",
					scale: "large",
					handler: function(direction, e){
						var that = this, form = that.up("form").getForm(), result = form.getValues();
						//这里需要判断所选择的数据类型 多选 单选 => items,  text => Texts
						var Items = [], Texts = [], needSubmitData;
						for (var k in result){
							var r = result[k];
							if (k.indexOf("text") > -1 && r !== ""){
								var id = k.split("_")[2];
								if (Ext.trim(r) != ""){
									Texts.push({ID: id, Text: r});
								}
							}else{
								Items.push(r);
							}
						}
						
						var customerServer = Beet.constants.customerServer;
						if (Beet.cache.currentUid){
							needSubmitData = {
								"CustomerID" : Beet.cache.currentUid	
							}
							if (Items.length > 0){
								needSubmitData["Items"] = Items;
							}
							if (Texts.length > 0){
								needSubmitData["Texts"] = Texts;
							}

							needSubmitData = Ext.JSON.encode(needSubmitData);

							customerServer.AddCustomerItem(needSubmitData, {
								success: function(isSuccess){
									if (isSuccess){
										Ext.MessageBox.show({
											title: "提交成功!",
											msg: "添加成功!",
											buttons: Ext.MessageBox.OK,
											handler: function(btn){
												//关闭原有的面板 打开新的注册页面
											}
										})
									}
								},
								failure: function(error){
									Ext.Error.raise(error)
								}
							})
						}else{
							//提示没有uid 
						}
					}
				}
			]
		});
		advancePanel.hide();
		return advancePanel;
	},
	updateAdvancePanel : function(uid){
		var that = this, advancePanel = that.advancePanel, optionTabs = that.optionTabs;
		optionTabs.removeAll();
		
		var userInfo = Beet.cache.Users[uid];
		var serviceItems = userInfo["serviceItems"], title, firstTab;
		
		//如果只有一个serviceItem为string	
		if (typeof serviceItems == "string"){
			var _s = serviceItems;
			serviceItems = [_s];
			delete _s;
		}
		
		for (var s in serviceItems){
			var service = serviceItems[s], title = Beet.constants.CTServiceType[service], data = Beet.cache.advanceProfile[service], items = [];
			var _t = optionTabs.add({
				title : title,
				flex: 1,
				layout: "anchor",
				fieldDefaults: {
					msgTarget : "side",
					labelAlign: "left",
					labelWidth: 75
				},
				items: data
			});
			if (firstTab == undefined){
				firstTab = _t;	
			}
		}

		optionTabs.setActiveTab(firstTab);

		that.advancePanel.show();
	},
	createOptionTabs : function(){
		var that = this, me = that.advancePanel;
		var optionTabs = Ext.create("Ext.tab.Panel", {
			frame: true,
			border: 0,
			plain: true,
			layout: "card",
			height: "100%",
			defaults: {
				border: 0,
				frame: true
			},
			items: [
			]
		});
		
		return optionTabs;
	}
});


Ext.define("Beet.apps.Viewport.CustomerList.Model", {
	extend: "Ext.data.Model",
	fields: [
		"CTID",
		"CTCardNo",
		"CTName",
		{ name: "CTBirthday", convert: function(value, record){
			var birthday = (value - Beet.constants.timezoneOffset)* 1000;
			return Ext.Date.format(new Date(birthday), "Y年m月d日");
		}},
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
		filters: {
			b_onlySchema: false
		},
		b_scope: Beet.constants.customerServer,
		reader: {
			type: "json",
			root: "Data"
		}
	}
});

Ext.define("Beet.apps.Viewport.CustomerList", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	width: "100%",
	height: "100%",
	minHeight: 400,
	minWidth: 800,
	frame: true,
	defaults: {
		border: 0
	},
	initComponent: function(){
		var that = this;
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.Viewport.CustomerList.Store")
		});
		
		that.callParent(arguments);
	},
	afterRender: function(){
		var that = this, customerServer = Beet.constants.customerServer;
		//get columns
		that.createCustomerGrid();
		that.callParent(arguments);
	},
	createCustomerGrid: function(){
		var that = this, grid = that.grid, store = that.storeProxy, actions, __columns = [], columnsData = Beet.cache["customerColumns"];
		actions = Ext.create("Beet.plugins.rowActions", {
			header: "操作",	
			autoWidth: true,
			actions: [
				{text: "编辑"},
				{text: "删除"}
			]
		});
		
		//__columns.push(actions);//add rowactions
		for (var columnIndex in columnsData){
			var columnData = columnsData[columnIndex], column;
			if (!columnData["FieldHidden"]){
				var column = {
					flex: 1	
				};
				for (var k in columnData){
					if (k == "FieldLabel"){
						column["header"] = columnData[k];
					}else if(k == "FieldName"){
						column["dataIndex"] = columnData[k];
					}
				}
				__columns.push(column);
			}
		}
		

		that.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			lookMask: true,
			frame: true,
			collapsible: false,	
			rorder: false,
			width: "100%",
			height: "100%",
			layout: "anchor",
			border: 0,
			columnLines: true,
			viewConfig: {
				trackOver: false,
				stripeRows: false
			},
			columns: __columns,
			plugins: [
				actions,
				{
					ptype: "b_contextmenu",
					contextMenu: [
						that.editCustomer(),
						that.deleteCustomer(),
						"-",
						{
							text: "取消"
						}
					]
				}
			],
			bbar: Ext.create('Ext.PagingToolbar', {
				store: this.storeProxy,
				displayInfo: false,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			}),
			renderTo: that.body
		})
	},
	editCustomer: function(){
		var that = this, item;
		item = Ext.create("Ext.Action", {
			text: "编辑",
			handler: function(widget, e){
				var parentMenu = widget.parentMenu, rawData = parentMenu.rawData;
					CTGUID = rawData.CTGUID, CTName = rawData.CTName;
				if (CTGUID){
					Ext.MessageBox.show({
						title: "编辑用户",
						msg: "是否要修改 " + CTName + " 的用户资料",
						buttons: Ext.MessageBox.YESNO,
						fn : function(btn){
							if (btn == "yes"){
								//popup window
								that.popEditWindow(rawData)
							}
						}
					})	
				}
			}
		});

		return item
	},
	popEditWindow: function(rawData){
		var that = this, CTGUID = rawData.CTGUID, CTName = rawData.CTName,
			customerServer = Beet.constants.customerServer, win;
		
		/*
		customerServer.GetCustomerItemToJson("CTGUID='"+CTGUID+"'", {
			success: function(data){
				console.log(data);	
			},
			failure: function(error){
				console.log(error);
			}
		})
		*/
		//get serviceItems;
		//tabPanel
		var settingTabPanel = Ext.create("Ext.tab.Panel", {
			frame: true,
			border: 0,
			plain: true,
			layout: "card",
			height: "100%",
			defaults: {
				border: 0,
				frame: true
			},
			items: []
		});


		var basicform = Ext.widget("form", {
			layout: {
				type: 'vbox',
				align: "stretch"
			},
			frame: true,
			border: false,
			bodyPadding: 10,
			defaults: {
				margin: "0 0 10 0"
			},
			plain: true,
			flex: 1,
			defaultType: "textfield",
			fieldDefaults: {
				msgTarget: "side",
				labelAlign: "left",
				labelWidth: 75
			},
			items: [
				{
					fieldLabel: "会员姓名",
					name: "Name",
					value: rawData.CTName,
					allowBlank: true,
					dataIndex: "CTName"
				},
				{
					fieldLabel: "会员卡号",
					name: "CardNo",
					allowBlank: true,
					value: rawData.CTCardNo,
					dataIndex: "CTCardNo"
				},
				{
					fieldLabel: "身份证",
					name: "PersonID",
					value: rawData.CTPersonID,
					dataIndex: "CTPersonID"
				},
				{
					fieldLabel: "出生日期",
					xtype: "datefield",
					name: "Birthday",
					format: 'Y年m月d日',
					value: new Date(rawData.CTBirthday * 1000),
					dataIndex: "CTBirthday"
				},
				{
					fieldLabel: "手机号码",
					name: "Mobile",
					allowBlank: true,
					value: rawData.CTMobile,
					dataIndex: "CTMobile"
				},
				{
					fieldLabel: "座机号码",
					name: "Phone",
					value: rawData.CTPhone,
					dataIndex: "CTPhone"
				},
				{
					fieldLabel: "QQ/MSN",
					name: "IM",
					value: rawData.CTIM,
					dataIndex: "CTIM"
				},
				{
					fieldLabel: "地址",
					name: "Address",
					value: rawData.CTAddress,
					dataIndex: "CTAddress"
				},
				{
					fieldLabel: "职业",
					name: "Job",
					value: rawData.CTJob,
					dataIndex: "CTJob"
				}
			],
			buttons: [{
				text: "提交修改",
				handler: function(direction, e){
					var me = this, form = me.up("form").getForm(), result = form.getValues();
					if (result["Name"] != "" && result["Mobile"] != ""){
						if (result["Birthday"] == "" || result["Birthday"] == "undefined" || !result["Birthday"]){
							result["Birthday"] = Beet.constants.GRANDMADATE;
						}else{
							var now = new Date(), timezoneOffset = now.getTimezoneOffset() * 60;
							result["Birthday"] = ((+Ext.Date.parse(result["Birthday"], "Y年m月d日")) / 1000) - timezoneOffset;
						}

						var needSubmitData = Ext.JSON.encode(result);
						customerServer.UpdateCustomer(CTGUID, needSubmitData, {
							success: function(){
								Ext.MessageBox.show({
									title: "更新成功",
									msg: "更新 " + CTName + " 用户资料成功!",
									buttons: Ext.MessageBox.OK,
									fn: function(btn){
										that.storeProxy.loadPage(that.storeProxy.currentPage);
										win.close()
									}
								});	
							},
							failure: function(){

							}
						});
					}
				}
			}]
		});

		var _basic = settingTabPanel.add({
				title : "基础信息",
				layout: "fit",
				border: 0,
				items: [
					basicform
				]
			});
		settingTabPanel.setActiveTab(_basic);

		
		win = Ext.widget("window", {
			title: CTName + " 的资料信息",
			width: 400,
			height: 500,
			minHeight: 400,
			layout: "fit",
			resizable: true,
			shadow: true,
			modal: true,
			maximizable: true,
			items: settingTabPanel
		})

		win.show();
	},
	deleteCustomer: function(){
		var that = this, item;
		item = Ext.create("Ext.Action", {
			text: "删除",
			handler: function(widget, e){
				var parentMenu = widget.parentMenu, rawData = parentMenu.rawData, CTGUID = rawData.CTGUID, CTName = rawData.CTName,
					customerServer = Beet.constants.customerServer;
				if (CTGUID){
					Ext.MessageBox.show({
						title: "删除用户",
						msg: "是否要删除 " + CTName + " ?",
						buttons: Ext.MessageBox.YESNO,
						fn: function(btn){
							if (btn == "yes"){
								customerServer.DeleteCustomer(CTGUID, {
									success: function(){
										Ext.MessageBox.show({
											title: "删除成功",
											msg: "删除用户: " + CTName + " 成功",
											buttons: Ext.MessageBox.OK,
											fn: function(){
												that.storeProxy.loadPage(that.storeProxy.currentPage);
											}
										})
									},
									failure: function(error){
										Ext.Error.railse("删除用户失败");
									}
								})
							}
						}
					});
				}else{
					Ext.Error.railse("删除用户失败")
				}
			}
		});
		return item
	}
})


