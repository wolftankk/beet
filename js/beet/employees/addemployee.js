registerMenu("employees", "employeeAdmin", "员工管理",
    [
        {
            xtype: "button",
            text: "增加员工",
            id: "employee_addBtn",
            tooltip: "点击添加员工",
            handler: function(){
                var item = Beet.cache.menus["employees.AddEmployee"];
                if (!item){
                    Beet.workspace.addPanel("employees.AddEmployee", "添加员工", {
                        items: [
                            Ext.create("Beet.apps.employees.AddEmployee")
                        ]    
                    })
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

Ext.define("Beet.apps.employees.AddEmployee", {
    extend: "Ext.panel.Panel",
    layout: "anchor",
    height: Beet.constants.VIEWPORT_HEIGHT - 5,
    width : "100%",
    defaults: {
        border: 0
    },
    border: 0,
    suspendLayout: true,
    lookMask: true,
    initComponent: function(){
        var me = this;
        Ext.apply(this, {});

        if (!me.departmentList){
            me.createDeparentList();
        }
        if (!me.branchesList){
            me.createBranchesList();
        }
        
        me.baseInfoPanel = Ext.create("Ext.form.Panel", me.getBaseInfoPanelConfig());
        me.items = [
            me.baseInfoPanel
        ]

        me.callParent(arguments);
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
    getBaseInfoPanelConfig: function(){
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
                    fieldLabel: "登录名",
                    name: "username",
                },
                {
                    fieldLabel: "登陆密码",
                    inputType: 'password',
                    name: "password",
                    minLength: 6
                },
                {
                    fieldLabel: "重新输入密码",
                    inputType: 'password',
                    validator: function(value){
                        var pw  = this.previousSibling('[name=password]');
                        return (pw.getValue() === value) ? true : '密码不匹配'; 
                    }
                },
                {
                    fieldLabel: "员工姓名",
                    name: "emname"
                },
                {
                    fieldLabel: "所属部门",
                    name: "emdep",
                    xtype: "combobox",
                    editable: false,
                    store: me.departmentList,
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: false,
                },
                {
                    fieldLabel: "所属分店",
                    name: "emstore",
                    xtype: "combobox",
                    editable: false,
                    store: me.branchesList,
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: false,
                },
                {
                    fieldLabel: "身份证号",
                    name: "empid",
                    allowBlank: true
                },
                {
                    fieldLabel: "分机号",
                    name: "emext",
                    allowBlank: true
                },
                {
                    fieldLabel: "地址",
                    name: "emaddr",
                    allowBlank: true
                },
                {
                    fieldLabel: "QQ/MSN",
                    name: "emim",
                    allowBlank: true
                },
                {
                    fieldLabel: "手机",
                    name: "emmobile",
                    allowBlank: true
                },
                {
                    fieldLabel: "座机号",
                    name: "emphone",
                    allowBlank: true
                },
                {
                    fieldLabel: "出生月份",
                    xtype: "combobox",
                    store: Beet.constants.monthesList,
                    name: "embirthmonth",
                    queryMode: "local",
                    editable: false,
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: true,
                },
                {
                    fieldLabel: "出生日期",
                    xtype: "combobox",
                    editable: false,
                    store: Beet.constants.daysList,
                    name: "embirthday",
                    queryMode: "local",
                    displayField: "name",
                    valueField: "attr",
                    allowBlank: true
                },
                {
                    fieldLabel: "入职日期",
                    xtype: "datefield",
                    editable: false,
                    name: "emindate",
                    format: "Y/m/d",
                    value: new Date(),
                    allowBlank: false
                },
                {
                    fieldLabel: "备注",
                    xtype: "textfield",
                    name: "descript"
                },
                {
                    xtype: "button",
                    id : "move-next",
                    scale: "large",
                    formBind: true,
                    disabled: true,
                    text: "增加",
                    handler: me._addEmployee
                }
                
            ]
        }
        return config;
    },
    createAdminSeletorWindow: function(needSumbitData, _form){
        var me = this, privilegeServer = Beet.constants.privilegeServer, employeeServer = Beet.constants.employeeServer;
        var createWin = function(){
            var list = [], _data = Beet.cache.adminData.data, _metadata = Beet.cache.adminData.metaData;

            for (var c in _data){
                var item = _data[c];
                list.push({
                    inputValue: item["UserGUID"],
                    name: "_etype",
                    boxLabel: item["UserName"] + "   "  + item["Descript"]
                });
            }

            var win = Ext.widget("window", {
                title: "选择员工关联的操作员",
                width: 450,
                height: 300,
                minHeight: 200,
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
                    {
                        xtype: "form",
                        frame: true,
                        border: false,
                        plain: true,
                        height: "100%",
                        fieldDefaults: {
                            msgTarget: "side",
                            labelAlign: "left",
                            labelWidth: 75
                        },
                        defaultType: "radio",
                        items: list,
                        buttons: [
                            {
                                text: "提交",
                                handler: function(widget, e){
                                    var t = this, form = t.up("form").getForm(), result = form.getValues();
                                    if (result["_etype"]){
                                        var _id = result["_etype"];
                                        win.close();
                                        employeeServer.AddEmployee(_id, needSumbitData, {
                                            success: function(uid){
                                                if (uid > -1){
                                                    Ext.MessageBox.show({
                                                        title: "添加成功!",
                                                        msg: "是否需要继续添加员工?",
                                                        buttons: Ext.MessageBox.YESNO,
                                                        fn: function(btn){
                                                            if (btn == "yes"){
                                                                _form.reset();
                                                            }else{
                                                                if (Beet.apps.Menu.Tabs["addEmployee"]){
                                                                    Beet.workspace.removePanel("addEmployee");
                                                                }
                                                            }
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
            })

            me.popAdminSelectorWindow = win;
            win.show();
        }

        if (Beet.cache.adminData == undefined){
            Beet.cache.adminData = {};
            privilegeServer.GetUserDataToJSON(false, {
                success: function(data){
                    data = Ext.JSON.decode(data);
                    Beet.cache.adminData.data = data["Data"];
                    Beet.cache.adminData.metaData = data["MetaData"];

                    createWin();
                },
                failure: function(error){
                    Ext.Error.raise(error);
                }
            })
        }else{
            createWin();
        }
    },
    _addEmployee: function(direction, e){
        var me = this, form = me.up("form").getForm(), parent = me.ownerCt.ownerCt, result = form.getValues(),needSumbitData, employeeServer = Beet.constants.employeeServer;
        if (form.isValid()){
            result["emindate"] = +(new Date(result["emindate"]))/1000;
            result["password"] = xxtea_encrypt(result["password"])

            needSumbitData = Ext.JSON.encode(result);
            Ext.MessageBox.show({
                title: "增加员工",
                msg: "是否需要添加员工: " + result["emname"],
                buttons: Ext.MessageBox.YESNO,
                fn: function(btn){
                    if (btn == "yes"){
                        employeeServer.AddEmployee(needSumbitData, {
                            success: function(uid){
                                 if (uid !== Beet.constants.FAILURE){
                                     Ext.MessageBox.show({
                                         title: "添加成功!",
                                         msg: "是否需要继续添加员工?",
                                         buttons: Ext.MessageBox.YESNO,
                                         fn: function(btn){
                                             if (btn == "yes"){
                                                 form.reset();
                                             }else{
                                                 if (Beet.apps.Menu.Tabs["addEmployee"]){
                                                     Beet.workspace.removePanel("addEmployee");
                                                 }
                                             }
                                         }
                                     })
                                 }
                             },
                            failure: function(error){
                                Ext.Error.raise(error);
                            }
                        })
                        //parent.createAdminSeletorWindow(needSumbitData, form);
                    }
                }
            });
        }
    }
});
