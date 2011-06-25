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
						width: '100%',
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
					width: '100%'
				},
				items: [
					{
						title: '客户管理',
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
							var inputmode = _data["item"][0]["inputmode"], isSame = true;
							for (var _p in _data["item"]){
								if (_data["item"][_p]["inputmode"] == inputmode){
									isSame = true;
								}else{
									isSame = false;
								}
							}
							item["fieldLabel"] = _data["label"];
							item["pid"] = _data["pid"];
							item["_id"] = _data["id"];
							item["collapsible"] = true;
							if (isSame && inputmode != 0){
								item["xtype"] = Beet.constants.CTInputMode[inputmode];
							}else{
								_data["_xtype"] = "fieldset";
								item["xtype"] = "fieldset";
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
							item["collapsible"] = true;
							item["xtype"] = "fieldset";
						}
					}else if(_data["category"].length > 0 || _data["pid"] == -1){
						//need reset
						item = {};
						item["fieldLabel"] = _data["label"];
						item["collapsible"] = true;
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
						}else{
							cache.push(item);
							continue;
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
							name: "text_type_" + _data["id"],
							pid: _data["pid"],
							_id: _data["id"],
						}
					}else{
						//radio checkbox
						item = {
							inputValue : _data["id"],
							pid: _data["pid"],
							boxLabel: _data["label"],
							name: "category_" + _data["pid"]
						}
						//主层父类pid
						if (target["pid"] == -1 || (target["_xtype"] && target["_xtype"] == "fieldset")){
							item["xtype"] = inputmode == 1 ? "radio" : "checkbox";
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


