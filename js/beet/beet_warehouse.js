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
							text: "出入历史",
							handler: function(){
							}
						},
					]
				}
			]
		}
	]
});

Ext.ns("Beet.apps.WarehouseViewPort");

//0 正在入库 -1 已入库 1 正在出库 -2 已出库
//
Ext.define("Beet.apps.WarehouseViewPort.ProductsList", {
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
	b_filter: '',
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			me.editable = false;
		}else{
			me.editable = true;
		}
		
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
		var me = this, cardServer = Beet.constants.cardServer;

		cardServer.GetProductPageData(0, 1, "", {
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
		
		if (!Ext.isDefined(Beet.apps.ProductsViewPort.ProductsModel)){
			Ext.define("Beet.apps.ProductsViewPort.ProductsModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Ext.isDefined(Beet.apps.ProductsViewPort.ProductsStore)){
			Ext.define("Beet.apps.ProductsViewPort.ProductsStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.ProductsViewPort.ProductsModel,
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
		var me = this, cardServer = Beet.constants.cardServer;
		return {
			type: "b_proxy",
			b_method: cardServer.GetProductPageData,
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
			storeProxy: Ext.create("Beet.apps.ProductsViewPort.ProductsStore")
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
					me.editProductItem(d);
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
					me.deleteProductItem(d);
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
					xtype: "button",
					text: "高级搜索",
					handler: function(){
						var cardServer = Beet.constants.cardServer;
						cardServer.GetProductPageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.filterProducts();
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
					text: "增加产品",
					handler: function(){
						me.addProductItem();
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
		var me = this, cardServer = Beet.constants.cardServer;
		me.storeProxy.setProxy(me.updateProxy());

		me.storeProxy.loadPage(1);
	},
	addProductItem: function(){
		var me = this;
		var win = Ext.create("Ext.window.Window", {
			width: 1000,
			height: 600,
			layout: "fit",
			autoHeight: true,
			autoScroll: true,
			title: "增加产品",
			border: false
		});
		win.add(Ext.create("Beet.apps.ProductsViewPort.AddProducts", {
			_editType: "add",
			callback: function(){
				win.close();
				me.storeProxy.loadPage(me.storeProxy.currentPage);
			}
		}));
		win.show();
	},
	editProductItem: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
		var win = Ext.create("Ext.window.Window", {
			width: 1000,
			height: 600,
			layout: "fit",
			autoHeight: true,
			autoScroll: true,
			title: "增加产品",
			border: false
		});
		var config;
		if (pid && me.editable){
			win.setTitle("编辑 " + pname + " 资料");
			config = {
				_editType: "edit",
				callback: function(){
					win.close();
					me.storeProxy.loadPage(me.storeProxy.currentPage);
				}
			}
		}else{
			win.setTitle("查看 " + pname + " 资料");
			config = {
				_editType: "view",
				callback: function(){
					win.close();
					me.storeProxy.loadPage(me.storeProxy.currentPage);
				}
			}
		}
		var f = Ext.create("Beet.apps.ProductsViewPort.AddProducts", config);
		f.restoreFromData(rawData);
		win.add(f);
		win.doLayout();

		win.show();
	},
	deleteProductItem: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
		if (pid){
			Ext.MessageBox.show({
				title: "删除产品",
				msg: "是否要删除产品 " + pname + " ? ", 
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeleteProducts(pid, {
							success: function(succ){
								if (succ){
									Ext.MessageBox.show({
										title: "删除成功",
										msg: "删除产品: " + pname + " 成功",
										buttons: Ext.MessageBox.OK,
										fn: function(){
											me.storeProxy.loadPage(me.storeProxy.currentPage);
										}
									})
								}else{
									Ext.Error.raise("删除消费产品失败");
								}
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						})
					}
				}
			});
		}else{
			Ext.Error.raise("删除产品失败");
		}
	}
});
