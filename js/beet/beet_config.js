Beet.config = {
	customerUrl : "192.168.1.100:6661"
}

Beet.constants.customerLoginServer = new CTLoginSvc("http://"+Beet.config.customerUrl+"/JSON");
Beet.constants.customerServer = new MyCustomerSvc("http://"+Beet.config.customerUrl + "/JSON");
