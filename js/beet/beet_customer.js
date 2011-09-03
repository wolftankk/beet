//register menu
registerBeetAppsMenu("customer", 
{
	title: "客户管理",
	items: [
		{
			xtype: "container",
			layout: "hbox",
			frame: true,
			defaults: {
				height: 80,
				width: 200
			},
			defaultType: "buttongroup",
			items: [
				{
					xtype: 'buttongroup',
					title: '会员会籍',
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
									});
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						},
						{
							xtype: "button",
							text: "高级搜索",
							id: "customer_searchBtn",
							tooltip: "高级搜索",
							handler: function(){
								var win = Ext.create("Beet.apps.CustomerAdvanceSearch", {});
								Beet.cache.AdvanceSearchWin = win;
								win.show();
							}
						}
					]
				},
				{
					xtype: "buttongroup",
					title: "客户联系",
					layout: "anchor",
					defaults: {
						scale: "large",
						rowspan: 3
					},
					items: [ 
						{
							xtype: "button",
							text: "发送短信",
							id: "customer_sendmsg",
							tooltip: "点击打开发送短信界面, 向客户发送短信",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["sendMessages"];
								if (!item){
									Beet.workspace.addPanel("sendMessages", "发送短信", {
										items: [
											Ext.create("Beet.apps.Viewport.SendMessages")
										]
									});
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						}
					]
				},
				{
					title: "活动管理",
					layout: "anchor",
					width: '40%',
					defaults: {
						scale: 'large',
						rowspan: 3
					},
					items: [
						{
							xtype: "button",
							text: "新增活动",
							id: "customer_activity",
							tooltip: "点击添加活动",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["vipActivity"];
								if (!item){
									Beet.workspace.addPanel("vipActivity", "新增活动", {
										items: [
											Ext.create("Beet.apps.Viewport.VIPActivity")
										]
									});
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						},
						{
							xtype: "button",
							text: "活动列表",
							tooltip: "查看,编辑已有的活动",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["activitylist"];
								if (!item){

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
});

Ext.define("Beet.apps.Viewport.AddUser", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: "100%",
	autoScroll: true,
	autoHeight: true,
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
	afterRender: function(){
		var me = this;
		me.callParent();

		//update storeid
		me.updateSelectStoreField();
	},
	updateSelectStoreField: function(){
		var me = this;
		var s = me.baseInfoPanel.down("[name=storeid]");
		if (Beet.cache.Operator.store && Beet.cache.Operator.store.length > 0){
			if (Ext.Array.indexOf(Beet.cache.Operator.store, Beet.constants.ACT_INSERT_IID) == -1){
				s.hide();
			}else{
				s.show();
			}
		}
	},
	getBaseInfoPanelConfig: function(){
		var that = this, config;
		config = {
			frame: true,
			bodyPadding: 10,
			layout: "anchor",
			height: "100%",
			autoScroll: true,
			autoHeight: true,
			fieldDefaults: {
				msgTarget: 'side',
				labelAlign: "left",
				labelWidth: 75
			},
			items: [
				{
					xtype: "container",
					autoScroll: true,
					autoHeight: true,
					border: false,
					items: [
						{
							layout: 'column',
							border: false,
							bodyStyle: 'background-color:#dfe8f5;',
							defaults: {
								bodyStyle: 'background-color:#dfe8f5;'
							},
							frame: true,
							items: [
								{
									columnWidth: .3,
									border: false,
									layout: 'anchor',
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: 'side',
										labelAlign: "left",
										labelWidth: 75
									},
									items: [
										{
											fieldLabel: "会员卡号",
											name: "cardno",
											allowBlank: false
										},
										{
											fieldLabel: "会员姓名",
											name: "name",
											allowBlank: false
										},
										{
											fieldLabel: "会员昵称",
											name: "nike"
										},
										{
											fieldLabel: "会员性别",
											name: "sex",
											xtype: "combobox",
											store: Beet.constants.sexList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr"
										},
										{
											fieldLabel: "婚否",
											name: "marry",
											xtype: "combobox",
											store: Beet.constants.MarryList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
										},
										{
											fieldLabel: "籍贯",
											name: "province",
										},
										{
											fieldLabel: "学历",
											name: "education",
											xtype: "combobox",
											store: Beet.constants.EducationList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
										},
										{
											fieldLabel: "入会方式",
											name: "enjoymode",
											//下拉
										},
										{
											fieldLabel: "资讯更新方式",
											name: "updatemode",
											xtype: "combobox",
											store: Beet.constants.NewUpdateModes,
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
										},
									]
								},
								{
									columnWidth: .3,
									border: false,
									layout: 'anchor',
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: 'side',
										labelAlign: "left",
										labelWidth: 75
									},
									items: [
										{
											fieldLabel: "身份证",
											name: "personid"
										},
										{
											xtype: "combobox",
											fieldLabel: "出生月份",
											store: Beet.constants.monthesList,
											name: "month",
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
											validator: function(value){
												if (value > 12){
													return "输入的月份值太大";
												}else if (value < 1){
													return "输入的月份值太小";
												}
												return true;
											},
											allowBlank: false
										},
										{
											xtype: "combobox",
											fieldLabel: "出生日期",
											store: Beet.constants.daysList,
											name: "day",
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
											validator: function(value){
												if (value > 31){
													return "输入的日期太大";
												}else if (value < 1){
													return "输入的日期太小";
												}
												return true;
											},
											allowBlank: false
										},
										{
											fieldLabel: "手机号码",
											name: "mobile",
											validator: function(value){
												var check = new RegExp(/\d+/g);
												if (value.length == 11 && check.test(value)){
													return true;
												}
												return "手机号码输入有误";
											},
											allowBlank: false
										},
										{
											fieldLabel: "座机号码",
											name: "phone"
										},
										{
											fieldLabel: "电子邮件",
											name: "email"
										},
										{
											fieldLabel: "QQ/MSN",
											name: "im"
										},
										{
											fieldLabel: "地址",
											name: "address",
											allowBlank: false
										},
										{
											fieldLabel: "职业",
											name: "job"
										}
										//TODO: 专属顾问选择列表
									]
								},
								{
									columnWidth: .4,
									border: false,
									layout: 'anchor',
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: 'side',
										labelAlign: "left",
										labelWidth: 75
									},
									items: [
										{	
											fieldLabel: "所属分店",
											name: "storeid",
											xtype: "combobox",
											editable: false,
											store: Beet.cache.branchesList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
											allowBlank: true,
											emptyText: "若不选则由系统智能选择",
											listeners: {
												change: function(field, newvalue){
													if (newvalue == -1){
														field.clearValue();
													}
												}
											}
										},
										{
											fieldLabel: "备注",
											name: "descript",
											xtype: "textarea",
											labelAlign: "top",
											enforceMaxLength: true,
											maxLength: 200,
											width: 400,
											height: 200
										}
									]
								},
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
								Texts.push({ID: id, Text: r});
							}else{
								if (Ext.isArray(r)){
									for (var _c in r){
										Items.push(r[_c]);
									}	
								}else{
									Items.push(r);
								}
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
		"CTGUID",
		"CTID",
		"CTCardNo",
		"CTName",
		"CTNickName",
		"CTSexName",
		"CTMarryName",
		"CTProvince",
		"CTEducationName",
		"CTEMail",
		"CTEnjoyMode",
		"CTUpdateModeName",
		"CTBirthdayMonth",
		"CTBirthdayDay",
		"CTMobile",
		"CTPhone",
		"CTJob",
		"CTIM",
		"CTAddress",
		"CTDescript",
		"CTStoreName"
	]
});

Ext.define("Beet.apps.Viewport.CustomerList.Store", {
	extend: "Ext.data.Store",
	model: Beet.apps.Viewport.CustomerList.Model,
	autoLoad: true,
	pageSize: Beet.constants.PageSize,
	load: function(options){
		var me = this;
		options = options || {};
		if (Ext.isFunction(options)) {
            options = {
                callback: options
            };
        }

        Ext.applyIf(options, {
            groupers: me.groupers.items,
            page: me.currentPage,
            start: (me.currentPage - 1) * me.pageSize,
            limit: me.pageSize,
            addRecords: false
        });      
		me.proxy.b_params["start"] = options["start"];
		me.proxy.b_params["limit"] = options["limit"]

        return me.callParent([options]);
	},
	proxy: {
		type: "b_proxy",
		b_method: Beet.constants.customerServer.GetCustomerPageData,
		startParam: "start",
		limitParam: "limit",
		b_params: {
			"filter": ""
		},
		b_scope: Beet.constants.customerServer,
		reader: {
			type: "json",
			root: "Data",
			totalProperty: "TotalCount"
		}
	}
});

Ext.define("Beet.apps.Viewport.CustomerList", {
	extend: "Ext.panel.Panel",
	layout: "fit",
	width: "100%",
	height: "100%",
	bodyBorder: false,
	autoHeight: true,
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
		that.createCustomerGrid();

		that.items = [
			that.grid	
		];
		
		that.callParent(arguments);
	},
	afterRender: function(){
		var that = this;
		that.callParent(arguments);
	},
	createCustomerGrid: function(){
		var that = this, grid = that.grid, store = that.storeProxy, actions, __columns = [], columnsData = Beet.cache["customerColumns"];
		
		var _actions = {
			xtype: 'actioncolumn',
			width: 50,
			items: [
			]
		}
		if (Beet.cache.Operator.customer){
			for (var _s in Beet.cache.Operator.customer){
				var p  = Beet.cache.Operator.customer[_s];
				if (p == Beet.constants.ACT_UPDATE_IID){
					_actions.items.push(
						"-","-","-",{
							icon: './resources/themes/images/fam/user_edit.png',
							tooltip: "编辑用户",
							id: "customer_grid_edit",
							handler:function(grid, rowIndex, colIndex){
								var d = that.storeProxy.getAt(rowIndex)
								that.editCustomerFn(d);
							}
						},"-","-"
					)
				}else{
					if (p == Beet.constants.ACT_DELETE_IID){
						_actions.items.push("-",{
							icon: "./resources/themes/images/fam/delete.gif",
							tooltip: "删除用户",
							id: "customer_grid_delete",
							handler: function(grid, rowIndex, colIndex){
								var d = that.storeProxy.getAt(rowIndex)
								that.deleteCustomerFn(d);
							}
						}, "-","-","-");
					}
				}
			}
		}
		__columns.push(_actions);
		
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

		that.grid = Ext.create("Beet.plugins.LiveSearch", {
			store: store,
			lookMask: true,
			frame: true,
			collapsible: false,	
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			border: 0,
			columnLines: true,
			viewConfig: {
				trackOver: false,
				stripeRows: true
			},
			columns: __columns,
			plugins: [
				/*
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
				}*/
			],
			bbar: Ext.create('Ext.PagingToolbar', {
				store: this.storeProxy,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			})
		})
	},
	editCustomerFn: function(parentMenu){
		var that = this, rawData = parentMenu.rawData || parentMenu.raw, CTGUID = rawData.CTGUID, CTName = rawData.CTName;
		if (CTGUID){
			Ext.MessageBox.show({
				title: "编辑用户",
				msg: "是否要修改 " + CTName + " 的用户资料",
				buttons: Ext.MessageBox.YESNO,
				fn : function(btn){
					if (btn == "yes"){
						var win = Ext.create("Beet.plugins.ViewCustomerInfo", {
							editable: true,
							storeProxy: that.storeProxy,
							rawData: rawData	
						});
						win.show();
					}
				}
			})	
		}
	},
	editCustomer: function(){
		var that = this, item;
		item = Ext.create("Ext.Action", {
			text: "编辑",
			handler: function(widget, e){
				that.editCustomerFn(widget.parentMenu)
			}
		});

		return item
	},
	deleteCustomerFn: function(parentMenu){
		var that = this, rawData = parentMenu.rawData || parentMenu.raw, CTGUID = rawData.CTGUID, CTName = rawData.CTName, customerServer = Beet.constants.customerServer;
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
								Ext.Error.raise("删除用户失败");
							}
						})
					}
				}
			});
		}else{
			Ext.Error.raise("删除用户失败");
		}
	},
	deleteCustomer: function(){
		var that = this, item;
		item = Ext.create("Ext.Action", {
			text: "删除",
			handler: function(widget, e){
				var parentMenu = widget.parentMenu;
				that.deleteCustomerFn(parentMenu);
			}
		});
		return item
	}
});


Ext.define("Beet.apps.Viewport.SendMessages", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: "100%",
	defaults:{
		border: 0
	},
	border: 0,
	suspendLayout: true,
	initComponent: function(){
		var me = this;
		me.items = [
			me.createMainWindow()
		]
		me.callParent(arguments);
	},
	createMainWindow: function(){
		var me = this, msgBox = me.msgBox;
		msgBox = Ext.create("Ext.form.Panel", {
			frame: true,
			bodyPadding: 10,
			layout: "anchor",
			height: "100%",
			autoHeight: true,
			autoScroll: true,
			fieldDefaults: {
				msgTarget: "side",
				allowBlank: false,
				labelAlign: "left",
				labelWidth: 75
			},
			defaultType: "textfield",
			items: [
				{
					fieldLabel: "手机号码",
					name: "mobile",
					id: "mobileNumberFrame"
				},
				{
					xtype: "button",
					name: "select",
					text: "+",
					handler: function(){
						//get friend list
						var win;
						win = Ext.create("Beet.plugins.selectCustomerWindow", {
							_callback: Ext.bind(me.processSelectedData, me),
							_selectedData: me.selectedData
						});
						win.show();
					}
				},
				{
					fieldLabel: "短信内容",
					xtype: "textarea",
					name: "message",
					width: 400,
					height: 100
				},
				{
					xtype: "button",
					name: "send",
					text: "发送",
					handler: function(direction, e){
						var that = this, form = that.up("form").getForm(), result = form.getValues(),needSubmitData, customerServer = Beet.constants.customerServer;
						if (form.isValid()){
							needSubmitData = Ext.JSON.encode(result);
							Ext.MessageBox.show({
								title: "发送短消息",
								buttons: Ext.MessageBox.YESNO,
								msg: result["message"],
								fn: function(btn){
									if (btn == "yes"){
										if (me.mobileNumberList.length > 0){
											for (var c = 0; c < me.mobileNumberList.length; ++c){
												var m = me.mobileNumberList[c];
												result["mobile"] = m;
												needSubmitData = Ext.JSON.encode(result);
												customerServer.SendSMS(needSubmitData, {
													success: function(data){
														if (data.indexOf("-") == -1){
															Ext.Error.raise("发送失败, 返回值为: " + data);
														}
														console.log(data);
													},
													failure: function(error){
														Ext.Error.raise(error);
													}
												});
											}
										}else{
											customerServer.SendSMS(needSubmitData, {
												success: function(data){
													if (data.indexOf("-") == -1){
														Ext.Error.raise("发送失败, 返回值为: " + data);
													}
													console.log(data);
												},
												failure: function(error){
													Ext.Error.raise(error);
												}
											})
										}
									}
								}
							});
						}
					}
				}
			]
		});
			
		me.msgBox = msgBox;
		return msgBox
	},
	processSelectedData: function(data){
		var me = this, mobileNameList = [], mobileNumberList = [];
		me.selectedData = data;

		for (var c = 0; c < data.length; ++c){
			var customer = data[c], customerData = customer["data"];
			if (customerData["CTMobile"] && customerData["CTMobile"].length == 11){
				var mobileNumber = customerData["CTMobile"], mobileName = customerData["CTName"];
				mobileNameList.push(mobileName);
				mobileNumberList.push(mobileNumber);
			}
		}
		me.mobileNumberList = mobileNumberList;
		var typeFrame = Ext.getCmp("mobileNumberFrame");
		typeFrame.setValue(mobileNameList.join(", "));
	}
});


//新增活动
Ext.define("Beet.apps.Viewport.VIPActivity", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: "100%",
	autoHeight: true,
	defaults:{
		border: 0
	},
	border: 0,
	suspendLayout: true,
	initComponent: function(){
		var me = this;

		me.items = [
			me.createMainPanel()
		]

		me.callParent(arguments);
	},
	createMainPanel: function(){
		var me = this, customerServer = Beet.constants.customerServer, panel;

		me.panel = panel = Ext.create("Ext.form.Panel", {
			frame: true,
			bodyPadding: 10,
			height: "100%",
			autoHeight: true,
			autoScroll: true,
			defaultType: "textfield",
			fieldDefaults: {
				msgTarget: "side",
				allowBlank: false,
				labelAlign: "left",
				labelWidth: 75,
				width: 300
			},
			buttons: [
				{
					text: "提交",
					scale: "large",
					handler: function(widget, btn){
						var form = widget.up("form"), result = form.getValues();
						var date = result["date"], t = result["time"], ts = (+(new Date(date + " " + t)))/1000;
						var selectedData = [], customerServer = Beet.constants.customerServer;
						if (me.selectedData){
							for (var c in me.selectedData){
								selectedData.push(c);	
							}
						}
						var needSubmitData = {
							name: result["name"],
							description: result["description"],
							datetime: ts,
							customers: selectedData
						}

						customerServer.AddActivity(Ext.JSON.encode(needSubmitData), {
							success: function(data){
								if (data > 0){
									Ext.MessageBox.show({
										title: "增加活动成功",
										msg: "增加活动: " + result["name"] + " 成功",
										buttons: Ext.MessageBox.OK,
										fn: function(){
											form.reset();
										}
									})
								}
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						})
					}
				}
			],
			items: [
				{
					fieldLabel: "活动名称",
					name: "name"
				},
				{
					fieldLabel: "举办日期",
					name: "date",
					xtype: "datefield",
					format: "Y/m/d",
					value: new Date(),
					minValue: new Date()
				},
				{
					fieldLabel: "举办时间",
					xtype: "timefield",
					format: "H:i",
					name: "time"
				},
				{
					fieldLabel: "活动描述",
					xtype: "textarea",
					height: 100,
					allowBlank: true,
					name: "description"
				},
				{
					text: "增加参加人员",
					xtype: "button",
					handler: function(width, btn){
						var win = me.selectCustomerWindow = Ext.create("Beet.plugins.selectCustomerWindow", {
							_callback: function(value){
								if (me.customerList){
									me.panel.remove(me.customerList, true);
									me.panel.doLayout();
								}
								if (value.length > 0){
									me.updateCustomerList(value);
								}
							}
							//_selectedData: me.selectedData
						});
						win.show();	
					}
				}
				/*
				{
					fieldLabel: "参加人员"
				},
				{
					fieldLabel: "举办地点"
				},
				{
					fieldLabel: "活动负责人"
				}*/
			]
		});

		return panel
	},
	preprocessSelectedData: function(data){
		var newData = {};
		
		if (data == undefined || (Ext.isArray(data) && data.length == 0)){
			return newData;
		}

		for (var c = 0; c < data.length; ++c){
			var item = data[c], d = item["data"];
			newData[d["CTGUID"]] = d;
		}

		return newData;
	},
	updateCustomerList: function(value){
		var me = this, nameList = [], store;

		//处理数据层
		value = me.preprocessSelectedData(value);
		if (me.selectedData == undefined || me.selectedData.length == 0){
			me.selectedData = [];
			me.selectedData = value;
		}else{
			if (value && Ext.isObject(value)){
				for (var k in value){
					if (me.selectedData[k] == undefined){
						me.selectedData[k] = value[k];	
					}
				}
			}
		}

		//创建store
		value = me.selectedData;
		for (var c in value){
			var item = value[c], guid = item["CTGUID"], name = item["CTName"];
			nameList.push([name, item["CTMobile"], guid]);
		}
		store = Ext.create("Ext.data.ArrayStore", {
			fields: [
				"name",
				"mobile",
				"guid"
			],
			data: nameList
		});

		//创建actions
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
				"-", "-",
				{
					icon: "./resources/themes/images/fam/delete.gif",
					tooltip: "删除用户",
					handler: function(grid, rowIndex, colIndex){
						var d = store.getAt(rowIndex), guid = d.get("guid");

						delete me.selectedData[guid];

						if (me.customerList){
							me.panel.remove(me.customerList, true);
							me.panel.doLayout();
						}
						me.updateCustomerList();
					}
				}
			]
		}

		//grid list
		var ns = me.customerList = Ext.create("Ext.grid.Panel", {
			store: store,
			minHeight: 50,
			maxHeight: 300,
			width: 230,
			autoHeight: true,
			autoScroll: true,
			columnLines: true,
			hideHeaders: true,
			columns:[
				_actions,
				{
					text: "Name",
					flex: 1,
					dataIndex: "name" 
				},
				{
					flex: 1,
					dataIndex: "mobile"
				}
			]	
		});
	
		me.panel.add(ns);
		me.doLayout();
	}
});
