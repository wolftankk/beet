Ext.Loader.setConfig({
	enabled: true,
	paths: {
		"card" : "./js/beet/card"
	}
})
registerBeetAppsMenu("card", {
	title: "卡项管理",
	items: [
		{
			xtype: "container",
			layout: "hbox",
			defaultType: "buttongroup",
			defaults:{
				height: 100,
				width: 250
			},
			items: [
				{
					title: '卡项管理',
					layout: "anchor",
					width: 300,
					defaults: {
						scale: "large",
						rowspan: 1
					},
					items: [
						{
							text: "增加卡项",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["addCard"]
								if (!item){
									Beet.workspace.addPanel("addCard", "增加卡项", {
										items: [
											Ext.create("Beet.apps.ProductsViewPort.AddCard")
										]
									})
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						},
						{
							text: "编辑卡项",
							handler: function(){
								var item = Beet.apps.Menu.Tabs["cardList"]
								if (!item){
									Beet.workspace.addPanel("cardList", "编辑卡项", {
										items: [
											Ext.create("Beet.apps.ProductsViewPort.CardList")
										]
									})
								}else{
									Beet.workspace.workspace.setActiveTab(item);
								}
							}
						}
					]
				}
			]
		}
	]
});


Ext.namespace("Beet.apps.ProductsViewPort");


//Ext.require(["card.products", "card.cards", "card.interests", "card.packages", "card.items", "card.charges", "card.rebate"]);
