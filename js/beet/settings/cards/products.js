registerMenu("settings", "cardAdmin", "产品管理",
    [
	{
	    text: "产品设置",
	    handler: function(){
		var item = Beet.cache.menus["cards.UpdateProducts"];
		if (!item){
		    Beet.workspace.addPanel("cards.UpdateProducts", "产品设置", {
			items: [
			    Ext.create("Beet.apps.cards.UpdateProducts")
			]
		    })
		}else{
		    Beet.workspace.workspace.setActiveTab(item);
		}
	    }
	}
    ]
);

Ext.define("Beet.apps.cards.AddProducts", {
  extend: "Ext.form.Panel",
  height: "100%",
  width: "100%",
  layout: "fit",
  bodyStyle: "background-color: #dfe8f5",
  defaults: {
    bodyStyle: "background-color: #dfe8f5"
  },
  autoHeight: true,
  autoScroll:true,
  frame:true,
  border: false,
  bodyBorder: false,
  plain: true,
  initComponent: function(){
    var me = this, cardServer = Beet.constants.cardServer;
  
    me.callParent();  
    me.mainPanel = Ext.create("Ext.panel.Panel", {
      height: "100%",
      width: "100%",
      autoHeight: true,
      autoScroll: true,
      border: false
    })
    me.add(me.mainPanel);
    me.doLayout();
    
    //Ext.bind(createCategoryTree, me)();
    //me.createTreeList();

    //me.updateTreeListEvent(true)
    me.createMainPanel();
  },
  createMainPanel: function(){
    var me = this, cardServer = Beet.constants.cardServer;

    var config = {
      autoHeight: true,
      autoScroll: true,
      width: "100%",
      height: "100%",
      bodyStyle: "background-color: #dfe8f5",
      bodyPadding: 5,
      layout: "fit",
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
            bodyStyle: "background-color: #dfe8f5"
          },
          defaultType: "textfield",
          fieldDefaults: {
            msgTarget: "side",
            labelAlign: "top",
            labelWidth: 60
          },
          items: [
            {
              fieldLabel: "产品编码",
              name: "code",
              allowBlank: false
            },
            {
              fieldLabel: "产品名称",
              name: "name",
              allowBlank: false
            },
            {
              fieldLabel: "产品条形码",
              name: "barcode",
              allowBlank: true
            },
            {
              fieldLabel: "产品价格",
              name: "price",
              allowBlank: false,
              validator: function(value){
                var p = RegExp(/\d+\.\d\d/);
                if (!p.test(value)){
                  return "输入的值必须是两位小数!";
                }
                return true;
              },
            },
            {
              fieldLabel: "产品成本",
              name: "cost",
              allowBlank: false,
              validator: function(value){
                var p = RegExp(/\d+\.\d\d/);
                if (!p.test(value)){
                  return "输入的值必须是两位小数!";
                }
                return true;
              }
            },
            {
              fieldLabel: "会员价格",
              name: "memberprice",
              allowBlank: false,
              validator: function(value){
                var p = RegExp(/\d+\.\d\d/);
                if (!p.test(value)){
                  return "输入的值必须是两位小数!";
                }
                return true;
              }
            },
            {
              fieldLabel: "计量单位",
              name: "unit",
              allowBlank: false
            },
            {
              fieldLabel: "产品规格",
              name: "standards",
              allowBlank: false
            },
            {
              fieldLabel: "产品所属服务",
              name: "serviceid",
              allowBlank: false,
              xtype: "combobox",
              editable: false,
              store: Beet.constants.ServiceList,
              queryMode:"local",
              displayField: "name",
              valueField: "attr",
            },
            //{
            //  fieldLabel: "产品分类",
            //  name: "category",
            //  readOnly: true,
            //  emptyMsg: "点击侧边分类列表, 自动填入"
            //},
	    {
		xtype: "combobox",
		fieldLabel: "产品分类",
		store:new Ext.data.SimpleStore({fields:[],data:[[]]}),   
		editable:false, 
		name: "category",
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
			    var store = f.store = Ext.create("Beet.apps.cards.ProductsCatgoryTreeStore", {
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
					if (!record){return;}
    
					me.selectProductCategoryId = parseInt(record.get("id"));
					f.value = record.raw["name"];
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
            {
              fieldLabel: "注释",
              xtype: 'textareafield',
              name: "descript",
              allowBlank: true,              
            },
            {
              xtype: "component",
              colspan: 3,
              height: 10
            },
          ],
          bbar: [
            "->",
            {
              xtype: "button",
              text: "提交",
              width: 200,
	      formBind: true,
	      disabled: true,
              handler: function(){
                me.processData(this)  
              },
              hidden: me._editType == "view"
            },
            {
              xtype: "button",
              text: "取消",
              width: 200,
              handler: function(){
                if (me.callback){
                  me.callback();
                }
              },
              hidden: me._editType == "view"
            }
          ]
        }
      ]
    }

    var form = Ext.widget("form", config);
    me.form = form;
    me.mainPanel.add(form);
    me.mainPanel.doLayout();
  },
  restoreFromData: function(rawData){
    var me = this, form = me.form.getForm();
    me.rawData = rawData;
    form.setValues({
      code: rawData["PCode"],
      name: rawData["PName"],
      barcode: rawData["PBarCode"],
      count: rawData["PCount"],
      price: (rawData["PPrice"] ? rawData["PPrice"] : 0),
      cost: (rawData["PCost"] ? rawData["PCost"] : 0),
      memberprice: rawData["MemberPrice"],
      standards: rawData["PStandands"],
      serviceid: rawData["ServiceID"],
      descript: rawData["PDescript"],
      category: rawData["PCategoryName"],
      unit: rawData["PUnit"]
    })
  },
  resetForm: function(){
    var me = this, form = me.form.getForm();
    form.reset();
  },
  processData: function(f){
    var me = this, cardServer = Beet.constants.cardServer;
    var form = f.up("form").getForm(), result = form.getValues();
    if (me.selectProductCategoryId){
      result["categoryid"] = me.selectProductCategoryId;
      delete result["category"];
    }

    if (me._editType == "add"){
      cardServer.AddProducts(Ext.JSON.encode(result), {
        success: function(id){
          if (id > 0){
            Ext.MessageBox.show({
              title: "提示",
              msg: "添加产品成功!",
              buttons: Ext.MessageBox.YESNO,
              fn: function(btn){
                if (btn == "yes"){
                  form.reset()
                }else{
                  if (me.callback){
                    me.callback();
                  }
                  //close win
                }
              }
            });
          }else{
            Ext.Error.raise("添加产品失败");
          }
        },
        failure: function(error){
          Ext.Error.raise(error);
        }
      });
    }else{
      if (me._editType == "edit"){
        result["id"] = me.rawData["PID"];//products id
        cardServer.UpdateProducts(Ext.JSON.encode(result), {
          success: function(succ){
            if (succ){
              Ext.MessageBox.show({
                title: "提示",
                msg: "更新产品成功!",
                buttons: Ext.MessageBox.YES,
                fn: function(btn){
                  if (btn == "yes"){
                    if (me.callback){
                      me.callback();
                    }
                    //me.parent.storeProxy.loadPage(me.parent.storeProxy.currentPage);
                  }
                }
              });
            }else{
              Ext.Error.raise("更新产品失败");
            }
          },
          failure: function(error){
            Ext.Error.raise(error);
          }
        });
      }
    }
  }
});

Ext.define("Beet.apps.cards.UpdateProducts", {
  extend: "Ext.panel.Panel",
  border: false,
  plain: true,
  initComponent: function(){
    var me = this;
    me.callParent();
    me.add(Ext.create("Beet.apps.cards.ProductsList"));
    me.doLayout();
  }
});

function createCategoryTree(){
  var me = this, cardServer = Beet.constants.cardServer;
  me.createTreeList = function(){
    Ext.bind(buildCategoryTreeStore, me)(0);

    me.storeProxy = store = Ext.create("Beet.apps.cards.ProductsCatgoryTreeStore");
    me.treeList = Ext.create("Ext.tree.Panel", {
      store: store,
      frame: true,
      lookMask: true,
      cls: "iScroll",
      collapsible: true,
      collapseDirection: Ext.Component.DIRECTION_LEFT,
      width: 230,
      border: 0,
      useArrow: true,
      title: "产品分类",
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
      ]
    });

    me.treeList.on({
      "beforeitemcontextmenu": me.treeListRClick,
      scope: me
    });

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
    
    me.mainPanel.add(me.treeList);
    me.treeList.setHeight(Beet.workspace.getHeight() - 40);
    me.mainPanel.doLayout();
  }
  me.refreshTreeList = function(){
    me.treeList.storeProxy.load();
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
    me.categoryList = me.treeList.getStore().proxy.categoryList;
    return Ext.create("Ext.data.Store", {
      fields: ["id", "text"],
      data: me.categoryList  
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
            result["categorytype"] = 0;
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
      me.b_filter = "PCategoryID = " + id;
    }else{
      me.b_filter = "";
    }

    me.filterProducts();
  }
}

Ext.define("Beet.apps.cards.ProductsList", {
  extend: "Ext.panel.Panel",
  autoHeight: true,
  autoScroll: true,
  height: Beet.constants.VIEWPORT_HEIGHT - 1,
  width: "100%",
  frame: true,
  border: false,
  shadow: true,
  b_filter: '',
  initComponent: function(){
    var me = this, cardServer = Beet.constants.cardServer;
    if (me.b_type == "selection"){
      me.editable = false;
    }else{
      me.editable = true;
    }
    
    me.callParent();
    me.mainPanel = Ext.create("Ext.panel.Panel", {
      height: (me.b_type == "selection" ? "95%" : "100%"),
      width: "100%",
      autoHeight: true,
      autoScroll: true,
      border: false,
      layout: {
        type: "hbox",
        columns: 2,
        align: 'stretch'
      },
    })
    me.add(me.mainPanel);
    me.doLayout();

    //append new tree list
    Ext.bind(createCategoryTree, me)();
    me.createTreeList();

    me.getProductsMetaData();
  },
  getProductsMetaData: function(){
    var me = this, cardServer = Beet.constants.cardServer;

    cardServer.GetProductPageData(0, 1, "", {
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
        me.columns.push({
          flex: 1,
          header: d["FieldLabel"],
          dataIndex: d["FieldName"]  
        })
      }
    };
    
    if (!Ext.isDefined(Beet.apps.cards.ProductsModel)){
      Ext.define("Beet.apps.cards.ProductsModel", {
        extend: "Ext.data.Model",
        fields: fields
      });
    }

    if (!Ext.isDefined(Beet.apps.cards.ProductsStore)){
      Ext.define("Beet.apps.cards.ProductsStore", {
        extend: "Ext.data.Store",
        model: Beet.apps.cards.ProductsModel,
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
        }
      });
    }

    me.createGrid();
  },
  updateProxy: function(){
    var me = this, cardServer = Beet.constants.cardServer;
    return {
      type: "b_proxy",
      b_method: cardServer.GetProductPageData,
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
  createGrid: function(){
    var me = this, grid = me.grid, sm = null;
    if (me.b_type == "selection"){
      sm = Ext.create("Ext.selection.CheckboxModel", {
        mode: me.b_selectionMode ? me.b_selectionMode : "SINGLE"
      });
      me.selModel = sm;
    }
    Ext.apply(this, {
      storeProxy: Ext.create("Beet.apps.cards.ProductsStore")
    });
    var store = me.storeProxy, actions;
    store.setProxy(me.updateProxy());

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
        tooltip: "编辑消耗产品",
        id: "customer_grid_edit",
        handler:function(grid, rowIndex, colIndex){
          var d = me.storeProxy.getAt(rowIndex)
          me.editProductItem(d);
        }
      }
    );
    
    if (me.b_type == "selection") {
    }else{
      _actions.items.push("-", "-", "-",{
        icon: "./resources/themes/images/fam/delete.gif",
        tooltip: "删除消耗产品",
        id: "customer_grid_delete",
        handler: function(grid, rowIndex, colIndex){
          var d = me.storeProxy.getAt(rowIndex)
          me.deleteProductItem(d);
        }
      }, "-","-","-");
    }
    
    me.columns.splice(0, 0, _actions);

    me.grid = Ext.create("Beet.plugins.LiveSearch", {
      store: store,
      lookMask: true,
      frame: true,
      collapsible: false,
      rorder: false,
      bodyBorder: false,
      autoScroll: true,
      autoHeight: true,
      autoWidth: true,
      border: 0,
      flex: 1,
      cls: "iScroll",
      selModel: sm,
      width: "100%",
      height: me.editable ? "100%" : "95%",
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
            cardServer.GetProductPageData(0, 1, "", {
              success: function(data){
                var win = Ext.create("Beet.apps.AdvanceSearch", {
                  searchData: Ext.JSON.decode(data),
                  b_callback: function(where){
                    me.b_filter = where;
                    me.filterProducts();
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
        "-",
        {
          xtype: "button",
          text: "增加产品",
          handler: function(){
            me.addProductItem();
          }
        }
      ]
    })
    me.mainPanel.add(me.grid);
    me.mainPanel.doLayout();

    if (me.b_type == "selection"){
      me.add(Ext.widget("button", {
        text: "确定",
        floating: false,
        handler: function(){
          if (me.b_selectionCallback){
            me.b_selectionCallback(me.selModel.getSelection());
          }
        }
      }))
      me.doLayout();
    }
  },
  filterProducts: function(){
    var me = this, cardServer = Beet.constants.cardServer;
    me.storeProxy.setProxy(me.updateProxy());

    me.storeProxy.loadPage(1);
  },
  addProductItem: function(){
    var me = this;
    var win = Ext.create("Ext.window.Window", {
      width: 600,
      height: 300,
      layout: "fit",
      autoHeight: true,
      autoScroll: true,
      title: "增加产品",
      border: false
    });
    win.add(Ext.create("Beet.apps.cards.AddProducts", {
      _editType: "add",
      callback: function(){
        win.close();
        me.storeProxy.loadPage(me.storeProxy.currentPage);
      }
    }));
    win.show();
  },
  editProductItem: function(parentMenu){
    var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
    var win = Ext.create("Ext.window.Window", {
      width: 600,
      height: 300,
      layout: "fit",
      autoHeight: true,
      autoScroll: true,
      title: "增加产品",
      border: false
    });
    var config;
    if (pid && me.editable){
      win.setTitle("编辑 " + pname + " 资料");
      config = {
        _editType: "edit",
        callback: function(){
          win.close();
          me.storeProxy.loadPage(me.storeProxy.currentPage);
        }
      }
    }else{
      win.setTitle("查看 " + pname + " 资料");
      config = {
        _editType: "view",
        callback: function(){
          win.close();
          me.storeProxy.loadPage(me.storeProxy.currentPage);
        }
      }
    }
    var f = Ext.create("Beet.apps.cards.AddProducts", config);
    f.restoreFromData(rawData);
    win.add(f);
    win.doLayout();

    win.show();
  },
  deleteProductItem: function(parentMenu){
    var me = this, rawData = parentMenu.rawData || parentMenu.raw, pid = rawData["PID"], pname = rawData["PName"], cardServer = Beet.constants.cardServer;
    if (pid){
      Ext.MessageBox.show({
        title: "删除产品",
        msg: "是否要删除产品 " + pname + " ? ", 
        buttons: Ext.MessageBox.YESNO,
        fn: function(btn){
          if (btn == "yes"){
            cardServer.DeleteProducts(pid, {
              success: function(succ){
                if (succ){
                  Ext.MessageBox.show({
                    title: "删除成功",
                    msg: "删除产品: " + pname + " 成功",
                    buttons: Ext.MessageBox.OK,
                    fn: function(){
                      me.storeProxy.loadPage(me.storeProxy.currentPage);
                    }
                  })
                }else{
                  Ext.Error.raise("删除消费产品失败");
                }
              },
              failure: function(error){
                Ext.Error.raise(error);
              }
            })
          }
        }
      });
    }else{
      Ext.Error.raise("删除产品失败");
    }
  }
});
