registerMenu("settings", "cardAdmin", "产品管理",
    [
	{
	    text: "套餐设置",
	    handler: function(){
		var item = Beet.cache.menus["cards.PackageList"]
		if (!item){
		    Beet.workspace.addPanel("cards.PackageList", "套餐设置", {
			items: [
			    Ext.create("Beet.apps.cards.PackageList")
			]
		    })
		}else{
		    Beet.workspace.workspace.setActiveTab(item);
		}
	    }
	},
    ]
);

Ext.define("Beet.apps.cards.PackageProfile", {
    extend: "Ext.form.Panel",
    height: "100%",
    width: "100%",
    autoWidth: true,
    autoHeight: true,
    autoScroll: true,
    frame: true,
    border: false,
    bodyBorder: false,    
    b_mode: "view",//设置使用模式, view, add, edit,
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        me.selectedPackageId = 0;
        me.selectedProducts = {};
        me.selectedItems = {};
        me.packageList= {};//save store fields columns and grid
        me.packageList.cache = {};//cache itemdata
        me.queue = new Beet_Queue("package_profile-" + Math.random());

        if (me.b_mode == "view" || me.b_mode == "edit"){
            if (me.b_profileData == undefined){
                Ext.Error.raise("请提供套餐数据!");
                return;
            }

            me.queue.Add("addData", "initMainPanel,initProducts,initItems", function(){
                var record = me.b_profileData;
                me.onSelectItem(record.get("ID"), record)
                me.queue.trigger("addData", "success")
            })
        }

        me.callParent();

        me.queue.Add("initMainPanel", function(){
            me.createMainPanel();
        });
    },
    onSelectItem: function(pid, record){
        var me = this, cardServer = Beet.constants.cardServer;
        me.resetAll();

        me.selectedPackageId = pid;

        if (pid <= 0){
            Ext.Msg.alert("错误", "项目ID非法!");
            return;
        }

        cardServer.GetPackagesPageDataToJSON(0, 1, "ID=" + pid, {
            success: function(data){
                data = Ext.JSON.decode(data);
                data = data["Data"];
                if (data && data.length > 0){
                    data = data[0];
                    me.form.getForm().setValues({
                        name:                data["Name"],
                        price:                data["PPrice"],
                        //rate:                data["PRate"],
                        //realprice:        data["PRealPrice"],
                        descript:        data["Descript"],
                        _packageName: data["PCategoryName"]
                    });
                    me.selectedPackageCategoryId = data["PCategoryID"];
        
                    cardServer.GetPackagesItems(pid, {
                        success: function(data){
                            data = Ext.JSON.decode(data)["items"];
                            var sql = [];
                            for (var c = 0; c < data.length; ++c){
                                sql.push("iid=" + data[c]);
                            }
                            var s = sql.join(" OR ");
                            if (s.length > 0){
                                cardServer.GetItemPageData(1, 1000000, s, {
                                    success: function(data){
                                        var data = Ext.JSON.decode(data)["Data"];
                                        me.addItems(data, true);
                                        me.itemsPanel.expand();
                                    },
                                    failure: function(error){
                                        Ext.Error.raise(error)
                                    }
                                });
                            }
                        },
                        failure: function(error){
                            Ext.Error.raise(error);
                        }
                    });

                    cardServer.GetPackageProducts(pid, {
                        success: function(data){
                            data = Ext.JSON.decode(data)["products"];
                            var sql = [];
                            for (var c = 0; c < data.length; ++c){
                                sql.push("pid=" + data[c]);
                            }
                            var s = sql.join(" OR ");
                            if (s.length > 0){
                                cardServer.GetProductPageData(1, data.length, s, {
                                    success: function(data){
                                        var data = Ext.JSON.decode(data)["Data"];
                                        me.addProducts(data, true);
                                        //me.productsPanel.expand();
                                    },
                                    failure: function(error){
                                        Ext.Error.raise(error)
                                    }
                                });
                            }
                        },
                        failure: function(error){
                            Ext.Error.raise(error)
                        }
                    });
                }else{
                    return;
                }
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        })
    },
    createMainPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        Ext.bind(createPackageCategoryTree, me)();
        me.createTreePanel();
        var options = {
            autoScroll: true,
            height: 300,
            width: "100%",
            cls: "iScroll",
            collapsible: true,
            collapsed: true,
            border: true,
            plain: true,
            bodyStyle: "background-color: #dfe8f5",
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
                        p.setHeight(300);//reset && update
                    }
                }
            }
        }

        me.itemsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "项目列表",
            tbar: [
                (function(){
                    if (me.b_mode != "view"){
                        return {
                            xtype: "button",
                            text: "绑定项目",
                            handler: function(){
                                me.selectItems();
                            }
                        }
                    }
                })()
            ]    
        }));

        me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "产品列表",
            tbar: [
                (function(){
                    if (me.b_mode != "view"){
                        return {
                            xtype: "button",
                            text: "绑定产品",
                            handler: function(){
                                me.selectProducts();
                            }
                        }
                    }
                })()
            ]
        }));

        me.childrenList = [
            me.itemsPanel,
            me.productsPanel
        ]
        
        var config = {
            autoHeight: true,
            autoScroll: true,
            cls: "iScroll",
            height: me.height,
            width: me.width,
            anchor: "fit",    
            border: false,
            bodyBorder: false,
            plain: true,
            bodyStyle: "background-color: #dfe8f5",
            items: [
                {
                    layout: {
                        type: "hbox",
                        align: "stretch"
                    },
                    height: "100%",
                    autoHeight: true,
                    autoScroll: true,
                    bodyStyle: "background-color: #dfe8f5",
                    defaults: {
                        border: false,
                        bodyStyle: "background-color: #dfe8f5"
                    },
                    items:[
                        me.treeList,//category tree list
                        {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            bodyStyle: "background-color: #dfe8f5",
                            height: "100%",
                            flex: 2,
                            items: [
                                {
                                    layout: {
                                        type: "table",
                                        columns: 3,
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
                                        margin: "5 0 0 5",
                                        listeners: {
                                            scope: me,
                                            blur: function(){
                                                me.onUpdateForm();
                                            }
                                        }
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
                                            fieldLabel: "总价",
                                            allowBlank: false,
                                            name: "price"
                                        },
					/*
                                        {
                                            fieldLabel: "折扣",
                                            allowBlank: false,
                                            name: "rate",
                                            value: 1.00
                                        },
                                        {
                                            fieldLabel: "套餐售价",
                                            allowBlank: false,
                                            name: "realprice",
                                            listeners: {
                                                scope: me,
                                                blur: function(){
                                                    me.onUpdateForm(true);
                                                }
                                            }
                                        },
					*/
                                        {
                                            xtype: "combobox",
                                            fieldLabel: "所属分类",
                                            store:new Ext.data.SimpleStore({fields:[],data:[[]]}),   
                                            editable:false, 
                                            name: "_packageName",
                                            mode: 'local',   
                                            triggerAction:'all',   
                                            maxHeight: 200,   
                                            tpl: "<tpl for='.'><div style='height:200px'><div id='innerTree'></div></div></tpl>",   
                                            selectedClass:'',   
                                            onSelect:Ext.emptyFn,
                                            listeners: {
                                                expand: function(f){
                                                    var that = this;
                                                    f.setValue = function(value){
                                                        var that = this, inputId = f.getInputId(), inputEl = that.inputEl;
                                                        inputEl.dom.value = value
                                                    }
                                                    if (!me.innerTreeList){
                                                        var store = f.store = Ext.create("Beet.apps.cards.PackagesCatgoryTreeStore", {
                                                            autoLoad: false    
                                                        })
                                                        me.innerTreeList = new Ext.tree.TreePanel({
                                                            store: store,
                                                            layout: "fit",
                                                            bodyStyle: "background-color: #fff",
                                                            frame: false,
                                                            lookMask: true,
                                                            cls: "iScroll",
                                                            border: 0,
                                                            autoScroll: true,
                                                            height: 200,
                                                            useArrow: true,
                                                            split: true,
                                                            listeners: {
                                                                itemclick: function(grid, record){
                                                                    //首先要获取原始的数据
                                                                    //console.log("itemClick", record)
                                                                    me.selectedPackages = [
                                                                        record
                                                                    ];
                                                                    me.selectedPackageCategoryId = record.get("id");
                                                                    //f.value = record.raw["name"];
                                                                    f.setValue(record.get("text") || record.raw["name"])
                                                                }
                                                            }
                                                        });
                                                    };
                                                    setTimeout(function(){
                                                        me.innerTreeList.render("innerTree")
                                                    }, 500);
                                                }
                                            }
                                        },
                                        //{
                                        //    xtype: "component",
                                        //    width: 5
                                        //},
                                        {
                                            fieldLabel: "注释",
                                            colspan: 3,
                                            width: 600,
                                            height: 40,
                                            allowBlank: true,
                                            name: "descript"
                                        }    
                                    ]
                                },
                                {
                                    type: "fit",
                                    autoScroll: true,
                                    autoHeight: true,
                                    border: false,
                                    bodyStyle: "background-color: #dfe8f5;margin-top: 10px",
                                    height: Beet.constants.VIEWPORT_HEIGHT - 95,
                                    width: 830,
                                    items: me.childrenList, 
                                    bbar:[
                                        "->",
                                        (function(){
                                                if (me.b_mode == "add"){
                                                    return {
                                                        text: "新增",
                                                        xtype: "button",
                                                        name: "packageNewBtn",
                                                        border: 1,
                                                        width: 200,
                                                        style: {
                                                            borderColor: "#99BBE8"
                                                        },
                                                        bodyStyle: "background-color: #dfe8f5",
                                                        handler: function(){
                                                            me.processData(this, "add");
                                                        }
                                                        }
                                                }else{
                                                    return {
                                                        text: "编辑",
                                                        xtype: "button",
                                                        name: "packageEditBtn",
                                                        border: 1,
                                                        width: 200,
                                                        style: {
                                                            borderColor: "#99BBE8"
                                                        },
                                                        bodyStyle: "background-color: #dfe8f5",
                                                        handler: function(){
                                                            me.processData(this, "edit");
                                                        }
                                                    }
                                                }
                                            }
                                        )()
                                    ]
                                }
                            ],
                        },
                    ]
                }
            ],
        };
        var form = Ext.widget("form", config);
        me.form = form;
        me.add(form);
        me.doLayout();

        me.queue.trigger("initMainPanel", "success");

        me.queue.Add("initItems",function(){
            me.initializeItemsPanel();
        });

        me.queue.Add("initProducts", function(){
            me.initializeProductsPanel();
        })

    },
    initializeItemsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
            return;
        }
        var columns = me.itemsPanel.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 30,
            header: "操作",
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

        if (me.b_mode != "view"){
            columns.push(_actions);
        }
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

            var grid = me.itemsPanel.grid = Ext.create("Ext.grid.Panel", {
                store: store,
                height: 245,
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.itemsPanel.__columns    
            });

            me.itemsPanel.add(grid);
            me.itemsPanel.doLayout();
        }
        me.queue.trigger("initItems", "success")
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

        win.add(Ext.create("Beet.apps.cards.ItemList", {
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
        for (var c in selectedItems){
            tmp.push(selectedItems[c]);
        }
        store.loadData(tmp);
        if (me.b_mode != "view"){
            me.onUpdateForm();
        }
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
            header: "操作",
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

        if (me.b_mode != "view"){
            columns.push(_actions);
        }
        cardServer.GetPackageProductData(1,{
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.productsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        var c = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        }
                        if (meta["FieldName"] == "COUNT" || meta["FieldName"] == "PRICE"){
                            c.editor = {
                                xtype: "numberfield",
                                allowBlank: false,
                                type: "float"
                            }
                        }
                        columns.push(c)
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
                height: 245,
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.productsPanel.__columns,
                //plugins: [
                //    (function(){
                //        if (me.b_mode != "view"){
                //            Ext.create('Ext.grid.plugin.CellEditing', {
                //                clicksToEdit: 1,
                //                // cell edit event
                //                listeners: {
                //                    "edit" : function(editor, e, opts){
                //                        // fire event when cell edit complete
                //                        var currField = e.field, currColIdx = e.colIdx, currRowIdx = e.rowIndex;
                //                        var currRecord = e.record;
                //                        var currPrice = currRecord.get("PRICE");
                //                        if (currField == "COUNT"){
                //                            //check field "PRICE" that it exists val?
                //                            var price = currRecord.get("PPrice"), count = currRecord.get("COUNT");
                //                            if (price){ price = parseFloat(price.replaceAll(",", "")); }
                //                            currRecord.set("PRICE", Ext.Number.toFixed(price * count, 2));
                //                            currRecord.set("COUNT", Ext.Number.toFixed(count, 6));

                //                            me.onUpdateForm();    
                //                        }else{
                //                            if (currField == "PRICE" && currPrice && currPrice > 0){
                //                                me.onUpdateForm();    
                //                            }
                //                        }
                //                    }
                //                }
                //            })
                //        }
                //    })()
                //],
                selType: 'cellmodel'
            });

            me.productsPanel.add(grid);
            me.productsPanel.doLayout();
        }
        me.queue.trigger("initProducts", "success")
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
        for (var c in selectedProducts){
            tmp.push(selectedProducts[c]);
        }
        store.loadData(tmp);
        if (me.b_mode != "view"){
            me.onUpdateForm();
        }
    },
    //自动计算部分代码
    onUpdateForm: function(force){
        //var me = this, form = me.form.getForm(), values = form.getValues();
        //if (me.b_mode == "view"){
        //    return
        //}
        //var sale = values["rate"], price = values["price"], realprice = values["realprice"];
        //var selectedProducts = me.selectedProducts, selectedItems = me.selectedItems;
        //if (price == '' || price == undefined || price == 0 ){
        //var __price = 0;//每次都会进行重新计算
        //if (selectedProducts && Ext.Object.getKeys(selectedProducts).length > 0){
        //    var productstore = me.productsPanel.grid.getStore();
        //    for (var c = 0; c < productstore.getCount(); ++c){
        //        var data = productstore.getAt(c);
        //        var count = data.get("COUNT"), price = data.get("PRICE");
        //        if (count != undefined && price != undefined){
        //            __price += parseFloat(price);
        //        }
        //    }
        //}

        //if (selectedItems && Ext.Object.getKeys(selectedItems).length> 0){
        //    for (var c in selectedItems){
        //        var p = selectedItems[c];
        //        //console.log(p)
        //        __price += parseFloat((""+p[3]).replaceAll(",", ""), 2)
        //    }
        //}
        //price = __price;

        //form.setValues({
        //    price: price    
        //})
        //}
        //if (price <= 0 ) { return; }    
        //if (force) {
        //    sale = realprice / price;
        //}else{
        //    realprice = price * sale;
        //}

        //form.setValues({
        //    rate: parseFloat(sale).toFixed(2),
        //    realprice: parseFloat(realprice).toFixed(2),
        //});
    },

    resetAll: function(){
        var me = this;
        me.selectedItems = {};
        me.selectedProducts = {};
        me.selectedPackages = {};

        me.selectedPackageId= 0;
        me.selectedPackageIndex = 0;

        me.form.getForm().reset();

        //var editBtn = me.form.down("button[name=packageEditBtn]"),
        //    addBtn = me.form.down("button[name=packageNewBtn]");

        //if (editBtn){
        //    editBtn.disable();
        //}

        //if (addBtn){
        //    addBtn.disable();
        //}

        me.updateItemsPanel();
        me.updateProductsPanel();
        
    },
    ///**
    // * @description 处理所提交的数据
    // *
    // * @param action String 需要处理的动作(add, edit)
    // */
    processData: function(f, action){
        var me = this, cardServer = Beet.constants.cardServer;
        //me.onUpdateForm();
        var form = f.up("form").getForm(), result = form.getValues();

        var selectedItems = me.selectedItems;
        //name descript products charges
        var items = Ext.Object.getKeys(selectedItems);
        if (items && items.length > 0){
            result["items"] = items;
        }
    
        var selectedProducts = me.selectedProducts;
        var products = Ext.Object.getKeys(selectedProducts);
        if (products && products.length > 0){
            result["products"] = products;
        }

        if (me.selectedPackageCategoryId){
            result["categoryid"] = me.selectedPackageCategoryId;
        }
        var selectedPackages = me.selectedPackages;
        if (selectedPackages && selectedPackages.length > 0){
            result["categoryid"] = selectedPackages.shift().get("id");
        }

        if (action == "edit"){
            if (me.selectedPackageId< 0){
                Ext.MessageBox.alert("oops", "没有套餐ID, 无法更新");
                return;
            }
            result["id"] = me.selectedPackageId;
        }
        
        console.log(result)
        if (action == "add"){
            cardServer.AddPackage(Ext.JSON.encode(result), {
                success: function(pid){
                    if (pid > 0){
                        Ext.MessageBox.show({
                            title: "提示",
                            msg: "添加套餐成功!",
                            buttons: Ext.MessageBox.YESNO,
                            fn: function(btn){
                                if (btn == "yes"){
                                //    me.resetAll();
                                //}else{
                                    if (me.callback){
                                        me.callback();
                                    }
                                }
                            }
                        });
                    }else{
                        Ext.MessageBox.alert("失败", "添加套餐失败!");
                    }
                },
                failure: function(error){
                    Ext.Error.raise(error);
                }
            });
        }else{
            if (action == "edit"){
                cardServer.UpdatePackage(Ext.JSON.encode(result), {
                    success: function(succ){
                        if (succ){
                            Ext.MessageBox.show({
                                title: "提示",
                                msg: "更新项目成功!",
                                buttons: Ext.MessageBox.OK,
                                fn: function(btn){
                                    if (me.callback){
                                        me.callback();
                                    }
                                }
                            });
                        }else{
                            Ext.Msg.alert("警告", "更新产品失败!!");
                        }
                    },
                    failure: function(error){
                        Ext.Error.raise(error);
                    }
                })
            }
        }

    }
})

Ext.define("Beet.apps.cards.PackageList", {
    extend: "Ext.panel.Panel",
    autoHeight: true,
    autoScroll:true,
    border: false,
    frame: true,
    height: Beet.constants.VIEWPORT_HEIGHT - 5,
    width: "100%",
    bodyPadding: 0,
    bodyBorder: false,
    plain: true,
    b_filter: "",
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;

        me.selectedItems = {};
        me.selectedProducts = {};
        me.selectedPackages = [];

        me.packageList = {}

        me.selectedPackageId= 0;
        me.selectedPackageIndex = 0;

        me.callParent()    

        me.buildStoreAndModel();
    },
    buildStoreAndModel: function(){
        var me = this, cardServer = Beet.constants.cardServer;

        Ext.bind(createPackageCategoryTree, me)();
        me.createTreePanel();//category

        var me = this, cardServer = Beet.constants.cardServer;
        var columns = me.packageList.__columns = [];
        var _actions = {
            xtype: 'actioncolumn',
            width: 50,
            items: [
            ]
        }

        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/edit.png",
            tooltip: "编辑项目",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.editPackage(d);
            }
        }, "-");

        _actions.items.push("-",{
            icon: "./resources/themes/images/fam/delete.gif",
            tooltip: "删除项目",
            handler: function(grid, rowIndex, colIndex){
                var d = grid.store.getAt(rowIndex)
                me.deletePackage(d);
            }
        }, "-");

        columns.push(_actions);
        cardServer.GetPackagesPageDataToJSON(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.packageList.__fields = [];
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

                if (!Beet.apps.cards.PackagesModel){
                    Ext.define("Beet.apps.cards.PackagesModel", {
                        extend: "Ext.data.Model",
                        fields: fields
                    });
                }

                if (!Beet.apps.cards.PackagesStore){
                    Ext.define("Beet.apps.cards.PackagesStore", {
                        extend: "Ext.data.Store",
                        model: Beet.apps.cards.PackagesModel,
                        autoLoad: true,
                        pageSize: Beet.constants.PageSize,
                        load: function(options){
                            var that = this, options = options || {};
                            if (Ext.isFunction(options)){
                                options = {
                                    callback: options
                                };
                            }

                            Ext.applyIf(options, {
                                groupers: that.groupers.items,
                                page: that.currentPage,
                                start: (that.currentPage - 1) * Beet.constants.PageSize || 0,
                                limit: Beet.constants.PageSize,
                                addRecords: false
                            });
                            
                            that.proxy.b_params["start"] = options["start"];
                            that.proxy.b_params["limit"] = options["limit"];

                            return that.callParent([options]);
                        }
                    });
                }

                me.initializePackageGrid();
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    updateProxy: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        return {
            type: "b_proxy",
            b_method: cardServer.GetPackagesPageDataToJSON,
            startParam: "start",
            limitParam: "limit",
            b_params: {
                "awhere" : me.b_filter
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        }
    },
    initializePackageGrid: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var __fields = me.packageList.__fields;

        var store = me.packageList.store = Ext.create("Beet.apps.cards.PackagesStore");
        store.setProxy(me.updateProxy());
        var grid;
        var sm = Ext.create("Ext.selection.CheckboxModel", {
            mode: "MULTI",
            listeners: {
                selectionchange: function(){
                    //Ext.bind(me.updateButtonState, grid)(grid.getView());
                },
            }
        });

        grid = me.packageList.grid = Ext.create("Beet.plugins.LiveSearch", {
            autoHeight: true,
            height: 480,
            minHeight: 200,
            selModel: sm,
            title: "套餐列表",
            cls:"iScroll",
            autoScroll: true,
            border: true,
            plain: true,
            flex: 1,
            store: store,
            columnLines: true,
            columns: me.packageList.__columns,
            tbar: [
                "-",
                {
                    text: "高级搜索",
                    xtype: "button",
                    handler: function(){
                        cardServer.GetPackagesPageDataToJSON(0, 1, "", {
                            success: function(data){
                                var win = Ext.create("Beet.apps.AdvanceSearch", {
                                    searchData: Ext.JSON.decode(data),
                                    b_callback: function(where){
                                        me.b_filter = where;
                                        me.packageList.store.setProxy({
                                            type: "b_proxy",
                                            b_method: cardServer.GetPackagesPageDataToJSON,
                                            startParam: "start",
                                            limitParam: "limit",
                                            b_params: {
                                                "awhere" : me.b_filter
                                            },
                                            b_scope: Beet.constants.cardServer,
                                            reader: {
                                                type: "json",
                                                root: "Data",
                                                totalProperty: "TotalCount"
                                            }
                                        })
                                        me.packageList.store.loadPage(1);
                                    }
                                });
                                win.show();
                            },
                            failure: function(error){
                                Ext.Error.raise(error);
                            }
                        });
                    }
                },
                {
                    xtype: "button",
                    border: 1,
                    style: {
                        borderColor: "#99BBE8"
                    },
                    text: "增加套餐",
                    handler: function(){
                        me.addPackageWindow();
                    },
                },
                "-",
            ],
            bbar: Ext.create("Ext.PagingToolbar", {
                store: store,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1} 到 {2}',
                emptyMsg: "没有数据"
            }),
            listeners: {
                itemdblclick: function(grid, record, item, index, e){
                    me.onSelectItem(record.get("ID"), record);    
                }
            }
        });

        me.createMainPanel();
    },
    filterProducts: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        me.packageList.store.setProxy({
            type: "b_proxy",
            b_method: cardServer.GetPackagesPageDataToJSON,
            startParam: "start",
            limitParam: "limit",
            b_params: {
                "awhere" : me.b_filter
            },
            b_scope: Beet.constants.cardServer,
            reader: {
                type: "json",
                root: "Data",
                totalProperty: "TotalCount"
            }
        });

        me.packageList.store.loadPage(1);
    },
    createMainPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        var options = {
            autoScroll: true,
            height: 300,
            width: "100%",
            cls: "iScroll",
            collapsible: true,
            collapsed: true,
            border: true,
            plain: true,
            bodyStyle: "background-color: #dfe8f5",
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
                        p.setHeight(300);//reset && update
                    }
                }
            }
        }

        me.itemsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "项目列表",
        }));

        me.productsPanel = Ext.widget("panel", Ext.apply(options, {
            title: "产品列表",
        }));

        me.childrenList = [
            me.itemsPanel,
            me.productsPanel
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
            bodyStyle: "background-color: #dfe8f5",
            items: [
                {
                    layout: {
                        type: "hbox",
                        align: "stretch"
                    },
                    height: "100%",
                    autoHeight: true,
                    autoScroll: true,
                    bodyStyle: "background-color: #dfe8f5",
                    defaults: {
                        border: false,
                        bodyStyle: "background-color: #dfe8f5"
                    },
                    items:[
                        me.treeList,//category tree list
                        {
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            bodyPadding: "0 0 0 5",
                            height: "100%",
                            flex: 2,
                            items: [
                                me.packageList.grid,
                                me.itemsPanel,
                                me.productsPanel
                            ]
                        },
                    ]
                }
            ],
            bbar: [
                "->",
                {
                        xtype: "button",
                        text: "确定",
                        hidden: (me.b_type != "selection"),
                        handler: function(){
                            if (me.b_selectionCallback){
                                me.b_selectionCallback(me.packageList.grid.selModel.getSelection());
                            }
                        },
                },
                {
                        xtype: "button",
                        text: "取消",
                        hidden: (me.b_type != "selection"),
                        handler: function(){
                            if (me.b_selectionCallback){
                                me.b_selectionCallback([])
                            }
                        },
                }
                
            ]
        };
        var panel = Ext.widget("form", config);
        me.add(panel);
        me.doLayout();

        me.initializeItemsPanel();
        me.initializeProductsPanel();
    },

    //打开增加/编辑套餐窗口
    addPackageWindow: function(){
        var me = this;
        var win = Ext.create("Ext.window.Window", {
            width: 1100,
            height: 600,
            autoScroll: true,
            autoHeight: true,
            layout: "fit",
            border: false,
            title: "新增项目"
        })

        win.add(Ext.create("Beet.apps.cards.PackageProfile", {
            b_mode: "add",
            callback: function(){
                win.close();
                me.packageList.store.loadPage(me.itemList.store.currentPage)
            }
        }))

        win.show();
    },
    deletePackage: function(record){
        var me = this, cardServer = Beet.constants.cardServer;
        var itemId = record.get("ID") || record.raw["id"], itemName = record.get("Name") || record.raw["name"];
        if (itemId){
            Ext.MessageBox.show({
                title: "删除套餐",
                msg: "是否要删除 " + itemName + " ?",
                buttons: Ext.MessageBox.YESNO,
                fn: function(btn){
                    if (btn == "yes"){
                        cardServer.DeletePackage(itemId, {
                            success: function(){
                                Ext.MessageBox.show({
                                    title: "删除成功",
                                    msg: "删除套餐: " + itemName + " 成功",
                                    buttons: Ext.MessageBox.OK,
                                    fn: function(){
                                        me.packageList.store.loadPage(me.packageList.store.currentPage);
                                    }
                                })
                            },
                            failure: function(error){
                                Ext.Error.raise(error);
                            }
                        })
                    }
                }
            });
        
        }else{
            Ext.Error.raise("删除套餐失败");
        }
    },
    editPackage: function(record){
        var me = this;
        var pid = record.get("ID");
        if (pid == -1){
            Ext.Error.raise("非法ID, 无法编辑");
            return;
        }
        var win = Ext.create("Ext.window.Window", {
            width: 1100,
            height: 600,
            autoScroll: true,
            autoHeight: true,
            layout: "fit",
            border: false,
            title: "编辑项目"
        })

        win.add(Ext.create("Beet.apps.cards.PackageProfile", {
            b_mode: "edit",
            b_profileData: record,
            callback: function(){
                win.close();
                me.packageList.store.loadPage(me.itemList.store.currentPage)
            }
        }))

        win.show();
    },
    
    initializeItemsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.itemsPanel.__columns && me.itemsPanel.__columns.length > 0){
            return;
        }
        var columns = me.itemsPanel.__columns = [];

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

            var grid = me.itemsPanel.grid = Ext.create("Ext.grid.Panel", {
                store: store,
                height: 245,
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.itemsPanel.__columns    
            });

            me.itemsPanel.add(grid);
            me.itemsPanel.doLayout();
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

        win.add(Ext.create("Beet.apps.cards.ItemList", {
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
        for (var c in selectedItems){
            tmp.push(selectedItems[c]);
        }
        store.loadData(tmp);
    },

    initializeProductsPanel: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.productsPanel.__columns && me.productsPanel.__columns.length > 0){
            return;
        }
        var columns = me.productsPanel.__columns = [];

        cardServer.GetPackageProductData(1,{
            success: function(data){
                var data = Ext.JSON.decode(data)["MetaData"];
                var fields = me.productsPanel.__fields = [];
                for (var c in data){
                    var meta = data[c];
                    fields.push(meta["FieldName"])
                    if (!meta["FieldHidden"]){
                        var c = {
                            dataIndex: meta["FieldName"],
                            header: meta["FieldLabel"],
                            flex: 1
                        }
                        if (meta["FieldName"] == "COUNT" || meta["FieldName"] == "PRICE"){
                            c.editor = {
                                xtype: "numberfield",
                                allowBlank: false,
                                type: "float"
                            }
                        }
                        columns.push(c)
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
                height: 245,
                cls: "iScroll",
                autoScroll: true,
                columnLines: true,
                columns: me.productsPanel.__columns,
                selType: 'cellmodel'
            });

            me.productsPanel.add(grid);
            me.productsPanel.doLayout();
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
        for (var c in selectedProducts){
            tmp.push(selectedProducts[c]);
        }
        store.loadData(tmp);
    },
    resetAll: function(){
        var me = this;
        me.selectedItems = {};
        me.selectedProducts = {};
        me.selectedPackages = {};

        me.selectedPackageId= 0;
        me.selectedPackageIndex = 0;

        //me.form.getForm().reset();

        me.updateItemsPanel();
        me.updateProductsPanel();
        
    },
    onSelectItem: function(pid, record){
        var me = this, cardServer = Beet.constants.cardServer;

        me.resetAll();

        if (pid <= 0){
            Ext.Msg.alert("错误", "项目ID非法!");
            return;
        }

        cardServer.GetPackagesItems(pid, {
            success: function(data){
                data = Ext.JSON.decode(data)["items"];
                var sql = [];
                for (var c = 0; c < data.length; ++c){
                    sql.push("iid=" + data[c]);
                }
                var s = sql.join(" OR ");
                if (s.length > 0){
                    cardServer.GetItemPageData(1, 1000000, s, {
                        success: function(data){
                            var data = Ext.JSON.decode(data)["Data"];
                            me.addItems(data, true);
                            me.itemsPanel.expand();
                        },
                        failure: function(error){
                            Ext.Error.raise(error)
                        }
                    });
                }
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });

        cardServer.GetPackageProducts(pid, {
            success: function(data){
                data = Ext.JSON.decode(data)["products"];
                var sql = [];
                for (var c = 0; c < data.length; ++c){
                    sql.push("pid=" + data[c]);
                }
                var s = sql.join(" OR ");
                if (s.length > 0){
                    cardServer.GetProductPageData(1, data.length, s, {
                        success: function(data){
                            var data = Ext.JSON.decode(data)["Data"];
                            me.addProducts(data, true);
                            //me.productsPanel.expand();
                        },
                        failure: function(error){
                            Ext.Error.raise(error)
                        }
                    });
                }
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        });
    }
});
