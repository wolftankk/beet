Beet.config = {
	customerUrl : "192.168.1.100:6661"
}

Beet.constants.customerServer = new CTLoginSvc("http://"+Beet.config.customerUrl+"/MULTI");
