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
							text: "活动列表"
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
										},
										//TODO: 专属顾问选择列表
									]
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
		"CTID",
		"CTCardNo",
		"CTName",
		"CTBirthdayMonth",
		"CTBirthdayDay",
		"CTMobile",
		"CTPhone",
		"CTJob",
		"CTIM",
		"CTAddress",
		"CTDescript"
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

		me.callParent(arguments)
	}
});


Ext.define("Beet.plugins.selectCustomerWindow", {
	extend: "Ext.window.Window",
	title: "选择客户",
	id: "selectCustomerWindow",
	width: 650,
	height: 550,
	minHeight: 450,
	autoDestroy: true,
	autoHeight: true,
	autoScroll: true,
	layout: "fit",
	resizable: true,
	border: false,
	modal: false,
	maximizable: true,
	border: 0,
	bodyBorder: false,
	initComponent: function(config){
		var me = this, customerServer = Beet.constants.customerServer;
		me.items = [];
		me.createCustomerInfo();
		if (me.customerList == undefined){
			customerServer.GetCustomerToJSON('', false, {
				success: function(data){
					data = me.createSelectorForm(Ext.JSON.decode(data));
				},
				failure: function(error){
					Ext.error.raise(error);
				}
			});
		}
		
		me.callParent();
	},
	createCustomerInfo: function(){
		var me = this;
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push(
			"-","-","-",{
				icon: './resources/themes/images/fam/user_edit.png',
				tooltip: "查看用户详情",
				id: "",
				handler:function(grid, rowIndex, colIndex){
					var win = Ext.create("Beet.plugins.ViewCustomerInfo", {
						storeProxy: me.storeProxy,
						_rowIndex: rowIndex,
						_colIndex: colIndex	
					});
					win.show();
				}
			}
		);

		me.viewCustomerInfo = _actions;
	},
	createSelectorForm: function(data){
		var form, me = this;
		var meta = data["MetaData"], data = data["Data"];
		var sm = Ext.create("Ext.selection.CheckboxModel");
		me.selModel = sm;
		
		if (Beet.plugins.selectCustomerWindow.CustomerListModel == undefined){
			Ext.define("Beet.plugins.selectCustomerWindow.CustomerListModel", {
				extend: "Ext.data.Model",
				fields: [
					"CTGUID",
					"CTCardNo",
					"CTName",
					"CTNikeName",
					"CTMobile"
				]
			});
		}

		me.storeProxy = Ext.create("Ext.data.Store", {
			model: Beet.plugins.selectCustomerWindow.CustomerListModel,
			data: data	
		})

		form = Ext.create("Ext.grid.Panel", {
			store: me.storeProxy,
			selModel: sm,
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
			columns: [
				me.viewCustomerInfo,
				{
					text: "会员卡号",
					flex: 1,
					dataIndex: "CTCardNo"
				},
				{
					text: "会员名",
					flex: 1,
					dataIndex: "CTName"
				},
				{
					text: "会员手机",
					flex: 1,
					dataIndex: "CTMobile"
				}
			],
		});

		me.customerListGrid = form;

		me.add(form)
		me.doLayout();


		if (me._selectedData && me._selectedData.length > 0){
			//select all
		}
	},
	buttons: [
		{
			text: "确定",
			handler: function(){
				var me = this, parent = Ext.getCmp("selectCustomerWindow");
				var selectedData = parent.selModel.getSelection();	
				parent._callback(selectedData);
				parent.close();
			}
		},
		{
			text: "取消",
			handler: function(){
				var me = this, parent = Ext.getCmp("selectCustomerWindow");
				parent.close();
			}
		}
	]
});

Ext.define("Beet.plugins.ViewCustomerInfo", {
	extend: "Ext.window.Window",
	width: 700,
	height: 600,
	minHeight: 550,	
	autoHeight: true,
	autoScroll: true,
	layout: "fit",
	resizable: true,
	border: false,
	modal: true,
	maximizable: true,
	border: 0,
	bodyBorder: false,
	editable: false,
	_rowIndex: null,
	initComponent: function(){
		var me = this, storeProxy = me.storeProxy, customerServer = Beet.constants.customerServer;

		if (me.rawData){
			rawData = me.rawData;
		}else{
			if (me._rowIndex != null){
				var d = storeProxy.getAt(me._rowIndex), rawData = d.data;
			}
		}
		
		//create staff
		me.createTabPanel();
		me.createCustomeBase(rawData);

		me.callParent();
		me.updateCustomerTitle(rawData["CTName"] + " 的会员资料");

		me.add(me.settingTabPanel);
		me.doLayout();

		var _basic = me.settingTabPanel.add({
			title : "基础信息",
			layout: "fit",
			border: 0,
			items: [
				me.customerBaseInfo
			]
		});
		me.settingTabPanel.setActiveTab(_basic);

		var CTGUID = rawData["CTGUID"];
		if (CTGUID){
			customerServer.GetCustomerItemToJson("CTGUID='"+CTGUID+"'", {
				success: function(data){
					data = Ext.JSON.decode(data);
					me.createCustomerAdvanceInfo(rawData, data["Data"]);
				},
				failure: function(error){
					Ext.error.raise(error);
				}
			});
		}
	},
	createCustomerAdvanceInfo: function(rawData, customerData){
		var me = this, customerServer = Beet.constants.customerServer, CTName = rawData["CTName"], CTGUID = rawData["CTGUID"];
		var advanceTab = Ext.create("Ext.tab.Panel", {
			border: false,
			plain: true,
			height: "100%",
			bodyBorder: false,
			defaults: {
				border: 0,
				frame: true,
				autoScroll: true,
				autoHeight: true
			},
			items: []
		});
		
		var advanceformConfig = {
			frame: true,
			border: false,
			defaults: {
				margin: "0 0 10 0"
			},
			plain: true,
			height: "100%",
			fieldDefaults: {
				msgTarget: "side",
				labelAlign: "left",
				labelWidth: 75
			},
			items:[
				advanceTab
			],
		};
		if (me.editable){
			advanceformConfig.buttons = [
				{
					text: "更新",
					handler: function(widget, e){
						var that = this, form = that.up("form").getForm(), result = form.getValues();
						//if (!form.isValid()){}
						var Items = [], Texts = [], needSubmitData;
						for (var k in result){
							var r = result[k];
							if (k.indexOf("text") > -1 && r !== ""){
								var id = k.split("_")[2];
								Texts.push({ID: id, Text: r});
							}else{
								if (r !== ""){
									if (Ext.isArray(r)){
										for (var _c in r){
											Items.push(r[_c]);
										}	
									}else{
										Items.push(r);
									}
								}
							}
						}
						
						needSubmitData = {
							"CustomerID" : CTGUID
						}
						if (Items.length > 0){
							needSubmitData["Items"] = Items;
						}
						if (Texts.length > 0){
							needSubmitData["Texts"] = Texts;
						}
						
						needSubmitData = Ext.JSON.encode(needSubmitData);
						customerServer.UpdateCustomerItem(CTGUID, needSubmitData, {
							success: function(isSuccess){
								if (isSuccess){
									Ext.MessageBox.show({
										title: "更新成功!",
										msg: "更新成功!",
										buttons: Ext.MessageBox.OK,
										handler: function(btn){
											me.close();
										}
									})
								}
							},
							failure: function(error){
								Ext.Error.raise(error)
							}
						})
					}
				}
			]
		}
		me.advancePanel = Ext.create("Ext.form.Panel", advanceformConfig);

		me.settingTabPanel.add({
			title : "高级信息",
			layout: "fit",
			border: 0,
			items: [
				me.advancePanel
			]
		});

		//高级面板选项
		var _replace = function(target, needId, typeText){
			for (var k in target){
				var _data = target[k];
				if (_data["items"] && _data["items"].length > 0){
					_replace(_data["items"], needId, typeText);
				}
				if (_data["inputValue"] == needId){
					_data["checked"] = true;
				}
				if (_data["_id"] == needId && _data["xtype"] == "textfield"){
					_data["value"] = typeText;
				}

				_data["readOnly"] = !me.editable;
			}
		}

		var serviceItems = Beet.constants.CTServiceType;

		//复制一个 不影响原有的
		var advanceProfile = [], _firsttab;
		advanceProfile = Ext.clone(Beet.cache.advanceProfile);
		
		if (customerData.length > 0){
			for (var k in customerData){
				var _data = customerData[k];
				var st = _data["ServiceType"], typeId = _data["CTTypeID"], typeText = _data["TypeText"];
				if (advanceProfile[st] && advanceProfile[st].length > 0){
					_replace(advanceProfile[st], typeId, typeText);
				}
			}
		}

		for (var service in serviceItems){
			var title = serviceItems[service], data = advanceProfile[service], items = [];
			console.log(data);
			if (!data || data.length < 0){continue;}
			var _t = advanceTab.add({
				title : title,
				flex: 1,
				border: 0,
				layout: "anchor",
				height: "100%",
				defaults: {
					margin: "0 0 10 0"
				},
				fieldDefaults: {
					msgTarget : "side",
					labelAlign: "left",
					labelWidth: 75
				},
				items: data
			});

			if (_firsttab == undefined){
				_firsttab = _t;
			}
		}
		advanceTab.setActiveTab(_firsttab);
	},
	updateCustomerTitle: function(title){
		var me = this;
		me.setTitle(title);
	},
	createTabPanel: function(){
		var me = this;
		me.settingTabPanel = Ext.create("Ext.tab.Panel", {
			border: false,
			bodyBorder: false,
			autoHeight: true,
			autoHeight: true,
			plain: true,
			frame: true,
			defaults: {
				border: false,
				frame: true,
				autoHeight: true,
				autoScroll: true
			},
			items: []
		});
	},
	createCustomeBase: function(rawData){
		var me = this, editable = me.editable, customerServer = Beet.constants.customerServer, CTName = rawData["CTName"], CTGUID = rawData["CTGUID"];
		var basicformConfig = {
			frame: true,
			autoHeight: true,
			autoScroll: true,
			border: false,
			bodyBorder: false,
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
					xtype: "container",
					autoScroll: true,
					autoHeight: true,
					border: false,
					frame: true,
					items: [
						{
							layout: 'column',
							border: false,
							bodyStyle: 'background-color:#dfe8f5;',
							defaults: {
								bodyStyle: 'background-color:#dfe8f5;',
								readOnly: !me.editable 
							},
							items: [
								{
									columnWidth: .5,
									border: false,
									layout: 'anchor',
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: 'side',
										labelAlign: "left",
										labelWidth: 75,
									},
									defaults: {
										readOnly: !me.editable 
									},
									items: [
										{
											fieldLabel: "会员卡号",
											name: "cardno",
											value: rawData.CTCardNo,
											dataIndex: "CTCardNo",
											allowBlank: false
										},
										{
											fieldLabel: "会员姓名",
											name: "name",
											allowBlank: false,
											value: rawData.CTName,
											dataIndex: "CTName"
										},
										{
											fieldLabel: "会员昵称",
											name: "nike",
											value: rawData.CTNikeName,
											dataIndex: "CTNikeName"
										},
										{
											fieldLabel: "会员性别",
											name: "sex",
											value: parseInt(rawData.CTSex, 10),
											dataIndex: "CTSex",
											xtype: "combobox",
											store: Beet.constants.sexList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr"
										},
										{
											fieldLabel: "婚否",
											name: "marry",
											value: parseInt(rawData.CTMarry, 10),
											dataIndex: "CTMarry",
											xtype: "combobox",
											store: Beet.constants.MarryList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr"
										},
										{
											fieldLabel: "籍贯",
											name: "province",
											value: rawData.CTProvince,
											dataIndex: "CTProvince"
										},
										{
											fieldLabel: "学历",
											name: "education",
											xtype: "combobox",
											store: Beet.constants.EducationList,
											queryMode: "local",
											displayField: "name",
											valueField: "attr",
											value: parseInt(rawData.CTEducation, 10),
											dataIndex: "CTEducation"
										},
										{
											fieldLabel: "入会方式",
											name: "enjoymode",
											value: rawData.CTEnjoryMode,
											dataIndex: "CTEnjoryMode",
											xtype: "combobox",
											store: Beet.constants.EnjoyModeList,
											queryMode: "local",
											displayField: "attr",
											valueField: "attr"
										},
										{
											fieldLabel: "资讯更新方式",
											name: "updatemode",
											value: parseInt( rawData.CTUpdateMode, 10),
											dataIndex: "CTUpdateMode",
											xtype: "combobox",
											store: Beet.constants.NewUpdateModes,
											queryMode: "local",
											displayField: "name",
											valueField: "attr"
										},
									]
								},
								{
									columnWidth: .5,
									border: false,
									layout: 'anchor',
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: 'side',
										labelAlign: "left",
										labelWidth: 75
									},
									defaults: {
										readOnly: !me.editable 
									},
									items: [
										{
											fieldLabel: "身份证",
											name: "personid",
											value: rawData.CTPersonID,
											dataIndex: "CTPersonID"
										},
										{
											fieldLabel: "出生月份",
											name: "month",
											xtype: "combobox",
											editable: false,
											store: Beet.constants.monthesList,
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
											allowBlank: false,
											value: parseInt(rawData.CTBirthdayMonth, 10)
										},
										{
											xtype: "combobox",
											fieldLabel: "出生日期",
											editable: false,
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
											allowBlank: false,
											value: parseInt(rawData.CTBirthdayDay, 10)
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
											allowBlank: false,
											value: rawData.CTMobile,
											dataIndex: "CTMobile"
										},
										{
											fieldLabel: "座机号码",
											name: "phone",
											value: rawData.CTPhone,
											dataIndex: "CTPhone"
										},
										{
											fieldLabel: "电子邮件",
											name: "email",
											value: rawData.CTEmail,
											dataIndex: "CTEmail"
										},
										{
											fieldLabel: "QQ/MSN",
											name: "im",
											value: rawData.CTIM,
											dataIndex: "CTIM"
										},
										{
											fieldLabel: "地址",
											name: "address",
											allowBlank: false,
											value: rawData.CTAddress,
											dataIndex: "CTAddress"
										},
										{
											fieldLabel: "职业",
											name: "job",
											value: rawData.CTJob,
											dataIndex:"CTJob"
										},
										//TODO: 专属顾问选择列表
									]
								}
							]
						},
						{
							fieldLabel: "备注",
							name: "descript",
							xtype: "textarea",
							labelAlign: "top",
							readOnly: !me.editable,
							enforceMaxLength: true,
							maxLength: 200,
							width: 400,
							height: 200,
							value: rawData.CTDescript,
							dataIndex: "CTDescript"
						},
						{
							xtype: "component",
							width: 5
						}
					]
				},
			]
		};
		if (me.editable){
			basicformConfig.buttons = [{
				text: "提交修改",
				handler: function(direction, e){
					var _b = this, form = _b.up("form").getForm(), result = form.getValues();
					if (result["name"] != "" && result["mobile"] != ""){
						var needSubmitData = Ext.JSON.encode(result);
						customerServer.UpdateCustomer(CTGUID, needSubmitData, {
							success: function(){
								Ext.MessageBox.show({
									title: "更新成功",
									msg: "更新 " + CTName + " 用户基础资料成功!",
									buttons: Ext.MessageBox.OK,
									fn: function(btn){
										if (me.editable){
											me.storeProxy.loadPage(me.storeProxy.currentPage);
											me.close();
										}
									}
								});	
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						});
					}
				}
			}];
		}
		var basicform = Ext.widget("form", basicformConfig);
		me.customerBaseInfo = basicform;
	}
});
