//register menu
registerBeetAppsMenu("customer", 
{
	title: "会员管理",
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
								var item = Beet.apps.Menu.Tabs["addCustomer"];
								if (!item){
									Beet.apps.Viewport.getCustomerTypes(
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
								var customerServer = Beet.constants.customerServer;
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
							text: "高级搜索",
							id: "customer_searchBtn",
							tooltip: "高级搜索",
							handler: function(){
								var win = Ext.create("Beet.apps.CustomerAdvanceSearch", {});
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

Ext.define("Beet.apps.Viewport.AddUser", {
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


/**
 * 构建客户列表
 *
 */
Ext.define("Beet.apps.Viewport.CustomerList", {
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


Ext.define("Beet.apps.Viewport.SendMessages", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: Beet.constants.VIEWPORT_HEIGHT - 5, 
	width: "100%",
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
					xtype: "trigger",
					width: 400,
					name: "mobiles",
					id: "mobileNumberFrame",
					onTriggerClick: function(){
						//这里需要一个高级查询
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
										if (me.mobileNumberList && me.mobileNumberList.length > 0){
											result["mobiles"] = me.mobileNumberList;
											needSubmitData = Ext.JSON.encode(result);
											customerServer.SendSMS(needSubmitData, {
												success: function(data){
													if (data.indexOf("-") > 0){
														Ext.Error.raise("发送失败, 返回值为: " + data);
													}
												},
												failure: function(error){
													Ext.Error.raise(error);
												}
											});
											me.mobileNumberList = {};
										}else{
											customerServer.SendSMS(needSubmitData, {
												success: function(data){
													if (data.indexOf("-") == -1){
														Ext.Error.raise("发送失败, 返回值为: " + data);
													}
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

Ext.define("Beet.apps.Viewport.SMSHistory", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: "100%",
	width: "100%",
	autoHeight: true,
	autoScroll: true,
	border: 0,
	initComponent: function(){
		var me = this;

		
	}
});


//新增活动
Ext.define("Beet.apps.Viewport.VIPActivity", {
	extend: "Ext.panel.Panel",
	layout: "anchor",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
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
					style: {
						left: 0
					},
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
									items:[
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
												});
												win.show();	
											}
										}
									]
								}
							]
						}
					]
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

Ext.define("Beet.apps.Viewport.ActivityList.Model", {
	extend: "Ext.data.Model",
	fields: [
		"AID",
		"AName",
		{name: "ADate", type: "auto", convert: function(v, record){
			var dt = new Date(v*1000);
			return Ext.Date.format(dt, "Y/m/d H:i");
		}},
		"Adescript"
	]
});

Ext.define("Beet.apps.Viewport.ActivityList.Store", {
	extend: "Ext.data.Store",
	model: Beet.apps.Viewport.ActivityList.Model,
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
		b_method: Beet.constants.customerServer.GetActivityData,
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

Ext.define("Beet.apps.Viewport.ActivityList", {
	extend: "Ext.panel.Panel",
	frame: true,
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll: true,
	initComponent: function(){
		var me = this;

		Ext.apply(me, {
			storeProxy: Ext.create("Beet.apps.Viewport.ActivityList.Store")
		});

		me.items = [me.createGridList()]

		me.callParent();
	},
	updateActivity: function(record){
		var aid = record.get("AID"), name = record.get("AName"), me = this, customerServer = Beet.constants.customerServer, win, dt = new Date(record.get("ADate"));

		win = Ext.create("Ext.window.Window", {
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
		});
		win.setTitle("编辑活动: "+name);
	
		var form = Ext.create("Ext.form.Panel", {
			height: "100%",
			autoHeight: true,
			autoScroll: true,
			defaultType: "textfield",
			fieldDefaults: {
				msgTarget: "side",
				allowBlank: false,
				labelAlign: "left",
				labelWidth: 75,
				anchor: "95%",
			},
			bodyPadding: 15,
			items: [
				{
					fieldLabel: "活动名称",
					name: "name",
					value: record.get("AName")
				},
				{
					fieldLabel: "举办日期",
					name: "date",
					xtype: "datefield",
					format: "Y/m/d",
					value: dt
				},
				{
					fieldLabel: "举办时间",
					xtype: "timefield",
					format: "H:i",
					name: "time",
					value: dt
				},
				{
					fieldLabel: "活动描述",
					xtype: "textarea",
					height: 100,
					allowBlank: true,
					name: "description",
					value: record.get("Adescript")
				}
			],
			buttons: [
				{
					text: "提交",
					handler: function(widget, btn){
						var f = widget.up("form"), result = f.getValues(), selected = [];
						for (var c in form.selectedData){
							selected.push(c);
						}
						var needSubmitData = {
							name: result['name'],
							datetime: (+(new Date(result["date"] + " " + result["time"]))/1000),
							description: result["description"],
							customers: selected
						}

						customerServer.UpdateActivity(aid, Ext.JSON.encode(needSubmitData), {
							success: function(data){
								if (data){
									me.storeProxy.loadPage(me.storeProxy.currentPage);
									win.close();
								}else{
									Ext.Error.raise("更新失败");
								}
							},
							failure: function(error){
								Ext.Error.raise(error)
							}
						});
					}
				},
				{
					text: "取消",
					handler: function(){
						win.close();
					}
				}
			]
		});

		customerServer.GetActivityCTData(aid, {
			success: function(data){
				data = Ext.JSON.decode(data);
				var meta = data["MetaData"], data = data["Data"], fields = [], _colunms = [];
				form.selectedData = {};

				for (var c = 0; c < meta.length; c++){
					fields.push(meta[c]["FieldName"]);
					if (!meta[c]["FieldHidden"]){
						_colunms.push(
						{	
							text: meta[c]["FieldLabel"],
							flex: 1,
							dataIndex: meta[c]["FieldName"] 
						});
					}
				}

				for (var c = 0; c < data.length; ++c){
					var item = data[c];
					form.selectedData[item["CTGUID"]] = []
				}

				var store = new Ext.data.Store({
					fields: fields,
					data: data		
				});

				var list = Ext.create("Ext.grid.Panel", {
					maxHeight: 150,
					autoHeight: true,
					autoScroll: true,	
					store: store,
					columnLines: true,
					hideHeaders: false,
					columns: _colunms,
					title: "参与会员",
					tbar: [
						{
							xtype: "button",
							text: "增加会员",
							handler: function(widget, btn){
								var win = list.selectCustomerWindow = Ext.create("Beet.plugins.selectCustomerWindow", {
									_callback: function(value){
										//form.remove(list, true);
										//form.doLayout();
										/*
										if (me.customerList){
											me.panel.remove(me.customerList, true);
											me.panel.doLayout();
										}
										if (value.length > 0){
											me.updateCustomerList(value);
										}
										*/
									}
								});
								win.show();	
							}
						}
					]
				});

				form.add(list);
				form.doLayout();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});


		win.add(form);
		win.doLayout();
		win.show();
	},
	createGridList : function(){
		var me = this, customerServer = Beet.constants.customerServer;

		var _actions = {
			xtype: 'actioncolumn',
			width: 50,
			items: [
				"-", "-",
				{
					icon: "./resources/themes/images/fam/user_edit.png",
					tooltip: "编辑",
					handler: function(grid, rowIndex, colIndex){
						var d = me.storeProxy.getAt(rowIndex);
						me.updateActivity(d);
					}
				}, "-", "-","-","-","-",
				{
					icon: "./resources/themes/images/fam/delete.gif",
					tooltip: "删除",
					handler: function(grid, rowIndex, colIndex){
						var d = me.storeProxy.getAt(rowIndex), aid = d.get("AID"), name = d.get("AName");
						Ext.MessageBox.show({
							title: "删除活动",
							msg: "是否要删除活动: " + name + " ?",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									customerServer.DeleteActivity(aid, {
										success: function(){
											 Ext.MessageBox.show({
												 title: "删除成功",
												 msg: "删除活动: " + name + " 成功",
												 buttons: Ext.MessageBox.OK,
												 fn: function(){
													 me.storeProxy.loadPage(me.storeProxy.currentPage);
												 }
											 })
										},
										failure: function(error){
											Ext.Error.raise("删除活动失败");
										}
									})
								}
							}
						});
					}
				}
			]
		}
		var grid = me.grid = Ext.create("Ext.grid.Panel", {
			height: "100%",
			store: me.storeProxy,
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
			columns: [
				_actions,
				{
					text: "活动名",
					flex: 1,
					dataIndex: "AName"
				},
				{
					text: "活动时间",
					flex: 1,
					dataIndex: "ADate"	
				},
				{
					text: "活动描述",
					flex: 1,
					dataIndex: "Adescript"
				}
			],
			bbar: Ext.create('Ext.PagingToolbar', {
				store: me.storeProxy,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			})
		});

		return grid;
	}
});


Ext.define("Beet.apps.AddCustomerCard", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	autoDestory: true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	b_filter: "",
	initComponent: function(){
		var me = this;
		me.selectedCustomerId = null;
		me.selectedCards = {};

		me.callParent();
		me.createMainPanel();
		me.queue = new Beet_Queue("customerCard");
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		var options = {
			autoScroll: true,
			height: 460,
			cls: "iScroll",
			border: true,
			plain: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5"
		}

		me.cardPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定卡项",
				handler: function(){
					me.selectCard();
				}
			}]	
		}));

		var config = {
			autoHeight: true,
			autoScroll: true,
			cls: "iScroll",
			height: "100%",
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			frame: true,
			plain: true,
			items: [
				{
					layout: {
						type: "hbox",
						align: "stretch"
					},
					height: "100%",
					autoHeight: true,
					autoScroll: true,
					border: false,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						bodyStyle: "background-color: #dfe8f5",
						border: false
					},
					items:[
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							height: "100%",
							flex: 1,
							items: [
								{
									layout: {
										type: "table",
										columns: 1,
										tableAttrs: {
											cellspacing: 10,
											style: {
												width: "100%",
											}
										}
									},
									border: false,
									bodyStyle: "background-color: #dfe8f5",
									defaults: {
										bodyStyle: "background-color: #dfe8f5",
										width: 400
									},
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: "side",
										labelAlign: "top",
										labelWidth: 60
									},
									items: [
										{
											fieldLabel: "会员名",
											xtype: "trigger",
											width: 400,
											name: "customername",
											onTriggerClick: function(){
												//这里需要一个高级查询
												var win = Ext.create("Beet.plugins.selectCustomerWindow", {
													b_selectionMode: "SINGLE",
													_callback: function(r){
														me.onSelectCustomer(r);
														win.hide();
													}
												});
												win.show();
											}
										},
										{
											fieldLabel: "卡号",
											name: "cardno",
											allowBlank: false
										},
										{
											fieldLabel: "会员级别",
											name: "level"
										},
										{
											fieldLabel: "余额",
											allowBlank: false,
											name: "balance"
										},
										{
											fieldLabel: "专属顾问",
											xtype: "trigger",
											width: 400,
											name: "employeename",
											onTriggerClick: function(){
												var win = Ext.create("Ext.window.Window", {
													title: "选择专属顾问",
													width: 750,
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
												});
												win.add(Ext.create("Beet.apps.Viewport.EmployeeList", {
													b_type: "selection",
													b_selectionMode: "SINGLE",
													height: "100%",
													width: "100%",
													b_selectionCallback: function(r){
														me.onSelectEmployee(r);
														win.hide();
													}
												}));
												win.doLayout();
												win.show();
											}
										},
										{
											fieldLabel: "注释",
											allowBlank: true,
											xtype: "textarea",
											name: "descript"
										},
									]
								},
								{
									layout: {
										type: "hbox",
										columns: 2
									},
									height: 50,
									border: false,
									autoHeight: true,
									autoScroll: true,
									border: false,
									bodyStyle: "background-color: #dfe8f5",
									items: [
										{
											xtype: "component",
											width: 100
										},
										{
											xtype: "button",
											scale: "medium",
											text: "开卡",
											name: "activebtn",
											disabled: true,
											handler: function(){
												me.processData(this);
											}
										},
										{
											xtype: "component",
											width: 30
										},
										{
											xtype: "button",
											scale: "medium",
											text: "更新",
											disabled: true,
											name: "updatebtn",
											handler: function(){
												me.processData(this, true);
											}
										},
										{
											xtype: "component",
											width: 100
										},
										{
											xtype: "button",
											scale: "medium",
											text: "销卡",
											style: {
												borderColor: "#ff5252"
											},
											handler: function(){
												Ext.MessageBox.show({
													title: "警告",
													msg: "确定需要销毁当前用户的卡?",
													buttons: Ext.MessageBox.YESNO,
													fn: function(btn){
														if (btn == "yes"){
															cardServer.DeleteCustomerAccount(me.selectedCustomerId, {
																success: function(succ){
																	if (succ){
																		Ext.MessageBox.alert("成功", "销卡成功");
																		var form = me.form.getForm();
																		//reset all
																		me.selectedCustomerId = null
																		me.selectedEmpolyeeId = null;
																		me.selectedCards = {};
																		form.reset();
																		me.down("button[name=updatebtn]").disable();
																		me.down("button[name=activebtn]").disable();
																		me.updateCardPanel();
																	}
																},
																failure: function(error){
																	Ext.Error.raise(error);
																}
															})
														}
													}
												})
											}
										}
									]
								}
							]
						},
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							flex: 2,
							height: 500,
							items: [
								{
									layout: {
										type: "table",
										columns: 3,
										tableAttrs: {
											cellspacing: 10,
											style: {
												width: "100%",
											}
										}
									},
									border: false,
									bodyStyle: "background-color: #dfe8f5",
									defaults: {
										bodyStyle: "background-color: #dfe8f5",
										width: 300
									},
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: "side",
										labelAlign: "top",
										labelWidth: 60
									},
									items:[
										{
											xtype: "component",
											width: 30
										}
									]
								},
								me.cardPanel
							]
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		me.initializeCardPanel();
	},
	onSelectEmployee: function(records){
		var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
		me.selectedEmpolyeeId = null;
		if (records && records.length == 1){
			var record = records[0];
			var em_userid = record.get("EM_UserID"), em_name = record.get("EM_NAME");
			form.setValues({
				employeename: em_name	
			})
			me.selectedEmpolyeeId = em_userid;
		}
	},
	onSelectCustomer: function(records){
		var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
		//reset all
		me.selectedCustomerId = null
		me.selectedEmpolyeeId = null;
		me.selectedCards = {};
		form.reset();
		me.down("button[name=updatebtn]").disable();
		me.down("button[name=activebtn]").disable();
		me.updateCardPanel();
		if (records && records.length == 1){
			var record = records[0];
			var CTGUID = record.get("CTGUID"), name = record.get("CTName");
			form.setValues({
				customername: name
			})
			me.selectedCustomerId = CTGUID;
			
			var customerData;
			me.queue.Add("queryCustomer", "", function(){
				Ext.MessageBox.show({
					msg: "正在查询当前客户数据中...",
					progressText: "查询中...",
					width: 300,
					wait: true,
					waitConfig: {interval: 800},
					closable: false
				});

				cardServer.GetCustomerAccountData(false, "CustomerID='"+CTGUID+"'", {
					success: function(data){
						data = Ext.JSON.decode(data);
						data = data["Data"];
						//console.log(data);
						if (data.length > 0){
							customerData = data[0];
							//restoreForm
							me.restoreFromData(customerData);
							me.down("button[name=updatebtn]").enable();
						}else{
							customerData = null;
							me.down("button[name=activebtn]").enable();
						}
						me.queue.triggle("queryCustomer", "success");
						me.queue.triggle("queryCustomerCard", "success");
					},
					failure: function(error){
						Ext.Error.raise(error)
					}
				})
			});

			me.queue.Add("queryCustomerCard", "queryCustomer", function(){
				if (customerData){
					cardServer.GetCustomerCardData(false, "CustomerID='"+customerData["CustomerID"]+"'", {
						success: function(data){
							data = Ext.JSON.decode(data);
							data = data["Data"];
							var records = []
							for (var c = 0; c < data.length; ++c){
								var d = data[c];
								var cardId = d["CID"];
								if (cardId){
									var record = d;
									record["StartTime"] = new Date(record["StartTime"])
									record["EndTime"] = new Date(record["EndTime"])
									//处理并且合并相关数据, 然后使用addCard方法传入
									records.push(record);
								}
							}

							me.addCard(records, true);
							me.queue.triggle("queryCustomerCard", "success");
						},
						failure: function(error){
							Ext.Error.raise(error)
						}
					});
				}else{
					if (customerData == null){
						me.queue.triggle("queryCustomer", "success");
					}
				}
			})

			me.queue.Add("waitingFeedback", "queryCustomer,queryCustomerCard", function(){
				Ext.MessageBox.hide();
				me.queue.triggle("waitingFeedback", "success");
				me.queue.reset();
			})
		}
	},
	restoreFromData: function(data){
		var me = this, cardServer = Beet.constants.cardServer, form = me.form.getForm();
		me.selectedCustomerId = data["CustomerID"];
		me.selectedEmpolyeeId = data["EID"];
		form.setValues({
			cardno: data["CardNo"],
			"level" : data["Level"],
			employeename: data["EName"],
			balance: (data["Balance"] ? data["Balance"].replaceAll(",", "") : 0),
			descript: data["Descript"]
		})
	},
	initializeCardPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.cardPanel.__columns && me.cardPanel.__columns.length > 0){
			return;
		}
		var columns = me.cardPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除卡项",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteCard(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetCustomerCardData(true, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.cardPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					
					//隐藏有效日期
					if (meta["FieldName"] == "ValidDate"){
						meta["FieldHidden"] = true;
					}
					if (!meta["FieldHidden"]){
						var column = {
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1,
						}

						switch (meta["FieldName"]){
							case "Balance":	
								column.editor = {
									xtype: "textfield",
									type: "int",
									allowBlank: false
								}
								break;
							case "StartTime":
								column.editor = {
									xtype: "datefield",
									format: "Y/m/d",
									allowBlank: false
								}
								break;
							case "EndTime":
								column.editor = {
									xtype: "datefield",
									format: "Y/m/d",
									allowBlank: false
								}
								break
						}

						columns.push(column);
					}
				}
				fields.push("raterate");
				fields.push("ID");
				//fields.push("blance");
				//fields.push("startdate");
				//fields.push("enddate");

				me.cardPanel.__columns = columns.concat([
				/*
				{
					header: "折上折",
					dataIndex: "raterate",
					hidden: true,
					flex: 1,
					editor: {
						xtype: "textfield",
						type: "int",
						allowBlank: false
					}
				},
				{
					header: "余额",
					dataIndex: "blance",
					flex: 1,
					editor: {
						xtype: "textfield",
						type: "int",
						allowBlank: false
					}
				},
				{
					header: "购买日期",
					dataIndex: "startdate",
					flex: 1,
					xtype: 'datecolumn',
					editor: {
						xtype: "datefield",
						format: "Y/m/d",
						allowBlank: false
					}
				},
				{
					header: "失效日期",
					dataIndex: "enddate",
					flex: 1,
					xtype: 'datecolumn',
					editor: {
						xtype: "datefield",
						format: "Y/m/d",
						allowBlank: false
					}
				},*/
				]);

				me.initializeCardGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeCardGrid: function(){
		var me = this, selectedCards = me.selectedCards;
		var __fields = me.cardPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.cardPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: "100%",
			cls: "iScroll",
			autoScroll: true,
			autoHeight: true,
			columnLines: true,
			columns: me.cardPanel.__columns,
			plugins: [
				Ext.create('Ext.grid.plugin.RowEditing', {
					clicksToEdit: 1,
					listeners: {
						validateedit: function(editor, e){
							var record = e.record, newvalues = e.newValues;
							var price = parseFloat(record.data.Price.replaceAll(",", "")), blance = parseFloat(newvalues.Balance);
							//console.log(editor, e)
							if (blance && blance >= price){
								e.cancel = false;
							}else{
								e.cancel = true;
								//check blance
								//var blance = editor.getEditor().down("textfield[name=Balance]");
								//if (blance){
									//TODO: 这里需要显示错误
								//}
							}
						}
					}
				})
			],
		});

		grid.on("beforedestroy", function(){
			me.cardPanel.grid.plugins = [];
		})

		me.cardPanel.add(grid);
		me.cardPanel.doLayout();
	},
	selectCard: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选则卡项",
			width: 900,
			height: 640,
			autoScroll: true,
			autoHeight: true,
			layout: "fit",
			resizable: true,
			border: false,
			modal: true,
			maximizable: true,
			border: 0,
			bodyBorder: false,
			editable: false
		}
		var win = Ext.create("Ext.window.Window", config);
		win.show();

		win.add(Ext.create("Beet.apps.ProductsViewPort.CardList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addCard(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addCard: function(records, isRaw){
		var me = this, selectedCards = me.selectedCards;
		var __fields = me.cardPanel.__fields;
		if (records == undefined){
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			//console.log(record)
			var cid, rawData;
			if (isRaw){
				cid = record["ID"] || record["CID"];
				rawData = record;
			}else{
				cid = record.get("ID") || record.get("CID");
				rawData = record.raw;
			}

			if (selectedCards[cid] == undefined){
				selectedCards[cid] = []
			}else{
				selectedCards[cid] = [];
			}

			//auto computer
			//console.log(rawData);
			if (rawData["raterate"] == undefined){
				rawData["raterate"] = 1;
			}

			if (rawData["StartTime"] == undefined){
				rawData["StartTime"] = new Date();
			}

			if (rawData["EndTime"] == undefined){
				// 0 year 1 month 2 day
				var d = 0;
				switch (rawData["ValidUnit"]){
					case 0:
						d = rawData["ValidDate"] * 365 * 86400;
						break;
					case 1:
						d = rawData["ValidDate"] * 30 * 86400;
						break;
					case 2:
						d = rawData["ValidDate"] * 86400;
						break;
				}
				rawData["EndTime"] = new Date(+new Date() + d * 1000);
			}

			rawData["ExpenseCount"] = rawData["MaxCount"];
			rawData["StepPrice"] = rawData["MaxCount"] == 0 ? 0 : rawData["Price"].replaceAll(",", "") / rawData["MaxCount"]
			if (rawData["Balance"] == undefined || rawData["Balance"] == ""){
				rawData["Balance"] = rawData["Price"].replace(/,/g, "");
			}

			//console.log(__fields, rawData)
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedCards[cid].push(rawData[k]);
			}
			//console.log(selectedCards)
		}

		me.updateCardPanel();
	},
	deleteCard: function(record){
		var me = this, selectedCards = me.selectedCards;
		var cid = record.get("ID");
		if (selectedCards[cid]){
			selectedCards[cid] = null;
			delete selectedCards[cid];
		}

		me.updateCardPanel();
	},
	updateCardPanel: function(){
		var me = this, selectedCards = me.selectedCards;
		var grid = me.cardPanel.grid, store = grid.getStore();
		var __fields = me.cardPanel.__fields;
		var tmp = []
		for (var c in selectedCards){
			tmp.push(selectedCards[c]);
		}

		store.loadData(tmp);
	},
	processData: function(f, isUpdate){
		var me = this, cardServer = Beet.constants.cardServer, form = me.form.getForm(), results = form.getValues();
		var selectedCards = me.selectedCards;
		var customerId = me.selectedCustomerId;
		var isValid = false;

		if (!customerId){
			Ext.MessageBox.alert("失败", "请选择会员!");
			return;
		}

		if (!me.selectedEmpolyeeId){
			Ext.MessageBox.alert("失败", "请选择顾问!");
			return;
		}

		results["customerid"] = customerId;
		results["eid"] = me.selectedEmpolyeeId;

		//check 
		var cards = [];
		cardStore = me.cardPanel.grid.getStore();
		for (var c = 0; c < cardStore.getCount(); ++c){
			var data = cardStore.getAt(c);
			var startdate = data.get("StartTime"), enddate = data.get("EndTime");
			if (startdate && enddate){
				startdate = +new Date(startdate) / 1000;
				enddate = +new Date(enddate) / 1000;
				if (startdate > enddate){
					Ext.MessageBox.alert("失败","失效日期必须比生效日期大!")
					return;
				}else{
					cards.push({
						id: data.get("ID"),
						starttime: startdate,
						endtime: enddate,
						rate: data.get("raterate"),
						expensecount: data.get("ExpenseCount"),
						stepprice: data.get("StepPrice"),
						balance: data.get("Balance")
					})
				}
			}else{
				Ext.MessageBox.alert("失败","生效日期与失效日期必须填写!")
				return;
			}
		}
		results["cards"] = cards;
		
		if (isUpdate){
			//console.log(results);
			cardServer.UpdateCustomerAccount(Ext.JSON.encode(results), {
				success: function(succ){
					if (succ){
						Ext.MessageBox.alert("成功", "更新成功!");
						me.storeProxy.loadPage(1);
					}else{
						Ext.MessageBox.alert("失败", "更新失败!");
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			});
		}else{
			cardServer.AddCustomerAccount(Ext.JSON.encode(results), {
				success: function(succ){
					if (succ){
						Ext.MessageBox.show({
							title: "增加成功",
							msg: "是否需要继续添加?",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									me.selectedCustomerId = null
									me.selectedEmpolyeeId = null;
									me.selectedCards = {};
									form.reset();
									me.updateCardPanel();
								}
							}
						})
					}else{
						Ext.MessageBox.alert("失败", "添加失败!");
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			});
		}
	}
})

//下单部分
Ext.define("Beet.apps.CreateOrder", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	autoDestory: true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	initComponent: function(){
		var me = this;
		me.selectedItemIndex = 0;//init index
		me.selectedItems = {};

		me.callParent();
		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this;
		
		//left panel
		//right panel info panel

		var config = {
			layout: {
				type: "hbox",
				align: "stretch"
			},
			height: "100%",
			autoHeight: true,
			autoScroll: true,
			border: false,
			bodyStyle: "background-color: #dfe8f5",
			defaults: {
				bodyStyle: "background-color: #dfe8f5",
				border: false
			},
			items: [
				{
					xtype: "panel",
					flex: 1,
					height: "100%",
					autoScroll: true,
					autoHeight: true,
					name: "leftPanel",
					items: [
						{
							xtype: "fieldset",
							title: "快速定位",
							collapsible: true,
							layout: "anchor",
							items: [
								{
									layout: {
										type: "table",
										columns: 2,
										tableAttrs: {
											cellspacing: 10,
											style: {
												width: "100%",
											}
										}
									},
									border: false,
									bodyStyle: "background-color: #dfe8f5",
									defaults: {
										bodyStyle: "background-color: #dfe8f5",
										width: 260
									},
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: "side",
										labelAlign: "left",
										labelWidth: 30
									},
									items: [
										{
											fieldLabel: "卡号",
											xtype: "textfield",
											enableKeyEvents: true,
											name: "ccardno",
											listeners: {
												keydown: function(f, e){
													if (e.getKey() == Ext.EventObject.ENTER){
														var v = f.getValue();
														if (v.length > 0){
															me.quickQueryCustom(v, "cardno")
														}
														e.stopEvent();
														e.stopPropagation();
														return false;
													}
												}
											}
										},
										{
											fieldLabel: "会员名",
											xtype: "trigger",
											editable: false,
											name: "customername",
											onTriggerClick: function(){
												//这里需要一个高级查询
												var win = Ext.create("Beet.plugins.selectCustomerWindow", {
													b_selectionMode: "SINGLE",
													_callback: function(r){
														me.onSelectCustomer(r);
														win.hide();
													}
												});
												win.show();
											}
										},
										{
											fieldLabel: "手机号",
											xtype: "textfield",
											enableKeyEvents: true,
											name: "mobile",
											listeners: {
												keydown: function(f, e){
													if (e.getKey() == Ext.EventObject.ENTER){
														var v = f.getValue();
														if (v.length > 0){
															me.quickQueryCustom(v, "mobile")
														}
														e.stopEvent();
														e.stopPropagation();
														return false;
													}
												}
											}
										},
										{
											xtype: "toolbar",
											ui: "",
											border: 0,
											style: {
												border: "0"
											},
											onBeforeAdd: function(component){
												//hack it!!!
												//console.log(component)
											},
											items: [
											"->",
											//{//button group
											//	xtype: "button",
											//	text: "高级搜索"
											//},
											{
												xtype: "button",
												text: "会员卡详情",
												name: "customerInfoBtn",
												disabled: true
											}
											]
										}
									]
								}
							]
						},
						{
							xtype: "fieldset",
							title: "订单金额",
							collapsible: true,
							layout: "anchor",
							items: [
								{
									layout: {
										type: "table",
										columns: 2,
										tableAttrs: {
											cellspacing: 10,
											style: {
												width: "100%",
											}
										}
									},
									border: false,
									bodyStyle: "background-color: #dfe8f5",
									defaults: {
										bodyStyle: "background-color: #dfe8f5",
										width: 260
									},
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: "side",
										labelAlign: "left",
										labelWidth: 30
									},
									items: [
										/*
										{
											fieldLabel: "流水号",
											xtype: "textfield",
											readOnly: true,
										},
										*/
										{
											fieldLabel: "订单号",
											xtype: "textfield"
										},
										{
											fieldLabel: "面值",
											xtype: "textfield",
											readOnly: true
										},
										{
											fieldLabel: "实耗",
											xtype: "textfield",
											readOnly: true
										}
									]
								}
							]
						},
					]
				},
				{
					xtype: "component",
					width: 5
				},
				{
					xtype: "panel",
					flex: 1,
					height: "100%",
					name: "rightPanel"
				},
			]
		}
		me.mainPanel = Ext.create("Ext.panel.Panel", config);
		me.add(me.mainPanel);
		me.doLayout();

		me.leftPanel = me.mainPanel.down("panel[name=leftPanel]");
		me.rightPanel = me.mainPanel.down("panel[name=rightPanel]");
		me.customerInfoBtn = me.mainPanel.down("button[name=customerInfoBtn]");

		//指定服务人员
		me.createListTabPanel();
		//订单区域
		me.createNewOrderPanel();
	},
	resetAll: function(){
		var me = this, form = me.getForm();
		form.setValues({
			"customername" : "",
			"ccardno" : "",
			"mobile" : ""
		})
		me.selectedCustomerId = null;
		me.customerInfoBtn.disable();
	},
	cleanup: function(){
		var me = this;
		me.resetAll();
		//destory all!!
		//me.newOrderPanel.removeAll(true);
		//me.itemsPanel.destory();
		//me.newOrderPanel.destory();

		//me.listTabPanel.removeAll(true);
		//me.listTabPanel.destory();

		Ext.defer(function(){
			//指定服务人员
			//me.createListTabPanel();
			//订单区域
			//me.createNewOrderPanel();
		}, 200)
	},
	quickQueryCustom: function(value, type){
		var me = this, customerServer = Beet.constants.customerServer, _sql = "";
		var form = me.getForm();
		form.setValues({
			"customername" : "",
			"ccardno" : "",
			"mobile" : ""
		})
		var waitBox = Ext.MessageBox.show({
			msg: "正在查询中...",
			progressText: "查询中...",
			width: 300,
			wait: true,
			waitConfig: {interval: 800},
			closable: false
		});
		
		//XXX
		if (type == "cardno"){
			_sql = "CTCardNo='" + value + "'";
		}else{
			if (type == "mobile"){
				_sql = "CTMobile='" + value + "'";
			}
		}

		customerServer.GetCustomerPageData(0, 30, _sql, {
			success: function(data){
				var data = Ext.JSON.decode(data), a = {};
				waitBox.hide();
				data = data["Data"];
				if (data.length > 0){
					a.raw = data[0];
				}
				me.onSelectCustomer(a);
			},
			failure: function(error){
				waitBox.hide();
				Ext.Error.raise(error)
			}
		})
	},
	onSelectCustomer: function(records){
		var record, me = this, cardServer = Beet.constants.cardServer;
		var form = me.getForm();
		me.resetAll();
		if (Ext.isArray(records) && records.length > 0){
			record = records[0]
		}else{
			if (records && (records.data || records.raw)){
				record = records;
			}else{
				Ext.MessageBox.alert("错误", "该用户不存在, 请重新查找!");
				return;
			}
		}
		//get
		var rawData = record.raw;
		var CTGUID = rawData.CTGUID;

		cardServer.GetCustomerAccountData(false, "CustomerID='"+CTGUID+"'", {
			success: function(data){
				data = Ext.JSON.decode(data)["Data"];
				if (data.length == 0){
					Ext.MessageBox.alert("警告", "当前用户没有开卡, 请重新选择或为此用户开卡!");
					return;
				}else{
					me.selectedCustomerId = CTGUID;
					data = data[0];
					if (data.State == 1){
						//Ext.MessageBox.alert("警告", "当前用户已经销卡, 请重新选择或为此用户重新开卡!");
						return;
					}
					form.setValues({
						customername: data.CustomerName,
						mobile: rawData.CTMobile,
						ccardno: data.CardNo
					});
					//开始查询他的卡项, 套餐, 费用
					me.customerInfoBtn.enable();
					me.newOrderPanel.enable();
				}
			},
			failure: function(error){
				Ext.Error.raise(error)
			}
		})
		
	},
	createNewOrderPanel: function(){
		var me = this;
		var options = {
			autoScroll: true,
			autoHeight: true,
			height: Beet.constants.VIEWPORT_HEIGHT - 100,
			width: Beet.constants.WORKSPACE_WIDTH * 0.5 - 10,
			cls: "iScroll",
			border: true,
			plain: true,
			collapsible: true,
			collapseDirection: "top",
			collapsed: true,
			listeners: {
				beforeexpand: function(p){
					for (var c = 0; c < me.childrenList.length; ++c){
						var child = me.childrenList[c];
						if (child !== p){
							child.collapse();
						}
					}
				},
				expand: function(p){
					if (p && p.setHeight){
						p.setHeight(Beet.constants.VIEWPORT_HEIGHT - 100);//reset && update
					}
				}
			}
		}
		/*
		me.packagesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "套餐列表",
			tbar: [{
				xtype: "button",
				text: "绑定套餐",
				handler: function(){
					//me.selectPackage();
				},
			}]
		}));
		*/

		me.itemsPanel= Ext.widget("panel", Ext.apply(options, {
			title: "消费项目列表",
			tbar: [
				{
					xtype: "button",
					text: "指定卡项项目",
					handler: function(){
						me.selectItems();
					},
				},
				"-",
				{
					xtype: "button",
					text: "指定其他项目",
					handler: function(){
						me.selectGiffItems();
					}
				}
			]
		}));

		/*
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "费用列表",
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					//me.selectChargeType();
				}
			}]	
		}));
		*/

		me.childrenList = [
			me.itemsPanel,
			//me.packagesPanel,
			//me.chargeTypesPanel,
		]

		me.newOrderPanel = Ext.create("Ext.panel.Panel", {
			width: Beet.constants.WORKSPACE_WIDTH * 0.5 - 10,
			height: Beet.constants.VIEWPORT_HEIGHT - 15,
			border: false,
			disabled: true,
			bodyStyle: "background-color: #dfe8f5",
			items: me.childrenList,
			buttons: [
				{
					text: "下单",
					scale: "large"
				},
				{
					text: "取消",
					scale: "large",
					handler: function(){
						me.cleanup()
					}
				}
			]
		})

		me.rightPanel.add(me.newOrderPanel);
		me.rightPanel.doLayout();

		Ext.defer(function(){
			me.itemsPanel.expand()	
		}, 500)
		//项目
		me.initializeItemsPanel();
		//费用
		//me.initializeChargeTypePanel();
	},
	//{{{
		//费用grid
	///}}}
	//{{{
	initializeItemsPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
			return;
		}
		var columns = me.itemsPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			header: "操作",
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除项目",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteItem(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetItemPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.itemsPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					if (meta["FieldName"] == "IDescript"){
						meta["FieldHidden"] = true;
					}
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						columns.push({
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						})
					}
				};
				me.itemsPanel.__fields = fields.concat(["CardName", "CardNo" , {name: "isgiff", type: "bool"}, "__index"]);
				me.itemsPanel.__columns = columns.concat([
					{
						dataIndex: "CardName",
						header: "所属卡项",
						flex: 1
					},
					{
						dataIndex: "isgiff",
						xtype: "checkcolumn",
						header: "赠送?",
						width: 35
					},
					{
						dataIndex: "__index",
						hidden: true
					}
				]);
				me.initializeItemsGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeItemsGrid: function(){
		var me = this, selectedItems = me.selectedItems;
		var __fields = me.itemsPanel.__fields;

		if (me.itemsPanel.grid == undefined){
			var store = Ext.create("Ext.data.ArrayStore", {
				fields: __fields
			})

			var grid = me.itemsPanel.grid = Ext.create("Ext.grid.Panel", {
				store: store,
				width: "100%",
				height: "100%",
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.itemsPanel.__columns,
				plugins: [
					Ext.create('Ext.grid.plugin.CellEditing', {
						clicksToEdit: 1
					})
				],
				listeners: {
					itemdblclick: function(grid,record,item,index, e){
						//add or select existed tab
						var cardNo = record.data["CardNo"];
						me.tapTabPanel(grid, record, item, index, e, cardNo);
					}
				}
			});

			me.itemsPanel.add(grid);
			me.itemsPanel.doLayout();
		}
	},
	//选增已存在的卡项
	selectItems: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var waitBox = Ext.MessageBox.show({
			msg: "正在查询中...",
			progressText: "查询中...",
			width: 300,
			wait: true,
			waitConfig: {interval: 800},
			closable: false
		});


		var config = {
			extend: "Ext.window.Window",
			title: "选择卡项项目",
			width: 1000,
			height: 640,
			autoScroll: true,
			autoHeight: true,
			layout: "fit",
			resizable: true,
			border: false,
			modal: true,
			maximizable: true,
			border: 0,
			bodyBorder: false,
			editable: false
		}
		var win = Ext.create("Ext.window.Window", config);
		win.show();

		//create fields
		var __fields = ["IID", "ICode", "IName", "IPrice", "IRate", "IRealPrice", "ICategoryID", "IDescript", "CardNo", "CardName"];
		var __columns = [
			{
				dataIndex: "ICode",
				flex: 1,
				header: "项目编号"
			},
			{
				dataIndex: "IName",
				flex: 1,
				header: "项目名称"
			},
			{
				dataIndex: "IPrice",
				flex: 1,
				header: "价格总价"
			},
			{
				dataIndex: "IRate",
				flex: 1,
				header: "项目折扣"
			},
			{
				dataIndex: "IRealPrice",
				flex: 1,
				header: "项目折扣总价"
			},
			{
				dataIndex: "IDescript",
				flex: 1,
				header: "项目注释"
			},
			{
				dataIndex: "CardName",
				flex: 1,
				header: "所属卡项"
			}
		]
		
		cardServer.GetCustomerCardData(false, "CustomerID='" + me.selectedCustomerId + "'", {
			success: function(data){
				data = Ext.JSON.decode(data)["Data"];
				var cards = [];
				waitBox.hide();
				if (data.length == 0){
					win.hide();
					Ext.MessageBox.alert("警告", "没有可用卡项");	
				}else{
					for (var c = 0; c < data.length; ++c){
						cards.push({
							attr: data[c]["CID"],
							name: data[c]["Name"]	
						})
					}
					var customerCardList = Ext.create("Ext.data.Store", {
						fields: ["attr", "name"],
						data: cards	
					})
		
					win.add(Ext.create("Beet.apps.ProductsViewPort.ItemListWindow", {
						b_type: "selection",
						b_advanceSearch: false,
						b_selectionMode: "MULTI",
						b_customerFields: __fields,
						b_customerColumns: __columns,
						b_customerStoreData: [],
						b_customerCardsList: customerCardList,
						b_customerHandlerStoreData: function(cid, store, cardName){
							store.loadData([]);
							cardServer.GetCardDetailData(cid, {
								success: function(data){
									data = Ext.JSON.decode(data);
									var items = data.items;
									if (items && items.length > 0){
										var sql = [];
										for (var c = 0; c < items.length; ++c){
											sql.push("iid=" + items[c]);
										}
										var s = sql.join(" OR ");
										if (s.length > 0){
											cardServer.GetItemPageData(1, items.length, s, {
												success: function(data){
													var data = Ext.JSON.decode(data)["Data"], tmp = [];
													for (var c = 0; c < data.length; ++c){
														var item = data[c];
														item["CardNo"] = cid;
														item["CardName"] = cardName;
														var _new = [];
														for (var k in __fields){
															_new.push(item[__fields[k]]);
														}
														tmp.push(_new);
													}
													store.loadData(tmp);
												},
												failure: function(error){
													Ext.Error.raise(error);
												}
											})
										}
									}
								},
								failure: function(error){
									Ext.Error.raise(error)
								}
							});
						},
						//需要指定fields 和 columns
						b_selectionCallback: function(records){
							if (records.length == 0){ win.close(); return;}
							//console.log(records);
							me.addItems(records);
							win.close();
						}
					}));
					win.doLayout();
				}
			},
			failure: function(error){
				Ext.Error.raise(error)
			}
		})
		
	},
	//选择其他卡项
	selectGiffItems: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择其他项目",
			width: 1000,
			height: 640,
			autoScroll: true,
			autoHeight: true,
			layout: "fit",
			resizable: true,
			border: false,
			modal: true,
			maximizable: true,
			border: 0,
			bodyBorder: false,
			editable: false
		}
		var win = Ext.create("Ext.window.Window", config);
		win.show();

		win.add(Ext.create("Beet.apps.ProductsViewPort.ItemListWindow", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addItems(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addItems: function(records, isRaw){
		var me = this, selectedItems = me.selectedItems;
		var __fields = me.itemsPanel.__fields;
		if (records == undefined){
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var id = "item-" + (me.selectedItemIndex++), rawData;
			if (isRaw){
				//id = record["IID"];
				record["__index"] = id;
				rawData = record;
			}else{
				//id = record.get("IID");
				//record.set("__index", id);
				rawData = record.raw || record.data;
				rawData["__index"] = id;
			}

			if (selectedItems[id] == undefined){
				selectedItems[id] = []
			}else{
				selectedItems[id] = [];
			}

			//console.log(rawData, __fields);
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedItems[id].push(rawData[k]);
			}
		}
		me.updateItemsPanel();
	},
	deleteItem: function(record){
		var me = this, selectedItems = me.selectedItems;
		//var id = record.get("IID");
		var id = record.get("__index");
		if (selectedItems[id]){
			selectedItems[id] = null;
			delete selectedItems[id];
		}

		me.updateItemsPanel();
	},
	updateItemsPanel: function(){
		var me = this, selectedItems = me.selectedItems;
		var grid = me.itemsPanel.grid, store = grid.getStore();
		var tmp = []
		for (var c in selectedItems){
			var item = selectedItems[c];
			tmp.push(selectedItems[c]);
		}
		store.loadData(tmp);
	},
	//}}}
	createListTabPanel: function(){
		var me = this;
		var options = {
			autoScroll: true,
			autoHeight: true,
			disabled: true,
			height: Beet.constants.VIEWPORT_HEIGHT - 190,
			width: Beet.constants.WORKSPACE_WIDTH * 0.5 - 10,
			cls: "iScroll",
			border: true,
			plain: true,
			title: "指定项目服务人员"
		}

		me.listTabPanel = Ext.create("Ext.tab.Panel", options);

		me.leftPanel.add(me.listTabPanel);
		me.leftPanel.doLayout();
	},
	tapTabPanel: function(grid, record, item, index, e, cardid){
		var me = this, tabId, itemId = record.get("__index");
		tabId = "tab"+itemId;
		if (me.tabCache == undefined){
			me.tabCache = {};
			me.listTabPanel.enable();
		}

		if (me.tabCache[tabId]){
			me.listTabPanel.setActiveTab(me.tabCache[tabId])
		}else{
			//从模板中创建一个 并且加入panel
			var tab = me.tabCache[tabId] = me.listTabPanel.add({
				title: record.get("IName") + (!!cardid ? " - (卡)" : ""),
				inTab: true,
				_cardid : cardid,
				_itemId: record.get("IID"),
				_cost: record.get("IRealPrice").replaceAll(",", ""),
				_isgiff: record.get("isgiff"),
				_itemRecord : record,
				items: [
					{
						xtype: "panel",
						border: false,
						plain: true,
						name: "_egrid",
						tbar: [
							{
								text: "指派员工",
								xtype: "button",
								handler: function(){
									tab.popupEmpolyee();
								}
							}
						]
					}
				]
			})

			me.listTabPanel.setActiveTab(tab)
			tab.panel = tab.down("panel[name=_egrid]");
			tab.panel.add(me.createEmpolyeeTempalte(tab));
			tab.panel.doLayout();
		}
		//console.log(grid, record, item, index, e)
	},
	createEmpolyeeTempalte: function(tab){
		var me = this;
		//init;
		tab.selectedEmpolyees = {};

		var __fields = tab.__fields = [
			"employeename", "employeeId", "employeeTime"	
		]
		var store = tab.store = Ext.create("Ext.data.ArrayStore", {
			//名字, id, 工时, 
			fields: tab.__fields
		});
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			header: "操作",
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "移除",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				tab.removeEmpolyee(d);
			}
		}, "-");
		var columns = tab.__columns = [
			_actions,
			{
				dataIndex: "employeename",
				header: "员工名",
				flex: 1
			},
			{
				dataIndex: "employeeTime",
				header: "工时",
				flex:1,
				hidden: true
			}
		];
		tab.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			height: tab.getHeight() - 29,
			width: "100%",
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: columns	
		});

		tab.popupEmpolyee = function(){
			var win = Ext.create("Ext.window.Window", {
				title: "选择专属顾问",
				width: 750,
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
			});
			win.add(Ext.create("Beet.apps.Viewport.EmployeeList", {
				b_type: "selection",
				b_selectionMode: "MULTI",
				height: "100%",
				width: "100%",
				b_selectionCallback: function(r){
					tab.addEmpolyee(r);
					win.hide();
				}
			}));
			win.doLayout();
			win.show();
		}
		tab.addEmpolyee = function(records){
			var selectedEmpolyees = tab.selectedEmpolyees;
			if (records == undefined){return;}
			for (var r = 0; r < records.length; ++r){
				var record = records[r];
				var eid, rawData;
				//if (isRaw){
				//	eid = record["PID"];
				//	rawData = record;
				//}else{
					eid = record.get("EM_UserID");
					rawData = record.raw;
				//}
				if (selectedEmpolyees[eid] == undefined){
					selectedEmpolyees[eid] = []
				}else{
					selectedEmpolyees[eid] = [];
				}

				selectedEmpolyees[eid] = [rawData["EM_NAME"], rawData["EM_UserID"], 0]
				//for (var c = 0; c < __fields.length; ++c){
				//	var k = __fields[c];
				//	selectedEmpolyees[eid].push(rawData[k]);
				//}
			}
			tab.updatePanel();
		}
		tab.removeEmpolyee = function(record){
			var selectedEmpolyees = tab.selectedEmpolyees;
			var eid = record.get("employeeId");
			if (selectedEmpolyees[eid]){
				selectedEmpolyees[eid] = null;
				delete selectedEmpolyees[eid];
			}

			tab.updatePanel();
		}
		tab.updatePanel = function(){
			var selectedEmpolyees = tab.selectedEmpolyees;
			var tmp = []
			for (var c in selectedEmpolyees){
				tmp.push(selectedEmpolyees[c]);
			}
			store.loadData(tmp);
		}

		return tab.grid
	}
})
