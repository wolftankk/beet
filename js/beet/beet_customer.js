//register menu
Ext.namespace("Beet.apps.customers")
registerMenu("customers", "customerAdmin", 
	{
		xtype: 'buttongroup',
		title: '会员管理',
		layout: "anchor",
		frame: true,
		width: 400,
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
					var item = Beet.cache.menus["customers.AddCustomer"];
					if (!item){
						Beet.apps.Viewport.getCustomerTypes(function(){
							Beet.workspace.addPanel("customers.AddCustomer", "添加会员", {
								items: [
									Ext.create("Beet.apps.customers.AddCustomer")
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
					var item = Beet.cache.menus["customers.CustomerList"];
					if (!item){
						Beet.workspace.addPanel("customers.CustomerList", "编辑会员", {
							items: [
								Ext.create("Beet.apps.customers.CustomerList")
							]	
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
					var win = Ext.create("Beet.apps.customers.AdvanceSearch", {});
					Beet.cache.AdvanceSearchWin = win;
					win.show();
				}
			},
			{
				xtype: "button",
				text: "会员卡编辑",
				handler: function(){
					var item = Beet.apps.Menu.Tabs["addCustomerCard"]
					if (!item){
						Beet.workspace.addPanel("addCustomerCard", "会员卡编辑", {
							items: [
								Ext.create("Beet.apps.AddCustomerCard")
							]
						})
					}else{
						Beet.workspace.workspace.setActiveTab(item);
					}
				}
			},
			{
				xtype: "button",
				text: "下单",
				handler: function(){
					var item = Beet.apps.Menu.Tabs["createOrder"];
					if (!item){
						Beet.workspace.addPanel("createOrder", "下单", {
							items: [
								Ext.create("Beet.apps.CreateOrder")
							]	
						})
					}else{
						Beet.workspace.workspace.setActiveTab(item);
					}
				}
			},
			{
				xtype: "button",
				text: "结算",
				handler: function(){
					var item = Beet.apps.Menu.Tabs["endConsumer"];
					if (!item){
						Beet.workspace.addPanel("endConsumer", "结算", {
							items: [
								Ext.create("Beet.apps.EndConsumer")
							]	
						})
					}else{
						Beet.workspace.workspace.setActiveTab(item);
					}
				}
			}
		]
	}
)
/*
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
						},
						{
							xtype: "button",
							text: "历史查询",
							id: "customer_smshistory",
							tooltip: "点击查询短信发送历史记录",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["smsHistory"];
								if (!item){
									Beet.workspace.addPanel("smsHistory", "短信历史记录", {
										items: [
											Ext.create("Beet.apps.Viewport.SMSHistory")
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
								var item = Beet.apps.Menu.Tabs["activityList"];
								if (!item){
									Beet.workspace.addPanel("activityList", "活动列表", {
										items: [
											Ext.create("Beet.apps.Viewport.ActivityList")
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
});
*/

function time(){
	return +(new Date());
}

Ext.define("Beet.apps.customers.AddCustomer", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
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

		that.customerTypes = Beet.cache.customerTypes;
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
									items: that.customerTypes
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
			result = form.getValues(), needSubmitData, customerTypes = {}, customerServer = Beet.constants.customerServer;

		if (result["Name"] != "" && result["Mobile"] != ""){
			//取得已勾选的服务项目
			customerTypes = result["TypeName"];
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
									customerTypes: customerTypes	
								}
								Beet.cache.currentUid = uid;
								if (customerTypes && customerTypes.length > 0){
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
		var customerTypes = userInfo["customerTypes"], title, firstTab;
		
		//如果只有一个serviceItem为string	
		if (typeof customerTypes == "string"){
			var _s = customerTypes;
			customerTypes = [_s];
			delete _s;
		}
		
		for (var s in customerTypes){
			var service = customerTypes[s], title = Beet.constants.CTServiceType[service], data = Beet.cache.advanceProfile[service], items = [];
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

Ext.define("Beet.apps.customers.CustomerList", {
	extend: "Ext.panel.Panel",
	layout: "fit",
	width: "100%",
	height: "100%",
	bodyBorder: false,
	autoHeight: true,
	autoScroll: true,
	minHeight: 400,
	minWidth: 800,
	frame: true,
	defaults: {
		border: 0
	},
	b_filter: "",
	initComponent: function(){
		var that = this;
		Ext.apply(this, {});
		that.callParent(arguments);

		Beet.constants.customerServer.GetCustomerPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data);
				that.buildStoreAndModel(data["MetaData"]);
			},
			failure: function(error){
				Ext.Error.raise(error)
			}
		})
	},
	buildStoreAndModel: function(metaData){
		var me = this, customerServer = Beet.constants.customerServer, fields = [];
		me.columns = [];

		for (var c = 0; c < metaData.length; ++c){
			var d = metaData[c];
			fields.push(d["FieldName"]);
			if (!d["FieldHidden"]) {
				me.columns.push({
					flex: 1,
					header: d["FieldLabel"],
					dataIndex: d["FieldName"]	
				})
			}
		};

		if (!Beet.apps.Viewport.CustomerListModel){
			Ext.define("Beet.apps.Viewport.CustomerListModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Ext.isDefined(Beet.apps.Viewport.CustomerListStore)){
			Ext.define("Beet.apps.Viewport.CustomerListStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.Viewport.CustomerListModel,
				autoLoad: true,
				pageSize: Beet.constants.PageSize,
				b_filter: "",
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
				}
			});
		}

		me.storeProxy = Ext.create("Beet.apps.Viewport.CustomerListStore");
		me.storeProxy.setProxy(me.updateProxy());
		me.createCustomerGrid();
	},
	updateProxy: function(){
		var me = this;
		return {
			 type: "b_proxy",
			 b_method: Beet.constants.customerServer.GetCustomerPageData,
			 startParam: "start",
			 limitParam: "limit",
			 b_params: {
				 "filter": me.b_filter
			 },
			 b_scope: Beet.constants.customerServer,
			 reader: {
				 type: "json",
				 root: "Data",
				 totalProperty: "TotalCount"
			 }
		}
	},
	createCustomerGrid: function(){
		var that = this, grid = that.grid, store = that.storeProxy, actions;
		var customerServer = Beet.constants.customerServer;
		
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

		that.columns.splice(0, 0, _actions);

		that.grid = Ext.create("Beet.plugins.LiveSearch", {
			store: store,
			lookMask: true,
			frame: true,
			collapsible: false,	
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			height: "100%",
			width : "100%",
			border: 0,
			columnLines: true,
			viewConfig: {
				trackOver: false,
				stripeRows: true
			},
			columns: that.columns,
			tbar: [
				"-",
				{
					xtype: "button",
					text: "高级搜索",
					handler: function(){
						customerServer.GetCustomerPageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										that.b_filter = where;
										that.storeProxy.setProxy(that.updateProxy());
										that.storeProxy.loadPage(1);
									}
								});
								win.show();
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						});
					}
				}
			],
			bbar: Ext.create('Ext.PagingToolbar', {
				store: this.storeProxy,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1}, 总共{2}条数据',
				emptyMsg: "没有数据"
			})
		})

		that.add(that.grid);
		that.doLayout();
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
							maximized: true,
							storeProxy: that.storeProxy,
							rawData: rawData	
						});
						win.doLayout();
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
