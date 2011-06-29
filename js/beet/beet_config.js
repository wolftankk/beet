Beet.config = {
	customerUrl : "jiangl123.vicp.net:6661"
}

Beet.constants.customerLoginServer = new CTLoginSvc("http://"+Beet.config.customerUrl+"/JSON");
Beet.constants.customerServer = new MyCustomerSvc("http://"+Beet.config.customerUrl + "/JSON");
