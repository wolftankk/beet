Ext.ns("Beet.apps.warehouses");

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
	    "warehouses.warehouselist",
	    "warehouses.stockhistory"
	])
    }
);

