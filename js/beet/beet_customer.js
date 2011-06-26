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
									allowBlank: false
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


Ext.define("Beet.plugins.LiveSearch",{
	extend: "Ext.grid.Panel",
	searchValue: null,
	indexes: [],
	currentIndex: null,
	searchRegExp: null,
	regExpMode: false,
	defaultStatusText: "没有找到",
	tagsRe: /<[^>]*>/gm,
	tagsProtect: '\x0f',
	regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm,
	matchCls: 'x-livesearch-match',
	initComponent: function(){
		var me = this;
		me.tbar = [
			'搜索', {
				xtype: "textfield",
				name: "searchField",
				hideLabel: true,
				width: 200,
				listeners: {
					change: {
						fn: me.onTextFieldChange,
						scope: this,
						buffer: 1000
					}
				}
			},{
				xtype: "button",
				text: "<",
				handler: me.onPreviousClick,
				scope: me,
				tooltip: "查找前一项"
			},
			{
				xtype: "button",
				text: ">",
				handler: me.onNextClick,
				scope: me,
				tooltip: "查找后一项"
			},
		]
		me.callParent(arguments);
	},
	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.textField = me.down('textfield[name=searchField]');
	},
	getSearchValue: function(){
		var me = this, value = me.textField.getValue();

		if (value ===''){return null;}

		if (!me.regExpMode){
			value = value.replace(me.regExpProtect, function(m) {
                return '\\' + m;
            });
		}else{
			try {
                new RegExp(value);
            } catch (error) {
                return null;
            }
            // this is stupid
            if (value === '^' || value === '$') {
                return null;
            }
		}
			
		var length = value.length, resultArray = [me.tagsProtect + '*'],
			i = 0,
			c;
            
		for(; i < length; i++) {
			c = value.charAt(i);
			resultArray.push(c);
			if (c !== '\\') {
				resultArray.push(me.tagsProtect + '*');
			}	 
		}
		return resultArray.join('');
	},
	onTextFieldChange: function(){
		var me = this, count = 0;

		me.view.refresh();

		me.searchValue = me.getSearchValue();
		console.log(me.searchValue);
		me.indexes = [];

		me.currentIndex = null;

         if (me.searchValue !== null) {
             me.searchRegExp = new RegExp(me.searchValue, 'g');
             
             me.store.each(function(record, idx) {
                 var td = Ext.fly(me.view.getNode(idx)).down('td'),
                     cell, matches, cellHTML;
                 while(td) {
                     cell = td.down('.x-grid-cell-inner');
                     matches = cell.dom.innerHTML.match(me.tagsRe);
                     cellHTML = cell.dom.innerHTML.replace(me.tagsRe, me.tagsProtect);
                     
                     // populate indexes array, set currentIndex, and replace wrap matched string in a span
                     cellHTML = cellHTML.replace(me.searchRegExp, function(m) {
                        count += 1;
                        if (Ext.Array.indexOf(me.indexes, idx) === -1) {
                            me.indexes.push(idx);
                        }
                        if (me.currentIndex === null) {
                            me.currentIndex = idx;
                        }
                        return '<span class="' + me.matchCls + '">' + m + '</span>';
                     });
                     // restore protected tags
                     Ext.each(matches, function(match) {
                        cellHTML = cellHTML.replace(me.tagsProtect, match); 
                     });
                     // update cell html
                     cell.dom.innerHTML = cellHTML;
                     td = td.next();
                 }
             }, me);

             // results found
             if (me.currentIndex !== null) {
                 me.getSelectionModel().select(me.currentIndex);
             }
         }

         // no results found
         if (me.currentIndex === null) {
             me.getSelectionModel().deselectAll();
         }

         me.textField.focus();

	},
	onPreviousClick: function(){
		var me = this, idx;
		
		if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx - 1] || me.indexes[me.indexes.length - 1];
            me.getSelectionModel().select(me.currentIndex);
        }
		
	},
	onNextClick: function(){
		var me = this, idx;
        if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
			me.currentIndex = me.indexes[idx + 1] || me.indexes[0];
			me.getSelectionModel().select(me.currentIndex);
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
				displayInfo: false,
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
					value: parseInt(rawData.CTBirthdayDay, 10)
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
