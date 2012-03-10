Ext.ns("Beet.apps.warehouses");

//registerBeetAppsMenu("warehouse", 
//{
//    title: "库存管理",
//    items: [
//    {
//        xtype: "container",
//        layout: "hbox",
//        frame: true,
//        defaults: {
//        height: 80,
//        width: 200
//        },
//        defaultType: "buttongroup",
//        items: [
//            {
//            xtype: 'buttongroup',
//            title: '库存管理',
//            layout: "anchor",
//            frame: true,
//            width: 300,
//            defaults: {
//                scale: "large",
//                rowspan: 3
//            },
//            items: [
//                {
//                },
//                {
//                    xtype: "button",
//                    text: "库存历史查询",
//                    handler: function(){
//                    var item = Beet.apps.Menu.Tabs["stockHistory"];
//                    if (!item){
//                        Beet.workspace.addPanel("stockHistory", "库存历史查询", {
//                        items: [
//                            Ext.create("Beet.apps.warehouses.stockHistory")
//                        ]
//                        });
//                    }else{
//                        Beet.workspace.workspace.setActiveTab(item);
//                    }
//                    }
//                }
//            ]
//        }
//        ]
//    }
//    ]
//});
//
//
Beet.constants.stockStauts = Ext.create("Ext.data.Store", {
    fields: ["attr", "name"],
    data: [
        {attr: "all", name: "全部"},
        {attr: 0, name: "申请入库"},
        {attr: -1, name: "已入库"},
        {attr: 1, name: "申请出库"},
        {attr: 2, name: "已出库"},
        {attr: -2, name: "结算完毕"}    
    ]    
});

Beet.constants.checkStauts = Ext.create("Ext.data.Store", {
    fields: ["attr", "name"],
    data: [
        {attr: 1, name: "审核通过"},
        {attr: 0, name: "退回"}
    ]    
});

Ext.onReady(
    function(){
	Ext.syncRequire([
	    "warehouses.warehouselist"
	])
    }
);

//Ext.define("Beet.apps.warehouses.stockHistory", {
//    extend: "Ext.panel.Panel",
//    autoHeight: true,
//    autoScroll: true,
//    height: Beet.constants.VIEWPORT_HEIGHT - 5,
//    frame: true,
//    width: "100%",
//    border: false,
//    shadow: true,
//    b_filter: '',
//    initComponent: function(){
//        var me = this, stockServer = Beet.constants.stockServer;
//        if (me.b_type == "selection"){
//            me.editable = false;
//        }else{
//            me.editable = true;
//        }
//        me.currentStockStatus = 0;
//        
//        me.callParent();
//        me.mainPanel = Ext.create("Ext.panel.Panel", {
//            height: (me.b_type == "selection" ? "95%" : "100%"),
//            width: "100%",
//            autoHeight: true,
//            autoScroll: true,
//            border: false,
//            layout: {
//                type: "hbox",
//                columns: 2,
//                align: 'stretch'
//            },
//        })
//        me.add(me.mainPanel);
//        me.doLayout();
//
//        me.getProductsMetaData();
//    },
//    getProductsMetaData: function(){
//        var me = this, stockServer = Beet.constants.stockServer;
//
//        stockServer.GetStockHistoryPageData(0, -1, "", {
//            success: function(data){
//                var data = Ext.JSON.decode(data);
//                me.buildStoreAndModel(data["MetaData"]);
//            },
//            failure: function(error){
//                Ext.Error.raise(error);
//            }
//        });
//    },
//    buildStoreAndModel: function(metaData){
//        var fields = [], me = this, stockServer = Beet.constants.stockServer;
//        me.columns = [];
//        for (var c = 0; c < metaData.length; ++c){
//            var d = metaData[c], _field;
//            fields.push(d["FieldName"]);
//            if (!d["FieldHidden"]) {
//                _field = {
//                    flex: 1,
//                    header: d["FieldLabel"],
//                    dataIndex: d["FieldName"]    
//                }
//                
//                me.columns.push(_field);
//            }
//        };
//
//        if (!Ext.isDefined(Beet.apps.warehouses.stockHistoryModel)){
//            Ext.define("Beet.apps.warehouses.stockHistoryModel", {
//                extend: "Ext.data.Model",
//                fields: fields
//            });
//        }
//
//        if (!Ext.isDefined(Beet.apps.warehouses.stockHistoryStore)){
//            Ext.define("Beet.apps.warehouses.stockHistoryStore", {
//                extend: "Ext.data.Store",
//                model: Beet.apps.warehouses.stockHistoryModel,
//                autoLoad: true,
//                pageSize: Beet.constants.PageSize,
//                load: function(options){
//                    var that = this, options = options || {};
//                    if (Ext.isFunction(options)){
//                        options = {
//                            callback: options
//                        };
//                    }
//
//                    Ext.applyIf(options, {
//                        groupers: that.groupers.items,
//                        page: that.currentPage,
//                        start: (that.currentPage - 1) * Beet.constants.PageSize,
//                        limit: Beet.constants.PageSize,
//                        addRecords: false
//                    });
//                    
//
//                    that.proxy.b_params["start"] = options["start"];
//                    that.proxy.b_params["limit"] = options["limit"];
//
//                    return that.callParent([options]);
//                }
//            });
//        }
//
//        me.createGrid();
//    },
//    updateProxy: function(){
//        var me = this, stockServer = Beet.constants.stockServer;
//        return {
//            type: "b_proxy",
//            b_method: stockServer.GetStockHistoryPageData,
//            startParam: "start",
//            limitParam: "limit",
//            b_params: {
//                "awhere" : me.b_filter
//            },
//            b_scope: stockServer,
//            reader: {
//                type: "json",
//                root: "Data",
//                totalProperty: "TotalCount"
//            }
//        }
//    },
//    createGrid: function(){
//        var me = this, grid = me.grid, sm = null, stockServer = Beet.constants.stockServer;
//        if (me.b_type == "selection"){
//            sm = Ext.create("Ext.selection.CheckboxModel", {
//                mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
//            });
//            me.selModel = sm;
//        }
//        Ext.apply(this, {
//            storeProxy: Ext.create("Beet.apps.warehouses.stockHistoryStore")
//        });
//        var store = me.storeProxy, actions;
//        store.setProxy(me.updateProxy());
//
//        var _actions = {
//            xtype: 'actioncolumn',
//            width: 50,
//            items: [
//            ]
//        }
//
//        //这里需要权限判断
//        _actions.items.push(
//            "-", "-", "-", {
//                icon: './resources/themes/images/fam/edit.png',
//                tooltip: "编辑消耗产品",
//                id: "customer_grid_edit",
//                handler:function(grid, rowIndex, colIndex){
//                    var d = me.storeProxy.getAt(rowIndex)
//                    //me.editProductItem(d);
//                }
//            }
//        );
//        
//        if (me.b_type == "selection") {
//        }else{
//            _actions.items.push("-", "-", "-",{
//                icon: "./resources/themes/images/fam/delete.gif",
//                tooltip: "删除消耗产品",
//                id: "customer_grid_delete",
//                handler: function(grid, rowIndex, colIndex){
//                    var d = me.storeProxy.getAt(rowIndex)
//                    //me.deleteProductItem(d);
//                }
//            }, "-","-","-");
//        }
//        
//        //me.columns.splice(0, 0, _actions);
//
//        me.grid = Ext.create("Beet.plugins.LiveSearch", {
//            store: store,
//            lookMask: true,
//            frame: true,
//            collapsible: false,
//            rorder: false,
//            bodyBorder: false,
//            autoScroll: true,
//            autoHeight: true,
//            autoWidth: true,
//            border: 0,
//            flex: 1,
//            cls: "iScroll",
//            selModel: sm,
//            width: "100%",
//            height: me.editable ? "100%" : "95%",
//            columnLines: true,
//            viewConfig:{
//                trackOver: false,
//                stripeRows: true
//            },
//            columns: me.columns,
//            bbar: Ext.create("Ext.PagingToolbar", {
//                store: store,
//                displayInfo: true,
//                displayMsg: '当前显示 {0} - {1} 到 {2}',
//                emptyMsg: "没有数据"
//            }),
//            tbar: [
//                "-",
//                {
//                    xtype: "button",
//                    text: "高级搜索",
//                    handler: function(){
//                        var stockServer = Beet.constants.stockServer;
//                        stockServer.GetStockPageData(0, 1, "", {
//                            success: function(data){
//                                var win = Ext.create("Beet.apps.AdvanceSearch", {
//                                    searchData: Ext.JSON.decode(data),
//                                    b_callback: function(where){
//                                        me.b_filter = where;
//                                        //me.filterProducts();
//                                    }
//                                });
//                                win.show();
//                            },
//                            failure: function(error){
//                                Ext.Error.raise(error);
//                            }
//                        });
//                    }
//                }
//            ]
//        })
//        me.mainPanel.add(me.grid);
//        me.mainPanel.doLayout();
//
//        if (me.b_type == "selection"){
//            me.add(Ext.widget("button", {
//                text: "确定",
//                floating: false,
//                handler: function(){
//                    if (me.b_selectionCallback){
//                        me.b_selectionCallback(me.selModel.getSelection());
//                    }
//                }
//            }))
//            me.doLayout();
//        }
//    },
//    filterProducts: function(){
//        var me = this;
//        me.storeProxy.setProxy(me.updateProxy());
//
//        me.storeProxy.loadPage(1);
//    }
//});
