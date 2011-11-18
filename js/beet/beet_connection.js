Beet_connection = {
	
	_default_post_header : 'application/x-www-form-urlencoded; charset=UTF-8',
	_use_default_post_header: true,
	_default_xhr_header: "XMLHttpRequest",
	_use_default_xhr_header: true,
	_default_headers : {},
	_http_headers: {},
	_has_http_headers: false,
	_has_default_headers: true,
	_transaction_id: 0,
	_timeOut: {},
	_poll:{},
	_polling_interval: 50,
	
	/**
	 * set polling interval value
	 */
	setPollingInterval: function(i){
		if (typeof i == "number" && isFinite(i)){
			this._polling_interval = i;
		}
	},

	createXhrObject: function(transactionId){
		var obj, http;
		try {
			http = new XMLHttpRequest;
			obj = {conn: http, tId: transactionId, xhr: true};
		}catch (e){
			if (typeof XDomainRequest != undefined){
				http = new XDomainRequest();
				obj = {conn: http, tId : transactionId, xhr: true}
			}
		}finally {
			return obj;
		}
	},

	getConnectionObject : function(t){
		var o, tId = this._transaction_id;
		try{
			if (!t){
				o = this.createXhrObject(tId);
			}

			if (o){
				this._transaction_id++
			}
		}catch (e){}

		return o;
	},

	asyncRequest : function(method, uri, callback, postData){
		var args = callback && callback.argument ? callback.argument : null, that = this, o, t;
		o = this.getConnectionObject(t);

		if (!o){
			return null;
		}else{
			if (this._use_default_xhr_header){
				if (method.toUpperCase() === "POST" && this._use_default_post_header){
					this.initHeader("Content-Type", this._default_post_header, true);
				}

				o.conn.open(method, uri, true);
				if (this._has_http_headers || this._has_default_headers){
					this.setHeader(o);
				}

				this.handleReadyState(o, callback);
				
				//preprocess
				_sid = Ext.util.Cookies.get("_sid");
				if (_sid || _sid!=""){
					var postData = Ext.JSON.decode(postData);
					postData["id"] = _sid;
					postData = Ext.JSON.encode(postData);
				}
				o.conn.send(postData);

				return o;
			}
		}
	},
	handleReadyState: function(o, callback){
		var oConn = this, args = (callback && callback.argument)?callback.argument:null;
		if (callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ 
				oConn.abort(o, callback, true); 
			}, callback.timeout);
		}
		
		this._poll[o.tId] = window.setInterval(function(){
			if (o.conn && o.conn.readyState === 4){
				window.clearInterval(oConn._poll[o.tId]);
				delete oConn._poll[o.tId];

				if (callback && callback.timeout){
					window.clearTimeout(oConn._timeOut[o.tId]);
					delete oConn._timeOut[o.tId];
				}

				//fire complete event
				//
				oConn.handleTransactionResponse(o, callback)
			}
		}, this._polling_interval);
	},

	handleTransactionResponse:function(o, callback, isAbort){
		var httpStatus, responeObject,
			args = (callback && callback.argument) ? callback.argument: null;

		try{
			if (o.conn.status !== undefined && o.conn.status !== 0){
				httpStatus = o.conn.status;
			}
			else{
				httpStatus = 13030;
			}
		}
		catch (e){
			httpStatus = 13030;
		}

		if ((httpStatus >= 200 && httpStatus < 300) || httpStatus == 1223){
			responeObject = this.createResponseObject(o, args);
			if (callback && callback.success){
				var resp = Ext.JSON.decode(responeObject.responseText);

				if (Ext.util.Cookies.get("firstRun")==null || Ext.util.Cookies.get("firstRun")){
					var _sid = Ext.util.Cookies.get("_sid");
					if (!resp["error"] || resp["error"] != ""){
						_sid = resp["id"];
						Ext.util.Cookies.set("_sid", _sid);
					}
				}
				
				if (resp.error){
					var checkSession = new RegExp(/Session (.+)? could not be found/g);
					if (checkSession.test(resp.error.message)){
						Ext.MessageBox.show({
							title: "错误",
							msg: "因较长时间未操作, 用户已被注销, 请重新登陆!",
							buttons: Ext.MessageBox.OK,
							fn: function(btn){
								Ext.util.Cookies.clear();
								window.location = "index.html";
							}
						})
					}else{
						Ext.MessageBox.show({
							title: "错误",
							msg: resp.error.message,
							buttons: Ext.MessageBox.OK,
							fn: function(btn){
								//Ext.util.Cookies.clear();
								//window.location = "index.html";
							}
						})
					}
				}
								
				if (!callback.scope){
					callback.success(responeObject);
				}else{
					callback.success.apply(callback.scope, [responeObject]);
				}
			}
		}else{
			switch(httpStatus){
				case 12002: //server timeout
				case 12029: //12029 to 12031 correspond to dropped connections
				case 12030:
				case 12031:
				case 12152: //connection closed by server
				case 13030: //see above comments for variable status
					responeObject = this.createExceptionObject(o.tId, args, (isAbort ? isAbort : false));
					if (callback && callback.failure){
						if (!callback.scope){
							callback.failure(responeObject)
						}else{
							callback.failure.apply(callback.scope, [responeObject]);
						}
					}
					break;
				default:
					responeObject = this.createResponseObject(o, args);
					if (callback && callback.failure){
						if (!callback.scope){
							callback.failure(responeObject);
						}else{
							callback.failure.apply(callback.scope, [responeObject]);
						}
					}
			}
		
		}
		this.releaseObject(o);
		responeObject = null;
		
	},

	createResponseObject:function(o, callbackArg){
		var obj = {}, headerObj = {},
			i, headerStr, header, delimitPos;
		try{
			headerStr = o.conn.getAllResponseHeaders();
			header = headerStr.split("\n");
			for (i=0; i<header.length; i++){
				delimitPos = header[i].indexOf(":");
				if (delimitPos != -1){
					headerObj[header[i].substring(o, delimitPos)] = Ext.String.trim(header[i].substring(delimitPos+2));
				}
			}
		}catch(e){}

		obj.tId = o.tId;
		obj.status = (o.conn.status == 1223)?204:o.conn.status;
		obj.statusText = (o.conn.status == 1223)?"No Content":o.conn.statusText;
		obj.getResponseHeader = headerObj;
        obj.getAllResponseHeaders = headerStr;
        obj.responseText = o.conn.responseText;
        obj.responseXML = o.conn.responseXML;
		if (callbackArg){
			obj.argument = callbackArg;
		}
		return obj
	},
	createExceptionObject: function(o, callbackArg, isAbort){
		var COMM_CODE = 0,
			COMM_ERROR = "communications failure";
			ABORT_CODE = -1,
			ABORT_ERROR = "transaction aborted";
			obj = {};

		obj.tId = o.tId;
		if (isAbort){
			obj.status = ABORT_CODE;
			obj.statusText = ABORT_ERROR;
		}else{
			obj.status = COMM_CODE;
			obj.statusText = COMM_ERROR;
		}
		if (callbackArg){
			obj.argument = callbackArg;
		}
		return obj;
	},

	initHeader : function(label, value, isDefault){
		var headerObj = (isDefault) ? this._default_headers : this._http_headers;
		headerObj[label] = value;
		if (isDefault){
			this._has_default_headers = true;
		}else{
			this._has_http_headers = true;
		}
	},

	setHeader: function(o){
		var prop;
		if (this._has_default_headers){
			for (prop in this._default_headers){
				o.conn.setRequestHeader(prop, this._default_headers[prop]);	
			}
		}

		if (this._has_http_headers){
			for (prop in this._http_headers){
				for (prop in this._http_headers){
					o.conn.setRequestHeader(prop, this._http_headers[prop]);
				}
			}
			this._http_headers = {};
			this._has_http_headers = false;
		}
	},

	resetDefaultHeaders : function(){
		this._default_headers = {};
		this._has_http_headers = false;
	},

	abort :function(o, callback, isTimeout){
		var abortStatus, args = (callback && callback.argument) ? callback.argument : null, o = o || {};

		if (o.conn){
			if (o.xhr){
				if (this.isCallInProgress(o)){
					o.conn.abort();
					window.clearInterval(this._poll[o.tId]);
					delete this._poll[o.tId];

					if (isTimeout){
						window.clearTimeout(this._timeOut[o.tId]);
						delete this._timeOut[o.tId];
					}
					abortStatus = true;
				}
			}else if (o.xdr){
				o.conn.abort(o.tId);
				abortStatus = true;
			}
		}else{
			abortStatus = false;
		}

		Ext.MessageBox.show({
			title: "错误",
			msg: "网络链接超时! 请重新尝试链接. 若还不行, 请联系网络管理员",
			buttons: Ext.MessageBox.OK,
			fn: function(btn){
			}
		})

		if (abortStatus === true){
			//event
			//
			this.handleTransactionResponse(o, callback, true);
		}

		return abortStatus;
	},
	isCallInProgress: function(o){
		o = o || {};
		if (o.xhr & o.conn){
			return o.conn.readyState !== 4 && o.conn.readyState !== 0;
		}else if (o.xdr && o.conn){
			return o.conn.isCallInProgress(o.tId);
		}else{
			return false;
		}
	},
	releaseObject: function(o){
		if (o && o.conn){
			o.conn = null;
			o = null;
		}
	}
}
