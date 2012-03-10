Ext.namespace("Beet.settings")

Ext.onReady(function(){
    Ext.syncRequire([
	"settings.customers.customerattr"
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
//                    title: "员工管理",
//                    layout: "anchor",
//                    defaults: {
//                        scale: "large",
//                        rowspan: 3
//                    },
//                    width: 160,
//                    items: [
//                        {
//                            text: "部门设定",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["employeeAttr"];
//                                if (!item){
//                                    Beet.workspace.addPanel("employeeAttr", "部门设定", {
//                                        items: [
//                                            Ext.create("Beet.apps.EmployeeSettingViewPort.Viewport")
//                                        ]
//                                    });
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        },
//                        {
//                            text: "分店设定",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["subbranch"];
//                                if (!item){
//                                    Beet.workspace.addPanel("subbranch", "分店设定", {
//                                        items: [
//                                            Ext.create("Beet.apps.ShopSettingViewPort.Viewport")
//                                        ]
//                                    });
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        }
//                    ]
//                },
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
//                            text: "产品设置",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["productsList"];
//                                if (!item){
//                                    Beet.workspace.addPanel("productsList", "产品设置", {
//                                        items: [
//                                        Ext.create("Beet.apps.ProductsViewPort.UpdateProducts")
//                                        ]
//                                    })
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        },
//                        /*
//                        {
//                            text: "增加费用",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["addCharge"]
//                                if (!item){
//                                    Beet.workspace.addPanel("addCharge", "增加费用", {
//                                        items: [
//                                            Ext.create("Beet.apps.ProductsViewPort.AddCharge")
//                                        ]
//                                    })
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        },*/
//                        {
//                            text: "费用设置",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["chargeList"];
//                                if (!item){
//                                    Beet.workspace.addPanel("chargeList", "费用设置", {
//                                        items: [
//                                            Ext.create("Beet.apps.ProductsViewPort.UpdateCharge")
//                                        ]
//                                    })
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
//                        },
//                        {
//                            text: "项目设置",
//                            handler: function(){
//                                var item = Beet.apps.Menu.Tabs["itemList"]
//                                if (!item){
//                                    Beet.workspace.addPanel("itemList", "项目设置", {
//                                        items: [
//                                            Ext.create("Beet.apps.ProductsViewPort.ItemList")
//                                        ]
//                                    })
//                                }else{
//                                    Beet.workspace.workspace.setActiveTab(item);
//                                }
//                            }
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
