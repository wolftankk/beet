registerMenu("settings", "cardAdmin", "产品管理",
    [
	{
	    text: "项目设置",
	    handler: function(){
		var item = Beet.cache.menus["cards.ItemList"]
		if (!item){
		    Beet.workspace.addPanel("cards.ItemList", "项目设置", {
			items: [
			    Ext.create("Beet.apps.cards.ItemList")
			]
		    })
		}else{
		    Beet.workspace.workspace.setActiveTab(item);
		}
	    }
	}
    ]
);


Ext.define("Beet.apps.cards.AddItem", {
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

        //create queue
        me.queue = new Beet_Queue("AddItem-" + Math.random());
        me.callParent();

        me.createMainPanel();
    },
    createMainPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        //Ext.bind(createItemCategoryTree, me)();
        //me.createTreeList();
        //me.updateTreeListEvent(true)

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
					    xtype: "combobox",
					    fieldLabel: "项目所属分类",
					    store:new Ext.data.SimpleStore({fields:[],data:[[]]}),   
					    editable:false, 
					    name: "category",
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
							var store = f.store = Ext.create("Beet.apps.cards.ItemsCatgoryTreeStore", {
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
								    if (!record){return;}
				
								    me.selectProductCategoryId = parseInt(record.get("id"));
								    f.value = record.raw["name"];
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
					    xtype: "component",
					    width: 5
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
        me.queue.Add("initproduct", function(){
            me.initializeProductsPanel();
        });
        me.queue.Add("initcharge", function(){
            me.initializeChargeTypePanel();
        })
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

                        if (meta["FieldName"] == "COUNT"){
                            c.editor = {
                                xtype: "numberfield",
				decimalPrecision: 6,
                                allowBlank: false,
                                type: "float"
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
                height: "100%",
                width: "100%",
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
                                if (currField == "COUNT"){
                                    //check field "PRICE" that it exists val?
                                    var count = currRecord.get("COUNT");
                                    currRecord.set("COUNT", count);
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
        me.queue.trigger("initproduct", "success");
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
    updateProductsPanel: function(append){
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
            height: "100%",
            width: "100%",
            cls: "iScroll",
            autoScroll: true,
            columnLines: true,
            columns: me.chargeTypesPanel.__columns
        });

        me.chargeTypesPanel.add(grid);
        me.chargeTypesPanel.doLayout();

        me.queue.trigger("initcharge", "success")
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

        win.add(Ext.create("Beet.apps.cards.ChargeList", {
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
    updateChargeTypePanel: function(append){
        var me = this, selectedChargeType = me.selectedChargeType;
        var grid = me.chargeTypesPanel.grid, store = grid.getStore();
        var __fields = me.chargeTypesPanel.__fields;
        var tmp = []
        for (var c in selectedChargeType){
            tmp.push(selectedChargeType[c]);
        }
        store.loadData(tmp);
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
            rate: rawData["IRate"],
            realprice: rawData["IRealPrice"],
            category: rawData["ICategoryName"]
        });
        
        me.selectProductCategoryId = parseInt(rawData["ICategoryID"]);

        if (itemId <= 0){
            Ext.Msg.alert("错误", "项目ID非法!");
            return;
        }

        me.queue.Add("restoreFormData", "initproduct,initcharge", function(){
            me.itemList.cache[itemId] = {};
            cardServer.GetItemProductData(itemId, {
                success: function(data){
                    data = Ext.JSON.decode(data)["Data"]//["products"];
                    //me.itemList.cache[itemId].products = data;
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
                                //me.itemList.cache[itemId].charges= data;
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

            me.queue.triggle("restoreFormData", "success")
        });
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
    processData: function(f){
        var me = this, cardServer = Beet.constants.cardServer,
            form = f.up("form").getForm(), result = form.getValues();
        var selectedProducts = me.selectedProducts, selectedChargeType = me.selectedChargeType;
        if (me.selectProductCategoryId){
            result["categoryid"] = me.selectProductCategoryId;
            delete result["category"];
        }else{
	    Ext.MessageBox.alert("失败", "请选择一个项目分类");
	    return;
	}

        //name descript products charges
        var productstore = me.productsPanel.grid.getStore();
        var products = [];
        for (var c = 0; c < productstore.getCount(); ++c){
            var data = productstore.getAt(c);
            var count = data.get("COUNT");
            if (count != undefined){
                var pid = data.get("PID");
                products.push({
                    id: pid,
                    count: count
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
});

Ext.define("Beet.apps.cards.ItemPriceList", {
    extend: "Ext.panel.Panel",
    height: "100%",
    width: "100%",
    autoHeight: "100%",
    autoScroll: "100%",
    border: false,
    bodyBorder: false,
    plain: true,
    initComponent: function(){
	var me = this, cardServer = Beet.constants.cardServer;
	
	if (!me.itemid){
	    Ext.Msg.alert("错误", "请指定项目ID");
	    return;    
	}

	me.callParent()

	cardServer.GetItemPricePageData(0, 1, "", {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		var metaData = data["MetaData"];
		me.buildStore(metaData);
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})
    },
    buildStore: function(metaData){
	var me = this, cardServer = Beet.constants.cardServer;
	var fields = [], columns = [];
	me.columns = columns;
	var memberPriceStore = Ext.create("Ext.data.Store", {
	    fields: ["IsMember", "value"],
	    data : [
		{IsMember: true, value: "是"},
		{IsMember: false, value: "否"}	
	    ]
	})
	for (var c in metaData){
	    var meta = metaData[c];
	    fields.push(meta["FieldName"])
	    if (!meta["FieldHidden"]){
		var column = {
		    dataIndex: meta["FieldName"],
		    header: meta["FieldLabel"],
		    flex: 1
		}

		switch (meta["FieldName"]){
		    case "Price":
			column.editor = {
			    xtype: "numberfield",
			    allowBlank: false,
			    minValue : 1,
			    maxValue : 100000
			}
			break;
		    case "TimeLength":
			column.editor = {
			    xtype: "numberfield",
			    allowBlank: false,
			    minValue : 1,
			    maxValue : 100000
			}
			break;
		    case "IsMember":
			column.field = {
			    listClass: 'x-combo-list-small',
			    xtype: "combobox",
			    editable: false,
			    store: memberPriceStore,
			    queryMode: "local",
			    displayField: "value",
			    valueField: "IsMember"
			}
			break;
		}

		columns.push(column);
	    }
	}
	
	if (!Beet.apps.cards.itemPriceModel){
	    Ext.define("Beet.apps.cards.itemPriceModel", {
		extend: "Ext.data.Model",
		fields: fields
	    });
	}

	if (!Beet.apps.cards.itemPriceStore){
	    Ext.define("Beet.apps.cards.itemPriceStore", {
		extend: "Ext.data.Store",
		model: Beet.apps.cards.itemPriceModel,
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
		    
		    that.proxy.b_params["start"] = options["start"] || 0;
		    that.proxy.b_params["limit"] = options["limit"];

		    return that.callParent([options]);
		}
	    });
	}
	
	me.storeProxy = Ext.create("Beet.apps.cards.itemPriceStore");
	me.storeProxy.setProxy(me.updateProxy());

	me.createMainPanel();
    },
    updateProxy: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetItemPricePageData,
            startParam: "start",
            limitParam: "limit",
            b_params: {
                "awhere" : "IID=" + me.itemid
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        }
    },
    createMainPanel: function(){
	var me = this, cardServer = Beet.constants.cardServer;
	var grid
	var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
	    clicksToEdit: 2,
	    listeners: {
		canceledit: function(e){
		    me.storeProxy.loadPage(1);
		}
	    }
	});
	
	me.grid = grid = Ext.create("Ext.grid.Panel", {
	    store: me.storeProxy,
	    height: "100%",
	    width: "100%",
            columnLines: true,
	    columns: me.columns,
	    plugins: [rowEditing],
	    tbar: [
		{
		    xtype: "button",
		    text : "增加",
		    tooltip: "增加一条会员价",
		    handler: function(){
			rowEditing.cancelEdit();
			var r = Ext.create('Beet.apps.cards.itemPriceModel', {
			    IID: me.itemid,
			    IName: me.itemName,
			    Price: "",
			    TimeLength: 0,
			    IsMember : false
			});
			me.storeProxy.insert(0, r);	
			rowEditing.startEdit(0, 0);
			currentAction = "insert";
		    }
		},
		{
		    xtype : "button",
		    text: "删除",
		    tooltip: "删除一条会员价",
		    handler: function(){
			var sm = grid.selModel;
			var selected = sm.getSelection();
			if (selected.length <= 0){
			    Ext.Msg.alert("错误", "请选择需要删除会员价");
			}
			var record = selected.shift();
			Ext.MessageBox.show({
			    title: "确认删除",
			    msg: "确认需要删除 " + record.get("IName") + ": " + record.get("TimeLength") + "分钟的数据吗?",  
			    buttons: Ext.Msg.YESNO,
			    fn:  function(btn){
				if (btn == "yes"){
				    var jsondata = {
					id: record.get("IID"),
					timelength: record.get("TimeLength"),
					ismember: record.get("IsMember")
				    }
				    cardServer.DeleteItemPrice(Ext.JSON.encode(jsondata), {
					success: function(succ){
					    if (succ){
						Ext.Msg.alert("成功", "删除成功");
						me.storeProxy.loadPage(1);
					    }else{
						Ext.Msg.alert("失败", "删除失败");
					    }
					},
					failure: function(error){
					    Ext.Error.raise(error)
					}
				    })
				}
			    }
			})
		    }
		}
	    ],
            bbar: Ext.create("Ext.PagingToolbar", {
                store: me.storeProxy,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1} 到 {2}',
                emptyMsg: "没有数据"
            }),
	})

	grid.on("beforeedit", function(editor,e ){
	    var record = editor.record;
	    //set
	    if (record.get("TimeLength") > 0){
		editor.oldata = Ext.clone(record.data);
	    }
	})
	
	grid.on("edit", function(editor, e){
	    var record = editor.record;
	    var rowIndex = editor.rowIdx;

	    var jsondata = {
		id : record.get("IID"),
		price: record.get("Price"),
		timelength : record.get("TimeLength"),
		ismember : record.get("IsMember")
	    }

	    if (editor.oldata){
		jsondata["oldtimelength"] = editor.oldata["TimeLength"];
		jsondata["oldismember"]   = editor.oldata["IsMember"];
		cardServer.UpdateItemPrice(Ext.JSON.encode(jsondata), {
		    success: function(succ){
			if (succ){
			    Ext.Msg.alert("成功", "更新成功");
			}else{
			    Ext.Msg.alert("失败","更新失败, 请关闭当前窗口重新尝试.");   
			}
		    },
		    failure: function(error){
			Ext.Error.raise(error)
		    }
		})
	    }else{
		cardServer.AddItemPrice(Ext.JSON.encode(jsondata), {
		    success: function(succ){
			if (succ){
			    Ext.Msg.alert("成功","添加成功");   
			}else{
			    if (editor.oldata == undefined){
				Ext.Msg.alert("失败","添加失败, 请关闭当前窗口重新尝试.");   
			    }else{
				jsondata["oldtimelength"] = editor.oldata.get("TimeLength");
				cardServer.UpdateItemPrice(Ext.JSON.encode(jsondata), {
				    success: function(succ){
					if (succ){
					    Ext.Msg.alert("成功", "更新成功");
					}else{
					    Ext.Msg.alert("失败","更新失败, 请关闭当前窗口重新尝试.");   
					}
				    },
				    failure: function(error){
					Ext.Error.raise(error)
				    }
				})
			    }
			}
		    },
		    failure: function(error){
			Ext.Error.raise(error);
		    }
		})
	    }

	})
	me.add(grid);
	me.doLayout();
    }
})






Ext.define("Beet.apps.cards.ItemList", {
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
            width: 60,
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
	_actions.items.push("-","-", {
            icon: "./resources/themes/images/fam/price.png",
	    tooltip: "编辑会员价",
	    handler: function(grid, rowIndex, colIndex){
		var d = grid.store.getAt(rowIndex);
		me.editPriceList(d);
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
                        var column = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        }

			switch (meta["FieldName"]){
			    case "IPrice":
				column.xtype = "numbercolumn";
				break;
			}

			columns.push(column);
                    }
                }

                columns.push({
                    dataIndex: "_state",
                    header: "状态",
                    flex: 1,
                    hidden: true
                })
                
                if (!Beet.apps.cards.itemModel){
                    Ext.define("Beet.apps.cards.itemModel", {
                        extend: "Ext.data.Model",
                        fields: fields
                    });
                }

                if (!Beet.apps.cards.itemStore){
                    Ext.define("Beet.apps.cards.itemStore", {
                        extend: "Ext.data.Store",
                        model: Beet.apps.cards.itemModel,
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
                            
                            //console.debug(options)
                            that.proxy.b_params["start"] = options["start"] || 0;
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
        var store = me.itemList.store = Ext.create("Beet.apps.cards.itemStore");
        store.setProxy(me.updateProxy());
        var grid;
        var sm = Ext.create("Ext.selection.CheckboxModel", {
            mode: "MULTI",
            listeners: {
                selectionchange: function(){
                    Ext.bind(me.updateButtonState, grid)(grid.getView());
                },
            }
        });

        grid = me.itemList.grid = Ext.create("Beet.plugins.LiveSearch", {
            autoHeight: true,
            height: 480,
            minHeight: 200,
            selModel: sm,
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
                            border: false,
                            title: "增加项目"
                        })

                        win.add(Ext.create("Beet.apps.cards.AddItem", {
                            _editType: "add",
                            callback: function(){
                                win.close();
                                me.itemList.store.loadPage(me.itemList.store.currentPage)
                            }
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
            }),
            listeners: {
                itemdblclick: function(grid, record, item, index, e){
                    me.onSelectItem(grid, record, item, index, e);    
                },
                itemclick: function(grid){
                    Ext.bind(me.updateButtonState, this)(grid);
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
    updateButtonState: function(grid){
       var me = this;
       if (grid && grid.selModel){
            var list = grid.selModel.getSelection();
            var t = me.down("textfield[name=allupdates]");
            var b = me.down("button[name=update_btn]");
            var rtest = /^\d+[\.]?[\d+]?/;
            if (list.length > 0 && (t && t.getValue() && rtest.test(t.getValue()))){
                b.enable();
            }else{
                if (b){
                    b.disable();
                }
            }
       }
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
                        p.setHeight("100%");//reset && update
                        if (p.callUpdateMethod){
                            p.callUpdateMethod(p.getHeight());
                        }
                    }
                }
            }
        }
        me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "产品列表"
        }));
        me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
            title: "费用列表"
        }));

	me.childrenList = [
	    me.productsPanel,
	    me.chargeTypesPanel
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
                        }
                    ],
		    bbar: [
			"->",
			{
			    xtype: "button",
			    text: "确定",
			    width: 100,
			    hidden: (me.b_type != "selection"),
			    handler: function(){
				if (me.b_selectionCallback){
				    me.b_selectionCallback(me.itemList.grid.selModel.getSelection());
				}
			    }
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
        //_actions.items.push("-",{
        //    icon: "./resources/themes/images/fam/delete.gif",
        //    tooltip: "删除消耗产品",
        //    id: "customer_grid_delete",
        //    handler: function(grid, rowIndex, colIndex){
        //        var d = grid.store.getAt(rowIndex)
        //        me.deleteProducts(d);
        //    }
        //}, "-");

        //columns.push(_actions);
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
        //_actions.items.push("-",{
        //    icon: "./resources/themes/images/fam/delete.gif",
        //    tooltip: "删除费用",
        //    id: "customer_grid_delete",
        //    handler: function(grid, rowIndex, colIndex){
        //        var d = grid.store.getAt(rowIndex)
        //        me.deleteChargeType(d);
        //    }
        //}, "-");

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

        win.add(Ext.create("Beet.apps.cards.ChargeList", {
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
            border: false,
            title: "编辑项目: " + rawData["IName"]
        })

        var f = Ext.create("Beet.apps.cards.AddItem", {
            _editType: "edit",
            callback: function(){
                win.close();
                me.itemList.store.loadPage(me.itemList.store.currentPage)
            }
        })

        Ext.defer(function(){
            win.add(f);
            win.show();
            f.restoreFromData(rawData);
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
    editPriceList: function(record){
	var me = this, cardServer = Beet.constants.cardServer;
	var itemId = record.get("IID"), itemName = record.get("IName");
	if (itemId){
	    var win;
	    win = Ext.create("Ext.window.Window", {
		width: 600,
		height: 400,
		title: itemName + "的会员价格"
	    })

	    win.add(Ext.create("Beet.apps.cards.ItemPriceList", {
		itemid: itemId,
		itemName: itemName,
		_callback: function(){
		    win.close();   
		}
	    }))

	    win.show();
	}
    },
    onSelectItem: function(grid, record, item, index, e){
        var me = this, cardServer = Beet.constants.cardServer;
        me.selectedProducts = {};//reset
        me.selectedChargeType = {};
        me.resetAll();

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
                    //console.log(data)
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

        //expand, now it only expands the first one
        me.productsPanel.expand();
        //me.chargeTypesPanel.expand();
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
