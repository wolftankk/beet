registerBeetAppsMenu("card", {
	title: "卡项管理",
	items: [
		{
			xtype: "container",
			layout: "hbox",
			defaultType: "buttongroup",
			defaults:{
				height: 100,
				width: 250
			},
			items: [
				{
					title: '卡项管理',
					layout: "anchor",
					width: 300,
					defaults: {
						scale: "large",
						rowspan: 1
					},
					items: [
						{
							text: "增加卡项",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["addCard"]
								if (!item){
									Beet.workspace.addPanel("addCard", "增加卡项", {
										items: [
											Ext.create("Beet.apps.ProductsViewPort.AddCard")
										]
									})
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						},
						{
							text: "编辑卡项",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["cardList"]
								if (!item){
									Beet.workspace.addPanel("cardList", "编辑卡项", {
										items: [
											Ext.create("Beet.apps.ProductsViewPort.CardList")
										]
									})
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


Ext.namespace("Beet.apps.ProductsViewPort");

function buildCategoryTreeStore(){
	if (!Beet.apps.ProductsViewPort.CatgoryTreeStore){
		Ext.define("Beet.apps.ProductsViewPort.CatgoryTreeStore", {
			extend: "Ext.data.TreeStore",
			autoLoad: true,
			root: {
				text: "总分类",
				id: "-1",
				expanded: true
			},
			proxy: {
				type: "b_proxy",
				b_method: Beet.constants.cardServer.GetCategoryData,
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
								item["pid"] = pid;
								item["children"] = [];

								processData(_tmp.data, item["children"], item["id"]);
							}else{
								item = _tmp;
								item["text"] = _tmp["name"];
								item["leaf"] = true;
								item["pid"] = pid;
								//item["checked"] = false;
							}
							cache.push(item);
							me.categoryList.push({
								id: _tmp["id"],
								text: _tmp["name"]      
							})
						}
					}

					processData(originData, bucket, -1);

					return bucket;
				},
				b_scope: Beet.constants.cardServer,
				reader: {
					type: "json"	
				}
			},
		})
	}
}

Ext.define("Beet.apps.ProductsViewPort.AddProducts", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
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
		var me = this, cardServer = Beet.constants.cardServer;
	
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
		
		Ext.bind(createCategoryTree, me)();
		me.createTreeList();

		me.updateTreeListEvent(true)
		me.treeList.on({
			itemclick: me.treeItemClick,
			scope: me
		})
		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		var config = {
			autoHeight: true,
			autoScroll: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5",
			bodyPadding: 5,
			items: [
				{
					layout: {
						type: "table",
						columns: 2,
						tableAttrs: {
							cellspacing: 10,
							style: {
								width: "100%"
							}
						}
					},
					border: false,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						bodyStyle: "background-color: #dfe8f5"
					},
					defaultType: "textfield",
					fieldDefaults: {
						msgTarget: "side",
						labelAlign: "top",
						labelWidth: 60
					},
					items: [
						{
							fieldLabel: "产品编码",
							name: "code",
							allowBlank: false
						},
						{
							fieldLabel: "产品名称",
							name: "name",
							allowBlank: false
						},
						{
							fieldLabel: "产品条形码",
							name: "barcode",
							allowBlank: true
						},
						{
							fieldLabel: "产品数目",
							name: "count",
							allowBlank: false
						},
						{
							fieldLabel: "产品价格",
							name: "price",
							allowBlank: false,
							validator: function(value){
								var p = RegExp(/\d+\.\d\d/);
								if (!p.test(value)){
									return "输入的值必须是两位小数!";
								}
								return true;
							},
						},
						{
							fieldLabel: "产品成本",
							name: "cost",
							allowBlank: false,
							validator: function(value){
								var p = RegExp(/\d+\.\d\d/);
								if (!p.test(value)){
									return "输入的值必须是两位小数!";
								}
								return true;
							},
						},
						{
							fieldLabel: "计量单位",
							name: "unit",
							allowBlank: false
						},
						{
							fieldLabel: "产品规格",
							name: "standards",
							allowBlank: false
						},
						{
							fieldLabel: "产品所属服务",
							name: "serviceid",
							allowBlank: false,
							xtype: "combobox",
							editable: false,
							store: Beet.constants.ServiceList,
							queryMode:"local",
							displayField: "name",
							valueField: "attr",
						},
						{
							fieldLabel: "产品分类",
							name: "category",
							readOnly: true,
							emptyMsg: "点击侧边分类列表, 自动填入"
						},
						{
							fieldLabel: "注释",
							name: "descript",
							allowBlank: true,
						},
						{
							xtype: "component",
							colspan: 3,
							height: 10
						},
					],
					bbar: [
						"->",
						{
							xtype: "button",
							text: "提交",
							width: 200,
							handler: function(){
								me.processData(this)	
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
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.form.setHeight("100%");
		me.mainPanel.add(form);
		me.mainPanel.doLayout();
	},
	treeItemClick: function(frame, record, item, index, e, options){
		var me = this;
		if (!record){return;}
		
		me.selectProductCategoryId = parseInt(record.get("id"));

		me.form.getForm().setValues({
			"category" : record.get("text")	
		})
	},
	restoreFromData: function(rawData){
		var me = this, form = me.form.getForm();
		me.rawData = rawData;
		form.setValues({
			code: rawData["PCode"],
			name: rawData["PName"],
			barcode: rawData["PBarCode"],
			count: rawData["PCount"],
			price: (rawData["PPrice"] ? rawData["PPrice"].replaceAll(",", "") : 0),
			cost: (rawData["PCost"] ? rawData["PCost"].replaceAll(",", "") : 0),
			standards: rawData["PStandands"],
			serviceid: rawData["ServiceID"],
			descript: rawData["PDescript"],
			category: rawData["PCategoryName"],
			unit: rawData["PUnit"]
		})
	},
	resetForm: function(){
		var me = this, form = me.form.getForm();
		form.reset();
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = f.up("form").getForm(), result = form.getValues();
		if (me.selectProductCategoryId){
			result["categoryid"] = me.selectProductCategoryId;
			delete result["category"];
		}

		if (me._editType == "add"){
			cardServer.AddProducts(Ext.JSON.encode(result), {
				success: function(id){
					if (id > 0){
						Ext.MessageBox.show({
							title: "提示",
							msg: "添加产品成功!",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									form.reset()
								}else{
									if (me.callback){
										me.callback();
									}
									//close win
								}
							}
						});
					}else{
						Ext.Error.raise("添加产品失败");
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			});
		}else{
			if (me._editType == "edit"){
				result["id"] = me.rawData["PID"];//products id
				cardServer.UpdateProducts(Ext.JSON.encode(result), {
					success: function(succ){
						if (succ){
							Ext.MessageBox.show({
								title: "提示",
								msg: "更新产品成功!",
								buttons: Ext.MessageBox.YES,
								fn: function(btn){
									if (btn == "yes"){
										if (me.callback){
											me.callback();
										}
										//me.parent.storeProxy.loadPage(me.parent.storeProxy.currentPage);
									}
								}
							});
						}else{
							Ext.Error.raise("更新产品失败");
						}
					},
					failure: function(error){
						Ext.Error.raise(error);
					}
				});
			}
		}
	}
});

Ext.define("Beet.apps.ProductsViewPort.UpdateProducts", {
	extend: "Ext.panel.Panel",
	border: false,
	plain: true,
	initComponent: function(){
		var me = this;
		me.callParent();
		me.add(Ext.create("Beet.apps.ProductsViewPort.ProductsList"));
		me.doLayout();
	}
});

function createCategoryTree(){
	var me = this, cardServer = Beet.constants.cardServer;
	me.createTreeList = function(){
		Ext.bind(buildCategoryTreeStore, me)();

		me.storeProxy = store = Ext.create("Beet.apps.ProductsViewPort.CatgoryTreeStore");
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			frame: true,
			lookMask: true,
			cls: "iScroll",
			collapsible: true,
			collapseDirection: Ext.Component.DIRECTION_LEFT,
			width: 230,
			border: 0,
			useArrow: true,
			title: "产品分类",
			split: true,
			tbar: [
				{
					xtype: "button",
					text: "全部卷起",
					handler: function(){
						return me.treeList.collapseAll();
					}
				},
				{
					xtype: "button",
					text: "全部展开",
					handler: function(){
						return me.treeList.expandAll();
					}
				},
			]
		});

		me.treeList.on({
			"beforeitemcontextmenu": me.treeListRClick,
			scope: me
		});

		//FIXED FOR 4.0.7
		me.treeList.addListener({
			collapse: function(p){
				if (p && p.collapsed && p.reExpander){
					var reExpander = p.reExpander;
					setTimeout(function(){
						reExpander.el.applyStyles({top: 0, left: 0});
						reExpander.setHeight(me.getHeight())
					}, 50);
				}
			}
		})

		me.treeList.storeProxy = me.treeList.getStore();

		me.updateTreeListEvent();
		
		me.mainPanel.add(me.treeList);
		me.treeList.setHeight(Beet.workspace.getHeight() - 40);
		me.mainPanel.doLayout();
	}
	me.refreshTreeList = function(){
		me.treeList.storeProxy.load();
	}
	me.treeListRClick = function(frame, record, item, index, e, options){
		var isLeaf = record.isLeaf();
		if (!record.contextMenu){
			var menu = [];

			if (record.isRoot()){
				menu = [
					{
						text: "增加分类", 
						handler: function(direction, e){
							me.addTreeItem(direction, record, e)	
						}
					}
				]
			}else{
				menu = [
					{text: "增加分类", handler: function(direction, e){
						me.addTreeItem(direction, record, e);	
					}},
					{text: "编辑", handler: function(direction, e){
						me.editTreeItem(direction, record, e)	
					}},
					{text: "删除", handler: function(direction, e){
						me.deleteTreeItem(direction, record, e);	
					}},
				]
			}

			record.contextMenu = Ext.create("Ext.menu.Menu", {
				style: {
				   overflow: 'visible',
				},
				plain: true,
				items: menu,
				raw : record.raw,
				leaf: isLeaf
			});
		}
		e.stopEvent();
		record.contextMenu.showAt(e.getXY());
		return false;
	}
	me.categoryListCombo = function(){
		me.categoryList = me.treeList.getStore().proxy.categoryList;
		return Ext.create("Ext.data.Store", {
			fields: ["id", "text"],
			data: me.categoryList	
		})
	}
	me.addTreeItem = function(widget, record, e){
		var CLCombo = me.categoryListCombo();
		if (me.addWin){
			me.addWin.close();
		}
		if (me.editWin){
			me.editWin.close()
		}
		me.doLayout();

		var form = Ext.create("Ext.form.Panel", {
			width: "100%",
			height: 100,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
			bodyPadding: 10,
			items: [
				{
					fieldLabel: "名称",
					xtype: "textfield",
					allowBlank: false,
					name: "name"
				},
				{
					fieldLabel: "所属类别",
					xtype: "combobox",
					store: CLCombo,
					name: "parentid",
					queryMode: "local",
					displayField: "text",
					valueField: "id",
					value: parseInt(record.get("id") == "src" ? -1 : record.get("id"))
				}
			],
			buttons: [
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						var f = form.getForm(), result = f.getValues();
						cardServer.AddCategory(Ext.JSON.encode(result), {
							success: function(id){
								if (id > 0){
									Ext.Msg.alert("添加成功", "添加分类成功");
									me.addWin.close();
									me.refreshTreeList();
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

		me.addWin = Ext.create("Ext.window.Window", {
			height: 140,
			width: 300,
			title: "增加分类",
			autoHeight: true,
			autoScroll: true,
			autoWidth: true,
		});
		me.addWin.add(form)
		me.addWin.doLayout();
		me.addWin.show();
	}
	me.deleteTreeItem = function(width, record, e){
		var id = record.get("id");
		if (id == "src"){
			return;
		}

		Ext.Msg.alert("删除分类", "你确定需要删除 " + record.get("text") + " 吗?", function(btn){
			cardServer.DeleteCategory(id, {
				success: function(succ){
					if (succ) {
						Ext.Msg.alert("删除成功", "删除分类 "+ record.get("text") + " 成功");
						me.refreshTreeList();
					}
				},
				failure: function(error){
					Ext.Error.raise(error)
				}
			});
		}, me)
	}
	me.editTreeItem = function(widget, record, e){
		var CLCombo = me.categoryListCombo();
		if (me.addWin){
			me.addWin.close();
		}
		if (me.editWin){
			me.editWin.close()
		}

		var form = Ext.create("Ext.form.Panel", {
			width: "100%",
			height: 100,
			bodyPadding: 10,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
			items: [
				{
					fieldLabel: "名称",
					xtype: "textfield",
					allowBlank: false,
					name: "name",
					value: record.get("text")
				},
				{
					fieldLabel: "所属类别",
					xtype: "combobox",
					store: CLCombo,
					name: "parentid",
					queryMode: "local",
					displayField: "text",
					valueField: "id",
					value: parseInt(record.raw["pid"])
				}
			],
			buttons: [
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						var f = form.getForm(), result = f.getValues();
						result["id"] = record.get("id");
						cardServer.UpdateCategory(Ext.JSON.encode(result), {
							success: function(succ){
								if (succ){
									Ext.Msg.alert("编辑成功", "编辑分类成功");
									me.editWin.close();
									me.refreshTreeList();
								}
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						})
					}
				}
			]
		});

		me.editWin= Ext.create("Ext.window.Window", {
			height: 140,
			width: 300,
			title: "编辑分类",
			autoHeight: true,
			autoScroll: true,
			autoWidth: true,
		});
		me.editWin.add(form)
		me.editWin.doLayout();
		me.editWin.show();
	}
	me.updateTreeListEvent = function(unregister){
		if (unregister){
			me.treeList.un({
				itemClick: me.onTreeItemClick,
				scope: me
			})
		}else{
			me.treeList.on({
				itemClick: me.onTreeItemClick,
				scope: me
			})
		}
	}
	me.onTreeItemClick = function(frame, record, item){
		var id = record.get("id");
		if (id != -1){
			me.b_filter = "PCategoryID = " + id;
		}else{
			me.b_filter = "";
		}

		me.filterProducts();
	}
}

Ext.define("Beet.apps.ProductsViewPort.ProductsList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll: true,
	height: Beet.constants.VIEWPORT_HEIGHT - 1,
	width: "100%",
	frame: true,
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

		//append new tree list
		Ext.bind(createCategoryTree, me)();
		me.createTreeList();

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

/**
 *
 * 返利
 *
 */ 
Ext.define("Beet.apps.ProductsViewPort.AddRebate", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll: true,
	border: false,
	bodyBorder: false,
	bodyStyle: "background-color: #dfe8f5",
	plain: true,
	bodyPadding: 10,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.callParent();
		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			autoHeight: true,
			autoScroll: true,
			border: false,
			bodyBorder: false,
			plain: true,
			flex: 1,
			items: [
				{
					layout: {
						type: "table",
						columns: 1,
						tableAttrs: {
							cellspacing: 10,
							style: {
								width: "100%"
							}
						}
					},
					border: false,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						bodyStyle: "background-color: #dfe8f5"
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
							name: "name",
							allowBlank: false
						},
						{
							fieldLabel: "返利值",
							name: "value",
							allowBlank: false
						},
						{
							fieldLabel: "是否折扣",
							name: "ismoney",
							xtype: "checkbox",
							inputValue: 1
						},
						{
							fieldLabel: "起始日期",
							allowBlank: false,
							name: "startdate"
						},
						{
							fieldLabel: "结束日期",
							allowBlank: false,
							name: "enddate"
						},
						{
							fieldLabel: "日期单位",
							name: "validunit",
							allowBlank: false,
							xtype: "combo",
							store: Beet.constants.DateType,
							editable: false,
							queryMode: "local",
							displayField: "name",
							valueField: "attr"
						},
						{
							fieldLabel: "返利注释",
							name: "descript"
						},
						{
							xtype: "button",
							text: "提交",
							width: 200,
							formBind: true,
							disabled: true,
							handler: function(btn, widget){
								me.processData(this)	
							}
						}
					]
				}
			]
		}

		me.form = Ext.create("Ext.form.Panel", config);
		me.add(me.form);
		me.doLayout();
		if (me.b_editMode && me.b_rawData){
			me.restoreFromData()
		}
	},
	restoreFromData: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = me.form.getForm(), rawData = me.b_rawData;
		form.setValues({
			name: rawData["Name"],
			value: rawData["Value"].replace(",", ""),
			ismoney: rawData["IsMoney"] ? 1 : 0,
			startdate: rawData["StartDate"],
			enddate: rawData["EndDate"],
			validunit: parseInt(rawData["ValidUnit"]),
			descript: rawData["Descript"]
		});
	},
	processData: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = me.form.getForm(), results = form.getValues();
		results["ismoney"] = results["ismoney"] == 1 ? true : false;

		if (me.b_editMode){
			var rid = me.b_rawData["RID"];
			results["id"] = rid;
			cardServer.UpdateRebate(Ext.JSON.encode(results), {
				success: function(succ){
					if (succ){
						Ext.MessageBox.show({
							title: "提示",
							msg: "更新返利成功!",
							buttons: Ext.MessageBox.YES,
							fn: function(btn){
								if (btn == "yes"){
									if (me.b_callback){
										me.b_callback();
									}
								}
							}
						});
					}else{
						Ext.Error.raise("更新返利失败");
					}
				},
				failure: function(error){
					Ext.Error.raise(error)
				}
			})
		}else{
			cardServer.AddRebate(Ext.JSON.encode(results), {
				success: function(rid){
					if (rid > -1){
						Ext.Msg.show({
							title: "增加返利",
							msg: "添加成功, 是否需要继续添加?",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									form.reset();
								}else{
									if (me.b_callback){
										me.b_callback();
									}
								}
							}
						});
					}else{
						Ext.Msg.alert("添加失败", "添加返利失败")
					}
				},
				failure: function(error){
					Ext.Error.raise(error)
				}
			})
		}
	}
});

Ext.define("Beet.apps.ProductsViewPort.RebateList", {
	extend: "Ext.panel.Panel",	
	autoHeight: true,
	autoScroll: true,
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	frame: true,
	border: false,
	shadow: true,
	b_filter: "",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			me.editable = false;
		}else{
			me.editable = true;
		}

		me.callParent();
		me.getProductsMetaData();
	},
	getProductsMetaData: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		cardServer.GetRebatePageData(0, 1, "", {
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
		
		if (!Beet.apps.ProductsViewPort.RebateModel){
			Ext.define("Beet.apps.ProductsViewPort.RebateModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Beet.apps.ProductsViewPort.RebateStore){
			Ext.define("Beet.apps.ProductsViewPort.RebateStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.ProductsViewPort.RebateModel,
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
				},
				proxy: {
					type: "b_proxy",
					b_method: cardServer.GetRebatePageData,
					startParam: "start",
					limitParam: "limit",
					b_params: {
						"awhere" : ""
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

		me.createGrid();
	},
	createGrid: function(){
		var me = this, grid = me.grid, sm = null, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.ProductsViewPort.RebateStore")
		});
		var store = me.storeProxy, actions;

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
				tooltip: "编辑返利",
				id: "customer_grid_edit",
				handler:function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					me.editRebate(d);
				}
			}
		);
		
		if (me.b_type == "selection") {
		}else{
			_actions.items.push("-", "-", "-",{
				icon: "./resources/themes/images/fam/delete.gif",
				tooltip: "删除返利",
				id: "customer_grid_delete",
				handler: function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					me.deleteRebate(d);
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
			border: 0,
			selModel: sm,
			height: !me.editable ? "95%" : "100%",
			columnLines: true,
			viewConfig:{
				trackOver: false,
				stripeRows: true
			},
			columns: me.columns,
			tbar: [
				"-",
				{
					xtype: "button",
					text: "增加返利",
					handler: function(){
						var win = Ext.create("Ext.window.Window", {
							height: 300,
							width: 300,
							title: "增加返利",
							autoHeight: true,
							autoScroll: true,
							autoWidth: true
						});
						win.add(Ext.create("Beet.apps.ProductsViewPort.AddRebate", {
							b_callback: function(){
								me.storeProxy.loadPage(me.storeProxy.currentPage);
								win.close();
							}
						}));
						win.doLayout();
						win.show();
					},
				},
				"-",
				{
					text: "高级搜索",
					xtype: "button",
					handler: function(){
						cardServer.GetRebatePageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.storeProxy.setProxy({
											type: "b_proxy",
											b_method: cardServer.GetRebatePageData,
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
										});
										me.storeProxy.loadPage(1)
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
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			})
		})

		me.add(me.grid);
		me.doLayout();

		if (me.b_type == "selection"){
			me.add(Ext.widget("button", {
				text: "确定",
				handler: function(){
					if (me.b_selectionCallback){
						me.b_selectionCallback(me.selModel.getSelection());
					}
				}
			}))
			me.doLayout();
		}
	},
	editRebate: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, rid = rawData["RID"], cname = rawData["Name"], cardServer = Beet.constants.cardServer;
		if (rid && me.editable){
			Ext.MessageBox.show({
				title: "编辑返利",
				msg: "是否要更新 " + cname + " 的资料",
				buttons: Ext.MessageBox.YESNO,
				fn : function(btn){
					if (btn == "yes"){
						var win = Ext.create("Ext.window.Window", {
							height: 300,
							width: 300,
							title: "编辑返利",
							autoHeight: true,
							autoScroll: true,
							autoWidth: true
						});
						win.add(Ext.create("Beet.apps.ProductsViewPort.AddRebate", {
							b_rawData: rawData,
							b_editMode: true,
							b_callback: function(){
								me.storeProxy.loadPage(me.storeProxy.currentPage);
								win.close();
							}
						}));
						win.doLayout();
						win.show();
					}
				}
			})	
		}else{
			var win = Ext.create("Beet.apps.ProductsViewPort.ViewChargeType", {
				editable: false,
				storeProxy: me.storeProxy,
				rawData: rawData	
			});
			win.show();
		}
	},
	deleteRebate: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, rid = rawData["RID"], cname = rawData["Name"], cardServer = Beet.constants.cardServer;
		if (rid){
			Ext.MessageBox.show({
				title: "删除返利",
				msg: "是否需要删除返利: " + cname + "?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeleteRebate(rid, {
							success: function(succ){
								if (succ){
									Ext.MessageBox.show({
										title: "删除成功",
										msg: "删除返利: " + cname + " 成功",
										buttons: Ext.MessageBox.OK,
										fn: function(){
											me.storeProxy.loadPage(me.storeProxy.currentPage);
										}
									})
								}else{
									Ext.Error.raise("删除返利失败");
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
			Ext.Error.raise("删除费用失败");
		}
	}
});

/**
 *
 * 费用
 *
 */
function createChargeCategoryTree(){
	var me = this, cardServer = Beet.constants.cardServer;
	me.createTreeList = function(){
		Ext.bind(buildCategoryTreeStore, me)();

		me.storeProxy = store = Ext.create("Beet.apps.ProductsViewPort.CatgoryTreeStore");
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			frame: true,
			lookMask: true,
			cls: "iScroll",
			collapsible: true,
			collapseDirection: "left",
			width: 230,
			height: 500,
			border: 0,
			useArrow: true,
			title: "费用分类",
			split: true,
			tbar: [
				{
					xtype: "button",
					text: "全部卷起",
					handler: function(){
						return me.treeList.collapseAll();
					}
				},
				{
					xtype: "button",
					text: "全部展开",
					handler: function(){
						return me.treeList.expandAll();
					}
				},
			]
		});

		me.treeList.on({
			"beforeitemcontextmenu": me.treeListRClick,
			scope: me
		});

		//FIXED FOR 4.0.7
		me.treeList.addListener({
			collapse: function(p){
				if (p && p.collapsed && p.reExpander){
					var reExpander = p.reExpander;
					setTimeout(function(){
						reExpander.el.applyStyles({top: 0, left: 0});
						reExpander.setHeight(me.getHeight())
					}, 50);
				}
			}
		})

		me.treeList.storeProxy = me.treeList.getStore();

		//me.updateTreeListEvent();
		
		me.mainPanel.add(me.treeList);
		me.treeList.setHeight(Beet.workspace.getHeight() - 40);
		me.mainPanel.doLayout();
	}
	me.refreshTreeList = function(){
		me.treeList.storeProxy.load();
	}
	me.treeListRClick = function(frame, record, item, index, e, options){
		var isLeaf = record.isLeaf();
		if (!record.contextMenu){
			var menu = [];

			if (record.isRoot()){
				menu = [
					{
						text: "增加分类", 
						handler: function(direction, e){
							me.addTreeItem(direction, record, e)	
						}
					}
				]
			}else{
				menu = [
					{text: "增加分类", handler: function(direction, e){
						me.addTreeItem(direction, record, e);	
					}},
					{text: "编辑", handler: function(direction, e){
						me.editTreeItem(direction, record, e)	
					}},
					{text: "删除", handler: function(direction, e){
						me.deleteTreeItem(direction, record, e);	
					}},
				]
			}

			record.contextMenu = Ext.create("Ext.menu.Menu", {
				style: {
				   overflow: 'visible',
				},
				plain: true,
				items: menu,
				raw : record.raw,
				leaf: isLeaf
			});
		}
		e.stopEvent();
		record.contextMenu.showAt(e.getXY());
		return false;
	}
	me.categoryListCombo = function(){
		me.categoryList = me.treeList.getStore().proxy.categoryList;
		return Ext.create("Ext.data.Store", {
			fields: ["id", "text"],
			data: me.categoryList	
		})
	}
	me.addTreeItem = function(widget, record, e){
		var CLCombo = me.categoryListCombo();
		if (me.addWin){
			me.addWin.close();
		}
		if (me.editWin){
			me.editWin.close()
		}
		me.doLayout();

		var form = Ext.create("Ext.form.Panel", {
			width: "100%",
			height: 100,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
			bodyPadding: 10,
			items: [
				{
					fieldLabel: "名称",
					xtype: "textfield",
					allowBlank: false,
					name: "name"
				},
				{
					fieldLabel: "所属类别",
					xtype: "combobox",
					store: CLCombo,
					name: "parentid",
					queryMode: "local",
					displayField: "text",
					valueField: "id",
					value: parseInt(record.get("id") == "src" ? -1 : record.get("id"))
				}
			],
			buttons: [
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						var f = form.getForm(), result = f.getValues();
						cardServer.AddCategory(Ext.JSON.encode(result), {
							success: function(id){
								if (id > 0){
									Ext.Msg.alert("添加成功", "添加分类成功");
									me.addWin.close();
									me.refreshTreeList();
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

		me.addWin = Ext.create("Ext.window.Window", {
			height: 140,
			width: 300,
			title: "增加分类",
			autoHeight: true,
			autoScroll: true,
			autoWidth: true,
		});
		me.addWin.add(form)
		me.addWin.doLayout();
		me.addWin.show();
	}
	me.deleteTreeItem = function(width, record, e){
		var id = record.get("id");
		if (id == "src"){
			return;
		}

		Ext.Msg.alert("删除分类", "你确定需要删除 " + record.get("text") + " 吗?", function(btn){
			cardServer.DeleteCategory(id, {
				success: function(succ){
					if (succ) {
						Ext.Msg.alert("删除成功", "删除分类 "+ record.get("text") + " 成功");
						me.refreshTreeList();
					}
				},
				failure: function(error){
					Ext.Error.raise(error)
				}
			});
		}, me)
	}
	me.editTreeItem = function(widget, record, e){
		var CLCombo = me.categoryListCombo();
		if (me.addWin){
			me.addWin.close();
		}
		if (me.editWin){
			me.editWin.close()
		}

		var form = Ext.create("Ext.form.Panel", {
			width: "100%",
			height: 100,
			bodyPadding: 10,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
			items: [
				{
					fieldLabel: "名称",
					xtype: "textfield",
					allowBlank: false,
					name: "name",
					value: record.get("text")
				},
				{
					fieldLabel: "所属类别",
					xtype: "combobox",
					store: CLCombo,
					name: "parentid",
					queryMode: "local",
					displayField: "text",
					valueField: "id",
					value: parseInt(record.raw["pid"])
				}
			],
			buttons: [
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						var f = form.getForm(), result = f.getValues();
						result["id"] = record.get("id");
						cardServer.UpdateCategory(Ext.JSON.encode(result), {
							success: function(succ){
								if (succ){
									Ext.Msg.alert("编辑成功", "编辑分类成功");
									me.editWin.close();
									me.refreshTreeList();
								}
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						})
					}
				}
			]
		});

		me.editWin= Ext.create("Ext.window.Window", {
			height: 140,
			width: 300,
			title: "编辑分类",
			autoHeight: true,
			autoScroll: true,
			autoWidth: true,
		});
		me.editWin.add(form)
		me.editWin.doLayout();
		me.editWin.show();
	}
	me.updateTreeListEvent = function(unregister){
		if (unregister){
			me.treeList.un({
				itemClick: me.onTreeItemClick,
				scope: me
			})
		}else{
			me.treeList.on({
				itemClick: me.onTreeItemClick,
				scope: me
			})
		}
	}
	me.onTreeItemClick = function(frame, record, item){
		var id = record.get("id");
		if (id != -1){
			me.b_filter = "CategoryID = " + id;
		}else{
			me.b_filter = "";
		}

		me.filterProducts();
	}
}

Ext.define("Beet.apps.ProductsViewPort.AddCharge", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	flex: 1,
	_editType: "view",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;

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
		
		Ext.bind(createChargeCategoryTree, me)();
		me.createTreeList();

		me.updateTreeListEvent(true)
		me.treeList.on({
			itemclick: me.treeItemClick,
			scope: me
		})
		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		var config = {
			autoHeight: true,
			autoScroll: true,
			plain: true,
			flex: 1,
			bodyPadding: 5,
			bodyStyle: "background-color: #dfe8f5",
			items: [
				{
					layout: {
						type: "table",
						columns: 2,
						tableAttrs: {
							cellspacing: 10,
							style: {
								width: "100%"
							}
						}
					},
					border: false,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						bodyStyle: "background-color: #dfe8f5",
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
							name: "name",
							allowBlank: false
						},
						{
							fieldLabel: "费用金额",
							name: "cost",
							allowBlank: false,
						},
						{
							fieldLabel: "是否应用折扣",
							name: "applyrate",
							xtype: "checkbox",
							inputValue: 1
						},
						{
							fieldLabel: "折扣",
							name: "rate",
							value: 1
						},
						{
							fieldLabel: "折扣金额",
							name: "discount",
							listeners: {
								scope: me,
								blur: function(){
									me.onUpdateForm(true)
								}
							}
						},
						{
							fieldLabel: "分类",
							name: "category",
							allowBlank: false
						},
						{
							fieldLabel: "是否有效",
							name: "effective",
							xtype: "checkbox",
							checked: true,
							inputValue: 1
						}
					],
					bbar: [
						"->",
						{
							xtype: "button",
							text: "提交",
							disabled: true,
							formBind: true,
							handler: function(btn, widget){
								me.processData(this)	
							},
							hidden: me._editType == "view"
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.mainPanel.add(form);
		me.mainPanel.doLayout();
	},
	treeItemClick: function(frame, record, item, index, e, options){
		var me = this;
		if (!record){return;}
		
		me.selectProductCategoryId = parseInt(record.get("id"));

		me.form.getForm().setValues({
			"category" : record.get("text")	
		})
	},
	restoreFromData: function(rawData){
		var me = this, form = me.form.getForm();
		var discount = parseFloat(rawData["CCost"].replaceAll(",", "")) * parseFloat(rawData["CRate"]);
		me.rawData = rawData;
		form.setValues({
			name: rawData["CName"],
			cost: rawData["CCost"].replaceAll(",", ""),
			rate: rawData["CRate"],
			discount: discount,
			category: rawData["CategoryName"]
		})

		me.selectProductCategoryId = rawData["CategoryID"];
	},
	onUpdateForm: function(force){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = me.getForm().getForm();
		//get data
		var values = form.getValues();
		
		var cost, rate, discount;
		cost = parseFloat(values["cost"]);

		if (isNaN(cost) || cost < 0){
			return;
		}

		rate = values["rate"];
		discount = values["discount"];
		if (force){
			rate = discount / cost;	
		}else{
			discount = rate * cost;
		}

		form.setValues({
			rate: parseFloat(rate).toFixed(2),
			discount: parseFloat(discount).toFixed(2)
		})
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		me.onUpdateForm();//lastupdate
		var form = f.up("form").getForm(), result = form.getValues();

		result["applyrate"] = result["applyrate"] == 1 ? true : false;
		result["effective"] = result["effective"] == 1 ? true : false;

		if (me.selectProductCategoryId){
			result["categoryid"] = me.selectProductCategoryId;
			delete result["category"];
		}
		
		if (me._editType == "add"){
			cardServer.AddChargeType(Ext.JSON.encode(result), {
				success: function(id){
					if (id > 0){
						Ext.MessageBox.show({
							title: "提示",
							msg: "添加费用成功!",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									form.reset()
								}else{
									if (me.callback){
										me.callback()
									}
								}
							}
						});
					}else{
						Ext.Error.raise("添加费用失败");
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			});
		}

		if (me._editType == "edit"){
			result["id"] = me.rawData["CID"];
			cardServer.UpdateChargeType(Ext.JSON.encode(result), {
				success: function(id){
					if (id > 0){
						Ext.MessageBox.show({
							title: "提示",
							msg: "更新费用成功!",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									if (me.callback){
										me.callback()
									}
								}
							}
						});
					}else{
						Ext.Error.raise("更新费用失败");
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			});
		}
	}
});

Ext.define("Beet.apps.ProductsViewPort.UpdateCharge", {
	extend: "Ext.panel.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	border: false,
	plain: true,
	initComponent: function(){
		var me = this;
		me.callParent();
		me.add(Ext.create("Beet.apps.ProductsViewPort.ChargeList"));
		me.doLayout();
	}
});

Ext.define("Beet.apps.ProductsViewPort.ChargeList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll: true,
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	frame: true,
	border: false,
	shadow: true,
	b_filter: "",
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

		//append new tree list
		Ext.bind(createChargeCategoryTree, me)();
		me.createTreeList();
		me.updateTreeListEvent()

		me.getProductsMetaData();
	},
	getProductsMetaData: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		cardServer.GetChargeTypePageData(0, 1, "", {
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
		
		if (!Beet.apps.ProductsViewPort.ChargeTypeModel){
			Ext.define("Beet.apps.ProductsViewPort.ChargeTypeModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Beet.apps.ProductsViewPort.ChargeTypeStore){
			Ext.define("Beet.apps.ProductsViewPort.ChargeTypeStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.ProductsViewPort.ChargeTypeModel,
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
			b_method: cardServer.GetChargeTypePageData,
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
		var me = this, grid = me.grid, sm = null, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.ProductsViewPort.ChargeTypeStore")
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
					me.editChargeType(d);
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
					me.deleteCharge(d);
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
			border: 0,
			selModel: sm,
			height: "100%",
			flex: 1,
			columnLines: true,
			viewConfig:{
				trackOver: false,
				stripeRows: true
			},
			columns: me.columns,
			tbar: [
				"-",
				{
					xtype: "button",
					text: "高级搜索",
					handler: function(){
						cardServer.GetChargeTypePageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.storeProxy.setProxy(me.updateProxy());
										me.storeProxy.loadPage(1)
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
					text: "增加费用",
					handler: function(){
						var win = Ext.create("Ext.window.Window", {
							title: "增加费用",
							width: 1000,
							height: 600,
							layout: "fit",
							autoHeight: true,
							autoScroll: true,
							border: false,
						})

						win.add(Ext.create("Beet.apps.ProductsViewPort.AddCharge", {
							_editType: "add"	
						}))

						win.show();
					}
				}
			],
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			})
		})

		me.mainPanel.add(me.grid);
		me.mainPanel.doLayout();

		if (me.b_type == "selection"){
			me.add(Ext.widget("button", {
				text: "确定",
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
	editChargeType: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, cid = rawData["CID"], cname = rawData["CName"], cardServer = Beet.constants.cardServer;
		var win = Ext.create("Ext.window.Window", {
			width: 1000,
			height: 600,
			layout: "fit",
			autoHeight: true,
			autoScroll: true,
			title: "更新费用",
			border: false
		});
		var config;
		if (cid && me.editable){
			win.setTitle("编辑 " + cname + " 资料");
			config = {
				_editType: "edit",
				callback: function(){
					win.close();
					me.storeProxy.loadPage(me.storeProxy.currentPage);
				}
			}
		}else{
			win.setTitle("查看 " + cname + " 资料");
			config = {
				_editType: "view",
				callback: function(){
					win.close();
					me.storeProxy.loadPage(me.storeProxy.currentPage);
				}
			}
		}
		var f = Ext.create("Beet.apps.ProductsViewPort.AddCharge", config);
		f.restoreFromData(rawData);
		win.add(f);
		win.doLayout();

		win.show();
	},
	deleteCharge: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, cid = rawData["CID"], cname = rawData["CName"], cardServer = Beet.constants.cardServer;
		if (cid){
			Ext.MessageBox.show({
				title: "删除费用",
				msg: "是否需要删除费用: " + cname + "?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeleteChargeType(cid, {
							success: function(succ){
								if (succ){
									Ext.MessageBox.show({
										title: "删除成功",
										msg: "删除费用: " + cname + " 成功",
										buttons: Ext.MessageBox.OK,
										fn: function(){
											me.storeProxy.loadPage(me.storeProxy.currentPage);
										}
									})
								}else{
									Ext.Error.raise("删除费用失败");
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
			Ext.Error.raise("删除费用失败");
		}
	}
});


/**
 *
 * 项目
 *
 *
 */
function createItemCategoryTree(){
	var me = this, cardServer = Beet.constants.cardServer;
	me.createTreeList = function(){
		Ext.bind(buildCategoryTreeStore, me)();

		me.storeProxy = store = Ext.create("Beet.apps.ProductsViewPort.CatgoryTreeStore");
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			bodyStyle: "background-color: #fff",
			frame: true,
			lookMask: true,
			cls: "iScroll",
			collapsible: true,
			collapseDirection: "left",
			width: 230,
			height: 500,
			border: 0,
			useArrow: true,
			title: "项目分类",
			split: true,
			tbar: [
				{
					xtype: "button",
					text: "全部卷起",
					handler: function(){
						return me.treeList.collapseAll();
					}
				},
				{
					xtype: "button",
					text: "全部展开",
					handler: function(){
						return me.treeList.expandAll();
					}
				},
			]
		});

		me.treeList.on({
			"beforeitemcontextmenu": me.treeListRClick,
			scope: me
		});
		me.treeList.on({
			itemclick: me.treeItemClick,
			scope: me
		})
		
		//FIXED FOR 4.0.7
		me.treeList.addListener({
			collapse: function(p){
				if (p && p.collapsed && p.reExpander){
					var reExpander = p.reExpander;
					setTimeout(function(){
						reExpander.el.applyStyles({top: 0, left: 0});
						reExpander.setHeight(me.getHeight())
					}, 50);
				}
			}
		})

		me.treeList.storeProxy = me.treeList.getStore();
		me.updateTreeListEvent();
	}
	me.refreshTreeList = function(){
		me.treeList.storeProxy.load();
	}
	me.treeListRClick = function(frame, record, item, index, e, options){
		var isLeaf = record.isLeaf();
		if (!record.contextMenu){
			var menu = [];

			if (record.isRoot()){
				menu = [
					{
						text: "增加分类", 
						handler: function(direction, e){
							me.addTreeItem(direction, record, e)	
						}
					}
				]
			}else{
				menu = [
					{text: "增加分类", handler: function(direction, e){
						me.addTreeItem(direction, record, e);	
					}},
					{text: "编辑", handler: function(direction, e){
						me.editTreeItem(direction, record, e)	
					}},
					{text: "删除", handler: function(direction, e){
						me.deleteTreeItem(direction, record, e);	
					}},
				]
			}

			record.contextMenu = Ext.create("Ext.menu.Menu", {
				style: {
				   overflow: 'visible',
				},
				plain: true,
				items: menu,
				raw : record.raw,
				leaf: isLeaf
			});
		}
		e.stopEvent();
		record.contextMenu.showAt(e.getXY());
		return false;
	}
	me.categoryListCombo = function(){
		me.itemList = me.treeList.getStore().proxy.itemList;
		return Ext.create("Ext.data.Store", {
			fields: ["id", "text"],
			data: me.itemList
		})
	}
	me.addTreeItem = function(widget, record, e){
		var CLCombo = me.categoryListCombo();
		if (me.addWin){
			me.addWin.close();
		}
		if (me.editWin){
			me.editWin.close()
		}
		me.doLayout();

		var form = Ext.create("Ext.form.Panel", {
			width: "100%",
			height: 100,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
			bodyPadding: 10,
			items: [
				{
					fieldLabel: "名称",
					xtype: "textfield",
					allowBlank: false,
					name: "name"
				},
				{
					fieldLabel: "所属类别",
					xtype: "combobox",
					store: CLCombo,
					name: "parentid",
					queryMode: "local",
					displayField: "text",
					valueField: "id",
					value: parseInt(record.get("id") == "src" ? -1 : record.get("id"))
				}
			],
			buttons: [
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						var f = form.getForm(), result = f.getValues();
						cardServer.AddCategory(Ext.JSON.encode(result), {
							success: function(id){
								if (id > 0){
									Ext.Msg.alert("添加成功", "添加分类成功");
									me.addWin.close();
									me.refreshTreeList();
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

		me.addWin = Ext.create("Ext.window.Window", {
			height: 140,
			width: 300,
			title: "增加分类",
			autoHeight: true,
			autoScroll: true,
			autoWidth: true,
		});
		me.addWin.add(form)
		me.addWin.doLayout();
		me.addWin.show();
	}
	me.deleteTreeItem = function(width, record, e){
		var id = record.get("id");
		if (id == "src"){
			return;
		}

		Ext.Msg.alert("删除分类", "你确定需要删除 " + record.get("text") + " 吗?", function(btn){
			cardServer.DeleteCategory(id, {
				success: function(succ){
					if (succ) {
						Ext.Msg.alert("删除成功", "删除分类 "+ record.get("text") + " 成功");
						me.refreshTreeList();
					}
				},
				failure: function(error){
					Ext.Error.raise(error)
				}
			});
		}, me)
	}
	me.editTreeItem = function(widget, record, e){
		var CLCombo = me.categoryListCombo();
		if (me.addWin){
			me.addWin.close();
		}
		if (me.editWin){
			me.editWin.close()
		}

		var form = Ext.create("Ext.form.Panel", {
			width: "100%",
			height: 100,
			bodyPadding: 10,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
			items: [
				{
					fieldLabel: "名称",
					xtype: "textfield",
					allowBlank: false,
					name: "name",
					value: record.get("text")
				},
				{
					fieldLabel: "所属类别",
					xtype: "combobox",
					store: CLCombo,
					name: "parentid",
					queryMode: "local",
					displayField: "text",
					valueField: "id",
					value: parseInt(record.raw["pid"])
				}
			],
			buttons: [
				{
					xtype: "button",
					text: "提交",
					width: 200,
					handler: function(){
						var f = form.getForm(), result = f.getValues();
						result["id"] = record.get("id");
						cardServer.UpdateCategory(Ext.JSON.encode(result), {
							success: function(succ){
								if (succ){
									Ext.Msg.alert("编辑成功", "编辑分类成功");
									me.editWin.close();
									me.refreshTreeList();
								}
							},
							failure: function(error){
								Ext.Error.raise(error);
							}
						})
					}
				}
			]
		});

		me.editWin= Ext.create("Ext.window.Window", {
			height: 140,
			width: 300,
			title: "编辑分类",
			autoHeight: true,
			autoScroll: true,
			autoWidth: true,
		});
		me.editWin.add(form)
		me.editWin.doLayout();
		me.editWin.show();
	}
	me.updateTreeListEvent = function(unregister){
		if (unregister){
			me.treeList.un({
				itemClick: me.onTreeItemClick,
				scope: me
			})
		}else{
			me.treeList.on({
				itemClick: me.onTreeItemClick,
				scope: me
			})
		}
	}
	me.onTreeItemClick = function(frame, record, item){
		var id = record.get("id");
		if (id != -1){
			me.b_filter = "ICategoryId= " + id;
		}else{
			me.b_filter = "";
		}
		me.filterProducts();
	}
	me.treeItemClick = function(frame, record, item, index, e, options){
		if (!record){return;}
		
		me.selectProductCategoryId = parseInt(record.get("id"));

		me.form.getForm().setValues({
			"category" : record.get("text")	
		})
	}
}

Ext.define("Beet.apps.ProductsViewPort.AddItem", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoWidth: true,
	autoHeight: true,
	autoScroll: true,
	frame: true,
	border: false,
	bodyBorder: false,	
	editable: true,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedProducts = {};
		me.selectedChargeType = {};
		me.itemList = {};//save store fields columns and grid
		me.itemList.cache = {};//cache itemdata
		me.selectedItemId = 0;
		me.selectedItemIndex = 0;
		me.callParent()	

		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		Ext.bind(createItemCategoryTree, me)();
		me.createTreeList();
		me.updateTreeListEvent(true)

		var options = {
			autoScroll: true,
			autoWidth: true,
			autoHeight: true,
			cls: "iScroll",
			height: 200,
			border: true,
			plain: true,
			flex: 1,
			collapsible: true,
			bodyStyle: "background-color: #dfe8f5"
		}
		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "产品列表"
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "费用列表"
		}));

		var config = {
			autoHeight: true,
			autoScroll: true,
			cls: "iScroll",
			height: me.editable ? "100%" : "95%",
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			plain: true,
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
					border: false,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						border: false,
						bodyStyle: "background-color: #dfe8f5"
					},
					items:[
						me.treeList,
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							bodyPadding: "0 0 0 5",
							height: 500,
							flex: 2,
							items: [
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
										{
											fieldLabel: "项目总价",
											allowBlank: false,
											name: "price",
											listeners: {
												scope: me,
												blur: function(){
													me.onUpdate();
												}
											},
										},
										{
											fieldLabel: "项目折扣总价",
											allowBlank: false,
											name: "realprice",
											listeners: {
												scope: me,
												blur: function(){
													me.onUpdate(true);
												}
											},
										},
										{
											fieldLabel: "项目折扣",
											allowBlank: false,
											name: "rate",
											value: 1.00,
											listeners: {
												scope: me,
												blur: function(){
													me.onUpdate();
												}
											},
										},
										{
											fieldLabel: "项目所属分类",
											allowBlank: false,
											name: "category"
										},
										{
											fieldLabel: "注释",
											allowBlank: true,
											xtype: "textarea",
											name: "descript"
										}
									],
									bbar:[
										{
											xtype: "button",
											text: "绑定产品",
											style: {
												borderColor: "#99BBE8"
											},
											handler: function(){
												me.selectProducts();
											}
										},
										{
											xtype: "button",
											text: "绑定费用",
											style: {
												borderColor: "#99BBE8"
											},
											handler: function(){
												me.selectChargeType();
											}
										},
										"->",
										{
											text: "提交",
											xtype: "button",
											border: 1,
											style: {
												borderColor: "#99BBE8"
											},
											handler: function(){
												me.processData(this);
											}
										},
										{
											text: "取消",
											xtype: "button",
											border: 1,
											style: {
												borderColor: "#99BBE8"
											},
											handler: function(){
												if (me.callback){
													me.callback();
												}
											}
										}
									]
								},
								me.productsPanel,
								me.chargeTypesPanel
							]
						},
					]
				}
			]
		};
		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		//update panel
		me.initializeProductsPanel();
		me.initializeChargeTypePanel();
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
	initializeChargeTypePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.chargeTypesPanel.__columns && me.chargeTypesPanel.__columns.length > 0){
			return;
		}
		var columns = me.chargeTypesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除费用",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteChargeType(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetChargeTypePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.chargeTypesPanel.__fields = [];
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
				me.initializeChargeGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeChargeGrid: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.chargeTypesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.chargeTypesPanel.__columns
		});

		me.chargeTypesPanel.add(grid);
		me.chargeTypesPanel.doLayout();
	},
	selectChargeType: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择费用",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.ChargeList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addChargeType(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addChargeType: function(records, isRaw){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		if (records == undefined){
			selectedChargeType = {};
			me.updateChargeTypePanel();
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid, rawData;
			if (isRaw){
				cid = record["CID"];
				rawData = record;
			}else{
				cid = record.get("CID");
				rawData = record.raw;
			}
			if (selectedChargeType[cid] == undefined){
				selectedChargeType[cid] = []
			}else{
				selectedChargeType[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedChargeType[cid].push(rawData[k]);
			}
		}

		me.updateChargeTypePanel(isRaw);
	},
	deleteChargeType: function(record){
		var me = this, selectedChargeType = me.selectedChargeType;
		var cid = record.get("CID");
		if (selectedChargeType[cid]){
			selectedChargeType[cid] = null;
			delete selectedChargeType[cid];
		}

		me.updateChargeTypePanel();
	},
	updateChargeTypePanel: function(first){
		var me = this, selectedChargeType = me.selectedChargeType;
		var grid = me.chargeTypesPanel.grid, store = grid.getStore();
		var __fields = me.chargeTypesPanel.__fields;
		var tmp = []
		for (var c in selectedChargeType){
			tmp.push(selectedChargeType[c]);
		}
		store.loadData(tmp);

		if (first){return;}
		me.onUpdate()
	},
	restoreFromData: function(rawData){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedProducts = {};//reset
		me.selectedChargeType = {};
		var itemId = rawData["IID"];
		me.selectedItemId = itemId;
		me.form.getForm().setValues({
			code: rawData["ICode"],
			name: rawData["IName"],
			descript: rawData["IDescript"],
			price: (""+rawData["IPrice"]).replaceAll(",", ""),
			rate: rawData["IRate"],
			realprice: (rawData["IRealPrice"]+"").replaceAll(",", ""),
			category: rawData["ICategoryName"]
		});
		
		me.selectProductCategoryId = parseInt(rawData["ICategoryID"]);

		if (itemId <= 0){
			Ext.Msg.alert("错误", "项目ID非法!");
			return;
		}
		if (me.itemList.cache[itemId] == undefined){
			me.itemList.cache[itemId] = {};
			cardServer.GetItemProductData(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["Data"]//["products"];
					me.itemList.cache[itemId].products = data;
					me.addProducts(data, true)
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
			cardServer.GetItemCharges(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["charges"];
					var sql = [];
					for (var c = 0; c < data.length; ++c){
						sql.push("cid=" + data[c]);
					}
					var s = sql.join(" OR ");
					if (s.length > 0){
						cardServer.GetChargeTypePageData(1, 1000000, s, {
							success: function(data){
								var data = Ext.JSON.decode(data)["Data"];
								me.itemList.cache[itemId].charges= data;
								me.addChargeType(data, true);
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
			})
		}else{
			me.addProducts(me.itemList.cache[itemId].products, true);
			me.addChargeType(me.itemList.cache[itemId].charges, true);
		}
	},
	resetAll: function(){
		var me = this, form = me.form.getForm();
		form.reset();
		//reset all
		me.selectedChargeType = {};
		me.selectedProducts = {};	
		me.updateProductsPanel();
		me.updateChargeTypePanel();

		if (me.itemList.cache[me.selectedItemId]){
			me.itemList.cache[me.selectedItemId] = {};
			delete me.itemList.cache[me.selectedItemId];
		}
		me.itemList.store.loadPage(me.itemList.store.currentPage);
	},
	//auto computing value
	onUpdate: function(force){
		var me = this, cardServer = Beet.constants.cardServer, form = me.form.getForm(),
			values = form.getValues(),
			_price = (""+values["price"]).replaceAll(",", ""),
			_rate = values["rate"],
			_realprice = ("" + values["realprice"]).replaceAll(",", "");
		var selectedProducts = me.selectedProducts, selectedChargeType = me.selectedChargeType;
		
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

		if (selectedChargeType && Ext.Object.getKeys(selectedChargeType).length> 0){
			for (var c in selectedChargeType){
				var p = selectedChargeType[c];
				__price += parseFloat((""+p[2]).replaceAll(",", ""), 2)
			}
		}

		if (force) {
			_rate = _realprice / _price;
		}else{
			_realprice = _price * _rate;
		}
		me.form.getForm().setValues({
			price: Ext.Number.toFixed(__price, 2), 	
			rate: Ext.Number.toFixed(_rate, 2),
			realprice: Ext.Number.toFixed(_realprice, 2)
		});
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), result = form.getValues();
		var selectedProducts = me.selectedProducts, selectedChargeType = me.selectedChargeType;
		if (me.selectProductCategoryId){
			result["categoryid"] = me.selectProductCategoryId;
			delete result["category"];
		}

		//name descript products charges
		var productstore = me.productsPanel.grid.getStore();
		var products = [];
		for (var c = 0; c < productstore.getCount(); ++c){
			var data = productstore.getAt(c);
			var count = data.get("COUNT"), price = data.get("PRICE");
			if (count != undefined && price != undefined){
				var pid = data.get("PID");
				products.push({
					id: pid,
					count: count,
					price: price	
				})
			}else{
				Ext.MessageBox.alert("失败", "请将\"消耗数量\"以及\"消耗总价\"填写完整!");
				return;
			}
		}
		var charges = Ext.Object.getKeys(selectedChargeType);

		if (products && products.length > 0){
			result["products"] = products;
		}

		if (charges && charges.length > 0){
			result["charges"] = charges;
		}


		if (me._editType == "add"){
			cardServer.AddItem(Ext.JSON.encode(result), {
				success: function(itemId){
					if (itemId > 0){
						Ext.MessageBox.show({
							title: "提示",
							msg: "添加项目成功!",
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn){
								if (btn == "yes"){
									me.resetAll();
								}else{
									if (me.callback){ me.callback() }
								}
							}
						});
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
		}else{
			if (me._editType == "edit"){
				if (me.selectedItemId < 0){
					return;
				}
				result["id"] = me.selectedItemId;

				cardServer.UpdateItem(Ext.JSON.encode(result), {
					success: function(succ){
						if (succ){
							Ext.MessageBox.show({
								title: "提示",
								msg: "更新项目成功!",
								buttons: Ext.MessageBox.OK,
								fn: function(btn){
									if (me.callback){ me.callback() }
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
})

Ext.define("Beet.apps.ProductsViewPort.ItemList", {
	extend: "Ext.panel.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	b_filter: "",
	_editType: "add",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedProducts = {};
		me.selectedChargeType = {};
		me.itemList = {};//save store fields columns and grid
		me.itemList.cache = {};//cache itemdata
		me.selectedItemId = 0;
		me.selectedItemIndex = 0;
		me.callParent()	

		me.buildStoreAndModel();
	},
	buildStoreAndModel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var columns = me.itemList.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 50,
			items: [
			]
		}

		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/edit.png",
			tooltip: "编辑项目",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.editItem(d);
			}
		}, "-");

		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除项目",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteItem(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetItemPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.itemList.__fields = [];
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
				
				if (!Beet.apps.ProductsViewPort.itemModel){
					Ext.define("Beet.apps.ProductsViewPort.itemModel", {
						extend: "Ext.data.Model",
						fields: fields
					});
				}

				if (!Beet.apps.ProductsViewPort.itemStore){
					Ext.define("Beet.apps.ProductsViewPort.itemStore", {
						extend: "Ext.data.Store",
						model: Beet.apps.ProductsViewPort.itemModel,
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

				me.initializeItemGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	updateProxy: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		return {
			type: "b_proxy",
			b_method: cardServer.GetItemPageData,
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
	initializeItemGrid: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var __fields = me.itemList.__fields;
		var store = me.itemList.store = Ext.create("Beet.apps.ProductsViewPort.itemStore");
		store.setProxy(me.updateProxy());

		var grid = me.itemList.grid = Ext.create("Beet.plugins.LiveSearch", {
			autoHeight: true,
			height: 480,
			title: "系统项目列表",
			cls:"iScroll",
			autoScroll: true,
			border: true,
			plain: true,
			flex: 1,
			store: store,
			columnLines: true,
			columns: me.itemList.__columns,
			tbar: [
				"-",
				{
					text: "高级搜索",
					xtype: "button",
					handler: function(){
						cardServer.GetItemPageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.itemList.store.setProxy({
											type: "b_proxy",
											b_method: cardServer.GetItemPageData,
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
										})
										me.itemList.store.loadPage(1);
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
				{
					xtype: "button",
					text: "增加项目",
					handler: function(){
						var win = Ext.create("Ext.window.Window", {
							width: 1000,
							height: 600,
							autoScroll: true,
							autoHeight: true,
							layout: "fit",
							border: false	
						})

						win.add(Ext.create("Beet.apps.ProductsViewPort.AddItem", {
							_editType: "add",
							callback: function(){
								win.close();
								me.itemList.store.loadPage(me.itemList.store.currentPage)
							}
						}))

						win.show();
					}
				},
			],
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			}),
			listeners: {
				itemdblclick: function(grid, record, item, index, e){
					me.onSelectItem(grid, record, item, index, e);	
				}
			}
		});

		me.itemList.store.on("load", function(){
			if (me.itemList.store.getCount() > 0){
				//me.fireSelectGridItem();
			}
		})

		me.createMainPanel();
	},
	fireSelectGridItem: function(){
		var me = this;
		me.itemList.grid.fireEvent("itemdblclick", me.itemList.grid, me.itemList.store.getAt(me.selectedItemIndex), null, me.selectedItemIndex)
	},
	filterProducts: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.itemList.store.setProxy({
			type: "b_proxy",
			b_method: cardServer.GetItemPageData,
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
		});

		me.itemList.store.loadPage(1);
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		Ext.bind(createItemCategoryTree, me)();
		me.createTreeList();

		var options = {
			autoScroll: true,
			autoWidth: true,
			autoHeight: true,
			cls: "iScroll",
			height: 150,
			border: true,
			plain: true,
			flex: 1,
			collapsible: true,
			collapsed: true,
			bodyStyle: "background-color: #dfe8f5"
		}
		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "产品列表"
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "费用列表"
		}));

		var config = {
			autoHeight: true,
			autoScroll: true,
			cls: "iScroll",
			height: Beet.constants.VIEWPORT_HEIGHT * 0.98,
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			plain: true,
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
					border: false,
					bodyStyle: "background-color: #dfe8f5",
					defaults: {
						border: false,
						bodyStyle: "background-color: #dfe8f5"
					},
					items:[
						me.treeList,
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							bodyPadding: "0 0 0 5",
							height: 500,
							flex: 2,
							items: [
								me.itemList.grid,
								me.productsPanel,
								me.chargeTypesPanel
							]
						},
					]
				}
			]
		};
		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		//update panel
		me.initializeProductsPanel();
		me.initializeChargeTypePanel();
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
				height: 200,
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
	initializeChargeTypePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.chargeTypesPanel.__columns && me.chargeTypesPanel.__columns.length > 0){
			return;
		}
		var columns = me.chargeTypesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除费用",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteChargeType(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetChargeTypePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.chargeTypesPanel.__fields = [];
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
				me.initializeChargeGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeChargeGrid: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.chargeTypesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.chargeTypesPanel.__columns
		});

		me.chargeTypesPanel.add(grid);
		me.chargeTypesPanel.doLayout();
	},
	selectChargeType: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择费用",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.ChargeList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addChargeType(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addChargeType: function(records, isRaw){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		if (records == undefined){
			selectedChargeType = {};
			me.updateChargeTypePanel();
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid, rawData;
			if (isRaw){
				cid = record["CID"];
				rawData = record;
			}else{
				cid = record.get("CID");
				rawData = record.raw;
			}
			if (selectedChargeType[cid] == undefined){
				selectedChargeType[cid] = []
			}else{
				selectedChargeType[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedChargeType[cid].push(rawData[k]);
			}
		}

		me.updateChargeTypePanel();
	},
	deleteChargeType: function(record){
		var me = this, selectedChargeType = me.selectedChargeType;
		var cid = record.get("CID");
		if (selectedChargeType[cid]){
			selectedChargeType[cid] = null;
			delete selectedChargeType[cid];
		}

		me.updateChargeTypePanel();
	},
	updateChargeTypePanel: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var grid = me.chargeTypesPanel.grid, store = grid.getStore();
		var __fields = me.chargeTypesPanel.__fields;
		var tmp = []
		for (var c in selectedChargeType){
			tmp.push(selectedChargeType[c]);
		}
		store.loadData(tmp);
	},
	editItem: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		var rawData = record.raw;
		var win = Ext.create("Ext.window.Window", {
			width: 1000,
			height: 600,
			autoScroll: true,
			autoHeight: true,
			layout: "fit",
			border: false	
		})

		var f = Ext.create("Beet.apps.ProductsViewPort.AddItem", {
			_editType: "edit",
			callback: function(){
				win.close();
				me.itemList.store.loadPage(me.itemList.store.currentPage)
			}
		})

		Ext.defer(function(){
			f.restoreFromData(rawData);
			win.add(f);
			win.show();
		}, 500);
	},
	deleteItem: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		var itemId = record.get("IID"), itemName = record.get("IName");
		if (itemId){
			Ext.MessageBox.show({
				title: "删除项目",
				msg: "是否要删除 " + itemName + " ?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeleteItem(itemId, {
							success: function(){
								Ext.MessageBox.show({
									title: "删除成功",
									msg: "删除项目: " + itemName + " 成功",
									buttons: Ext.MessageBox.OK,
									fn: function(){
										me.itemList.store.loadPage(me.itemList.store.currentPage);
										if (me.itemList.cache[itemId]){
											me.itemList.cache[itemId] = {};
											delete me.itemList.cache[itemId];
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
			Ext.Error.raise("删除项目失败");
		}
	},
	onSelectItem: function(grid, record, item, index, e){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedProducts = {};//reset
		me.selectedChargeType = {};
		var itemId = record.get("IID");
		me.selectedItemId = itemId;
		me.selectedItemIndex = index;
		me.selectProductCategoryId = parseInt(record.get("ICategoryID"));
		if (itemId <= 0){
			Ext.Msg.alert("错误", "项目ID非法!");
			return;
		}
		if (me.itemList.cache[itemId] == undefined){
			me.itemList.cache[itemId] = {};
			cardServer.GetItemProductData(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["Data"]//["products"];
					me.itemList.cache[itemId].products = data;
					me.addProducts(data, true)
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
			cardServer.GetItemCharges(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["charges"];
					var sql = [];
					for (var c = 0; c < data.length; ++c){
						sql.push("cid=" + data[c]);
					}
					var s = sql.join(" OR ");
					if (s.length > 0){
						cardServer.GetChargeTypePageData(1, 1000000, s, {
							success: function(data){
								var data = Ext.JSON.decode(data)["Data"];
								me.itemList.cache[itemId].charges= data;
								me.addChargeType(data, true);
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
			})
		}else{
			me.addProducts(me.itemList.cache[itemId].products, true);
			me.addChargeType(me.itemList.cache[itemId].charges, true);
		}

		//expand
		me.productsPanel.expand();
		me.chargeTypesPanel.expand();
	},
	resetAll: function(){
		var me = this;
		//reset all
		me.selectedChargeType = {};
		me.selectedProducts = {};	
		me.updateProductsPanel();
		me.updateChargeTypePanel();

		if (me.itemList.cache[me.selectedItemId]){
			me.itemList.cache[me.selectedItemId] = {};
			delete me.itemList.cache[me.selectedItemId];
		}
		me.itemList.store.loadPage(me.itemList.store.currentPage);
	}
});

//用户选择itemlist
Ext.define("Beet.apps.ProductsViewPort.ItemListWindow", {
	extend: "Ext.panel.Panel",
	height: "100%",
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	b_filter: "",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedProducts = {};
		me.selectedChargeType = {};
		me.itemList = {};//save store fields columns and grid
		me.itemList.cache = {};//cache itemdata
		me.selectedItemId = 0;
		me.selectedItemIndex = 0;
		me.callParent()	

		cardServer.GetItemPageData(0, 1, "", {
			success: function(data){
				var win = Ext.create("Beet.apps.AdvanceSearch", {
					searchData: Ext.JSON.decode(data),
					b_callback: function(where){
						me.b_filter = where;
						me.buildStoreAndModel();
					}
				});
				win.show();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	buildStoreAndModel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var columns = me.itemList.__columns = [];
		
		cardServer.GetItemPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.itemList.__fields = [];
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
				
				if (!Beet.apps.ProductsViewPort.itemModel){
					Ext.define("Beet.apps.ProductsViewPort.itemModel", {
						extend: "Ext.data.Model",
						fields: fields
					});
				}

				if (!Beet.apps.ProductsViewPort.itemStore){
					Ext.define("Beet.apps.ProductsViewPort.itemStore", {
						extend: "Ext.data.Store",
						model: Beet.apps.ProductsViewPort.itemModel,
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
						},
						proxy: {
							type: "b_proxy",
							b_method: cardServer.GetItemPageData,
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


				me.initializeItemGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeItemGrid: function(){
		var me = this;
		var __fields = me.itemList.__fields;
		var store = me.itemList.store = Ext.create("Beet.apps.ProductsViewPort.itemStore");
		if (me.b_type == "selection"){
			var sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}

		var grid = me.itemList.grid = Ext.create("Ext.grid.Panel", {
			autoHeight: true,
			height: "100%",
			cls:"iScroll",
			autoScroll: true,
			border: true,
			plain: true,
			flex: 1,
			store: store,
			selModel: me.selModel,
			columnLines: true,
			columns: me.itemList.__columns,
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			}),
			listeners: {
				itemdblclick: function(grid, record, item, index, e){
					me.onSelectItem(grid, record, item, index, e);	
				}
			}
		});

		me.createMainPanel();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: 240,
			cls: "iScroll",
			border: true,
			plain: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5"
		}

		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "消费产品"
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "费用"
		}));

		var config = {
			autoHeight: true,
			autoScroll: true,
			cls: "iScroll",
			height: "95%",
			width: "100%",
			anchor: "fit",	
			border: false,
			bodyBorder: false,
			plain: true,
			bodyStyle: "background-color: #dfe8f5",
			items: [
				{
					layout: {
						type: "hbox",
						align: "stretch"
					},
					height: 550,
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
							height: 550,
							flex: 1,
							items: [
								me.itemList.grid
							]
						},
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							flex: 2,
							height: 550,
							items: [
								me.productsPanel,
								me.chargeTypesPanel
							]
						}
					]
				}
			]
		};
		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		//update panel
		me.initializeProductsPanel();
		me.initializeChargeTypePanel();

		if (me.b_type == "selection"){
			me.add(Ext.widget("button", {
				text: "确定",
				handler: function(){
					if (me.b_selectionCallback){
						me.b_selectionCallback(me.selModel.getSelection());
					}
				}
			}))
			me.doLayout();
		}
	},
	initializeProductsPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.productsPanel.__columns && me.productsPanel.__columns.length > 0){
			return;
		}
		var columns = me.productsPanel.__columns = [];

		cardServer.GetItemProductData(0, 1, "", {
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
				height: 239,
				cls: "iScroll",
				autoScroll: true,
				columnLines: true,
				columns: me.productsPanel.__columns	
			});

			me.productsPanel.add(grid);
			me.productsPanel.doLayout();
		}
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
	updateProductsPanel: function(){
		var me = this, selectedProducts = me.selectedProducts;
		var grid = me.productsPanel.grid, store = grid.getStore();
		var tmp = []
		for (var c in selectedProducts){
			tmp.push(selectedProducts[c]);
		}
		store.loadData(tmp);
	},
	initializeChargeTypePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.chargeTypesPanel.__columns && me.chargeTypesPanel.__columns.length > 0){
			return;
		}
		var columns = me.chargeTypesPanel.__columns = [];
		cardServer.GetChargeTypePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.chargeTypesPanel.__fields = [];
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
				me.initializeChargeGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeChargeGrid: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.chargeTypesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			height: 239,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.chargeTypesPanel.__columns
		});

		me.chargeTypesPanel.add(grid);
		me.chargeTypesPanel.doLayout();
	},
	addChargeType: function(records, isRaw){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid, rawData;
			if (isRaw){
				cid = record["CID"];
				rawData = record;
			}else{
				cid = record.get("CID");
				rawData = record.raw;
			}
			if (selectedChargeType[cid] == undefined){
				selectedChargeType[cid] = []
			}else{
				selectedChargeType[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedChargeType[cid].push(rawData[k]);
			}
		}

		me.updateChargeTypePanel();
	},
	updateChargeTypePanel: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var grid = me.chargeTypesPanel.grid, store = grid.getStore();
		var __fields = me.chargeTypesPanel.__fields;
		var tmp = []
		for (var c in selectedChargeType){
			tmp.push(selectedChargeType[c]);
		}
		store.loadData(tmp);
	},
	onSelectItem: function(grid, record, item, index, e){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedProducts = {};//reset
		me.selectedChargeType = {};
		var itemId = record.get("IID");
		me.selectedItemId = itemId;
		me.selectedItemIndex = index;
		me.form.getForm().setValues({
			name: record.get("IName"),
			descript: record.get("IDescript")
		});
		if (itemId <= 0){
			Ext.Msg.alert("错误", "项目ID非法!");
			return;
		}
		if (me.itemList.cache[itemId] == undefined){
			me.itemList.cache[itemId] = {};
			cardServer.GetItemProductData(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["Data"]//["products"];
					me.itemList.cache[itemId].products = data;
					me.addProducts(data, true)
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
			cardServer.GetItemCharges(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["charges"];
					var sql = [];
					for (var c = 0; c < data.length; ++c){
						sql.push("cid=" + data[c]);
					}
					var s = sql.join(" OR ");
					if (s.length > 0){
						cardServer.GetChargeTypePageData(1, 1000000, s, {
							success: function(data){
								var data = Ext.JSON.decode(data)["Data"];
								me.itemList.cache[itemId].charges= data;
								me.addChargeType(data, true);
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
			})
		}else{
			me.addProducts(me.itemList.cache[itemId].products, true);
			me.addChargeType(me.itemList.cache[itemId].charges, true);
		}
	}
});

Ext.define("Beet.apps.ProductsViewPort.AddPackage",{
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
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
			height: 460,
			cls: "iScroll",
			border: true,
			plain: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5"
		}

		me.itemsPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定项目",
				handler: function(){
					me.selectItems();
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
			plain: true,
			items: [
				{
					layout: {
						type: "hbox",
						align: "stretch"
					},
					height: 490,
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
							height: 480,
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
										width: 400,
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
											height: 230,
											allowBlank: true,
											name: "descript"
										},
									]
								}
							]
						},
						me.itemsPanel,
						//{
						//	layout: {
						//		type: 'vbox',
						//		align: 'stretch'
						//	},
						//	flex: 2,
						//	height: 500,
						//	items: [
						//	]
						//}
					]
				}
			],
			bbar:[
				"->",
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
		};
		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		//update panel
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
				height: 215,
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
		for (var c in selectedItems){
			count = count + parseFloat(selectedItems[c][0].replace(",", ""));
			tmp.push(selectedItems[c]);
		}
		store.loadData(tmp);
		//update
		me.count.itemsCount = count;
		me.form.getForm().setValues({"price" : (me.count.itemsCount + me.count.chargesCount)});
		me.onUpdateForm();
	},
	resetAll: function(){
		var me = this;
		//reset all
		me.selectedItems = {};	
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
	bodyBorder: false,
	plain: true,
	b_filter: "",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedItems = {};
		me.packageList = {};//save store fields columns and grid
		me.packageList.cache = {};//cache itemdata

		me.selectedPackageId= 0;
		me.selectedPackageIndex = 0;
		me.callParent()	

		me.buildStoreAndModel();
	},
	buildStoreAndModel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var columns = me.packageList.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		if (me.b_type == "selection") {
		}else{
			_actions.items.push("-",{
				icon: "./resources/themes/images/fam/delete.gif",
				tooltip: "删除套餐",
				id: "customer_grid_delete",
				handler: function(grid, rowIndex, colIndex){
					var d = grid.store.getAt(rowIndex)
					me.deletePackage(d);
				}
			}, "-");
		}

		columns.push(_actions);
		cardServer.GetPackagesPageDataToJSON(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.packageList.__fields = [];
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
				
				if (!Beet.apps.ProductsViewPort.packageModel){
					Ext.define("Beet.apps.ProductsViewPort.packageModel", {
						extend: "Ext.data.Model",
						fields: fields
					});
				}

				if (!Beet.apps.ProductsViewPort.packageStore){
					Ext.define("Beet.apps.ProductsViewPort.packageStore", {
						extend: "Ext.data.Store",
						model: Beet.apps.ProductsViewPort.packageModel,
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
						},
						proxy: {
							type: "b_proxy",
							b_method: cardServer.GetPackagesPageDataToJSON,
							startParam: "start",
							limitParam: "limit",
							b_params: {
								"awhere" : ""
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


				me.initializePackageGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializePackageGrid: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var sm = null;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		var __fields = me.packageList.__fields;
		var store = me.packageList.store = Ext.create("Beet.apps.ProductsViewPort.packageStore");

		var grid = me.packageList.grid = Ext.create("Beet.plugins.LiveSearch", {
			autoHeight: true,
			height: 480,
			cls:"iScroll",
			autoScroll: true,
			border: true,
			plain: true,
			flex: 1,
			selModel: sm,
			store: store,
			columnLines: true,
			columns: me.packageList.__columns,
			tbar: [
				"-",
				{
					xtype: "button",
					text: "高级搜索",
					handler: function(){
						cardServer.GetPackagesPageDataToJSON(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.packageList.store.setProxy({
											type: "b_proxy",
											b_method: cardServer.GetPackagesPageDataToJSON,
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
										});
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
					text: "增加套餐",
					handler: function(){
						me.addPackageWindow();
					}
				}
			],
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			}),
			listeners: {
				itemdblclick: function(grid, record, item, index, e){
					me.onSelectItem(grid, record, item, index, e);	
				}
			}
		});

		me.packageList.store.on("load", function(){
			var totalCount = me.packageList.store.getCount();
			if (totalCount > 0){
				me.fireSelectGridItem();
			}
		})

		me.createMainPanel();
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
	fireSelectGridItem: function(){
		var me = this;
		me.packageList.grid.fireEvent("itemdblclick", me.packageList.grid, me.packageList.store.getAt(me.selectedPackageIndex), null, me.selectedPackageIndex)
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: 300,
			cls: "iScroll",
			collapsible: true,
			collapsed: true,
			border: true,
			plain: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5"
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
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							bodyStyle: "background-color: #dfe8f5",
							height: 500,
							width: 280,
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
											xtype: "textarea",
											height: 230,
											allowBlank: true,
											name: "descript"
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
							flex: 1,
							items: [
								me.packageList.grid,
								me.itemsPanel,
							]
						}
					]
				}
			],
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
				height: 220,
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
	deletePackage: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		var itemId = record.get("ID"), itemName = record.get("Name");
		if (itemId){
			Ext.MessageBox.show({
				title: "删除项目",
				msg: "是否要删除 " + itemName + " ?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeletePackage(itemId, {
							success: function(){
								Ext.MessageBox.show({
									title: "删除成功",
									msg: "删除项目: " + itemName + " 成功",
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
			Ext.Error.raise("删除项目失败");
		}
	},
	onSelectItem: function(grid, record, item, index, e){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedItems = {};//reset

		var pid = record.get("ID");
		me.selectedPackageId = pid;
		me.selectedPackageIndex = index;

		me.form.getForm().setValues({
			name: record.get("Name"),
			price: record.get("PPrice").replace(",", ""),
			rate: record.get("PRate"),
			realprice: record.get("PRealPrice").replace(",", ""),
			descript: record.get("Descript")
		});
		if (pid <= 0){
			Ext.Msg.alert("错误", "项目ID非法!");
			return;
		}
		
		if (me.packageList.cache[pid] == undefined){
			me.packageList.cache[pid] = {};
			//TODO
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
							},
							failure: function(error){
								Ext.Error.raise(error)
							}
						});
						me.itemsPanel.expand();
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
		}else{
			me.addItems(me.packageList.cache[pid].items, true);
			me.itemsPanel.expand();
		}
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

Ext.define("Beet.apps.ProductsViewPort.InterestsList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll: true,
	autoDestory: true,
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	frame: true,
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
		me.getProductsMetaData();
	},
	getProductsMetaData: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		cardServer.GetInterestsPageData(0, 1, "", {
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
		
		if (!Ext.isDefined(Beet.apps.ProductsViewPort.InterestsModel)){
			Ext.define("Beet.apps.ProductsViewPort.InterestsModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Ext.isDefined(Beet.apps.ProductsViewPort.InterestsStore)){
			Ext.define("Beet.apps.ProductsViewPort.InterestsStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.ProductsViewPort.InterestsModel,
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
				},
				proxy: {
					type: "b_proxy",
					b_method: cardServer.GetInterestsPageData,
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

		me.createGrid();
	},
	createGrid: function(){
		var me = this, grid = me.grid, sm = null, cardServer = Beet.constants.cardServer;
		sm = Ext.create("Ext.selection.CheckboxModel", {
			mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
		});
		me.selModel = sm;

		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.ProductsViewPort.InterestsStore")
		});
		var store = me.storeProxy, actions;

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
				tooltip: "编辑产品",
				id: "customer_grid_edit",
				handler:function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					me.editInterest(d);
				}
			}
		);
		
		_actions.items.push("-", "-", "-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除产品",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = me.storeProxy.getAt(rowIndex)
				me.deleteInterest(d);
			}
		}, "-","-","-");
		
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
			border: 0,
			selModel: sm,
			height: "95%",
			columnLines: true,
			viewConfig:{
				trackOver: false,
				stripeRows: true
			},
			columns: me.columns,
			tbar: [
				"-",
				{
					xtype: "button",
					text: "增加服务",
					handler: function(){
						me.addInterest();
					},
				},
				"-",
				{
					xtype: "button",
					text: "高级搜索",
					handler: function(){
						cardServer.GetInterestsPageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.storeProxy.setProxy({
											type: "b_proxy",
											b_method: cardServer.GetInterestsPageData,
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
										});
										me.storeProxy.loadPage(1)
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
			bbar: Ext.create("Ext.PagingToolbar", {
				store: store,
				displayInfo: true,
				displayMsg: '当前显示 {0} - {1} 到 {2}',
				emptyMsg: "没有数据"
			})
		})

		me.add(me.grid);
		me.doLayout();

		me.add(Ext.widget("button", {
			text: "确定",
			handler: function(){
				if (me.b_selectionCallback){
					me.b_selectionCallback(me.selModel.getSelection());
				}
			}
		}))
		me.doLayout();
	},
	addInterest: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.form = Ext.create("Ext.form.Panel", {
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
						var form = me.form.getForm(), results = form.getValues();
						cardServer.AddInterests(results["name"], {
							success: function(id){
								if (id > -1){
									Ext.Msg.show({
										title: "添加成功",
										msg: "添加服务成功! 是否需要继续添加服务?",
										buttons: Ext.MessageBox.YESNO,
										fn: function(btn){
											if (btn == "yes"){
												form.reset();
											}else{
												me.storeProxy.loadPage(me.storeProxy.currentPage);
												win.close();
											}
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

		var win = Ext.create("Ext.window.Window", {
			height: 100,
			width: 300,
			title: "增加服务",
			plain: true	
		});
		win.add(me.form);
		win.doLayout();
		win.show();
	},
	editInterest: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, cid = rawData["ID"], cname = rawData["Name"], cardServer = Beet.constants.cardServer;
		if (cid){
			Ext.MessageBox.show({
				title: "编辑服务",
				msg: "是否要更新 " + cname + " 的资料",
				buttons: Ext.MessageBox.YESNO,
				fn : function(btn){
					if (btn == "yes"){
						var form = Ext.create("Ext.form.Panel", {
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
									name: "name",
									value: cname	
								},
								{
									xtype: "button",
									text: "提交",
									handler: function(){
										var _form = form.getForm(), results = _form.getValues();
										cardServer.UpdateInterests(cid, results["name"], {
											success: function(succ){
												if (succ){
													Ext.Msg.show({
														title: "更新成功",
														msg: "更新服务成功! ",
														buttons: Ext.MessageBox.OK,
														fn: function(btn){
															me.storeProxy.loadPage(me.storeProxy.currentPage);
															win.close();
														}
													})
												}else{
													Ext.Error.raise("更新服务失败");
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

						var win = Ext.create("Ext.window.Window", {
							height: 100,
							width: 300,
							title: "编辑服务",
							plain: true	
						});
						win.add(form);
						win.doLayout();
						win.show();
					}
				}
			})	
		}
	},
	deleteInterest: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, cid = rawData["ID"], cname = rawData["Name"], cardServer = Beet.constants.cardServer;
		if (cid){
			Ext.MessageBox.show({
				title: "删除服务",
				msg: "是否需要删除服务: " + cname + "?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeleteInterests(cid, {
							success: function(succ){
								if (succ){
									Ext.MessageBox.show({
										title: "删除成功",
										msg: "删除服务: " + cname + " 成功",
										buttons: Ext.MessageBox.OK,
										fn: function(){
											me.storeProxy.loadPage(me.storeProxy.currentPage);
										}
									})
								}else{
									Ext.Error.raise("删除服务失败");
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
			Ext.Error.raise("删除服务失败");
		}
	}
})

Ext.define("Beet.apps.ProductsViewPort.AddCard", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedInterests = {};
		me.selectedChargeType = {};
		me.selectedRebates = {};
		me.selectedPackages = {};
		me.count = {
			interestsCount : 0,
			chargesCount : 0,
			rebatesCount: 0,
			packagesCount : 0
		}
		me.callParent();	
		me.createMainPanel();
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
			bodyStyle: "background-color: #dfe8f5",
			collapsible: true,
			collapseDirection: "top",
			collapsed: true
		}

		me.interestsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "服务列表",
			tbar: [{
				xtype: "button",
				text: "绑定服务",
				handler: function(){
					me.selectInterest();
				}
			}]	
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "费用列表",
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					me.selectChargeType();
				}
			}]	
		}));
		me.rebatesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "返利列表",
			tbar: [{
				xtype: "button",
				text: "绑定返利",
				handler: function(){
					me.selectRebate();
				},
			}]
		}))
		me.packagesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "套餐列表",
			collapsed: false,
			tbar: [{
				xtype: "button",
				text: "绑定套餐",
				handler: function(){
					me.selectPackage();
				},
			}]
		}))
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
											fieldLabel: "名称",
											allowBlank: false,
											name: "name"
										},
										{
											fieldLabel: "面值金额",
											allowBlank: false,
											name: "par"
										},
										{
											fieldLabel: "保值金额",
											allowBlank: false,
											name: "insure"
										},
										{
											fieldLabel: "有效日期",
											allowBlank: false,
											name: "validdate",
										},
										{
											fieldLabel: "日期单位",
											allowBlank: false,
											name: "validunit",
											xtype: "combo",
											store: Beet.constants.DateType,
											editable: false,
											queryMode: "local",
											displayField: "name",
											valueField: "attr"
										},
										{
											fieldLabel: "卡项注释",
											xtype: "textarea",
											height: 230,
											allowBlank: true,
											name: "descript"
										},
										{
											text: "新增",
											xtype: "button",
											scale: "large",
											width: 200,
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
								me.interestsPanel,
								me.chargeTypesPanel,
								me.rebatesPanel,
								me.packagesPanel
							]
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
		me.initializeInterestsPanel();
		me.initializeChargeTypePanel();
		me.initializeRebatesPanel();
		me.initializePackagePanel();
	},
	initializeInterestsPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.interestsPanel.__columns && me.interestsPanel.__columns.length > 0){
			return;
		}
		var columns = me.interestsPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除服务",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteInterest(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetInterestsPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.interestsPanel.__fields = [];
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
				me.initializeInterestGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeInterestGrid: function(){
		var me = this, selectedInterests = me.selectedInterests;
		var __fields = me.interestsPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.interestsPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.interestsPanel.__columns
		});

		me.interestsPanel.add(grid);
		me.interestsPanel.doLayout();
	},
	selectInterest: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择服务",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.InterestsList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addInterest(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addInterest: function(records, isRaw){
		var me = this, selectedInterests = me.selectedInterests;
		var __fields = me.interestsPanel.__fields;
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
			if (selectedInterests[cid] == undefined){
				selectedInterests[cid] = []
			}else{
				selectedInterests[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedInterests[cid].push(rawData[k]);
			}
		}

		me.updateInterestsPanel();
	},
	deleteInterest: function(record){
		var me = this, selectedInterests = me.selectedInterests;
		var cid = record.get("ID");
		if (selectedInterests[cid]){
			selectedInterests[cid] = null;
			delete selectedInterests[cid];
		}

		me.updateInterestsPanel();
	},
	updateInterestsPanel: function(){
		var me = this, selectedInterests = me.selectedInterests;
		var grid = me.interestsPanel.grid, store = grid.getStore();
		var __fields = me.interestsPanel.__fields;
		var tmp = []
		for (var c in selectedInterests){
			tmp.push(selectedInterests[c]);
		}
		store.loadData(tmp);
	},

	initializeChargeTypePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.chargeTypesPanel.__columns && me.chargeTypesPanel.__columns.length > 0){
			return;
		}
		var columns = me.chargeTypesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除费用",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteChargeType(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetChargeTypePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.chargeTypesPanel.__fields = [];
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
				me.initializeChargeGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeChargeGrid: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.chargeTypesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.chargeTypesPanel.__columns
		});

		me.chargeTypesPanel.add(grid);
		me.chargeTypesPanel.doLayout();
	},
	selectChargeType: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择费用",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.ChargeList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addChargeType(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addChargeType: function(records, isRaw){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid, rawData;
			if (isRaw){
				cid = record["CID"];
				rawData = record;
			}else{
				cid = record.get("CID");
				rawData = record.raw;
			}
			if (selectedChargeType[cid] == undefined){
				selectedChargeType[cid] = []
			}else{
				selectedChargeType[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedChargeType[cid].push(rawData[k]);
			}
		}

		me.updateChargeTypePanel();
	},
	deleteChargeType: function(record){
		var me = this, selectedChargeType = me.selectedChargeType;
		var cid = record.get("CID");
		if (selectedChargeType[cid]){
			selectedChargeType[cid] = null;
			delete selectedChargeType[cid];
		}

		me.updateChargeTypePanel();
	},
	updateChargeTypePanel: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var grid = me.chargeTypesPanel.grid, store = grid.getStore();
		var __fields = me.chargeTypesPanel.__fields;
		var tmp = []
		for (var c in selectedChargeType){
			tmp.push(selectedChargeType[c]);
		}
		store.loadData(tmp);
	},
	initializeRebatesPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.rebatesPanel.__columns && me.rebatesPanel.__columns.length > 0){
			return;
		}
		var columns = me.rebatesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除返利",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteRebate(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetRebatePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.rebatesPanel.__fields = [];
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
				me.initializeRebateGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeRebateGrid: function(){
		var me = this, selectedRebates = me.selectedRebates;
		var __fields = me.rebatesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.rebatesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.rebatesPanel.__columns
		});

		me.rebatesPanel.add(grid);
		me.rebatesPanel.doLayout();
	},
	selectRebate: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择返利",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.RebateList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addRebate(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addRebate: function(records, isRaw){
		var me = this, selectedRebates = me.selectedRebates;
		var __fields = me.rebatesPanel.__fields;
		if (records == undefined){
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var rid, rawData;
			if (isRaw){
				rid = record["RID"];
				rawData = record;
			}else{
				rid = record.get("RID");
				rawData = record.raw;
			}
			if (selectedRebates[rid] == undefined){
				selectedRebates[rid] = []
			}else{
				selectedRebates[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedRebates[rid].push(rawData[k]);
			}
		}

		me.updateRebatesPanel();
	},
	deleteRebate: function(record){
		var me = this, selectedRebates = me.selectedRebates;
		var rid = record.get("RID");
		if (selectedRebates[rid]){
			selectedRebates[rid] = null;
			delete selectedRebates[rid];
		}

		me.updateRebatesPanel();
	},
	updateRebatesPanel: function(){
		var me = this, selectedRebates = me.selectedRebates;
		var grid = me.rebatesPanel.grid, store = grid.getStore();
		var __fields = me.rebatesPanel.__fields;
		var tmp = []
		for (var c in selectedRebates){
			tmp.push(selectedRebates[c]);
		}
		store.loadData(tmp);
	},

	initializePackagePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.packagesPanel.__columns && me.packagesPanel.__columns.length > 0){
			return;
		}
		var columns = me.packagesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除套餐",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deletePackage(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetPackagesPageDataToJSON(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.packagesPanel.__fields = [];
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
				me.initializePackageGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializePackageGrid: function(){
		var me = this, selectedPackages = me.selectedPackages;
		var __fields = me.packagesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.packagesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.packagesPanel.__columns
		});

		me.packagesPanel.add(grid);
		me.packagesPanel.doLayout();
	},
	selectPackage: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择套餐",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.PackageList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addPackage(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addPackage: function(records, isRaw){
		var me = this, selectedPackages = me.selectedPackages;
		var __fields = me.packagesPanel.__fields;
		if (records == undefined){
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var rid, rawData;
			if (isRaw){
				rid = record["ID"];
				rawData = record;
			}else{
				rid = record.get("ID");
				rawData = record.raw;
			}
			if (selectedPackages[rid] == undefined){
				selectedPackages[rid] = []
			}else{
				selectedPackages[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedPackages[rid].push(rawData[k]);
			}
		}

		me.updatePackagesPanel();
	},
	deletePackage: function(record){
		var me = this, selectedPackages = me.selectedPackages;
		var rid = record.get("ID");
		if (selectedPackages[rid]){
			selectedPackages[rid] = null;
			delete selectedPackages[rid];
		}

		me.updatePackagesPanel();
	},
	updatePackagesPanel: function(){
		var me = this, selectedPackages = me.selectedPackages;
		var grid = me.packagesPanel.grid, store = grid.getStore();
		var __fields = me.packagesPanel.__fields;
		var tmp = []
		for (var c in selectedPackages){
			tmp.push(selectedPackages[c]);
		}
		store.loadData(tmp);
	},
	resetAll: function(){
		var me = this;

		me.selectedInterests = {};
		me.selectedChargeType = {};
		me.selectedRebates = {};
		me.selectedPackages = {};
		me.count = {
			interestsCount : 0,
			chargesCount : 0,
			rebatesCount: 0,
			packagesCount : 0
		}

		me.updateInterestsPanel();
		me.updateChargeTypePanel();
		me.updateRebatesPanel();
		me.updatePackagesPanel();
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), results = form.getValues();
		var selectedInterests = me.selectedInterests, selectedChargeType = me.selectedChargeType,
			selectedPackages = me.selectedPackages, selectedRebates = me.selectedRebates;

		//name descript products charges
		var interests = Ext.Object.getKeys(selectedInterests),
			charges = Ext.Object.getKeys(selectedChargeType),
			packages = Ext.Object.getKeys(selectedPackages),
			rebates = Ext.Object.getKeys(selectedRebates);
	
		if (interests && interests.length > 0){
			results["interests"] = interests;
		}

		if (charges && charges.length > 0){
			results["charges"] = charges;
		}

		if (packages && packages.length > 0){
			results["packages"] = packages;
		}

		if (rebates && rebates.length > 0){
			results["rebates"] = rebates;
		}

		cardServer.AddCard(Ext.JSON.encode(results), {
			success: function(pid){
				if (pid == Beet.constants.FAILURE){
					Ext.MessageBox.alert("添加失败", "添加卡项失败");
				}else{
					Ext.MessageBox.show({
						title: "提示",
						msg: "添加卡项成功!",
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


Ext.define("Beet.apps.ProductsViewPort.CardList", {
	extend: "Ext.form.Panel",
	height: Beet.constants.VIEWPORT_HEIGHT - 5,
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	b_filter: "",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.selectedInterests = {};
		me.selectedChargeType = {};
		me.selectedRebates = {};
		me.selectedPackages = {};
		me.count = {
			interestsCount : 0,
			chargesCount : 0,
			rebatesCount: 0,
			packagesCount : 0
		}
		me.callParent();	
		me.getCardMetaData();

		me.queue = new Beet_Queue("cardList");
		//me.createCardPanel();
	},
	getCardMetaData: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		cardServer.GetCardPageData(0, 1, "", {
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
		
		if (!Ext.isDefined(Beet.apps.ProductsViewPort.CardModel)){
			Ext.define("Beet.apps.ProductsViewPort.CardModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Ext.isDefined(Beet.apps.ProductsViewPort.CardStore)){
			Ext.define("Beet.apps.ProductsViewPort.CardStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.ProductsViewPort.CardModel,
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
				},
				proxy: {
					type: "b_proxy",
					b_method: cardServer.GetCardPageData,
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

		me.createCardGrid();
	},
	createCardGrid: function(){
		var me = this, grid = me.grid, sm = null, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
			});
			me.selModel = sm;
		}
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.ProductsViewPort.CardStore")
		});
		var store = me.storeProxy, actions;

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
				tooltip: me.b_type == "selection" ? "查看卡项" : "编辑卡项",
				id: "customer_grid_edit",
				handler:function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					me.editCardItem(d);
				}
			}
		);
		
		if (me.b_type == "selection") {
		}else{
			_actions.items.push("-", "-", "-",{
				icon: "./resources/themes/images/fam/delete.gif",
				tooltip: "删除卡项",
				id: "customer_grid_delete",
				handler: function(grid, rowIndex, colIndex){
					var d = me.storeProxy.getAt(rowIndex)
					me.deleteCardItem(d);
				}
			}, "-","-","-");
		}
		
		me.columns.splice(0, 0, _actions);

		me.cardgrid = Ext.create("Beet.plugins.LiveSearch", {
			store: store,
			lookMask: true,
			frame: true,
			collapsible: false,
			height: me.b_type == "selection" ? "95%" : "100%",
			width : "100%",
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			autoWidth: true,
			border: 0,
			flex: 1,
			cls: "iScroll",
			selModel: sm,
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
						cardServer.GetCardPageData(0, 1, "", {
							success: function(data){
								var win = Ext.create("Beet.apps.AdvanceSearch", {
									searchData: Ext.JSON.decode(data),
									b_callback: function(where){
										me.b_filter = where;
										me.storeProxy.setProxy({
											type: "b_proxy",
											b_method: cardServer.GetCardPageData,
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
										});
										me.storeProxy.loadPage(1);	
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
			]
		})
		me.add(me.cardgrid);
		me.doLayout();

		if (me.b_type == "selection"){
			me.add(Ext.widget("button", {
				text: "确定",
				width: 200,
				handler: function(){
					if (me.b_selectionCallback){
						me.b_selectionCallback(me.selModel.getSelection());
					}
				}
			}))
			me.doLayout();
		}
	},
	deleteCardItem: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		Ext.MessageBox.show({
			title: "删除卡项",
			msg: "你确定需要删除 " + record.get("Name") + " 吗?",
			buttons: Ext.MessageBox.YESNO,
			fn: function(btn){
				if (btn == "yes"){
					cardServer.DeleteCard(record.get("ID"), {
						success: function(succ){
							if (succ) {
								Ext.Msg.alert("删除成功", "删除卡项 "+ record.get("Name") + " 成功");
								me.storeProxy.loadPage(me.storeProxy.currentPage);
							}
						},
						failure: function(error){
							Ext.Error.raise(error)
						}
					});
				}
			}
		})
	},
	editCardItem: function(record){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			var win = Ext.create("Ext.window.Window", {
				height: 670,
				width: 1100,
				maximized: true,
				autoScroll: true,
				autoHeight: true,
				autoDestory: true,
				plain: true,
				title: "查看 " + record.get("Name"),
				border: false
			});

			me.cardInfo = win;
			win.show();
			me.createCardPanel();
			Ext.MessageBox.show({
				msg: "正在载入卡项数据...",
				progressText: "载入中...",
				width: 300,
				wait: true,
				waitConfig: {interval: 800},
				closable: false
			});

			me.queue.Add("getcarddetail", "initInterspanel,initChargepanel,initRebatespanel,initPackagepanel", function(){
				cardServer.GetCardDetailData(record.get("ID"), {
					success: function(data){
						var data = Ext.JSON.decode(data);
						me.onSelectItem(record, data);
						me.queue.triggle("getcarddetail", "success");
					},
					failure: function(error){
						Ext.MessageBox.hide();
						Ext.Error.raise(error);
					}
				})
			});
			me.queue.Add("processBar", "getcarddetail", function(){
				Ext.MessageBox.hide();
			})
		}else{
			var win = Ext.create("Ext.window.Window", {
				height: 670,
				width: 1100,
				maximized: true,
				autoScroll: true,
				autoHeight: true,
				autoDestory: true,
				plain: true,
				title: "编辑 " + record.get("Name"),
				border: false
			});

			me.cardInfo = win;
			win.show();
			me.createCardPanel();
			Ext.MessageBox.show({
				msg: "正在载入卡项数据...",
				progressText: "载入中...",
				width: 300,
				wait: true,
				waitConfig: {interval: 1000, increment: 3 },
				closable: false
			})
			me.queue.Add("getcarddetail", "initInterspanel,initChargepanel,initRebatespanel,initPackagepanel", function(){
				cardServer.GetCardDetailData(record.get("ID"), {
					success: function(data){
						var data = Ext.JSON.decode(data);
						me.onSelectItem(record, data);
						me.queue.triggle("getcarddetail", "success");
					},
					failure: function(error){
						Ext.MessageBox.hide();
						Ext.Error.raise(error);
					}
				})
			});
			
			me.queue.Add("processBar", "getcarddetail", function(){
				Ext.MessageBox.hide();
			})
		}
	},
	createCardPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: 460,
			cls: "iScroll",
			border: true,
			plain: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5",
			collapsible: true,
			collapseDirection: "top",
			collapsed: true
		}

		me.interestsPanel = Ext.widget("panel", Ext.apply(options, {
			title: "服务列表",
			tbar: [{
				xtype: "button",
				text: "绑定服务",
				handler: function(){
					me.selectInterest();
				}
			}]	
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "费用列表",
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					me.selectChargeType();
				}
			}]	
		}));
		me.rebatesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "返利列表",
			tbar: [{
				xtype: "button",
				text: "绑定返利",
				handler: function(){
					me.selectRebate();
				},
			}]
		}))
		me.packagesPanel = Ext.widget("panel", Ext.apply(options, {
			title: "套餐列表",
			collapsed: false,
			tbar: [{
				xtype: "button",
				text: "绑定套餐",
				handler: function(){
					me.selectPackage();
				},
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
			bodyStyle: "background-color: #dfe8f5",
			bodyPadding: 5,
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
											fieldLabel: "名称",
											allowBlank: false,
											name: "name"
										},
										{
											fieldLabel: "面值金额",
											allowBlank: false,
											name: "par"
										},
										{
											fieldLabel: "保值金额",
											allowBlank: false,
											name: "insure"
										},
										{
											fieldLabel: "有效日期",
											allowBlank: false,
											name: "validdate",
										},
										{
											fieldLabel: "日期单位",
											allowBlank: false,
											name: "validunit",
											xtype: "combo",
											store: Beet.constants.DateType,
											editable: false,
											queryMode: "local",
											displayField: "name",
											valueField: "attr"
										},
										{
											fieldLabel: "卡项注释",
											xtype: "textarea",
											height: 230,
											allowBlank: true,
											name: "descript"
										},
										{
											xtype: "button",
											scale: "large",
											width: 200,
											text: "更新",
											hidden: me.b_type == "selection",
											handler: function(){
												me.processData(this);
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
								me.interestsPanel,
								me.chargeTypesPanel,
								me.rebatesPanel,
								me.packagesPanel
							]
						}
					]
				}
			],
		};
		var form = Ext.widget("form", config);
		me.cardInfo.form = form;
		me.cardInfo.add(form);
		me.cardInfo.doLayout();

		//update panel
		me.queue.Add("initInterspanel", function(){
			me.initializeInterestsPanel();
		});
		me.queue.Add("initChargepanel", function(){
			me.initializeChargeTypePanel();
		});
		me.queue.Add("initRebatespanel", function(){
			me.initializeRebatesPanel();
		});
		me.queue.Add("initPackagepanel", function(){
			me.initializePackagePanel();
		});
	},
	initializeInterestsPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.interestsPanel.__columns && me.interestsPanel.__columns.length > 0){
			return;
		}
		var columns = me.interestsPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除服务",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteInterest(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetInterestsPageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.interestsPanel.__fields = [];
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
				me.initializeInterestGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeInterestGrid: function(){
		var me = this, selectedInterests = me.selectedInterests;
		var __fields = me.interestsPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.interestsPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.interestsPanel.__columns
		});

		me.interestsPanel.add(grid);
		me.interestsPanel.doLayout();

		me.queue.triggle("initInterspanel", "success");
	},
	selectInterest: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择服务",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.InterestsList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addInterest(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addInterest: function(records, isRaw){
		var me = this, selectedInterests = me.selectedInterests;
		var __fields = me.interestsPanel.__fields;
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
			if (selectedInterests[cid] == undefined){
				selectedInterests[cid] = []
			}else{
				selectedInterests[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedInterests[cid].push(rawData[k]);
			}
		}

		me.updateInterestsPanel();
	},
	deleteInterest: function(record){
		var me = this, selectedInterests = me.selectedInterests;
		var cid = record.get("ID");
		if (selectedInterests[cid]){
			selectedInterests[cid] = null;
			delete selectedInterests[cid];
		}

		me.updateInterestsPanel();
	},
	updateInterestsPanel: function(){
		var me = this, selectedInterests = me.selectedInterests;
		var grid = me.interestsPanel.grid, store = grid.getStore();
		var __fields = me.interestsPanel.__fields;
		var tmp = []
		for (var c in selectedInterests){
			tmp.push(selectedInterests[c]);
		}
		store.loadData(tmp);
	},

	initializeChargeTypePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.chargeTypesPanel.__columns && me.chargeTypesPanel.__columns.length > 0){
			return;
		}
		var columns = me.chargeTypesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除费用",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteChargeType(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetChargeTypePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.chargeTypesPanel.__fields = [];
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
				me.initializeChargeGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeChargeGrid: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.chargeTypesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.chargeTypesPanel.__columns
		});

		me.chargeTypesPanel.add(grid);
		me.chargeTypesPanel.doLayout();
		me.queue.triggle("initChargepanel", "success");
	},
	selectChargeType: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择费用",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.ChargeList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addChargeType(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addChargeType: function(records, isRaw){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid, rawData;
			if (isRaw){
				cid = record["CID"];
				rawData = record;
			}else{
				cid = record.get("CID");
				rawData = record.raw;
			}
			if (selectedChargeType[cid] == undefined){
				selectedChargeType[cid] = []
			}else{
				selectedChargeType[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedChargeType[cid].push(rawData[k]);
			}
		}

		me.updateChargeTypePanel();
	},
	deleteChargeType: function(record){
		var me = this, selectedChargeType = me.selectedChargeType;
		var cid = record.get("CID");
		if (selectedChargeType[cid]){
			selectedChargeType[cid] = null;
			delete selectedChargeType[cid];
		}

		me.updateChargeTypePanel();
	},
	updateChargeTypePanel: function(){
		var me = this, selectedChargeType = me.selectedChargeType;
		var grid = me.chargeTypesPanel.grid, store = grid.getStore();
		var __fields = me.chargeTypesPanel.__fields;
		var tmp = []
		for (var c in selectedChargeType){
			tmp.push(selectedChargeType[c]);
		}
		store.loadData(tmp);
	},
	initializeRebatesPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.rebatesPanel.__columns && me.rebatesPanel.__columns.length > 0){
			return;
		}
		var columns = me.rebatesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除返利",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deleteRebate(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetRebatePageData(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.rebatesPanel.__fields = [];
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
				me.initializeRebateGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializeRebateGrid: function(){
		var me = this, selectedRebates = me.selectedRebates;
		var __fields = me.rebatesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.rebatesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.rebatesPanel.__columns
		});

		me.rebatesPanel.add(grid);
		me.rebatesPanel.doLayout();
		me.queue.triggle("initRebatespanel", "success");
	},
	selectRebate: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择返利",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.RebateList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addRebate(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addRebate: function(records, isRaw){
		var me = this, selectedRebates = me.selectedRebates;
		var __fields = me.rebatesPanel.__fields;
		if (records == undefined){
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var rid, rawData;
			if (isRaw){
				rid = record["RID"];
				rawData = record;
			}else{
				rid = record.get("RID");
				rawData = record.raw;
			}
			if (selectedRebates[rid] == undefined){
				selectedRebates[rid] = []
			}else{
				selectedRebates[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedRebates[rid].push(rawData[k]);
			}
		}

		me.updateRebatesPanel();
	},
	deleteRebate: function(record){
		var me = this, selectedRebates = me.selectedRebates;
		var rid = record.get("RID");
		if (selectedRebates[rid]){
			selectedRebates[rid] = null;
			delete selectedRebates[rid];
		}

		me.updateRebatesPanel();
	},
	updateRebatesPanel: function(){
		var me = this, selectedRebates = me.selectedRebates;
		var grid = me.rebatesPanel.grid, store = grid.getStore();
		var __fields = me.rebatesPanel.__fields;
		var tmp = []
		for (var c in selectedRebates){
			tmp.push(selectedRebates[c]);
		}
		store.loadData(tmp);
	},

	initializePackagePanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.packagesPanel.__columns && me.packagesPanel.__columns.length > 0){
			return;
		}
		var columns = me.packagesPanel.__columns = [];
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
			items: [
			]
		}
		_actions.items.push("-",{
			icon: "./resources/themes/images/fam/delete.gif",
			tooltip: "删除套餐",
			id: "customer_grid_delete",
			handler: function(grid, rowIndex, colIndex){
				var d = grid.store.getAt(rowIndex)
				me.deletePackage(d);
			}
		}, "-");

		columns.push(_actions);
		cardServer.GetPackagesPageDataToJSON(0, 1, "", {
			success: function(data){
				var data = Ext.JSON.decode(data)["MetaData"];
				var fields = me.packagesPanel.__fields = [];
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
				me.initializePackageGrid();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	initializePackageGrid: function(){
		var me = this, selectedPackages = me.selectedPackages;
		var __fields = me.packagesPanel.__fields;
		var store = Ext.create("Ext.data.ArrayStore", {
			fields: __fields
		})

		var grid = me.packagesPanel.grid = Ext.create("Ext.grid.Panel", {
			store: store,
			width: "100%",
			height: 200,
			cls: "iScroll",
			autoScroll: true,
			columnLines: true,
			columns: me.packagesPanel.__columns
		});

		me.packagesPanel.add(grid);
		me.packagesPanel.doLayout();
		me.queue.triggle("initPackagepanel", "success");
	},
	selectPackage: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "选择套餐",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.PackageList", {
			b_type: "selection",
			b_selectionMode: "MULTI",
			b_selectionCallback: function(records){
				if (records.length == 0){ win.close(); return;}
				me.addPackage(records);
				win.close();
			}
		}));
		win.doLayout();
	},
	addPackage: function(records, isRaw){
		var me = this, selectedPackages = me.selectedPackages;
		var __fields = me.packagesPanel.__fields;
		if (records == undefined){
			return;
		}
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var rid, rawData;
			if (isRaw){
				rid = record["ID"];
				rawData = record;
			}else{
				rid = record.get("ID");
				rawData = record.raw;
			}
			if (selectedPackages[rid] == undefined){
				selectedPackages[rid] = []
			}else{
				selectedPackages[cid] = [];
			}
			for (var c = 0; c < __fields.length; ++c){
				var k = __fields[c];
				selectedPackages[rid].push(rawData[k]);
			}
		}

		me.updatePackagesPanel();
	},
	deletePackage: function(record){
		var me = this, selectedPackages = me.selectedPackages;
		var rid = record.get("ID");
		if (selectedPackages[rid]){
			selectedPackages[rid] = null;
			delete selectedPackages[rid];
		}

		me.updatePackagesPanel();
	},
	updatePackagesPanel: function(){
		var me = this, selectedPackages = me.selectedPackages;
		var grid = me.packagesPanel.grid, store = grid.getStore();
		var __fields = me.packagesPanel.__fields;
		var tmp = []
		for (var c in selectedPackages){
			tmp.push(selectedPackages[c]);
		}
		store.loadData(tmp);
	},
	onSelectItem: function(record, detailData){
		var me = this, cardServer = Beet.constants.cardServer;
		me.resetAll();
		var cardId = record.get("ID");
		me.selectedCardId = cardId;

		var form = me.cardInfo.form.getForm();
		form.setValues({
			name: record.get("Name"),
			par: record.get("Par").replace(/,/g, ""),
			insure: record.get("Insure").replace(/,/g, ""),
			validdate: record.get("ValidDate"),
			validunit: parseInt(record.get("ValidUnit")),
			descript: record.get("Descript")
		});
		
		var charges = detailData["charges"],
			interests = detailData["interests"],
			packages = detailData["packages"],
			rebates = detailData["rebates"];

		if (charges && charges.length > 0){
			var sql = [];
			for (var c = 0; c < charges.length; ++c){
				sql.push("cid=" + charges[c]);
			}
			var s = sql.join(" OR ");
			if (s.length > 0){
				cardServer.GetChargeTypePageData(1, charges.length, s, {
					success: function(data){
						var data = Ext.JSON.decode(data)["Data"];
						me.addChargeType(data, true);
					},
					failure: function(error){
						Ext.Error.raise(error);
					}
				})
			}
		}
		if (interests && interests.length > 0){
			var sql = [];
			for (var c = 0; c < interests.length; ++c){
				sql.push("id=" + interests[c]);
			}
			var s = sql.join(" OR ");
			if (s.length > 0){
				cardServer.GetInterestsPageData(1, interests.length, s, {
					success: function(data){
						var data = Ext.JSON.decode(data)["Data"];
						me.addInterest(data, true);
					},
					failure: function(error){
						Ext.Error.raise(error);
					}
				})
			}
		}
		if (rebates && rebates.length > 0){
			var sql = [];
			for (var c = 0; c < rebates.length; ++c){
				sql.push("rid=" + rebates[c]);
			}
			var s = sql.join(" OR ");
			if (s.length > 0){
				cardServer.GetRebatePageData(1, rebates.length, s, {
					success: function(data){
						var data = Ext.JSON.decode(data)["Data"];
						me.addRebate(data, true);
					},
					failure: function(error){
						Ext.Error.raise(error);
					}
				})
			}
		}
		if (packages && packages.length > 0){
			var sql = [];
			for (var c = 0; c < packages.length; ++c){
				sql.push("id=" + packages[c]);
			}
			var s = sql.join(" OR ");
			if (s.length > 0){
				cardServer.GetPackagesPageDataToJSON(1, packages.length, s, {
					success: function(data){
						var data = Ext.JSON.decode(data)["Data"];
						me.addPackage(data, true);
					},
					failure: function(error){
						Ext.Error.raise(error);
					}
				})
			}
		}
	},
	resetAll: function(){
		var me = this;

		me.selectedCardId = undefined;
		me.selectedInterests = {};
		me.selectedChargeType = {};
		me.selectedRebates = {};
		me.selectedPackages = {};
		me.count = {
			interestsCount : 0,
			chargesCount : 0,
			rebatesCount: 0,
			packagesCount : 0
		}

		me.updateInterestsPanel();
		me.updateChargeTypePanel();
		me.updateRebatesPanel();
		me.updatePackagesPanel();
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), results = form.getValues();
		
		if (!me.selectedCardId){
			Ext.Error.raise("卡项ID无效!");
			return;
		}

		var selectedInterests = me.selectedInterests, selectedChargeType = me.selectedChargeType,
			selectedPackages = me.selectedPackages, selectedRebates = me.selectedRebates;

		//name descript products charges
		var interests = Ext.Object.getKeys(selectedInterests),
			charges = Ext.Object.getKeys(selectedChargeType),
			packages = Ext.Object.getKeys(selectedPackages),
			rebates = Ext.Object.getKeys(selectedRebates);
	
		if (interests && interests.length > 0){
			results["interests"] = interests;
		}

		if (charges && charges.length > 0){
			results["charges"] = charges;
		}

		if (packages && packages.length > 0){
			results["packages"] = packages;
		}

		if (rebates && rebates.length > 0){
			results["rebates"] = rebates;
		}

		results["id"] = me.selectedCardId;
		cardServer.UpdateCard(Ext.JSON.encode(results), {
			success: function(succ){
				if (succ){
					Ext.MessageBox.show({
						title: "提示",
						msg: "更新卡项成功!",
						buttons: Ext.MessageBox.OK,
						fn: function(btn){
							form.reset()
							me.resetAll();
							me.cardInfo.close();
							me.storeProxy.loadPage(me.storeProxy.currentPage);
						}
					});
				}else{
					Ext.Msg.alert("更新失败", "更新卡项失败");
				}
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		})
	}
})
