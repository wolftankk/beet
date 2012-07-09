Beet.registerMenu("cards", "cardAdmin", "卡项管理",
    [
	{
            xtype: "button",
            text: "增加卡项",
	    permission: 1231,
            handler: function(){
                var item = Beet.cache.menus["cards.AddCard"]
                if (!item){
                    Beet.workspace.addPanel("cards.AddCard", "增加卡项", {
                        items: [
                            Ext.create("Beet.apps.cards.AddCard", {
				action: "insert"	
			    })
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
    height: "100%",
    width: "100%",
    autoHeight: true,
    autoScroll:true,
    frame:true,
    border: false,
    bodyBorder: false,
    plain: true,
    action: undefined,//default
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        me.selectedInterests = {};//服务列表
        me.selectedChargeType = {};//费用列表
        me.selectedRebates = {};//返利

        me.childrenList = [];
	
        //面值
        me._par = {};
        //实耗
        me._real = {};

        me.queue = new Beet_Queue("addcard");

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

        //选择列表
        me.childrenList = [
            me.interestsPanel,
            me.chargeTypesPanel,
            me.rebatesPanel
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
                                            fieldLabel: "保值金额",
                                            allowBlank: false,
                                            name: "insure"
                                        },
                                        {
                                            fieldLabel: "面值金额",
                                            allowBlank: false,
                                            name: "par"
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
                                            text: "保存",
                                            xtype: "button",
					    hidden: (me.action == undefined),
                                            height: 30,
					    width: 150,
                                            border: 1,
                                            formBind: true,
                                            disabled: true,
                                            style: {
                                                borderColor: "#99BBE8",
						margin: "20px 0 0 40px"
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
            ]
        };
        var form = Ext.widget("form", config);
	form.on({
	    "afterrender" : function(){
		me.interestsPanel.expand();
	    }
	})
        me.form = form;
        me.add(form);
        me.doLayout();

        //update panel
	me.queue.Add("initInterspanel", function(){
	    me.initializeInterestsPanel();
	});
	me.queue.Add("initChargepanel", function(){
	    me.initializeChargeTypePanel();
	});
	me.queue.Add("initRebatespanel", function(){
	    me.initializeRebatesPanel();
	})
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

	me.queue.triggle("initInterspanel", "success");
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

	me.queue.triggle("initChargepanel", "success");
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
                        var column = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1,
                        }

			switch (meta["FieldName"]){
			    case "IsMoney":
				column.xtype = "booleancolumn"
				column.trueText = "是";
				column.falseText = "否";
			}

			columns.push(column);
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

	me.queue.triggle("initRebatespanel", "success");
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
    },
    //@public
    restoreFromData: function(record, detailData){
	var me = this;
	me.queue.Add("restoreData", "initInterspanel,initRebatespanel,initChargepanel", function(){
	    me._restoreFromData(record, detailData);
	})
    },
    //@private
    _restoreFromData: function(record, detailData){
        var me = this, cardServer = Beet.constants.cardServer;
        me.resetAll();
	
	var rawData;
	if (record.get == undefined && typeof(record.get) != "function"){
	    rawData = record
	}else{
	    rawData = record.raw;
	}
        var cardId = rawData["ID"];
        me.selectedCardId = cardId;
        
	var form = me.form.getForm();
        form.setValues({
            name:	    rawData["Name"],
            par:	    rawData["Par"],
            level:	    rawData["Level"],
            insure:	    rawData["Insure"],
            validdate:	    rawData["ValidDate"],
            validunit:	    parseInt(rawData["ValidUnit"]),
            descript:	    rawData["Descript"],
            code:	    rawData["Code"],
	    validdatemode:  rawData["ValidDateMode"]
        });

        var charges = detailData["charges"],
            interests = detailData["interests"],
            packages = detailData["packages"],
            rebates = detailData["rebates"],
            items = detailData["items"],
            products = detailData["products"];

        me.queue.Add("updatecharges", function(){
            if (charges && charges.length > 0){
                var sql = [];
                for (var c = 0; c < charges.length; ++c){
                    sql.push("cid=" + charges[c]);
                }
                var s = sql.join(" OR ");
                if (s.length > 0){
                    cardServer.GetChargeTypePageData(1, charges.length, s, {
                        success: function(data){
                            var data = Ext.JSON.decode(data)["Data"];
                            me.addChargeType(data, true);
                            me.queue.triggle("updatecharges", "success");
                        },
                        failure: function(error){
                            Ext.Error.raise(error);
                        }
                    })
                }
            }else{
                me.queue.triggle("updatecharges", "success");
            }
        });

        if (interests && interests.length > 0){
            var sql = [];
            for (var c = 0; c < interests.length; ++c){
                sql.push("id=" + interests[c]);
            }
            var s = sql.join(" OR ");
            if (s.length > 0){
                cardServer.GetInterestsPageData(1, interests.length, s, {
                    success: function(data){
                        var data = Ext.JSON.decode(data)["Data"];
                        me.addInterest(data, true);
                    },
                    failure: function(error){
                        Ext.Error.raise(error);
                    }
                })
            }
        }

        me.queue.Add("updaterebates", function(){
            if (rebates && rebates.length > 0){
                var sql = [];
                for (var c = 0; c < rebates.length; ++c){
                    sql.push("rid=" + rebates[c]);
                }
                var s = sql.join(" OR ");
                if (s.length > 0){
                    cardServer.GetRebatePageData(1, rebates.length, s, {
                        success: function(data){
                            var data = Ext.JSON.decode(data)["Data"];
                            me.addRebate(data, true);
                            me.queue.triggle("updaterebates", "success");
                        },
                        failure: function(error){
                            Ext.Error.raise(error);
                        }
                    })
                }
            }else{
                me.queue.triggle("updaterebates", "success");
            }
        });
        me.queue.Add("resetpar", "updatecharges,updaterebates", function(){
	    form.setValues({
		par: rawData["Par"]
	    });
	    me.queue.triggle("resetpar", "success");
        })
    },
    processData: function(f){
        var me = this, cardServer = Beet.constants.cardServer,
            form = f.up("form").getForm(), results = form.getValues();
        var selectedInterests = me.selectedInterests, selectedChargeType = me.selectedChargeType,
            selectedRebates = me.selectedRebates;

        //name descript products charges
        var interests = Ext.Object.getKeys(selectedInterests),
            charges = Ext.Object.getKeys(selectedChargeType),
            rebates = Ext.Object.getKeys(selectedRebates);
    
        if (interests && interests.length > 0){
            results["interests"] = interests;
        }

        if (charges && charges.length > 0){
            results["charges"] = charges;
        }

        if (rebates && rebates.length > 0){
            results["rebates"] = rebates;
        }

        if (results["validdatemode"] == 2){
            results["validdatetime"] = ((+new Date(results["validdatetime"])) / 1000)
        }else{
            delete results["validdatetime"];
        }
	
	if (me.action == "insert"){
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
	}else{
	    if (me.action == "update"){
		if (!me.selectedCardId){
		    Ext.Error.raise("卡项ID无效!");
		    return;
		}
		results["id"] = me.selectedCardId;
		cardServer.UpdateCard(Ext.JSON.encode(results), {
		    success: function(succ){
			if (succ){
			    Ext.MessageBox.show({
				title: "提示",
				msg: "更新卡项成功!",
				buttons: Ext.MessageBox.OK,
				fn: function(btn){
				    form.reset()
				    me.resetAll();
				    if (me.b_callback){
					me.b_callback();
				    }
				}
			    });
			}else{
			    Ext.Msg.alert("更新失败", "更新卡项失败");
			}
		    },
		    failure: function(error){
			Ext.Error.raise(error);
		    }
		})
	    }
	}
    }
});
