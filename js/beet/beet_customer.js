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
					title: '会员管理',
					layout: "anchor",
					frame: true,
					width: 300,
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
							text: "会员卡管理",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["addCustomerCard"]
								if (!item){
									Beet.workspace.addPanel("addCustomerCard", "会员卡管理", {
										items: [
											Ext.create("Beet.apps.AddCustomerCard")
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
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
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

		Beet.constants.customerServer.GetCustomerToJSON("", true, {
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
		me.getCardMetaData();
	},
	getCardMetaData: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		cardServer.GetCustomerCardsPageData(0, 0, "", {
			success: function(data){
				var data = Ext.JSON.decode(data);
				me.buildStoreAndModel(data["MetaData"]);
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	buildStoreAndModel: function(metaData){
		var fields = [], me = this, cardServer = Beet.constants.cardServer;
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
		if (! Ext.isDefined(Beet.apps.AddCustomerCardModel)){
			Ext.define("Beet.apps.AddCustomerCardModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Ext.isDefined(Beet.apps.AddCustomerCardStore)){
			Ext.define("Beet.apps.AddCustomerCardStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.AddCustomerCardModel,
				autoLoad: true,
				pageSize: Beet.constants.PageSize,
				load: function(options){
					var that = this, options = options || {};
					if (Ext.isFunction(options)){
						options = {
							callback: options
						};
					}

					Ext.applyIf(options, {
						groupers: that.groupers.items,
						page: that.currentPage,
						start: (that.currentPage - 1) * Beet.constants.PageSize,
						limit: 0,
						addRecords: false
					});
					

					that.proxy.b_params["start"] = options["start"];
					that.proxy.b_params["limit"] = options["limit"];

					return that.callParent([options]);
				},
				proxy: {
					type: "b_proxy",
					b_method: cardServer.GetCustomerCardsPageData,
					startParam: "start",
					limitParam: "limit",
					b_params: {
						"awhere" : me.b_filter
					},
					b_scope: Beet.constants.cardServer,
					reader: {
						type: "json",
						root: "Data",
						totalProperty: "TotalCount"
					}
				}
			});
		}
		me.createCustomerGrid();
	},
	createCustomerGrid: function(){
		var me = this, cardServer = Beet.constants.cardServer, store;
		me.storeProxy = store = Ext.create("Beet.apps.AddCustomerCardStore");
		
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除卡",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteCardNo(d);
			}
		}, "-");

		//me.columns.concat(_actions);
		me.columns = [].concat(_actions,me.columns);

		me.customerGrid = Ext.create("Beet.plugins.LiveSearch", {
			store: store,
			title: "会员卡列表",
			lookMask: true,
			frame: true,
			height: "50%",
			width: "100%",
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			autoWidth: true,
			border: 0,
			flex: 1,
			cls: "iScroll",
			columnLines: true,
			viewConfig:{
				trackOver: false,
				stripeRows: true
			},
			columns: me.columns,
		})

		me.add(me.customerGrid);
		me.doLayout();

		me.storeProxy.on("load", function(){
			if (me.storeProxy.getCount() > 0){
				me.onLoadCustomerData();
			}
		})
	},
	deleteCardNo: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		Ext.Msg.show({
			title: "警告",
			msg: "是否需要删除卡号: " + record.get("CardNo") + " ?",
			buttons: Ext.MessageBox.YESNO,
			fn: function(btn){
				if (btn == "yes"){
					cardServer.DeleteCustomerCard(me.selectedCustomerId, {
						success: function(succ){
							if (succ){
								Ext.Msg.alert("成功", "删除成功")
								me.storeProxy.loadPage(1);
							}else{
								Ext.Msg.alert("失败", "删除失败")
							}
						},
						failure: function(error){
							Ext.Error.raise(error);
						}
					})			
				}
			}
		})
	},
	createMainPanel: function(){
		var me = this;

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
			height: "50%",
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			frame: true,
			plain: true,
			title: "编辑区",
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
											fieldLabel: "卡号",
											name: "cardno",
											allowBlank: false
										},
										{
											fieldLabel: "会员名",
											xtype: "trigger",
											width: 400,
											name: "customername",
											onTriggerClick: function(){
												//这里需要一个高级查询
												win = Ext.create("Beet.plugins.selectCustomerWindow", {
													b_selectionMode: "SINGLE",
													_callback: Ext.bind(me.onSelectCustomer, me)
												});
												win.show();
											}
										},
										{
											fieldLabel: "余额",
											allowBlank: false,
											name: "balance"
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
											width: 150
										},
										{
											xtype: "button",
											scale: "medium",
											text: "增加",
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
											handler: function(){
												me.processData(this, true);
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
	onSelectCustomer: function(records){
		var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
		//reset all
		me.selectedCustomerId = null
		me.selectedCards = {};
		form.reset();
		me.updateCardPanel();
		if (records && records.length == 1){
			var record = records[0];
			var CTGUID = record.get("CTGUID"), name = record.get("CTName");
			form.setValues({
				customername: name
			})

			me.selectedCustomerId = CTGUID;
			
			me.b_filter = "ID='"+CTGUID + "'";
			me.storeProxy.setProxy({
				type: "b_proxy",
				b_method: cardServer.GetCustomerCardsPageData,
				startParam: "start",
				limitParam: "limit",
				b_params: {
					"limit": Beet.constants.PageSize,
					"awhere" : me.b_filter
				},
				b_scope: Beet.constants.cardServer,
				reader: {
					type: "json",
					root: "Data",
					totalProperty: "TotalCount"
				}
			});
			me.storeProxy.loadPage(1);
		}
	},
	onLoadCustomerData: function(){
		var me = this, cardServer = Beet.constants.cardServer,
			selectedCards = me.selectedCards;
			var record = me.storeProxy.getAt(0);
		var form = me.form.getForm();

		form.setValues({
			cardno: record.get("CardNo"),
			balance: record.get("Balance").replaceAll(",", ""),
			descript: record.get("Descript")
		});

		me.customerTempData = {};
		cardServer.GetCustomerCardsDetailPageData(me.selectedCustomerId, {
			success: function(data){
				data = Ext.JSON.decode(data);
				var cards = data["cards"];
				var ids = [];
				for (var c = 0; c < cards.length; ++c){
					var card = cards[c];
					card["enddate"] = new Date(card["enddate"] * 1000);
					card["startdate"] = new Date(card["startdate"] * 1000);
					ids.push("id='"+card["id"] + "'");
					me.customerTempData[card["id"]] = card;
				}
				var sql = ids.join(" OR ");
				cardServer.GetCardPageData(0, cards.length, sql, {
					success: function(d){
						var d = Ext.JSON.decode(d)["Data"];
						for (var c = 0; c < d.length; ++c){
							var _data = d[c], id = _data["ID"];
							if (me.customerTempData[id]){
								var extraData = me.customerTempData[id];
								_data["startdate"] = extraData["startdate"];
								_data["enddate"] = extraData["enddate"];
							}
						}
						me.customerTempData = [];//reset
						me.addCard(d, true);
					},
					failure: function(error){
						Ext.Error.raise(error)
					}
				})
			},
			failure: function(error){
				Ext.Error.raise(error)
			}
		});
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
		cardServer.GetCardPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.cardPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						columns.push({
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1,
						})
					}
				}
				fields.push("startdate");
				fields.push("enddate");
				me.cardPanel.__columns = columns.concat([
				{
					header: "生效日期",
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
				},
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
				Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit: 1
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
			var cid, rawData;
			if (isRaw){
				cid = record["ID"];
				rawData = record;
			}else{
				cid = record.get("ID");
				rawData = record.raw;
			}

			if (selectedCards[cid] == undefined){
				selectedCards[cid] = []
			}else{
				selectedCards[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedCards[cid].push(rawData[k]);
			}
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

		results["id"] = customerId;

		//check 
		var cards = [];
		cardStore = me.cardPanel.grid.getStore();
		for (var c = 0; c < cardStore.getCount(); ++c){
			var data = cardStore.getAt(c);
			var startdate = data.get("startdate"), enddate = data.get("enddate");
			if (startdate && enddate){
				startdate = +new Date(startdate) / 1000;
				enddate = +new Date(enddate) / 1000;
				if (startdate > enddate){
					Ext.MessageBox.alert("失败","失效日期必须比生效日期大!")
					return;
				}else{
					cards.push({
						id: data.get("ID"),
						startdate: startdate,
						enddate: enddate	
					})
				}
			}else{
				Ext.MessageBox.alert("失败","生效日期与失效日期必须填写!")
				return;
			}
		}
		
		results["cards"] = cards;
		if (isUpdate){
			cardServer.UpdateCustomerCard(Ext.JSON.encode(results), {
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
			cardServer.AddCustomerCard(Ext.JSON.encode(results), {
				success: function(succ){
					if (succ){
						Ext.MessageBox.show({
							title: "增加成功",
							msg: "是否需要继续添加?",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									me.selectedCustomerId = null
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
