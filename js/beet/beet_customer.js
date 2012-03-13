Ext.namespace("Beet.apps.customers")

function time(){
    return +(new Date());
}

Beet.apps.customers.getCTTypeData = function(__callback, force){
    var customerServer = Beet.constants.customerServer;
    Beet.cache["advanceProfile"] = {};

    var _preprocess = function(target, cache, isSub){
        var item = {};
        for (var k in target){
            if (k == "category"){
                for (citem in target[k]){
                    var _data = target[k][citem];
                    if (_data["category"].length == 0){
                        if (_data["item"].length > 0){
                            var inputmode = _data["item"][0]["inputmode"], isSame = true;
                            for (var _p in _data["item"]){
                                if (_data["item"][_p]["inputmode"] == inputmode){
                                    isSame = true;
                                }else{
                                    isSame = false;
                                }
                            }
                            item["fieldLabel"] = _data["label"];
                            item["pid"] = _data["pid"];
                            item["_id"] = _data["id"];
                            item["collapsible"] = true;
                            if (isSame && inputmode != 0){
                                item["xtype"] = Beet.constants.CTInputMode[inputmode];
                                item["layout"] = {
                                    type: "table",
                                    columns: 5,
                                    tableAttrs: {
                                        cellspacing: 10,
                                        style: {
                                            width: "100%"
                                        }
                                    }
                                }
                            }else{
                                _data["_xtype"] = "fieldset";
                                item["xtype"] = "fieldset";
                                item["title"] = _data["label"];
                            }
                            item["flex"] = 1;
                            item["items"] = [];
                            _preprocess(_data, item["items"], true);
                            if (isSub){
                                cache.push(item);
                                item = {};
                            }else{
                                cache.push(item);
                                item = {};
                                continue;
                            }
                        }else{
                            //no item
                            item["fieldLabel"] = _data["label"];
                            item["pid"] = _data["pid"];
                            item["_id"] = _data["id"];
                            item["flex"] = 1;
                            item["title"] = _data["label"];
                            item["collapsible"] = true;
                            item["xtype"] = "fieldset";
                        }
                    }else if(_data["category"].length > 0 || _data["pid"] == -1){
                        //need reset
                        item = {};
                        item["fieldLabel"] = _data["label"];
                        item["collapsible"] = true;
                        item["pid"] = _data["pid"];
                        item["_id"] = _data["id"];
                        item["title"] = _data["label"];
                        item["xtype"] = "fieldset";
                        _data["_xtype"] = "fieldset";
                        item["flex"] = 1;
                        item["items"] = [];
                        
                        _preprocess(_data, item["items"], true);
                        if (isSub){
                            cache.push(item);
                            item = {};
                        }else{
                            cache.push(item);
                            item = {};
                            continue;
                        }
                    }
                }
            }else if(k == "item"){
                for (var iId in target[k]){
                    var _data = target[k][iId];
                    var inputmode = _data["inputmode"];
                    if (inputmode == 0){
                        item = {
                            xtype: "textfield",
                            fieldLabel: _data["label"],
                            name: "text_type_" + _data["id"],
                            pid: _data["pid"],
                            _id: _data["id"],
                        }
                    }else{
                        //radio checkbox
                        item = {
                            inputValue : _data["id"],
                            pid: _data["pid"],
                            boxLabel: _data["label"],
                            name: "category_" + _data["pid"]
                        }
                        //主层父类pid
                        if (target["pid"] == -1 || (target["_xtype"] && target["_xtype"] == "fieldset")){
                            item["xtype"] = inputmode == 1 ? "radio" : "checkbox";
                        }
                    }

                    if (isSub){
                        cache.push(item);
                        item = {};
                    }else{
                        cache.push(item);
                        item = {};
                        continue;
                    }
                }
            }else{

            }
        }
    }

    //get data
    for (var st in Beet.constants.CTServiceType){
        //debugger;
        customerServer.GetCTTypeDataToJSON("CustomerType='"+st+"'", true, {
            success: function(data){
                if (data == undefined || data == "" ){
                    return;
                }
                data = Ext.JSON.decode(data);
                var sid = data["category"][0]["serviceid"], _tmp = [];
                _preprocess(data, _tmp);
                //这里直接生产界面
                Beet.cache["advanceProfile"][sid] = _tmp;
            },
            failure: function(error){
                //Ext.Error.raise(error);
            }
        })
    }
    
    if (__callback && Ext.isFunction(__callback)){
        __callback();
    }
}

Beet.apps.customers.getCustomerTypes = function(__callback){
    if (Beet.cache.customerTypes == undefined){
        Beet.cache.customerTypes = [];
        Beet.constants.customerServer.GetCustomerTypes({
            success: function(data){
                var data = Ext.JSON.decode(data)
                if (data["Data"] && Ext.isArray(data["Data"])){
                    var datz = data["Data"];
                    for (var item in datz){
                        var p = datz[item];
                        Beet.cache.customerTypes.push({
                            boxLabel: p["TypeName"],
                            name: "TypeName",
                            inputValue: p["TypeGUID"]
                        })
                    }
                }
                __callback();
            },
            failure: function(){
                Ext.Error.raise("与服务器断开链接");
            }
        })
    }else{
        __callback();
    }
}

Ext.onReady(function(){
    Ext.syncRequire([
        "customers.plugins",
        "customers.addcustomer",
        "customers.customerlist",
        "customers.advancesearch",
        "customers.customercard",
        "customers.createorder",
        "customers.consumer",
        "customers.sms",
        "customers.activity"
    ])
})
