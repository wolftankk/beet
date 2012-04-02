registerMenu("cards", "cardAdmin", "卡项管理",
    [
        {
            text: "编辑卡项",
            handler: function(){
                var item = Beet.cache.menus["cards.CardList"]
                if (!item){
                    Beet.workspace.addPanel("cards.CardList", "编辑卡项", {
                        items: [
                            Ext.create("Beet.apps.cards.CardList")
                        ]
                    })
                }else{
                    Beet.workspace.workspace.setActiveTab(item);
                }
            }
        }
    ]
);

Ext.define("Beet.apps.cards.CardList", {
    extend: "Ext.form.Panel",
    height: Beet.constants.VIEWPORT_HEIGHT - 5,
    width: "100%",
    autoHeight: true,
    autoScroll:true,
    frame:true,
    border: false,
    bodyBorder: false,
    plain: true,
    b_filter: "",
    initComponent: function(){
        var me = this, cardServer = Beet.constants.cardServer;
        me.queue = new Beet_Queue("cardList");

        me.callParent();    
        me.getCardMetaData();
    },
    getCardMetaData: function(){
        var me = this, cardServer = Beet.constants.cardServer;

        cardServer.GetCardPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data);
                me.buildStoreAndModel(data["MetaData"]);
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    buildStoreAndModel: function(metaData){
        var fields = [], me = this, cardServer = Beet.constants.cardServer;
        me.columns = [];
        for (var c = 0; c < metaData.length; ++c){
            var d = metaData[c];
            fields.push(d["FieldName"]);
            if (!d["FieldHidden"]) {
                var column = {
                    flex: 1,
                    header: d["FieldLabel"],
                    dataIndex: d["FieldName"]    
                }

		switch (d["FieldName"]){
		    case "Par":
		    case "Price":
		    case "Insure":
			column.xtype = "numbercolumn";
			break;
		}

		me.columns.push(column)
            }
        };
        
        if (!Ext.isDefined(Beet.apps.cards.CardModel)){
            Ext.define("Beet.apps.cards.CardModel", {
                extend: "Ext.data.Model",
                fields: fields
            });
        }

        if (!Ext.isDefined(Beet.apps.cards.CardStore)){
            Ext.define("Beet.apps.cards.CardStore", {
                extend: "Ext.data.Store",
                model: Beet.apps.cards.CardModel,
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
                        start: (that.currentPage - 1) * Beet.constants.PageSize,
                        limit: Beet.constants.PageSize,
                        addRecords: false
                    });
                    

                    that.proxy.b_params["start"] = options["start"];
                    that.proxy.b_params["limit"] = options["limit"];

                    return that.callParent([options]);
                },
                proxy: {
                    type: "b_proxy",
                    b_method: cardServer.GetCardPageData,
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
            });
        }

        me.createCardGrid();
    },
    createCardGrid: function(){
        var me = this, grid = me.grid, sm = null, cardServer = Beet.constants.cardServer;
        if (me.b_type == "selection"){
            sm = Ext.create("Ext.selection.CheckboxModel", {
                mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
            });
            me.selModel = sm;
        }
        Ext.apply(this, {
            storeProxy: Ext.create("Beet.apps.cards.CardStore")
        });
        var store = me.storeProxy, actions;

        var _actions = {
            xtype: 'actioncolumn',
            width: 50,
            items: [
            ]
        }

        //这里需要权限判断
        _actions.items.push(
            "-", "-", "-", {
                icon: './resources/themes/images/fam/edit.png',
                tooltip: me.b_type == "selection" ? "查看卡项" : "编辑卡项",
                id: "customer_grid_edit",
                handler:function(grid, rowIndex, colIndex){
                    var d = me.storeProxy.getAt(rowIndex)
                    me.editCardItem(d);
                }
            }
        );
        
        if (me.b_type == "selection") {
        }else{
            _actions.items.push("-", "-", "-",{
                icon: "./resources/themes/images/fam/delete.gif",
                tooltip: "删除卡项",
                id: "customer_grid_delete",
                handler: function(grid, rowIndex, colIndex){
                    var d = me.storeProxy.getAt(rowIndex)
                    me.deleteCardItem(d);
                }
            }, "-","-","-");
        }
        
        me.columns.splice(0, 0, _actions);

        me.cardgrid = Ext.create("Beet.plugins.LiveSearch", {
            store: store,
            lookMask: true,
            frame: true,
            collapsible: false,
            height: me.b_type == "selection" ? "95%" : "100%",
            width : "100%",
            rorder: false,
            bodyBorder: false,
            autoScroll: true,
            autoHeight: true,
            autoWidth: true,
            border: 0,
            flex: 1,
            cls: "iScroll",
            selModel: sm,
            columnLines: true,
            viewConfig:{
                trackOver: false,
                stripeRows: true
            },
            columns: me.columns,
            bbar: Ext.create("Ext.PagingToolbar", {
                store: store,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1} 到 {2}',
                emptyMsg: "没有数据"
            }),
            tbar: [
                "-",
                {
                    xtype: "button",
                    text: "高级搜索",
                    handler: function(){
                        var cardServer = Beet.constants.cardServer;
                        cardServer.GetCardPageData(0, 1, "", {
                            success: function(data){
                                var win = Ext.create("Beet.apps.AdvanceSearch", {
                                    searchData: Ext.JSON.decode(data),
                                    b_callback: function(where){
                                        me.b_filter = where;
                                        me.storeProxy.setProxy({
                                            type: "b_proxy",
                                            b_method: cardServer.GetCardPageData,
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
                                        me.storeProxy.loadPage(1);    
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
            ]
        })
        me.add(me.cardgrid);
        me.doLayout();

        if (me.b_type == "selection"){
            me.add(Ext.widget("button", {
                text: "确定",
                width: 200,
                style: {
                    float: "right"
                },
                handler: function(){
                    if (me.b_selectionCallback){
                        me.b_selectionCallback(me.selModel.getSelection());
                    }
                }
            }))
            me.doLayout();
        }
    },
    deleteCardItem: function(record){
        var me = this, cardServer = Beet.constants.cardServer;
        Ext.MessageBox.show({
            title: "删除卡项",
            msg: "你确定需要删除 " + record.get("Name") + " 吗?",
            buttons: Ext.MessageBox.YESNO,
            fn: function(btn){
                if (btn == "yes"){
                    cardServer.DeleteCard(record.get("ID"), {
                        success: function(succ){
                            if (succ) {
                                Ext.Msg.alert("删除成功", "删除卡项 "+ record.get("Name") + " 成功");
                                me.storeProxy.loadPage(me.storeProxy.currentPage);
                            }
                        },
                        failure: function(error){
                            Ext.Error.raise(error)
                        }
                    });
                }
            }
        })
    },
    editCardItem: function(record){
        var me = this, cardServer = Beet.constants.cardServer;
        if (me.b_type == "selection"){
            var win = Ext.create("Ext.window.Window", {
                height: 670,
                width: 1100,
                maximized: true,
                autoScroll: true,
                autoHeight: true,
                autoDestory: true,
                plain: true,
                title: "查看 " + record.get("Name"),
                border: false
            });

            win.show();
            Ext.MessageBox.show({
                msg: "正在载入卡项数据...",
                progressText: "载入中...",
                width: 300,
                wait: true,
                waitConfig: {interval: 800},
                closable: false
            });

	    var cardPanel = Ext.create("Beet.apps.cards.AddCard")

	    cardServer.GetCardDetailData(record.get("ID"), {
		success: function(data){
		    var data = Ext.JSON.decode(data);
		    cardPanel.restoreFromData(record, data)
		    win.add(cardPanel);
		    Ext.MessageBox.hide();
		},
		failure: function(error){
		    Ext.MessageBox.hide();
		    Ext.Error.raise(error);
		}
	    })
        }else{
            var win = Ext.create("Ext.window.Window", {
                height: 670,
                width: 1100,
                maximized: true,
                autoScroll: true,
                autoHeight: true,
                autoDestory: true,
                plain: true,
                title: "编辑 " + record.get("Name"),
                border: false
            });

            win.show();

            Ext.MessageBox.show({
                msg: "正在载入卡项数据...",
                progressText: "载入中...",
                width: 300,
                wait: true,
                waitConfig: {interval: 1000, increment: 3 },
                closable: false
            });

	    var cardPanel = Ext.create("Beet.apps.cards.AddCard", {
		action: "update",
		b_callback: function(){
		    win.close();
		    me.storeProxy.loadPage(me.storeProxy.currentPage);
		}
	    })

	    cardServer.GetCardDetailData(record.get("ID"), {
		success: function(data){
		    var data = Ext.JSON.decode(data);
		    cardPanel.restoreFromData(record, data)
		    win.add(cardPanel);
		    Ext.MessageBox.hide();
		},
		failure: function(error){
		    Ext.MessageBox.hide();
		    Ext.Error.raise(error);
		}
	    })
        }
    },
})
