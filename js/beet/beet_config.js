Beet.config = {
	customerUrl : "172.16.88.5:6661"
}

Beet.constants.customerLoginServer = new CTLoginSvc("http://"+Beet.config.customerUrl+"/MULTI");
Beet.constants.customerServer = new MyCustomerSvc("http://"+Beet.config.customerUrl + "/MULTI");
