Beet.registerMenu("summary", "summaryCustomer", "消费统计",
    [
        {
            xtype: "button",
            text: "日统计",
            handler: function(){
                var item = Beet.cache.menus["summary.dayConsumer"];
                if (!item){
		    Beet.workspace.addPanel("summary.dayConsumer", "日统计", {
			items: [
			    Ext.create("Beet.apps.summary.dayConsumer")
			]
		    });
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

Ext.define("Beet.apps.summary.dayConsumer", {
    extend: "Ext.panel.Panel",
    height: "100%",
    width: "100%",
    layout: "fit",
    autoScroll: true,
    border: false,
    bodyBorder: false,
    bodyStyle: "background-color: #dfe8f5",
    initComponent: function() {
	var me = this;

	me.callParent();

        //Beet.constants.customerServer.GetCustomerPageData(0, 1, "", {
        //    success: function(data){
        //        var data = Ext.JSON.decode(data);
        //        me.buildStoreAndModel(data["MetaData"]);
        //    },
        //    failure: function(error){
        //        Ext.Error.raise(error)
        //    }
        //})
    },
    buildStoreAndModel: function(metaData) {
        var me = this, customerServer = Beet.constants.customerServer, fields = [];
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

        //if (!Beet.apps.Viewport.CustomerListModel){
        //    Ext.define("Beet.apps.Viewport.CustomerListModel", {
        //        extend: "Ext.data.Model",
        //        fields: fields
        //    });
        //}

        //if (!Ext.isDefined(Beet.apps.Viewport.CustomerListStore)){
        //    Ext.define("Beet.apps.Viewport.CustomerListStore", {
        //        extend: "Ext.data.Store",
        //        model: Beet.apps.Viewport.CustomerListModel,
        //        autoLoad: true,
        //        pageSize: Beet.constants.PageSize,
        //        b_filter: "",
        //        load: function(options){
        //            var me = this;
        //            options = options || {};
        //            if (Ext.isFunction(options)) {
        //                options = {
        //                    callback: options
        //                };
        //            }

        //            Ext.applyIf(options, {
        //                groupers: me.groupers.items,
        //                page: me.currentPage,
        //                start: (me.currentPage - 1) * me.pageSize,
        //                limit: me.pageSize,
        //                addRecords: false
        //            });      
        //            me.proxy.b_params["start"] = options["start"];
        //            me.proxy.b_params["limit"] = options["limit"]

        //            return me.callParent([options]);
        //        }
        //    });
        //}

        //me.storeProxy = Ext.create("Beet.apps.Viewport.CustomerListStore");
        me.storeProxy.setProxy(me.updateProxy());
        me.createGrid();
    },
    updateProxy: function(){
        var me = this;
        //return {
        //     type: "b_proxy",
        //     b_method: Beet.constants.customerServer.GetCustomerPageData,
        //     startParam: "start",
        //     limitParam: "limit",
        //     b_params: {
        //         "filter": me.b_filter
        //     },
        //     b_scope: Beet.constants.customerServer,
        //     reader: {
        //         type: "json",
        //         root: "Data",
        //         totalProperty: "TotalCount"
        //     }
        //}
    },
    createGrid: function(){
        var me = this, grid = me.grid, store = me.storeProxy, actions;
        var customerServer = Beet.constants.customerServer;
        
        me.grid = Ext.create("Beet.plugins.LiveSearch", {
            store: store,
            lookMask: true,
            frame: true,
            collapsible: false,    
            rorder: false,
            bodyBorder: false,
            autoScroll: true,
            autoHeight: true,
            height: "100%",
            width : "100%",
            border: 0,
            columnLines: true,
            viewConfig: {
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
                        //customerServer.GetCustomerPageData(0, 1, "", {
                        //    success: function(data){
                        //        var win = Ext.create("Beet.apps.AdvanceSearch", {
                        //            searchData: Ext.JSON.decode(data),
                        //            b_callback: function(where){
                        //                that.b_filter = where;
                        //                that.storeProxy.setProxy(that.updateProxy());
                        //                that.storeProxy.loadPage(1);
                        //            }
                        //        });
                        //        win.show();
                        //    },
                        //    failure: function(error){
                        //        Ext.Error.raise(error);
                        //    }
                        //});
                    }
                }
            ],
            bbar: Ext.create('Ext.PagingToolbar', {
                store: me.storeProxy,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1}, 总共{2}条数据',
                emptyMsg: "没有数据"
            })
        })

        me.add(me.grid);
        me.doLayout();
    }
});
