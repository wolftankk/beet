// Javascript JSON-RPC Code Generated for the  MyCustomerLib library.

/* This codegen depends on the Yahoo YUI (http://developer.yahoo.com/yui/) toolkit and requires the 
   following libraries. Note that it's recommended to download yui and place a local copy next to
   your html.

  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.1/build/yahoo/yahoo.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.1/build/json/json.js"></script>
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.1/build/connection/connection.js"></script>
*/

// Service: DataAbstractService
function DataAbstractService(url){
  this.url = url;
}

DataAbstractService.prototype.GetSchema = function(aFilter, __callback) {
  var __message = {
    "method" : "DataAbstractService.GetSchema",
    "params" : {
      "aFilter": aFilter
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.GetData = function(aTableNameArray, aTableRequestInfoArray, __callback) {
  var __message = {
    "method" : "DataAbstractService.GetData",
    "params" : {
      "aTableNameArray": aTableNameArray,
      "aTableRequestInfoArray": aTableRequestInfoArray
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.UpdateData = function(aDelta, __callback) {
  var __message = {
    "method" : "DataAbstractService.UpdateData",
    "params" : {
      "aDelta": aDelta
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.ExecuteCommand = function(aCommandName, aParameterArray, __callback) {
  var __message = {
    "method" : "DataAbstractService.ExecuteCommand",
    "params" : {
      "aCommandName": aCommandName,
      "aParameterArray": aParameterArray
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.ExecuteCommandEx = function(aCommandName, aInputParameters, __callback) {
  var __message = {
    "method" : "DataAbstractService.ExecuteCommandEx",
    "params" : {
      "aCommandName": aCommandName,
      "aInputParameters": aInputParameters
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.GetTableSchema = function(aTableNameArray, __callback) {
  var __message = {
    "method" : "DataAbstractService.GetTableSchema",
    "params" : {
      "aTableNameArray": aTableNameArray
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.GetCommandSchema = function(aCommandNameArray, __callback) {
  var __message = {
    "method" : "DataAbstractService.GetCommandSchema",
    "params" : {
      "aCommandNameArray": aCommandNameArray
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.SQLGetData = function(aSQLText, aIncludeSchema, aMaxRecords, __callback) {
  var __message = {
    "method" : "DataAbstractService.SQLGetData",
    "params" : {
      "aSQLText": aSQLText,
      "aIncludeSchema": aIncludeSchema,
      "aMaxRecords": aMaxRecords
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.SQLGetDataEx = function(aSQLText, aIncludeSchema, aMaxRecords, aDynamicWhereXML, __callback) {
  var __message = {
    "method" : "DataAbstractService.SQLGetDataEx",
    "params" : {
      "aSQLText": aSQLText,
      "aIncludeSchema": aIncludeSchema,
      "aMaxRecords": aMaxRecords,
      "aDynamicWhereXML": aDynamicWhereXML
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.SQLExecuteCommand = function(aSQLText, __callback) {
  var __message = {
    "method" : "DataAbstractService.SQLExecuteCommand",
    "params" : {
      "aSQLText": aSQLText
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.SQLExecuteCommandEx = function(aSQLText, aDynamicWhereXML, __callback) {
  var __message = {
    "method" : "DataAbstractService.SQLExecuteCommandEx",
    "params" : {
      "aSQLText": aSQLText,
      "aDynamicWhereXML": aDynamicWhereXML
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.GetDatasetScripts = function(DatasetNames, __callback) {
  var __message = {
    "method" : "DataAbstractService.GetDatasetScripts",
    "params" : {
      "DatasetNames": DatasetNames
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.RegisterForDataChangeNotification = function(aTableName, __callback) {
  var __message = {
    "method" : "DataAbstractService.RegisterForDataChangeNotification",
    "params" : {
      "aTableName": aTableName
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

DataAbstractService.prototype.UnregisterForDataChangeNotification = function(aTableName, __callback) {
  var __message = {
    "method" : "DataAbstractService.UnregisterForDataChangeNotification",
    "params" : {
      "aTableName": aTableName
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: DataAbstractService
// Service: SimpleLoginService
function SimpleLoginService(url){
  this.url = url;
}

SimpleLoginService.prototype.Login = function(aUserID, aPassword, __callback) {
  var __message = {
    "method" : "SimpleLoginService.Login",
    "params" : {
      "aUserID": aUserID,
      "aPassword": aPassword
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: SimpleLoginService
// Service: BaseLoginService
function BaseLoginService(url){
  this.url = url;
}

BaseLoginService.prototype.LoginEx = function(aLoginString, __callback) {
  var __message = {
    "method" : "BaseLoginService.LoginEx",
    "params" : {
      "aLoginString": aLoginString
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

BaseLoginService.prototype.Logout = function(__callback) {
  var __message = {
    "method" : "BaseLoginService.Logout",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: BaseLoginService
// Service: MultiDbLoginService
function MultiDbLoginService(url){
  this.url = url;
}

MultiDbLoginService.prototype.Login = function(aUserID, aPassword, aConnectionName, __callback) {
  var __message = {
    "method" : "MultiDbLoginService.Login",
    "params" : {
      "aUserID": aUserID,
      "aPassword": aPassword,
      "aConnectionName": aConnectionName
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: MultiDbLoginService
// Service: MultiDbLoginServiceV5
function MultiDbLoginServiceV5(url){
  this.url = url;
}

MultiDbLoginServiceV5.prototype.GetConnectionNames = function(__callback) {
  var __message = {
    "method" : "MultiDbLoginServiceV5.GetConnectionNames",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MultiDbLoginServiceV5.prototype.GetDefaultConnectionName = function(__callback) {
  var __message = {
    "method" : "MultiDbLoginServiceV5.GetDefaultConnectionName",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: MultiDbLoginServiceV5
// Service: MyCustomerSvc
function MyCustomerSvc(url){
  this.url = url;
}

MyCustomerSvc.prototype.GetServiceItems = function(__callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetServiceItems",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.GetOperatorList = function(AResourceID, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetOperatorList",
    "params" : {
      "AResourceID": AResourceID
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.CheckPrivilege = function(AOperatorID, AResourceID, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.CheckPrivilege",
    "params" : {
      "AOperatorID": AOperatorID,
      "AResourceID": AResourceID
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.GetGroupListFromOperatorID = function(AOperatorID, IsName, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetGroupListFromOperatorID",
    "params" : {
      "AOperatorID": AOperatorID,
      "IsName": IsName
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.AddCustomer = function(ACustomerJson, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.AddCustomer",
    "params" : {
      "ACustomerJson": ACustomerJson
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.GetCustomerToJSON = function(AWhere, bOnlySchema, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetCustomerToJSON",
    "params" : {
      "AWhere": AWhere,
      "bOnlySchema": bOnlySchema
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.UpdateCustomer = function(ACustomerID, UpdateData, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.UpdateCustomer",
    "params" : {
      "ACustomerID": ACustomerID,
      "UpdateData": UpdateData
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.DeleteCustomer = function(ACustomerID, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.DeleteCustomer",
    "params" : {
      "ACustomerID": ACustomerID
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.GetCTTypeDataToJSON = function(AWhere, bOnlySchema, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetCTTypeDataToJSON",
    "params" : {
      "AWhere": AWhere,
      "bOnlySchema": bOnlySchema
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.GetCTCategoryDataTOJSON = function(AWhere, bOnlySchema, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetCTCategoryDataTOJSON",
    "params" : {
      "AWhere": AWhere,
      "bOnlySchema": bOnlySchema
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

MyCustomerSvc.prototype.GetCTItemDataToJSON = function(AWhere, bOnlySchema, __callback) {
  var __message = {
    "method" : "MyCustomerSvc.GetCTItemDataToJSON",
    "params" : {
      "AWhere": AWhere,
      "bOnlySchema": bOnlySchema
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: MyCustomerSvc
// Service: CTLoginSvc
function CTLoginSvc(url){
  this.url = url;
}

CTLoginSvc.prototype.Login = function(UserName, Password, Language, ConnectionName, __callback) {
  var __message = {
    "method" : "CTLoginSvc.Login",
    "params" : {
      "UserName": UserName,
      "Password": Password,
      "Language": Language,
      "ConnectionName": ConnectionName
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

CTLoginSvc.prototype.Logout = function(__callback) {
  var __message = {
    "method" : "CTLoginSvc.Logout",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

CTLoginSvc.prototype.GetConnectionNames = function(__callback) {
  var __message = {
    "method" : "CTLoginSvc.GetConnectionNames",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

CTLoginSvc.prototype.GetUserPrivileges = function(__callback) {
  var __message = {
    "method" : "CTLoginSvc.GetUserPrivileges",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

CTLoginSvc.prototype.GetSessionID = function(__callback) {
  var __message = {
    "method" : "CTLoginSvc.GetSessionID",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      xdr : true,
      success : function (o) {
        var __result = YAHOO.lang.JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        }
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
      },
      timeout : 30000
    }
  }
  var uri = this.url
  var mquest = function(){
    YAHOO.util.Connect.asyncRequest("POST", uri, __callbacks,YAHOO.util.Lang.JSON.stringify(__message));
    YAHOO.util.Connect.xdrReadyEvent.unsubscribeAll();
  }
  YAHOO.util.Connect.transport("connection.swf");
  YAHOO.util.Connect.xdrReadyEvent.subscribe(mquest);

}

// End of service: CTLoginSvc
