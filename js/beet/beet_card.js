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

			]
		}
	]
});


Ext.namespace("Beet.apps.ProductsViewPort");


/*
Ext.define("Beet.apps.ProductsViewPort.AddProductItem", {
	extend: "Ext.form.Panel",
	height: "100%",
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	flex: 1,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
	
		me.callParent()	
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
						columns: 3,
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
							fieldLabel: "产品名称",
							name: "name",
							allowBlank: false
						},
						{
							fieldLabel: "产品价格",
							name: "price",
							allowBlank: false
						},
						{
							fieldLabel: "产品所属服务",
							name: "service",
							allowBlank: false,
							xtype: "combobox",
							editable: false,
							store: Beet.constants.ServiceList,
							queryMode:"local",
							displayField: "name",
							valueField: "attr"
						},
						{
							fieldLabel: "注释",
							name: "descript",
							allowBlank: true
						},
						{
							fieldLabel: "规格",
							name: "standards",
							allowBlank: false
						},
						{
							fieldLabel: "有效性",
							name: "effective",
							xtype: "checkbox",
							checked: true,
						},
						{
							xtype: "component",
							colspan: 2
						},
						{
							xtype: "button",
							text: "提交",
							handler: function(btn, widget){
								me.processData(this)	
							}
						}
					]
				}
			]
		}

		var form = Ext.widget("panel", config);
		me.add(form);
		me.doLayout();
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = f.up("form").getForm(), result = form.getValues();
		result["effective"] = result["effective"] == "on" ? 1 : 0;
		cardServer.AddProductItem(Ext.JSON.encode(result), {
			success: function(pid){
				if (pid > 0){
					Ext.MessageBox.show({
						title: "提示",
						msg: "添加产品成功!",
						buttons: Ext.MessageBox.YESNO,
						fn: function(btn){
							if (btn == "yes"){
								form.reset()
							}else{
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
	}
});

//only show grid
Ext.define("Beet.apps.ProductsViewPort.ProductItemsList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll: true,
	height: "100%",
	width: "100%",
	frame: true,
	border: false,
	shadow: true,
	b_filter: "",
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer
		if (me.b_type == "selection"){
			me.editable = false;
		}else{
			me.editable = true;
		}

		me.callParent();

		//add advancePanel

		cardServer.GetProductItemPageData(0, 1, "", {
			success: function(data){
				var win = Ext.create("Beet.apps.AdvanceSearch", {
					searchData: Ext.JSON.decode(data),
					b_callback: function(where){
						me.b_filter = where;
						me.getProductItemMetaData();
					}
				});
				win.show();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	},
	getProductItemMetaData: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		cardServer.GetProductItemPageData(0, 1, "", {
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
		
		if (!Beet.apps.ProductsViewPort.ProductItemModel){
			Ext.define("Beet.apps.ProductsViewPort.ProductItemModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		if (!Beet.apps.ProductsViewPort.ProductItemStore){
			Ext.define("Beet.apps.ProductsViewPort.ProductItemStore", {
				extend: "Ext.data.Store",
				model: Beet.apps.ProductsViewPort.ProductItemModel,
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
					b_method: cardServer.GetProductItemPageData,
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
		var me = this, grid = me.grid, sm = null;
		if (me.b_type == "selection"){
			sm = Ext.create("Ext.selection.CheckboxModel", {
				mode: "SINGLE"
			});
			me.selModel = sm;
		}
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.ProductsViewPort.ProductItemStore")
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
					me.editProductItem(d);
				}
			}
		);
		
		if (me.b_type == "selection") {
		}else{
			_actions.items.push("-", "-", "-",{
				icon: "./resources/themes/images/fam/delete.gif",
				tooltip: "删除产品",
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
			border: 0,
			selModel: sm,
			height: me.editable ? "100%" : "95%",
			width: "100%",
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
	editProductItem: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["P_PID"], pname = rawData["P_Name"], cardServer = Beet.constants.cardServer;
		if (pid && me.editable){
			Ext.MessageBox.show({
				title: "编辑产品",
				msg: "是否要更新" + pname + " 的资料",
				buttons: Ext.MessageBox.YESNO,
				fn : function(btn){
					if (btn == "yes"){
						var win = Ext.create("Beet.apps.ProductsViewPort.ViewProductItem", {
							editable: true,
							storeProxy: me.storeProxy,
							rawData: rawData	
						});
						win.show();
					}
				}
			})	
		}else{
			var win = Ext.create("Beet.apps.ProductsViewPort.ViewProductItem", {
				editable: false,
				storeProxy: me.storeProxy,
				rawData: rawData	
			});
			win.show();
		}
		
	},
	deleteProductItem: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["P_PID"], pname = rawData["P_Name"], cardServer = Beet.constants.cardServer;

		if (pid){
			Ext.MessageBox.show({
				title: "删除产品",
				msg: "是否要删除 " + pname + " ?",
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						cardServer.DeleteProductItem(pid, {
							success: function(){
								Ext.MessageBox.show({
									title: "删除成功",
									msg: "删除产品: " + pname + " 成功",
									buttons: Ext.MessageBox.OK,
									fn: function(){
										me.storeProxy.loadPage(me.storeProxy.currentPage);
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
			Ext.Error.raise("删除产品失败");
		}
	}
});

Ext.define("Beet.apps.ProductsViewPort.ViewProductItem", {
	extend: "Ext.window.Window",
	title: "#",
	width: 300,
	height: 240,
	autoScroll: true,
	autoHeight: true,
	layout: "fit",
	resizable: true,
	border: false,
	modal: true,
	maximizable: true,
	border: 0,
	bodyBorder: false,
	editable: false,
	_rowIndex: null,
	initComponent: function(){
		var me = this, storeProxy = me.storeProxy, cardServer = Beet.constants.cardServer;

		if (me.rawData){
			rawData = me.rawData;
		}else{
			if (me._rowIndex != null){
				var d = storeProxy.getAt(me._rowIndex);
				me.rawData = rawData;
			}
		}

		me.callParent();
		me.setTitle(rawData["P_Name"]);
		me.createProductItemInfo(rawData);
	},
	createProductItemInfo: function(data){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			autoHeight: true,
			autoScroll: true,
			border: false,
			bodyBorder: false,
			plain: true,
			frame: true,
			flex: 1,
			height: "100%",
			bodyStyle: {
				margin: "20 0 0 20"
			},
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
						bodyStyle: "background-color: #dfe8f5",
						readOnly: !me.editable,
						editable: me.editable
					},
					defaultType: "textfield",
					fieldDefaults: {
						msgTarget: "side",
						labelAlign: "top",
						labelWidth: 60
					},
					items: [
						{
							fieldLabel: "产品名称",
							name: "name",
							allowBlank: false,
							value: data.P_Name,
							dataIndex: "P_Name"
						},
						{
							fieldLabel: "产品价格",
							name: "price",
							allowBlank: false,
							value: data.P_Price,
							dataIndex: "P_Price"
						},
						{
							fieldLabel: "产品所属服务",
							name: "service",
							allowBlank: false,
							xtype: "combobox",
							editable: false,
							store: Beet.constants.ServiceList,
							queryMode:"local",
							displayField: "name",
							valueField: "attr",
							value: data.ServiceID,
							dataIndex: "ServiceID"
						},
						{
							fieldLabel: "注释",
							name: "descript",
							allowBlank: true,
							value: data.P_Descript,
							dataIndex: "P_Descript"
						},
						{
							fieldLabel: "有效性",
							name: "effective",
							xtype: "checkbox",
							checked: data.P_Effective == "True" ? true : false
						},
						{
							fieldLabel: "规格",
							name: "standards",
							allowBlank: false,
							value: data.P_Standards,
							dataIndex: "P_Standards"
						}
					],
					buttons: [
						{
							text: "提交",
							handler: function(btn, widget){
								me.processData(this, data)	
							},
							hidden: !me.editable
						},
						{
							text: "取消",
							handler: function(){
								me.close();
							},
							hidden: !me.editable
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.add(form);
		me.doLayout();
	},
	processData: function(f, rawData){
		var me = this, cardServer = Beet.constants.cardServer;

		if (!me.editable){
			return;
		}
		var form = f.up("form").getForm(), result = form.getValues();
		result["pid"] = rawData["P_PID"];
		result["effective"] = result["effective"] == "on" ? true : false;
		var needSubmitData = Ext.JSON.encode(result);

		cardServer.UpdateProductItem(needSubmitData,{
			success: function(pid){
				if (pid){
					Ext.MessageBox.show({
						title: "提示",
						msg: "更新成功!",
						buttons: Ext.MessageBox.OK,
						fn: function(btn){
							me.storeProxy.loadPage(me.storeProxy.currentPage);
							me.close();
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
	}
})

Ext.define("Beet.apps.ProductsViewPort.UpdateProductItem", {
	extend: "Ext.panel.Panel",
	height: "100%",
	width: "100%",
	border: false,
	plain: true,
	initComponent: function(){
		var me = this;
		me.callParent();
		me.add(Ext.create("Beet.apps.ProductsViewPort.ProductItemsList"));
		me.doLayout();
	}
});
*/
Ext.define("Beet.apps.ProductsViewPort.ProductCategoryTree",{
	extend: "Ext.panel.Panel",
	cls: "iScroll",
	frame: true,
	rootVisible: true,
	height: "100%",
	width: "100%",
	layout: {
		type: "hbox",
		columns: 2
	},
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		me.buildStore();
		me.callParent();
		me.categoryList = [];

		me.createTreeList();
	},
	buildStore: function(){
		var me = this;
		if (!Beet.apps.ProductsViewPort.ProductCatgoryTreeStore){
			Ext.define("Beet.apps.ProductsViewPort.ProductCatgoryTreeStore", {
				extend: "Ext.data.TreeStore",
				autoLoad: true,
				root: {
					text: "总分类",
					id: "src",
					expanded: true
				},
				proxy: {
					type: "b_proxy",
					b_method: Beet.constants.cardServer.GetProductCategoryData,
					preProcessData: function(data){
						var originData = data["root"];
						var bucket = [];
						//reset
						me.categoryList = [];
						
						var processData = function(target, cache, pid){
							var k;
							for (k = 0; k < target.length; ++k){
								var _tmp = target[k];
								var item = {};
								if (_tmp.data && _tmp.data.length > 0){
									item["expanded"] = true;
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
	},
	refreshTreeList: function(){
		var me = this;
		me.storeProxy.load();
	},
	createTreeList: function(){
		var me= this, cardServer = Beet.constants.cardServer, store;
		me.storeProxy = store = Ext.create("Beet.apps.ProductsViewPort.ProductCatgoryTreeStore");
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			frame: true,
			lookMask: true,
			width: 300,
			height: 500,
			border: 0,
			useArrow: true,
			split: true
		});

		me.treeList.on({
			"beforeitemcontextmenu": me.treeListRClick,
			scope: me
		});
		me.add(me.treeList);
		me.doLayout();
	},
	treeListRClick: function(frame, record, item, index, e, options){
		var me = this, isLeaf = record.isLeaf();
		if (!record.contextMenu){
			var menu = [];

			if (record.isRoot()){
				menu = [
					{
						text: "增加分类", 
						handler: function(direction, e){
							me.addItem(direction, record, e)	
						}
					}
				]
			}else{
				menu = [
					{text: "增加分类", handler: function(direction, e){
						me.addItem(direction, record, e);	
					}},
					{text: "编辑", handler: function(direction, e){
						me.editItem(direction, record, e)	
					}},
					{text: "删除", handler: function(direction, e){
						me.deleteItem(direction, record, e);	
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
	},
	categoryListCombo: function(){
		var me = this;
		return Ext.create("Ext.data.Store", {
			fields: ["id", "text"],
			data: me.categoryList	
		})
	},
	addItem: function(widget, record, e){
		var me = this, cardServer = Beet.constants.cardServer;
		var CLCombo = me.categoryListCombo();
		if (me.addForm){
			me.remove(me.addForm);
		}
		if (me.editForm){
			me.remove(me.editForm);
		}
		me.doLayout();

		var form = Ext.create("Ext.form.Panel", {
			width: "50%",
			height: 300,
			bodyStyle: "background-color: #dfe8f5",
			border: false,
			flex: 1,
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
						cardServer.AddProductCategory(Ext.JSON.encode(result), {
							success: function(id){
								if (id > 0){
									Ext.Msg.alert("添加成功", "添加分类成功");
									me.remove(form);
									me.doLayout();
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

		me.addForm = me.add(form);
		me.doLayout();
	},
	deleteItem: function(width, record, e){
		var me = this, cardServer = Beet.constants.cardServer;
		var id = record.get("id");
		if (id == "src"){
			return;
		}

		Ext.Msg.alert("删除分类", "你确定需要删除 " + record.get("text") + " 吗?", function(btn){
			console.log(btn)	
			cardServer.DeleteProductCategory(id, {
				success: function(succ){
					if (succ) {
						Ext.Msg.alert("删除成功", "删除分类 "+ record.get("text") + " 成功");
						Ext.refreshTreeList();
					}
				},
				failure: function(error){
					Ext.Error.raise(error)
				}
			});
		}, me)
	},
	editItem: function(widget, record, e){
		var me = this, cardServer = Beet.constants.cardServer;
		var CLCombo = me.categoryListCombo();
		if (me.editForm){
			me.remove(me.editForm);
		}
		if (me.addForm){
			me.remove(me.addForm);
		}
		me.doLayout();

		var form = Ext.create("Ext.form.Panel", {
			width: "50%",
			height: 300,
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
						cardServer.UpdateProductCategory(Ext.JSON.encode(result), {
							success: function(succ){
								if (succ){
									Ext.Msg.alert("编辑成功", "编辑分类成功");
									me.remove(form);
									me.doLayout();
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

		me.editForm= me.add(form);
		me.doLayout();
	}
});

function buildProductCategoryTreeStore(){
	console.log(this);
	if (!Beet.apps.ProductsViewPort.ProductCatgoryTreeStore){
		Ext.define("Beet.apps.ProductsViewPort.ProductCatgoryTreeStore", {
			extend: "Ext.data.TreeStore",
			autoLoad: true,
			root: {
				text: "总分类",
				id: "-1",
				expanded: true
			},
			proxy: {
				type: "b_proxy",
				b_method: Beet.constants.cardServer.GetProductCategoryData,
				preProcessData: function(data){
					var originData = data["root"];
					var bucket = [];
					
					var processData = function(target, cache, pid){
						var k;
						for (k = 0; k < target.length; ++k){
							var _tmp = target[k];
							var item = {};
							if (_tmp.data && _tmp.data.length > 0){
								item["expanded"] = true;
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
	height: "100%",
	width: "100%",
	layout: {
		type: "hbox",
		columns: 2
	},
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
		me.createMainPanel();
		me.buildStore();
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		var config = {
			autoHeight: true,
			autoScroll: true,
			border: false,
			flex: 1,
			bodyBorder: false,
			items: [
				{
					layout: {
						type: "table",
						columns: 3,
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
							fieldLabel: "产品数目",
							name: "count",
							allowBlank: false
						},
						{
							fieldLabel: "产品价格",
							name: "price",
							allowBlank: false
						},
						{
							fieldLabel: "产品生效日期",
							xtype: "datefield",
							allowBlank: false,
							value: new Date(),
							name: "startdate",
							format: "Y/m/d"
						},
						{
							fieldLabel: "产品失效日期",
							xtype: "datefield",
							allowBlank: false,
							name: "enddate",
							format: "Y/m/d"
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
							fieldLabel: "注释",
							name: "descript",
							allowBlank: true,
						},
						{
							fieldLabel: "产品分类",
							name: "category",
							readOnly: true,
							emptyMsg: "点击侧边分类列表, 自动填入"
						},
						{
							xtype: "component",
							colspan: 1
						},
						{
							xtype: "button",
							text: "提交",
							width: 200,
							handler: function(btn, widget){
								me.processData(this)	
							}
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.form.setHeight("100%");
		me.add(form);
		me.doLayout();
	},
	buildStore: function(){
		var me = this;
		Ext.bind(buildProductCategoryTreeStore, me)();
		me.createTreeList();
	},
	refreshTreeList: function(){
		var me = this;
		me.storeProxy.load();
	},
	createTreeList: function(){
		var me= this, cardServer = Beet.constants.cardServer, store;
		me.storeProxy = store = Ext.create("Beet.apps.ProductsViewPort.ProductCatgoryTreeStore");
		me.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			frame: true,
			lookMask: true,
			width: 300,
			height: 500,
			border: 0,
			useArrow: true,
			split: true,
		});

		me.treeList.on({
			itemclick: me.treeItemClick,
			scope: me
		})

		me.add(me.treeList);
		me.doLayout();
	},
	treeItemClick: function(frame, record, item, index, e, options){
		var me = this;
		if (!record){return;}

		me.selectProductCategoryId = parseInt(record.get("id"));

		me.form.getForm().setValues({
			"category" : record.get("text")	
		})
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = f.up("form").getForm(), result = form.getValues();
		if (me.selectProductCategoryId){
			result["categoryid"] = me.selectProductCategoryId;
			delete result["category"];
		}

		result["startdate"] = +new Date(result["startdate"]) / 1000;
		result["enddate"] = +new Date(result["enddate"]) / 1000;

		console.log(result)
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
	}
});

Ext.define("Beet.apps.ProductsViewPort.UpdateProducts", {
	extend: "Ext.panel.Panel",
	height: "100%",
	width: "100%",
	border: false,
	plain: true,
	initComponent: function(){
		var me = this;
		me.callParent();
		me.add(Ext.create("Beet.apps.ProductsViewPort.ProductsList"));
		me.doLayout();
	}
});

Ext.define("Beet.apps.ProductsViewPort.ProductsList", {
	extend: "Ext.panel.Panel",
	autoHeight: true,
	autoScroll: true,
	height: "100%",
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
		/*
		cardServer.GetProductPageData(0, 1, "", {
			success: function(data){
				var win = Ext.create("Beet.apps.AdvanceSearch", {
					searchData: Ext.JSON.decode(data),
					b_callback: function(where){
						me.b_filter = where;
					}
				});
				win.show();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
		*/
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
		
		if (!Beet.apps.ProductsViewPort.ProductsModel){
			Ext.define("Beet.apps.ProductsViewPort.ProductsModel", {
				extend: "Ext.data.Model",
				fields: fields
			});
		}

		//need reset?
		if (Beet.apps.ProductsViewPort.ProductsStore){
			Beet.apps.ProductsViewPort.ProductsStore = null;
		}
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
			},
			proxy: {
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
		});

		me.createGrid();
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
			height: "100%",
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			border: 0,
			selModel: sm,
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
				"->",
				{
					xtype: "button",
					text: "高级搜索"
				}
			]
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
	editProductItem: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
		if (pid && me.editable){
			Ext.MessageBox.show({
				title: "编辑消费产品",
				msg: "是否要更新 " + pname + " 的资料",
				buttons: Ext.MessageBox.YESNO,
				fn : function(btn){
					if (btn == "yes"){
						var win = Ext.create("Beet.apps.ProductsViewPort.ViewProducts", {
							editable: true,
							storeProxy: me.storeProxy,
							rawData: rawData	
						});
						win.show();
					}
				}
			})	
		}else{
			var win = Ext.create("Beet.apps.ProductsViewPort.ViewProducts", {
				editable: false,
				storeProxy: me.storeProxy,
				rawData: rawData	
			});
			win.show();
		}
	},
	deleteProductItem: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
		if (pid){
			Ext.MessageBox.show({
				title: "删除消费产品",
				msg: "是否要删除消费产品 " + pname + " ? 是否同时还需要删除产品 " + rawData["PItemName"] + " ?<br/>Yes: 同时删除消费产品和产品;<br/>No: 只删除消费产品;<br/>Cancel: 取消删除,关闭对话框",
				buttons: Ext.MessageBox.YESNOCANCEL,
				fn: function(btn){
					if (btn == "yes" || btn == "no"){
						var needDeleteItem = (btn == "yes") ? true : false;
						cardServer.DeleteProducts(pid, needDeleteItem, rawData["PItemId"],{
							success: function(succ){
								if (succ){
									Ext.MessageBox.show({
										title: "删除成功",
										msg: "删除消费产品: " + pname + " 成功",
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

Ext.define("Beet.apps.ProductsViewPort.ViewProducts", {
	extend: "Ext.window.Window",
	title: "#",
	width: 280,
	height: 310,
	autoScroll: true,
	autoHeight: true,
	layout: "fit",
	resizable: true,
	border: false,
	modal: true,
	maximizable: true,
	border: 0,
	bodyBorder: false,
	editable: false,
	_rowIndex: null,
	initComponent: function(){
		var me = this, storeProxy = me.storeProxy, cardServer = Beet.constants.cardServer;

		if (me.rawData){
			rawData = me.rawData;
		}else{
			if (me._rowIndex != null){
				var d = storeProxy.getAt(me._rowIndex);
				me.rawData = rawData;
			}
		}

		me.callParent();
		me.setTitle(rawData["PName"]);
		me.createProductItemInfo(rawData);
	},
	createProductItemInfo: function(data){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			autoHeight: true,
			autoScroll: true,
			border: false,
			bodyBorder: false,
			plain: true,
			frame: true,
			flex: 1,
			height: "100%",
			bodyStyle: {
				margin: "20 0 0 20"
			},
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
						bodyStyle: "background-color: #dfe8f5",
						readOnly: !me.editable,
						editable: me.editable,
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
							fieldLabel: "产品数目",
							name: "count",
							allowBlank: false
						},
						{
							fieldLabel: "所属产品",
							name: "pid",
							allowBlank: false,
							xtype: "trigger",
							editable: false,
							onTriggerClick: function(){
								me.triggerOpenSelectProduct(this);
							}
						},
						{
							fieldLabel: "产品总价",
							id: "p_total",
							name: "p_total",
							readOnly: true
						},
						{
							fieldLabel: "消费次数",
							name: "stepcount",
							allowBlank: false
						},
						{
							fieldLabel: "折扣价格",
							allowBlank: false,
							name: "realprice",
							editable: false,
							listeners: {
								scope: me,
								blur: function(){
									me.onUpdateForm(true);
								}
							}
						},
						{
							fieldLabel: "折扣",
							allowBlank: false,
							name: "p_sale"
						},
					],
					buttons: [
						{
							text: "提交",
							handler: function(btn, widget){
								me.processData(this, data)	
							},
							hidden: !me.editable
						},
						{
							text: "取消",
							handler: function(){
								me.close();
							},
							hidden: !me.editable
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		me.restoreFromData();
	},
	restoreFromData: function(){
		var me = this, rawData = me.rawData, form = me.form.getForm();
		me.selectedProductItem = {
			customable: true,
			pid: rawData["PItemID"],
			pname: rawData["PItemName"],
			p_price: rawData["PPrice"] / rawData["PCount"]
		}
		form.setValues({
			name: rawData["PName"],
			count: rawData["PCount"],
			pid: rawData["PItemName"],
			p_total: rawData["PPrice"],
			stepcount: rawData["PStepCount"],
			realprice: rawData["PRealPrice"],
			p_sale: rawData["PRate"]
		})
	},
	triggerOpenSelectProduct: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			extend: "Ext.window.Window",
			title: "产品",
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

		win.add(Ext.create("Beet.apps.ProductsViewPort.ProductItemsList", {
			b_type: "selection",
			b_selectionCallback: function(record){
				var record = record[0];
				if (record.get("P_Effective") == "False"){
					Ext.Msg.alert("警告","该产品无效, 请重新选择");
					return;
				}
				me.selectedProductItem = record;
				win.close();
				var rawData = record.raw;
				f.setValue(rawData["P_Name"]);
				me.onUpdateForm();
			}
		}));
		win.doLayout();
	},
	onUpdateForm: function(force){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = me.form.getForm();
		if (me.selectedProductItem == null){
			return;
		}else{
			if (me.selectedProductItem.customable){
			}else{
				if (me.selectedProductItem.raw){
				}else{
					return;
				}
			}
		}
		
		var values = form.getValues();
		var count = 0, sale = 1;
		var productPrice = me.selectedProductItem.customable ? me.selectedProductItem["p_price"] : me.selectedProductItem.get("P_Price");

		if (values["p_sale"] > 0){
			sale = values["p_sale"];
		}

		count = values["count"]
		var totalPrice = productPrice * count, realprice;
		if (force){
			sale = values["realprice"] / totalPrice;
			realprice = values["realprice"];
		}else{
			realprice = sale * totalPrice;
		}

		form.setValues({
			"p_total": totalPrice.toFixed(2),
			"realprice": realprice.toFixed(2),
			"p_sale": parseFloat(sale).toFixed(2)
		});
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		me.onUpdateForm();//lastupdate
		var form = f.up("form").getForm(), result = form.getValues();
		if (me.selectedProductItem == null){
			Ext.Error.raise("添加失败!");
			return;
		}
		
		result["pid"] = me.selectedProductItem.customable ? me.selectedProductItem["pid"] : me.selectedProductItem.get("P_PID");//productItem id
		result["id"] = me.rawData["PID"];//products id
		cardServer.UpdateProducts(Ext.JSON.encode(result), {
			success: function(succ){
				if (succ){
					Ext.MessageBox.show({
						title: "提示",
						msg: "更新消费产品成功!",
						buttons: Ext.MessageBox.YES,
						fn: function(btn){
							if (btn == "yes"){
								me.storeProxy.loadPage(me.storeProxy.currentPage);
								me.close();
							}
						}
					});
				}else{
					Ext.Error.raise("更新消费产品失败");
				}
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
	}
});

//charge
Ext.define("Beet.apps.ProductsViewPort.AddCharge", {
	extend: "Ext.form.Panel",
	height: "100%",
	width: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	flex: 1,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;

		me.callParent()	
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
							fieldLabel: "是否有效",
							name: "effective",
							xtype: "checkbox",
							checked: true,
							inputValue: 1
						},
						{
							xtype: "button",
							text: "提交",
							disabled: true,
							formBind: true,
							handler: function(btn, widget){
								me.processData(this)	
							}
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();
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
});

Ext.define("Beet.apps.ProductsViewPort.UpdateCharge", {
	extend: "Ext.panel.Panel",
	height: "100%",
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
	height: "100%",
	width: "100%",
	frame: true,
	border: false,
	shadow: true,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		if (me.b_type == "selection"){
			me.editable = false;
		}else{
			me.editable = true;
		}

		me.callParent();

		cardServer.GetChargeTypePageData(0, 1, "", {
			success: function(data){
				var win = Ext.create("Beet.apps.AdvanceSearch", {
					searchData: Ext.JSON.decode(data),
					b_callback: function(where){
						me.b_filter = where;
						me.getProductsMetaData();
					}
				});
				win.show();
			},
			failure: function(error){
				Ext.Error.raise(error);
			}
		});
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
				},
				proxy: {
					type: "b_proxy",
					b_method: cardServer.GetChargeTypePageData,
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
		var me = this, grid = me.grid, sm = null;
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
			height: !me.editable ? "95%" : "100%",
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
	editChargeType: function(parentMenu){
		var me = this, rawData = parentMenu.rawData || parentMenu.raw, cid = rawData["CID"], cname = rawData["CName"], cardServer = Beet.constants.cardServer;
		if (cid && me.editable){
			Ext.MessageBox.show({
				title: "编辑费用",
				msg: "是否要更新 " + cname + " 的资料",
				buttons: Ext.MessageBox.YESNO,
				fn : function(btn){
					if (btn == "yes"){
						var win = Ext.create("Beet.apps.ProductsViewPort.ViewChargeType", {
							editable: true,
							storeProxy: me.storeProxy,
							rawData: rawData	
						});
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

Ext.define("Beet.apps.ProductsViewPort.ViewChargeType", {
	extend: "Ext.window.Window",
	title: "#",
	width: 280,
	height: 270,
	autoScroll: true,
	autoHeight: true,
	layout: "fit",
	resizable: true,
	border: false,
	modal: true,
	maximizable: true,
	border: 0,
	bodyBorder: false,
	editable: false,
	_rowIndex: null,
	initComponent: function(){
		var me = this, storeProxy = me.storeProxy, cardServer = Beet.constants.cardServer;

		if (me.rawData){
			rawData = me.rawData;
		}else{
			if (me._rowIndex != null){
				var d = storeProxy.getAt(me._rowIndex);
				me.rawData = rawData;
			}
		}

		me.callParent();
		me.setTitle(rawData["CName"]);
		me.createChargeType(rawData);
	},
	createChargeType: function(data){
		var me = this, cardServer = Beet.constants.cardServer;
		var config = {
			autoHeight: true,
			autoScroll: true,
			border: false,
			bodyBorder: false,
			plain: true,
			frame: true,
			flex: 1,
			height: "100%",
			bodyStyle: {
				margin: "20 0 0 20"
			},
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
						bodyStyle: "background-color: #dfe8f5",
						readOnly: !me.editable,
						editable: me.editable,
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
							checked: data["CApplyRate"] == "False" ? false : true,
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
							fieldLabel: "是否有效",
							name: "effective",
							xtype: "checkbox",
							checked: data["CEffective"] == "False" ? false : true,
							inputValue: 1
						}
					],
					buttons: [
						{
							text: "提交",
							handler: function(btn, widget){
								me.processData(this, data)	
							},
							hidden: !me.editable
						},
						{
							text: "取消",
							handler: function(){
								me.close();
							},
							hidden: !me.editable
						}
					]
				}
			]
		}

		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();

		me.restoreFromData();
	},
	restoreFromData: function(){
		var me = this, rawData = me.rawData, form = me.form.getForm();
		var discount = parseFloat(rawData["CCost"]) * parseFloat(rawData["CRate"]);
		form.setValues({
			name: rawData["CName"],
			cost: rawData["CCost"],
			rate: rawData["CRate"],
			discount: discount
		})
	},
	onUpdateForm: function(force){
		var me = this, cardServer = Beet.constants.cardServer;
		var form = me.form.getForm();
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
								me.storeProxy.loadPage(me.storeProxy.currentPage);
								me.close();
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
});


// 项目
Ext.define("Beet.apps.ProductsViewPort.AddItem", {
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
		me.selectedProducts = {};
		me.selectedChargeType = {};

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

		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定消费产品",
				handler: function(){
					me.selectProducts();
				}
			}]	
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					me.selectChargeType();
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
											fieldLabel: "注释",
											xtype: "textarea",
											height: 130,
											allowBlank: true,
											name: "descript"
										},
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
								me.productsPanel,
								me.chargeTypesPanel
							]
						}
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
		cardServer.GetProductPageData(0, 1, "", {
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
				height: 448,
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
			title: "选择消费产品",
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
	addProducts: function(records){
		var me = this, selectedProducts = me.selectedProducts;
		var __fields = me.productsPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var pid = record.get("PID");
			var rawData = record.raw;
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
			height: 448,
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
	addChargeType: function(records){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid = record.get("CID");
			var rawData = record.raw;
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
	resetAll: function(){
		var me = this;
		//reset all
		me.selectedChargeType = {};
		me.selectedProducts = {};	

		me.productsPanel.grid.getStore().loadData([]);
		me.chargeTypesPanel.grid.getStore().loadData([]);
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), result = form.getValues();
		var selectedProducts = me.selectedProducts, selectedChargeType = me.selectedChargeType;

		//name descript products charges
		var products = Ext.Object.getKeys(selectedProducts);
		var charges = Ext.Object.getKeys(selectedChargeType);

		if (products && products.length > 0){
			result["products"] = products;
		}

		if (charges && charges.length > 0){
			result["charges"] = charges;
		}

		cardServer.AddItem(Ext.JSON.encode(result), {
			success: function(itemId){
				if (itemId > 0){
					Ext.MessageBox.show({
						title: "提示",
						msg: "添加项目成功!",
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

Ext.define("Beet.apps.ProductsViewPort.ItemList", {
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
		var _actions = {
			xtype: 'actioncolumn',
			width: 30,
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

		var grid = me.itemList.grid = Ext.create("Ext.grid.Panel", {
			autoHeight: true,
			height: 480,
			cls:"iScroll",
			autoScroll: true,
			border: true,
			plain: true,
			flex: 1,
			store: store,
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

		me.itemList.store.on("load", function(){
			if (me.itemList.store.getCount() > 0){
				me.fireSelectGridItem();
			}
		})

		me.createMainPanel();
	},
	fireSelectGridItem: function(){
		var me = this;
		me.itemList.grid.fireEvent("itemdblclick", me.itemList.grid, me.itemList.store.getAt(me.selectedItemIndex), null, me.selectedItemIndex)
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: 480,
			cls: "iScroll",
			border: true,
			plain: true,
			flex: 1,
			bodyStyle: "background-color: #dfe8f5"
		}

		me.productsPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定消费产品",
				handler: function(){
					me.selectProducts();
				}
			}]	
		}));
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					me.selectChargeType();
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
					height: 500,
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
							height: 500,
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
											fieldLabel: "注释",
											allowBlank: true,
											name: "descript"
										},
									]
								},
								me.itemList.grid
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
								me.productsPanel,
								me.chargeTypesPanel
							]
						}
					]
				}
			],
			bbar:[
				"->",
				{
					text: "提交",
					xtype: "button",
					border: 1,
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
		cardServer.GetProductPageData(0, 1, "", {
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
				height: 448,
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
			title: "选择消费产品",
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
			height: 448,
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
			cardServer.GetItemProducts(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["products"];
					var sql = [];
					for (var c = 0; c < data.length; ++c){
						sql.push("pid=" + data[c]);
					}
					var s = sql.join(" OR ");
					if (s.length > 0){
						cardServer.GetProductPageData(1, 1000000, s, {
							success: function(data){
								var data = Ext.JSON.decode(data)["Data"];
								me.itemList.cache[itemId].products = data;
								me.addProducts(data, true);
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
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), result = form.getValues();
		var selectedProducts = me.selectedProducts, selectedChargeType = me.selectedChargeType;
		if (me.selectedItemId < 0){
			return;
		}

		//name descript products charges
		var products = Ext.Object.getKeys(selectedProducts);
		var charges = Ext.Object.getKeys(selectedChargeType);

		if (products && products.length > 0){
			result["products"] = products;
		}

		if (charges && charges.length > 0){
			result["charges"] = charges;
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
							me.selectedProducts = {};
							me.selectedChargeType = {};
							me.updateProductsPanel();
							me.updateChargeTypePanel();
							if (me.itemList.cache[me.selectedItemId]){
								me.itemList.cache[me.selectedItemId] = {};
								delete me.itemList.cache[me.selectedItemId];
							}
							me.itemList.store.loadPage(me.itemList.store.currentPage);
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

		cardServer.GetProductPageData(0, 1, "", {
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
			cardServer.GetItemProducts(itemId, {
				success: function(data){
					data = Ext.JSON.decode(data)["products"];
					var sql = [];
					for (var c = 0; c < data.length; ++c){
						sql.push("pid=" + data[c]);
					}
					var s = sql.join(" OR ");
					if (s.length > 0){
						cardServer.GetProductPageData(1, 1000000, s, {
							success: function(data){
								var data = Ext.JSON.decode(data)["Data"];
								me.itemList.cache[itemId].products = data;
								me.addProducts(data, true);
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
		me.selectedChargeType = {};
		me.count = {
			itemsCount : 0,
			chargesCount : 0
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
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					me.selectChargeType();
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
											fieldLabel: "消费次数",
											allowBlank: false,
											value: 1,
											name: "stepcount"
										},
										{
											fieldLabel: "单次折扣价格",
											allowBlank: false,
											value: 1,
											name: "_perscaleprice",
											readOnly: true,
											editable: false
										},
										{	
											xtype: "datefield",
											fieldLabel: "开始日期",
											allowBlank: false,
											format: "Y/m/d",
											name: "startdate",
											value: new Date()
										},
										{
											xtype: "datefield",
											fieldLabel: "结束日期",
											allowBlank: false,
											name: "enddate",
											format: "Y/m/d"
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
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							flex: 2,
							height: 500,
							items: [
								me.itemsPanel,
								me.chargeTypesPanel
							]
						}
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
		me.initializeChargeTypePanel();
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
			height: 215,
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
	addChargeType: function(records){
		var me = this, selectedChargeType = me.selectedChargeType;
		var __fields = me.chargeTypesPanel.__fields;
		for (var r = 0; r < records.length; ++r){
			var record = records[r];
			var cid = record.get("CID");
			var rawData = record.raw;
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
		var count = 0;
		for (var c in selectedChargeType){
			count += parseFloat( selectedChargeType[c][2].replace(",", ""));
			tmp.push(selectedChargeType[c]);
		}
		store.loadData(tmp);
		me.count.chargesCount = count;
		me.form.getForm().setValues({"price" : (me.count.itemsCount + me.count.chargesCount)});
		me.onUpdateForm();
	},

	resetAll: function(){
		var me = this;
		//reset all
		me.selectedChargeType = {};
		me.selectedItems = {};	
		me.count = {
			itemsCount : 0,
			chargesCount : 0
		}

		me.itemsPanel.grid.getStore().loadData([]);
		me.chargeTypesPanel.grid.getStore().loadData([]);
	},
	onUpdateForm: function(force){
		var me = this, form = me.form.getForm(), values = form.getValues();
		var sale = values["rate"], stepcount = values["stepcount"], price = values["price"], realprice = values["realprice"];
		if (force) {
			sale = realprice / price;
		}else{
			realprice = price * sale;
		}
		var _perscaleprice = realprice / stepcount;
		if (price <= 0 ) { return; }	
		form.setValues({
			rate: parseFloat(sale).toFixed(2),
			stepcount: stepcount,
			realprice: parseFloat(realprice).toFixed(2),
			_perscaleprice: parseFloat(_perscaleprice).toFixed(2)
		});
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer,
			form = f.up("form").getForm(), result = form.getValues();
		var selectedItems = me.selectedItems , selectedChargeType = me.selectedChargeType;
		me.onUpdateForm(true);

		//name descript products charges
		var items = Ext.Object.getKeys(selectedItems);
		var charges = Ext.Object.getKeys(selectedChargeType);

		
		if (items && items.length > 0){
			result["items"] = items;
		}

		if (charges && charges.length > 0){
			result["charges"] = charges;
		}

		//转换时间
		result["startdate"] = +(new Date(result["startdate"])) / 1000;
		result["enddate"] = +(new Date(result["enddate"])) / 1000

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
		me.selectedItems = {};
		me.selectedChargeType = {};
		me.packageList = {};//save store fields columns and grid
		me.packageList.cache = {};//cache itemdata

		me.selectedPackageId= 0;
		me.selectedPackageIndex = 0;
		me.callParent()	

		cardServer.GetPackagesPageDataToJSON(0, 1, "", {
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
		var columns = me.packageList.__columns = [];
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
				var fields = me.packageList.__fields = [];
				for (var c in data){
					var meta = data[c];
					fields.push(meta["FieldName"])
					if (!meta["FieldHidden"]){
						columns.push({
							dataIndex: meta["FieldName"],
							header: meta["FieldLabel"],
							defaultWidth: 50,
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
		var me = this;
		var __fields = me.packageList.__fields;
		var store = me.packageList.store = Ext.create("Beet.apps.ProductsViewPort.packageStore");

		var grid = me.packageList.grid = Ext.create("Ext.grid.Panel", {
			autoHeight: true,
			height: 480,
			cls:"iScroll",
			autoScroll: true,
			border: true,
			plain: true,
			flex: 1,
			store: store,
			columnLines: true,
			columns: me.packageList.__columns,
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
	fireSelectGridItem: function(){
		var me = this;
		me.packageList.grid.fireEvent("itemdblclick", me.packageList.grid, me.packageList.store.getAt(me.selectedPackageIndex), null, me.selectedPackageIndex)
	},
	createMainPanel: function(){
		var me = this, cardServer = Beet.constants.cardServer;
		var options = {
			autoScroll: true,
			height: 480,
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
		me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
			tbar: [{
				xtype: "button",
				text: "绑定费用",
				handler: function(){
					me.selectChargeType();
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
					height: 500,
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
												me.onUpdateForm(true);
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
											fieldLabel: "消费次数",
											allowBlank: false,
											name: "stepcount"
										},
										{
											fieldLabel: "单次折扣价格",
											allowBlank: false,
											name: "_perscaleprice"
										},
										{	
											xtype: "datefield",
											fieldLabel: "开始日期",
											allowBlank: false,
											format: "Y/m/d",
											name: "startdate",
										},
										{
											xtype: "datefield",
											fieldLabel: "结束日期",
											allowBlank: false,
											name: "enddate",
											format: "Y/m/d"
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
						me.packageList.grid,
						{
							layout: {
								type: 'vbox',
								align: 'stretch'
							},
							height: 500,
							width: 300,
							items: [
								me.itemsPanel,
								me.chargeTypesPanel
							]
						}
					]
				}
			],
			bbar:[
				"->",
				{
					text: "提交",
					xtype: "button",
					border: 1,
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
		me.initializeChargeTypePanel();
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
			height: 220,
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
		me.selectedChargeType = {};

		var pid = record.get("ID");
		me.selectedPackageId = pid;
		me.selectedPackageIndex = index;

		me.form.getForm().setValues({
			name: record.get("Name"),
			price: record.get("PPrice").replace(",", ""),
			rate: record.get("PRate"),
			realprice: record.get("PRealPrice").replace(",", ""),
			stepcount: record.get("PStepCount").replace(",", ""),
			_perscaleprice: record.get("PStepRealPrice").replace(",",""),
			startdate: new Date(record.get("StartDate")),
			enddate: new Date(record.get("EndDate")),
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
					}
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			})
			cardServer.GetPackagesCharges(pid, {
				success: function(data){
					data = Ext.JSON.decode(data)["charges"];
					var sql = [];
					for (var c = 0; c < data.length; ++c){
						sql.push("cid=" + data[c]);
					}
					var s = sql.join(" OR ");
					if (s == "" || s.length == 0){
					}else{
						cardServer.GetChargeTypePageData(1, 1000000, s, {
							success: function(data){
								var data = Ext.JSON.decode(data)["Data"];
								me.packageList.cache[pid].charges= data;
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
			me.addItems(me.packageList.cache[pid].items, true);
			me.addChargeType(me.packageList.cache[pid].charges, true);
		}
	},
	onUpdateForm: function(force){
		var me = this, form = me.form.getForm(), values = form.getValues();
		var sale = values["rate"], stepcount = values["stepcount"], price = values["price"], realprice = values["realprice"];
		if (force) {
			sale = realprice / price;
		}else{
			realprice = price * sale;
		}
		var _perscaleprice = realprice / stepcount;
		if (price <= 0 ) { return; }	
		form.setValues({
			rate: parseFloat(sale).toFixed(2),
			stepcount: stepcount,
			realprice: parseFloat(realprice).toFixed(2),
			_perscaleprice: parseFloat(_perscaleprice).toFixed(2)
		});
	},
	processData: function(f){
		var me = this, cardServer = Beet.constants.cardServer;
		me.onUpdateForm();
		var form = f.up("form").getForm(), result = form.getValues();
		var selectedItems = me.selectedItems, selectedChargeType = me.selectedChargeType;
		if (me.selectedPackageId< 0){
			return;
		}

		//name descript products charges
		var items = Ext.Object.getKeys(selectedItems);
		var charges = Ext.Object.getKeys(selectedChargeType);

		if (items && items.length > 0){
			result["items"] = items;
		}

		if (charges && charges.length > 0){
			result["charges"] = charges;
		}

		//转换时间
		result["startdate"] = +(new Date(result["startdate"])) / 1000;
		result["enddate"] = +(new Date(result["enddate"])) / 1000

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
							me.selectedChargeType = {};
							me.updateItemsPanel();
							me.updateChargeTypePanel();
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
