Beet.registerMenu("settings", "cardAdmin", "产品管理",
    [
	{
	    text: "套餐设置",
	    handler: function(){
		var item = Beet.cache.menus["cards.PackageList"]
		if (!item){
		    Beet.workspace.addPanel("cards.PackageList", "套餐设置", {
			items: [
			    Ext.create("Beet.apps.cards.PackageList")
			]
		    })
		}else{
		    Beet.workspace.workspace.setActiveTab(item);
		}
	    }
	},
    ]
);

Ext.define("Beet.apps.cards.PackageProfile", {
    extend: "Ext.form.Panel",
    height: "100%",
    width: "100%",
    autoWidth: true,
    autoHeight: true,
    autoScroll: true,
    layout: "fit",
    frame: true,
    border: false,
    bodyBorder: false,    
    b_mode: "view",//设置使用模式, view, add, edit,
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        me.selectedPackageId = 0;

        me.packageList= {};//save store fields columns and grid
        me.packageList.cache = {};//cache itemdata
	me.selectedItems = {};
        me.queue = new Beet_Queue("package_profile-" + Math.random());

        if (me.b_mode == "view" || me.b_mode == "edit"){
            if (me.b_profileData == undefined){
                Ext.Error.raise("请提供套餐数据!");
                return;
            }

            me.queue.Add("addData", "initMainPanel,initProducts,initItems", function(){
                var record = me.b_profileData;
                me.onSelectItem(record.get("ID"), record)
                me.queue.trigger("addData", "success")
            })
        }

        me.callParent();

        me.queue.Add("initMainPanel", function(){
            me.createMainPanel();
        });
    },
    onSelectItem: function(pid, record){
        var me = this, cardServer = Beet.constants.cardServer;
        me.resetAll();

        me.selectedPackageId = pid;

        if (pid <= 0){
            Ext.Msg.alert("错误", "项目ID非法!");
            return;
        }
        cardServer.GetPackagesPageDataToJSON(0, 1, "ID=" + pid, {
            success: function(data){
                var data = Ext.JSON.decode(data);
                data = data["Data"];
                if (data && data.length > 0){
                    data = data[0];
                    me.form.getForm().setValues({
                        name:         data["Name"],
                        price:        data["Price"],
                        descript:     data["Descript"],
                        _packageName: data["PCategoryName"],
			serviceid:    data["ServiceID"]
                    });
                    me.selectedPackageCategoryId = data["PCategoryID"];
        
                    cardServer.GetPackageItemData(pid, {
                        success: function(items){
                            var items = Ext.JSON.decode(items)["Data"];
                            var sql = [], _items = {};
                            for (var c = 0; c < items.length; ++c){
                                sql.push("iid=" + items[c]["ItemID"]);
				_items[items[c]["ItemID"]] = items[c]["TimeLength"]
                            }
			    //console.log(sql, _items)
                            var s = sql.join(" OR ");
                            if (s.length > 0){
                                cardServer.GetItemPageData(1, 1000000, s, {
                                    success: function(data){
                                        var data = Ext.JSON.decode(data)["Data"];
					//process
					for (var i = 0; i < data.length; ++i) {
					    data[i]["itemDuration"] = _items[data[i]["IID"]];
					}
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

                    cardServer.GetPackageProductData(pid, {
                        success: function(data){
                            data = Ext.JSON.decode(data)["Data"]
                            me.addProducts(data, true);
                            //for (var c = 0; c < data.length; ++c){
                            //    sql.push("pid=" + data[c]);
                            //}
                            //var s = sql.join(" OR ");
                            //if (s.length > 0){
                            //    cardServer.GetProductPageData(1, data.length, s, {
                            //        success: function(data){
                            //            var data = Ext.JSON.decode(data)["Data"];
			    //    	//console.log(data)
                            //            //me.addProducts(data, true);
                            //        },
                            //        failure: function(error){
                            //            Ext.Error.raise(error)
                            //        }
                            //    });
                            //}
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
            tbar: [
                (function(){
                    if (me.b_mode != "view"){
                        return {
                            xtype: "button",
                            text: "绑定项目",
                            handler: function(){
                                me.selectItems();
                            }
                        }
                    }
                })()
            ]    
        }));

        me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "产品列表",
            tbar: [
                (function(){
                    if (me.b_mode != "view"){
                        return {
                            xtype: "button",
                            text: "绑定产品",
                            handler: function(){
                                me.selectProducts();
                            }
                        }
                    }
                })()
            ]
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
            bodyStyle: "background-color: #dfe8f5",
            items: [
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
				margin: "5 0 0 5",
				listeners: {
				    scope: me,
				    blur: function(){
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
				    fieldLabel: "价格",
				    allowBlank: false,
				    name: "price"
				},
				{
				    xtype: "combobox",
				    fieldLabel: "所属分类",
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
					    var that = this;
					    f.setValue = function(value){
						var that = this, inputId = f.getInputId(), inputEl = that.inputEl;
						inputEl.dom.value = value
					    }
					    if (!me.innerTreeList){
						var store = f.store = Ext.create("Beet.apps.cards.PackagesCatgoryTreeStore", {
						    autoLoad: false    
						})
						me.innerTreeList = new Ext.tree.TreePanel({
						    store: store,
						    layout: "fit",
						    bodyStyle: "background-color: #fff",
						    frame: false,
						    lookMask: true,
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
							    me.selectedPackageCategoryId = record.get("id");
							    //f.value = record.raw["name"];
							    f.setValue(record.get("text") || record.raw["name"])
							}
						    }
						});
					    };
					    setTimeout(function(){
						me.innerTreeList.render("innerTree")
					    }, 500);
					}
				    }
				},
				{
				    fieldLabel: "套餐所属服务",
				    name: "serviceid",
				    allowBlank: false,
				    xtype: "combobox",
				    editable: false,
				    store: Beet.constants.ServiceList,
				    queryMode:"local",
				    displayField: "name",
				    valueField: "attr",
				},
				//{
				//    xtype: "component",
				//    height: 10,
				//    width: 5
				//},
				{
				    fieldLabel: "注释",
				    colspan: 2,
				    width: 600,
				    height: 40,
				    allowBlank: true,
				    name: "descript"
				}    
			    ]
			},
			{
			    xtype: "component",
			    height: 10,
			    width: 5
			},
			me.childrenList
		    ],
		},
	    ],
	    bbar:[
		"->",
		(function(){
			if (me.b_mode == "add"){
			    return {
				text: "新增",
				xtype: "button",
				name: "packageNewBtn",
				border: 1,
				width: 200,
				style: {
				    borderColor: "#99BBE8"
				},
				bodyStyle: "background-color: #dfe8f5",
				handler: function(){
				    me.processData(this, "add");
				}
				}
			}else{
			    return {
				text: "编辑",
				xtype: "button",
				name: "packageEditBtn",
				border: 1,
				width: 200,
				style: {
				    borderColor: "#99BBE8"
				},
				bodyStyle: "background-color: #dfe8f5",
				handler: function(){
				    me.processData(this, "edit");
				}
			    }
			}
		    }
		)()
	    ]
        };
        var form = Ext.widget("form", config);
        me.form = form;
        me.add(form);
        me.doLayout();

        me.queue.trigger("initMainPanel", "success");

        me.queue.Add("initItems",function(){
            me.initializeItemsPanel();
        });

        me.queue.Add("initProducts", function(){
            me.initializeProductsPanel();
        })

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

        if (me.b_mode != "view"){
            columns.push(_actions);
        }
        //columns = columns.concat([
        //    {
        //        dataIndex: "isgiff",
        //        xtype: "checkcolumn",
        //        header: "赠送?",
        //        width: 40,
        //        editor: {
        //            xtype: "checkbox",
        //            cls: 'x-grid-checkheader-editor'
        //        },
        //    }
        //])

	var itemDurationStore = Ext.create("Ext.data.Store", {
	    fields: ["Price", "TimeLength"]   
	})

        cardServer.GetItemPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.itemsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])

		    //屏蔽显示
		    if (meta["FieldName"] == "ICategoryName" || meta["FieldName"] == "IPrice"){
			meta["FieldHidden"] = true;
		    }
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        })
                    }
                }
		me.itemsPanel.__fields = fields.concat([{name: "isgiff", type: "bool"}, "itemDuration"]);
                me.itemsPanel.__columns = columns.concat([
		    {
			dataIndex: "itemDuration",
			header:  "项目时长",
			flex: 1,
			field:{
			    allowBlank: false,
			    listClass: 'x-combo-list-small',
			    xtype: "combobox",
			    editable: false,
			    store: itemDurationStore,
			    queryMode: "local",
			    displayField: "TimeLength",
			    valueField: "TimeLength"
			}
		    }
		])
                me.initializeItemsGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeItemsGrid: function(){
        var me = this, cardServer = Beet.constants.cardServer;
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
                columns: me.itemsPanel.__columns,
		plugins: [
		    Ext.create("Ext.grid.plugin.RowEditing", {
			clicksToEdit: 1,
			listeners: {
			    beforeedit: function(e){
				var record = e.record, itemID = record.get("IID");
				var field = e.column.field
				var parent = field.ownerCt;
				var itemDurationField = parent.down("combobox[name=itemDuration]")

				//console.log(itemDurationField)
				if (itemDurationField && itemDurationField.store){
				    var store = itemDurationField.store; 
				    cardServer.GetItemPricePageData(0, 999, "IID='"+itemID+"' AND IsMember = 1 ", {
					success: function(data){
					     var data = Ext.JSON.decode(data);
					     data = data["Data"];
					     store.loadData(data)
					},
					failure: function(){
					}
				    })
				}
			    },
			    edit: function(e){
				var record = e.record, itemID = record.get("IID"), field = e.column.field;
				var itemDuration = record.get("itemDuration");
				var parent = field.ownerCt;
				var itemDurationField = parent.down("combobox[name=itemDuration]")
				var itemDurationStore = itemDurationField.store;

				//直接选择时常
				if (itemDurationField && itemDurationStore){
				    var index = itemDurationStore.find("TimeLength", itemDuration);
				    var itemDurationRecord = itemDurationStore.getAt(index)

				    record.commit();
				}
			    }
			}
		    })
		]
            });

            me.itemsPanel.add(grid);
            me.itemsPanel.doLayout();
        }
        me.queue.trigger("initItems", "success")
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

        win.add(Ext.create("Beet.apps.cards.ItemList", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                me.addItems(records, false, true);
                win.close();
            }
        }));
        win.doLayout();
    },
    addItems: function(records, isRaw, isNew){
        var me = this, store = me.itemsPanel.grid.store;
        if (records == undefined){
            return;
        }
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var id, rawData;
            if (isRaw){
                //id = record["IID"];
                rawData = record;
            }else{
                //id = record.get("IID");
                rawData = record.raw;
            }
	    rawData["_uuid"] = Beet.uuid.get();
	    var newRecord = store.add(rawData)
	    newRecord = newRecord.shift();

	    var uuid = newRecord.get("_uuid");
	    me.selectedItems[uuid] = {
		item: newRecord
	    }
	    //XXX

	    me.loadProductFromItem(newRecord, isNew);
        }
    },
    loadProductFromItem: function(item, isNew){
	var me = this, cardServer = Beet.constants.cardServer;
	var itemId = item.get("IID"), itemName = item.get("IName"),
	    indexno = item.get("indexno");

	cardServer.GetItemProductData(itemId, {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		data = data["Data"];
		if (data.length > 0){
		    for (var c = 0; c < data.length; c++){
			var product = data[c];
			product["itemName"] = itemName;
			product["itemId"] = itemId;
			if (indexno && indexno != Beet.constants.FAILURE){
			    product["indexno"] = indexno;
			}
		    }

		    if (isNew) {
			var products = me.addProducts(data, true);
			item._products = products;
			me.selectedItems[item.get("_uuid")]["products"] = products;
		    }else{
			me.selectedItems[item.get("_uuid")]["products"] = data
			me.selectedItems[item.get("_uuid")]["isForce"]    = true  
		    }
		}
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})
    },
    deleteItem: function(record){
        var me = this, store = me.itemsPanel.grid.store, selectedItems = me.selectedItems;
	var productstore = me.productsPanel.grid.store;
        var uuid = record.get("_uuid"), itemName = record.get("IName");
	var products = selectedItems[uuid]["products"], 
	    isForce = selectedItems[uuid]["isForce"];

	var removeItem = function(){
	    store.remove(record);
	    //cleanup
	    delete selectedItems[uuid];
	}
	//这里同时也要做相关检测
	if (products && products.length > 0){
	    var _products = [];
	    for (var c = 0; c < products.length; c++){
		var product = products[c];
		_products.push( product.get ? product.get("PName") : product["PName"]);
	    }
	    Ext.MessageBox.show({
		title : ("你确定需要移除项目: " + itemName + "吗?"),    
		msg: ("移除项目: " + itemName + " , 将同时移除以下产品: " + _products.join("、")),
		buttons: Ext.MessageBox.YESNO,
		fn: function(btn){
		    if (btn == "yes"){
			for (var c = 0; c < products.length; c++){
			    var product = products[c];
			    //直接移除
			    if (isForce) {
				if (productstore.find("PID", product["PID"]) > - 1){
				    var pat = productstore.find("PID", product["PID"]);
				    productstore.remove(productstore.getAt(pat))
				}
			    }else{
				productstore.remove(product);
			    }
			}
			removeItem();
		    }
		}
	    })
	}else{
	    removeItem();
	}
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

        if (me.b_mode != "view"){
            columns.push(_actions);
        }
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
				decimalPrecision: 6,
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
        var me = this
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
                    (function(){
                        if (me.b_mode != "view"){
                            return Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1,
                                // cell edit event
                                listeners: {
                                    "edit" : function(editor, e, opts){
                                        // fire event when cell edit complete
                                        var currField = e.field, currColIdx = e.colIdx, currRowIdx = e.rowIndex;
                                        var currRecord = e.record;
                                        if (currField == "COUNT"){
                                            var count = currRecord.get("COUNT");
                                            currRecord.set("COUNT", count);
                                        }
					currRecord.commit();
                                    }
                                }
                            })
                        }
                    })()
                ],
                selType: 'cellmodel'
            });

            me.productsPanel.add(grid);
            me.productsPanel.doLayout();
        }
        me.queue.trigger("initProducts", "success")
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
        win.add(Ext.create("Beet.apps.cards.ProductsList", {
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
        var me = this, store = me.productsPanel.grid.store;
        var __fields = me.productsPanel.__fields;

	var list = []
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

	    //filter
	    //if (store.find("PID", pid) == - 1){
	    //    store.add(rawData);
	    //}else{
	    //    Ext.MessageBox.alert("警告", "此产品已加入, 请不要重复加入");
	    //    return false;
	    //}
	    list.push(rawData)
        }
	var newRecords = store.add(list)
	return newRecords
    },
    deleteProducts: function(record){
        var me = this, selectedProducts = me.selectedProducts;
	var store = me.productsPanel.grid.store;
        var pid = record.get("PID");
	store.remove(record);
    },
    resetAll: function(){
        var me = this;
	var productsStore = me.productsPanel.grid.store;
	var itemsStore = me.itemsPanel.grid.store;
	
	productsStore.removeAll();
	itemsStore.removeAll();

	me.selectedItems = {}
        me.selectedPackages = {};
        me.selectedPackageId= 0;
        me.selectedPackageIndex = 0;

        me.form.getForm().reset();

        //var editBtn = me.form.down("button[name=packageEditBtn]"),
        //    addBtn = me.form.down("button[name=packageNewBtn]");

        //if (editBtn){
        //    editBtn.disable();
        //}

        //if (addBtn){
        //    addBtn.disable();
        //}
    },
    processData: function(f, action){
        var me = this, cardServer = Beet.constants.cardServer;
        var form = f.up("form").getForm(), result = form.getValues();
	
	var price = parseInt(result["price"]);
	if (isNaN(price) || price == 0){
	    Ext.MessageBox.alert("失败", "请填写套餐价格.");
	}


	var itemsStore = me.itemsPanel.grid.store;
	result["items"] = [];
	var isStop = false;
	if (itemsStore.getCount() > 0){
	    var items = [];
	    itemsStore.each(function(record){
	        var iid = record.get("IID"), timeLength = record.get("itemDuration");
		    //isgiff = record.get("isgiff");
		    timeLength = parseInt(timeLength);
		    if (isNaN(timeLength) || timeLength == 0){
			isStop = true;
			Ext.MessageBox.alert("失败", record.get("IName") + " 需要选择项目时长!");
			return;
		    }
		items.push({
		    id: iid,
		    timelength: timeLength   
		})
		//items.push(record.get("IID"))	
	    })
	    result["items"] = items;
	}

	if (isStop) {
	    return;
	}

	var productsStore = me.productsPanel.grid.store;
	result["products"] = [];
	if (productsStore.getCount() > 0){
	    var products = [];
	    productsStore.each(function(record){
		products.push({
		    id: record.get("PID"),
		    count: record.get("COUNT")   
		})
	    })

	    result["products"] = products;
	}

        if (me.selectedPackageCategoryId){
            result["categoryid"] = me.selectedPackageCategoryId;
        }
        var selectedPackages = me.selectedPackages;
        if (selectedPackages && selectedPackages.length > 0){
            result["categoryid"] = selectedPackages.shift().get("id");
        }

        if (action == "edit"){
            if (me.selectedPackageId< 0){
                Ext.MessageBox.alert("oops", "没有套餐ID, 无法更新");
                return;
            }
            result["id"] = me.selectedPackageId;
        }

	console.log(result)
        
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
                                //    me.resetAll();
                                //}else{
                                    if (me.callback){
                                        me.callback();
                                    }
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
                cardServer.UpdatePackage(Ext.JSON.encode(result), {
                    success: function(succ){
                        if (succ){
                            Ext.MessageBox.show({
                                title: "提示",
                                msg: "更新项目成功!",
                                buttons: Ext.MessageBox.OK,
                                fn: function(btn){
                                    if (me.callback){
                                        me.callback();
                                    }
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


Ext.define("Beet.apps.cards.PackageList", {
    extend: "Ext.panel.Panel",
    autoHeight: true,
    autoScroll:true,
    border: false,
    frame: true,
    height: "100%",
    width: "100%",
    bodyPadding: 0,
    bodyBorder: false,
    plain: true,
    b_filter: "",
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;

        me.selectedPackages = [];

        me.packageList = {}

        me.selectedPackageId= 0;
        me.selectedPackageIndex = 0;

        me.callParent()    

        me.buildStoreAndModel();
    },
    buildStoreAndModel: function(){
        var me = this, cardServer = Beet.constants.cardServer;

        Ext.bind(createPackageCategoryTree, me)();
        me.createTreePanel();//category

        var me = this, cardServer = Beet.constants.cardServer;
        var columns = me.packageList.__columns = [];
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
                me.editPackage(d);
            }
        }, "-");

        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除项目",
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
                            flex: 1
                        })
                    }
                }

                if (!Beet.apps.cards.PackagesModel){
                    Ext.define("Beet.apps.cards.PackagesModel", {
                        extend: "Ext.data.Model",
                        fields: fields
                    });
                }

                if (!Beet.apps.cards.PackagesStore){
                    Ext.define("Beet.apps.cards.PackagesStore", {
                        extend: "Ext.data.Store",
                        model: Beet.apps.cards.PackagesModel,
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
                                start: (that.currentPage - 1) * Beet.constants.PageSize || 0,
                                limit: Beet.constants.PageSize,
                                addRecords: false
                            });
                            
                            that.proxy.b_params["start"] = options["start"];
                            that.proxy.b_params["limit"] = options["limit"];

                            return that.callParent([options]);
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
    updateProxy: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
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
        }
    },
    initializePackageGrid: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var __fields = me.packageList.__fields;

        var store = me.packageList.store = Ext.create("Beet.apps.cards.PackagesStore");
        store.setProxy(me.updateProxy());
        var grid;
        var sm = Ext.create("Ext.selection.CheckboxModel", {
            mode: me.b_selectionMode ? me.b_selectionMode : "MULTI",
            listeners: {
                selectionchange: function(){
                    //Ext.bind(me.updateButtonState, grid)(grid.getView());
                },
            }
        });

        grid = me.packageList.grid = Ext.create("Beet.plugins.LiveSearch", {
            autoHeight: true,
            height: 480,
            minHeight: 200,
            selModel: sm,
            title: "套餐列表",
            cls:"iScroll",
            autoScroll: true,
            border: true,
            plain: true,
            flex: 1,
            store: store,
            columnLines: true,
            columns: me.packageList.__columns,
            tbar: [
                "-",
                {
                    text: "高级搜索",
                    xtype: "button",
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
                                        })
                                        me.packageList.store.loadPage(1);
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
                    border: 1,
                    style: {
                        borderColor: "#99BBE8"
                    },
                    text: "增加套餐",
                    handler: function(){
                        me.addPackageWindow();
                    },
                },
                "-",
            ],
            bbar: Ext.create("Ext.PagingToolbar", {
                store: store,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1} 到 {2}',
                emptyMsg: "没有数据"
            }),
            listeners: {
                itemdblclick: function(grid, record, item, index, e){
                    me.onSelectItem(record.get("ID"), record);    
                }
            }
        });

        me.createMainPanel();
    },
    filterProducts: function(){
        var me = this, cardServer = Beet.constants.cardServer;
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

        me.packageList.store.loadPage(1);
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
        }));

        me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "产品列表",
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
                        border: false,
                        bodyStyle: "background-color: #dfe8f5"
                    },
                    items:[
                        me.treeList,//category tree list
                        {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            bodyPadding: "0 0 0 5",
                            height: "100%",
                            flex: 2,
                            items: [
                                me.packageList.grid,
                                me.itemsPanel,
                                me.productsPanel
                            ]
                        },
                    ]
                }
            ],
            bbar: [
                "->",
                {
                        xtype: "button",
                        text: "确定",
                        hidden: (me.b_type != "selection"),
                        handler: function(){
                            if (me.b_selectionCallback){
                                me.b_selectionCallback(me.packageList.grid.selModel.getSelection());
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
        };
        var panel = Ext.widget("form", config);
        me.add(panel);
        me.doLayout();

        me.initializeItemsPanel();
        me.initializeProductsPanel();
    },

    //打开增加/编辑套餐窗口
    addPackageWindow: function(){
        var me = this;
        var win = Ext.create("Ext.window.Window", {
            width: 800,
            height: 500,
            autoScroll: true,
            autoHeight: true,
            layout: "fit",
            border: false,
            title: "新增套餐"
        })

        win.add(Ext.create("Beet.apps.cards.PackageProfile", {
            b_mode: "add",
            callback: function(){
                win.close();
                me.packageList.store.loadPage(me.itemList.store.currentPage)
            }
        }))

        win.show();
    },
    deletePackage: function(record){
        var me = this, cardServer = Beet.constants.cardServer;
        var itemId = record.get("ID") || record.raw["id"], itemName = record.get("Name") || record.raw["name"];
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
                                        me.packageList.store.loadPage(me.packageList.store.currentPage);
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
    editPackage: function(record){
        var me = this;
        var pid = record.get("ID");
        if (pid == -1){
            Ext.Error.raise("非法ID, 无法编辑");
            return;
        }
        var win = Ext.create("Ext.window.Window", {
            width: 800,
            height: 500,
            autoScroll: true,
            autoHeight: true,
            layout: "fit",
            border: false,
            title: "编辑套餐"
        })

        win.add(Ext.create("Beet.apps.cards.PackageProfile", {
            b_mode: "edit",
            b_profileData: record,
            callback: function(){
                win.close();
                me.packageList.store.loadPage(me.packageList.store.currentPage)
            }
        }))

        win.show();
    },
    
    initializeItemsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
            return;
        }
        var columns = me.itemsPanel.__columns = [];

        cardServer.GetPackageItemData(1, {
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
        var me = this, __fields = me.itemsPanel.__fields;

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
    addItems: function(records, isRaw){
        var me = this, store = me.itemsPanel.grid.store;
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

	    store.add(rawData)
        }
    },
    deleteItem: function(record){
        var me = this, store = me.itemsPanel.grid.store;
        var id = record.get("IID");
	store.remove(record);
    },

    initializeProductsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.productsPanel.__columns && me.productsPanel.__columns.length > 0){
            return;
        }
        var columns = me.productsPanel.__columns = [];

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
        var me = this;
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
                selType: 'cellmodel'
            });

            me.productsPanel.add(grid);
            me.productsPanel.doLayout();
        }
    },
    addProducts: function(records, isRaw){
        var me = this, store = me.productsPanel.grid.store;
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

	    store.add(rawData)
        }
    },
    deleteProducts: function(record){
        var me = this, store = me.productsPanel.grid.store;
        var pid = record.get("PID");

	store.remove(record)
    },
    resetAll: function(){
        var me = this;

	var itemsStore = me.itemsPanel.grid.store,
	    productsStore = me.productsPanel.grid.store;

	itemsStore.removeAll();
	productsStore.removeAll();

        me.selectedPackages = {};

        me.selectedPackageId= 0;
        me.selectedPackageIndex = 0;
        //me.form.getForm().reset();
    },
    onSelectItem: function(pid, record){
        var me = this, cardServer = Beet.constants.cardServer;

        me.resetAll();

        if (pid <= 0){
            Ext.Msg.alert("错误", "项目ID非法!");
            return;
        }
	

	cardServer.GetPackageItemData(pid, {
	    success: function(items){
		var items = Ext.JSON.decode(items)["Data"];
		//console.log(items)
		me.addItems(items, true);
		me.itemsPanel.expand();
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	});

        //cardServer.GetPackagesItems(pid, {
        //    success: function(data){
        //        data = Ext.JSON.decode(data)["items"];
        //        var sql = [];
        //        for (var c = 0; c < data.length; ++c){
        //            sql.push("iid=" + data[c]);
        //        }
        //        var s = sql.join(" OR ");
        //        if (s.length > 0){
        //            cardServer.GetItemPageData(1, 1000000, s, {
        //                success: function(data){
        //                    var data = Ext.JSON.decode(data)["Data"];
        //                    me.addItems(data, true);
        //                    me.itemsPanel.expand();
        //                },
        //                failure: function(error){
        //                    Ext.Error.raise(error)
        //                }
        //            });
        //        }
        //    },
        //    failure: function(error){
        //        Ext.Error.raise(error);
        //    }
        //});

        cardServer.GetPackageProducts(pid, {
            success: function(data){
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
    }
});
