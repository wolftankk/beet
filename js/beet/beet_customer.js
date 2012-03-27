Ext.namespace("Beet.apps.customers")

function time(){
    return +(new Date());
}

Beet.apps.customers.getCTTypeData = Beet.getCTTypeData;

Beet.apps.customers.getCustomerTypes = function(__callback){
    if (Beet.cache.customerTypes == undefined){
        Beet.cache.customerTypes = [];
        Beet.constants.customerServer.GetCustomerTypes({
            success: function(data){
                var data = Ext.JSON.decode(data)
                if (data["Data"] && Ext.isArray(data["Data"])){
                    var datz = data["Data"];
                    for (var item in datz){
                        var p = datz[item];
                        Beet.cache.customerTypes.push({
                            boxLabel: p["TypeName"],
                            name: "TypeName",
                            inputValue: p["TypeGUID"]
                        })
                    }
                }
                __callback();
            },
            failure: function(){
                Ext.Error.raise("与服务器断开链接");
            }
        })
    }else{
        __callback();
    }
}

Ext.onReady(function(){
    Ext.syncRequire([
        "customers.plugins",
        "customers.addcustomer",
        "customers.customerlist",
        "customers.advancesearch",
        "customers.customercard",
        "customers.createorder",
        "customers.consumer",
        "customers.sms",
        "customers.activity"
    ])
})
