if (Ext.isGecko){
    if (!!window.webkitNotifications){
    }else{
	Ext.Msg.alert("警告", "你当前浏览器不支持桌面提醒, 你需要安装https://addons.mozilla.org/en-US/firefox/addon/html-notifications/");
    }
};

(function(window){
    var notifiers = [];
    var notificationCenter = window.notifications || window.webkitNotifications;

    Beet_Notifications = {
	init: function(){
	    //init Beet_Notifications
	    var me = this;
	    //first check and request permission
	    me.checkPermission();
	},
	checkPermission: function(){
	    if (notificationCenter.checkPermission() > 0){
		notificationCenter.requestPermission();
	    }
	},
	addNotifier : function(title, content){
	    notifiers.push({
		title: title,
		content: content
	    })
	    Beet_Notifications.showNotifications();
	},
	getNotifiersLength: function(){
	    return notifiers.length
	},
	getTemplatePath: function(){
	    var path = location.origin + (location.pathname.replace("main.html", "")) + "notifier.html";
	    return path
	},
        showNotifications: function(){
            try{
		var f = function(){
		    var notifier = notifiers.shift();
		    var json = Ext.JSON.encode(notifier);
		    var notification = notificationCenter.createHTMLNotification(Beet_Notifications.getTemplatePath()+"#data=" + Ext.util.base64.encode(json));
		    notification.show();
		}

		setTimeout(function(){
		    f();
		}, 100);
            }catch (e){
        	console.warn(e)
            }
        }
    };

    Ext.onReady(function(){
        Beet_Notifications.init();
    })
})(window)
