Ext.namespace("Beet.apps.Viewport.Setting");
Ext.define("Beet.apps.Viewport.Setting.Store", {
	extend: "Ext.data.TreeStore",
	root: {
		text: "客户属性",
		id: "src",
		expanded: true
	},
	proxy: {
		type: "b_proxy",
		b_method: [Beet.constants.customerServer.GetCTCategoryDataTOJSON, Beet.constants.customerServer.GetCTItemDataToJSON],
		filters: {
			b_onlySchema: false
		},
		preProcessData: function(data){
			//开始做数据处理
			//0 itemData 1 category 
			var itemsData = Ext.JSON.decode(data[0]), categoriesData = Ext.JSON.decode(data[1]);
			
			var itemsData_Data = itemsData["Data"], itemsData_Meta = itemsData["MetaData"];
			var categoriesData_Data = categoriesData["Data"], categoriesData_Meta = categoriesData["MetaData"];
			Beet.cache["configArgs"] = Beet.cache["configArgs"] || {};
			Beet.cache["configArgs"]["customer_category"] = categoriesData_Meta;
			Beet.cache["configArgs"]["customer_item"] = itemsData_Meta;

			//add -1
			//parentId 根父类
			var bucket = [], parentId = -1;
			/**
			 * 预处理数据, 将数据根据_id存储为object
			 * @param {Object} data 原始数据
			 * @param {String} _id 需要提取的标签头
			 *
			 * @return {Object} __temp 返回处理后的函数
			 */
			var __preProcessData = function(data, _id){
				var t = 0, __temp = {};
				while (true){
					if (data[t] == undefined){
						break;
					}	
					var id = data[t][_id];
					__temp[id] = data[t];
					t++;
				}

				return __temp;
			}
			
			//预处理
			itemsData_Data = __preProcessData(itemsData_Data, "CTTypeID");
			categoriesData_Data = __preProcessData(categoriesData_Data, "CTCategoryID");
			//end
			
			;(function(){
				for (var k in itemsData_Data){
					var _o = itemsData_Data[k],
						cid = _o.CTCategoryID,
						typeId = _o.CTTypeID,
						name = _o.CTTypeName,
						inputmode = _o.InputMode,
						item = {
							text : name,
							leaf : true,
							categoryId : cid,
							typeId : typeId,
							inputmode : inputmode	
						}

					if (cid == parentId){
						bucket.push(item);
					}else{
						var o_data = categoriesData_Data[cid];
						o_data["children"] = o_data["children"] || {}
						o_data["children"]["items"] = o_data["children"]["items"] || [];
						o_data["children"]["items"].push(item);
					}
				}
			})()	
			
			var _cache = {};
			var __process = function(o){
				var cid = o.CTCategoryID, name = o.CTCategoryName, pid = o.ParentCategoryID, serviceType = o.ServiceType,
					item = {
						text : name,
						cid : cid,
						pid : pid,
						serviceType : serviceType,
						expanded: true,
						children : o.children || {}
					};

				if (pid == parentId){
					if (_cache[cid] == undefined){
						_cache[cid] = item;
					}	

					return cid;
				}else{
					var _pid = __process(categoriesData_Data[pid]);
					if (_cache[_pid]["children"][cid] == undefined){
						_cache[_pid]["children"][cid] = item;
					}
				}

			}
			for (var k in categoriesData_Data){
				__process(categoriesData_Data[k])
			}

			var _toJson = function(data, target){
				for (var b in data){
					var o = data[b];
					if (o["children"]){
						var orign = o["children"], items;
						if (orign["items"]){
							items = orign["items"];
							delete orign["items"];
						}

						o["children"] = [];
						_toJson(orign, o["children"]);
						if (items){
							for (var c in items){
								o["children"].push(items[c]);	
							}
						}
					}

					target.push(o);
				}
			}

			_toJson(_cache, bucket);

			return bucket;
		},
		b_scope: Beet.constants.customerServer,
		reader: {
			type: "json",
		}
	},
});

//TODO: 
// BUG: 关闭tab 再打开 store无法初始化
//
Ext.define("Beet.apps.Viewport.SettingViewPort", {
	extend: "Ext.panel.Panel",
	layout: {
		type: "hbox",
		align: "stretch",
	},
	height: "100%",
	shadow: true,
	frame: true,
	defaults: {
		border: 0
	},
	rootVisible: false,
	initComponent: function(){
		var that = this, customerServer = Beet.constants.customerServer;
		Ext.apply(this, {
			storeProxy: Ext.create("Beet.apps.Viewport.Setting.Store")
		});
		
		that.items = [
			that.createTreeList(),
			{
				xtype: 'splitter'   // A splitter between the two child items
			},
			that.createDetailPanel()
		];
		that.callParent(arguments);
	},
	afterRender: function(){
		var that = this;
		that.callParent(arguments);
	},
	createTreeList: function(){
		var that = this, store = that.storeProxy
		that.treeList = Ext.create("Ext.tree.Panel", {
			store: store,
			frame: true,
			lookMask: true,
			width: 230,
			height: 500,
			border: 0,
			useArrow: true,
			split: true,
			dockedItems: [
				{
					ptype: "tooltip",
					frame: true,
					items: [
						{
							html: "右键打开功能菜单, 进行编辑删除",
							frame: true,
						}
					],
				}
			]
		});
		//add event
			
		//click event
		var _itemClick = function(view, record, item, index, e, options){

		}

		var _addItem = function(widget, e){
			var parentMenu = widget.parentMenu, rawData = parentMenu.raw, leaf = parentMenu.leaf, method,
				customerServer = Beet.constants.customerServer;
			method = leaf ? customerServer.UpdateCTItem : customerServer.UpdateCTCategory;
			var needUpdateId = leaf ? rawData.typeId : rawData.cid;
			var formItems = [], actionName = leaf ? "customer_item" : "customer_category";
			var btnHandler;
			
			//项目
			if (leaf){
				for (var k in Beet.cache.configArgs[actionName]){
					var row = Beet.cache.configArgs[actionName][k],
						hidden = row.FieldHidden, label = row.FieldLabel, name = row.FieldName,
						item = {
							fieldLabel : label,
							name : name
						}
					switch (name){
						case "CTTypeID":
							break;
						case "CTTypeName":
							break;
						case "CTCategoryID":
							break;
						case "InputMode":
							break;	
					}

					formItems.push(item);
				}
				btnHandler = function(direction, e){
					var me = this, form = me.up("form").getForm(), result = form.getValues();
					//TODO
					console.log(result);
				}
			}else{
				for (var k in Beet.cache.configArgs[actionName]){
					var row = Beet.cache.configArgs[actionName][k]
						hidden = row.FieldHidden, label = row.FieldLabel, name = row.FieldName,
						item = {
							fieldLabel : label,
							name : name
						}
					switch (name){
						case "CTCategoryID":
							break;
						case "CTCategoryName":
							break;
						case "ParentCategoryID":
							break;
						case "ServiceType":
							break;
					}

					formItems.push(item)
				}

				btnHandler = function(direction, e){

				}
			}

			//开始弹出面板
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
					labelAlign: "left",
					labelWidth: 90
				},
				items: formItems,
				buttons: [
					{
						text: "提交",
						handler: btnHandler
					}
				]
			})
			

			//appendTo detailPanel
			var item = that.detailPanel.add({
				title : "添加" + (leaf ? "项目 " : "分类 "),
				inTab: true,
				items: [
					form
				]
			})

			that.detailPanel.setActiveTab(item)
		}

		var _editItem = function(widget, e){
			var parentMenu = widget.parentMenu, rawData = parentMenu.raw, leaf = parentMenu.leaf, method,
				customerServer = Beet.constants.customerServer;
			method = leaf ? customerServer.UpdateCTItem : customerServer.UpdateCTCategory;
			var needUpdateId = leaf ? rawData.typeId : rawData.cid;
			var formItems = [], actionName = leaf ? "customer_item" : "customer_category";
			var btnHandler;
			
			//项目
			if (leaf){
				for (var k in Beet.cache.configArgs[actionName]){
					var row = Beet.cache.configArgs[actionName][k],
						hidden = row.FieldHidden, label = row.FieldLabel, name = row.FieldName,
						item = {
							fieldLabel : label,
							name : name
						}
					switch (name){
						case "CTTypeID":
							item["value"] = rawData["typeId"]; 
							break;
						case "CTTypeName":
							item["value"] = rawData["text"];
							break;
						case "CTCategoryID":
							item["value"] = rawData["categoryId"];
							break;
						case "InputMode":
							item["value"] = rawData["inputmode"];
							break;	
					}

					formItems.push(item);
				}
				btnHandler = function(direction, e){
					var me = this, form = me.up("form").getForm(), result = form.getValues();
					//TODO
					console.log(result);
				}
			}else{
				for (var k in Beet.cache.configArgs[actionName]){
					var row = Beet.cache.configArgs[actionName][k]
						hidden = row.FieldHidden, label = row.FieldLabel, name = row.FieldName,
						item = {
							fieldLabel : label,
							name : name
						}
					switch (name){
						case "CTCategoryID":
							item["value"] = rawData["cid"];
							break;
						case "CTCategoryName":
							item["value"] = rawData["text"];
							break;
						case "ParentCategoryID":
							item["value"] = rawData["pid"];
							break;
						case "ServiceType":
							item["value"] = rawData["serviceType"];
							break;
					}

					formItems.push(item)
				}

				btnHandler = function(direction, e){

				}
			}

			//开始弹出面板
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
					labelAlign: "left",
					labelWidth: 90
				},
				items: formItems,
				buttons: [
					{
						text: "提交修改",
						handler: btnHandler
					}
				]
			})
			

			//appendTo detailPanel
			var item = that.detailPanel.add({
				title : "编辑" + (leaf ? "项目 " : "分类 ") + rawData.text,
				inTab: true,
				items: [
					form
				]
			})

			that.detailPanel.setActiveTab(item)
		}
		var _delItem = function(widget, e){
			var parentMenu = widget.parentMenu, rawData = parentMenu.raw, leaf = parentMenu.leaf, method,
				customerServer = Beet.constants.customerServer;
			method = leaf ? customerServer.DeleteCTItem : customerServer.DeleteCTCategory;
			var needDeleteId = leaf ? rawData.typeId : rawData.cid;
			var msg = "你是否需要删除" + (leaf ? "项目" : "分类") + ": " + rawData.text + " ?";
			Ext.MessageBox.show({
				title: "警告",
				msg: msg,
				buttons: Ext.MessageBox.YESNO,
				fn: function(btn){
					if (btn == "yes"){
						method.call(customerServer, needDeleteId, {
							success: function(){
								Ext.MessageBox.show({
									title: "删除成功",
									msg: "删除" + (leaf ? "项目" : "分类") + ": " + rawData.text + "成功",
									buttons: Ext.MessageBox.OK,
									fn: function(btn){
										//需要刷新页面 TODO
										//that.storeProxy.loadPage(that.storeProxy.currentPage);
									}
								})	
							},
							failure: function(error){
								Ext.Error.railse("删除失败" + error)
							}
						})
					}
				}
			})
		}

		var _itemRClick = function(view, record, item, index, e, options){
			var rawData = record.raw, leaf = record.isLeaf();
			
			var editDisabled = record.isRoot();

			if (!record.contextMenu){
				record.contextMenu = Ext.create("Ext.menu.Menu", {
					plain: true,
					items: [
						{text: "添加", handler: _addItem},
						{text: "编辑", handler: _editItem, disabled: editDisabled},
						{text: "删除", handler: _delItem, disabled: editDisabled}
					],
					raw : rawData,
					leaf: leaf
				})
			}

			e.stopEvent();
			record.contextMenu.showAt(e.getXY());

			return false;
		}
				
		that.treeList.on({
			'itemclick' : _itemClick,
			"beforeitemcontextmenu" : _itemRClick
		})
		
		return that.treeList;
	},
	createDetailPanel: function(){
		var that = this, customerServer = Beet.constants.customerServer;
		that.detailPanel = Ext.create("Ext.tab.Panel", {
			minWidth: 800,
			height: 400,
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
		return that.detailPanel;
	}
});
