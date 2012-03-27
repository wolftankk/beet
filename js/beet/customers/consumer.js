(function(){
    registerMenu("customers", "customerAdmin", "会员管理",
        [
            {
                xtype: "button",
                text: "结算",
                handler: function(){
                    var item = Beet.cache.menus["customers.EndConsumer"];
                    if (!item){
                        Beet.workspace.addPanel("customers.EndConsumer", "结算", {
                            items: [
                                Ext.create("Beet.apps.customers.EndConsumer")
                            ]    
                        })
                    }else{
                        Beet.workspace.workspace.setActiveTab(item);
                    }
                }
            }
        ]
    )

var orderStatus = Ext.create("Ext.data.Store", {
    fields: ["attr", "name"],
    data: [
        {attr: -1, name: "全部"},
        {attr: 0, name: "已下单"},
        {attr: 1, name: "消费单退回"},
        {attr: 2, name: "已审核"},
        {attr: 3, name: "已结算"},
    ]    
})

Ext.define("Beet.apps.customers.EndConsumer", {
    extend: "Ext.form.Panel",
    height: Beet.constants.VIEWPORT_HEIGHT - 5,
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

        me.callParent();
        me.createMainPanel();
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
                                            fieldLabel: "订单号",
                                            xtype: "textfield",
                                            enableKeyEvents: true,
                                            name: "ccardno",
                                            listeners: {
                                                keydown: function(f, e){
                                                    if (e.getKey() == Ext.EventObject.ENTER){
                                                        var v = f.getValue();
                                                        if (v.length > 0){
                                                            var store = me.orderListPanel.grid.getStore();
                                                            store.setProxy(me.updateOrderListProxy("ServiceNo = '" + v + "'"));//初始化时候
                                                            store.loadPage(1);
                                                        }
                                                        e.stopEvent();
                                                        e.stopPropagation();
                                                        return false;
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            fieldLabel: "订单状态",
                                            xtype: "combobox",
                                            editable: false,
                                            name: "customername",
                                            store: orderStatus,
                                            queryMode: "local",
                                            displayField: "name",
                                            valueField : "attr",
                                            value: 0,
                                            listeners: {
                                                change: function(f, newvalue){
                                                    var sql = "";
                                                    if (newvalue == -1){
                                                        sql = ""
                                                    }else{
                                                        sql = ("State = " + newvalue)
                                                    }
                                                    var store = me.orderListPanel.grid.getStore();
                                                    store.setProxy(me.updateOrderListProxy(sql));//初始化时候
                                                    store.loadPage(1);
                                                }
                                            }
                                        },
                                    ]
                                },
                            ]
                        },
                        {
                            xtype: "toolbar",
                            ui: "",
                            border: 0,
                            style: {
                                border: "0"
                            },
                            onBeforeAdd: function(component){
                            },
                            items: [
                                "->",
                                {
                                    text: "结算",
                                    scale: "large",
                                    width: 100,
                                    disabled: true,
                                    name: "clearingFee",
                                    handler: function(){
                                        var grid = me.orderListPanel.grid,
                                            sm = grid.selModel, list = sm.getSelection(),
                                            cardServer = Beet.constants.cardServer;
                                        if (list.length == 0){
                                            Ext.Msg.alert("失败", "请指定需要结算的订单");
                                            return;
                                        }
                                        
                                        var results = [];
                                        for (var c = 0; c < list.length; ++c){
                                            var order = list[c], state = order.get("State");
                                            //if (state != 2){
                                            //    Ext.Msg.alert("失败", "你选定的订单不能结算. 状态必须为已审核!");
                                            //    return;
                                            //}
                                            results.push({
                                                index: order["index"],
                                                indexno: order.get("IndexNo")
                                            });
                                        }
                                        if (results.length > 0){
                                            cardServer.EndConsumer(Ext.JSON.encode(results), {
                                                success: function(r){
                                                    r = Ext.JSON.decode(r);
                                                    if (r.length == 0) { }

                                                    var str = [], pass = true;
                                                    for (var c = 0; c < r.length; ++c){
                                                        var info = r[c];
                                                        //true
                                                        if (info["result"]){
                                                            updateGridRowBackgroundColor(grid, "#e2e2ff", info["index"]);
                                                        }else{
                                                            var rowIdx = updateGridRowBackgroundColor(grid, "#ffe2e2", info["index"], info["message"]);
                                                            str.push("第" + rowIdx + "行 :" + info["message"]);
                                                        }

                                                        pass = pass && info["result"];
                                                    }

                                                    if (pass){
                                                    }else{
                                                        Ext.MessageBox.show({
                                                            title: "错误",
                                                            msg: str.join("<br/>"),
                                                            buttons: Ext.MessageBox.OK    
                                                        })
                                                    }
                                                },
                                                failure: function(error){
                                                    Ext.Error.raise(error)
                                                }
                                            })
                                        }
                                    }
                                },
				"-","-",
				{
                                    text: "下单回退",
                                    scale: "large",
                                    width: 100,
                                    disabled: true,
				    name: "cancelconsumer",
				    handler: function(){
                                        var grid = me.orderListPanel.grid,
                                            sm = grid.selModel, list = sm.getSelection(),
                                            cardServer = Beet.constants.cardServer;
                                        if (list.length == 0){
                                            Ext.Msg.alert("失败", "请指定需要结算的订单");
                                            return;
                                        }
                                        
					var cancelConsumer = function(indexno, serviceNo){
					    cardServer.CancelConsumer(indexno, {
					      success: function(succ){
						  if (succ){
						      Ext.Msg.alert("成功", "订单号: " + indexno + ", 回退成功!");
						  }else{
						      Ext.Msg.alert("失败", "订单号: " + indexno + ", 回退失败!");
						  }
						  grid.store.loadPage(1);
					      },
					      failure: function(error){
						  Ext.Error.raise(error);
					      }
					    })
					}
                                        for (var c = 0; c < list.length; ++c){
                                            var order = list[c], state = order.get("State");
                                            //if (state != 2){
                                            //    Ext.Msg.alert("失败", "你选定的订单不能结算. 状态必须为已审核!");
                                            //    return;
                                            //}
					    cancelConsumer(order.get("IndexNo"), order.get("ServiceNo"));
                                        }
				    }
				}
                            ]
                        }
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
        me.clearingFeeBtn = me.mainPanel.down("button[name=clearingFee]");
	me.cancelConsumerBtn = me.mainPanel.down("button[name=cancelconsumer]");

        me.createOrderPanel();
    },
    createOrderPanel: function(){
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
                    if (p && p.setHeight && me.childrenList[p]){
                        p.setHeight(Beet.constants.VIEWPORT_HEIGHT - 100);//reset && update
                    }
                }
            }
        }

        me.orderListPanel = Ext.widget("panel", Ext.apply(options, {
            title: "订单列表",
	    //collapsible: false,
	    //collapsed: false,
	    height: 240
        }));

        me.orderDetailPanel = Ext.create("Ext.panel.Panel", Ext.apply(options, {
            title: "订单详情",
        }));

	me.stockDataPanel = Ext.create("Ext.panel.Panel", Ext.apply(options, {
	    title: "物料信息"   
	}))

        me.childrenList = [
            me.orderDetailPanel,
	    me.stockDataPanel
        ]

        me.rightPanel.add(me.orderListPanel);
        me.rightPanel.add(me.orderDetailPanel);
	me.rightPanel.add(me.stockDataPanel);
        me.rightPanel.doLayout();

        me.initializeOrderPanel();
        me.initializeOrderDetailPanel();
	me.initializeStockDataPanel();

        Ext.defer(function(){
            me.orderListPanel.expand()    
        }, 500)
    },
    initializeOrderPanel : function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.orderListPanel.__columns && me.orderListPanel.__columns.length > 0){
            return;
        }
        var columns = me.orderListPanel.__columns = [];

        cardServer.GetConsumerPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.orderListPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        var c = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        }

                        columns.push(c);
                    }
                }

                me.initializeOrderListGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    updateOrderListProxy: function(b_filter){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetConsumerPageData,
            startParam: "start",
            limitParam: "limit",
            b_params: {
                "awhere" : b_filter
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        }
    },
    initializeOrderListGrid: function(){
        var me = this, selectedProducts = me.selectedProducts;
        var __fields = me.orderListPanel.__fields;
        //console.log(__fields)

        if (!Beet.apps.OrderListStore){
            Ext.define("Beet.apps.OrderListStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: __fields,
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

        if (me.orderListPanel.grid == undefined){
            var store = Ext.create("Beet.apps.OrderListStore");
            store.setProxy(me.updateOrderListProxy("State = 0"));//初始化时候
            var grid;
            var sm = Ext.create("Ext.selection.CheckboxModel", {
                mode: "MULTI",
                listeners: {
                    beforeselect: function(f, record, index){
                        //var state = record.get("State");
                        //if (state == 2){
                        me.clearingFeeBtn.enable();
			me.cancelConsumerBtn.enable();
                        //    return true
                        //}
                        //me.clearingFeeBtn.disable();
                        ////Ext.MessageBox.alert("失败", "你所勾选的不符合规定, 无法结算");
                        //return false
                    }
                }
            });
            
            grid = me.orderListPanel.grid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                height: "100%",
                cls: "iScroll",
                selModel: sm,
                autoScroll: true,
                columnLines: true,
                columns: me.orderListPanel.__columns,
                bbar: Ext.create("Ext.PagingToolbar", {
                    store: store,
                    displayInfo: true,
                    displayMsg: '当前显示 {0} - {1} 到 {2}',
                    emptyMsg: "没有数据"
                }),
                listeners: {
                    itemdblclick: function(f, record, item, index, e){
                        var indexno  = record.get("IndexNo");
                        me.orderDetailPanel.expand();
                        me.orderDetailPanel.store.setProxy(me.updateOrderDetailProxy("IndexNo = '" + indexno + "'"));
                        me.orderDetailPanel.store.loadPage(1);
                    }
                }
            });
            grid.selModel = sm;

            me.orderListPanel.add(grid);
            me.orderListPanel.doLayout();
        }
    },
    initializeOrderDetailPanel: function(){
        var me  = this, cardServer = Beet.constants.cardServer;
        if (me.orderDetailPanel.__columns && me.orderDetailPanel.__columns.length > 0){
            return;
        }
        var columns = me.orderDetailPanel.__columns = [];

        cardServer.GetConsumerDetailData(true, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.orderDetailPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        var c = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        }

			switch (meta["FieldName"]){
			    case "CardPay":
			    case "Cost":
				c.xtype = "numbercolumn";
				break;
			}

                        columns.push(c);
                    }
                }

                me.initializeOrderDetailGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    updateOrderDetailProxy : function(b_filter){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetConsumerDetailData,
            b_params: {
                "b_onlySchema": false,
                "awhere" : b_filter
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        }
    },
    initializeOrderDetailGrid: function(){
        var me = this, selectedProducts = me.selectedProducts, cardServer = Beet.constants.cardServer;
        var __fields = me.orderDetailPanel.__fields;

        if (!Beet.apps.OrderDetailStore){
            Ext.define("Beet.apps.OrderDetailStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: __fields,
                load: function(options){
                    var that = this, options = options || {};
                    if (Ext.isFunction(options)){
                        options = {
                            callback: options
                        };
                    }
                    Ext.applyIf(options, {
                        groupers: that.groupers.items,
                        addRecords: false
                    });
                    return that.callParent([options]);
                },
                proxy: {
                    type: "b_proxy",
                    b_method: cardServer.GetConsumerDetailData,
                    b_params: {
                        "b_onlySchema": false,
                        "awhere" : ""
                    },
                    b_scope: Beet.constants.cardServer,
                    reader: {
                        type: "json",
                        root: "Data",
                        totalProperty: "TotalCount"
                    }
                }
            })
        }

        if (me.orderDetailPanel.grid == undefined){
            var store = Ext.create("Beet.apps.OrderDetailStore");

            var grid = me.orderDetailPanel.grid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.orderDetailPanel.__columns,
            });
            me.orderDetailPanel.store = store;


            me.orderDetailPanel.add(grid);
            me.orderDetailPanel.doLayout();
        }
    },

    initializeStockDataPanel: function(){
        var me  = this, cardServer = Beet.constants.cardServer;
        if (me.stockDataPanel.__columns && me.stockDataPanel.__columns.length > 0){
            return;
        }
        var columns = me.stockDataPanel.__columns = [];

	/*
        cardServer.GetConsumerStockData("", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.orderDetailPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        var c = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        }

			switch (meta["FieldName"]){
			    case "CardPay":
			    case "Cost":
				c.xtype = "numbercolumn";
				break;
			}

                        columns.push(c);
                    }
                }

                me.initializeStockDataGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
	*/
    },
    initializeStockDataGrid: function(){
        var me = this, selectedProducts = me.selectedProducts, cardServer = Beet.constants.cardServer;
        var __fields = me.stockDataPanel.__fields;

	/*
        if (!Beet.apps.OrderDetailStore){
            Ext.define("Beet.apps.OrderDetailStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: __fields,
                load: function(options){
                    var that = this, options = options || {};
                    if (Ext.isFunction(options)){
                        options = {
                            callback: options
                        };
                    }
                    Ext.applyIf(options, {
                        groupers: that.groupers.items,
                        addRecords: false
                    });
                    return that.callParent([options]);
                },
                proxy: {
                    type: "b_proxy",
                    b_method: cardServer.GetConsumerDetailData,
                    b_params: {
                        "b_onlySchema": false,
                        "awhere" : ""
                    },
                    b_scope: Beet.constants.cardServer,
                    reader: {
                        type: "json",
                        root: "Data",
                        totalProperty: "TotalCount"
                    }
                }
            })
        }

        if (me.orderDetailPanel.grid == undefined){
            var store = Ext.create("Beet.apps.OrderDetailStore");

            var grid = me.orderDetailPanel.grid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.orderDetailPanel.__columns,
            });
            me.orderDetailPanel.store = store;


            me.orderDetailPanel.add(grid);
            me.orderDetailPanel.doLayout();
        }
	*/
    }
});
})(window)
