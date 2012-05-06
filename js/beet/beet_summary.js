Ext.namespace("Beet.apps.summary")

registerMenu("summary", "summaryCustomer", "消费统计",
    [
        {
            xtype: "button",
            text: "会员消费查询",
            handler: function(){
                var item = Beet.cache.menus["summary.CustomerConsumer"];
                if (!item){
		    Beet.workspace.addPanel("summary.CustomerConsumer", "会员消费查询", {
			items: [
			    Ext.create("Beet.apps.summary.CustomerConsumer")
			]
		    });
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

Ext.define("Beet.apps.summary.CustomerConsumer", {
    extend: "Ext.panel.Panel",
    height: "100%",
    width: "100%",
    layout: "fit",
    autoScroll: true,
    border: false,
    bodyBorder: false,
    bodyStyle: "background-color: #dfe8f5",
    b_filter: "",
    initComponent: function(){
	var me = this;
	me.searchKeyData = {};

	me.callParent();
	me.createMainPanel();
    },
    createMainPanel: function(){
	var me = this;

	me.mainPanel = Ext.create("Ext.panel.Panel", {
	    height: "100%",
	    width: "100%",
	    layout: "vbox",
	});
	me.add(me.mainPanel);
	me.doLayout();

	me.createOrderListPanel();
    },
    createOrderListPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var columns = [];

        cardServer.GetConsumerPageData(0, 1, "", {
            success: function(data){
		me.searchKeyData["orderList"] = Ext.JSON.decode(data);
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = [];

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

                me.initializeOrderListGrid(columns, fields);
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeOrderListGrid: function(columns, fields){
        var me = this;

        if (!Beet.apps.OrderListStore){
            Ext.define("Beet.apps.OrderListStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: fields,
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

        if (me.ordergrid == undefined){
            var store = Ext.create("Beet.apps.OrderListStore");
            store.setProxy(me.updateOrderListProxy(""));//初始化时候
            var grid;
            
            grid = me.ordergrid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: columns,
		width: "100%",
		flex: 1,
		tbar: [
		    "-",
		    {
			xtype: "button",
			text: "高级搜索",
			handler: function(){
			    var win = Ext.create("Beet.apps.AdvanceSearch", {
			      searchData: me.searchKeyData["orderList"],
			      b_callback: function(where){
				  me.updateAll(Beet.constants.FAILURE);
			          me.ordergrid.store.setProxy(me.updateOrderListProxy(where));
				  me.ordergrid.store.loadPage(1);
			      }
			    });
			    win.show();
			}
		    },
		    {
			xtype: "button",
			text : "Export",
			handler: function(f){
			    var data = Ext.ux.exporter.Exporter.exportGrid(me.ordergrid, "excel", {
				title: "会员消费查询"	
			    })
			    window.open("data:application/octet-stream," + encodeURIComponent(data), "neuesDokument")
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
                    itemdblclick: function(f, record, item, index, e){
                        var indexno  = record.get("IndexNo");
			me.updateAll(indexno)
                    }
                }
            });

	    me.mainPanel.add(grid);
	    me.mainPanel.doLayout();
        }
	me.createOrderTabPanel();
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
    createOrderTabPanel: function(){
	var me = this, cardServer = Beet.constants.cardServer;
	me.orderTabpanel = Ext.create("Ext.tab.Panel", {
	    width: "100%",
	    flex: 2, 
	    tabPosition: "bottom"
	});

	me.mainPanel.add(me.orderTabpanel);
	me.doLayout();
	
	//init 3 panel

        cardServer.GetConsumerItemsData(true, "", {
            success: function(data){
		me.searchKeyData["consumerItems"] = Ext.JSON.decode(data);
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = [], columns = [];
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
			    case "Price":
				c.xtype = "numbercolumn";
				c.summaryType = function(records){
				    var i = 0,
					length = records.length,
					total = 0,
					record;

				    for (; i < length; i++){
					record = records[i];
					if (!record.get("IsGiff")){
					    total += parseFloat(record.get("Price"))
					}
				    }

				    return "合计:  " + Ext.util.Format.RMBMoney(total)
				}
				break;
			    case "IsGiff":
				c.xtype = "booleancolumn";
				c.trueText = "是";
				c.falseText = "否";
				break;
			}

                        columns.push(c);
                    }
                }

                me.initOrderItemsGrid(columns, fields);
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
	});


        cardServer.GetConsumerProductsData(true, "", {
            success: function(data){
		me.searchKeyData["consumerProducts"] = Ext.JSON.decode(data);
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = [], columns = []

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
			    case "Price":
				c.xtype = "numbercolumn";
				c.summaryType = function(records){
				    var i = 0,
					length = records.length,
					total = 0,
					record;

				    for (; i < length; i++){
					record = records[i];
					if (!record.get("IsGiff")){
					    total += parseFloat(record.get("Price"))
					}
				    }

				    return "合计:  " + Ext.util.Format.RMBMoney(total)
				}
				break;
			    case "IsGiff":
				c.xtype = "booleancolumn";
				c.trueText = "是";
				c.falseText = "否";
				break;
			}

                        columns.push(c);
                    }
                }

                me.initializeOrderProductsGrid(columns, fields);
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });

        cardServer.GetConsumerStockData(true, "", {
            success: function(data){
		me.searchKeyData["stockData"] = Ext.JSON.decode(data);
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = [], columns = [];
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
        			c.xtype = "numbercolumn";
				break;
        		    case "Price":
        			c.xtype = "numbercolumn";
				c.summaryType = function(records){
				    var i = 0,
					length = records.length,
					total = 0, 
					record;

				    for (; i < length; i++){
				        record = records[i];
				        total += parseFloat(record.get("Price")) * parseFloat(record.get("COUNT"))
				    }

				    return "合计:  " + Ext.util.Format.RMBMoney(total)
				}
        			break;
        		}

                        columns.push(c);
                    }
                }

                me.initializeStockDataGrid(columns, fields);
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initOrderItemsGrid: function(columns, fields){
	var me = this, cardServer = Beet.constants.cardServer;
        if (!Beet.apps.cards.orderItemStore){
            Ext.define("Beet.apps.cards.orderItemStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: fields,
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
                    b_method: cardServer.GetConsumerItemsData,
                    b_params: {
                        "b_onlySchema": true,
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

        if (me.orderItemGrid == undefined){
            var store = Ext.create("Beet.apps.cards.orderItemStore");

            var grid = me.orderItemGrid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: columns,
		features: [
		    {
			ftype: "summary"
		    }
		],
		tbar: [
		    "-",
		    {
			xtype: "button",
			text: "高级搜索",
			handler: function(){
			    var win = Ext.create("Beet.apps.AdvanceSearch", {
			      searchData: me.searchKeyData["consumerItems"],
			      b_callback: function(where){
				  me.orderItemGrid.store.setProxy(me.updateOrderItemsProxy(where))
				  me.orderItemGrid.store.loadPage(1);
				  me.orderItemGrid.store.addListener("load", me.searchOrderListByItems, me)
			      }
			    });
			    win.show();
			}
		    },
		],
		title: "项目详情"
            });

	    me.orderTabpanel.add(grid);
        }
    },
    searchOrderListByItems: function(f, records){
	var me = this,sql = [],
	    i = 0,
	    length = records.length,
	    record;
	for (; i < length; i++) {
	    record = records[i];
	    sql.push("IndexNo ='" + record.get("IndexNo") + "'");
	}
	me.orderItemGrid.store.removeListener("load", me.searchOrderListByItems, me)
	me.updateAll(Beet.constants.FAILURE);
	if (sql.length > 0){
	    me.ordergrid.store.setProxy(me.updateOrderListProxy(sql.concat(" OR ")));
	    me.ordergrid.store.loadPage(1);
	    me.updateAll(records[0].get("IndexNo"))
	}
    },
    updateOrderItemsProxy : function(filter){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetConsumerItemsData,
            b_params: {
                "b_onlySchema": false,
                "awhere" : filter
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        }
    },
    initializeOrderProductsGrid: function(columns, fields){
        var me = this, cardServer = Beet.constants.cardServer;

        if (!Beet.apps.cards.orderProductStore){
            Ext.define("Beet.apps.cards.orderProductStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: fields,
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
                    b_method: cardServer.GetConsumerProductsData,
                    b_params: {
                        "b_onlySchema": true,
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

        if (me.orderProductGrid == undefined){
            var store = Ext.create("Beet.apps.cards.orderProductStore");

            var grid = me.orderProductGrid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: columns,
		tbar: [
		    "-",
		    {
			xtype: "button",
			text: "高级搜索",
			handler: function(){
			    var win = Ext.create("Beet.apps.AdvanceSearch", {
			      searchData: me.searchKeyData["consumerProducts"],
			      b_callback: function(where){
				  me.orderProductGrid.store.setProxy(me.updateOrderProductsProxy(where))
				  me.orderProductGrid.store.loadPage(1);
				  me.orderProductGrid.store.addListener("load", me.searchOrderListByProducts, me)
			      }
			    });
			    win.show();
			}
		    },
		],
		features: [
		    {
			ftype: "summary"
		    }
		],
		title: "产品详情"
            });

	    me.orderTabpanel.add(grid);
        }
    },
    searchOrderListByProducts: function(f, records){
	var me = this,sql = [],
	    i = 0,
	    length = records.length,
	    record;
	for (; i < length; i++) {
	    record = records[i];
	    sql.push("IndexNo ='" + record.get("IndexNo") + "'");
	}
	me.orderProductGrid.store.removeListener("load", me.searchOrderListByProducts, me)
	me.updateAll(Beet.constants.FAILURE);
	if (sql.length > 0){
	    me.ordergrid.store.setProxy(me.updateOrderListProxy(sql.concat(" OR ")));
	    me.ordergrid.store.loadPage(1);
	    me.updateAll(records[0].get("IndexNo"))
	}
    },
    updateOrderProductsProxy : function(b_filter){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetConsumerProductsData,
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
    initializeStockDataGrid: function(columns, fields){
        var me = this, cardServer = Beet.constants.cardServer;

        if (!Beet.apps.customers.StockDataStore){
            Ext.define("Beet.apps.customers.StockDataStore", {
                extend: "Ext.data.Store",
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                fields: fields,
		groupField: 'ServiceNo',
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
                    b_method: cardServer.GetConsumerStockData,
                    b_params: {
                        "b_onlySchema": true,
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

        if (me.stockDataGrid == undefined){
            var store = Ext.create("Beet.apps.customers.StockDataStore");

            var grid = me.stockDataGrid = Ext.create("Beet.plugins.LiveSearch", {
                store: store,
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: columns,
		tbar: [
		    "-",
		    {
			xtype: "button",
			text: "高级搜索",
			handler: function(){
			    var win = Ext.create("Beet.apps.AdvanceSearch", {
			      searchData: me.searchKeyData["stockData"],
			      b_callback: function(where){
				  me.stockDataGrid.store.setProxy(me.updateStockDataProxy(where))
				  me.stockDataGrid.store.loadPage(1);
				  me.stockDataGrid.store.addListener("load", me.searchOrderListByStock, me)
			      }
			    });
			    win.show();
			}
		    },
		],
		features: [
		    {
			ftype: "groupingsummary",
			groupHeaderTpl: '{name}',
			hideGroupedHeader: true,
			enableGroupingMenu: false
		    }
		],
		title : "物料详情"
            });

	    me.orderTabpanel.add(grid);
        }
    },
    searchOrderListByStock: function(f, records){
	var me = this,sql = [],
	    i = 0,
	    length = records.length,
	    record;
	for (; i < length; i++) {
	    record = records[i];
	    sql.push("IndexNo ='" + record.get("IndexNo") + "'");
	}
	me.stockDataGrid.store.removeListener("load", me.searchOrderListByStock, me)
	me.updateAll(Beet.constants.FAILURE);
	if (sql.length > 0){
	    me.ordergrid.store.setProxy(me.updateOrderListProxy(sql.concat(" OR ")));
	    me.ordergrid.store.loadPage(1);
	    me.updateAll(records[0].get("IndexNo"))
	}
    },
    updateStockDataProxy : function(b_filter){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetConsumerStockData,
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
    updateAll: function(indexno){
	var me = this;
	me.orderItemGrid.store.setProxy(me.updateOrderItemsProxy("IndexNo = '" + indexno + "'"));
	me.orderItemGrid.store.loadPage(1);
	me.orderProductGrid.store.setProxy(me.updateOrderProductsProxy("IndexNo = '" + indexno + "'"));
	me.orderProductGrid.store.loadPage(1);
	me.stockDataGrid.store.setProxy(me.updateStockDataProxy("IndexNo = '" + indexno +"'"));
	me.stockDataGrid.store.loadPage(1);
    }
})
