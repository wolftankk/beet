Ext.define("Beet.apps.ProductsViewPort.AddPackage",{
	extend: "Ext.form.Panel",
	height: "100%",
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedItems = {};
		me.selectedProducts = {};
		me.selectedPackages = {};

		me.count = {
			itemsCount : 0
		}

		me.callParent();	
		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: Beet.constants.VIEWPORT_HEIGHT - 100,
			width: "100%",
			cls: "iScroll",
			border: true,
			plain: true,
			collapsible: true,
			collapseDirection: "top",
			collapsed: true,
			bodyStyle: "background-color: #dfe8f5",
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

		me.itemsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "绑定项目",
			tbar: [{
				xtype: "button",
				text: "绑定项目",
				handler: function(){
					me.selectItems();
				}
			}]	
		}));
		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "绑定产品",
			tbar: [{
				xtype: "button",
				text: "产品",
				handler: function(){
					me.selectProducts();
				}
			}]	
		}));
		me.packagesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "绑定套餐",
			tbar: [{
				xtype: "button",
				text: "",
				handler: function(){
					//me.selectItems();
				}
			}]	
		}));

		me.childrenList = [
			me.itemsPanel,
			me.productsPanel,
			//me.packagesPanel
		]

		var config = {
			autoHeight: true,
			autoScroll: true,
			cls: "iScroll",
			height: "100%",
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			plain: true,
			items: [
				{
					layout: {
						type: 'hbox',
						align: 'stretch'
					},
					width: "100%",
					height: "100%",
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
							width: 320,
							border: false,
							bodyStyle: "background-color: #dfe8f5",
							bodyPadding: 5,
							defaults: {
								bodyStyle: "background-color: #dfe8f5",
								width: 300,
								listeners: {
									scope: me,
									blur: function(){
										me.onUpdateForm();
									}
								}
							},
							defaultType: "textfield",
							fieldDefaults: {
								msgTarget: "side",
								labelAlign: "top",
								labelWidth: 60
							},
							items: [
								{
									fieldLabel: "名称",
									allowBlank: false,
									name: "name"
								},
								{
									fieldLabel: "总价",
									allowBlank: false,
									name: "price"
								},
								{
									fieldLabel: "折扣",
									allowBlank: false,
									value: 1,
									name: "rate"
								},
								{
									fieldLabel: "折扣总价",
									allowBlank: false,
									name: "realprice",
									listeners: {
										scope: me,
										blur: function(){
											me.onUpdateForm(true);
										}
									}
								},
								{
									fieldLabel: "注释",
									xtype: "textarea",
									height: 100,
									width: 300,
									colspan: 2,
									cols: 2,
									allowBlank: true,
									name: "descript"
								},
								{
									text: "新增",
									xtype: "button",
									scale: "large",
									width: 100,
									border: 1,
									formBind: true,
									disabled: true,
									style: {
										borderColor: "#99BBE8"
									},
									border: 0,
									bodyStyle: "background-color: #dfe8f5",
									handler: function(){
										me.processData(this);
									}
								}
							]
						},
						{
							flex: 2,
							type: "fit",
							border: false,
							bodyStyle: "background-color: #dfe8f5",
							items: me.childrenList,
						}
					]
				}
			],
		};
		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		//update panel
		me.initializeItemsPanel();
		me.initializeProductsPanel();
	},
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
			tooltip: "删除消耗产品",
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
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						columns.push({
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						})
					}
				}
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
				height: Beet.constants.VIEWPORT_HEIGHT - 155,
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.itemsPanel.__columns	
			});

			me.itemsPanel.add(grid);
			me.itemsPanel.doLayout();
		}
	},
	selectItems: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择项目",
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
	addItems: function(records){
		var me = this, selectedItems = me.selectedItems;
		var __fields = me.itemsPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var id = record.get("IID");
			var rawData = record.raw;
			if (selectedItems[id] == undefined){
				selectedItems[id] = []
			}else{
				selectedItems[id] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedItems[id].push(rawData[k]);
			}
		}
		
		me.updateItemsPanel();
	},
	deleteItem: function(record){
		var me = this, selectedItems = me.selectedItems;
		var id = record.get("IID");
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
		var count = 0;
		//console.log(me.selectedItems)
		for (var c in selectedItems){
			count = count + parseFloat(selectedItems[c][5].replace(",", ""));
			tmp.push(selectedItems[c]);
		}
		store.loadData(tmp);
		//update
		me.count.itemsCount = count;
		me.form.getForm().setValues({"price" : (me.count.itemsCount)});
		me.onUpdateForm();
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
			header: "操作",
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
		cardServer.GetItemProductData(1,{
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.productsPanel.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						columns.push({
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						})
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
				height: Beet.constants.VIEWPORT_HEIGHT - 155,
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.productsPanel.__columns	
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

		me.updateProductsPanel();
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
	updateProductsPanel: function(){
		var me = this, selectedProducts = me.selectedProducts;
		var grid = me.productsPanel.grid, store = grid.getStore();
		var tmp = []
		for (var c in selectedProducts){
			tmp.push(selectedProducts[c]);
		}
		store.loadData(tmp);
	},

	//initializePackagePanel: function(){
	//	var me = this, cardServer = Beet.constants.cardServer;
	//	if (me.packagesPanel.__columns && me.packagesPanel.__columns.length > 0){
	//		return;
	//	}
	//	var columns = me.packagesPanel.__columns = [];
	//	var _actions = {
	//		xtype: 'actioncolumn',
	//		width: 30,
	//		header: "操作",
	//		items: [
	//		]
	//	}
	//	_actions.items.push("-",{
	//		icon: "./resources/themes/images/fam/delete.gif",
	//		tooltip: "删除套餐",
	//		id: "customer_grid_delete",
	//		handler: function(grid, rowIndex, colIndex){
	//			var d = grid.store.getAt(rowIndex)
	//			me.deletePackage(d);
	//		}
	//	}, "-");

	//	columns.push(_actions);
	//	cardServer.GetPackagesPageDataToJSON(0, 1, "", {
	//		success: function(data){
	//			var data = Ext.JSON.decode(data)["MetaData"];
	//			var fields = me.packagesPanel.__fields = [];
	//			for (var c in data){
	//				var meta = data[c];
	//				fields.push(meta["FieldName"])
	//				if (!meta["FieldHidden"]){
	//					columns.push({
	//						dataIndex: meta["FieldName"],
	//						header: meta["FieldLabel"],
	//						flex: 1,
	//					})
	//				}
	//			}
	//			me.initializePackageGrid();
	//		},
	//		failure: function(error){
	//			Ext.Error.raise(error);
	//		}
	//	});
	//},
	//initializePackageGrid: function(){
	//	var me = this, selectedPackages = me.selectedPackages;
	//	var __fields = me.packagesPanel.__fields;
	//	var store = Ext.create("Ext.data.ArrayStore", {
	//		fields: __fields
	//	})

	//	var grid = me.packagesPanel.grid = Ext.create("Ext.grid.Panel", {
	//		store: store,
	//		width: "100%",
	//		height: "100%",
	//		cls: "iScroll",
	//		autoScroll: true,
	//		columnLines: true,
	//		columns: me.packagesPanel.__columns
	//	});

	//	me.packagesPanel.add(grid);
	//	me.packagesPanel.doLayout();
	//	me.queue.triggle("initPackagepanel", "success");
	//},
	//selectPackage: function(){
	//	var me = this, cardServer = Beet.constants.cardServer;
	//	var config = {
	//		extend: "Ext.window.Window",
	//		title: "选择套餐",
	//		width: 1100,
	//		height: 640,
	//		autoScroll: true,
	//		autoHeight: true,
	//		layout: "fit",
	//		resizable: true,
	//		border: false,
	//		modal: true,
	//		maximizable: true,
	//		border: 0,
	//		bodyBorder: false,
	//		editable: false
	//	}
	//	var win = Ext.create("Ext.window.Window", config);
	//	win.show();

	//	win.add(Ext.create("Beet.apps.ProductsViewPort.PackageList", {
	//		b_type: "selection",
	//		b_selectionMode: "MULTI",
	//		b_selectionCallback: function(records){
	//			if (records.length == 0){ win.close(); return;}
	//			me.addPackage(records);
	//			win.close();
	//		}
	//	}));
	//	win.doLayout();
	//},
	//addPackage: function(records, isRaw){
	//	var me = this, selectedPackages = me.selectedPackages;
	//	var __fields = me.packagesPanel.__fields;
	//	if (records == undefined){
	//		return;
	//	}
	//	for (var r = 0; r < records.length; ++r){
	//		var record = records[r];
	//		var rid, rawData;
	//		if (isRaw){
	//			rid = record["ID"];
	//			rawData = record;
	//		}else{
	//			rid = record.get("ID");
	//			rawData = record.raw;
	//		}
	//		if (selectedPackages[rid] == undefined){
	//			selectedPackages[rid] = []
	//		}else{
	//			selectedPackages[cid] = [];
	//		}
	//		for (var c = 0; c < __fields.length; ++c){
	//			var k = __fields[c];
	//			selectedPackages[rid].push(rawData[k]);
	//		}
	//	}

	//	me.updatePackagesPanel();
	//},
	//deletePackage: function(record){
	//	var me = this, selectedPackages = me.selectedPackages;
	//	var rid = record.get("ID");
	//	if (selectedPackages[rid]){
	//		selectedPackages[rid] = null;
	//		delete selectedPackages[rid];
	//	}

	//	me.updatePackagesPanel();
	//},
	//updatePackagesPanel: function(){
	//	var me = this, selectedPackages = me.selectedPackages;
	//	var grid = me.packagesPanel.grid, store = grid.getStore();
	//	var __fields = me.packagesPanel.__fields;
	//	var tmp = []
	//	me._par.packages = 0;
	//	me._real.packages = 0;
	//	for (var c in selectedPackages){
	//		var package = selectedPackages[c];
	//		tmp.push(selectedPackages[c]);
	//	}
	//	store.loadData(tmp);
	//},

	resetAll: function(){
		var me = this;
		//reset all
		me.selectedItems = {};
		me.selectedProducts = {};
		me.selectedPackages = {};
		me.count = {
			itemsCount : 0
		}

		me.itemsPanel.grid.getStore().loadData([]);
	},
	onUpdateForm: function(force){
		var me = this, form = me.form.getForm(), values = form.getValues();
		var sale = values["rate"], price = values["price"], realprice = values["realprice"];
		if (price <= 0 ) { return; }	
		if (force) {
			sale = realprice / price;
		}else{
			realprice = price * sale;
		}
		form.setValues({
			rate: parseFloat(sale).toFixed(2),
			realprice: parseFloat(realprice).toFixed(2)
		});
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), result = form.getValues();
		var selectedItems = me.selectedItems;
		me.onUpdateForm(true);

		//name descript products charges
		var items = Ext.Object.getKeys(selectedItems);
		
		if (items && items.length > 0){
			result["items"] = items;
		}

		cardServer.AddPackage(Ext.JSON.encode(result), {
			success: function(pid){
				if (pid > 0){
					Ext.MessageBox.show({
						title: "提示",
						msg: "添加套餐成功!",
						buttons: Ext.MessageBox.YESNO,
						fn: function(btn){
							if (btn == "yes"){
								form.reset()
								me.resetAll();
							}
						}
					});
				}
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		})
	}
});




Ext.define("Beet.apps.ProductsViewPort.PackageList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	bodyPadding: 0,
	bodyBorder: false,
	plain: true,
	b_filter: "",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		me.selectedItems = {};
		me.selectedProducts = {};
		me.selectedPackages = {};
		//me.packageList = {};//save store fields columns and grid
		//me.packageList.cache = {};//cache itemdata

		me.selectedPackageId= 0;
		me.selectedPackageIndex = 0;

		me.callParent()	

		me.buildStoreAndModel();
	},
	buildStoreAndModel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		//创建树形
		if (!Beet.apps.ProductsViewPort.PackageTreeStore){
			me.createPackageTreeStore();
		}
		me.storeProxy = store = Ext.create("Beet.apps.ProductsViewPort.PackageTreeStore");

		var sm = null;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			bodyStyle: "background-color: #fff",
			frame: true,
			lookMask: true,
			selModel: sm,
			cls: "iScroll",
			collapsible: true,
			collapseDirection: "left",
			width: 230,
			height: Beet.constants.VIEWPORT_HEIGHT - 50,
			border: 0,
			useArrow: true,
			title: "套餐列表",
			split: true,
			tbar: [
				{
					xtype: "button",
					text: "卷起",
					border: 1,
					style: {
						borderColor: "#99BBE8"
					},
					handler: function(){
						return me.treeList.collapseAll();
					}
				},
				{
					xtype: "button",
					text: "展开",
					border: 1,
					style: {
						borderColor: "#99BBE8"
					},
					handler: function(){
						return me.treeList.expandAll();
					}
				},
				{
					xtype: "button",
					border: 1,
					style: {
						borderColor: "#99BBE8"
					},
					text: "增加",
					handler: function(){
						me.addPackageWindow();
					},
				},
				{
					xtype: "button",
					border: 1,
					style: {
						borderColor: "#99BBE8"
					},
					text: "删除",
					handler: function(){
						var list = me.treeList.selModel.getSelection();
						if (list && list.length > 0){
							var r = list[0];
							if (r.get("id") == "-1"){
								Ext.Msg.alert("失败", "无法删除根目录");
								return;
							}
							me.deletePackage(r)
						}else{
							Ext.Msg.alert("失败", "请选择需要删除的套餐");
						}
					}
				}
			],
			bbar: [
				"->",
				{
					xtype: "button",
					text: "确定",
					hidden: (me.b_type != "selection")
				},
				{
					xtype: "button",
					text: "取消",
					hidden: (me.b_type != "selection")
				}
			]
		});
		me.treeList.addListener({
			collapse: function(p){
				if (p && p.collapsed && p.reExpander){
					var reExpander = p.reExpander;
					setTimeout(function(){
						reExpander.el.applyStyles({top: 0, left: 0});
						reExpander.setHeight(me.getHeight())
					}, 50);
				}
			},
			itemclick: function(){
			},
			itemdblclick: function(frame, record, item, index, e, options){
				me.treeListRClick(frame, record, item, index, e, options);
			},
			beforeitemcontextmenu: function(frame, record, item, index, e, options){
				me.treeListRClick(frame, record, item, index, e, options);
			}
		});

		me.createMainPanel()	
	},
	treeListRClick: function(frame, record, item, index, e, options){
		var isLeaf = record.isLeaf(), me = this;
		if (!record.contextMenu){
			var menu = [];
			if (record.get("id") == "-1") { return false; }
			menu = [
				{text: "查看详情", handler: function(direction, e){
					me.onSelectItem(record.raw["ID"], record)
				}},
				{text: "增加", handler: function(direction, e){
					me.addPackageWindow();	
				}},
				{text: "删除", handler: function(direction, e){
					me.deletePackage(record)
				}},
			]

			record.contextMenu = Ext.create("Ext.menu.Menu", {
				style: {
				   overflow: 'visible',
				},
				plain: true,
				items: menu,
				raw : record,
				leaf: isLeaf
			});
		}
		e.stopEvent();
		record.contextMenu.showAt(e.getXY());
		return false;
	},
	createPackageTreeStore: function(){
		Ext.define("Beet.apps.ProductsViewPort.PackageTreeStore", {
			extend: "Ext.data.TreeStore",
			autoLoad: true,
			root: {
				text: "总分类",
				id: "-1",
				expanded: true
			},
			proxy: {
				type: "b_proxy",
				b_method: Beet.constants.cardServer.GetPackageTreeData,
				preProcessData: function(data){
					var originData = data["root"];
					var bucket = [];
					var me = this;
					me.categoryList = [];
					
					var processData = function(target, cache, pid){
						var k;
						for (k = 0; k < target.length; ++k){
							var _tmp = target[k];
							var item = {};
							if (_tmp.data && _tmp.data.length > 0){
								item["expanded"] = false;
								item["text"] = _tmp["name"];
								item["id"] = _tmp["id"];
								item["ID"] = _tmp["id"];
								item["Name"] = _tmp["name"];
								item["pid"] = pid;
								item["children"] = [];

								processData(_tmp.data, item["children"], item["id"]);
							}else{
								item = _tmp;
								item["text"] = _tmp["name"];
								item["leaf"] = true;
								item["pid"] = pid;
								item["ID"] = _tmp["id"];
								item["Name"] = _tmp["name"];
								//item["checked"] = false;
							}
							cache.push(item);
							me.categoryList.push({
								id: _tmp["id"],
								text: _tmp["name"],
								ID : _tmp["id"],
								Name : _tmp["name"]
							})
						}
					}

					//console.log(originData);
					processData(originData, bucket, -1);

					return bucket;
				},
				b_scope: Beet.constants.cardServer,
				reader: {
					type: "json"	
				}
			},
		});
	},
	addPackageWindow: function(){
		var me = this;
		var win = Ext.create("Ext.window.Window", {
			width: 1000,
			height: 630,
			layout: "fit",
			autoHeight: true,
			autoScroll: true,
			title: "增加套餐",
			border: false
		});
		win.add(Ext.create("Beet.apps.ProductsViewPort.AddPackage", {
			_editType: "add",
			callback: function(){
				win.close();
				me.storeProxy.loadPage(me.storeProxy.currentPage);
			}
		}));
		win.show();
	},
	deletePackage: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		var itemId = record.get("ID") || record.raw["ID"], itemName = record.get("Name") || record.raw["Name"];
		if (itemId){
			Ext.MessageBox.show({
				title: "删除套餐",
				msg: "是否要删除 " + itemName + " ?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeletePackage(itemId, {
							success: function(){
								Ext.MessageBox.show({
									title: "删除成功",
									msg: "删除套餐: " + itemName + " 成功",
									buttons: Ext.MessageBox.OK,
									fn: function(){
										me.selectedItems= {};
										me.selectedChargeType = {};
										me.updateItemsPanel();
										me.updateChargeTypePanel();
										me.packageList.store.loadPage(me.packageList.store.currentPage);
										me.form.getForm().reset();
										if (me.packageList.cache[itemId]){
											me.packageList.cache[itemId] = {};
											delete me.packageList.cache[itemId];
										}
									}
								})
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						})
					}
				}
			});
		
		}else{
			Ext.Error.raise("删除套餐失败");
		}
	},
	
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: 300,
			width: "100%",
			cls: "iScroll",
			collapsible: true,
			collapsed: true,
			border: true,
			plain: true,
			bodyStyle: "background-color: #dfe8f5",
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
						p.setHeight(300);//reset && update
					}
				}
			}
		}

		me.itemsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "项目列表",
			tbar: [{
				xtype: "button",
				text: "绑定项目",
				handler: function(){
					me.selectItems();
				}
			}]	
		}));

		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "产品列表",
			tbar: [{
				xtype: "button",
				text: "绑定产品",
				handler: function(){
					//me.selectItems();
				}
			}]	
		}));

		me.packagesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "套餐列表",
			tbar: [{
				xtype: "button",
				text: "绑定套餐",
				handler: function(){
					//me.selectItems();
				}
			}]	
		}));

		me.childrenList = [
			me.itemsPanel,
			me.productsPanel,
			me.packagesPanel
		]

		var config = {
			autoHeight: true,
			autoScroll: true,
			cls: "iScroll",
			height: "100%",
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			plain: true,
			bodyPadding: 0,
			bodyStyle: "background-color: #dfe8f5",
			items: [
				{
					layout: {
						type: "hbox",
						align: "stretch"
					},
					height: "100%",
					autoHeight: true,
					autoScroll: true,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						border: false
					},
					items:[
						me.treeList,
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							bodyStyle: "background-color: #dfe8f5",
							height: "100%",
							flex: 2,
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
										margin: "5 0 0 5",
										listeners: {
											scope: me,
											blur: function(){
												me.onUpdateForm();
											}
										}
									},
									defaultType: "textfield",
									fieldDefaults: {
										msgTarget: "side",
										labelAlign: "top",
										labelWidth: 60
									},
									items: [
										{
											fieldLabel: "名称",
											allowBlank: false,
											name: "name"
										},
										{
											fieldLabel: "总价",
											allowBlank: false,
											name: "price"
										},
										{
											fieldLabel: "折扣",
											allowBlank: false,
											name: "rate"
										},
										{
											fieldLabel: "折扣总价",
											allowBlank: false,
											name: "realprice",
											listeners: {
												scope: me,
												blur: function(){
													me.onUpdateForm(true);
												}
											}
										},
										{
											fieldLabel: "注释",
											colspan: 2,
											width: 620,
											allowBlank: true,
											name: "descript"
										}	
									]
								},
								{
									type: "fit",
									autoScroll: true,
									autoHeight: true,
									border: false,
									bodyStyle: "background-color: #dfe8f5;margin-top: 10px",
									height: Beet.constants.VIEWPORT_HEIGHT - 70,
									width: Beet.constants.WORKSPACE_WIDTH - 240,
									items: me.childrenList, 
									bbar:[
										"->",
										(function(){
											var b = {};
											if (me.b_type == "selection"){
												b = {
													text: "确定",
													xtype: "button",
													border: 1,
													style: {
														borderColor: "#99BBE8"
													},
													bodyStyle: "background-color: #dfe8f5",
													handler: function(){
														if (me.b_selectionCallback){
															me.b_selectionCallback(me.selModel.getSelection());
														}
													}
												}
											}else{
												b = {
													text: "提交",
													xtype: "button",
													border: 1,
													width: 200,
													style: {
														borderColor: "#99BBE8"
													},
													bodyStyle: "background-color: #dfe8f5",
													handler: function(){
														me.processData(this);
													}
												}
											}
											return b;
										})()
									]
								}
							],
						},
					]
				}
			],
		};
		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		me.initializeItemsPanel();
	},
	initializeItemsPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
			return;
		}
		var columns = me.itemsPanel.__columns = [];
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
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						columns.push({
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							flex: 1
						})
					}
				}
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
				height: 245,
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.itemsPanel.__columns	
			});

			me.itemsPanel.add(grid);
			me.itemsPanel.doLayout();
		}
	},
	selectItems: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择项目",
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
			var id, rawData;
			if (isRaw){
				id = record["IID"];
				rawData = record;
			}else{
				id = record.get("IID");
				rawData = record.raw;
			}
			if (selectedItems[id] == undefined){
				selectedItems[id] = []
			}else{
				selectedItems[id] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedItems[id].push(rawData[k]);
			}
		}
		me.updateItemsPanel();
	},
	deleteItem: function(record){
		var me = this, selectedItems = me.selectedItems;
		var id = record.get("IID");
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
			tmp.push(selectedItems[c]);
		}
		store.loadData(tmp);
	},

	onSelectItem: function(pid, record){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedItems = {};//reset

		me.selectedPackageId = pid;
		me.selectedPackageIndex = record.get("index");

		if (pid <= 0){
			Ext.Msg.alert("错误", "项目ID非法!");
			return;
		}
		
		//if (!me.queue) {
		//	me.queue = new Beet_Queue("bPackageQueue_" + Math.random());
		//	console.log(me.queue);
		//}else{
		//	me.queue.reset();
		//}

		cardServer.GetPackagesPageDataToJSON(0, 1, "ID=" + pid, {
			success: function(data){
				data = Ext.JSON.decode(data);
				data = data["Data"];
				if (data && data.length > 0){
					data = data[0];
					me.form.getForm().setValues({
						name:		data["Name"],
						price:		data["PPrice"].replace(",", ""),
						rate:		data["PRate"],
						realprice:	data["PRealPrice"].replace(",", ""),
						descript:	data["Descript"]
					});

					cardServer.GetPackagesItems(pid, {
						success: function(data){
							data = Ext.JSON.decode(data)["items"];
							var sql = [];
							for (var c = 0; c < data.length; ++c){
								sql.push("iid=" + data[c]);
							}
							var s = sql.join(" OR ");
							if (s.length > 0){
								cardServer.GetItemPageData(1, 1000000, s, {
									success: function(data){
										var data = Ext.JSON.decode(data)["Data"];
										me.packageList.cache[pid].items= data;
										me.addItems(data, true);
										me.itemsPanel.expand();
									},
									failure: function(error){
										Ext.Error.raise(error)
									}
								});
							}
						},
						failure: function(error){
							Ext.Error.raise(error);
						}
					});

					cardServer.GetPackageProducts(pid, {
						success: function(data){
							console.log(data)	
						},
						failure: function(error){
							Ext.Error.raise(error)
						}
					});
				}else{
					return;
				}
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		})	
	},

	//自动计算部分代码
	onUpdateForm: function(force){
		var me = this, form = me.form.getForm(), values = form.getValues();
		var sale = values["rate"], price = values["price"], realprice = values["realprice"];
		if (price <= 0 ) { return; }	
		if (force) {
			sale = realprice / price;
		}else{
			realprice = price * sale;
		}
		form.setValues({
			rate: parseFloat(sale).toFixed(2),
			realprice: parseFloat(realprice).toFixed(2),
		});
	},

	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		me.onUpdateForm();
		var form = f.up("form").getForm(), result = form.getValues();
		var selectedItems = me.selectedItems;
		if (me.selectedPackageId< 0){
			Ext.MessageBox.alert("oops", "没有套餐ID, 无法更新");
			return;
		}

		//name descript products charges
		var items = Ext.Object.getKeys(selectedItems);

		if (items && items.length > 0){
			result["items"] = items;
		}

		result["id"] = me.selectedPackageId;

		cardServer.UpdatePackage(Ext.JSON.encode(result), {
			success: function(succ){
				if (succ){
					Ext.MessageBox.show({
						title: "提示",
						msg: "更新项目成功!",
						buttons: Ext.MessageBox.OK,
						fn: function(btn){
							me.selectedItems= {};
							me.updateItemsPanel();
							if (me.packageList.cache[me.selectedPackageId]){
								me.packageList.cache[me.selectedPackageId] = {};
								delete me.packageList.cache[me.selectedPackageId];
							}
							me.packageList.store.loadPage(me.packageList.store.currentPage);
						}
					});
				}else{
					Ext.Msg.alert("警告", "更新产品失败!!");
				}
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		})
	}
});
