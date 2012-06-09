Beet.registerMenu("settings", "employeeAdmin", "员工管理",
    [
	{
	    text: "部门设定",
	    handler: function(){
		var item = Beet.cache.menus["employees.employeeDepartment"];
		if (!item){
		    Beet.workspace.addPanel("employees.employeeDepartment", "部门设定", {
			items: [
			    Ext.create("Beet.apps.employees.employeeDepartment")
			]
		    });
		}else{
		    Beet.workspace.workspace.setActiveTab(item);
		}
	    }
	}
    ]
);

(function(window){
    Ext.define("Beet.apps.employees.deparmentStore", {
	extend: "Ext.data.TreeStore",
	autoLoad: true,
	root: {
	    text: "部门",
	    id: "src",
	    expanded: true    
	},
	proxy: {
	    type: "b_proxy",
	    b_method: Beet.constants.employeeServer.GetDepartmentData,
	    b_params: {
		filter: "",
		b_onlySchema: false
	    },
	    b_scope: Beet.constants.employeeServer,
	    preProcessData: function(data){
		var metaData = data["MetaData"], data = data["Data"], bucket = [];
		if (Beet.cache.employee == undefined){
		    Beet.cache.employee = {}
		}
		Beet.cache.employee.department = metaData;

		for (var c in data){
		    var item = data[c];
		    bucket.push({
			leaf: true,
			name: "depid_" + item["MD_DEPID"],
			text: item["MD_DEPNAME"],
			_id: item["MD_DEPID"]
		    })
		}
		return bucket;
	    },
	    reader: {
		type: "json"
	    }
	}
    })

    Ext.define("Beet.apps.employees.employeeDepartment", {
	extend: "Ext.panel.Panel",
	layout: {
	    type: "hbox",
	    align: "stretch"
	},
	shadow: true,
	frame: true,
	defaults: {
	    border: 0
	},
	rootVisible: false,
	initComponent: function(){
	    var me = this, employeeServer = Beet.constants.employeeServer;
	    Ext.apply(this, {
		storeProxy: Ext.create("Beet.apps.employees.deparmentStore")
	    })

	    me.items = [
		me.createTreeList(),
		{
		    xtype: 'splitter'   // A splitter between the two child items
		},
		me.createDetailPanel()        
	    ]
	    me.callParent(arguments);    
	},
	afterRender: function(){
	    var me = this;
	    me.callParent(arguments);
	},
	refreshTreeList: function(callback){
	    var me = this;
	    me.storeProxy.load();
	},
	createTreeList: function(){
	    var me = this, store = me.storeProxy, employeeServer = Beet.constants.employeeServer;
	    
	    me.treeList = Ext.create("Ext.tree.Panel", {
		frame: true,
		store: store,
		lookMask: true,
		width: 230,
		height: "100%",
		border: 0,
		useArrow: true,
		split: true,
	    });


	    var _addDepartment = function(widget, e){
		var parentMenu = widget.parentMenu, rawData = parentMenu.raw, formItems = [];
		
		if (Beet.cache.employee.department){
		    var item;
		    for (var d =0; d < Beet.cache.employee.department.length; ++d){
			var c = Beet.cache.employee.department[d];
			if (!c["FieldHidden"] && c["FieldName"] != "MD_DEPID"){
			    item = {
				fieldLabel: c["FieldLabel"],
				name: c["FieldName"],
				allowBlank: false
			    }

			    formItems.push(item);
			}
		    }
		}
		    
		var form = new Ext.form.Panel({
		    frame: true,
		    border: 0,
		    plain: true,
		    layout: {
			type: "vbox"    
		    },
		    width: "100%",
		    defaultType: "textfield",
		    defaults: {
			labelAlign: "left",
			labelWidth: 90
		    },
		    items: formItems,
		    buttons: [
			{
			    text: "提交",
			    formBind: true,
			    disabled: true,
			    handler: function(direction, e){
				var that = this, form = that.up("form").getForm(), result=form.getValues();
				if (form.isValid()){
				    employeeServer.AddDepartment(result["MD_DEPNAME"], {
					success: function(uid){
					    if (uid > -1){
						Ext.MessageBox.show({
						    title: "添加部门成功",
						    msg: "添加部门 " +    result["MD_DEPNAME"] + " 成功!",
						    buttons: Ext.MessageBox.OK    
						});
						form.reset();
						me.refreshTreeList();
					    }
					},
					failure: function(error){
					    Ext.Error.raise(error)
					}
				    });
				}
			    }
			}
		    ]
		});
		
		var item = me.detailPanel.add({
		    title: "添加部门",
		    inTab: true,
		    items: [
			form    
		    ]    
		});
	    }

	    var _editDepartment = function(widget, e){
		var parentMenu = widget.parentMenu, rawData = parentMenu.raw, needUpdateId = rawData._id, formItems = [];
		if (Beet.cache.employee.department){
		    for (var d in Beet.cache.employee.department){
			var c = Beet.cache.employee.department[d];
			if (!c["FieldHidden"] && c["FieldName"] != "MD_DEPID"){
			    item = {
				value: rawData["text"],
				fieldLabel: c["FieldLabel"],
				name: c["FieldName"],
				allowBlank: false
			    }
			    formItems.push(item);
			}
		    }
		}

		var form = new Ext.form.Panel({
		    frame: true,
		    border: 0,
		    plain: true,
		    layout: {
			type: "vbox",
			align: "stretch"
		    },
		    width: "100%",
		    defaultType: "textfield",
		    defaults: {
			labelWidth: 90,
			labelAlign: "left"
		    },
		    items: formItems,
		    buttons: [
			{
			    text: "提交修改",
			    formBind: true,
			    disabled: true,
			    handler: function(direction, e){
				var that = this, form = that.up("form").getForm(), result = form.getValues();
				Ext.MessageBox.show({
				    title: "提示",
				    msg: "是否需要提交修改?",
				    buttons: Ext.MessageBox.YESNO,
				    fn: function(btn){
					if (btn == "yes"){
					    employeeServer.UpdateDepartment(result["MD_DEPNAME"], needUpdateId, {
						success: function(isSuccess){
						    if (isSuccess){
							Ext.MessageBox.alert("提示", "修改成功");    
						    }else{
							Ext.MessageBox.alert("提示", "修改失败");
						    }
						    me.refreshTreeList();
						},
						failure: function(error){
						    Ext.Error.raise(error);
						}
					    });    
					}
				    }    
				});    
			    }
			}
		    ]
		});
		var item = me.detailPanel.add({
		    title: "编辑部门: " + rawData.text,
		    inTab: true,
		    items: [
			form
		    ]    
		});
	    }

	    var _deleteDeparment = function(widget, e){
		var parentMenu = widget.parentMenu, rawData = parentMenu.raw;
		var needDeletedId = rawData._id;
		Ext.MessageBox.show({
		    title: '警告',
		    msg: "是否需要删除 " + rawData["text"],
		    buttons: Ext.MessageBox.YESNO,
		    fn: function(btn){
			if (btn == "yes"){
			    employeeServer.DelDepartment(needDeletedId, {
				success: function(isSuccess){
				    Ext.MessageBox.show({
					title: "删除成功",
					msg: "删除部门: " + rawData["text"] + " 成功",
					buttons: Ext.MessageBox.OK,
					fn: function(btn){
					    me.refreshTreeList();
					}
				    });
				},
				failure: function(error){
				    Ext.Error.raise(error);
				}
			    })
			}
		    }
		});
	    }

	    var _itemRClick = function(view, record, item, index, e, options){
		var rawData = record.raw, leaf = record.isLeaf();
		if (!record.contextMenu){
		    record.contextMenu = Ext.create("Ext.menu.Menu", {
			plain: true,
			items:[
			    {
				text: "添加部门", handler: 
				function(direction, e){
				    _addDepartment(direction, e);
				}
			    },
			    {
				text: "编辑部门", handler: function(direction, e){
				    _editDepartment(direction, e)
			    }},
			    {
				text: "删除部门", handler: function(direction, e){
				    _deleteDeparment(direction, e)
				}
			    }
			],
			raw: rawData,
			leaf: leaf    
		    })
		}

		e.stopEvent();
		record.contextMenu.showAt(e.getXY());

		return false;
	    }
	    
	    me.treeList.on({
		"beforeitemcontextmenu" : _itemRClick
	    })
	    

	    return me.treeList    
	},
	createDetailPanel: function(){
	    var me = this;
	    me.detailPanel = Ext.create("Ext.tab.Panel",{
		width: Beet.constants.WORKSPACE_WIDTH - 245,
		height: "100%",
		layout: "card",
		frame: true,
		border: 0,
		defaults: {
		    frame: true,
		    border: 0,
		    layout: "card",
		    closable: true
		},
		items: [
		]
	    });

	    return me.detailPanel
	}
    });
})(window)
