Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
	"customers" : "js/beet/customers",
	"employees" : "js/beet/employees",
	"cards"	    : "js/beet/cards",
	"warehouses": "js/beet/warehouses",
	"settings"  : "js/beet/settings"
    }
});

Beet.config = {
    serverUrl: "192.168.11.3",
    getPrivileUrl: function(){
	return this.serverUrl + ":6660";
    },
    getCustomerUrl: function(){
	return this.serverUrl + ":6661";
    },
    getEmployeeUrl: function(){
	return this.serverUrl + ":6662";
    },
    getCardUrl: function(){
	return this.serverUrl + ":6663";
    },
    getWarehouse: function(){
	return this.serverUrl + ":6664";
    }
}

Beet.constants.customerLoginServer = new CTLoginSvc("http://"+Beet.config.getCustomerUrl() +"/JSON");
Beet.constants.privilegeServer = new MyPrivilegeSvc("http://"+Beet.config.getPrivileUrl() + "/JSON");
Beet.constants.customerServer = new MyCustomerSvc("http://"+Beet.config.getCustomerUrl() + "/JSON");
Beet.constants.employeeServer = new MyEMSvc("http://" + Beet.config.getEmployeeUrl() + "/JSON");
Beet.constants.cardServer = new MyCardSvc("http://" + Beet.config.getCardUrl() + "/JSON");
Beet.constants.stockServer = new MyStockSvc("http://" + Beet.config.getWarehouse() + "/JSON");

Beet.menus = {
    customers: {
	title: "会员管理",
	menus: {}
    },
    employees:{
	title: "员工管理",
	menus: {}
    },
    cards:{
	title: "卡项管理",
	menus: {}
    },
    warehouses: {
	title: "库存管理",
	menus: {}
    },
    settings : {
	title: "设置",
	menus:{}
    }
}
