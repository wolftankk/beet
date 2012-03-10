//register menu
Ext.namespace("Beet.apps.customers")
registerMenu("customers", "customerAdmin", "会员管理",
	[
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
				var item = Beet.cache.menus["customers.AddCustomerCard"]
				if (!item){
					Beet.workspace.addPanel("customers.AddCustomerCard", "会员卡编辑", {
						items: [
							Ext.create("Beet.apps.customers.AddCustomerCard")
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
				var item = Beet.cache.menus["customers.CreateOrder"];
				if (!item){
					Beet.workspace.addPanel("customers.CreateOrder", "下单", {
						items: [
							Ext.create("Beet.apps.customers.CreateOrder")
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
				var item = Beet.cache.menus["customers.EndConsumer"];
				if (!item){
					Beet.workspace.addPanel("customers.EndConsumer", "结算", {
						items: [
							Ext.create("Beet.apps.customers.EndConsumer")
						]	
					})
				}else{
					Beet.workspace.workspace.setActiveTab(item);
				}
			}
		}
	]
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



Ext.define("Beet.apps.customers.AddCustomerCard", {
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
		me.initCustomerData = null;
		me.selectedCards = {};

		me.callParent();
		me.createMainPanel();
		me.queue = new Beet_Queue("customerCard");
		me.buildCustomerStore();
	},
	buildCustomerStore: function(){
		var me = this, customerServer = Beet.constants.customerServer;
		customerServer.GetCustomerPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data);
				metaData = data["MetaData"];
				var fields = [], columns = [];

				for (var c = 0; c < metaData.length; ++c){
					var d = metaData[c];
					fields.push(d["FieldName"]);
					if (!d["FieldHidden"]) {
						columns.push({
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
							me.proxy.b_params["start"] = options["start"] || 0;
							me.proxy.b_params["limit"] = options["limit"]

							return me.callParent([options]);
						}
					});
				}

				me.customerStore = Ext.create("Beet.apps.Viewport.CustomerListStore");
				me.customerStore.setProxy(me.updateCustomerProxy(""));
			},
			failure: function(error){
				Ext.Error.raise(error)
			}
		})
	},
	updateCustomerProxy: function(filter){
		var me = this;
		filter = filter == undefined ? "" : filter;
		return {
			 type: "b_proxy",
			 b_method: Beet.constants.customerServer.GetCustomerPageData,
			 startParam: "start",
			 limitParam: "limit",
			 b_params: {
				 "filter": filter
			 },
			 b_scope: Beet.constants.customerServer,
			 reader: {
				 type: "json",
				 root: "Data",
				 totalProperty: "TotalCount"
			 }
		}
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
				name: "bindingCard",
				disabled: true,
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
							width: 320,
							height: 300,
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
										width: 300
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
											width: 300,
											name: "customername",
											checkChangeBuffer: 500,
											//listeners: {
											//	change: function(f, newValue, oldValue, opts){
											//		newValue = Ext.String.trim(newValue);
											//		if (newValue.length == 0){
											//			 me.selectedCustomer = false;
											//			 return;
											//		}
											//		if (newValue == oldValue){
											//			return;
											//		}
											//		if (me.selectedCustomer){
											//			return;
											//		}
											//		if (!me.customerStore) { return; }
											//		var ownerCT = f.up("panel");
											//		var onListRefresh;
											//		//create picker
											//		if (f.picker == undefined){
											//			var createPicker= function(){
											//				var picker = Ext.create("Ext.view.BoundList", {
											//					pickerField: f,
											//					selModel: "SINGLE",
											//					floating: true,
											//					hidden: true,
											//					ownerCT: ownerCT,
											//					cls: "",
											//					displayField: "CTName",
											//					store: me.customerStore,
											//					focusOnFront: false,
											//					pageSize: 10,
											//					loadingText: 'Searching...',
											//					loadingHeight: 70,
											//					width: 400,
											//					maxHeight: 300,
											//					shadow: "sides",
											//					emptyText: 'No matching posts found.',
											//					getInnerTpl: function(){
											//						return '<span class="search-item"><h3>{CTName}</h3>{CTCardNo}<br/>电话: {CTMobile}</span>';
											//					}
											//				});
											//				return picker
											//			}
											//			f.picker = createPicker();

											//			f.picker.on({
											//				itemClick: function(v, record, item, index, e, opts){
											//					//console.log(record)
											//					me.onSelectCustomer([record]);
											//					me.selectedCustomer = true;
											//					f.picker.hide();
											//				},
											//				refresh: function(){
											//					onListRefresh();
											//				}
											//			})
											//		}
											//		me.customerStore.setProxy(me.updateCustomerProxy("CTName LIKE '%"+newValue+"%'"));
											//		me.customerStore.load();

											//		onListRefresh = function(){
											//			var heightAbove = f.getPosition()[1] - Ext.getBody().getScroll().top,
											//				heightBelow = Ext.Element.getViewHeight() - heightAbove - f.getHeight(),
											//				space = Math.max(heightBelow, heightAbove);

											//			if (f.picker.getHeight() > space){
											//				f.picker.setHeight(space - 5);
											//			}
											//		}
											//		var collapseIf = function(e){
											//			if (!e.within(f.bodyEl, false, true) && !e.within(f.picker.el, false, true)){
											//				f.picker.hide();

											//				var doc = Ext.getDoc();
											//				doc.un("mousewheel", collapseIf, f);
											//				doc.un("mousedown", collapseIf, f);
											//			}
											//		}

											//		me.customerStore.on({
											//			load: function(){
											//				f.picker.show();
											//				f.picker.alignTo(f.el, "tl-bl?", [105, 0]);
											//				onListRefresh();
											//				f.mon(Ext.getDoc(), {
											//					mousedown: collapseIf,
											//					mousewheel: collapseIf	
											//				})
											//				f.el.focus();
											//			}
											//		})
											//	}
											//},
											onTriggerClick: function(){
												//这里需要一个高级查询
												var win = Ext.create("Beet.plugins.selectCustomerWindow", {
													b_selectionMode: "SINGLE",
													_callback: function(r){
														me.selectedCustomer = true;
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
											allowBlank: false,
											enableKeyEvents: true,
											listeners: {
												keydown: function(f, e){
													var v = Ext.String.trim(f.getValue())
													if (v == "" || v.length == 0){
														return;
													}
													if (e.getKey() == Ext.EventObject.ENTER){
														me.onSelectCustomer(v, "cardno")
													}
												}
											}
										},
										{
											fieldLabel: "会员级别",
											name: "level"
										},
										{
											fieldLabel: "充值金额",
											readOnly: true,
											hidden: true,
											type: "float",
											name: "_payvalue"
										},
										{
											fieldLabel: "余额",
											allowBlank: false,
											readOnly: true,
											name: "balance",
											type: "float",
											listeners: {
												blur: function(){
													var v = this.getValue();
													if (parseFloat(v) > 0){
														me.down("button[name=bindingCard]").enable();
													}else{
														me.down("button[name=bindingCard]").disable();
													}
												}
											}
										},
										{
											fieldLabel: "专属顾问",
											xtype: "trigger",
											width: 300,
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
											width: 20
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
											width: 30
										},
										{
											xtype: "button",
											scale: "medium",
											text: "充值",
											disabled: true,
											name: "paidbtn",
											handler: function(){
												if (!me.selectedCustomerId){
													Ext.Msg.alert("错误", "请选择会员!");
													return;
												}
												me.openPaidWindow();
											}
										},
										{
											xtype: "component",
											width: 30
										},
										{
											xtype: "button",
											scale: "medium",
											text: "销卡",
											name: "deleteCard",
											disabled: true,
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
	openPaidWindow: function(){
		var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer,
			win, grid;
		
		cost = 0;
		//grid's columns/fields
		var _columns= [], _fields = [];

		if (!me.queue){
			me.queue = new Beet_Queue("createPaidWindow");
		}else{
			me.queue.reset();
		}

		win = Ext.create("Ext.window.Window", {
			title: "充值",
			height: 600,
			width: 500,
			border: false,
			autoHeight: true		
		});

		me.paidTypeStore = Ext.create("Ext.data.Store", {
			fields: ["PayID", "PayName"]
		});
		updatePayType();

		if (me.paidStore == undefined){
			var _actions = {
				xtype: 'actioncolumn',
				width: 50,
				header: "操作",
				items: [
				]
			}
			_actions.items.push("-",{
				icon: "./resources/themes/images/fam/delete.gif",
				tooltip: "移除",
				handler: function(grid, rowIndex, colIndex){
					var sm = grid.getSelectionModel();
					rowEditing.cancelEdit();
					me.paidStore.remove(sm.getSelection());
					if (me.paidStore.getCount() > 0) {
						sm.select(0);
					}
					updatePayType();
				}
			}, "-");
			_columns.push(_actions);

			me.queue.Add("getPaidModel", function(){
				cardServer.GetCustomerPayData(true, "", {
					success: function(data){
						var data = Ext.JSON.decode(data);	
						var metaData = data["MetaData"];	

						for (var c = 0; c < metaData.length; ++c){
							var d = metaData[c];
							_fields.push(d["FieldName"]);
							if (!d["FieldHidden"]) {
								var column = ({
									flex: 1,
									header: d["FieldLabel"],
									dataIndex: d["FieldName"]	
								})

								switch (d["FieldName"]){
									case "PayName": 
										column.editor = {
											xtype: "combobox",
											selectOnTab: true,
											editable: false,
											store: me.paidTypeStore,
											queryMode: "local",
											displayField: "PayName",
											valueField: "PayName",
											listClass: 'x-combo-list-small',
											allowBlank: false
										}
										break;
									case "Money":
										column.editor = {
											xtype: "textfield",
											type: "int",
											allowBlank: false
										}
										break;
									case "Descript":
										column.editor = {
											xtype: "textfield"
										}
										break
								}

								_columns.push(column);
							}
						};
						if (!Beet.cache.PaidTypeModel){
							Ext.define("Beet.cache.PaidTypeModel", {
								extend: 'Ext.data.Model',
								fields: _fields	
							})
						}
						me.paidStore = Ext.create("Ext.data.ArrayStore", {
							modal: Beet.cache.PaidTypeModel,
							autoDestroy: true
						})
						me.paidColumns = _columns;

						me.queue.triggle("getPaidModel", "success");
					},
					failure: function(error){
						Ext.Error.raise(error)
					}
				})	
			})
		}

		var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
			clicksToMoveEditor: 1,
			autoCancel: false,
			listeners: {
				edit: function(e, editor){
					var store = e.store;
					cost = 0;
					for (var c = 0; c < store.getCount(); ++c){
						var record = store.getAt(c);
						var payName = record.get("PayName");
						if (payName){
							//update payId
							for (var a = 0; a < me.paidTypeStore.getCount(); ++a){
								var r = me.paidTypeStore.getAt(a);
								if (r.get("PayName") == payName){
									record.set("PayID", r.get("PayID"));
									break;
								}
							}
						}
						var money = record.get("Money")
						cost += parseFloat(money);	
					}
					e.grid.down("label[name=totalPrice]").setText(cost)
				}
			}
		});

		//付款方式列表
		function updatePayType(){
			cardServer.GetPayTypeData("", {
				success: function(data){
					var data = Ext.JSON.decode(data);
					data = data["Data"];
					me.paidTypeStore.loadData(data);
					rowEditing.fireEvent("edit", {
						grid : grid,
						store: grid.getStore() 
					});
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
		}
		
		var createGird = function(){
			me.paidStore.loadData([]);//clear

			updatePayType();

			grid = Ext.create("Ext.grid.Panel", {
				width: "100%",
				height: "100%",
				autoScroll: true,	
				autoHeight: true,
				store : me.paidStore,
				columns: me.paidColumns,
				tbar: [
					{
						text: "新增付款",
						handler: function(){
							rowEditing.cancelEdit();
							var r = Ext.create("Beet.cache.PaidTypeModel", {
								"PayName" : "",
								"Money" : 0,
								"PayDate" : new Date(),
								"Descript" : ""
							});
							me.paidStore.insert(0, r);
							rowEditing.startEdit(0, 0);
						}
					},
					"->",
					{
						text: "新增付款方式",
						handler: function(){
							var w;
							var form = me.paidTypeForm = Ext.create("Ext.form.Panel", {
								height: "100%",
								width: "100%",
								frame: true,
								border: false,
								plain: true,
								shadow: true,
								items: [
									{
										fieldLabel: "名称",
										xtype: "textfield",
										name: "name"	
									},
									{
										xtype: "button",
										text: "提交",
										handler: function(){
											var form = me.paidTypeForm.getForm(), results = form.getValues();
											cardServer.AddPayType(results["name"], {
												success: function(id){
													if (id > -1){
														Ext.Msg.show({
															title: "添加成功",
															msg: "添加付款方式成功!",
															buttons: Ext.MessageBox.YESNO,
															fn: function(btn){
																updatePayType();
																w.close();
															}
														})
													}else{
														Ext.Error.raise("增加服务失败");
													}
												},
												failure: function(error){
													Ext.Error.raise(error);
												}
											});
										}
									}
								],
							});
							w = Ext.create("Ext.window.Window", {
								height: 100,
								width: 300,
								title: "增加付款方式",
								plain: true	
							});
							w.add(form);
							w.show();
						},
					}
				],
				bbar: [
					{
						xtype: "label",
						text: "总计:"
					},
					{
						xtype: "label",
						name: "totalPrice",
						text: "0"
					},
					"->",
					{
						text: "确定",
						handler: function(){
							Ext.MessageBox.show({
								title: "充值确认",
								msg: "充值金额: <span style=\"color:red;font-weight:bolder;\">" + cost + "</span> 元 <br/><br/>确认充值吗?",
								buttons: Ext.MessageBox.YESNO,
								fn: function(btn){
									if (btn == "yes"){
										var pays = [];
										for (var c = 0; c < me.paidStore.getCount(); ++c){	
											var r = me.paidStore.getAt(c);
											pays.push({
												payid: r.get("PayID"),
												money: r.get("Money"),
												descript: r.get("Descript")	
											});
										}
										var results = {
											customerid: me.selectedCustomerId,
											pays: pays
										}

										//充值部分, 成功充值后, 将返回当前的余额
										cardServer.AddCustomerPay(Ext.JSON.encode(results), {
											success: function(data){
												console.log(data)
												data = JSON.parse(data);
												if (data["result"]){
													var values = form.getValues();
													if (cost > 0){
														me.down("button[name=bindingCard]").enable();
													}
													
													/**
													 * TODO:
													 * 这里问题:
													 * 1. 充值成功后, 需要更新成功充值的金额, 往余额上加
													 */
													form.setValues(
														{
															_payvalue: cost,
															"balance" : parseFloat(values["balance"]) + cost
														}
													)
													win.close();	
												}else{
													Ext.Msg.alert("失败", "充值失败");
												}
											},
											failure: function(error){
												Ext.Error.raise(error)
											}
										})
									}
								}
							})
						}
					},
					{
						text: "取消",
						handler: function(){ 
							me.paidStore = null;
							win.close();
						}
					}
				],
				plugins: [
					rowEditing	
				]	
			});

			if (!!me.queue.getProcess("createGird")){
				me.queue.trigger("createGird", "success")
			}
			return grid
		}

		if (me.queue.getCurrentNumProcesses == 0 || me.paidStore){
			var g = createGird();
			win.show();
			win.add(g);
			win.doLayout();
		}else{
			me.queue.Add("createGird", "getPaidModel", function(){
				var g = createGird()
				win.add(g);
				win.show();
			});
		}
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
	onSelectCustomer: function(records, type){
		var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
		//reset all
		me.initCustomerData = true;
		me.selectedCustomerId = null
		me.selectedEmpolyeeId = null;
		me.selectedCards = {};
		form.reset();
		me.down("button[name=updatebtn]").disable();
		me.down("button[name=activebtn]").disable();
		me.down("button[name=deleteCard]").disable();
		me.down("button[name=paidbtn]").disable();
		me.updateCardPanel();
		var currentBalance = 0;

		if (records && records.length > 0){
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

				var sql = "";
				if (type == "cardno"){
					sql = " CardNo = '" + records + "'";	
				}else{
					var record = records[0];
					var CTGUID = record.get("CTGUID"), name = record.get("CTName");
					form.setValues({
						customername: name
					})
					me.selectedCustomerId = CTGUID;
					sql = "CustomerID='" + CTGUID + "'";
				}

				cardServer.GetCustomerAccountData(false, sql, {
					success: function(data){
						data = Ext.JSON.decode(data);
						data = data["Data"];
						if (data.length > 0){
							customerData = data[0];
							//restoreForm
							me.restoreFromData(customerData);
							if (type == "cardno"){
								me.selectedCustomerId = customerData["CustomerID"];
								form.setValues({
									customername: customerData["CustomerName"]	
								})
							}
							me.down("button[name=updatebtn]").enable();
							me.down("button[name=deleteCard]").enable();
							me.down("button[name=bindingCard]").enable();

							me.queue.triggle("queryCustomer", "success");
						}else{
							customerData = null;
							//获取充值余额
							cardServer.GetCustomerPayData(false, sql, {
								success: function(data){
									var data = Ext.JSON.decode(data);
									data = data["Data"];
									var money = 0;
									for (var c = 0; c < data.length; ++c){
										var d = data[c];
										var m = d["Money"].replaceAll(",", "");
										money += parseFloat(m);
									}
									form.setValues({
										_payvalue: money,
										balance: money	
									});
									if (money > 0){
										me.down("button[name=bindingCard]").enable();
									}
									me.queue.triggle("queryCustomer", "success");
								},
								failure: function(error){
									Ext.Error.raise(error)
								}
							})
							me.down("button[name=activebtn]").enable();
						}
						if (me.selectedCustomerId){
							me.down("button[name=paidbtn]").enable();
						}
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
							
							//这里初始化成功, 直接获得当前的金额值即可完成
							//var currentBalance = parseFloat(form.getValues()["_payvalue"]);
							//if (records.length > 0){
							//	var money = 0;
							//	for (var c = 0; c < records.length; ++c){
							//		var r = records[c];
							//		money += parseFloat(r["Balance"].replaceAll(",", ""));
							//	}
							//	form.setValues({
							//		_payvalue: money + currentBalance,
							//		balance: money+currentBalance
							//	});
							//}
							//不自动扣钱, 只增加数据进去
							me.addCard(records, true, false, true);
							me.queue.triggle("queryCustomerCard", "success");
						},
						failure: function(error){
							Ext.Error.raise(error)
						}
					});
				}else{
					if (customerData == null){
						me.queue.triggle("queryCustomerCard", "success");
					}
				}
			})

			me.queue.Add("waitingFeedback", "queryCustomer,queryCustomerCard", function(){
				Ext.MessageBox.hide();
				me.queue.triggle("waitingFeedback", "success");
				me.initCustomerData = false;
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
			_payvalue: (data["Balance"] ? data["Balance"].replaceAll(",", "") : 0),
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
				me.deleteCard(d, grid);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetCustomerCardData(true, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				//console.log(data)
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
							//case "EndTime":
							//	column.editor = {
							//		xtype: "datefield",
							//		format: "Y/m/d",
							//		allowBlank: false
							//	}
							//	break
						}

						columns.push(column);
					}
				}

				fields.push("raterate");
				fields.push("ID");
				fields.push("isNew");

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

		var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
			autoCancel: true,
			listeners: {
				edit: function(events, e){
				},
				validateedit: function(editor, e){
					var record = e.record, newvalues = e.newValues;
					var price = parseFloat(record.data.Price.replaceAll(",", "")), blance = parseFloat(newvalues.Balance);
					var selectedCards = me.selectedCards;
					var __fields = me.cardPanel.__fields;

					var _v = me.form.getForm().getValues(), balance = _v["balance"];

					if (blance && blance >= price){
						//修改成功!
						e.cancel = false;

						var cid = record.get("ID") || record.get("CID");
						if (!selectedCards[cid]){return}

						var rawData = record.data;
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

						//rawData["ExpenseCount"] = rawData["MaxCount"];
						//rawData["StepPrice"] = rawData["MaxCount"] == 0 ? 0 : rawData["Price"].replaceAll(",", "") / rawData["MaxCount"]
						//if (rawData["Balance"] == undefined || rawData["Balance"] == ""){
						//	rawData["Balance"] = rawData["Price"].replace(/,/g, "");
						//}

						//hook
						if (!me.initCustomerData){
							if (parseFloat(rawData["Balance"]) > parseFloat(balance)){
								Ext.MessageBox.alert("警告", "该卡项面值超出当前余额");
								//need remove
								delete selectedCards[cid];
								me.updateCardPanel();
								return;
							}
							selectedCards[cid] = [];
							Ext.defer(function(){
								for (var c = 0; c < __fields.length; ++c){
									var k = __fields[c];
									selectedCards[cid].push(rawData[k]);
								}
								//取消?!
								//TODO 
								//ISSUE
								//me.updateCardPanel();
							}, 100);
						}


					}else{
						e.cancel = true;
						//check blance
						var blance = editor.getEditor().down("textfield[name=Balance]");
						if (blance){
							blance.markInvalid("不能小于卡项原有金额");
						}
					}
				}
			}
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
				rowEditing
			],
		});
		grid.rowEditing = rowEditing;

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
				me.addCard(records, false, true);
				win.close();
			}
		}));
		win.doLayout();
	},
	addCard: function(records, isRaw, needComputeStepPrice, notComputingTotal){
		var me = this, selectedCards = me.selectedCards;
		if (notComputingTotal == undefined){
			notComputingTotal = false;
		}
		var __fields = me.cardPanel.__fields;
		//"CustomerID", "CID", "Name", "Par", "Price", "ExpenseCount", "StepPrice", "Balance", "Rate", "StartTime", "EndTime", "Price", "MaxCount", "ValidDateMode", "ValidDateTime", "ValidUnit", "ValidDate", "raterate", "ID", "isNew"
		if (records == undefined){
			return;
		}
		var _v = me.form.getForm().getValues(), balance = _v["balance"];

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

			//重新设置一次
			rawData["ID"] = cid;
			rawData["CID"] = cid;

			if (needComputeStepPrice){
				//console.log(rawData["Price"], rawData["MaxCount"])
				var price = rawData["Price"].replaceAll(",", "");
				var maxCount = rawData["MaxCount"] == 0 ? 1 : rawData["MaxCount"];
				rawData["StepPrice"] =  parseFloat(parseFloat(price) / parseFloat(maxCount), 2);
			}
			

			if (selectedCards[cid] == undefined){
				selectedCards[cid] = []
			}else{
				selectedCards[cid] = [];
			}

			//auto computer
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
			
			rawData["isNew"] = !notComputingTotal;//是否为新的?取反向值

			//批量计算是否超出面额
			if (!me.initCustomerData){
				if (parseFloat(rawData["Balance"]) > parseFloat(balance)){
					Ext.MessageBox.alert("警告", "该卡项面值超出当前余额");
					return;
				}else{
					balance -= parseFloat(rawData["Balance"]);	
				}
			}

			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedCards[cid].push(rawData[k]);
			}
		}

		me.updateCardPanel(notComputingTotal);
	},
	deleteCard: function(record, grid){
		var me = this, selectedCards = me.selectedCards;
		me.cardPanel.grid.rowEditing.cancelEdit();
		//自动删除部分
		var cid = record.get("CID");
		//console.log(cid, selectedCards)
		if (selectedCards[cid]){
			selectedCards[cid] = null;
			delete selectedCards[cid];
		}
		//console.log(selectedCards)

		me.updateCardPanel();
	},
	updateCardPanel: function(notComputingTotal){
		//console.trace(this);
		var me = this, selectedCards = me.selectedCards;
		var grid = me.cardPanel.grid, store = grid.getStore();
		var __fields = me.cardPanel.__fields;
		var tmp = [];

		var _v = me.form.getForm().getValues(), balance = _v["_payvalue"];

		//这一部分将会重新计算
		var totalBalance = 0; //卡项总价
		for (var c in selectedCards){
			if (selectedCards[c].length == 0){
				continue;
			}
			var m = (selectedCards[c][7] || "0").replaceAll(",", "");
			var isNew = selectedCards[c][19];//last 
			if (isNew){
				totalBalance += parseFloat(m);
			}
			tmp.push(selectedCards[c]);
		}

		if (!notComputingTotal){
			me.form.getForm().setValues({
				"balance" : (balance - totalBalance)
			})
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
						id: data.get("CID"),
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
			console.log(results)
			cardServer.UpdateCustomerAccount(Ext.JSON.encode(results), {
				success: function(succ){
					if (succ){
						Ext.MessageBox.alert("成功", "更新成功!");
						//console.log(me, me.storeProxy)
						//me.cardPanel.grid.store.loadPage(1)
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

Ext.define("Beet.apps.customers.CreateOrder", {
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
		me.canEditOrder = true;
		me.currentCustomerBalance = 0;

		me.callParent();
		me.createMainPanel();

		me.buildCustomerStore();
	},
	buildCustomerStore: function(){
		var me = this, customerServer = Beet.constants.customerServer;
		customerServer.GetCustomerPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data);
				metaData = data["MetaData"];
				var fields = [], columns = [];

				for (var c = 0; c < metaData.length; ++c){
					var d = metaData[c];
					fields.push(d["FieldName"]);
					if (!d["FieldHidden"]) {
						columns.push({
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
							me.proxy.b_params["start"] = options["start"] || 0;
							me.proxy.b_params["limit"] = options["limit"]

							return me.callParent([options]);
						}
					});
				}

				me.customerStore = Ext.create("Beet.apps.Viewport.CustomerListStore");
				me.customerStore.setProxy(me.updateCustomerProxy(""));
			},
			failure: function(error){
				Ext.Error.raise(error)
			}
		})
	},
	updateCustomerProxy: function(filter){
		var me = this;
		filter = filter == undefined ? "" : filter;
		return {
			 type: "b_proxy",
			 b_method: Beet.constants.customerServer.GetCustomerPageData,
			 startParam: "start",
			 limitParam: "limit",
			 b_params: {
				 "filter": filter
			 },
			 b_scope: Beet.constants.customerServer,
			 reader: {
				 type: "json",
				 root: "Data",
				 totalProperty: "TotalCount"
			 }
		}
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
											name: "customername",
											checkChangeBuffer: 500,
											listeners: {
												change: function(f, newValue, oldValue, opts){
													newValue = Ext.String.trim(newValue);
													if (newValue.length == 0){
														 me.selectedCustomer = false;
														 return;
													}
													if (newValue == oldValue){
														return;
													}
													if (me.selectedCustomer){
														return;
													}
													if (!me.customerStore) { return; }
													var ownerCT = f.up("panel");
													var onListRefresh;
													//create picker
													if (f.picker == undefined){
														var createPicker= function(){
															var picker = Ext.create("Ext.view.BoundList", {
																pickerField: f,
																selModel: "SINGLE",
																floating: true,
																hidden: true,
																ownerCT: ownerCT,
																cls: "",
																displayField: "CTName",
																store: me.customerStore,
																focusOnFront: false,
																pageSize: 10,
																loadingText: 'Searching...',
																loadingHeight: 70,
																width: 400,
																maxHeight: 300,
																shadow: "sides",
																emptyText: 'No matching posts found.',
																getInnerTpl: function(){
																	return '<span class="search-item"><h3>{CTName}</h3>{CTCardNo}<br/>电话: {CTMobile}</span>';
																}
															});
															return picker
														}
														f.picker = createPicker();

														f.picker.on({
															itemClick: function(v, record, item, index, e, opts){
																me.onSelectCustomer(record);
																me.selectedCustomer = true;
																f.picker.hide();
															},
															refresh: function(){
																onListRefresh();
															}
														})
													}
													me.customerStore.setProxy(me.updateCustomerProxy("CTName LIKE '%"+newValue+"%'"));
													me.customerStore.load();

													onListRefresh = function(){
														var heightAbove = f.getPosition()[1] - Ext.getBody().getScroll().top,
															heightBelow = Ext.Element.getViewHeight() - heightAbove - f.getHeight(),
															space = Math.max(heightBelow, heightAbove);

														if (f.picker.getHeight() > space){
															f.picker.setHeight(space - 5);
														}
													}
													var collapseIf = function(e){
														if (!e.within(f.bodyEl, false, true) && !e.within(f.picker.el, false, true)){
															f.picker.hide();

															var doc = Ext.getDoc();
															doc.un("mousewheel", collapseIf, f);
															doc.un("mousedown", collapseIf, f);
														}
													}

													me.customerStore.on({
														load: function(){
															f.picker.show();
															f.picker.alignTo(f.el, "tl-bl?", [105, 0]);
															onListRefresh();
															f.mon(Ext.getDoc(), {
																mousedown: collapseIf,
																mousewheel: collapseIf	
															})
															f.el.focus();
														}
													})
												}
											},
											onTriggerClick: function(){
												//这里需要一个高级查询
												var win = Ext.create("Beet.plugins.selectCustomerWindow", {
													b_selectionMode: "SINGLE",
													_callback: function(r){
														me.selectedCustomer = true;
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
												{
													xtype: "label",
													name: "currentCardBalance"
												},
												"->",
												{
													xtype: "button",
													text: "消费历史",
													disabled: true,
													name: "customerhistory"
												},
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
											xtype: "textfield",
											name: "serviceno",
											allowBlank: false
										},
										/*
										{
											fieldLabel: "面值",
											xtype: "textfield",
											readOnly: true
										},
										{
											fieldLabel: "实耗",
											xtype: "textfield",
											readOnly: true
										}*/
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
					flex: 2,
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
		me.customerHistoryBtn = me.mainPanel.down("button[name=customerhistory]");
		me.currentCardBalanceLable = me.mainPanel.down("label[name=currentCardBalance]")

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
			"mobile" : "",
			"serviceno" : ""
		})
		me.selectedItems = {};
		me.selectedCustomerId = null;
		me.customerInfoBtn.disable();
		me.bindOtherItemsBtn.disable();
		me.bindCardItemsBtn.disable();
		me.createOrderBtn.disable();
		me.customerHistoryBtn.disable();
		me.currentCardBalanceLable.setText('', false);
	},
	cleanup: function(){
		var me = this;
		me.resetAll();

		if (me.itemsPanel.grid && me.itemsPanel.grid.store){
			me.itemsPanel.grid.getStore().loadData([])
		}
		for (var k in me.tabCache){
			me.listTabPanel.remove(me.tabCache[k], true);
			me.tabCache[k].close();
		}
		//remove all child
		//me.listTabPanel.disable();
		me.tabCache = {};
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
		me.cleanup();
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
					me.bindOtherItemsBtn.enable();
					me.bindCardItemsBtn.enable();
					me.createOrderBtn.enable();
					me.customerHistoryBtn.enable();
					me.currentCardBalanceLable.setText('卡内余额: <span style="color:black;font-weight:bolder">' + data["Balance"] + "</span>", false)
					me.currentCustomerBalance = data["Balance"];
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
			width: Beet.constants.WORKSPACE_WIDTH * (2/3) - 10,
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
					name: "bindcarditems",
					disabled: true,
					handler: function(){
						me.selectItems();
					},
				},
				"-",
				{
					xtype: "button",
					text: "指定其他项目",
					name: "bindotheritems",
					disabled: true,
					handler: function(){
						me.selectGiffItems();
					}
				}
			]
		}));

		me.bindCardItemsBtn = me.itemsPanel.down("button[name=bindcarditems]");
		me.bindOtherItemsBtn = me.itemsPanel.down("button[name=bindotheritems]");

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
			width: Beet.constants.WORKSPACE_WIDTH * (2/3) - 10,
			height: Beet.constants.VIEWPORT_HEIGHT - 15,
			border: false,
			//disabled: true,
			bodyStyle: "background-color: #dfe8f5",
			items: me.childrenList,
			buttons: [
				{
					text: "下单",
					scale: "large",
					disabled: true,
					name: "_createorder",
					handler: function(){
						me.processData();
					},
				},
				{
					text: "重置",
					scale: "large",
					handler: function(){
						me.cleanup()
					}
				}
			]
		})

		me.createOrderBtn = me.newOrderPanel.down("button[name=_createorder]")

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
			width: 40,
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
		columns = columns.concat([
			{
				dataIndex: "isgiff",
				xtype: "checkcolumn",
				header: "赠送?",
				width: 40,
				editor: {
					xtype: "checkbox",
					cls: 'x-grid-checkheader-editor'
				},
			},
			{
				dataIndex: "isturn",
				xtype: "checkcolumn",
				header: "转扣?",
				width: 40,
				editor: {
					xtype: "checkbox",
					cls: 'x-grid-checkheader-editor',
				},
				listeners: {
					checkchange: function(){
						//这类事件无效?
						me.autoComputeNeedPaid();
					}
				}
			},
		])
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
				me.itemsPanel.__fields = fields.concat(["CardName", "CardNo", "StepPrice", "ExpenseCount", "Balance", {name: "isgiff", type: "bool"}, {name: "isturn", type: "bool"}, "__index", "needPaid", "originBalance"]);
				me.itemsPanel.__columns = columns.concat([
					{
						dataIndex: "ExpenseCount",
						header: "剩余消费次数",
						flex: 1
					},
					/*
					{
						dataIndex: "StepPrice",
						header: "单次消费价格",
						flex: 1,
						hidden: true
					},*/
					{
						dataIndex: "needPaid",
						header: "应付金额",
						flex: 1,
					},
					{
						dataIndex: "Balance",
						header: "支付卡项金额",
						flex: 1,
						allowBlank: false,
						name: "balance",
						editor: {
							xtype: "textfield",
							type: "int",
							enableKeyEvents: true
						}
					},
					{
						dataIndex: "CardName",
						header: "所属卡项",
						flex: 1
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
				fields: __fields,
				listeners: {
					datachanged: function(){
					}
				}
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
						clicksToEdit: 1,
						listeners: {
							beforeedit: function(e){
								var field = e.field;
								if (field != "Balance"){
									return true;
								}
								var grid = e.grid, record = e.record;
								if (record.get("isturn") && record.get("originBalance") > 0){
									return true
								}
								return false
							},
							edit: function(editor, e){
								var record = e.record;
								var data = record.data;
								var value = parseFloat(data["Balance"]);
								var originBalance = parseFloat(data["originBalance"]);
								var f = editor.getEditor(record, e.column);//real editor
								if (value > originBalance){
									data.Balance = originBalance
									e.cancel = false;
									record.commit();
								}
								me.autoComputeNeedPaid();
							}
						}
					})
				],
				listeners: {
					itemdblclick: function(grid,record,item,index, e){
						//add or select existed tab
						var cardNo = record.data["CardNo"];
						me.tapTabPanel(grid, record, item, index, e, cardNo, grid.getStore());
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
			width: 1100,
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
		var __fields = ["IID", "ICode", "IName", "IPrice", "IRate", "IRealPrice", "ICategoryID", "IDescript", "CardNo", "CardName", "ExpenseCount", "Balance", "StepPrice", "needPaid", "originBalance", "PackageName", "PackageID"];
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
			//{
			//	dataIndex: "PackageName",
			//	flex: 1,
			//	header: "所属套餐"
			//},
			{
				dataIndex: "CardName",
				flex: 1,
				header: "所属卡项"
			}
		]
		
		var now = Ext.Date.format(new Date, "Y/m/d H:i:s");
		cardServer.GetCustomerCardData(false, "CustomerID='" + me.selectedCustomerId + "' AND ExpenseCount > 0 AND EndTime > '" + now + "'", {
			success: function(data){
				data = Ext.JSON.decode(data)["Data"];
				var cards = [];
				var list = {};//card info list include expensecount
				waitBox.hide();
				if (data.length == 0){
					win.hide();
					Ext.MessageBox.alert("警告", "没有可用卡项");	
				}else{
					console.log("customerData",data)
					for (var c = 0; c < data.length; ++c){
						cards.push({
							attr: data[c]["CID"],
							name: data[c]["Name"]	
						})
						list[data[c]["CID"]] = {
							name: data[c]["Name"],
							expensecount: data[c]["ExpenseCount"],
							balance: (data[c]["Balance"] + "").replaceAll(",", ""),
							originBalance : (data[c]["Balance"] + "").replaceAll(",", ""),
							stepprice: data[c]["StepPrice"],
							maxcount: (data[c]["MaxCount"] + "").replaceAll(",", "")
						}
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
									var packages = data.packages;

									var getItems = function(){
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
															item["ExpenseCount"] = list[cid]["expensecount"]
															item["Balance"] = list[cid]["balance"]
															item["StepPrice"] = list[cid]["stepprice"]
															item["originBalance"] = list[cid]["originBalance"]
															var maxcount = parseInt(list[cid]["maxcount"]);
															var realPrice = parseFloat((item["IRealPrice"]+"").replaceAll(",", ""))
															if (maxcount == -1){
																item["needPaid"] = realPrice;
															}else{
																maxcount = maxcount == 0 ? 1 : maxcount;
																item["needPaid"] = parseFloat(realPrice / maxcount)
															}
															var _new = [];
															//console.log(item, __fields)
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
									}

									if (packages && packages.length > 0){
										cardServer.GetAllPackageItem(Ext.JSON.encode(packages), {
											success: function(data){
												data = Ext.JSON.decode(data);
												var _items = data.items;
												if (_items && _items.length > 0){
													items = items.concat(_items);
													getItems();			
												}
											},
											failure: function(error){
												Ext.Error.raise(error)
											}
										})
									}else{
										getItems();
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
			//var id = "item-" + (me.selectedItemIndex++), rawData;
			var rawData;
			if (isRaw){
				//id = record["IID"];
				//record["__index"] = id;
				rawData = record;
			}else{
				//id = record.get("IID");
				//record.set("__index", id);
				rawData = record.raw || record.data;
				//rawData["__index"] = id;
			}

			var id = "item-" + rawData["CardNo"] + "_" + rawData["IID"];
			rawData["__index"] = id;

			if (rawData["needPaid"] == undefined || rawData["needPaid"] == NaN){
				rawData["needPaid"] = parseFloat((rawData["IRealPrice"] + "").replaceAll(",", ""))
			}

			console.log(rawData)

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
			//remove tab
			var tabid = "tab" + id;
			if (me.tabCache[tabid]){
				me.listTabPanel.remove(me.tabCache[tabid], true);
				me.tabCache[tabid].close();
				me.tabCache[tabid] = null;
				me.listTabPanel.doLayout();
			}
		}

		me.updateItemsPanel();
	},
	updateItemsPanel: function(){
		var me = this, selectedItems = me.selectedItems;
		var grid = me.itemsPanel.grid, store = grid.getStore();
		var tmp = []
		//console.log(selectedItems)
		for (var c in selectedItems){
			if (selectedItems[c].length == 0){continue;}
			var item = selectedItems[c];
			tmp.push(selectedItems[c]);
		}
		store.loadData(tmp);
		me.autoComputeNeedPaid();
	},
	autoComputeNeedPaid: function(){
		var me = this;
		var grid = me.itemsPanel.grid, store = grid.getStore();
		var needPaidCount = 0;
		var currentCustomerBalance = 0
		var tmp = {};
		for (var c = 0; c < store.getCount(); ++c){
			var record = store.getAt(c);
			if (!record.get("isturn") && !record.get("isgiff")){
				needPaidCount += record.get("needPaid");
			}
			var cardno = record.get("CardNo");
			if (!tmp[cardno]){
				tmp[cardno] = true;
				currentCustomerBalance += parseFloat((record.get("Balance") + "").replaceAll(",", "")) || 0;
			}
		}
		currentCustomerBalance += parseFloat((me.currentCustomerBalance + "").replaceAll(",", "")) || 0;
		//console.log(currentCustomerBalance, needPaidCount)
		if (needPaidCount > currentCustomerBalance){
			me.createOrderBtn.disable();
			Ext.Msg.alert("警告", "卡内余额不足");
		}else{
			me.createOrderBtn.enable();
		}
	},
	//}}}
	createListTabPanel: function(){
		var me = this;
		var options = {
			autoScroll: true,
			autoHeight: true,
			//disabled: true,
			height: Beet.constants.VIEWPORT_HEIGHT - 225,
			width: Beet.constants.WORKSPACE_WIDTH * (1/3) - 10,
			cls: "iScroll",
			border: false,
			plain: true,
			title: "指定项目服务人员"
		}

		me.listTabPanel = Ext.create("Ext.tab.Panel", options);

		me.leftPanel.add(me.listTabPanel);
		me.leftPanel.doLayout();
	},
	tapTabPanel: function(grid, record, item, index, e, cardid, store){
		var me = this, tabId, itemId = record.get("__index");
		tabId = "tab"+itemId;
		if (me.tabCache == undefined){
			me.tabCache = {};
			me.listTabPanel.enable();
		}

		if (me.tabCache[tabId]){
			me.listTabPanel.setActiveTab(me.tabCache[tabId])
		}else{
			console.log(store.indexOf(record))
			//从模板中创建一个 并且加入panel
			var tab = me.tabCache[tabId] = me.listTabPanel.add({
				title: record.get("IName") + (!!cardid ? " - (卡)" : ""),
				inTab: true,
				_tabid: tabId,
				_cardid : cardid,
				//_itemId: record.get("IID"),
				//_cost: record.get("IRealPrice").replaceAll(",", ""),
				//_isgiff: record.get("isgiff"),
				//_isturn: record.get("isturn"),
				//_balance: record.get("Balance"),
				//_itemRecord : record,
				_itemStore: store,
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

			console.log(tab)

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
	},
	getItemRecord: function(store, key, value){
		for (var c = 0; c < store.getCount(); ++c){
			var record = store.getAt(c);
			var v = record.get(key);
			if (v){
				if (key == "__index"){
					v = "tab" + v;
				}
				if (v == value){
					return record;
				}
			}
		}
		return false
	},
	processData: function(){
		var me = this, cardServer = Beet.constants.cardServer,
			form = me.getForm(), values = form.getValues(), results = {};

		var serviceno = Ext.String.trim(values["serviceno"]);
		if (serviceno.length == 0){
			Ext.Msg.alert("警告", "请输入订单号!");
			return;
		}
		if (!me.selectedCustomerId){
			Ext.Msg.alert("警告", "请选择用户!");
			return;
		}
		var list = me.tabCache, cards = [], items = [];

		var itemsStore = me.itemsPanel.grid.getStore();
		for (var c = 0; c < itemsStore.getCount(); ++c){
			var r = itemsStore.getAt(c);
			var _index = "tab" + r.get("__index");
			if (!list[_index]){
				Ext.Msg.alert("错误", r.get("IName") + "需要指定服务员!");
				return;
			}
		}

		for (var k in list){
			var tab = list[k];
			var __index = tab._tabid, record = me.getItemRecord(tab._itemStore, "__index", __index);
			if (!record){
				Ext.Msg.alert("失败", "创建订单失败");
				return;
			}
			var _cardid = tab["_cardid"], _itemId = record.get("IID"), 
				_cost = record.get("IRealPrice").replaceAll(",", ""), isgiff = record.get("isgiff"), isturn = record.get("isturn"),
				_balance = record.get("Balance");
				employeeStore = tab.grid.getStore();

			var employees = [];
			var tmp = {
				isgiff : isgiff,
				cost: _cost,
				isturn: isturn
			};
			
			for (var s = 0; s < employeeStore.getCount(); ++s){
				var _s = employeeStore.getAt(s);
				employees.push({eid: _s.data["employeeId"]});
			}
			if (employees.length == 0){
				Ext.Msg.alert("警告", "请对每个项目指定服务员!");
				return;
			}
			tmp["employees"] = employees;

			if (!!_cardid){
				tmp["id"] = _cardid;
				tmp["balance"] = _balance;
				tmp["itemid"] = _itemId;
				cards.push(tmp);
			}else{
				tmp["id"] = _itemId;
				items.push(tmp)
			}
			//console.log(_cardid, _itemId, _cost, isgiff, employeeStore);
		}
		results = {
			customerid: me.selectedCustomerId,
			serviceno: serviceno,
			cards: cards,
			items: items
		}
		
		console.log(results);
		cardServer.AddConsumer(Ext.JSON.encode(results), {
			success: function(succ){
				if (succ){
					Ext.MessageBox.alert("成功", "新增订单成功!");
					me.cleanup();	
				}else{
					Ext.MessageBox.alert("警告", "新增订单失败!");
				}
			},
			failure: function(err){
				Ext.Error.raise(err)
			}
		})
	}
})

Beet.plugins.OrderStatus =Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{attr: -1, name: "全部"},
		{attr: 0, name: "已下单"},
		{attr: 1, name: "消费单退回"},
		{attr: 2, name: "已审核"},
		{attr: 3, name: "已结算"},
	]	
})

Ext.define("Beet.apps.customers.EndConsumer", {
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
									},
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: "side",
										labelAlign: "left",
										labelWidth: 30
									},
									items: [
										{
											fieldLabel: "订单号",
											xtype: "textfield",
											enableKeyEvents: true,
											name: "ccardno",
											listeners: {
												keydown: function(f, e){
													if (e.getKey() == Ext.EventObject.ENTER){
														var v = f.getValue();
														if (v.length > 0){
															var store = me.orderListPanel.grid.getStore();
															store.setProxy(me.updateOrderListProxy("ServiceNo = '" + v + "'"));//初始化时候
															store.loadPage(1);
														}
														e.stopEvent();
														e.stopPropagation();
														return false;
													}
												}
											}
										},
										{
											fieldLabel: "订单状态",
											xtype: "combobox",
											editable: false,
											name: "customername",
											store: Beet.plugins.OrderStatus,
											queryMode: "local",
											displayField: "name",
											valueField : "attr",
											value: 2,
											listeners: {
												change: function(f, newvalue){
													var sql = "";
													if (newvalue == -1){
														sql = ""
													}else{
														sql = ("State = " + newvalue)
													}
													var store = me.orderListPanel.grid.getStore();
													store.setProxy(me.updateOrderListProxy(sql));//初始化时候
													store.loadPage(1);
												}
											}
										},
									]
								},
							]
						},
						{
							xtype: "toolbar",
							ui: "",
							border: 0,
							style: {
								border: "0"
							},
							onBeforeAdd: function(component){
							},
							items: [
								"->",
								{
									text: "结算",
									scale: "large",
									width: 100,
									disabled: true,
									name: "clearingFee",
									handler: function(){
										var grid = me.orderListPanel.grid,
											sm = grid.selModel, list = sm.getSelection(),
											cardServer = Beet.constants.cardServer;
										if (list.length == 0){
											Ext.Msg.alert("失败", "请指定需要结算的订单");
											return;
										}
										
										var results = [];
										for (var c = 0; c < list.length; ++c){
											var order = list[c], state = order.get("State");
											//if (state != 2){
											//	Ext.Msg.alert("失败", "你选定的订单不能结算. 状态必须为已审核!");
											//	return;
											//}
											results.push({
												index: order["index"],
												indexno: order.get("IndexNo")
											});
										}
										if (results.length > 0){
											cardServer.EndConsumer(Ext.JSON.encode(results), {
												success: function(r){
													r = Ext.JSON.decode(r);
													if (r.length == 0) { }

													var str = [], pass = true;
													for (var c = 0; c < r.length; ++c){
														var info = r[c];
														//true
														if (info["result"]){
															updateGridRowBackgroundColor(grid, "#e2e2ff", info["index"]);
														}else{
															var rowIdx = updateGridRowBackgroundColor(grid, "#ffe2e2", info["index"], info["message"]);
															str.push("第" + rowIdx + "行 :" + info["message"]);
														}

														pass = pass && info["result"];
													}

													if (pass){
													}else{
														Ext.MessageBox.show({
															title: "错误",
															msg: str.join("<br/>"),
															buttons: Ext.MessageBox.OK	
														})
													}
												},
												failure: function(error){
													Ext.Error.raise(error)
												}
											})
										}
									}
								}
							]
						}
					]
				},
				{
					xtype: "component",
					width: 5
				},
				{
					xtype: "panel",
					flex: 2,
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
		me.clearingFeeBtn = me.mainPanel.down("button[name=clearingFee]");

		me.createOrderPanel();
	},
	createOrderPanel: function(){
		var me = this;
		var options = {
			autoScroll: true,
			autoHeight: true,
			height: Beet.constants.VIEWPORT_HEIGHT - 50,
			width: Beet.constants.WORKSPACE_WIDTH * (2/3) - 10,
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
						p.setHeight(Beet.constants.VIEWPORT_HEIGHT - 50);//reset && update
					}
				}
			}
		}

		me.orderListPanel = Ext.widget("panel", Ext.apply(options, {
			title: "订单列表",
		}));

		me.orderDetailPanel = Ext.create("Ext.panel.Panel", Ext.apply(options, {
			title: "订单详情",
		}));

		me.childrenList = [
			me.orderListPanel,
			me.orderDetailPanel
		]

		me.rightPanel.add(me.orderListPanel);
		me.rightPanel.add(me.orderDetailPanel);
		me.rightPanel.doLayout();

		me.initializeOrderPanel();
		me.initializeOrderDetailPanel();

		Ext.defer(function(){
			me.orderListPanel.expand()	
		}, 500)
	},
	initializeOrderPanel : function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.orderListPanel.__columns && me.orderListPanel.__columns.length > 0){
			return;
		}
		var columns = me.orderListPanel.__columns = [];

		cardServer.GetConsumerPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.orderListPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						var c = {
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						}

						columns.push(c);
					}
				}

				me.initializeOrderListGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	updateOrderListProxy: function(b_filter){
		var me = this, cardServer = Beet.constants.cardServer;
		return {
			type: "b_proxy",
			b_method: cardServer.GetConsumerPageData,
			startParam: "start",
			limitParam: "limit",
			b_params: {
				"awhere" : b_filter
			},
			b_scope: Beet.constants.cardServer,
			reader: {
				type: "json",
				root: "Data",
				totalProperty: "TotalCount"
			}
		}
	},
	initializeOrderListGrid: function(){
		var me = this, selectedProducts = me.selectedProducts;
		var __fields = me.orderListPanel.__fields;
		//console.log(__fields)

		if (!Beet.apps.OrderListStore){
			Ext.define("Beet.apps.OrderListStore", {
				extend: "Ext.data.Store",
				autoLoad: true,
				pageSize: Beet.constants.PageSize,
				fields: __fields,
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
						limit: Beet.constants.PageSize,
						addRecords: false
					});
					
					that.proxy.b_params["start"] = options["start"];
					that.proxy.b_params["limit"] = options["limit"];

					return that.callParent([options]);
				}
			});
		}

		if (me.orderListPanel.grid == undefined){
			var store = Ext.create("Beet.apps.OrderListStore");
			store.setProxy(me.updateOrderListProxy("State = 2"));//初始化时候
			var grid;
			var sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: "MULTI",
				listeners: {
					beforeselect: function(f, record, index){
						//var state = record.get("State");
						//if (state == 2){
						me.clearingFeeBtn.enable();
						//	return true
						//}
						//me.clearingFeeBtn.disable();
						////Ext.MessageBox.alert("失败", "你所勾选的不符合规定, 无法结算");
						//return false
					}
				}
			});
			
			grid = me.orderListPanel.grid = Ext.create("Beet.plugins.LiveSearch", {
				store: store,
				height: Beet.constants.VIEWPORT_HEIGHT - 79,
				cls: "iScroll",
				selModel: sm,
				autoScroll: true,
				columnLines: true,
				columns: me.orderListPanel.__columns,
				bbar: Ext.create("Ext.PagingToolbar", {
					store: store,
					displayInfo: true,
					displayMsg: '当前显示 {0} - {1} 到 {2}',
					emptyMsg: "没有数据"
				}),
				listeners: {
					itemdblclick: function(f, record, item, index, e){
						var indexno  = record.get("IndexNo");
						me.orderDetailPanel.expand();
						me.orderDetailPanel.store.setProxy(me.updateOrderDetailProxy("IndexNo = '" + indexno + "'"));
						me.orderDetailPanel.store.loadPage(1);
					}
				}
			});
			grid.selModel = sm;

			me.orderListPanel.add(grid);
			me.orderListPanel.doLayout();
		}
	},
	initializeOrderDetailPanel: function(){
		var me  = this, cardServer = Beet.constants.cardServer;
		if (me.orderDetailPanel.__columns && me.orderDetailPanel.__columns.length > 0){
			return;
		}
		var columns = me.orderDetailPanel.__columns = [];

		cardServer.GetConsumerDetailData(true, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.orderDetailPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						var c = {
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						}

						columns.push(c);
					}
				}

				me.initializeOrderDetailGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	updateOrderDetailProxy : function(b_filter){
		var me = this, cardServer = Beet.constants.cardServer;
		return {
			type: "b_proxy",
			b_method: cardServer.GetConsumerDetailData,
			b_params: {
				"b_onlySchema": false,
				"awhere" : b_filter
			},
			b_scope: Beet.constants.cardServer,
			reader: {
				type: "json",
				root: "Data",
				totalProperty: "TotalCount"
			}
		}
	},
	initializeOrderDetailGrid: function(){
		var me = this, selectedProducts = me.selectedProducts, cardServer = Beet.constants.cardServer;
		var __fields = me.orderDetailPanel.__fields;

		if (!Beet.apps.OrderDetailStore){
			Ext.define("Beet.apps.OrderDetailStore", {
				extend: "Ext.data.Store",
				autoLoad: true,
				pageSize: Beet.constants.PageSize,
				fields: __fields,
				load: function(options){
					var that = this, options = options || {};
					if (Ext.isFunction(options)){
						options = {
							callback: options
						};
					}
					Ext.applyIf(options, {
						groupers: that.groupers.items,
						addRecords: false
					});
					return that.callParent([options]);
				},
				proxy: {
					type: "b_proxy",
					b_method: cardServer.GetConsumerDetailData,
					b_params: {
						"b_onlySchema": false,
						"awhere" : ""
					},
					b_scope: Beet.constants.cardServer,
					reader: {
						type: "json",
						root: "Data",
						totalProperty: "TotalCount"
					}
				}
			})
		}

		if (me.orderDetailPanel.grid == undefined){
			var store = Ext.create("Beet.apps.OrderDetailStore");

			var grid = me.orderDetailPanel.grid = Ext.create("Beet.plugins.LiveSearch", {
				store: store,
				height: Beet.constants.VIEWPORT_HEIGHT - 79,
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.orderDetailPanel.__columns,
			});
			me.orderDetailPanel.store = store;


			me.orderDetailPanel.add(grid);
			me.orderDetailPanel.doLayout();
		}
	},
});

Ext.onReady(function(){
	Ext.require([
		"customers.addcustomer",
		"customers.customerlist"
	])
})
