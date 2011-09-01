Beet.config = {
	serverUrl: "192.168.2.2",
	getPrivileUrl: function(){
		return this.serverUrl + ":6660";
	},
	getCustomerUrl: function(){
		return this.serverUrl + ":6661";
	},
	getEmployeeUrl: function(){
		return this.serverUrl + ":6662";
	}
}

Beet.constants.customerLoginServer = new CTLoginSvc("http://"+Beet.config.getCustomerUrl() +"/JSON");

Beet.constants.privilegeServer = new MyPrivilegeSvc("http://"+Beet.config.getPrivileUrl() + "/JSON");
Beet.constants.customerServer = new MyCustomerSvc("http://"+Beet.config.getCustomerUrl() + "/JSON");
Beet.constants.employeeServer = new MyEMSvc("http://" + Beet.config.getEmployeeUrl() + "/JSON");
