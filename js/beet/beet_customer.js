Ext.namespace("Beet.apps.customers")
//registerMenu("customers", "customerAdmin", "会员管理",
//    [
//
//    ]
//)

function time(){
    return +(new Date());
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
