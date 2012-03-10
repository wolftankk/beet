Ext.namespace("Beet.apps.settings")

Ext.onReady(function(){
    Ext.syncRequire([
	"settings.customers.customerattr",
	"settings.employees.department",
	"settings.employees.branch",
	"settings.cards.products",
	"settings.cards.charges",
	"settings.cards.items",
	"settings.cards.packages",
	"settings.cards.rebate",
	"settings.cards.interests"
    ])   
})
