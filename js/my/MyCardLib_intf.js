// Javascript JSON-RPC Code Generated for the  MyCardLib library.

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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

// End of service: MultiDbLoginServiceV5
// Service: MyCardSvc
function MyCardSvc(url){
  this.url = url;
}

MyCardSvc.prototype.AddProductItem = function(ProductItemJSON, __callback) {
  var __message = {
    "method" : "MyCardSvc.AddProductItem",
    "params" : {
      "ProductItemJSON": ProductItemJSON
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.UpdateProductItem = function(ProductItemJSON, __callback) {
  var __message = {
    "method" : "MyCardSvc.UpdateProductItem",
    "params" : {
      "ProductItemJSON": ProductItemJSON
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.DeleteProductItem = function(AProductItemID, __callback) {
  var __message = {
    "method" : "MyCardSvc.DeleteProductItem",
    "params" : {
      "AProductItemID": AProductItemID
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.GetProductItemPageData = function(Start, Limit, AWhere, __callback) {
  var __message = {
    "method" : "MyCardSvc.GetProductItemPageData",
    "params" : {
      "Start": Start,
      "Limit": Limit,
      "AWhere": AWhere
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.AddProducts = function(ProductsJSON, __callback) {
  var __message = {
    "method" : "MyCardSvc.AddProducts",
    "params" : {
      "ProductsJSON": ProductsJSON
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.UpdateProducts = function(ProductsJSON, __callback) {
  var __message = {
    "method" : "MyCardSvc.UpdateProducts",
    "params" : {
      "ProductsJSON": ProductsJSON
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.DeleteProducts = function(PruductID, bDelProductItem, __callback) {
  var __message = {
    "method" : "MyCardSvc.DeleteProducts",
    "params" : {
      "PruductID": PruductID,
      "bDelProductItem": bDelProductItem
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.GetProductPageData = function(Start, Limit, AWhere, __callback) {
  var __message = {
    "method" : "MyCardSvc.GetProductPageData",
    "params" : {
      "Start": Start,
      "Limit": Limit,
      "AWhere": AWhere
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.AddChargeType = function(ChargeJSON, __callback) {
  var __message = {
    "method" : "MyCardSvc.AddChargeType",
    "params" : {
      "ChargeJSON": ChargeJSON
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
   Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.UpdateChargeType = function(ChargeJSON, __callback) {
  var __message = {
    "method" : "MyCardSvc.UpdateChargeType",
    "params" : {
      "ChargeJSON": ChargeJSON
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
   Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.DeleteChargeType = function(AChargeID, __callback) {
  var __message = {
    "method" : "MyCardSvc.DeleteChargeType",
    "params" : {
      "AChargeID": AChargeID
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
   Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardSvc.prototype.GetChargeTypePageData = function(Start, Limit, AWhere, __callback) {
  var __message = {
    "method" : "MyCardSvc.GetChargeTypePageData",
    "params" : {
      "Start": Start,
      "Limit": Limit,
      "AWhere": AWhere
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
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
  YAHOO.util.Connect.asyncRequest("POST", this.url, __callbacks, YAHOO.util.Lang.JSON.stringify(__message));
}

// End of service: MyCardSvc
// Service: MyCardLoginSvc
function MyCardLoginSvc(url){
  this.url = url;
}

MyCardLoginSvc.prototype.Login = function(UserName, Password, Language, ConnectionName, __callback) {
  var __message = {
    "method" : "MyCardLoginSvc.Login",
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
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardLoginSvc.prototype.Logout = function(__callback) {
  var __message = {
    "method" : "MyCardLoginSvc.Logout",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
        if (__result.error)
        {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.failure(__result.error);
        } else {
          if ((typeof this.callback == "object") && this.callback.failure)
            this.callback.success(__result.result);
          else
            this.callback(__result.result);
        };
		Ext.util.Cookies.clear("_sid");
      },
      failure : function (o) {
        if ((typeof this.callback == "object") && this.callback.failure) 
            this.callback.failure(o);
		Ext.util.Cookies.clear("_sid");;
      },
      timeout : 30000
    }
  }
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardLoginSvc.prototype.GetConnectionNames = function(__callback) {
  var __message = {
    "method" : "MyCardLoginSvc.GetConnectionNames",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

MyCardLoginSvc.prototype.GetSession = function(__callback) {
  var __message = {
    "method" : "MyCardLoginSvc.GetSession",
    "params" : {
      }
  }
  var __callbacks = null;
  if (__callback) {
    __callbacks = {
      callback : __callback,
      success : function (o) {
        var __result = JSON.parse(o.responseText);
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
  Beet_connection.asyncRequest("POST", this.url, __callbacks, Ext.JSON.encode(__message));
}

// End of service: MyCardLoginSvc
