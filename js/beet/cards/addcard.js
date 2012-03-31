registerMenu("cards", "cardAdmin", "卡项管理",
    [
	{
            xtype: "button",
            text: "增加卡项",
            handler: function(){
                var item = Beet.cache.menus["cards.AddCard"]
                if (!item){
                    Beet.workspace.addPanel("cards.AddCard", "增加卡项", {
                        items: [
                            Ext.create("Beet.apps.cards.AddCard")
                        ]
                    })
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
)

Ext.define("Beet.apps.cards.AddCard", {
    extend: "Ext.form.Panel",
    height: Beet.constants.VIEWPORT_HEIGHT - 5,
    width: "100%",
    autoHeight: true,
    autoScroll:true,
    frame:true,
    border: false,
    bodyBorder: false,
    plain: true,
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        me.selectedInterests = {};//服务列表
        me.selectedChargeType = {};//费用列表
        me.selectedRebates = {};//返利
        me.selectedPackages = {};//套餐
        me.selectedItems = {};//项目
        me.selectedProducts = {};//产品

        me.childrenList = [];

        //面值
        me._par = {};
        //实耗
        me._real = {};

        me.callParent();    
        me.createMainPanel();
    },
    createMainPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var options = {
            autoScroll: true,
            height: 460,
            cls: "iScroll",
            border: true,
            plain: true,
            flex: 1,
            bodyStyle: "background-color: #dfe8f5",
            collapsible: true,
            collapseDirection: "top",
            collapsed: true,
            listeners: {
                beforeexpand: function(p){
                    for (var c = 0; c < me.childrenList.length; ++c){
                        var child = me.childrenList[c];
                        if (child !== p){
                            child.collapse();
                        }
                    }
                },
                expand: function(p){
                    if (p && p.setHeight){
                        p.setHeight("100%");//reset && update
                        if (p.callUpdateMethod){
                            p.callUpdateMethod(p.getHeight());
                        }
                    }
                }
            }
        }

        me.interestsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "服务列表",
            tbar: [{
                xtype: "button",
                text: "绑定服务",
                handler: function(){
                    me.selectInterest();
                }
            }]    
        }));
        me.chargeTypesPanel = Ext.widget("panel", Ext.apply(options, {
            title: "费用列表",
            tbar: [{
                xtype: "button",
                text: "绑定费用",
                handler: function(){
                    me.selectChargeType();
                }
            }]    
        }));
        me.rebatesPanel = Ext.widget("panel", Ext.apply(options, {
            title: "返利列表",
            tbar: [{
                xtype: "button",
                text: "绑定返利",
                handler: function(){
                    me.selectRebate();
                },
            }]
        }));

        me.packagesPanel = Ext.widget("panel", Ext.apply(options, {
            title: "套餐列表",
            layout: "hbox",
            tbar: [{
                xtype: "button",
                text: "绑定套餐",
                handler: function(){
                    me.selectPackage();
                },
            }]
        }));
        me.itemsPanel= Ext.widget("panel", Ext.apply(options, {
            title: "项目列表",
            layout: "hbox",
            tbar: [{
                xtype: "button",
                text: "绑定项目",
                handler: function(){
                    me.selectItems();
                },
            }]
        }));
        me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "产品列表",
            tbar: [{
                xtype: "button",
                text: "绑定产品",
                handler: function(){
                    me.selectProducts();
                },
            }]
        }));


        //选择列表
        me.childrenList = [
            me.interestsPanel,
            me.chargeTypesPanel,
            me.rebatesPanel,
            //me.packagesPanel,
            //me.itemsPanel,
            //me.productsPanel
        ]

        var config = {
            autoHeight: true,
            autoScroll: true,
            cls: "iScroll",
            height: "100%",
            width: "100%",
            anchor: "fit",    
            border: false,
            bodyBorder: false,
            plain: true,
            items: [
                {
                    layout: {
                        type: "hbox",
                        align: "stretch"
                    },
                    height: "100%",
                    autoHeight: true,
                    autoScroll: true,
                    border: false,
                    bodyStyle: "background-color: #dfe8f5",
                    defaults: {
                        bodyStyle: "background-color: #dfe8f5",
                        border: false
                    },
                    items:[
                        {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            height: "100%",
                            flex: 1,
                            items: [
                                {
                                    layout: {
                                        type: "table",
                                        columns: 1,
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
                                        width: 400
                                    },
                                    defaultType: "textfield",
                                    fieldDefaults: {
                                        msgTarget: "side",
                                        labelAlign: "top",
                                        labelWidth: 60
                                    },
                                    items: [
                                        {
                                            fieldLabel: "名称",
                                            allowBlank: false,
                                            name: "name"
                                        },
                                        {
                                            fieldLabel: "编码",
                                            allowBlank: false,
                                            name: "code"
                                        },
                                        {
                                            fieldLabel: "卡项级别",
                                            allowBlank: false,
                                            name: "level",
                                            value: 0,
                                            validator: function(value){
                                                var r = /^\d+/;
                                                if (!r.test(value)){
                                                    return "只能为正数"
                                                }
                                                return true
                                            }
                                        },
                                        {
                                            fieldLabel: "面值金额",
                                            allowBlank: false,
                                            name: "par"
                                        },
                                        {
                                            fieldLabel: "保值金额",
                                            allowBlank: false,
                                            name: "insure"
                                        },
                                        {
                                            fieldLabel: "折扣金额",
                                            allowBlank: false,
                                            name: "price"
                                        },
                                        {
                                            fieldLabel: "最大消费次数",
                                            allowBlank: false,
                                            name: "maxcount",
                                            emptyText: "(大于0为计次卡; -1时为计费卡)" 
                                        },
                                        {
                                            fieldLabel: "有效日期",
                                            allowBlank: false,
                                            name: "validdate",
                                        },
                                        {
                                            fieldLabel: "日期单位",
                                            allowBlank: false,
                                            name: "validunit",
                                            xtype: "combo",
                                            store: Beet.constants.DateType,
                                            editable: false,
                                            queryMode: "local",
                                            displayField: "name",
                                            valueField: "attr"
                                        },
                                        {
                                            fieldLabel: "失效方式",
                                            allowBlank: false,
                                            name: "validdatemode",
                                            xtype: "combo",
                                            store: new Ext.data.Store({
                                                fields: ["attr", "name"],
                                                    data: [
                                                        {attr: 0, name: "自启动之日"},
                                                        {attr: 1, name: "自开卡之日"},
                                                        {attr: 2, name: '指定日期'},
                                                    ]    
                                                }),
                                            editable: false,
                                            queryMode: "local",
                                            displayField: "name",
                                            valueField: "attr",
                                            listeners: {
                                                change: function(f, value){
                                                    var nb = f.nextSibling();
                                                    if (value == 2){
                                                        nb.show();
                                                    }else{
                                                        nb.hide();
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            fieldLabel: "失效日期",
                                            xtype: "datefield",
                                            name: "validdatetime",
                                            hidden: true
                                        },
                                        {
                                            fieldLabel: "卡项注释",
                                            xtype: "textarea",
                                            allowBlank: true,
                                            name: "descript"
                                        },
                                        {
                                            text: "新增",
                                            xtype: "button",
                                            scale: "large",
                                            width: 200,
                                            border: 1,
                                            formBind: true,
                                            disabled: true,
                                            style: {
                                                borderColor: "#99BBE8"
                                            },
                                            border: 0,
                                            bodyStyle: "background-color: #dfe8f5",
                                            handler: function(){
                                                me.processData(this);
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            flex: 2,
                            height: 500,
                            items: me.childrenList
                        }
                    ]
                }
            ],
        };
        var form = Ext.widget("form", config);
        me.form = form;
        me.add(form);
        me.doLayout();

        //update panel
        me.initializeInterestsPanel();
        me.initializeChargeTypePanel();
        me.initializeRebatesPanel();
        //me.initializePackagePanel();
        //me.initializeItemsPanel();
        //me.initializeProductsPanel();
    },
    initializeInterestsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.interestsPanel.__columns && me.interestsPanel.__columns.length > 0){
            return;
        }
        var columns = me.interestsPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除服务",
            id: "customer_grid_delete",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deleteInterest(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetInterestsPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.interestsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1,
                        })
                    }
                }
                me.initializeInterestGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeInterestGrid: function(){
        var me = this, selectedInterests = me.selectedInterests;
        var __fields = me.interestsPanel.__fields;
        var store = Ext.create("Ext.data.ArrayStore", {
            fields: __fields
        })

        var grid = me.interestsPanel.grid = Ext.create("Ext.grid.Panel", {
            store: store,
            width: "100%",
            height: "100%",
            cls: "iScroll",
            autoScroll: true,
            columnLines: true,
            columns: me.interestsPanel.__columns
        });

        me.interestsPanel.add(grid);
        me.interestsPanel.doLayout();
    },
    selectInterest: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var config = {
            extend: "Ext.window.Window",
            title: "选择服务",
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

        win.add(Ext.create("Beet.apps.cards.InterestsList", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                me.addInterest(records);
                win.close();
            }
        }));
        win.doLayout();
    },
    addInterest: function(records, isRaw){
        var me = this, selectedInterests = me.selectedInterests;
        var __fields = me.interestsPanel.__fields;
        if (records == undefined){
            return;
        }
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var cid, rawData;
            if (isRaw){
                cid = record["ID"];
                rawData = record;
            }else{
                cid = record.get("ID");
                rawData = record.raw;
            }
            if (selectedInterests[cid] == undefined){
                selectedInterests[cid] = []
            }else{
                selectedInterests[cid] = [];
            }
            for (var c = 0; c < __fields.length; ++c){
                var k = __fields[c];
                selectedInterests[cid].push(rawData[k]);
            }
        }

        me.updateInterestsPanel();
    },
    deleteInterest: function(record){
        var me = this, selectedInterests = me.selectedInterests;
        var cid = record.get("ID");
        if (selectedInterests[cid]){
            selectedInterests[cid] = null;
            delete selectedInterests[cid];
        }

        me.updateInterestsPanel();
    },
    updateInterestsPanel: function(){
        var me = this, selectedInterests = me.selectedInterests;
        var grid = me.interestsPanel.grid, store = grid.getStore();
        var __fields = me.interestsPanel.__fields;
        var tmp = []
        for (var c in selectedInterests){
            tmp.push(selectedInterests[c]);
        }
        store.loadData(tmp);
    },

    initializeChargeTypePanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.chargeTypesPanel.__columns && me.chargeTypesPanel.__columns.length > 0){
            return;
        }
        var columns = me.chargeTypesPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除费用",
            id: "customer_grid_delete",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deleteChargeType(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetChargeTypePageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.chargeTypesPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1,
                        })
                    }
                }
                me.initializeChargeGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeChargeGrid: function(){
        var me = this, selectedChargeType = me.selectedChargeType;
        var __fields = me.chargeTypesPanel.__fields;
        var store = Ext.create("Ext.data.ArrayStore", {
            fields: __fields
        })

        var grid = me.chargeTypesPanel.grid = Ext.create("Ext.grid.Panel", {
            store: store,
            width: "100%",
            height: "100%",
            cls: "iScroll",
            autoScroll: true,
            columnLines: true,
            columns: me.chargeTypesPanel.__columns
        });

        me.chargeTypesPanel.add(grid);
        me.chargeTypesPanel.doLayout();
    },
    selectChargeType: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var config = {
            extend: "Ext.window.Window",
            title: "选择费用",
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

        win.add(Ext.create("Beet.apps.cards.ChargeList", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                me.addChargeType(records);
                win.close();
            }
        }));
        win.doLayout();
    },
    addChargeType: function(records, isRaw){
        var me = this, selectedChargeType = me.selectedChargeType;
        var __fields = me.chargeTypesPanel.__fields;
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var cid, rawData;
            if (isRaw){
                cid = record["CID"];
                rawData = record;
            }else{
                cid = record.get("CID");
                rawData = record.raw;
            }
            if (selectedChargeType[cid] == undefined){
                selectedChargeType[cid] = []
            }else{
                selectedChargeType[cid] = [];
            }
            for (var c = 0; c < __fields.length; ++c){
                var k = __fields[c];
                selectedChargeType[cid].push(rawData[k]);
            }
        }

        me.updateChargeTypePanel();
    },
    deleteChargeType: function(record){
        var me = this, selectedChargeType = me.selectedChargeType;
        var cid = record.get("CID");
        if (selectedChargeType[cid]){
            selectedChargeType[cid] = null;
            delete selectedChargeType[cid];
        }

        me.updateChargeTypePanel();
    },
    updateChargeTypePanel: function(){
        var me = this, selectedChargeType = me.selectedChargeType;
        var grid = me.chargeTypesPanel.grid, store = grid.getStore();
        var __fields = me.chargeTypesPanel.__fields;
        var tmp = []
        me._par.charges = 0;
        me._real.charges = 0;
        for (var c in selectedChargeType){
            var charge = selectedChargeType[c];
            if (!!charge[2]){
                var price = charge[2], r = charge[4];
                me._par.charges += price;//面值
                me._real.charges += price * r;//实耗
            //    me.count.chargesCount = charge[2].replaceAll(",", "") * charge[4];
            }
            tmp.push(selectedChargeType[c]);
        }
        store.loadData(tmp);
        me.onUpdate()
    },
    initializeRebatesPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.rebatesPanel.__columns && me.rebatesPanel.__columns.length > 0){
            return;
        }
        var columns = me.rebatesPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除返利",
            id: "customer_grid_delete",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deleteRebate(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetRebatePageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.rebatesPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1,
                        })
                    }
                }
                me.initializeRebateGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeRebateGrid: function(){
        var me = this, selectedRebates = me.selectedRebates;
        var __fields = me.rebatesPanel.__fields;
        var store = Ext.create("Ext.data.ArrayStore", {
            fields: __fields
        })

        var grid = me.rebatesPanel.grid = Ext.create("Ext.grid.Panel", {
            store: store,
            width: "100%",
            height: "100%",
            cls: "iScroll",
            autoScroll: true,
            columnLines: true,
            columns: me.rebatesPanel.__columns
        });

        me.rebatesPanel.add(grid);
        me.rebatesPanel.doLayout();
    },
    selectRebate: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var config = {
            extend: "Ext.window.Window",
            title: "选择返利",
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

        win.add(Ext.create("Beet.apps.cards.RebateList", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                me.addRebate(records);
                win.close();
            }
        }));
        win.doLayout();
    },
    addRebate: function(records, isRaw){
        var me = this, selectedRebates = me.selectedRebates;
        var __fields = me.rebatesPanel.__fields;
        if (records == undefined){
            return;
        }
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var rid, rawData;
            if (isRaw){
                rid = record["RID"];
                rawData = record;
            }else{
                rid = record.get("RID");
                rawData = record.raw;
            }
            if (selectedRebates[rid] == undefined){
                selectedRebates[rid] = []
            }else{
                selectedRebates[cid] = [];
            }
            //console.log(__fields, rawData)
            for (var c = 0; c < __fields.length; ++c){
                var k = __fields[c];
                selectedRebates[rid].push(rawData[k]);
            }
        }

        me.updateRebatesPanel();
    },
    deleteRebate: function(record){
        var me = this, selectedRebates = me.selectedRebates;
        var rid = record.get("RID");
        if (selectedRebates[rid]){
            selectedRebates[rid] = null;
            delete selectedRebates[rid];
        }

        me.updateRebatesPanel();
    },
    updateRebatesPanel: function(){
        var me = this, selectedRebates = me.selectedRebates;
        var grid = me.rebatesPanel.grid, store = grid.getStore();
        var __fields = me.rebatesPanel.__fields;
        var tmp = []
        //me.count.rebatesCount = 0;
        me._rebateList = [];
        /**
         * 使用公式模式
         * {par} 面值总值
         * {real} 实耗总值
         */
        for (var c in selectedRebates){
            var rebate = selectedRebates[c];
            //value ismoney rater
            var v = rebate[2], ismoney = rebate[3], rater = rebate[8];
            if (ismoney == "True"){
                //面值 - 值
                me._rebateList.push(" - " + v);
            }else{
                if (rater == 0){
                    //面值 - (面值 * v)
                    me._rebateList.push("  - ( {par} * " + v + ")");
                }else{
                    if (rater == 1){
                        // 面值 - (实耗 * v)
                        me._rebateList.push( "  - ( {real} * " + v + ")" );
                    }
                }
            }
            tmp.push(selectedRebates[c]);
        }
        me.onUpdate();
        store.loadData(tmp);
    },

    initializePackagePanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.packagesPanel.__columns && me.packagesPanel.__columns.length > 0){
            return;
        }

        Ext.bind(createPackageCategoryTree, me.packagesPanel)();
        me.packagesPanel.createTreePanel();

        var columns = me.packagesPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除套餐",
            id: "customer_grid_delete",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deletePackage(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetPackagesPageDataToJSON(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.packagesPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1,
                        })
                    }
                }
                me.initializePackageGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializePackageGrid: function(){
        var me = this, selectedPackages = me.selectedPackages;
        var __fields = me.packagesPanel.__fields;
        var store = Ext.create("Ext.data.ArrayStore", {
            fields: __fields
        })

        me.packagesPanel.add(me.packagesPanel.treeList);
        var grid = me.packagesPanel.grid = Ext.create("Ext.grid.Panel", {
            store: store,
            flex: 1,
            height: "100%",
            cls: "iScroll",
            autoScroll: true,
            border: 0,
            columnLines: true,
            columns: me.packagesPanel.__columns
        });

        me.packagesPanel.add(grid);
        me.packagesPanel.doLayout();

        me.packagesPanel.callUpdateMethod = function(height){
            height = height - 55;
            me.packagesPanel.treeList.setHeight(height);
            me.packagesPanel.grid.setHeight(height)
        }
    },
    selectPackage: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var config = {
            extend: "Ext.window.Window",
            title: "选择套餐",
            width: 1100,
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

        win.add(Ext.create("Beet.apps.cards.PackageList", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                var sql = [];
                for (var c = 0; c < records.length; ++c){
                    var record = records[c];
                    sql.push("id=" + record.raw["ID"]);
                    console.log(sql);
                }
                if (sql.length > 0){
                    sql = sql.concat(" OR ");
                    cardServer.GetPackagesPageDataToJSON(0, records.length, sql, {
                        success: function(data){
                            data = Ext.JSON.decode(data)["Data"];
                            me.addPackage(data, true);
                            win.close();
                        },
                        failure: function(error){
                            Ext.Error.raise(error)
                        }
                    })
                }else{
                    win.close();
                }
            },
            height: "100%",
        }));
        win.doLayout();
    },
    addPackage: function(records, isRaw){
        var me = this, selectedPackages = me.selectedPackages;
        var __fields = me.packagesPanel.__fields;
        if (records == undefined){
            return;
        }
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var rid, rawData;
            if (isRaw){
                rid = record["ID"];
                rawData = record;
            }else{
                rid = record.get("ID");
                rawData = record.raw;
            }
            if (selectedPackages[rid] == undefined){
                selectedPackages[rid] = []
            }else{
                selectedPackages[cid] = [];
            }
            for (var c = 0; c < __fields.length; ++c){
                var k = __fields[c];
                selectedPackages[rid].push(rawData[k]);
            }
        }

        me.updatePackagesPanel();
    },
    deletePackage: function(record){
        var me = this, selectedPackages = me.selectedPackages;
        var rid = record.get("ID");
        if (selectedPackages[rid]){
            selectedPackages[rid] = null;
            delete selectedPackages[rid];
        }

        me.updatePackagesPanel();
    },
    updatePackagesPanel: function(){
        var me = this, selectedPackages = me.selectedPackages;
        var grid = me.packagesPanel.grid, store = grid.getStore();
        var __fields = me.packagesPanel.__fields;
        var tmp = []
        //me.count.packagesCount = 0;
        me._par.packages = 0;
        me._real.packages = 0;
        for (var c in selectedPackages){
            var package = selectedPackages[c];
            if (!!package[3]){
                //console.log(package);
                var price = package[2],
                    r = package[3];
                me._par.packages += price * 1;
                me._real.packages += r * 1;
            //    me.count.packagesCount += package[3].replaceAll(",", "") * 1;
            }
            tmp.push(selectedPackages[c]);
        }
        store.loadData(tmp);
        me.onUpdate();
    },
    initializeItemsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
            return;
        }
        
        //add items tree
        Ext.bind(createItemCategoryTree, me.itemsPanel)();
        me.itemsPanel.createTreeList();

        var columns = me.itemsPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除消耗产品",
            id: "customer_grid_delete",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deleteItem(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetItemPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.itemsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        })
                    }
                }
                me.initializeItemsGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeItemsGrid: function(){
        var me = this, selectedItems = me.selectedItems;
        var __fields = me.itemsPanel.__fields;

        if (me.itemsPanel.grid == undefined){
            var store = Ext.create("Ext.data.ArrayStore", {
                fields: __fields
            })

            me.itemsPanel.add(me.itemsPanel.treeList);
            //hook treeList
            //me.itemsPanel.treeItemClick = function(frame, record, item, index, e, options){
            //    if (!record){return;}
            //}
            var grid = me.itemsPanel.grid = Ext.create("Ext.grid.Panel", {
                store: store,
                flex: 1,
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                border: 0,
                columns: me.itemsPanel.__columns    
            });

            me.itemsPanel.add(grid);
            me.itemsPanel.doLayout();
        }

        me.itemsPanel.callUpdateMethod = function(height){
            height = height - 55;
            me.itemsPanel.treeList.setHeight(height);
            me.itemsPanel.grid.setHeight(height)
        }
    },
    selectItems: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var config = {
            extend: "Ext.window.Window",
            title: "选择项目",
            width: 1000,
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

        win.add(Ext.create("Beet.apps.cards.ItemListWindow", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                me.addItems(records);
                win.close();
            }
        }));
        win.doLayout();
    },
    addItems: function(records, isRaw){
        var me = this, selectedItems = me.selectedItems;
        var __fields = me.itemsPanel.__fields;
        if (records == undefined){
            return;
        }
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var id, rawData;
            if (isRaw){
                id = record["IID"];
                rawData = record;
            }else{
                id = record.get("IID");
                rawData = record.raw;
            }
            if (selectedItems[id] == undefined){
                selectedItems[id] = []
            }else{
                selectedItems[id] = [];
            }
            for (var c = 0; c < __fields.length; ++c){
                var k = __fields[c];
                selectedItems[id].push(rawData[k]);
            }
        }
        me.updateItemsPanel();
    },
    deleteItem: function(record){
        var me = this, selectedItems = me.selectedItems;
        var id = record.get("IID");
        if (selectedItems[id]){
            selectedItems[id] = null;
            delete selectedItems[id];
        }

        me.updateItemsPanel();
    },
    updateItemsPanel: function(){
        var me = this, selectedItems = me.selectedItems;
        var grid = me.itemsPanel.grid, store = grid.getStore();
        var tmp = []
        //me.count.itemsCount = 0;
        me._par.items = 0;
        me._real.items = 0;
        for (var c in selectedItems){
            var item = selectedItems[c];
            if (!!item[5]){
                var price = item[3];
                   if (typeof(item[5])=="number"){
                        r=item[5];
                    }
                    if (typeof(item[5])=="string"){
                        r=item[5];
                    }
            //        r = item[5].replaceAll(",", "");

                me._par.items += price * 1;
                me._real.items += r * 1;
            //    me.count.itemsCount += item[5].replaceAll(",", "") * 1;
            }
            tmp.push(selectedItems[c]);
        }
        me.onUpdate();
        store.loadData(tmp);
    },
    initializeProductsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.productsPanel.__columns && me.productsPanel.__columns.length > 0){
            return;
        }
        var columns = me.productsPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            items: [
            ]
        }
        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除消耗产品",
            id: "customer_grid_delete",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deleteProducts(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetItemProductData(-1, {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.productsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        columns.push({
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        })
                    }
                }
                me.initializeProductsGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    initializeProductsGrid: function(){
        var me = this, selectedProducts = me.selectedProducts;
        var __fields = me.productsPanel.__fields;

        if (me.productsPanel.grid == undefined){
            var store = Ext.create("Ext.data.ArrayStore", {
                fields: __fields
            })

            var grid = me.productsPanel.grid = Ext.create("Ext.grid.Panel", {
                store: store,
                width: "100%",
                height: "100%",
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.productsPanel.__columns    
            });

            me.productsPanel.add(grid);
            me.productsPanel.doLayout();
        }
        me.productsPanel.callUpdateMethod = function(height){
            height = height - 55;
            //me.itemsPanel.treeList.setHeight(height);
            me.productsPanel.grid.setHeight(height)
        }
    },
    selectProducts: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var config = {
            extend: "Ext.window.Window",
            title: "选择产品",
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
        win.add(Ext.create("Beet.apps.cards.ProductsList", {
            b_type: "selection",
            b_selectionMode: "MULTI",
            b_selectionCallback: function(records){
                if (records.length == 0){ win.close(); return;}
                me.addProducts(records);
                win.close();
            }
        }));
        win.doLayout();
    },
    addProducts: function(records, isRaw){
        var me = this, selectedProducts = me.selectedProducts;
        var __fields = me.productsPanel.__fields;
        if (records == undefined){return;}
        for (var r = 0; r < records.length; ++r){
            var record = records[r];
            var pid, rawData;
            if (isRaw){
                pid = record["PID"];
                rawData = record;
            }else{
                pid = record.get("PID");
                rawData = record.raw;
            }
            if (selectedProducts[pid] == undefined){
                selectedProducts[pid] = []
            }else{
                selectedProducts[pid] = [];
            }

            for (var c = 0; c < __fields.length; ++c){
                var k = __fields[c];
                selectedProducts[pid].push(rawData[k]);
            }
        }

        me.updateProductsPanel();
    },
    deleteProducts: function(record){
        var me = this, selectedProducts = me.selectedProducts;
        var pid = record.get("PID");
        if (selectedProducts[pid]){
            selectedProducts[pid] = null;
            delete selectedProducts[pid];
        }

        me.updateProductsPanel();
    },
    updateProductsPanel: function(){
        var me = this, selectedProducts = me.selectedProducts;
        var grid = me.productsPanel.grid, store = grid.getStore();
        var tmp = []
        //me.count.productsCount = 0;
        me._par.products = 0;
        me._real.products = 0;
        for (var c in selectedProducts){
            var product = selectedProducts[c];
            if (!!product[4]){
                var price = product[4] * 1;
                me._par.products += price;
                me._real.products += price;
                //me.count.productsCount += product[4].replaceAll(",", "") * 1;
            }
            tmp.push(selectedProducts[c]);
        }
        me.onUpdate();
        store.loadData(tmp);
    },
    onUpdate: function(){
	/*
        var me = this, _par = 0, _real = 0, f = me.form.getForm();
        for (var k in me._par){
            _par += parseFloat(me._par[k]);
        }
        for (var k in me._real){
            _real += parseFloat(me._real[k]);
        }
        //开始计算
        
        _par = parseFloat(_par);
        _real = parseFloat(_real);
        var _rebate = 0;
        if (me._rebateList && me._rebateList.length > 0){
            for (var c = 0; c < me._rebateList.length; ++c){
                var r = me._rebateList[c].replaceAll("{par}", _par).replaceAll("{real}", _real);
                _rebate += eval(r);
            }
        }

        f.setValues({
            "par" : _par + parseFloat(_rebate),
            "price": _real + parseFloat(_rebate)
        })
	*/
    },
    resetAll: function(){
        var me = this;

        me.selectedInterests = {};
        me.selectedChargeType = {};
        me.selectedRebates = {};
        me.selectedPackages = {};
        me.selectedItems = {};
        me.selectedProducts = {};
        me.count = {
            interestsCount : 0,
            chargesCount : 0,
            rebatesCount: 0,
            packagesCount : 0,
            itemsCount: 0,
            productsCount : 0
        }

        me.updateInterestsPanel();
        me.updateChargeTypePanel();
        me.updateRebatesPanel();
        //me.updatePackagesPanel();
        //me.updateItemsPanel();
        //me.updateProductsPanel();
    },
    processData: function(f){
        var me = this, cardServer = Beet.constants.cardServer,
            form = f.up("form").getForm(), results = form.getValues();
        var selectedInterests = me.selectedInterests, selectedChargeType = me.selectedChargeType,
            selectedPackages = me.selectedPackages, selectedRebates = me.selectedRebates,
            selectedItems = me.selectedItems, selectedProducts = me.selectedProducts;

        //name descript products charges
        var interests = Ext.Object.getKeys(selectedInterests),
            charges = Ext.Object.getKeys(selectedChargeType),
            packages = Ext.Object.getKeys(selectedPackages),
            rebates = Ext.Object.getKeys(selectedRebates),
            items = Ext.Object.getKeys(selectedItems),
            products = Ext.Object.getKeys(selectedProducts);
    
        if (interests && interests.length > 0){
            results["interests"] = interests;
        }

        if (charges && charges.length > 0){
            results["charges"] = charges;
        }

        //if (packages && packages.length > 0){
        //    results["packages"] = packages;
        //}

        if (rebates && rebates.length > 0){
            results["rebates"] = rebates;
        }

        //if (items && items.length > 0){
        //    results["items"] = items;
        //}

        //if (products && products.length > 0){
        //    results["products"] = products;
        //}

        if (results["validdatemode"] == 2){
            results["validdatetime"] = ((+new Date(results["validdatetime"])) / 1000)
        }else{
            delete results["validdatetime"];
        }

        cardServer.AddCard(Ext.JSON.encode(results), {
            success: function(pid){
                if (pid == Beet.constants.FAILURE){
                    Ext.MessageBox.alert("添加失败", "添加卡项失败");
                }else{
                    Ext.MessageBox.show({
                        title: "提示",
                        msg: "添加卡项成功!",
                        buttons: Ext.MessageBox.YESNO,
                        fn: function(btn){
                            if (btn == "yes"){
                                form.reset()
                                me.resetAll();
                            }
                        }
                    });
                }
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        })
    }
});
