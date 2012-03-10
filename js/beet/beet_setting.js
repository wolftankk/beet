Ext.namespace("Beet.settings")

Ext.onReady(function(){
    Ext.syncRequire([
	"settings.customers.customerattr",
	"settings.employees.department",
	"settings.employees.branch",
	"settings.cards.products",
	"settings.cards.charges",
	"settings.cards.items",
    ])   
})
//registerBeetAppsMenu("configure", 
//{
//    title: "设置",
//    items: [
//        {
//            xtype: "container",
//            layout: "hbox",
//            defaultType: "buttongroup",
//            defaults: {
//                height: 100,
//                width: 250,
//                autoWidth: true
//            },
//            items: [
//                {
//                    title: "产品管理",
//                    width: 420,
//                    columns: 6,
//                    defaults: {
//                        scale : "large"
//                    },
//                    autoWidth: true,
//                    items: [
//                        {
//                        },
//                        /*
//                        {
//                            text: "增加套餐",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["addPackage"]
//                                if (!item){
//                                    Beet.workspace.addPanel("addPackage", "增加套餐", {
//                                        items: [
//                                            Ext.create("Beet.apps.ProductsViewPort.AddPackage")
//                                        ]
//                                    })
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        },
//                        */
//                        {
//                            text: "套餐设置",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["packageList"]
//                                if (!item){
//                                    Beet.workspace.addPanel("packageList", "套餐设置", {
//                                        items: [
//                                            Ext.create("Beet.apps.ProductsViewPort.PackageList")
//                                        ]
//                                    })
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        },
//                    ]
//                }
//            ]
//        }
//    ]
//});
//
//
//Ext.namespace("Beet.apps.Viewport.Setting");
//
