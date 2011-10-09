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


Ext.define("Beet.apps.ProductsViewPort.AddProductItem", {
	extend: "Ext.form.Panel",
	height: "100%",
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
	frame: true,
	border: false,
	shadow: true,
	b_filter: "",
	initComponent: function(){
		var me = this;
		if (me.b_type == "selection"){
			me.editable = false;
		}else{
			me.editable = true;
		}

		me.callParent();

		me.getProductItemMetaData();
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
	border: false,
	plain: true,
	initComponent: function(){
		var me = this;
		me.callParent();
		me.add(Ext.create("Beet.apps.ProductsViewPort.ProductItemsList"));
		me.doLayout();
	}
});

Ext.define("Beet.apps.ProductsViewPort.AddProducts", {
	extend: "Ext.form.Panel",
	height: "100%",
	autoHeight: true,
	autoScroll:true,
	frame:true,
	border: false,
	bodyBorder: false,
	plain: true,
	flex: 1,
	initComponent: function(){
		var me = this, cardServer = Beet.constants.cardServer;
	
		me.selectedProductItem = null;
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
						{
							xtype: "component",
							colspan: 1
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

		var form = Ext.widget("form", config);
		me.form = form;
		me.add(form);
		me.doLayout();
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
		var form = me.getForm().getForm();
		if (me.selectedProductItem == null || (me.selectedProductItem && !me.selectedProductItem.raw)){
			return;
		}
		//get data
		var values = form.getValues();
		var count = 0, sale = 1;
		var productPrice = me.selectedProductItem.get("P_Price");

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
		if (me.selectedProductItem == null || (me.selectedProductItem && !me.selectedProductItem.raw)){
			Ext.Error.raise("添加失败!");
			return;
		}
		result["pid"] = me.selectedProductItem.get("P_PID");
		console.log(result);
		cardServer.AddProducts(Ext.JSON.encode(result), {
			success: function(id){
				if (id > 0){
					Ext.MessageBox.show({
						title: "提示",
						msg: "添加消耗产品成功!",
						buttons: Ext.MessageBox.YESNO,
						fn: function(btn){
							if (btn == "yes"){
								form.reset()
							}else{
							}
						}
					});
				}else{
					Ext.Error.raise("添加消耗产品失败");
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
	frame: true,
	border: false,
	shadow: true,
	initComponent: function(){
		var me = this;
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

		if (!Beet.apps.ProductsViewPort.ProductsStore){
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
				mode: "SINGLE"
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
			rorder: false,
			bodyBorder: false,
			autoScroll: true,
			autoHeight: true,
			border: 0,
			selModel: sm,
			height: "100%",
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
		console.log(rawData);
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
		console.log(result);
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

		console.log(result);
		result["applyrate"] = result["applyrate"] == 1 ? true : false;
		result["effective"] = result["effective"] == 1 ? true : false;

		console.log(result);
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
	frame: true,
	border: false,
	shadow: true,
	initComponent: function(){
		var me = this;
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
				model: Beet.apps.ProductsViewPort.ChargeTypeStore,
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
				mode: "SINGLE"
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
			border: 0,
			selModel: sm,
			height: "100%",
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
		console.log(rawData);
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

/*
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
		console.log(result);
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
*/
