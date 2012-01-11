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
		me.selectedPackages = [];

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
		me.storeProxy = Ext.create("Beet.apps.ProductsViewPort.PackageTreeStore");

		me.createTreePanel();

		me.createMainPanel()	
	},
	createTreePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var sm = null;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: me.storeProxy,
			bodyStyle: "background-color: #fff",
			frame: true,
			lookMask: true,
			selModel: sm,
			//multiSelect: true,
			cls: "iScroll",
			collapsible: true,
			collapseDirection: "left",
			width: 240,
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
						var list = me.treeList.selModel.getSelection();
						if (list && list.length > 0){
							var r = list[0];
							me.addPackageWindow(r.get("ID") || r.raw["ID"], r)
						}else{
							me.addPackageWindow();
						}
					},
				},
				{
					xtype: "button",
					border: 1,
					style: {
						borderColor: "#99BBE8"
					},
					text: "编辑",
					handler: function(){
						var list = me.treeList.selModel.getSelection();
						if (list && list.length > 0){
							var r = list[0];
							if (r.get("id") == "-1"){
								Ext.Msg.alert("失败", "无法删除根目录");
								return;
							}
							me.onSelectItem(r.get("ID") || r.raw["ID"], r)
						}else{
							Ext.Msg.alert("失败", "请选择需要删除的套餐");
						}
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
				},
				{
					xtype: "button",
					border: 1,
					style: {
						borderColor: "#99BBE8"
					},
					text: "批量",
					tooltip: "批量修改",
					handler: function(){
						var list = me.treeList.selModel.getSelection();
						if (list.length == 1){
							var record = list[0];
							if (parseInt(record.get("id")) == -1){
								Ext.MessageBox.alert("警告", "修改失败, 你不能选择>总分类<")
								return;
							}
						}
						if (list.length <= 0){
							Ext.MessageBox.alert("警告", "请选择需要修改的套餐")
							return;
						}
						Ext.MessageBox.prompt(
							"批量修改",
							"批量修改套餐折扣",
							function(btn, value, opts){
								if (btn == "ok"){
									if (list.length == 1){
										var record = list[0];
										if (parseInt(record.get("id")) == -1){
											Ext.MessageBox.alert("警告", "修改失败, 你不能选择>总分类<")
											return;
										}else{
											cardServer.BatchEditPackageRate(parseInt(record.get("id")), parseFloat(value), {
												success: function(succ){
													console.log(succ)	
												},
												failure: function(error){
													Ext.Error.raise(error);
												}
											})
										}
									}
								}
							}
						)
					}
				},
			],
			bbar: [
				"->",
				{
					xtype: "button",
					text: "确定",
					hidden: (me.b_type != "selection"),
					handler: function(){
						if (me.b_selectionCallback){
							me.b_selectionCallback(me.treeList.selModel.getSelection());
						}
					},
				},
				{
					xtype: "button",
					text: "取消",
					hidden: (me.b_type != "selection"),
					handler: function(){
						if (me.b_selectionCallback){
							me.b_selectionCallback([])
						}
					},
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
	addPackageWindow: function(pid, record){
		var me = this;
		//Ext.Msg.alert("通知", "你进入了套餐添加的模式");
		me.resetAll();
		var addBtn = me.form.down("button[name=packageNewBtn]");

		if (pid){
			me.selectedPackages = [record];
			me.form.getForm().setValues({
				_packageName: record.get("text") || record.raw["name"]	
			})
		}
		
		if 	(addBtn) {
			addBtn.enable();
		}
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
					me.selectProducts();
				}
			}]	
		}));

		me.childrenList = [
			me.itemsPanel,
			me.productsPanel
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
											name: "rate",
											value: 1.00
										},
										{
											fieldLabel: "套餐售价",
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
											xtype: "combobox",
											fieldLabel: "所属父类",
											store:new Ext.data.SimpleStore({fields:[],data:[[]]}),   
											editable:false, 
											name: "_packageName",
											mode: 'local',   
											triggerAction:'all',   
											maxHeight: 200,   
											tpl: "<tpl for='.'><div style='height:200px'><div id='innerTree'></div></div></tpl>",   
											selectedClass:'',   
											onSelect:Ext.emptyFn,
											listeners: {
												expand: function(f){
													console.log("treelist expand");
													var that = this;
													f.setValue = function(value){
														var that = this, inputId = f.getInputId(), inputEl = that.inputEl;
														inputEl.dom.value = value
													}
													if (!me.innerTreeList){
														var store = f.store = Ext.create("Beet.apps.ProductsViewPort.PackageTreeStore", {
															autoLoad: false	
														})
														me.innerTreeList = new Ext.tree.TreePanel({
															store: store,
															layout: "fit",
															bodyStyle: "background-color: #fff",
															frame: false,
															lookMask: true,
															//selModel: sm,
															cls: "iScroll",
															border: 0,
															autoScroll: true,
															height: 200,
															useArrow: true,
															split: true,
															listeners: {
																itemclick: function(grid, record){
																	//首先要获取原始的数据
																	//console.log("itemClick", record)
																	me.selectedPackages = [
																		record
																	];
																	//f.value = record.raw["name"];
																	f.setValue(record.get("text") || record.raw["name"])
																}
															}
														});
													};
													me.innerTreeList.render("innerTree");
												}
											}
										},
										{
											xtype: "component",
											width: 5
										},
										{
											fieldLabel: "注释",
											colspan: 3,
											width: 600,
											height: 40,
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
									height: Beet.constants.VIEWPORT_HEIGHT - 115,
									width: Beet.constants.WORKSPACE_WIDTH - 250,
									items: me.childrenList, 
									bbar:[
										"->",
										(function(){
											var b = {};
											if (me.b_type == "selection"){
											}else{
												b = [
													{
														text: "新增",
														xtype: "button",
														name: "packageNewBtn",
														border: 1,
														width: 200,
														style: {
															borderColor: "#99BBE8"
														},
														disabled: true,
														bodyStyle: "background-color: #dfe8f5",
														handler: function(){
															me.processData(this, "add");
														}
													},
													{
														text: "编辑",
														xtype: "button",
														name: "packageEditBtn",
														border: 1,
														width: 200,
														style: {
															borderColor: "#99BBE8"
														},
														disabled: true,
														bodyStyle: "background-color: #dfe8f5",
														handler: function(){
															me.processData(this, "edit");
														}
													},
												]
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
		cardServer.GetPackageProductData(1,{
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
								type: "float"
							}
						}
						columns.push(c)
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
				height: 245,
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
									if (price){ price = parseFloat(price.replaceAll(",", "")); }
									currRecord.set("PRICE", Ext.Number.toFixed(price * count, 2));
									currRecord.set("COUNT", Ext.Number.toFixed(count, 6));

									me.onUpdateForm();	
								}else{
									if (currField == "PRICE" && currPrice && currPrice > 0){
										me.onUpdateForm();	
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
		me.onUpdateForm();
	},

	onSelectItem: function(pid, record){
		var me = this, cardServer = Beet.constants.cardServer;
		me.resetAll();

		me.selectedPackageId = pid;
		me.selectedPackageIndex = record.get("index");

		if (pid <= 0){
			Ext.Msg.alert("错误", "项目ID非法!");
			return;
		}

		var editBtn = me.form.down("button[name=packageEditBtn]");
		if (editBtn){
			editBtn.enable();
		}
		
		cardServer.GetPackagesPageDataToJSON(0, 1, "ID=" + pid, {
			success: function(data){
				data = Ext.JSON.decode(data);
				data = data["Data"];
				if (data && data.length > 0){
					data = data[0];
					console.debug("Package", data);
					me.form.getForm().setValues({
						name:		data["Name"],
						price:		data["PPrice"].replace(",", ""),
						rate:		data["PRate"],
						realprice:	data["PRealPrice"].replace(",", ""),
						descript:	data["Descript"],
						_packageName: data["ParentName"]
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
							data = Ext.JSON.decode(data)["products"];
							var sql = [];
							for (var c = 0; c < data.length; ++c){
								sql.push("pid=" + data[c]);
							}
							var s = sql.join(" OR ");
							if (s.length > 0){
								cardServer.GetProductPageData(1, data.length, s, {
									success: function(data){
										var data = Ext.JSON.decode(data)["Data"];
										me.addProducts(data, true);
										//me.productsPanel.expand();
									},
									failure: function(error){
										Ext.Error.raise(error)
									}
								});
							}
						},
						failure: function(error){
							Ext.Error.raise(error)
						}
					});

					//find selectedPackages
					if (data["ParentID"]){
						var store = me.storeProxy.tree.root.store;
						//console.log(store);
						for (var c = 0; c < store.getCount(); ++c){
							r = store.getAt(c);
							if (parseInt(r.get("id")) == data["ParentID"]){
								me.selectedPackages = [r];
							}
						}
					}
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
		var selectedProducts = me.selectedProducts, selectedItems = me.selectedItems;
		if (price == '' || price == undefined || price == 0 ){
		var __price = 0;//每次都会进行重新计算
		if (selectedProducts && Ext.Object.getKeys(selectedProducts).length > 0){
			var productstore = me.productsPanel.grid.getStore();
			for (var c = 0; c < productstore.getCount(); ++c){
				var data = productstore.getAt(c);
				var count = data.get("COUNT"), price = data.get("PRICE");
				if (count != undefined && price != undefined){
					__price += parseFloat(price);
				}
			}
		}

		if (selectedItems && Ext.Object.getKeys(selectedItems).length> 0){
			for (var c in selectedItems){
				var p = selectedItems[c];
				//console.log(p)
				__price += parseFloat((""+p[3]).replaceAll(",", ""), 2)
			}
		}
		price = __price;

		form.setValues({
			price: price	
		})
		}
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

	resetAll: function(){
		var me = this;
		me.selectedItems = {};
		me.selectedProducts = {};
		me.selectedPackages = {};

		me.selectedPackageId= 0;
		me.selectedPackageIndex = 0;

		me.form.getForm().reset();

		var editBtn = me.form.down("button[name=packageEditBtn]"),
			addBtn = me.form.down("button[name=packageNewBtn]");

		if (editBtn){
			editBtn.disable();
		}

		if (addBtn){
			addBtn.disable();
		}

		me.updateItemsPanel();
		me.updateProductsPanel();
		
	},
	/**
	 * @description 处理所提交的数据
	 *
	 * @param action String 需要处理的动作(add, edit)
	 */
	processData: function(f, action){
		var me = this, cardServer = Beet.constants.cardServer;
		me.onUpdateForm();
		var form = f.up("form").getForm(), result = form.getValues();

		var selectedItems = me.selectedItems;
		//name descript products charges
		var items = Ext.Object.getKeys(selectedItems);
		if (items && items.length > 0){
			result["items"] = items;
		}
	
		var selectedProducts = me.selectedProducts;
		var products = Ext.Object.getKeys(selectedProducts);
		if (products && products.length > 0){
			result["products"] = products;
		}

		var selectedPackages = me.selectedPackages;
		if (selectedPackages && selectedPackages.length > 0){
			result["parentid"] = selectedPackages.shift().get("id");
		}

		if (action == "edit"){
			if (me.selectedPackageId< 0){
				Ext.MessageBox.alert("oops", "没有套餐ID, 无法更新");
				return;
			}
			result["id"] = me.selectedPackageId;
		}
		
		if (action == "add"){
			cardServer.AddPackage(Ext.JSON.encode(result), {
				success: function(pid){
					if (pid > 0){
						Ext.MessageBox.show({
							title: "提示",
							msg: "添加套餐成功!",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									me.resetAll();
									//reload 
									me.storeProxy.load();
								}
							}
						});
					}else{
						Ext.MessageBox.alert("失败", "添加套餐失败!");
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			});
		}else{
			if (action == "edit"){
				console.log(result)
				cardServer.UpdatePackage(Ext.JSON.encode(result), {
					success: function(succ){
						if (succ){
							Ext.MessageBox.show({
								title: "提示",
								msg: "更新项目成功!",
								buttons: Ext.MessageBox.OK,
								fn: function(btn){
									me.storeProxy.load();
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
		}

	}
});
