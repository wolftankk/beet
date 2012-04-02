registerMenu("customers", "customerAdmin", "会员管理",
    [
        {
            xtype: "button",
            text: "会员卡编辑",
            handler: function(){
                var item = Beet.cache.menus["customers.AddCustomerCard"]
                if (!item){
                    Beet.workspace.addPanel("customers.AddCustomerCard", "会员卡编辑", {
                        items: [
                            Ext.create("Beet.apps.customers.AddCustomerCard")
                        ]
                    })
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

(function(window){

var paidTypeStore = Ext.create("Ext.data.Store", {
    fields: ["PayID", "PayName"]
});
var getPayMethod = function(){
    Beet.constants.cardServer.GetPayTypeData("", {
	success: function(data){
	    var data = Ext.JSON.decode(data);
	    data = data["Data"];
	    paidTypeStore.loadData(data);
	},
	failure: function(error){
	    Ext.Error.raise(error);
	}
    })
}


Ext.define("Beet.apps.customers.AddCustomerCard", {
    extend: "Ext.form.Panel",
    height: "100%",
    width: "100%",
    autoHeight: true,
    autoScroll:true,
    autoDestory: true,
    frame:true,
    border: false,
    bodyBorder: false,
    plain: true,
    b_filter: "",
    initComponent: function(){
        var me = this;
        me.selectedCustomerId = null;
        me.selectedCardId = null; 
	me.selectedFriendID = null

	getPayMethod();

        me.callParent();
        me.createMainPanel();
        me.queue = new Beet_Queue("customerCard");
	me.initPaidWindow();
        me.buildCustomerStore();
    },
    buildCustomerStore: function(){
        var me = this, customerServer = Beet.constants.customerServer;
        customerServer.GetCustomerPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data);
                metaData = data["MetaData"];
                var fields = [], columns = [];

                for (var c = 0; c < metaData.length; ++c){
                    var d = metaData[c];
                    fields.push(d["FieldName"]);
                    if (!d["FieldHidden"]) {
                        var column = {
                            flex: 1,
                            header: d["FieldLabel"],
                            dataIndex: d["FieldName"]    
                        }
			columns.push(column);
                    }
                };

                if (!Beet.apps.customers.CustomerListModel){
                    Ext.define("Beet.apps.customers.CustomerListModel", {
                        extend: "Ext.data.Model",
                        fields: fields
                    });
                }

                if (!Ext.isDefined(Beet.apps.customers.CustomerListStore)){
                    Ext.define("Beet.apps.customers.CustomerListStore", {
                        extend: "Ext.data.Store",
                        model: Beet.apps.customers.CustomerListModel,
                        autoLoad: true,
                        pageSize: Beet.constants.PageSize,
                        b_filter: "",
                        load: function(options){
                            var me = this;
                            options = options || {};
                            if (Ext.isFunction(options)) {
                                options = {
                                    callback: options
                                };
                            }

                            Ext.applyIf(options, {
                                groupers: me.groupers.items,
                                page: me.currentPage,
                                start: (me.currentPage - 1) * me.pageSize,
                                limit: me.pageSize,
                                addRecords: false
                            });      
                            me.proxy.b_params["start"] = options["start"] || 0;
                            me.proxy.b_params["limit"] = options["limit"]

                            return me.callParent([options]);
                        }
                    });
                }

                me.customerStore = Ext.create("Beet.apps.customers.CustomerListStore");
                me.customerStore.setProxy(me.updateCustomerProxy(""));
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },
    updateCustomerProxy: function(filter){
        var me = this;
        filter = filter == undefined ? "" : filter;
        return {
             type: "b_proxy",
             b_method: Beet.constants.customerServer.GetCustomerPageData,
             startParam: "start",
             limitParam: "limit",
             b_params: {
                 "filter": filter
             },
             b_scope: Beet.constants.customerServer,
             reader: {
                 type: "json",
                 root: "Data",
                 totalProperty: "TotalCount"
             }
        }
    },
    createMainPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;

        var config = {
            autoHeight: true,
            autoScroll: true,
            cls: "iScroll",
            height: "100%",
            width: "100%",
            anchor: "fit",    
            border: false,
            bodyBorder: false,
            frame: true,
            plain: true,
            items: [
                {
		    xtype: "fieldset",
		    width: "100%",
		    title: "会员卡",
		    items: [
			{
			    layout: {
				type: "table",
				columns: 2,
				tableAttrs: {
				    cellspacing: 10,
				    style: {
					width: "100%",
				    }
				}
			    },
			    border: false,
			    bodyStyle: "background-color: #dfe8f5",
			    defaults: {
				bodyStyle: "background-color: #dfe8f5",
				width: 300
			    },
			    defaultType: "textfield",
			    fieldDefaults: {
				msgTarget: "side",
				labelAlign: "top",
				labelWidth: 60
			    },
			    items: [
				{
				    fieldLabel: "会员名",
				    xtype: "trigger",
				    width: 300,
				    name: "customername",
				    checkChangeBuffer: 500,
				    listeners: {
					change: function(f, newValue, oldValue, opts){
					    Ext.callback(Beet.plugins.customerDropDown, me, [f, newValue, oldValue, opts], 30);
					}
				    },
				    onTriggerClick: function(){
					var win = Ext.create("Beet.plugins.selectCustomerWindow", {
					    b_selectionMode: "SINGLE",
					    _callback: function(r){
						me.selectedCustomer = true;
						me.onSelectCustomer(r);
						win.hide();
					    }
					});
					win.show();
				    }
				},
				{
				    fieldLabel: "卡号",
				    name: "cardno",
				    allowBlank: false,
				    enableKeyEvents: true,
				    listeners: {
					keydown: function(f, e){
					    var v = Ext.String.trim(f.getValue())
					    if (v == "" || v.length == 0){
						return;
					    }
					    if (e.getKey() == Ext.EventObject.ENTER){
						me.onSelectCustomer(v, "cardno")
					    }
					}
				    }
				},
				{
				    fieldLabel: "余额",
				    allowBlank: false,
				    readOnly: true,
				    name: "balance",
				    type: "float",
				    listeners: {
					blur: function(){
					    var v = this.getValue();
					}
				    }
				},
				{
				    fieldLabel: "本金",
				    allowBlank: false,
				    readOnly: true,
				    name: "capital",
				    type: "float"
				},
				{
				    fieldLabel: "专属顾问",
				    xtype: "trigger",
				    width: 300,
				    name: "employeename",
				    onTriggerClick: function(){
					var win = Ext.create("Ext.window.Window", {
					    title: "选择专属顾问",
					    width: 750,
					    height: 550,
					    minHeight: 450,
					    autoDestroy: true,
					    autoHeight: true,
					    autoScroll: true,
					    layout: "fit",
					    resizable: true,
					    border: false,
					    modal: false,
					    maximizable: true,
					    border: 0,
					    bodyBorder: false,
					});
					win.add(Ext.create("Beet.apps.employees.EmployeeList", {
					    b_type: "selection",
					    b_selectionMode: "SINGLE",
					    height: "100%",
					    width: "100%",
					    b_selectionCallback: function(r){
						me.onSelectEmployee(r);
						win.hide();
					    }
					}));
					win.doLayout();
					win.show();
				    }
				},
				{
				    fieldLabel: "注释",
				    allowBlank: true,
				    xtype: "textarea",
				    name: "descript"
				},
				{
				    xtype: "checkbox",
				    fieldLabel: "是否经人介绍",
				    inputValue: true,
				    listeners: {
					change: function(f, newValue){
					    var field = f.nextSibling()
					    if (newValue){
						field.show();
					    }else{
						field.hide();
					    }
					}
				    }
				},
				{
				    fieldLabel: "介绍人",
				    allowBlank: true,
				    xtype: "trigger",
				    hidden: true,
				    editable: false,
				    onTriggerClick: function(){
					var win = Ext.create("Beet.plugins.selectCustomerWindow", {
					    b_selectionMode: "SINGLE",
					    _callback: function(r){
						var record = r.shift();
						me.selectedFriendID = record.get("CTGUID");
						win.hide();
					    }
					});
					win.show();
				    }
				},
				{
				    fieldLabel: "充值金额",
				    readOnly: true,
				    hidden: true,
				    type: "float",
				    name: "_payvalue"
				},
			    ]
			},
		    ]
		},
		{
		    xtype: "fieldset",
		    title: "指定卡项",
		    width: "100%",
		    items: [
			{
			    layout: {
				type: "table",
				columns: 2,
				tableAttrs: {
				    cellspacing: 10,
				    style: {
					width: "100%",
				    }
				}
			    },
			    border: false,
			    bodyStyle: "background-color: #dfe8f5",
			    defaults: {
				bodyStyle: "background-color: #dfe8f5",
				width: 300
			    },
			    defaultType: "textfield",
			    fieldDefaults: {
				msgTarget: "side",
				labelAlign: "top",
				labelWidth: 60
			    },
			    items:[
				{
				    fieldLabel: "编码",
				    name: "__code",
				    enableKeyEvents: true,
				    listeners: {
					keydown: function(f, e){
					    if (e.getKey() == Ext.EventObject.ENTER){
						var v = f.getValue();
						var _sql = "";
						if (v.length > 0){
						    _sql = "Code = '" + v +"'";
						    cardServer.GetCardPageData(0, 1, _sql, {
							success: function(data){
							    var data = Ext.JSON.decode(data);
							    data = data["Data"];
							    if (data.length > 0){
								me.addCard(data.shift(), false, true);
							    }else{
								Ext.Msg.alert("失败","查询不到该产品");
							    }
							},
							failure: function(error){
							    Ext.Error.raise(error)
							}
						    })
						}
						e.stopEvent();
						e.stopPropagation();
						return false;
					    }
					}
				    }
				},
				{
				    fieldLabel: "名称",
				    name: "__cardname",
				    xtype: "trigger",
				    editable: false,
				    checkChangeBuffer: 500,
				    onTriggerClick: function(){
					var config = {
					    extend: "Ext.window.Window",
					    title: "选择卡项",
					    width: 900,
					    height: 640,
					    autoScroll: true,
					    autoHeight: true,
					    layout: "fit",
					    resizable: true,
					    border: false,
					    modal: true,
					    maximizable: true,
					    border: 0,
					    bodyBorder: false,
					    editable: false
					}
					var win = Ext.create("Ext.window.Window", config);
					win.show();
				 
					win.add(Ext.create("Beet.apps.cards.CardList", {
					    b_type: "selection",
					    b_selectionMode: "SINGLE",
					    b_selectionCallback: function(records){
						if (records.length == 0){ win.close(); return;}
						me.addCard(records.shift(), true, true);
						win.close();
					    }
					}));
					
					win.show();
				    }
				},
				{
				    fieldLabel: "面值",
				    name: "__par",
				    xtype: "displayfield"
				},
				{
				    fieldLabel: "保值",
				    name: "__insure",
				    xtype: "displayfield"
				},
				{
				    fieldLabel: "级别",
				    name: "__level",
				    xtype: "displayfield"
				},
				{
				    fieldLabel: "失效日期",
				    name: "endtime",
				    xtype: "datefield",
				    format: "Y/m/d G:i"
				},
				{
				    xtype: "button",
				    text: "卡项详情",
				    name: "__cardprofilebtn",
				    handler: function(){
					if (me.selectedCardId){
					    cardServer.GetCardPageData(0, 1, "ID='"+me.selectedCardId+"'", {
						success: function(data){
						    var data = Ext.JSON.decode(data);
						    data = data["Data"];
						    if (data.length > 0){
							var record = data.shift();
							var win = Ext.create("Ext.window.Window", {
							    height: 670,
							    width: 1100,
							    maximized: true,
							    autoScroll: true,
							    autoHeight: true,
							    autoDestory: true,
							    plain: true,
							    title: "查看 " + record["Name"] + " 的资料",
							    border: false
							});

							win.show();
							var cardPanel = Ext.create("Beet.apps.cards.AddCard")

							cardServer.GetCardDetailData(me.selectedCardId, {
							    success: function(data){
							        var data = Ext.JSON.decode(data);
							        cardPanel.restoreFromData(record, data)
							        win.add(cardPanel);
							    },
							    failure: function(error){
							        Ext.MessageBox.hide();
							        Ext.Error.raise(error);
							    }
							})
						    }
						},
						failure: function(error){
						    Ext.Error.raise(error);
						}
					    })
					}
				    }
				}
			    ]
			}
		    ]
		}
            ],
	    bbar: [
		"->",
		{
		    xtype: "button",
		    scale: "medium",
		    text: "开卡",
		    name: "activebtn",
		    hidden: true,
		    handler: function(){
			me.processData(this);
		    }
		},
		{
		    xtype: "component",
		    width: 20
		},
		{
		    xtype: "button",
		    scale: "medium",
		    text: "更新",
		    disabled: true,
		    name: "updatebtn",
		    handler: function(){
			me.processData(this, true);
		    }
		},
		{
		    xtype: "component",
		    width: 20
		},
		{
		    xtype: "button",
		    scale: "medium",
		    text: "充值",
		    disabled: true,
		    name: "paidbtn",
		    handler: function(){
			if (!me.selectedCustomerId){
			    Ext.Msg.alert("错误", "请选择会员!");
			    return;
			}
			me.openPaidWindow();
		    }
		},
		{
		    xtype: "component",
		    width: 20
		},
		{
		    xtype: "button",
		    scale: "medium",
		    text: "充值历史",
		    disabled: true,
		    name: "historybtn",
		    handler: function(){
			if (!me.selectedCustomerId){
			    Ext.Msg.alert("错误", "请选择会员!");
			    return;
			}
			me.openHistoryWindow();
		    }
		},
		{
		    xtype: "component",
		    width: 20
		},
		{
		    xtype: "button",
		    scale: "medium",
		    text: "销卡",
		    name: "deleteCard",
		    disabled: true,
		    style: {
			borderColor: "#ff5252"
		    },
		    handler: function(){
			var values = me.form.getValues();
			Ext.MessageBox.show({
			    title: "警告",
			    msg: ((values["balance"] > 0) ? "账户余额为<span style='color: #f00;font-weight:bolder;'>" + values["balance"] + "</span>, 销卡将清空当前用户包括金额在内的所有数据?<br/>确定需要销毁当前用户的卡?" : "确定需要销毁当前用户的卡?"),
			    buttons: Ext.MessageBox.YESNO,
			    fn: function(btn){
				if (btn == "yes"){
				    cardServer.DeleteCustomerAccount(me.selectedCustomerId, {
					success: function(succ){
					    if (succ){
						Ext.MessageBox.alert("成功", "销卡成功");
						var form = me.form.getForm();
						//reset all
						me.selectedCustomerId = null
						me.selectedEmpolyeeId = null;
						me.selectedFriendID = null
						me.selectedCardId = null; 
						form.reset();
						me.down("button[name=updatebtn]").disable();
						me.down("button[name=activebtn]").hide();
					    }
					},
					failure: function(error){
					    Ext.Error.raise(error);
					}
				    })
				}
			    }
			})
		    }
		}
	    ]
        }

        var form = Ext.widget("form", config);
        me.form = form;
        me.add(form);
        me.doLayout();
    },
    openHistoryWindow: function(){
	var me = this, win, cardServer = Beet.constants.cardServer;
        win = Ext.create("Ext.window.Window", {
            title: "充值历史",
            height: 600,
            width: 500,
            border: false,
            autoHeight: true        
        });
	win.add(Ext.create("Beet.apps.customers.payDataPanel", {
	    cid : me.selectedCustomerId
	}))
	win.doLayout();
	win.show();
    },
    initPaidWindow: function(){
        var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
        var _columns= [], _fields = [];
	var _actions = {
	    xtype: 'actioncolumn',
	    width: 50,
	    header: "操作",
	    items: [
	    ]
	}
	_actions.items.push("-",{
	    icon: "./resources/themes/images/fam/delete.gif",
	    tooltip: "移除",
	    handler: function(grid, rowIndex, colIndex){
		var sm = grid.getSelectionModel();
		var rowEditing = grid.panel.rowEditing;
		rowEditing.cancelEdit();
		me.paidStore.remove(sm.getSelection());
		if (me.paidStore.getCount() > 0) {
		    sm.select(0);
		}
	    }
	}, "-");
	_columns.push(_actions);

	cardServer.GetCustomerPayData(true, "", {
	    success: function(data){
		var data = Ext.JSON.decode(data);    
		var metaData = data["MetaData"];    

		for (var c = 0; c < metaData.length; ++c){
		    var d = metaData[c];
		    _fields.push(d["FieldName"]);
		    if (!d["FieldHidden"]) {
			var column = ({
			    flex: 1,
			    header: d["FieldLabel"],
			    dataIndex: d["FieldName"]    
			})
			
			switch (d["FieldName"]){
			    case "PayName": 
				column.editor = {
				    xtype: "combobox",
				    selectOnTab: true,
				    editable: false,
				    store: paidTypeStore,
				    queryMode: "local",
				    displayField: "PayName",
				    valueField: "PayName",
				    listClass: 'x-combo-list-small',
				    allowBlank: false,
				    listeners: {
					"change" : function(f, payName){
					    if (payName){
						for (var a = 0; a < paidTypeStore.getCount(); ++a){
						    var r = paidTypeStore.getAt(a);
						    if (r.get("PayName") == payName){
							var isVirtual = r.get("IsVirtual");
							var form = f.ownerCt.form;
							var fields = form.getFields();
							var field = fields.last();
							field.setValue(isVirtual == "false" ? "是" : "否");
							break;
						    }
						}
					    }
					}
				    }
				}
				break;
			    case "Money":
				column.editor = {
				    xtype: "numberfield",
				    type: "int",
				    allowBlank: false
				}
				break;
			    case "Descript":
				column.editor = {
				    xtype: "textfield"
				}
				break
			    case "PayDate":
				column.xtype = "datecolumn";
				column.format = "Y/m/d G:i";
			}

			_columns.push(column);
		    }
		};

		if (!Beet.apps.customers.PaidTypeModel){
		    Ext.define("Beet.apps.customers.PaidTypeModel", {
			extend: 'Ext.data.Model',
			fields: _fields    
		    });
		}

		me.paidStore = Ext.create("Ext.data.ArrayStore", {
		    model: Beet.apps.customers.PaidTypeModel
		})
		me.paidColumns = _columns;
	    },
	    failure: function(error){
		Ext.Error.raise(error)
	    }
	})    
    },
    openPaidWindow: function(){
        var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer, win, grid;
        cost = 0;

        var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false,
            listeners: {
                edit: function(e, editor){
                    var store = e.store;
                    cost = 0;
                    for (var c = 0; c < store.getCount(); ++c){
                        var record = store.getAt(c);
                        var payName = record.get("PayName");
                        if (payName){
                            for (var a = 0; a < paidTypeStore.getCount(); ++a){
                                var r = paidTypeStore.getAt(a);
                                if (r.get("PayName") == payName){
                                    record.set("PayID", r.get("PayID"));
                                    break;
                                }
                            }
                        }
                        var money = record.get("Money")
                        cost += parseFloat(money);    
                    }
                    e.grid.down("label[name=totalPrice]").setText(cost)
                }
            }
        });
	
	me.paidStore.clearData();
	grid = Ext.create("Ext.grid.Panel", {
	    width: "100%",
	    height: "100%",
	    autoScroll: true,    
	    autoHeight: true,
	    store : me.paidStore,
	    columns: me.paidColumns,
	    tbar: [
		{
		    text: "新增付款",
		    handler: function(){
			rowEditing.cancelEdit();
			var r = Ext.create("Beet.apps.customers.PaidTypeModel", {
			    "PayName" : "",
			    "Money" : 0,
			    "PayDate" : new Date(),
			    "Descript" : "",
			    "EName" : Beet.cache.currentEmployName,
			    "employeeid" : Beet.cache.currentEmployGUID
			});
			me.paidStore.insert(0, r);
			rowEditing.startEdit(0, 0);
		    }
		},
		"->",
		{
		    text: "付款方式",
		    handler: function(){
			var _win;
			_win = Ext.create("Ext.window.Window", {
			    width: 500,
			    height: 500,
			    title: "付款方式",
			    items: [
				Ext.create("Beet.apps.customers.payList")
			    ]   
			})

			_win.show();
		    }
		}
	    ],
	    bbar: [
		{
		    xtype: "label",
		    text: "总计:"
		},
		{
		    xtype: "label",
		    name: "totalPrice",
		    text: "0"
		},
		"->",
		{
		    text: "确定",
		    handler: function(){
			Ext.MessageBox.show({
			    title: "充值确认",
			    msg: "充值金额: <span style=\"color:red;font-weight:bolder;\">" + cost + "</span> 元 <br/><br/>确认充值吗?",
			    buttons: Ext.MessageBox.YESNO,
			    fn: function(btn){
				if (btn == "yes"){
				    var pays = [];
				    var totalMoney = 0;
				    for (var c = 0; c < me.paidStore.getCount(); ++c){    
					var r = me.paidStore.getAt(c);
					pays.push({
					    payid: r.get("PayID"),
					    money: r.get("Money"),
					    descript: r.get("Descript")
					});
					totalMoney += r.get("Money");
				    }
				    var results = {
					customerid: me.selectedCustomerId,
					employeeid: Beet.cache.currentEmployGUID,
					pays: pays
				    }

				    if (totalMoney <= 0){
					Ext.Msg.alert("错误", "请输入充值金额, 不能为0");
					return;
				    }

				    //充值部分, 成功充值后, 将返回当前的余额
				    cardServer.AddCustomerPay(Ext.JSON.encode(results), {
					success: function(data){
					    data = JSON.parse(data);
					    if (data["result"]){
						var values = form.getValues();
						var result = data["result"]
						form.setValues(
						    {
							"balance" : parseFloat(data["balance"]),
							"capital" : parseFloat(data["capital"])
						    }
						)
						win.close();    
					    }else{
						Ext.Msg.alert("失败", "充值失败");
					    }
					},
					failure: function(error){
					    Ext.Error.raise(error)
					}
				    })
				}
			    }
			})
		    }
		},
		{
		    text: "取消",
		    handler: function(){ 
			me.paidStore.clearData();
			win.close();
		    }
		}
	    ],
	    plugins: [
		rowEditing    
	    ]
	});
	grid.rowEditing = rowEditing;

        win = Ext.create("Ext.window.Window", {
            title: "充值",
            height: 600,
            width: 600,
            border: false,
            autoHeight: true
        });

	win.add(grid);
	win.show();
    },
    onSelectEmployee: function(records){
        var me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
        me.selectedEmpolyeeId = null;
        if (records && records.length == 1){
            var record = records[0];
            var em_userid = record.get("EM_UserID"), em_name = record.get("EM_NAME");
            form.setValues({
                employeename: em_name    
            })
            me.selectedEmpolyeeId = em_userid;
        }
    },
    onSelectCustomer: function(records, type){
        var record, me = this, form = me.form.getForm(), cardServer = Beet.constants.cardServer;
        //reset all
        me.initCustomerData = true;
        me.selectedCustomerId = null
        me.selectedEmpolyeeId = null;
        me.selectedCardId = null;
        form.reset();
        me.down("button[name=updatebtn]").disable();
        me.down("button[name=activebtn]").hide();
        me.down("button[name=deleteCard]").disable();
        me.down("button[name=paidbtn]").disable();
	me.down("button[name=historybtn]").disable();
        var currentBalance = 0;

        if (Ext.isArray(records) && records.length > 0){
        }else{
            if (records && (records.data || records.raw)){
                records = [records];
            }else{
		if (records && type == "cardno"){
		    records = records;
		}else{
		    Ext.MessageBox.alert("错误", "该用户不存在, 请重新查找!");
		    return;
		}
	    }
        }

        if (records && records.length > 0){
            var customerData;
            me.queue.Add("queryCustomer", "", function(){
                Ext.MessageBox.show({
                    msg: "正在查询当前客户数据中...",
                    progressText: "查询中...",
                    width: 300,
                    wait: true,
                    waitConfig: {interval: 800},
                    closable: false
                });

                var sql = "";
                if (type == "cardno"){
                    sql = " CardNo = '" + records + "'";    
                }else{
                    var record = records[0];
                    var CTGUID = record.get("CTGUID"), name = record.get("CTName");
                    form.setValues({
                        customername: name
                    })
                    me.selectedCustomerId = CTGUID;
                    sql = "CustomerID='" + CTGUID + "'";
                }

                cardServer.GetCustomerAccountData(false, sql, {
                    success: function(data){
                        data = Ext.JSON.decode(data);
                        data = data["Data"];
                        if (data.length > 0){
                            customerData = data[0];
                            //restoreForm
                            me.restoreCustomerFromData(customerData);

                            if (type == "cardno"){
                                me.selectedCustomerId = customerData["CustomerID"];
                                form.setValues({
                                    customername: customerData["CustomerName"]    
                                })
                            }
                            
			    if (customerData["CardNo"] == ""){
				me.down("button[name=activebtn]").show();
			    }else{
				me.down("button[name=updatebtn]").enable();
				me.down("button[name=deleteCard]").enable();
			    }

                            me.queue.triggle("queryCustomer", "success");
                        }else{
                            customerData = null;
                            //获取充值余额
                            cardServer.GetCustomerPayData(false, sql, {
                                success: function(data){
                                    var data = Ext.JSON.decode(data);
                                    data = data["Data"];
                                    var money = 0;
                                    for (var c = 0; c < data.length; ++c){
                                        var d = data[c];
                                        var m = d["Money"].replaceAll(",", "");
                                        money += parseFloat(m);
                                    }
                                    form.setValues({
                                        balance: money    
                                    });
                                    me.queue.triggle("queryCustomer", "success");
                                },
                                failure: function(error){
                                    Ext.Error.raise(error)
                                }
                            })
                        }
                        if (me.selectedCustomerId){
                            me.down("button[name=paidbtn]").enable();
			    me.down("button[name=historybtn]").enable();
                        }
                    },
                    failure: function(error){
                        Ext.Error.raise(error)
                    }
                })
            });

            me.queue.Add("queryCustomerCard", "queryCustomer", function(){
                if (customerData){
                    cardServer.GetCustomerCardData(false, "CustomerID='"+customerData["CustomerID"]+"'", {
                        success: function(data){
                            data = Ext.JSON.decode(data);
                            data = data["Data"];
                            var records = []
                            for (var c = 0; c < data.length; ++c){
                                var d = data[c];
                                var cardId = d["CID"];
                                if (cardId){
                                    var record = d;
                                    record["StartTime"] = new Date(record["StartTime"])
                                    record["EndTime"] = new Date(record["EndTime"])
                                    //处理并且合并相关数据, 然后使用addCard方法传入
                                    records.push(record);
                                }
                            }
                            
                            me.addCard(records.shift());
                            me.queue.triggle("queryCustomerCard", "success");
                        },
                        failure: function(error){
                            Ext.Error.raise(error)
                        }
                    });
                }else{
                    if (customerData == null){
                        me.queue.triggle("queryCustomerCard", "success");
                    }
                }
            })

            me.queue.Add("waitingFeedback", "queryCustomer,queryCustomerCard", function(){
                Ext.MessageBox.hide();
                me.queue.triggle("waitingFeedback", "success");
                me.initCustomerData = false;
            })
        }
    },
    restoreCustomerFromData: function(data){
        var me = this, cardServer = Beet.constants.cardServer, form = me.form.getForm();
        me.selectedCustomerId = data["CustomerID"];
        me.selectedEmpolyeeId = data["EID"];

	//do
	me.selectedFriendID = data["FriendID"];
        form.setValues({
            cardno: data["CardNo"],
            "level" : data["Level"],
            employeename: data["EName"],
            balance: data["Balance"],
	    capital : data["Capital"],
            descript: data["Descript"]
        })
    },
    addCard: function(record, isRecord, binding){
        var me = this;
	if (record == undefined){
	    Ext.Msg.alert("错误", "请选择卡项");
	    return;
	}


	var form = me.form.getForm();
	var rawData;
	if (isRecord){
	    rawData = record.raw;
	}else{
	    rawData = record;
	}
	
	//check balance must be bigger than the par of the card
	if (binding){
	    var values = form.getValues();
	    var capital = parseFloat(values["capital"]);
	    var cardPar = parseFloat(rawData["Par"]);
	    if (capital < cardPar){
		Ext.Msg.alert("错误", "本金小于该卡级别面值, 请充值或选择其他级别的卡!");
		return;
	    }
	}

	var cid = (rawData["ID"] == undefined ? rawData["CID"] : rawData["ID"]);

	var starttime, endtime;
	var endtimeField = me.form.down("datefield[name=endtime]")
	
        if (rawData["StartTime"] == undefined){
            rawData["StartTime"] = new Date();
        }

	var d = 0;
	switch (rawData["ValidUnit"]){
	    case "0":
		d = rawData["ValidDate"] * 365 * 86400;
		break;
	    case "1":
		d = rawData["ValidDate"] * 30 * 86400;
		break;
	    case "2":
		d = rawData["ValidDate"] * 86400;
		break;
	}
	if (rawData["ValidDateMode"] == "0"){
	    endtimeField.hide();
	}else{
	    endtimeField.show();
	}
	rawData["EndTime"] = new Date(+new Date() + d * 1000);

	form.setValues({
	    "__code" : rawData["Code"],
	    "__cardname" : rawData["Name"],
	    "__par"  :  rawData["Par"],
	    "__insure" : rawData["Insure"],
	    "__level" : rawData["Level"],
	    "endtime" : rawData["EndTime"]
	});
	me.selectedCardId = cid;
    },
    processData: function(f, isUpdate){
        var me = this, cardServer = Beet.constants.cardServer, form = me.form.getForm(), results = form.getValues();
        var customerId = me.selectedCustomerId;
        var isValid = false;

        if (!customerId){
            Ext.MessageBox.alert("失败", "请选择会员!");
            return;
        }

        if (!me.selectedEmpolyeeId){
            Ext.MessageBox.alert("失败", "请选择顾问!");
            return;
        }

        results["customerid"] = customerId;
        results["eid"] = me.selectedEmpolyeeId;
	results["cid"] = me.selectedCardId;
	results["rate"] = 1
        if (isUpdate){
           cardServer.UpdateCustomerAccount(Ext.JSON.encode(results), {
               success: function(succ){
                   if (succ){
                       Ext.MessageBox.alert("成功", "更新成功!");
                   }else{
                       Ext.MessageBox.alert("失败", "更新失败!");
                   }
               },
               failure: function(error){
                   Ext.Error.raise(error);
               }
           });
        }else{
           cardServer.AddCustomerAccount(Ext.JSON.encode(results), {
               success: function(succ){
                   if (succ){
                       Ext.MessageBox.show({
                           title: "增加成功",
                           msg: "是否需要继续添加?",
                           buttons: Ext.MessageBox.YESNO,
                           fn: function(btn){
                               if (btn == "yes"){
                                   me.selectedCustomerId = null
                                   me.selectedEmpolyeeId = null;
				   me.selectedFriendID = null
                                   me.selectedCardId = {};
                                   form.reset();
                                   me.updateCardPanel();
                               }
                           }
                       })
                   }else{
                       Ext.MessageBox.alert("失败", "添加失败!");
                   }
               },
               failure: function(error){
                   Ext.Error.raise(error);
               }
           });
	}
    }
});

Ext.define("Beet.apps.customers.payList", {
    extend: "Ext.panel.Panel",
    width: "100%",
    height: "100%",
    autoHeight: true,
    border: false,
    plain: true,
    initComponent: function(){
	var me = this, cardServer = Beet.constants.cardServer;
	me.callParent();
	cardServer.GetPayTypeData("", {
	    success: function(data){
		var data = Ext.JSON.decode(data);
		me.buildStoreAndModel(data["MetaData"]);
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})
    },
    buildStoreAndModel: function(metaData){
	var me = this, columns = [], fields = [];
	for (var c = 0; c < metaData.length; c++){
	    var d = metaData[c];
	    if (!d["FieldHidden"]){
		fields.push(d["FieldName"]);
		columns.push({
		    dataIndex: d["FieldName"],
		    header: d["FieldLabel"],
		    flex: 1
		})
	    }
	}
	me.columns = columns;

	if (!Beet.apps.customers.payListModel){
	    Ext.define("Beet.apps.customers.payListModel", {
		extend: "Ext.data.Model",
		fields: fields
	    })
	}

	if (!Beet.apps.customers.payListStore){
	    Ext.define("Beet.apps.customers.payListStore",{
		extend: "Ext.data.Store",
		model: Beet.apps.customers.payListModel,	
		autoLoad: true
	    })
	}

	me.storeProxy = Ext.create("Beet.apps.customers.payListStore");
	me.storeProxy.setProxy({
            type: "b_proxy",
            b_method: Beet.constants.cardServer.GetPayTypeData,
            b_params: {
                "awhere" : ""
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
	})

	me.createMainPanel();
    },
    createMainPanel: function(){
	var me = this, grid, w, cardServer = Beet.constants.cardServer;
	grid = Ext.create("Ext.grid.Panel", {
	    width : "100%",
	    height : "100%",
	    autoScroll: true,
	    border: false,
	    store: me.storeProxy,
	    columns: me.columns,
	    tbar: [
		{
		    text: "新增",
		    handler: function(){
			var form = me.paidTypeForm = Ext.create("Ext.form.Panel", {
		            height: "100%",
		            width: "100%",
		            border: false,
			    frame: true,
		            plain: true,
		            items: [
		                {
		                    fieldLabel: "名称",
		                    xtype: "textfield",
		                    name: "payname"    
		                },
				{
				    fieldLabel: "虚拟货币?",
				    xtype: "checkbox",
				    inputValue: true,
				    name: "isvirtual"
				},
		                {
		                    xtype: "button",
		                    text: "提交",
		                    handler: function(){
		                        var form = me.paidTypeForm.getForm(), results = form.getValues();
		                        cardServer.AddPayType(Ext.JSON.encode(results), {
		                            success: function(id){
		                                if (id > -1){
		                                    Ext.Msg.show({
		                                        title: "添加成功",
		                                        msg: "添加付款方式成功!",
		                                        buttons: Ext.MessageBox.YESNO,
		                                        fn: function(btn){
		                                            w.close();
		                                        }
		                                    });
						    getPayMethod();
						    me.storeProxy.loadPage(1);
		                                }else{
		                                    Ext.Error.raise("增加服务失败");
		                                }
		                            },
		                            failure: function(error){
		                                Ext.Error.raise(error);
		                            }
		                        });
		                    }
		                }
		            ],
		        });
		        w = Ext.create("Ext.window.Window", {
		            height: 150,
		            width: 300,
		            title: "增加付款方式",
		            plain: true    
		        });
		        w.add(form);
		        w.show();
		    }
		}
	    ]
	});

	me.add(grid);
	me.doLayout();
    }
});

})()
