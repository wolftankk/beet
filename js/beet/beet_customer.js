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
									allowBlank: false
								},
								{
									fieldLabel: "身份证",
									name: "PersonID"
								},
								{
									xtype: "combobox",
									fieldLabel: "出生月份",
									store: Beet.constants.monthesList,
									name: "Month",
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
									name: "Day",
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
									name: "Mobile",
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
		"CTAddress"
	]
});

Ext.define("Beet.apps.Viewport.CustomerList.Store", {
	extend: "Ext.data.Store",
	model: Beet.apps.Viewport.CustomerList.Model,
	autoLoad: true,
	proxy: {
		type: "b_proxy",
		b_method: Beet.constants.customerServer.GetCustomerPageData,
		startParam: "start",
		limitParam: "limit",
		b_params: {
			"start": 0,
			"limit": 20000000,
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
		if (Beet.cache.Operator.privilege){
			for (var _s in Beet.cache.Operator.privilege){
				var p  = Beet.cache.Operator.privilege[_s];
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
						//popup window
						var customerServer = Beet.constants.customerServer;
						customerServer.GetCustomerItemToJson("CTGUID='"+CTGUID+"'", {
							success: function(data){
								data = Ext.JSON.decode(data);
								that.popEditWindow(rawData, data["Data"]);
							},
							failure: function(error){
							}
						})
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
	popEditWindow: function(rawData, customerData){
		var that = this, CTGUID = rawData.CTGUID, CTName = rawData.CTName,
			customerServer = Beet.constants.customerServer, win;

		//get serviceItems;
		//tabPanel
		var settingTabPanel = Ext.create("Ext.tab.Panel", {
			border: false,
			bodyBorder: false,
			autoHeight: true,
			autoScroll: true,
			plain: true,
			defaults: {
				border: false,
				frame: true,
				autoScroll: true
			},
			items: []
		});


		var basicform = Ext.widget("form", {
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
					xtype: "combobox",
					fieldLabel: "出生月份",
					store: Beet.constants.monthesList,
					name: "Month",
					queryMode: "local",
					displayField: "name",
					valueField: "attr",
					allowBlank: false,
					validator: function(value){
						if (value > 12){
							return "输入的月份值太大";
						}else if (value < 1){
							return "输入的月份值太小";
						}
						return true;
					},
					value: parseInt(rawData.CTBirthdayMonth, 10)
				},
				{
					xtype: "combobox",
					fieldLabel: "出生日期",
					store: Beet.constants.daysList,
					name: "Day",
					queryMode: "local",
					displayField: "name",
					valueField: "attr",
					allowBlank: false,
					validator: function(value){
						if (value > 31){
							return "输入的日期太大";
						}else if (value < 1){
							return "输入的日期太小";
						}
						return true;
					},
					value: parseInt(rawData.CTBirthdayDay, 10)
				},
				{
					fieldLabel: "手机号码",
					name: "Mobile",
					allowBlank: true,
					validator: function(value){
						var check = new RegExp(/\d+/g);
						if (value.length == 11 && check.test(value)){
							return true;
						}
						return "手机号码输入有误";
					},
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
						var needSubmitData = Ext.JSON.encode(result);
						customerServer.UpdateCustomer(CTGUID, needSubmitData, {
							success: function(){
								Ext.MessageBox.show({
									title: "更新成功",
									msg: "更新 " + CTName + " 用户基础资料成功!",
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

		var advancegTab = Ext.create("Ext.tab.Panel", {
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

		var advanceform = Ext.create("Ext.form.Panel", {
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
				advancegTab
			],
			buttons: [
				{
					text: "更新",
					handler: function(widget, e){
						var me = this, form = me.up("form").getForm(), result = form.getValues();
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
											win.close();
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
		});

		settingTabPanel.add({
			title: "高级资料",
			layout: "fit",
			border: 0,
			items: [
				advanceform
			]	
		})

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
			if (!data || data.length < 0){continue;}
			var _t = advancegTab.add({
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
		advancegTab.setActiveTab(_firsttab);

		win = Ext.widget("window", {
			title: CTName + " 的资料信息",
			width: 650,
			height: 500,
			minHeight: 400,
			autoHeight: true,
			autoScroll: true,
			layout: "fit",
			resizable: true,
			border: false,
			modal: true,
			maximizable: true,
			border: 0,
			bodyBorder: false,
			items: settingTabPanel,
			buttons: [
				{
					text: "关闭",
					handler:function(){
						win.close();
					}
				}
			]
		})
		win.show();
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
