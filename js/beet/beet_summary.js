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
    initComponent: function(){
	var me = this;


	me.callParent();
    }
})
