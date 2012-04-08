registerMenu("employees", "employeeAdmin", "员工管理",
    [
        {
            xtype: "button",
            text: "编辑员工",
            id: "employee_editBtn",
            tooltip:"编辑或者删除员工",
            handler: function(){
                var item = Beet.cache.menus["employees.EmployeeList"];
                if (!item){
                    Beet.workspace.addPanel("employees.EmployeeList", "编辑员工", {
                        items: [
                            Ext.create("Beet.apps.employees.EmployeeList")
                        ]    
                    })
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

Ext.define("Beet.apps.employees.EmployeeList", {
    extend: "Ext.panel.Panel",
    layout: "fit",
    width: "100%",
    bodyBorder: false,
    autoHeight: true,
    frame: true,
    b_filter: "",
    b_selectionMode: "MULTI",
    b_type: "list", 
    defaults:{
        border: 0
    },
    initComponent: function(){
        var me = this;

        me.createDeparentList();
        me.createBranchesList();

        me.callParent();
        
        Beet.constants.employeeServer.GetEmployeeData(0, 1, "", true, {
            success: function(data){
                var data = Ext.JSON.decode(data);
                me.buildStoreAndModel(data["MetaData"]);
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },
    buildStoreAndModel: function(metaData){
        var me = this, fields = [], columns = [];
        me.columns = columns;
        for (var c = 0; c < metaData.length; ++c){
            var d = metaData[c];
            if (d["FieldName"] == "EM_INDATE"){
                fields.push({ 
                    name: "EM_INDATE", 
                    convert: function(value, record){
                         var date = new Date(value * 1000);
                         if (date){
                             return Ext.Date.format(date, "Y/m/d");
                         }
                     }
                });
            }else{
                fields.push(d["FieldName"]);
            }
            if (!d["FieldHidden"]) {
                columns.push({
                    flex: 1,
                    header: d["FieldLabel"],
                    dataIndex: d["FieldName"]    
                })
            }
        };
        if (!Beet.apps.employees.EmployeeListModel){
            Ext.define("Beet.apps.employees.EmployeeListModel", {
                extend: "Ext.data.Model",
                fields: fields
            });
        }

        if (!Ext.isDefined(Beet.apps.employees.EmployeeListStore)){
            Ext.define("Beet.apps.employees.EmployeeListStore", {
                extend: "Ext.data.Store",
                model: Beet.apps.employees.EmployeeListModel,
                autoLoad: true,
                pageSize: Beet.constants.PageSize,
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
                    me.proxy.b_params["start"] = options["start"];
                    me.proxy.b_params["limit"] = options["limit"]

                    return me.callParent([options]);
                },
            });
        };
        
        me.storeProxy = Ext.create("Beet.apps.employees.EmployeeListStore");
        me.storeProxy.setProxy(me.updateProxy());
        me.createEmployeeGrid();
    },
    updateProxy: function(){
        var me = this, employeeServer = Beet.constants.employeeServer;
        return {
            type: "b_proxy",
            b_method: Beet.constants.employeeServer.GetEmployeeData,
            startParma: "start",
            limitParma: "limit",
            b_params: {
                "filter" : me.b_filter,
                "b_onlySchema": false
            },
            b_scope: Beet.constants.employeeServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        }
    },
    createDeparentList: function(){
        var me = this;
        me.departmentList = Ext.create("Ext.data.Store", {
            fields: ["attr", "name"],
            data: Beet.cache.employee.departmentList    
        });
    },
    createBranchesList: function(){
        var me = this;
        me.branchesList = Ext.create("Ext.data.Store", {
            fields: ["attr", "name"],
            data: Beet.cache.employee.branchesList
        });
    },
    createEmployeeGrid: function(){
        var me = this, grid = me.grid, store = me.storeProxy, actions;

        if (me.b_type == "list"){
            var _actions = {
                xtype: "actioncolumn",
                widget: 20,
                items: []
            }

            _actions.items.push(
                "-","-","-", {
                    icon: './resources/themes/images/fam/user_edit.png',
                    tooltip: "编辑员工",
                    id: "employee_grid_edit",
                    handler: function(grid, rowIndex, colIndex){
                        var d = me.storeProxy.getAt(rowIndex)
                        me.editEmployeeFn(d);
                    }
                }, "-", "-"
            );

            _actions.items.push("-", {
                icon: "./resources/themes/images/fam/delete.gif",    
                tooltip: "删除员工",
                id: "employee_grid_delete",
                handler: function(grid, rowIndex, colIndex){
                    var d = me.storeProxy.getAt(rowIndex)
                    me.deleteEmployeeFn(d);
                }
                } 
            );

            me.columns.splice(0, 0, _actions);
        }

        var sm;
        if (me.b_type == "selection"){
            sm = Ext.create("Ext.selection.CheckboxModel", {
                mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
            });
        }

        me.grid = Ext.create("Beet.plugins.LiveSearch", {
            store: store,
            lookMask: true,
            frame: true,
            width: "100%",
            height: "100%",
            selModel: sm,
            cls: "iScroll",
            collapsible: false,
            rorder: false,
            bodyBorder: 0,
            autoScroll: true,
            autoHeight: true,
            border: 0,
            columnLines: true,
            viewConfig: {
                trackOver: false,
                stripeRows: true    
            },
            columns: me.columns,
            tbar: [
                "-",
                {
                    xtype: "button",
                    text: "高级搜索",
                    handler: function(){
                        var employeeServer = Beet.constants.employeeServer;
                        employeeServer.GetEmployeeData(0, 1, "", true, {
                            success: function(data){
                                var win = Ext.create("Beet.apps.AdvanceSearch", {
                                    searchData: Ext.JSON.decode(data),
                                    b_callback: function(where){
                                        me.b_filter = where;
                                        me.filterEmployee();
                                    }
                                });
                                win.show();
                            },
                            failure: function(error){
                                Ext.Error.raise(error);
                            }
                        });
                    }
                }
            ],
	    bbar: Ext.create('Ext.PagingToolbar', {
	        store: store,
	        displayInfo: false,
	        displayMsg: '当前显示 {0} - {1}, 总共{2}条数据',
	        emptyMsg: "没有数据",
	        items: [
		    "->",
		    {xtype: 'tbtext', itemId: 'displayItem'},
	            {
	        	text: "确定",
	        	hidden: me.b_type != "selection",
	        	style: {
	        	    float: "right"
	        	},
	        	width: 100,
	        	handler: function(){
	        	    if (me.b_selectionCallback){
	        		me.b_selectionCallback(me.grid.selModel.getSelection());
	        	    }
	        	}
	            }
	        ]
	    })
        });
        me.add(me.grid);
        me.doLayout();
    },
    filterEmployee: function(){
        var me = this;
        me.storeProxy.setProxy(me.updateProxy());

        me.storeProxy.loadPage(1);
    },
    editEmployeeFn: function(parentMenu){
        var me = this, rawData = parentMenu.rawData || parentMenu.raw, guid = rawData.EM_UserID , EmName= rawData.EM_NAME, employeeServer = Beet.constants.employeeServer;
        if (guid){
            Ext.MessageBox.show({
                title: "编辑员工",
                msg: "是否要修改 " + EmName + " 的资料",
                buttons: Ext.MessageBox.YESNO,
                fn : function(btn){
                    if (btn == "yes"){
                        me.popEditWindow(rawData, guid);
                    }
                }
            });
        }
    },
    getBaseInfoPanelConfig: function(rawData, guid){
        var me = this, config;

        config = {
            frame: true,
            bodyPadding: 10,
            layout: "anchor",
            height: "100%",
            autoScroll: true,
            autoHeight: true,
            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'left',
                labelWidth: 75,
                allowBlank: false
            },
            defaultType: "textfield",
            items: [
                {
                    fieldLabel: "员工姓名",
                    name: "emname",
                    value: rawData["EM_NAME"]
                },
                {
                    fieldLabel: "登陆名",
                    name: "name",
                    emptyText: "留空则不做修改",
                    allowBlank: true,
                },
                {
                    fieldLabel: "登陆密码",
                    inputType: 'password',
                    name: "password",
                    minLength: 6,
                    emptyText: "留空则不做修改",
                    allowBlank: true
                },
                {
                    fieldLabel: "重新输入密码",
                    inputType: 'password',
                    allowBlank: true,
                    emptyText: "留空则不做修改",
                    validator: function(value){
                        var pw  = this.previousSibling('[name=password]');
                        return (pw.getValue() === value) ? true : '密码不匹配'; 
                    }
                },
                {
                    fieldLabel: "所属部门",
                    name: "emdep",
                    xtype: "combobox",
                    store: me.departmentList,
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: false,
                    value: rawData["EM_DEP"]
                },
                {
                    fieldLabel: "所属分店",
                    name: "emstore",
                    xtype: "combobox",
                    store: me.branchesList,
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: false,
                    value: rawData["EM_STOREID"]
                },
                {
                    fieldLabel: "身份证号",
                    name: "empid",
                    allowBlank: true,
                    value: rawData["EM_PID"]
                },
                {
                    fieldLabel: "分机号",
                    name: "emext",
                    allowBlank: true,
                    value: rawData["EM_EXT"]
                },
                {
                    fieldLabel: "地址",
                    name: "emaddr",
                    allowBlank: true,
                    value: rawData["EM_ADDR"]
                },
                {
                    fieldLabel: "QQ/MSN",
                    name: "emim",
                    allowBlank: true,
                    value: rawData["EM_IM"]
                },
                {
                    fieldLabel: "手机",
                    name: "emmobile",
                    allowBlank: true,
                    value: rawData["EM_MOBILE"]
                },
                {
                    fieldLabel: "座机号",
                    name: "emphone",
                    allowBlank: true,
                    value: rawData["EM_PHONE"]
                },
                {
                    fieldLabel: "出生月份",
                    xtype: "combobox",
                    store: Beet.constants.monthesList,
                    name: "embirthmonth",
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: true,
                    value: rawData["EM_BIRTHMONTH"]
                },
                {
                    fieldLabel: "出生日期",
                    xtype: "combobox",
                    store: Beet.constants.daysList,
                    name: "embirthday",
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: true,
                    value: rawData["EM_BIRTHDAY"]
                },
                {
                    fieldLabel: "入职日期",
                    xtype: "datefield",
                    name: "emindate",
                    allowBlank: false,
                    format: "Y/m/d",
                    value: new Date(rawData["EM_INDATE"] * 1000)
                },
                {
                    fieldLabel: "备注",
                    allowBlank: true,
                    value: rawData["EM_DESCRIPT"]
                },
                {
                    xtype: "button",
                    id : "move-next",
                    scale: "large",
                    text: "修改",
                    handler: function(){
                        var that = this, form = that.up("form").getForm(), result = form.getValues(), employeeServer = Beet.constants.employeeServer;
                        result["emindate"] = (+new Date(result["emindate"])) / 1000;
                        if (result["name"] == "" && result["name"].length == 0){
                            delete result["name"];
                        }
                        if (result["password"] == "" && result["password"].length == 0){
                            delete result["password"];
                        }else{
                            result["password"] = xxtea_encrypt(result["password"]);
                        }

                        var needSumbitData;
                        //if (form.isValid()){
                            needSumbitData = Ext.JSON.encode(result);
                            employeeServer.UpdateEmployee(guid, needSumbitData, {
                                success: function(isSuccess){
                                    if (isSuccess){
                                        Ext.MessageBox.show({
                                            title: "更新成功!",
                                            msg: "更新成功!",
                                            buttons: Ext.MessageBox.OK,
                                            fn: function(btn){
                                                me.storeProxy.loadPage(me.storeProxy.currentPage);
                                                me.editorWin.close();
                                            }
                                        })
                                    }
                                },
                                failure: function(error){
                                    Ext.Error.raise(error);
                                }
                            })
                        //}
                    }
                }
                
            ]
        }
        return config;
    },
    popEditWindow: function(rawData, guid){
        var me = this, EmName = rawData.EM_NAME, employeeServer = Beet.constants.employeeServer, win;
        
        me.editorWin = win = Ext.widget("window", {
            title: EmName + " 的资料信息",
            width: 650,
            height: 600,
            minHeight: 400,
            autoHeight: true,
            autoScroll: true,
            layout: "fit",
            resizable: true,
            border: false,
            modal: true,
            maximizable: true,
            border: 0,
            bodyBorder: false,
            items: [
                Ext.create("Ext.form.Panel", me.getBaseInfoPanelConfig(rawData, guid))
            ],
            buttons: [
                {
                    text: "关闭",
                    handler:function(){
                        win.close();
                    }
                }
            ]
        })
        win.show();
    },
    deleteEmployeeFn: function(parentMenu){
        var me = this, rawData = parentMenu.rawData || parentMenu.raw, guid = rawData.EM_UserID , EmName= rawData.EM_NAME, employeeServer = Beet.constants.employeeServer;
        if (guid){
            Ext.MessageBox.show({
                title: "删除员工",
                msg: "是否要删除 " + EmName + " ?",
                buttons: Ext.MessageBox.YESNO,
                fn: function(btn){
                    if (btn == "yes"){
                        employeeServer.DelEmployee(guid, {
                            success: function(){
                                Ext.MessageBox.show({
                                    title: "删除成功",
                                    msg: "删除员工: " + EmName + " 成功",
                                    buttons: Ext.MessageBox.OK,
                                    fn: function(){
                                        me.storeProxy.loadPage(me.storeProxy.currentPage);
                                    }
                                })
                            },
                            failure: function(error){
                                Ext.Error.raise("删除员工失败");
                            }
                        })
                    }
                }
            });
        }else{
            Ext.Error.raise("删除用户失败");
        }
    }
});
