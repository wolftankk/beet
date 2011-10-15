Beet.config = {
	serverUrl: "222.69.227.253",
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
	}
}

Beet.constants.customerLoginServer = new CTLoginSvc("http://"+Beet.config.getCustomerUrl() +"/JSON");

Beet.constants.privilegeServer = new MyPrivilegeSvc("http://"+Beet.config.getPrivileUrl() + "/JSON");
Beet.constants.customerServer = new MyCustomerSvc("http://"+Beet.config.getCustomerUrl() + "/JSON");
Beet.constants.employeeServer = new MyEMSvc("http://" + Beet.config.getEmployeeUrl() + "/JSON");
Beet.constants.cardServer = new MyCardSvc("http://" + Beet.config.getCardUrl() + "/JSON");
