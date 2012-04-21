Ext.namespace("Beet.apps.summary")

registerMenu("summary", "summaryCustomer", "消费统计",
    [
        {
            xtype: "button",
            text: "会员消费查询",
            handler: function(){
                //var item = Beet.cache.menus["customers.AddCustomer"];
                //if (!item){
                //    Beet.apps.customers.getCustomerTypes(function(){
                //        Beet.workspace.addPanel("customers.AddCustomer", "添加会员", {
                //            items: [
                //                Ext.create("Beet.apps.customers.AddCustomer")
                //            ]
                //        });
                //        Beet.apps.customers.getCTTypeData();
                //    })
                //}else{
                //    Beet.workspace.workspace.setActiveTab(item);
                //}
            }
        }
    ]
);
