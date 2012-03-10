Ext.namespace("Beet.apps.cards");

//
////GetCategoryData  
////0 产品,  1, 项目
////2 套餐,  3 卡项
////4 费用
function buildCategoryTreeStore(type){
    var typedict = {
        0 : "Products",
        1 : "Items",
        2 : "Packages",
        3 : "Cards",
        4 : "Charges"
    }
    if (typedict[type] == undefined){
        Ext.Error.raise("传入的type错误, 请检查!");
        return;
    }
    
    if (!Beet.apps.cards[typedict[type]+"CatgoryTreeStore"]){
        Ext.define(("Beet.apps.cards."+typedict[type]+"CatgoryTreeStore"), {
            extend: "Ext.data.TreeStore",
            fields: [
                "rate",//add for rate
                "id",
                "text",
                "name"
            ],
            autoLoad: true,
            root: {
                text: "总分类",
                id: "-1",
                rate: "",
                expanded: true
            },
            proxy: {
                type: "b_proxy",
                b_method: Beet.constants.cardServer.GetCategoryData,
                b_params: {
                    "CategoryType" : type
                },
                preProcessData: function(data){
                    var originData = data["root"];
                    var bucket = [];
                    var me = this;
                    me.categoryList = [];
                    var processData = function(target, cache, pid){
                        var k;
                        for (k = 0; k < target.length; ++k){
                            var _tmp = target[k];
                            _tmp["rate"] = (_tmp["rate"] == -1 ? "无" : _tmp["rate"]);
                            var item = {};
                            if (_tmp.data && _tmp.data.length > 0){
                                item["expanded"] = false;
                                item["text"] = _tmp["name"];
                                item["id"] = _tmp["id"];
                                item["pid"] = pid;
                                item["children"] = [];
                                item["rate"] = _tmp["rate"];
                                processData(_tmp.data, item["children"], item["id"]);
                            }else{
                                item = _tmp;
                                item["text"] = _tmp["name"];
                                item["leaf"] = true;
                                item["pid"] = pid;
                                item["rate"] = _tmp["rate"];
                                //item["checked"] = false;
                            }

                            cache.push(item);
                            me.categoryList.push({
                                id: _tmp["id"],
                                text: _tmp["name"],
                                rate: _tmp["rate"]
                            })
                        }
                    }

                    processData(originData, bucket, -1);

                    return bucket;
                },
                b_scope: Beet.constants.cardServer,
                reader: {
                    type: "json"    
                }
            },
        })
    }
}

function createPackageCategoryTree(){
    var me = this, cardServer = Beet.constants.cardServer, store;
    var addWin, editWin;

    //private
    var refreshTreeList = function(){
        store.load();
    }

    var updateCategoryRate = function(widget, record, e){
        var title = record.get("text"), id = record.get("id");
        //Ext.MessageBox.show({
        //    title: "修改"+title+"打折率",
        //    msg: "是否需要修改"+title+"打折率?",
        //    buttons: Ext.MessageBox.YESNO,
        //    fn: function(btn){
        //        if (btn == "yes") {
                    Ext.MessageBox.prompt((title+"打折率"), "输入需要修改的打折率值:", function(btn, value, opts){
                        cardServer.UpdateCategoryRate(id, value, {
                            success: function(data){
                                if (data){
                                    Ext.MessageBox.alert("通知", "修改成功!");
                                    refreshTreeList();
                                }else{
                                    Ext.MessageBox.alert("失败", "修改失败!");
                                }
                            },
                            failure: function(error){
                                Ext.Error.raise(error)
                            }
                        })
                    })
        //        }
        //    }
        //})
    }


    var categoryListCombo = function(){
        var itemList = me.treeList.getStore().proxy.categoryList;
        itemList.push({
            id: -1,
            text: "总分类"    
        });
        return Ext.create("Ext.data.Store", {
            fields: ["id", "text"],
            data: itemList
        })
    }

    var addTreeItem = function(widget, record, e){
        var CLCombo = categoryListCombo();
        if (addWin){
            addWin.close();
        }
        if (editWin){
            editWin.close()
        }

        var form = Ext.create("Ext.form.Panel", {
            width: "100%",
            height: 100,
            bodyStyle: "background-color: #dfe8f5",
            border: false,
            flex: 1,
            bodyPadding: 10,
            items: [
                {
                    fieldLabel: "名称",
                    xtype: "textfield",
                    allowBlank: false,
                    name: "name"
                },
                {
                    fieldLabel: "所属类别",
                    xtype: "combobox",
                    store: CLCombo,
                    name: "parentid",
                    queryMode: "local",
                    displayField: "text",
                    valueField: "id",
                    value: parseInt(record.get("id") == "src" ? -1 : record.get("id"))
                }
            ],
            buttons: [
                {
                    xtype: "button",
                    text: "提交",
                    width: 200,
                    handler: function(){
                        var f = form.getForm(), result = f.getValues();
                        result["categorytype"] = 2;
                        cardServer.AddCategory(Ext.JSON.encode(result), {
                            success: function(id){
                                if (id > 0){
                                    Ext.Msg.alert("添加成功", "添加分类成功");
                                    addWin.close();
                                    refreshTreeList();
                                }
                            },
                            failure: function(error){
                                Ext.Error.raise(error)
                            }
                        })
                    }
                }
            ]
        });

        addWin = Ext.create("Ext.window.Window", {
            height: 140,
            width: 300,
            title: "增加分类",
            autoHeight: true,
            autoScroll: true,
            autoWidth: true,
        });
        addWin.add(form)
        addWin.doLayout();
        addWin.show();
    }
    var deleteTreeItem = function(width, record, e){
        var id = record.get("id");
        if (id == "src"){
            return;
        }

        Ext.Msg.alert("删除分类", "你确定需要删除 " + record.get("text") + " 吗?", function(btn){
            cardServer.DeleteCategory(id, {
                success: function(succ){
                    if (succ) {
                        Ext.Msg.alert("删除成功", "删除分类 "+ record.get("text") + " 成功");
                        refreshTreeList();
                    }
                },
                failure: function(error){
                    Ext.Error.raise(error)
                }
            });
        })
    }
    var editTreeItem = function(widget, record, e){
        var CLCombo = categoryListCombo();
        if (addWin){
            addWin.close();
        }
        if (editWin){
            editWin.close()
        }

        var form = Ext.create("Ext.form.Panel", {
            width: "100%",
            height: 100,
            bodyPadding: 10,
            bodyStyle: "background-color: #dfe8f5",
            border: false,
            flex: 1,
            items: [
                {
                    fieldLabel: "名称",
                    xtype: "textfield",
                    allowBlank: false,
                    name: "name",
                    value: record.get("text")
                },
                {
                    fieldLabel: "所属类别",
                    xtype: "combobox",
                    store: CLCombo,
                    name: "parentid",
                    queryMode: "local",
                    displayField: "text",
                    valueField: "id",
                    value: parseInt(record.raw["pid"])
                }
            ],
            buttons: [
                {
                    xtype: "button",
                    text: "提交",
                    width: 200,
                    handler: function(){
                        var f = form.getForm(), result = f.getValues();
                        result["id"] = record.get("id");
                        cardServer.UpdateCategory(Ext.JSON.encode(result), {
                            success: function(succ){
                                if (succ){
                                    Ext.Msg.alert("编辑成功", "编辑分类成功");
                                    editWin.close();
                                    refreshTreeList();
                                }
                            },
                            failure: function(error){
                                Ext.Error.raise(error);
                            }
                        })
                    }
                }
            ]
        });

        editWin= Ext.create("Ext.window.Window", {
            height: 140,
            width: 300,
            title: "编辑分类",
            autoHeight: true,
            autoScroll: true,
            autoWidth: true,
        });
        editWin.add(form)
        editWin.doLayout();
        editWin.show();
    }

    //private event handler
    var treeListRClick = function(frame, record, item, index, e, options){
        e.stopEvent();
        var isLeaf = record.isLeaf(), me = this;
        if (!record.contextMenu){
            var menu = [];
            //if (record.get("id") == "-1") { return false; }
            if (record.isRoot()){
                menu = [
                    {
                        text: "增加分类", 
                        handler: function(direction, e){
                            addTreeItem(direction, record, e)    
                        }
                    }
                ]
            }else {
                menu = [
                    {text: "增加分类", handler: function(direction, e){
                        addTreeItem(direction, record, e);    
                    }},
                    {text: "编辑", handler: function(direction, e){
                        editTreeItem(direction, record, e)    
                    }},
                    {text: "删除", handler: function(direction, e){
                        deleteTreeItem(direction, record, e);    
                    }},
                    {text: "修改打折率", handler: function(direction, e){
                        updateCategoryRate(direction, record, e);
                    }}
                ]
            }

            record.contextMenu = Ext.create("Ext.menu.Menu", {
                style: {
                   overflow: 'visible',
                },
                plain: true,
                items: menu,
                raw : record,
                leaf: isLeaf
            });
        }
        record.contextMenu.showAt(e.getXY());
        return false;
    }

    //var treeItemClick = function(frame, record, item, index, e, options){
    //    if (!record){return;}
    //    
    //    me.selectProductCategoryId = parseInt(record.get("id"));

    //    me.form.getForm().setValues({
    //        "category" : record.get("text")    
    //    })
    //}

    ///public API
    var onTreeItemClick = function(frame, record, item){
        var id = record.get("id");
        if (id != -1){
            me.b_filter = "PCategoryId= " + id;
        }else{
            me.b_filter = "";
        }
        me.filterProducts();
    }

    me.createTreePanel = function(){
        Ext.bind(buildCategoryTreeStore, me)(2);

        store = Ext.create("Beet.apps.cards.PackagesCatgoryTreeStore");

        //var sm = null;
        //if (me.b_type == "selection"){
        //    sm = Ext.create("Ext.selection.CheckboxModel", {
        //        mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
        //    });
        //    me.selModel = sm;
        //}
        me.treeList = Ext.create("Ext.tree.Panel", {
            store: store,
            bodyStyle: "background-color: #fff",
            frame: true,
            lookMask: true,
            //selModel: sm,
            //multiSelect: true,
            cls: "iScroll",
            collapsible: true,
            collapseDirection: "left",
            width: 240,
            height: Beet.constants.VIEWPORT_HEIGHT - 50,
            border: 0,
            useArrow: true,
            title: "套餐分类",
            split: true,
            tbar: [
                {
                    xtype: "button",
                    text: "全部卷起",
                    handler: function(){
                        return me.treeList.collapseAll();
                    }
                },
                {
                    xtype: "button",
                    text: "全部展开",
                    handler: function(){
                        return me.treeList.expandAll();
                    }
                },
                {
                    xtype: "button",
                    text: "刷新",
                    handler: function(){
                        me.refreshTreeList();
                    }
                }
            ],
            columns: [
                {
                    xtype: 'treecolumn',
                    text: "分类名称",
                    flex: 1,
                    dataIndex: 'text'
                },
                {
                    text: "打折率(%)",
                    width: 60,
                    dataIndex: 'rate'
                }
            ],
        });
        me.treeList.addListener({
            collapse: function(p){
                if (p && p.collapsed && p.reExpander){
                    var reExpander = p.reExpander;
                    setTimeout(function(){
                        reExpander.el.applyStyles({top: 0, left: 0});
                        reExpander.setHeight(me.getHeight())
                    }, 50);
                }
            },
            beforeitemcontextmenu: function(frame, record, item, index, e, options){
                treeListRClick(frame, record, item, index, e, options);
            },
            itemclick: function(frame, record, item, index, e, options){
                onTreeItemClick(frame, record, item, index, e, options);
            }
        });

        me.treeList.storeProxy = me.treeList.getStore();
    }
}

function createItemCategoryTree(){
    var me = this, cardServer = Beet.constants.cardServer;
    me.createTreeList = function(){
        Ext.bind(buildCategoryTreeStore, me)(1);

        me.storeProxy = store = Ext.create("Beet.apps.cards.ItemsCatgoryTreeStore");
        me.treeList = Ext.create("Ext.tree.Panel", {
            store: store,
            bodyStyle: "background-color: #fff",
            frame: true,
            lookMask: true,
            cls: "iScroll",
            collapsible: true,
            collapseDirection: "left",
            width: 230,
            height: 500,
            border: 0,
            useArrow: true,
            title: "项目分类",
            split: true,
            tbar: [
                {
                    xtype: "button",
                    text: "全部卷起",
                    handler: function(){
                        return me.treeList.collapseAll();
                    }
                },
                {
                    xtype: "button",
                    text: "全部展开",
                    handler: function(){
                        return me.treeList.expandAll();
                    }
                },
            ],
            columns: [
                {
                    xtype: 'treecolumn',
                    text: "分类名称",
                    flex: 1,
                    dataIndex: 'text'
                },
                {
                    text: "打折率(%)",
                    width: 60,
                    dataIndex: 'rate'
                }
            ]
        });

        me.treeList.on({
            "beforeitemcontextmenu": me.treeListRClick,
            scope: me
        });
        me.treeList.on({
            itemclick: me.treeItemClick,
            scope: me
        })
        
        //FIXED FOR 4.0.7
        me.treeList.addListener({
            collapse: function(p){
                if (p && p.collapsed && p.reExpander){
                    var reExpander = p.reExpander;
                    setTimeout(function(){
                        reExpander.el.applyStyles({top: 0, left: 0});
                        reExpander.setHeight(me.getHeight())
                    }, 50);
                }
            }
        })

        me.treeList.storeProxy = me.treeList.getStore();
        me.updateTreeListEvent();
    }
    me.refreshTreeList = function(){
        me.treeList.storeProxy.load();
    }

    var updateCategoryRate = function(widget, record, e){
        var title = record.get("text"), id = record.get("id");
        //Ext.MessageBox.show({
        //    title: "修改"+title+"打折率",
        //    msg: "是否需要修改"+title+"打折率?",
        //    buttons: Ext.MessageBox.OK,
        //    fn: function(btn){
                //if (btn == "yes") {
                    Ext.MessageBox.prompt((title+"打折率"), "输入需要修改的打折率值:", function(btn, value, opts){
                        cardServer.UpdateCategoryRate(id, value, {
                            success: function(data){
                                if (data){
                                    Ext.MessageBox.alert("通知", "修改成功!");
                                    me.refreshTreeList();
                                }else{
                                    Ext.MessageBox.alert("失败", "修改失败!");
                                }
                            },
                            failure: function(error){
                                Ext.Error.raise(error)
                            }
                        })
                    })
                //}
            //}
        //})
    }

    me.treeListRClick = function(frame, record, item, index, e, options){
        var isLeaf = record.isLeaf();
        if (!record.contextMenu){
            var menu = [];

            if (record.isRoot()){
                menu = [
                    {
                        text: "增加分类", 
                        handler: function(direction, e){
                            me.addTreeItem(direction, record, e)    
                        }
                    }
                ]
            }else{
                menu = [
                    {text: "增加分类", handler: function(direction, e){
                        me.addTreeItem(direction, record, e);    
                    }},
                    {text: "编辑", handler: function(direction, e){
                        me.editTreeItem(direction, record, e)    
                    }},
                    {text: "删除", handler: function(direction, e){
                        me.deleteTreeItem(direction, record, e);    
                    }},
                    {text: "修改打折率", handler: function(direction, e){
                        updateCategoryRate(direction, record, e);
                    }}
                ]
            }

            record.contextMenu = Ext.create("Ext.menu.Menu", {
                style: {
                   overflow: 'visible',
                },
                plain: true,
                items: menu,
                raw : record.raw,
                leaf: isLeaf
            });
        }
        e.stopEvent();
        record.contextMenu.showAt(e.getXY());
        return false;
    }
    me.categoryListCombo = function(){
        var itemList = me.treeList.getStore().proxy.categoryList;
        itemList.push({
            id: -1,
            text: "总分类"    
        });
        return Ext.create("Ext.data.Store", {
            fields: ["id", "text"],
            data: itemList
        })
    }
    me.addTreeItem = function(widget, record, e){
        var CLCombo = me.categoryListCombo();
        if (me.addWin){
            me.addWin.close();
        }
        if (me.editWin){
            me.editWin.close()
        }
        me.doLayout();

        var form = Ext.create("Ext.form.Panel", {
            width: "100%",
            height: 100,
            bodyStyle: "background-color: #dfe8f5",
            border: false,
            flex: 1,
            bodyPadding: 10,
            items: [
                {
                    fieldLabel: "名称",
                    xtype: "textfield",
                    allowBlank: false,
                    name: "name"
                },
                {
                    fieldLabel: "所属类别",
                    xtype: "combobox",
                    store: CLCombo,
                    name: "parentid",
                    queryMode: "local",
                    displayField: "text",
                    valueField: "id",
                    value: parseInt(record.get("id") == "src" ? -1 : record.get("id"))
                }
            ],
            buttons: [
                {
                    xtype: "button",
                    text: "提交",
                    width: 200,
                    handler: function(){
                        var f = form.getForm(), result = f.getValues();
                        result["categorytype"] = 1;
                        cardServer.AddCategory(Ext.JSON.encode(result), {
                            success: function(id){
                                if (id > 0){
                                    Ext.Msg.alert("添加成功", "添加分类成功");
                                    me.addWin.close();
                                    me.refreshTreeList();
                                }
                            },
                            failure: function(error){
                                Ext.Error.raise(error)
                            }
                        })
                    }
                }
            ]
        });

        me.addWin = Ext.create("Ext.window.Window", {
            height: 140,
            width: 300,
            title: "增加分类",
            autoHeight: true,
            autoScroll: true,
            autoWidth: true,
        });
        me.addWin.add(form)
        me.addWin.doLayout();
        me.addWin.show();
    }
    me.deleteTreeItem = function(width, record, e){
        var id = record.get("id");
        if (id == "src"){
            return;
        }

        Ext.Msg.alert("删除分类", "你确定需要删除 " + record.get("text") + " 吗?", function(btn){
            cardServer.DeleteCategory(id, {
                success: function(succ){
                    if (succ) {
                        Ext.Msg.alert("删除成功", "删除分类 "+ record.get("text") + " 成功");
                        me.refreshTreeList();
                    }
                },
                failure: function(error){
                    Ext.Error.raise(error)
                }
            });
        }, me)
    }
    me.editTreeItem = function(widget, record, e){
        var CLCombo = me.categoryListCombo();
        if (me.addWin){
            me.addWin.close();
        }
        if (me.editWin){
            me.editWin.close()
        }

        var form = Ext.create("Ext.form.Panel", {
            width: "100%",
            height: 100,
            bodyPadding: 10,
            bodyStyle: "background-color: #dfe8f5",
            border: false,
            flex: 1,
            items: [
                {
                    fieldLabel: "名称",
                    xtype: "textfield",
                    allowBlank: false,
                    name: "name",
                    value: record.get("text")
                },
                {
                    fieldLabel: "所属类别",
                    xtype: "combobox",
                    store: CLCombo,
                    name: "parentid",
                    queryMode: "local",
                    displayField: "text",
                    valueField: "id",
                    value: parseInt(record.raw["pid"])
                }
            ],
            buttons: [
                {
                    xtype: "button",
                    text: "提交",
                    width: 200,
                    handler: function(){
                        var f = form.getForm(), result = f.getValues();
                        result["id"] = record.get("id");
                        cardServer.UpdateCategory(Ext.JSON.encode(result), {
                            success: function(succ){
                                if (succ){
                                    Ext.Msg.alert("编辑成功", "编辑分类成功");
                                    me.editWin.close();
                                    me.refreshTreeList();
                                }
                            },
                            failure: function(error){
                                Ext.Error.raise(error);
                            }
                        })
                    }
                }
            ]
        });

        me.editWin= Ext.create("Ext.window.Window", {
            height: 140,
            width: 300,
            title: "编辑分类",
            autoHeight: true,
            autoScroll: true,
            autoWidth: true,
        });
        me.editWin.add(form)
        me.editWin.doLayout();
        me.editWin.show();
    }
    me.updateTreeListEvent = function(unregister){
        if (unregister){
            me.treeList.un({
                itemClick: me.onTreeItemClick,
                scope: me
            })
        }else{
            me.treeList.on({
                itemClick: me.onTreeItemClick,
                scope: me
            })
        }
    }
    me.onTreeItemClick = function(frame, record, item){
        var id = record.get("id");
        if (id != -1){
            me.b_filter = "ICategoryId= " + id;
        }else{
            me.b_filter = "";
        }
        me.filterProducts();
    }
    me.treeItemClick = function(frame, record, item, index, e, options){
        if (!record){return;}
        
        me.selectProductCategoryId = parseInt(record.get("id"));

        me.form.getForm().setValues({
            "category" : record.get("text")    
        })
    }
}

Ext.onReady(function(){
    Ext.syncRequire([
        "cards.addcard",
        "cards.cardlist"
        //"card.products",
        //"card.cards", 
        //"card.interests", 
        //"card.packages", 
        //"card.items", 
        //"card.charges", 
        //"card.rebate"
    ]);
});
