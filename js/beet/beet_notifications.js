//check 
//If firefox, you install https://addons.mozilla.org/en-US/firefox/addon/html-notifications/
//check current brower is firefox
if (Ext.isGecko){
    if (!!window.webkitNotifications){
	    //support
    }else{
	Ext.Msg.alert("警告", "你当前浏览器不支持桌面提醒, 你需要安装https://addons.mozilla.org/en-US/firefox/addon/html-notifications/");
    }
};

//(function(window){
//    var notifiers = [];
//    var notificationCenter = window.notifications || window.webkitNotifications;
//
//    Beet_Notifications = {
//	addNotifiers : function(){
//	    notifiers.push({
//		title: "test"	
//	    })
//	    Beet_Notifications.showNotifications();
//	},
//	checkPermission: function(){
//	    if (notificationCenter.checkPermission() > 0){
//		notificationCenter.requestPermission();
//	    }else{
//		Beet_Notifications.addNotifiers();
//	    }
//	},
//	showNotifications: function(){
//	    try{
//		//if (!notificationCenter){return;}
//		//    for(var i = 0; i < notifiers.length; ++i) {
//		//	var notification = notificationCenter.createHTMLNotification(location.origin + location.pathname.replace("main.html", "") + "notifier.html");
//		//	console.log(notification)
//		//	//(function inClosure(tweet) {
//		//	//    notification.onclose = function(e) {
//		//	//      setTimeout(function() {
//		//	//        _this.readTweet(tweet.id);
//		//	//      }, 200);
//		//	//    };
//		//	//  })(tweetsToNotify[i]);
//		//	notification.show();
//		//    }
//		//}
//	    }catch (e){
//		console.warn(e)
//
//	    }
//	}
//    };
//
//    Ext.onReady(function(){
//	Beet_Notifications.checkPermission();	
//    })
//})(window)
