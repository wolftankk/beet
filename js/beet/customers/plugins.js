//客户面板的一些通用组件
Ext.define("Beet.apps.customers.payDataPanel", {
    extend: "Ext.panel.Panel",
    width : "100%",
    height: "100%",
    autoScroll: true,
    autoHeight: true,   
    bodyStyle: "background-color: #dfe8f5",
    defaults: {
	bodyStyle: "background-color: #dfe8f5",
	border: false
    },
    border: false,
    layout: "fit",
    initComponent: function(){
	var me = this;
	
	me.callParent();
	
	if (me.cid == undefined || me.cid == null){
	    Ext.Msg.alert("失败", "用户ID无效");
	    return;
	}
	me.b_filter = "CustomerID='" + me.cid + "'";

	//GetCustomerPayData(const OnlySchema: Boolean; const AWhere:Utf8String)
        Beet.constants.cardServer.GetCustomerPayData(true, "", {
            success: function(data){
                var data = Ext.JSON.decode(data);
                me.buildStoreAndModel(data["MetaData"]);
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },
    buildStoreAndModel: function(metaData){
        var me = this, cardServer = Beet.constants.cardServer, fields = [];
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

        if (!Beet.apps.customers.payDataModel){
            Ext.define("Beet.apps.customers.payDataModel", {
                extend: "Ext.data.Model",
                fields: fields
            });
        }

        if (!Ext.isDefined(Beet.apps.customers.payDataStore)){
            Ext.define("Beet.apps.customers.payDataStore", {
                extend: "Ext.data.Store",
                model: Beet.apps.customers.payDataModel,
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
                b_filter: ""
            });
        }

	me.storeProxy = Ext.create("Beet.apps.customers.payDataStore");
	me.storeProxy.setProxy(me.updateProxy());
	me.createGrid();
    },
    updateProxy: function(){
        var me = this;
        return {
             type: "b_proxy",
             b_method: Beet.constants.cardServer.GetCustomerPayData,
             b_params: {
		 "b_onlySchema": false,
                 "awhere": me.b_filter
             },
             b_scope: Beet.constants.cardServer,
             reader: {
                 type: "json",
                 root: "Data",
                 totalProperty: "TotalCount"
             }
        }
    },
    createGrid : function(){
        var me = this, grid = me.grid, store = me.storeProxy;
        var cardServer = Beet.constants.cardServer;
        
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
            columns: me.columns
        })

        me.add(me.grid);
        me.doLayout();
    }
});