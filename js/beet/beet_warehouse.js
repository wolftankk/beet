registerBeetAppsMenu("warehouse", 
{
	title: "库存管理",
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
					title: '库存管理',
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
							text: "库存管理",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["warehouseList"];
								if (!item){
									Beet.workspace.addPanel("warehouseList", "库存管理", {
										items: [
											Ext.create("Beet.apps.WarehouseViewPort.warehouseList")
										]
									});
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						},
					]
				}
			]
		}
	]
});

Ext.ns("Beet.apps.WarehouseViewPort");

Beet.constants.stockStauts = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{attr: "all", name: "全部"},
		{attr: 0, name: "申请入库"},
		{attr: -1, name: "已入库"},
		{attr: 1, name: "申请出库"},
		{attr: 2, name: "已出库"},
		{attr: -2, name: "结算完毕"}	
	]	
});


//storeid, pid, count, enddate
Ext.define("Beet.apps.WarehouseViewPort.AddProduct", {
	extend: "Ext.panel.Panel",	
	height: "100%",
	width: "100%",
	layout: "fit",
	bodyStyle: "background-color: #dfe8f5",
	defaults: {
	  bodyStyle: "background-color: #dfe8f5"
	},
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	initComponent: function(){
		var me = this, stockServer = Beet.constants.stockServer;
	
		me.selectedProducts = {};
		me.callParent()	
		me.mainPanel = Ext.create("Ext.panel.Panel", {
			height: (me.b_type == "selection" ? "95%" : "100%"),
			width: "100%",
			autoHeight: true,
			autoScroll: true,
			border: false,
			layout: {
				type: "hbox",
				columns: 2,
				align: 'stretch'
			},
		})
		me.add(me.mainPanel);
		me.doLayout();
		
		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, stockServer = Beet.constants.stockServer;
		var options = {
			autoScroll: true,
			autoWidth: true,
			autoHeight: true,
			cls: "iScroll",
			height: 230,
			border: true,
			plain: true,
			flex: 1,
			collapsible: true,
			bodyStyle: "background-color: #dfe8f5"
		}
		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "产品列表"
		}));

		var config = {
			autoHeight: true,
			autoScroll: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5",
			bodyPadding: 5,
			items: [
				//fill me
				{
					xtype : "panel",
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
					},
					defaultType: "textfield",
					fieldDefaults: {
						msgTarget: "side",
						labelAlign: "top",
						labelWidth: 60
					},
					items: [
						{
							fieldLabel: "项目编号",
							allowBlank: false,
							name: "code"
						},
						{
							fieldLabel: "项目名称",
							allowBlank: false,
							name: "name"
						},
					]
				},
				me.productsPanel
			],
			bbar: [
				"->",
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						//me.processData(this)	
					},
					hidden: me._editType == "view"
				},
				{
					xtype: "button",
					text: "取消",
					width: 200,
					handler: function(){
						if (me.callback){
							me.callback();
						}
					},
					hidden: me._editType == "view"
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.form.setHeight("100%");
		me.mainPanel.add(form);
		me.mainPanel.doLayout();

		me.initializeProductsPanel();
	},
	initializeProductsPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.productsPanel.__columns && me.productsPanel.__columns.length > 0){
			return;
		}
		var columns = me.productsPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除消耗产品",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteProducts(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetItemProductData(-1, {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.productsPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						var c = {
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						}

						if (meta["FieldName"] == "COUNT" || meta["FieldName"] == "PRICE"){
							c.editor = {
								xtype: "numberfield",
								allowBlank: false,
								type: "int"
							}
						}

						columns.push(c);
					}
				}

				me.initializeProductsGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeProductsGrid: function(){
		var me = this, selectedProducts = me.selectedProducts;
		var __fields = me.productsPanel.__fields;

		if (me.productsPanel.grid == undefined){
			var store = Ext.create("Ext.data.ArrayStore", {
				fields: __fields
			})

			var grid = me.productsPanel.grid = Ext.create("Ext.grid.Panel", {
				store: store,
				height: 200,
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.productsPanel.__columns,
				plugins: [
					Ext.create('Ext.grid.plugin.CellEditing', {
						clicksToEdit: 1,
						// cell edit event
						listeners: {
							"edit" : function(editor, e, opts){
								// fire event when cell edit complete
								var currField = e.field, currColIdx = e.colIdx, currRowIdx = e.rowIndex;
								var currRecord = e.record;
								var currPrice = currRecord.get("PRICE");
								if (currField == "COUNT"){
									//check field "PRICE" that it exists val?
									var price = currRecord.get("PPrice"), count = currRecord.get("COUNT");
									if (price){ price = price.replaceAll(",", ""); }
									currRecord.set("PRICE", Ext.Number.toFixed(price * count, 2));

									me.onUpdate();	
								}else{
									if (currField == "PRICE" && currPrice && currPrice > 0){
										me.onUpdate();	
									}
								}
							}
						}
					})
				],
				selType: 'cellmodel'
			});


			me.productsPanel.add(grid);
			me.productsPanel.doLayout();
		}
	},
	selectProducts: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择产品",
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
		win.add(Ext.create("Beet.apps.ProductsViewPort.ProductsList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addProducts(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addProducts: function(records, isRaw){
		var me = this, selectedProducts = me.selectedProducts;
		var __fields = me.productsPanel.__fields;
		if (records == undefined){return;}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var pid, rawData;
			if (isRaw){
				pid = record["PID"];
				rawData = record;
			}else{
				pid = record.get("PID");
				rawData = record.raw;
			}
			if (selectedProducts[pid] == undefined){
				selectedProducts[pid] = []
			}else{
				selectedProducts[pid] = [];
			}

			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedProducts[pid].push(rawData[k]);
			}
		}

		me.updateProductsPanel(isRaw);
	},
	deleteProducts: function(record){
		var me = this, selectedProducts = me.selectedProducts;
		var pid = record.get("PID");
		if (selectedProducts[pid]){
			selectedProducts[pid] = null;
			delete selectedProducts[pid];
		}

		me.updateProductsPanel();
	},
	updateProductsPanel: function(first){
		var me = this, selectedProducts = me.selectedProducts;
		var grid = me.productsPanel.grid, store = grid.getStore();
		var tmp = []
		for (var c in selectedProducts){
			tmp.push(selectedProducts[c]);
		}
		store.loadData(tmp);
		if (first){return;}
		me.onUpdate();
	},

	processData: function(){

	}
})

Ext.define("Beet.apps.WarehouseViewPort.warehouseList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll: true,
	height: Beet.constants.VIEWPORT_HEIGHT,
	width: Beet.constants.WORKSPACE_WIDTH,
	frame: true,
	height: "100%",
	width: "100%",
	border: false,
	shadow: true,
	b_filter: ' states = -1',
	initComponent: function(){
		var me = this, stockServer = Beet.constants.stockServer;
		if (me.b_type == "selection"){
			me.editable = false;
		}else{
			me.editable = true;
		}
		me.currentStockStatus = 0;
		
		me.callParent();
		me.mainPanel = Ext.create("Ext.panel.Panel", {
			height: (me.b_type == "selection" ? "95%" : "100%"),
			width: "100%",
			autoHeight: true,
			autoScroll: true,
			border: false,
			layout: {
				type: "hbox",
				columns: 2,
				align: 'stretch'
			},
		})
		me.add(me.mainPanel);
		me.doLayout();

		me.getProductsMetaData();
	},
	getProductsMetaData: function(){
		var me = this, stockServer = Beet.constants.stockServer;

		stockServer.GetStockPageData(0, 1, "", {
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
		var fields = [], me = this, stockServer = Beet.constants.stockServer;
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
		
		if (!Ext.isDefined(Beet.apps.WarehouseViewPort.warehouseModel)){
			Ext.define("Beet.apps.WarehouseViewPort.warehouseModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Ext.isDefined(Beet.apps.WarehouseViewPort.warehouseStore)){
			Ext.define("Beet.apps.WarehouseViewPort.warehouseStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.WarehouseViewPort.warehouseModel,
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
						limit: Beet.constants.PageSize,
						addRecords: false
					});
					

					that.proxy.b_params["start"] = options["start"];
					that.proxy.b_params["limit"] = options["limit"];

					return that.callParent([options]);
				}
			});
		}

		me.createGrid();
	},
	updateProxy: function(){
		var me = this, stockServer = Beet.constants.stockServer;
		return {
			type: "b_proxy",
			b_method: stockServer.GetStockPageData,
			startParam: "start",
			limitParam: "limit",
			b_params: {
				"awhere" : me.b_filter
			},
			b_scope: stockServer,
			reader: {
				type: "json",
				root: "Data",
				totalProperty: "TotalCount"
			}
		}
	},
	createGrid: function(){
		var me = this, grid = me.grid, sm = null;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.WarehouseViewPort.warehouseStore")
		});
		var store = me.storeProxy, actions;
		store.setProxy(me.updateProxy());

		var _actions = {
			xtype: 'actioncolumn',
			width: 50,
			items: [
			]
		}

		//这里需要权限判断
		_actions.items.push(
			"-", "-", "-", {
				icon: './resources/themes/images/fam/edit.png',
				tooltip: "编辑消耗产品",
				id: "customer_grid_edit",
				handler:function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					//me.editProductItem(d);
				}
			}
		);
		
		if (me.b_type == "selection") {
		}else{
			_actions.items.push("-", "-", "-",{
				icon: "./resources/themes/images/fam/delete.gif",
				tooltip: "删除消耗产品",
				id: "customer_grid_delete",
				handler: function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					//me.deleteProductItem(d);
				}
			}, "-","-","-");
		}
		
		me.columns.splice(0, 0, _actions);

		me.grid = Ext.create("Beet.plugins.LiveSearch", {
			store: store,
			lookMask: true,
			frame: true,
			collapsible: false,
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			autoWidth: true,
			border: 0,
			flex: 1,
			cls: "iScroll",
			selModel: sm,
			width: "100%",
			height: me.editable ? "100%" : "95%",
			columnLines: true,
			viewConfig:{
				trackOver: false,
				stripeRows: true
			},
			columns: me.columns,
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			}),
			tbar: [
				"-",
				{
					fieldLabel: "库存状态",
					labelWidth: 60,
					allowBlank: false,
					xtype: "combo",
					store: Beet.constants.stockStauts,
					editable: false,
					queryMode: "local",
					displayField: "name",
					valueField: "attr",
					value: me.currentStockStatus,
					listeners: {
						change: function(field, newValue, oldValue){
							if (newValue == oldValue) { return ;}
							if (newValue == null ) { return;}
							var sql = ""
							if (newValue == "all"){
								sql = "";
							}else{
								sql = " states = " + newValue;
							}
							me.b_filter = sql;
							me.filterProducts();
						}
					}
				},
				"-",
				{
					xtype: "button",
					text: "高级搜索",
					handler: function(){
						var stockServer = Beet.constants.stockServer;
						stockServer.GetStockPageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										//me.filterProducts();
									}
								});
								win.show();
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						});
					}
				},
				"-",
				{
					xtype: "button",
					text: "申请入库",
					handler: function(){
						var win = Ext.create("Ext.window.Window", {
							width: 1000,
							height: 600,
							layout: "fit",
							autoHeight: true,
							autoScroll: true,
							title: "增加产品",
							border: false
						});
						win.add(Ext.create("Beet.apps.WarehouseViewPort.AddProduct", {
							_editType: "add",
							callback: function(){
								win.close();
								me.storeProxy.loadPage(me.storeProxy.currentPage);
							}
						}));
						win.show();
					}
				}
			]
		})
		me.mainPanel.add(me.grid);
		me.mainPanel.doLayout();

		if (me.b_type == "selection"){
			me.add(Ext.widget("button", {
				text: "确定",
				floating: false,
				handler: function(){
					if (me.b_selectionCallback){
						me.b_selectionCallback(me.selModel.getSelection());
					}
				}
			}))
			me.doLayout();
		}
	},
	filterProducts: function(){
		var me = this;
		me.storeProxy.setProxy(me.updateProxy());

		me.storeProxy.loadPage(1);
	},
	//addProductItem: function(){
	//	var me = this;
	//	var win = Ext.create("Ext.window.Window", {
	//		width: 1000,
	//		height: 600,
	//		layout: "fit",
	//		autoHeight: true,
	//		autoScroll: true,
	//		title: "增加产品",
	//		border: false
	//	});
	//	win.add(Ext.create("Beet.apps.ProductsViewPort.AddProducts", {
	//		_editType: "add",
	//		callback: function(){
	//			win.close();
	//			me.storeProxy.loadPage(me.storeProxy.currentPage);
	//		}
	//	}));
	//	win.show();
	//},
	//editProductItem: function(parentMenu){
	//	var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
	//	var win = Ext.create("Ext.window.Window", {
	//		width: 1000,
	//		height: 600,
	//		layout: "fit",
	//		autoHeight: true,
	//		autoScroll: true,
	//		title: "增加产品",
	//		border: false
	//	});
	//	var config;
	//	if (pid && me.editable){
	//		win.setTitle("编辑 " + pname + " 资料");
	//		config = {
	//			_editType: "edit",
	//			callback: function(){
	//				win.close();
	//				me.storeProxy.loadPage(me.storeProxy.currentPage);
	//			}
	//		}
	//	}else{
	//		win.setTitle("查看 " + pname + " 资料");
	//		config = {
	//			_editType: "view",
	//			callback: function(){
	//				win.close();
	//				me.storeProxy.loadPage(me.storeProxy.currentPage);
	//			}
	//		}
	//	}
	//	var f = Ext.create("Beet.apps.ProductsViewPort.AddProducts", config);
	//	f.restoreFromData(rawData);
	//	win.add(f);
	//	win.doLayout();

	//	win.show();
	//},
	//deleteProductItem: function(parentMenu){
	//	var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
	//	if (pid){
	//		Ext.MessageBox.show({
	//			title: "删除产品",
	//			msg: "是否要删除产品 " + pname + " ? ", 
	//			buttons: Ext.MessageBox.YESNO,
	//			fn: function(btn){
	//				if (btn == "yes"){
	//					cardServer.DeleteProducts(pid, {
	//						success: function(succ){
	//							if (succ){
	//								Ext.MessageBox.show({
	//									title: "删除成功",
	//									msg: "删除产品: " + pname + " 成功",
	//									buttons: Ext.MessageBox.OK,
	//									fn: function(){
	//										me.storeProxy.loadPage(me.storeProxy.currentPage);
	//									}
	//								})
	//							}else{
	//								Ext.Error.raise("删除消费产品失败");
	//							}
	//						},
	//						failure: function(error){
	//							Ext.Error.raise(error);
	//						}
	//					})
	//				}
	//			}
	//		});
	//	}else{
	//		Ext.Error.raise("删除产品失败");
	//	}
	//}
});
