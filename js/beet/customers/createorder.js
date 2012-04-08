registerMenu("customers", "customerAdmin", "会员管理",
    [
        {
            xtype: "button",
            text: "下单",
            handler: function(){
                var item = Beet.cache.menus["customers.CreateOrder"];
                if (!item){
                    Beet.workspace.addPanel("customers.CreateOrder", "下单", {
                        items: [
                            Ext.create("Beet.apps.customers.CreateOrder")
                        ]    
                    })
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

Ext.define("Beet.apps.customers.CreateOrder", {
    extend: "Ext.form.Panel",
    height: "100%",
    width: "100%",
    autoHeight: true,
    autoScroll:true,
    autoDestory: true,
    frame:true,
    border: false,
    bodyBorder: false,
    plain: true,
    initComponent: function(){
        var me = this;

        me.selectedItemIndex = 0;//init index

        me.selectedItems = {};

	me.selectedPackages = {};

        me.canEditOrder = true;
        me.currentCustomerBalance = 0;

        me.callParent();
        me.createMainPanel();

	me.customerDropdown = new Beet.plugins.customerDropDown();
	me.employeeDropdown = new Beet.plugins.employeeDropDown();
    },
    createMainPanel: function(){
        var me = this;
        
        var config = {
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
            items: [
                {
                    xtype: "panel",
                    flex: 1,
                    height: "100%",
                    autoScroll: true,
                    autoHeight: true,
                    name: "leftPanel",
                    items: [
                        {
                            xtype: "fieldset",
                            title: "快速定位",
                            collapsible: true,
                            layout: "anchor",
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
                                        labelAlign: "left",
                                        labelWidth: 30
                                    },
                                    items: [
                                        {
                                            fieldLabel: "卡号",
                                            xtype: "textfield",
                                            enableKeyEvents: true,
                                            name: "ccardno",
                                            listeners: {
                                                keydown: function(f, e){
                                                    if (e.getKey() == Ext.EventObject.ENTER){
                                                        var v = f.getValue();
                                                        if (v.length > 0){
                                                            me.quickQueryCustom(v, "cardno")
                                                        }
                                                        e.stopEvent();
                                                        e.stopPropagation();
                                                        return false;
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            fieldLabel: "会员名",
                                            xtype: "trigger",
                                            name: "customername",
                                            checkChangeBuffer: 500,
                                            listeners: {
                                                change: function(f, newValue, oldValue, opts){
						    Ext.callback(me.customerDropdown.onDropdown, me, [f, newValue, oldValue, opts], 30);
                                                }
                                            },
                                            onTriggerClick: function(){
                                                var win = Ext.create("Beet.plugins.selectCustomerWindow", {
                                                    b_selectionMode: "SINGLE",
                                                    _callback: function(r){
                                                        me.selectedCustomer = true;
                                                        me.onSelectCustomer(r);
                                                        win.hide();
                                                    }
                                                });
                                                win.show();
                                            }
                                        },
                                        {
                                            fieldLabel: "手机号",
                                            xtype: "textfield",
                                            enableKeyEvents: true,
                                            name: "mobile",
                                            listeners: {
                                                keydown: function(f, e){
                                                    if (e.getKey() == Ext.EventObject.ENTER){
                                                        var v = f.getValue();
                                                        if (v.length > 0){
                                                            me.quickQueryCustom(v, "mobile")
                                                        }
                                                        e.stopEvent();
                                                        e.stopPropagation();
                                                        return false;
                                                    }
                                                }
                                            }
                                        },
					{
					    xtype: "displayfield",
					    name: "currentCardBalance",
					    fieldLabel: "卡内余额",
					    value: 0
					},
					{
					    xtype: "displayfield",
					    name: "currentCardCapital",
					    fieldLabel: "卡内本金",
					    value: 0
					},
					{
					    fieldLabel: "订单价格",
					    xtype: "displayfield",
					    name: "orderprice",
					    value: 0
					},
                                        {
                                            xtype: "toolbar",
                                            ui: "",
                                            border: 0,
                                            style: {
                                                border: "0"
                                            },
                                            items: [
                                                "->",
						{
						    xtype: "button",
						    text: "绑定套餐",
						    name: "bindingPackage",
						    disabled: true,
						    handler: function(){
							me.selectPackage();
						    }
						},
                                                {
                                                    xtype: "button",
                                                    text: "消费历史",
                                                    disabled: true,
                                                    name: "customerhistory",
						    handler: function(){
							var win = Ext.create("Ext.window.Window", {
							    title: "消费历史",
							    height: 600,
							    width: 1000,
							    border: false,
							    autoHeight: true        
							});
							win.add(Ext.create("Beet.apps.customers.consumerHistoryPanel", {
							    cid : me.selectedCustomerId
							}))
							win.doLayout();
							win.show();
						    }
                                                },
                                                {
                                                    xtype: "button",
                                                    text: "会员卡详情",
                                                    name: "customerInfoBtn",
                                                    disabled: true
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: "fieldset",
                            title: "订单金额",
                            collapsible: true,
                            layout: "anchor",
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
                                        width: 260
                                    },
                                    defaultType: "textfield",
                                    fieldDefaults: {
                                        msgTarget: "side",
                                        labelAlign: "left",
                                        labelWidth: 30
                                    },
                                    items: [
                                        {
                                            fieldLabel: "订单号",
                                            xtype: "textfield",
                                            name: "serviceno",
                                            allowBlank: false
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
                {
                    xtype: "component",
                    width: 5
                },
                {
                    xtype: "panel",
                    flex: 2,
                    height: "100%",
                    name: "rightPanel"
                },
            ]
        }
        me.mainPanel = Ext.create("Ext.panel.Panel", config);
        me.add(me.mainPanel);
        me.doLayout();

        me.leftPanel = me.mainPanel.down("panel[name=leftPanel]");
        me.rightPanel = me.mainPanel.down("panel[name=rightPanel]");
        me.customerInfoBtn = me.mainPanel.down("button[name=customerInfoBtn]");
        me.customerHistoryBtn = me.mainPanel.down("button[name=customerhistory]");
        me.currentCardBalanceLable = me.mainPanel.down("displayfield[name=currentCardBalance]")
	me.currentCardCapital = me.mainPanel.down("displayfield[name=currentCardCapital]")
	me.bindingPackageBtn = me.mainPanel.down("button[name=bindingPackage]");

	me.orderprice = me.mainPanel.down("displayfield[name=orderprice]");

        //指定服务人员
        me.createListTabPanel();
        //订单区域
        me.createNewOrderPanel();
    },
    resetAll: function(){
        var me = this, form = me.getForm();
        form.setValues({
            "customername" : "",
            "ccardno" : "",
            "mobile" : "",
            "serviceno" : ""
        })
        me.selectedItems = {};
        me.selectedCustomerId = null;
        me.customerInfoBtn.disable();
        
	me.bindingItemsBtn.disable();
	me.bindingProductsBtn.disable();
	me.bindingPackageBtn.disable();

        me.createOrderBtn.disable();
        me.customerHistoryBtn.disable();
        me.currentCardBalanceLable.setValue(0);
	me.currentCardCapital.setValue(0)
    },
    cleanup: function(){
        var me = this;
        me.resetAll();

        if (me.itemsPanel.grid && me.itemsPanel.grid.store){
            me.itemsPanel.grid.getStore().loadData([])
        }
	if (me.productsPanel.grid && me.productsPanel.grid.store){
	    me.productsPanel.grid.store.removeAll();
	}
        for (var k in me.tabCache){
            me.listTabPanel.remove(me.tabCache[k], true);
            me.tabCache[k].close();
        }
        me.tabCache = {};
    },
    quickQueryCustom: function(value, type){
        var me = this, customerServer = Beet.constants.customerServer, _sql = "";
        var form = me.getForm();
        form.setValues({
            "customername" : "",
            "ccardno" : "",
            "mobile" : ""
        })
        var waitBox = Ext.MessageBox.show({
            msg: "正在查询中...",
            progressText: "查询中...",
            width: 300,
            wait: true,
            waitConfig: {interval: 800},
            closable: false
        });
        
        if (type == "cardno"){
            _sql = "CTCardNo='" + value + "'";
        }else{
            if (type == "mobile"){
                _sql = "CTMobile='" + value + "'";
            }
        }
        customerServer.GetCustomerPageData(0, 30, _sql, {
            success: function(data){
                var data = Ext.JSON.decode(data), a = {};
                waitBox.hide();
                data = data["Data"];
                if (data.length > 0){
                    a.raw = data[0];
                }
                me.onSelectCustomer(a);
            },
            failure: function(error){
                waitBox.hide();
                Ext.Error.raise(error)
            }
        })
    },
    showNotFinishPanel: function(type){
	var me = this, cardServer = Beet.constants.cardServer;
	var win = Ext.create("Ext.window.Window", {
	    width: 800,
	    height: 600,
	    title: "继续消费",
	    layout: {
		type: "vbox"
	    }
	});
	
	var itemGrid, productGrid;
	if (type == "items"){
	    var itemColumns = Ext.clone(me.itemsPanel.__columns);
	    itemColumns.shift();
	    itemGrid = Ext.create("Ext.grid.Panel", {
		store: me.itemsPanel.customerStore,
		flex: 1,
		width: "100%",
		cls: "iScroll",
		selModel: Ext.create("Ext.selection.CheckboxModel", { mode : "MULTI"}),
		autoScroll: true,
		columnLines: true,
		title: "剩余项目列表",
		columns: itemColumns 
	    });
	    itemGrid.on({
		"afterrender" : function(f){
		    if (f.headerCt){
			var headerColumns = f.headerCt.getGridColumns();
			for (var c = 0; c < headerColumns.length; c++){
			    var header = headerColumns[c];
			    if (header.dataIndex == "maxCount"){
				header.hide();
				break;
			    }
			}
		    }
		}
	    })
	    win.add(itemGrid);
	}else{
	    var productColumns = Ext.clone(me.productsPanel.__columns);
	    productColumns.shift();
	    productGrid = Ext.create("Ext.grid.Panel", {
		store: me.productsPanel.customerStore,
		flex: 1,
		width: "100%",
		cls: "iScroll",
		selModel: Ext.create("Ext.selection.CheckboxModel", { mode : "MULTI"}),
		autoScroll: true,
		columnLines: true,
		title: "剩余产品列表",
		columns: productColumns
	    });
	    productGrid.on({
		"afterrender" : function(f){
		    if (f.headerCt){
			var headerColumns = f.headerCt.getGridColumns();
			for (var c = 0; c < headerColumns.length; c++){
			    var header = headerColumns[c];
			    if (header.dataIndex == "maxCount"){
				header.hide();
				break;
			    }
			}
		    }
		}
	    })
	    win.add(productGrid);
	}

	win.add({
	    xtype: "toolbar",
	    dock : "bottom",
	    width: "100%",
	    items: [
		"->",
		{
		    xtype: "button",
		    text : "确定",
		    handler: function(){
			if (type == "items"){
			    var records = itemGrid.selModel.getSelection();
			    me.addItems(records);
			}else{
			    var products= productGrid.selModel.getSelection();
			    me.addProducts(products);
			}

			win.hide();
		    }
		}
	    ]   
	})


	win.show();
    },
    onSelectCustomer: function(records){
        var record, me = this, cardServer = Beet.constants.cardServer;
        var form = me.getForm();
        me.cleanup();
        if (Ext.isArray(records) && records.length > 0){
            record = records[0]
        }else{
            if (records && (records.data || records.raw)){
                record = records;
            }else{
                Ext.MessageBox.alert("错误", "该用户不存在, 请重新查找!");
                return;
            }
        }
        //get
        var rawData = record.raw;
        var CTGUID = rawData.CTGUID;

	cardServer.GetConsumerNotFinishData(false, "CustomerID='"+CTGUID+"'", false, {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		data = data["Data"];
		for (var c = 0; c < data.length; c++){
		    var product = data[c];
		    me.loadNotFinishProduct(product);
		}
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	});
	//items
	cardServer.GetConsumerNotFinishData(false, "CustomerID='"+CTGUID+"'", true, {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		data = data["Data"];
		for (var c = 0; c < data.length; c++){
		    var item = data[c];
		    me.loadNotFinishItem(item);
		}
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})

        cardServer.GetCustomerAccountData(false, "CustomerID='"+CTGUID+"'", {
            success: function(data){
                data = Ext.JSON.decode(data)["Data"];
                if (data.length == 0){
                    Ext.MessageBox.alert("警告", "当前用户没有开卡, 请重新选择或为此用户开卡!");
                    return;
                }else{
                    me.selectedCustomerId = CTGUID;
                    data = data[0];
                    if (data.State == 1){
                        //Ext.MessageBox.alert("警告", "当前用户已经销卡, 请重新选择或为此用户重新开卡!");
                        return;
                    }
		    var customTigger = me.down("triggerfield[name=customername]");
		    customTigger.suspendEvents();
                    form.setValues({
                        customername: data.CustomerName,
                        mobile: rawData.CTMobile,
                        ccardno: data.CardNo
                    });
		    customTigger.resumeEvents();
                    //开始查询他的卡项, 套餐, 费用
                    me.customerInfoBtn.enable();
                    me.bindingItemsBtn.enable();
		    me.bindingProductsBtn.enable();
		    me.bindingPackageBtn.enable();
                    me.createOrderBtn.enable();
                    me.customerHistoryBtn.enable();
                    me.currentCardBalanceLable.setValue('<span style="color:black;font-weight:bolder">' + data["Balance"] + "</span>");
                    me.currentCustomerBalance = data["Balance"];
                }
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },

    loadNotFinishItem: function(item){
	var me = this, cardServer = Beet.constants.cardServer;
	var itemId = item["ItemID"];
	cardServer.GetItemPageData(0, 1, "IID='" + itemId + "'", {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		data = data["Data"][0];
		data["isgiff"] = item["IsGiff"];
		data["itemDuration"] = item["TimeLength"];
		data["itemPrice"] = item["Price"];
		data["indexno"] = item["IndexNo"];
		data["lastCount"] = item["LastCount"];
		data["packageId"] = item["PackageID"];
		data["packageName"] = item["PackageName"];
		data["_groupName"] = "继续消费项目";


		//console.log(item, data)
		me.itemsPanel.customerStore.add(data);
	    },
	    failure: function(){
	    }
	})	
    },

    loadNotFinishProduct: function(product){
	var me = this, cardServer = Beet.constants.cardServer;
	var productId = product["ProductID"];
	cardServer.GetProductPageData(0, 1, "PID='" + productId + "'", {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		data = data["Data"][0];

		data["itemName"] = product["ItemName"];
		data["itemId"]   = product["ItemID"];
		data["packageName"] = product["PackageName"];
		data["packageId"] = product["PackageID"];
		data["lastCount"] = product["LastCount"];
		//消耗价格
		data["_price"] = product["Price"];
		data["COUNT"] = product["Count"];
		data["_groupName"] = "继续消费产品"

		me.productsPanel.customerStore.add(data);
	    },
	    failure: function(){
	    }
	})
    },

    createNewOrderPanel: function(){
        var me = this;
        var options = {
            autoScroll: true,
            autoHeight: true,
            height: Beet.constants.VIEWPORT_HEIGHT - 100,
            width: Beet.constants.WORKSPACE_WIDTH * (2/3) - 10,
            cls: "iScroll",
            border: true,
            plain: true,
            collapsible: true,
            collapseDirection: "top",
            collapsed: true,
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
        me.itemsPanel= Ext.widget("panel", Ext.apply(options, {
            title: "消费项目列表",
            tbar: [
		{
		    xtype: "button",
		    text : "继续消费",
		    name : "customerHData",
		    handler: function(){
			me.showNotFinishPanel("items");
		    }
		},
                {
                    xtype: "button",
                    text: "指定项目",
                    name: "bindingItems",
                    disabled: true,
                    handler: function(){
                        me.selectItems();
                    }
                }
            ]
        }));
	me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "消费产品列表",
            tbar: [
		{
		    xtype: "button",
		    text : "继续消费",
		    name : "customerHData2",
		    handler: function(){
			me.showNotFinishPanel("product");
		    }
		},
                {
                    xtype: "button",
                    text: "指定产品",
                    name: "bindingProducts",
                    disabled: true,
                    handler: function(){
			me.selectProducts();
                    }
                }
            ]
	}));
        me.bindingItemsBtn = me.itemsPanel.down("button[name=bindingItems]");
	me.bindingProductsBtn = me.productsPanel.down("button[name=bindingProducts]");
	
        me.childrenList = [
            me.itemsPanel,
	    me.productsPanel
        ]

        me.newOrderPanel = Ext.create("Ext.panel.Panel", {
            width: Beet.constants.WORKSPACE_WIDTH * (2/3) - 10,
            height: Beet.constants.VIEWPORT_HEIGHT - 15,
            border: false,
            bodyStyle: "background-color: #dfe8f5",
            items: me.childrenList,
            buttons: [
                {
                    text: "下单",
                    scale: "large",
                    disabled: true,
                    name: "_createorder",
                    handler: function(){
                        me.processData();
                    },
                },
                {
                    text: "重置",
                    scale: "large",
                    handler: function(){
                        me.cleanup()
                    }
                }
            ]
        })

        me.createOrderBtn = me.newOrderPanel.down("button[name=_createorder]")

        me.rightPanel.add(me.newOrderPanel);
        me.rightPanel.doLayout();

        Ext.defer(function(){
            me.itemsPanel.expand()    
        }, 500)

        me.initializeItemsPanel();
	me.initializeProductsPanel();
    },

    //{{{
    initializeItemsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
            return;
        }
        var columns = me.itemsPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 40,
            header: "操作",
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
        columns = columns.concat([
            {
                dataIndex: "isgiff",
                xtype: "checkcolumn",
                header: "赠送?",
                width: 40,
                editor: {
                    xtype: "checkbox",
                    cls: 'x-grid-checkheader-editor'
                },
		listeners: {
		    //需要自动增强
		    checkchange: function(f){
			me.autoCalculate();
		    }
		}
            }
        ])

	var itemDurationStore = Ext.create("Ext.data.Store", {
	    fields: ["Price", "TimeLength"]
	})

        cardServer.GetItemPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.itemsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    if (meta["FieldName"] == "IDescript"){
                        meta["FieldHidden"] = true;
                    }
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
                };

                me.itemsPanel.__fields = fields.concat([{name: "isgiff", type: "bool"}, "packageName", "packageId" , "itemDuration", "itemPrice", "maxCount", "lastCount", "indexno", "_uuid", "_groupName"]);
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
			    valueField: "TimeLength",
			    listeners: {
				select: function(f, record){
				    var record = record.shift();
				    var itemPrice = record.data["Price"];
				    if (itemPrice){
				        var _priceField = f.nextSibling()
					f.itemPrice = itemPrice;
					if (_priceField){
					    _priceField.setValue(itemPrice)
					}
				    }
				}
			    }
			}
		    },
                    {
                        dataIndex: "itemPrice",
                        header: "项目金额",
                        flex: 1,
                    },
		    {
			dataIndex: "packageName",
			header: "所属套餐",
			flex: 1
		    },
		    {
			dataIndex: "maxCount",
			header: "最大消费次数",
			flex: 1,
			field: {
			    xtype: "numberfield",
			    minValue: 1,
			    step: 1,
			    allowDecimals: false
			}
		    },
		    {
			dataIndex: "lastCount",
			header: "剩余次数",
			flex: 1
		    }
                ]);
                me.initializeItemsGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeItemsGrid: function(){
        var me = this, selectedItems = me.selectedItems, cardServer = Beet.constants.cardServer;
        var __fields = me.itemsPanel.__fields;

        if (me.itemsPanel.grid == undefined){
            var store = Ext.create("Ext.data.ArrayStore", {
                fields: __fields,
		groupField: "_groupName"
            });

	    me.itemsPanel.customerStore = Ext.create("Ext.data.ArrayStore", {
	        fields: __fields	
	    })

	    var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
		groupHeaderTpl: '{name} ({rows.length})'
	    });

            var grid = me.itemsPanel.grid = Ext.create("Ext.grid.Panel", {
                store: store,
                width: "100%",
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
		features: [groupingFeature],
                columns: me.itemsPanel.__columns,
                plugins: [
                    Ext.create('Ext.grid.plugin.RowEditing', {
                        clicksToEdit: 3,
                        listeners: {
			    beforeedit: function(e){
				var record = e.record, itemID = record.get("IID");
				var field = e.column.field

				//get maxCount filed
				if (field && field.ownerCt){
				    var form = field.ownerCt;
				    form.on("show", function(){
					var maxCountField = form.down("numberfield[name=maxCount]");
					if (!!record.get("indexno")){
					    maxCountField.setEditable(false);
					}else{
					    maxCountField.setEditable(true);
					}
				    })
				}

				if (field && field.store){
				    var store = field.store; 
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
				if (field && field.store){
				    var _priceField = field.nextSibling()
				    _priceField.setValue(field.itemPrice)
				    record.set("itemPrice", field.itemPrice);
				    record.set("isMember", field.isMember);
				    record.commit();
				}
			    }
                        }
                    })
                ],
                listeners: {
                    itemdblclick: function(grid,record,item,index, e){
                        var cardNo = record.data["CardNo"];
                        me.tapTabPanel(grid, record, item, index, e, cardNo, grid.getStore());
                    }
                }
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

        win.add(Ext.create("Beet.apps.cards.ItemList", {
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
	//将废弃原有的obj储存模式 使用extjs源生的store
        var me = this, selectedItems = me.selectedItems;
        var __fields = me.itemsPanel.__fields, store = me.itemsPanel.grid.store;

        if (records == undefined){
            return;
        }
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var rawData;
            if (isRaw){
                rawData = record;
            }else{
                rawData = record.raw || record.data;
            }

	    //这里index需要修改规则
            rawData["_uuid"] = Beet.uuid.get();

	    if (!rawData["_groupName"]){
		if (!!rawData["itemName"]){
		    rawData["_groupName"] = "所属项目: " + rawData["itemName"]
		}else{
		    if (!!rawData["packageName"]){
			rawData["_groupName"] = "所属套餐: " + rawData["packageName"]
		    }else{
			rawData["_groupName"] = "其余项目";
		    }
		}
	    }

	    //create a new?
	    // return an array
	    var newRecord = store.add(rawData);
	    newRecord = newRecord.shift();
	    me.loadProductFromItem(newRecord);
	    var uuid = newRecord.get("_uuid");
	    selectedItems[uuid] = {
		item: newRecord
	    }
        }
    },
    loadProductFromItem: function(item){
	var me = this, cardServer = Beet.constants.cardServer;
	var itemId = item.get("IID"), itemName = item.get("IName");

	cardServer.GetItemProductData(itemId, {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		data = data["Data"];
		if (data.length > 0){
		    for (var c = 0; c < data.length; c++){
			var product = data[c];
			product["itemName"] = itemName;
			product["itemId"] = itemId;
		    }
		    var products = me.addProducts(data, true);
		    me.selectedItems[item.get("_uuid")]["products"] = products;
		}
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})
    },
    deleteItem: function(record){
        var me = this, selectedItems = me.selectedItems;
	var store = me.itemsPanel.grid.store;
	var productstore = me.productsPanel.grid.store;
        var uuid = record.get("_uuid"), itemName = record.get("IName");
	var products = selectedItems[uuid]["products"];

	var removeItem = function(){
	    store.remove(record);
	    
	    //cleanup
	    delete selectedItems[uuid];
	    var tabid = "tab" + uuid;
	    if (me.tabCache[tabid]){
		me.listTabPanel.remove(me.tabCache[tabid], true);
		me.tabCache[tabid].close();
		me.tabCache[tabid] = null;
		me.listTabPanel.doLayout();
	    }
	}

	//这里同时也要做相关检测
	if (products && products.length > 0){
	    var _products = [];
	    for (var c = 0; c < products.length; c++){
		var product = products[c];
		_products.push(product.get("PName"));
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
			    productstore.remove(product);
			}
			removeItem();
		    }
		}
	    })
	}else{
	    removeItem();
	}
    },
    //}}}
    createListTabPanel: function(){
        var me = this;
        var options = {
            autoScroll: true,
            autoHeight: true,
            height: Beet.constants.VIEWPORT_HEIGHT - 290,
            width: Beet.constants.WORKSPACE_WIDTH * (1/3) - 10,
            cls: "iScroll",
            border: false,
            plain: true,
            title: "指定项目服务人员"
        }

        me.listTabPanel = Ext.create("Ext.tab.Panel", options);

        me.leftPanel.add(me.listTabPanel);
        me.leftPanel.doLayout();
    },
    tapTabPanel: function(grid, record, item, index, e, cardid, store){
        var me = this, tabId, itemId = record.get("_uuid");
        tabId = "tab"+itemId;
        if (me.tabCache == undefined){
            me.tabCache = {};
            me.listTabPanel.enable();
        }

        if (me.tabCache[tabId]){
            me.listTabPanel.setActiveTab(me.tabCache[tabId])
        }else{
            var tab = me.tabCache[tabId] = me.listTabPanel.add({
                title: record.get("IName") + (!!cardid ? " - (卡)" : ""),
                inTab: true,
                _tabid: tabId,
                _cardid : cardid,
                _itemStore: store,
                items: [
                    {
                        xtype: "panel",
                        border: false,
                        plain: true,
                        name: "_egrid",
                        tbar: [
			    {
				fieldLabel: "指派员工",
				xtype: "trigger",
				checkChangeBuffer: 500,
				listeners: {
				    change: function(f, newValue, oldValue, opts){
					Ext.callback(me.employeeDropdown.onDropdown, me, [f, newValue, oldValue, opts], 30);
				    },
				    keydown: function(f, e, opts){
					if (e.getKey() == Ext.EventObject.ENTER){
					    var v = f.getValue();
					    Ext.callback(me.employeeDropdown.onDropdown, me, [f, v, "", opts], 30);
					    return false;
					}
				    }
				},
				onTriggerClick: function(){
				    me.selectedEmployee = true;
                                    tab.popupEmpolyee();
				}
			    }
                        ]
                    }
                ]
            })

            me.listTabPanel.setActiveTab(tab)
            tab.panel = tab.down("panel[name=_egrid]");
            tab.panel.add(me.createEmpolyeeTempalte(tab));
            tab.panel.doLayout();
        }
    },

    createEmpolyeeTempalte: function(tab){
        var me = this;
        //init;
        tab.selectedEmpolyees = {};

        var __fields = tab.__fields = [
            "employeename", "employeeId", "employeeTime"    
        ]
        var store = tab.store = Ext.create("Ext.data.ArrayStore", {
            fields: tab.__fields
        });
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            header: "操作",
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "移除",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                tab.removeEmpolyee(d);
            }
        }, "-");
        var columns = tab.__columns = [
            _actions,
            {
                dataIndex: "employeename",
                header: "员工名",
                flex: 1
            },
            {
                dataIndex: "employeeTime",
                header: "工时",
                flex:1,
                hidden: true
            }
        ];
        tab.grid = Ext.create("Ext.grid.Panel", {
            store: store,
            height: tab.getHeight() - 29,
            width: "100%",
            cls: "iScroll",
            autoScroll: true,
            columnLines: true,
            columns: columns
        });

        tab.popupEmpolyee = function(){
            var win = Ext.create("Ext.window.Window", {
                title: "选择专属顾问",
                width: 750,
                height: 550,
                minHeight: 450,
                autoDestroy: true,
                autoHeight: true,
                autoScroll: true,
                layout: "fit",
                resizable: true,
                border: false,
                modal: false,
                maximizable: true,
                border: 0,
                bodyBorder: false,
            });
            win.add(Ext.create("Beet.apps.employees.EmployeeList", {
                b_type: "selection",
                b_selectionMode: "MULTI",
                height: "100%",
                width: "100%",
                b_selectionCallback: function(r){
                    tab.addEmpolyee(r);
                    win.hide();
                }
            }));
            win.doLayout();
            win.show();
        }
        tab.addEmpolyee = function(records){
            var selectedEmpolyees = tab.selectedEmpolyees;
            if (records == undefined){return;}
            for (var r = 0; r < records.length; ++r){
                var record = records[r];
                var eid, rawData;
                //if (isRaw){
                //    eid = record["PID"];
                //    rawData = record;
                //}else{
                    eid = record.get("EM_UserID");
                    rawData = record.raw;
                //}
                if (selectedEmpolyees[eid] == undefined){
                    selectedEmpolyees[eid] = []
                }else{
                    selectedEmpolyees[eid] = [];
                }

                selectedEmpolyees[eid] = [rawData["EM_NAME"], rawData["EM_UserID"], 0]
                //for (var c = 0; c < __fields.length; ++c){
                //    var k = __fields[c];
                //    selectedEmpolyees[eid].push(rawData[k]);
                //}
            }
            tab.updatePanel();
        }
	//alias
	me._addEmpolyee = tab.addEmpolyee;

        tab.removeEmpolyee = function(record){
            var selectedEmpolyees = tab.selectedEmpolyees;
            var eid = record.get("employeeId");
            if (selectedEmpolyees[eid]){
                selectedEmpolyees[eid] = null;
                delete selectedEmpolyees[eid];
            }

            tab.updatePanel();
        }
        tab.updatePanel = function(){
            var selectedEmpolyees = tab.selectedEmpolyees;
            var tmp = []
            for (var c in selectedEmpolyees){
                tmp.push(selectedEmpolyees[c]);
            }
            store.loadData(tmp);
        }

        return tab.grid
    },
    getItemRecord: function(store, key, value){
        for (var c = 0; c < store.getCount(); ++c){
            var record = store.getAt(c);
            var v = record.get(key);
            if (v){
                if (key == "_uuid"){
                    v = "tab" + v;
                }
                if (v == value){
                    return record;
                }
            }
        }
        return false
    },
    initializeProductsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.productsPanel.__columns && me.productsPanel.__columns.length > 0){
            return;
        }
        var columns = me.productsPanel.__columns = [];
	var fields = me.productsPanel.__fields = [];

        var _actions = {
            xtype: 'actioncolumn',
            width: 40,
            header: "操作",
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除产品",
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
                            c.field = {
                                xtype: "numberfield",
                                allowBlank: false,
				minValue: 0.000001,
				decimalPrecision: 6,
				listeners: {
				    change: function(f, newValue, oldValue){
					newValue = parseFloat(newValue);
					var _price = f.nextSibling();
					if (newValue > 0){
					    if (f.record){
						var sprice = f.record.get("PPrice");//单价
						var price = sprice * newValue;
						_price.setValue(price);
						f.record.set("_price", price)
					    }
					}
				    }
				}
                            }
                        }
			columns.push(c)
                    }
                }

		me.productsPanel.__fields = fields.concat(["itemName", "itemId", "packageName", "packageId", "maxCount", "lastCount", "_groupName", "_price"]);
		me.productsPanel.__columns = columns.concat([
		    {
			dataIndex: "_price",
			header: "消耗价格",
			flex: 1	
		    },
		    {
			dataIndex: "maxCount",
			header: "最大消费次数",
			flex: 1,
			field: {
			    xtype: "numberfield",
			    minValue: 1,
			    step: 1,
			    allowDecimals: false
			}
		    },
		    {
			dataIndex: "lastCount",
			header: "剩余次数",
			flex : 1
		    },
		    {
			header: "所属项目",
			dataIndex: "itemName",
			flex: 1
		    },
		    {
			header: "所属分类",
			dataIndex: "packageName",
			flex: 1
		    }
		]);
		
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
                fields: __fields,
		groupField: "_groupName"
            })

	    me.productsPanel.customerStore = Ext.create("Ext.data.ArrayStore", {
	        fields: __fields	
	    })

	    var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
		groupHeaderTpl: '{name} ({rows.length})'
	    });

            var grid = me.productsPanel.grid = Ext.create("Ext.grid.Panel", {
                store: store,
                height: "100%",
		width: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
		features: [groupingFeature],
                columns: me.productsPanel.__columns,
                plugins: [
                    Ext.create('Ext.grid.plugin.RowEditing', {
                        clicksToEdit: 2,
                        listeners: {
			    beforeedit: function(e){
				var record = e.record;
				var field = e.column.field
				field.record = record;
				if (!!record.get("itemName")){
				    Ext.MessageBox.show({
					title: "错误",
					msg : "你无法修改产品 " + record.get("PName") + "的数量或者价格.",
					buttons: Ext.MessageBox.OK
				    })
				    return false;
				}
			    },
			    edit: function(e){
				var record = e.record, pid = record.get("PID");
				//if (me.selectedProducts[pid]){
				//    me.selectedProducts[pid][__fields.length - 3] = record.get("COUNT")
				//    me.selectedProducts[pid][__fields.length - 2] = record.get("_isMember")
				//    me.selectedProducts[pid][__fields.length - 1] = record.get("_price")
				//}
				//me.updateProductsPanel();
				//me.autoCalculate();
				record.commit();
			    }
                        }
                    })
                ],
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
        var me = this;
	var store = me.productsPanel.grid.store;
        var __fields = me.productsPanel.__fields;

	var list = [];
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var pid, rawData;
            if (isRaw){
                pid = record["PID"];
                rawData = record;
            }else{
                pid = record.get("PID");
                rawData = record.raw || record.data;
            }

	    if (!rawData["_groupName"]){
		if (!!rawData["itemName"]){
		    rawData["_groupName"] = "所属项目: " + rawData["itemName"]
		}else{
		    if (!!rawData["packageName"]){
			rawData["_groupName"] = "所属套餐: " + rawData["packageName"]
		    }else{
			rawData["_groupName"] = "其余产品";
		    }
		}
	    }

	    list.push(rawData);
        }
	return store.add(list);
    },
    deleteProducts: function(record){
        var me = this;
	var store = me.productsPanel.grid.store;
	//check has item?
	itemName = record.get("itemName");
	if (!!itemName){
	    Ext.MessageBox.show({
		title: "无法删除产品: " + record.get("PName"),
		msg: "该产品隶属于项目 " + itemName + " , 你无法直接删除该产品, 必须删除它的所属项目",
		buttons: Ext.MessageBox.OK
	    });
	    return;
	}else{
	    store.remove(record);
	}
    },
    selectPackage: function(){
	var me = this;
	var win = Ext.create("Ext.window.Window", {
	    width: 800,
	    height: 600,
	    title: "选择套餐"
	});
	
	var panel = Ext.create("Beet.apps.cards.PackageList", {
	    b_type: "selection",
	    b_selectionMode: "SINGLE",
	    b_selectionCallback: function(records){
		me.loadPackages(records);
		win.close();
	    }
	});

	win.add(panel);
	win.show();
    },

    //load packages
    loadPackages: function(records){
	var me = this, cardServer = Beet.constants.cardServer;
	if (records.length <= 0){
	    return;
	}
	for (var c = 0; c < records.length; c++){
	    var record = records[c], packageId = record.get("ID"), packageName = record.get("Name");
	    me.selectPackage[packageId] = {
		"package": record.data
	    }

	    //load items
	    me.loadPackage(packageId, packageName)
	}
    },
    loadPackage: function(packageId, packageName){
	var me = this, cardServer = Beet.constants.cardServer;
	cardServer.GetPackagesItems(packageId, {
	    success: function(data){
		data = Ext.JSON.decode(data)["items"];
		var sql = []
		for (var c = 0; c < data.length; ++c){
		    sql.push("iid=" + data[c]);
		}
		var s = sql.join(" OR ");
		if (s.length > 0){
		    cardServer.GetItemPageData(1, 1000000, s, {
			success: function(data){
			    var data = Ext.JSON.decode(data)["Data"];
			    for (var d = 0; d < data.length; d++){
				data[d].packageName = packageName;
				data[d].packageId = packageId;
			    }
			    me.selectPackage[packageId].items = data;
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
	});

	//load product
        cardServer.GetPackageProducts(packageId, {
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
			    for (var d = 0; d < data.length; d++){
				data[d].packageName = packageName;
				data[d].packageId = packageId;
			    }
                            me.addProducts(data, true);
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
    },
    autoCalculate: function(){
	var me = this, itemsStore = me.itemsPanel.grid.getStore(),
	    productsStore = me.productsPanel.grid.getStore();
	var cost = 0;

	//for (var c = 0; c < itemsStore.getCount(); ++c){
	//    var item = itemsStore.getAt(c);
	//    var isgiff = item.get("isgiff"), price = item.get("itemPrice");
	//    if (price > 0 && !isgiff){
	//	cost += parseFloat(price);
	//    }
	//}

	//for (var c = 0; c < productsStore.getCount(); ++c){
	//    var product = productsStore.getAt(c);
	//    var pid = product.get("PID"), isMember = product.get("_isMember"),
	//	memberprice = parseFloat(product.get("MemberPrice")),
	//	PPrice = parseFloat(product.get("PPrice")),
	//	count = parseFloat(product.get("COUNT"));
	//    
	//    if (count > 0){
	//	cost += (isMember ? memberprice : PPrice) * count;
	//    }
	//    //if (selectedProducts[pid]){
	//    //    //delete selectedProducts[pid];
	//    //    //me.addProducts([product], false, true);
	//    //}
	//}

	me.orderprice.setValue(cost);
    },
    processData: function(){
        var me = this, cardServer = Beet.constants.cardServer,
            form = me.getForm(), values = form.getValues(), results = {};

        var serviceno = Ext.String.trim(values["serviceno"]);
        if (serviceno.length == 0){
            Ext.Msg.alert("警告", "请输入订单号!");
            return;
        }
        if (!me.selectedCustomerId){
            Ext.Msg.alert("警告", "请选择用户!");
            return;
        }
	
        var list = me.tabCache, items = [], products = [];

	var productsStore = me.productsPanel.grid.getStore();
	for (var c = 0; c < productsStore.getCount(); ++c){
	    record = productsStore.getAt(c);
	    var price = parseFloat(record.get("PRICE")),
		count = parseFloat(record.get("COUNT")),
		pid = record.get("PID"),
		pname = record.get("PName"),
		packageId = record.get("packageId"),
		maxCount = record.get("maxCount"),
		itemId = record.get("itemId");

	    if (count < 0){
		Ext.Msg.alert("警告", "产品 " + pname + " 需要设置消耗数量!");
		return;
	    }

	    var p = {
		pid: pid,
		count: count,
		maxcount: maxCount,
		indexno: Beet.constants.FAILURE
	    }

	    if (!!itemId){
		p["itemid"] = itemId;
	    }else{
		if (!!packageId){
		    p["packageid"] = packageId;
		}
	    }

	    products.push(p)
	}

	var itemStore = me.itemsPanel.grid.getStore();
	var items = [];
	if (itemStore.getCount() > 0){
	    itemStore.each(function(record){
		var isgiff = record.get("isgiff"),
		    uuid   = record.get("_uuid"),
		    itemId = record.get("IID"),
		    itemDuration = parseInt(record.get("itemDuration")),
		    itemPrice  = parseFloat(record.get("itemPrice")),
		    packageId = record.get("packageId"),
		    maxCount  = record.get("maxCount"),
		    tabId = "tab" + uuid, tab = me.tabCache[tabId],
		    employees = [], employeeStore = tab.grid.getStore();
		    for (var s = 0; s < employeeStore.getCount(); ++s){
			var _s = employeeStore.getAt(s);
			employees.push( _s.data["employeeId"]);
		    }
		    if (employees.length == 0){
			Ext.Msg.alert("警告", "请对每个项目指定服务员!");
			return;
		    }
		    
		    var c = {
			itemid: itemId,
			timelength: itemDuration,
			isgiff: isgiff,
			employees: employees,
			maxcount: maxCount,
			indexno: Beet.constants.FAILURE
		    }

		    if (!!packageId){
			c["packageid"] = packageId;
		    }

		    items.push(c)
	    })
	}
		
        results = {
            customerid: me.selectedCustomerId,
            serviceno: serviceno,
	    employeeid : Beet.cache.currentEmployGUID,
	    price: {
		items: items,
		products: products
	    }
        }

        cardServer.AddConsumer(Ext.JSON.encode(results), {
            success: function(succ){
                if (succ){
                    Ext.MessageBox.alert("成功", "新增订单成功!");
                    me.cleanup();    
                }else{
                    Ext.MessageBox.alert("警告", "新增订单失败!");
                }
            },
            failure: function(err){
                Ext.Error.raise(err)
            }
        })
    }
})
