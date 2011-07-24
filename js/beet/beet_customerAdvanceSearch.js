Ext.define("Beet.apps.CustomerAdvanceSearch", {
	extend: "Ext.window.Window",
	title: "高级搜索",
	height: 400,
	width: 700,
	layout: "fit",
	closable: true,
	maximizable: true,
	minimizable: true,
	autoScroll: true,
	autoHeight: true,
	resizable: true,
	modal: true,
	border: 0,
	bodyBorder: 0,
	initComponent: function(){
		var me = this;
		var form = Ext.create("Beet.apps.CustomerSearchEngine");
		me.items = [
			form
		];
		me.callParent(arguments);
	}
});

Ext.define("Beet.apps.CustomerSearchEngine", {
	extend: "Ext.form.Panel",
	frame: true,
	bodyBorder: 0,
	border: 0,
	height: "100%",
	flex: 1,
	autoHeight: true,
	autoScroll: true,
	autoDestory: true,
	plain: true,
	currentIndex: 0,
	_colunms: [],
	_modelFields: [],
	initComponent: function(){
		var me = this, customerServer = Beet.constants.customerServer;
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
					var d = me.storeProxy.getAt(rowIndex)
					me.editCustomerFn(d);
				}
			}
		)
		me._colunms = [];
		me._modelFields = [];
		Beet.cache.AdvanceCustomerFilters = [];

		me._colunms.push(_actions);
		customerServer.GetCustomerToJSON("", true, {
			success: function(data){
				var data = Ext.JSON.decode(data);
				var metaData = data["MetaData"];

				for (var k in metaData){
					var item = metaData[k];
					if (!item.FieldHidden){
						//下拉菜单
						Beet.cache.AdvanceCustomerFilters.push({
							attr: item.FieldName,
							name: item.FieldLabel,
							_type: item.FieldType
						});

						//为grid 自动生成grid
						var column = {
							flex: 1	
						};
						for (var k in item){
							if (k == "FieldLabel"){
								column["header"] = item[k];
							}else if(k == "FieldName"){
								column["dataIndex"] = item[k];
							}
						}
						me._colunms.push(column);

					}
					//生产model
					me._modelFields.push(item["FieldName"]);
				}
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});

		me.items = [
		];

		me.tbar = [
			{
				xtype: "button",
				text: "增加过滤条件",
				icon: "./resources/themes/images/fam/add.png",
				scope: me,
				handler: me.onAddBtnClick
			}
		]

		me.callParent(arguments);
	},
	buttons: [
		{
			text: "搜索",
			handler: function(widget, e){
				var me = this, form = me.up("form").getForm(), result = form.getValues();
				if (!form.isValid()){
					return;
				}
				var filters = [];
				for (var c in result){
					var item = result[c];
					var key = item[0], op = item[1], value = item[2];
					for (var _s in Beet.cache.AdvanceCustomerFilters){
						var filter = Beet.cache.AdvanceCustomerFilters[_s];
						if (filter.attr == key){
							switch (filter._type){
								case 1:
								case 2:
								case 9:
								case 11:	
								case 12:
								case 20:
								case 21:
									if (op == "LIKE"){
										value = "'%"+value+"%'";
									}else{
										value = "'"+value + "'";
									}
									break;
								defaults:
									if (op == "LIKE"){
										op = "!=";
									}
									value = value;
									break;
							}
						}

					}
					filters.push(key + " " + op + " " + value);
				}
				
				me.up("form").search(filters.join(" AND "));
			}
		}
	],
	search: function(where){
		//start submit the sql to the server, and create store and columns
		var me = this, customerServer = Beet.constants.customerServer;
		
		//create model
		if (!Beet.apps.CustomerSearchEngine.Model){
			Ext.define("Beet.apps.CustomerSearchEngine.Model", {
				extend: "Ext.data.Model",
				fields: me._modelFields	
			})
		}

		var store = Ext.create("Ext.data.Store", {
			model: Beet.apps.CustomerSearchEngine.Model,
			autoLoad: true,
			proxy: {
				type: "b_proxy",
				b_method: customerServer.GetCustomerToJSON,
				b_scope: customerServer,
				b_params: {
					b_onlySchema: false,
					filter: where
				},
				reader: {
					type: "json",
					root: "Data"
				}
			}
		});
		me.storeProxy = store;

		var grid = Ext.create("Beet.apps.CustomerSearchEngine.GridList", {
			store: store,
			columns: me._colunms
		});

		var item = Beet.apps.Menu.Tabs["customeAdvanceSearchBtn"];
		if (item){
			Beet.workspace.removePanel("customeAdvanceSearchBtn");
		}
		Beet.workspace.addPanel("customeAdvanceSearchBtn", "高级搜索", {
			items: [
				grid
			]
		});

		
		Beet.cache.AdvanceSearchWin.close();

	},
	editCustomerFn: function(parentMenu){
		var that = this, rawData = parentMenu.rawData || parentMenu.raw, CTGUID = rawData.CTGUID, CTName = rawData.CTName;
		if (CTGUID){
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
				editable: false,
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
			]
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
				editable: false,
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
	onAddBtnClick: function(widget, e){
		var me = this;
		//每次点击增加一次
		me.currentIndex++;

		var CustomerFiltersStore = Ext.create("Ext.data.Store", {
			fields: ["attr", "name"],
			data: Beet.cache.AdvanceCustomerFilters
		});
		
		var filter = new Ext.form.FieldSet({
			layout: "column",
			frame: true,
			title: "搜索条件",
			autoWidth: true,
			defaults: {
				hideLabel: true,
				margin: "0 5 0 0"
			},
			columnWidth: 0.5,
			id: "customerFilter" + me.currentIndex,
			items: [
				{
					id: "customerFilter" + me.currentIndex + "_dropdown",
					xtype: "combobox",
					allowBlank: false,
					store: CustomerFiltersStore,
					queryMode: "local",
					displayField: "name",
					valueField: "attr",
					name: "customerFilter"+me.currentIndex
				},
				{
					id: "customerFilter" + me.currentIndex + "_operater",
					xtype: "combobox",
					width: 75,
					allowBlank: false,
					store: Beet.constants.OperatorsList,
					queryMode: "local",
					displayField: "name",
					valueField: "attr",
					value: "=",
					name: "customerFilter"+me.currentIndex
				},
				{
					id: "customerFilter" + me.currentIndex + "_value",
					xtype: "textfield",
					allowBlank: false,
					width: 230,
					name: "customerFilter"+me.currentIndex
				},
				{
					xtype: "button",
					icon: "./resources/themes/images/fam/delete.gif",
					margin: "0 0 0 20",
					tooltip: "删除此过滤",
					handler: function(widget, e){
						//TODO: 移除后, values还是存在原有值
						var fId = widget.ownerCt.getId();
						var f = me.remove(fId, true);
						me.doLayout();
						me.setAutoScroll(true);
					}
				}
			]
		})

		me.add(filter)
		me.doLayout();
		me.setAutoScroll(true);
	},
});

Ext.define("Beet.apps.CustomerSearchEngine.GridList", {
	extend: "Ext.grid.Panel",
	layout: "fit",
	width: "100%",
	height: "100%",
	lookMask: true,
	frame: true,
	rorder: false,
	border: 0,
	bodyBorder: 0,
	autoHeight: true,
	autoScroll: true,
	columnLines: true,
	initComponent: function(config){
		//set store
		var me = this;
		
		Ext.apply(me, config);

		me.bbar = Ext.create("Ext.PagingToolbar",{
			store: me.store,
			displayInfo: false,
			displayMsg: '当前显示 {0} - {1} 到 {2}',
			emptyMsg: "没有数据"
		})

		me.callParent(arguments);
	},
	viewConfig:{
		trackOver: false,
		stripeRows: true
	}
});
