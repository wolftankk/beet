/**
 * 键盘快速绑定功能
 */


//屏蔽BACKSPACE
Ext.onReady(function(){
    Ext.getBody().on("keydown", function(e){
	if (e.getKey() == e.BACKSPACE){
	    var target = e.getTarget();
	    if ((target.readOnly == null || target.readOnly == undefined || target.readOnly == true) || (target.type != 'text' && target.type != 'textarea' && target.type != 'password')){
		e.keyCode = 0
		e.stopEvent();
		e.stopPropagation();
		return false;
	    }
	}
    })
})
