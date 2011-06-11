Ext.define("Beet.plugins.TabScrollerMenu", {
	alias: "plugin.tabscrollmenu",
	uses: ["Ext.menu.Menu"],
	pageSize: 10,
	maxText: 15,
	menuPrefixText: "Items",
	position: "left",
	constructor: function(config){
		config = config || {};
		Ext.apply(this, config);
	},
	init: function(tabPanel){
		var that = this;
		Ext.apply(tabPanel, that.parentOverrides);
		that.tabPanel = tabPanel;

		tabPanel.on({
			render: function(){
				that.tabBar = tabPanel.tabBar;
				that.layout = that.tabBar.layout;	
				that.layout.overflowHandler.handleOverflow = Ext.Function.bind(that.showButton, that);
				that.layout.overflowHandler.clearOverflow = Ext.Function.createSequence(that.layout.overflowHandler.clearOverflow, that.hideButton, that);
			},
			single: true
		})
	},
	showButton: function(){
		var that = this, 
			result = Ext.getClass(that.layout.overflowHandler).prototype.handleOverflow.apply(that.layout.overflowHandler, arguments);
		if (!that.menuButton){
			//移动到左边
			that.menuButton = that.tabBar.body.createChild({
				cls: Ext.baseCSSPrefix + 'tab-tabmenu-left'	
			}, that.tabBar.body.child("." + Ext.baseCSSPrefix + "box-scroller-left"));
			that.menuButton.addClsOnOver(Ext.baseCSSPrefix + "tab-tabmenu-over");
			that.menuButton.on("click", that.showTabsMenu, that)
		}
		that.menuButton.show();
		result.targetSize.width -= that.menuButton.getWidth();
		return result;
	},
	hideButton: function(){
		var that = this;
		if (that.menuButton){
			that.menuButton.hide();
		}
	},
	getPageSize:function(){
		return this.pageSize
	},
	setPageSize: function(pageSize){
		this.pageSize = pageSize
	},
	getMaxText: function(){
		return this.maxText
	},
	setMaxText:function(t){
		this.maxText = t;
	},
	getMenuPrefixText: function(){
		return this.menuPrefixText;
	},
	setMenuPrefixText: function(preText){
		this.menuPrefixText = preText
	},
	showTabsMenu: function(e){
		var that = this;
		if (that.tabsMenu){
			that.tabsMenu.removeAll();
		} else {
			that.tabsMenu = Ext.create("Ext.menu.Menu");
			that.tabPanel.on("destroy", that.tabsMenu.destroy, that.tabsMenu);
		}
		
		that.generateTabMenuItems();

		var target = Ext.get(e.getTarget())
		var xy = target.getXY();

		xy[1] += 24;

		that.tabsMenu.showAt(xy);
	},
	generateTabMenuItems: function(){
		var that = this, tabPanel = that.tabPanel,
			currentActive = tabPanel.getActiveTab(), totalItems = tabPanel.items.getCount(),
			pageSize = that.getPageSize, numSubMenus = Math.floor(totalItems/pageSize),
			remainder = totalItems % pageSize, currentPage, menuItems, item, start, index,
			i, x;

		if (totalItems > pageSize){
			for (i = 0; i < numSubMenus; i++){
				currentPage = ( i + 1 ) * pageSize;
				menuItems = []
				for (x = 0; x < pageSize; x++){
					index = x + currentPage - pageSize;
					item = tabPanel.items.get(index);
					menuItems.push(that.autoGenMenuItem(item))
				}

				that.tabsMenu.add({
					text: me.getMenuPrefixText() + ' ' + ( currentPage - pageSize + 1 ) + ' - ' + currentPage,
					menu: menuItems
				});
			}

			if (remainder > 0 ){
				start = numSubMenus * pageSize;
				menuItems = [];
				for (i = start; i < totalItems; i++){
					item = tabPanel.items.get(i);
					menuItems.push(that.autoGenMenuItem(item));
				}

				that.tabsMenu.add({
					text: me.getMenuPrefixText() + ' ' + ( start + 1 ) + ' - ' + (start + menuItems.length),
					menu: menuItems
				});
			}
		}else{
			tabPanel.items.each(function(item){
				if (item.id != currentActive.id && !item.hidden){
					that.tabsMenu.add(that.autoGenMenuItem(item));
				}
			});
		}
	},
	autoGenMenuItem: function(item){
		var maxText = this.getMaxText(),
			text = Ext.util.Format.ellipsis(item.title, maxText);

		return {
			text: text,
			handler: this.showTabFromMenu,
			scope: this,
			disabled: item.disabled,
			tabToShow: item,
			iconCls: item.iconCls
		}
	},
	showTabFromMenu: function(menuItem){
		this.tabPanel.setActiveTab(menuItem.tabToShow);
	}
});

Ext.define("Beet.plugins.TrayClock", {
	extend: "Ext.toolbar.TextItem",
	alias: "widget.trayclock",
	html: "&#160;",
	timeFormat: "G:i:s",
	tpl: "{time}",
	initComponent: function(){
		var that = this;
		that.callParent(arguments);

		if (typeof that.tpl == "string"){
			that.tpl = new Ext.XTemplate(that.tpl)
		}
	},
	afterRender: function(){
		var that = this;
		Ext.defer(that.updateTime, 100, that);
		//create a tip
		that.tooltip = Ext.create("Ext.tip.ToolTip", {
			target: that.id,
			trackMouse: true,
			html: "&#160;",
			listeners: {
				beforeshow: function(){
					that.tooltip.update((new Date()).toLocaleDateString());
				}
			}
		});

		that.callParent();
	},
	onDestroy:function(){
		var that = this;
		if (that.timer){
			clearTimeout(that.timer);
			that.timer = null;
		}
		that.callParent();
	},
	updateTime: function(){
		var that = this,
			date = Ext.Date.format(new Date(), that.timeFormat),
			dateStr = that.tpl.apply({
				time: date
			})
		if (that.lastText != dateStr){
			that.setText(dateStr);
			that.lastText = dateStr;	
		}
		that.timer = Ext.defer(that.updateTime, 1000, that);
	}
});

Ext.define("Beet.plugins.operatorColumn", {
	exten: "Ext.util.Observable",
	alias: "widget.operatorColumn",
	
	/**
	 * @cfg {Array}
	 *
	 * {{{
	 */
	actionEvent: "click",
	autoWidth: true,
	dataIndex: '',
	editable: false,
	header: "",
	isColumn: false,
	keepSelection: false,
	menuDisable: false,
	sortable: false,
	/*
	 * @cfg {String} tplGroup Template for group actions
	 * @private
	 */
	tplGroup: '',	
	/*
	 * @cfg {String} tplRow Template for row actions
	 */
	tplRow: '',
	hideMode: 'visibility',
	widthIntercept: 4,
	widthSlope: 21,
	// }}}
	constructor: function(){
		/*
		 * @event beforeaction
		 * 当动作触发前触发
		 * @param {Ext.grid.Panel} grid
		 * @param {Ext.data.Record} record  Record corresponing to row clicked
		 * @param {String} action Identifies the action icon clicked. Equals to icon css class name.
		 * @param {Integer} rowIndex Index of clicked grid row
		 * @param {Integer} colIndex Index of clicked grid column that contains all action icons
		 */
		'beforeaction',

		'action',

		'beforegroupaction',

		'groupaction'

		this.callParent(arguments);
	},
	init: function(grid){
		var that = this;
		that.grid = grid;
		that.id = that.id || Ext.id();

		var lookup = grid.getColumnModel().lookup;
		delete lookup[undefined]
		lookup[that.id] = that;

		//setup template
		if (!that.tpl){
			that.tpl = that.processActions(that.actions)
		}

		if (that.autoWidth){
			that.width = that.widthSlope * that.actions.length + that.widthIntercept;
			that.fixed = true;
		}

		/*
		var view = that.grid.getView();
		var cfg = {
			scope : that,
			that.actionEvent: that.onClick
		};
		
		grid.afterRender = grid.afterRender.createSequence(function(){
			view.mainBody.on(cfg);
			//grid.on("destroy", this.purgeListeners, this);
		});
		*/
	},
	/*
	 * Returns data to apply to template. Override this if needed.
	 * @param {Mixed} value
	 * @param {Object} cell object to set some attributes of the grid cell
	 * @param {Ext.data.Record} record from which the data is extracted
	 * @param {Number} row Index of the row
	 * @param {Number} ccl Index of the cell
	 * @param {Ext.data.Store} data to apply to template
	 *
	 * @return {Object} data to apply to template
	 */
	getData: function(value, cell, record, row, col, store){
		return record.data || {}
	},
	/*
	 * Processes actions configs and returns template
	 * @param {Array} actions
	 * @param {String} template(Optional). Template to use for one action item.
	 *
	 * @return {String}
	 * @private
	 */
	processActions: function(actions, template){
		var acts = [];
	},
	getAction: function(e){

	},
	onClick: function(){

	}
});


Ext.define("Beet.plugins.CheckColumn", {
	extend: "Ext.grid.column.Column",
	alias: "widget.checkcolumn",
	constructor: function(){
		this.addEvents(
			/*
			 * @event chechchange
			 * 监控checkbox是否被check/unckeck
			 * @param {Beet.plugins.CheckColumn} this
			 * @param {Number} rowIndex
			 * @param {Boolean} cheched true if the box is cheched 
			 */
			'checkchange'
		);
		
		this.callParent(arguments);
	},
	/**
	 *	构建event, 并且触发定制的event
	 */
	processEvent: function(type, view, call, recordIndex, cellIndex, e){
		if (type == "mousedown" || (type == "keydown" && (e.getKey() == e.ENTER || e.getKey() == e.SPACE)) ){
			var record = view.panel.store.getAt(recordIndex),
				dataIndex = this.dataIndex,
				checked = !record.get(dataIndex);

			record.set(dataIndex, checked);
			this.fireEvent("checkchange", this, recordIndex, cheched);
			return false;
		} else {
			return this.callParent(arguments);
		}
	},
	renderer: function(value){
		var cssPrefix = Ext.baseCSSPrefix,
			cls = [cssPrefix + 'grid-checkheader'];

		if (value){
			css.push(cssPrefix + 'grid-checkheader-checked');
		}
		
		return '<div class="' + cls.join(' ') + '">&#160;</div>';
	}
});

//重写获取数据结构
Ext.define("Beet.plugins.proxyClient", {
	extend: "Ext.data.proxy.Proxy",
	alias: "proxy.b_proxy",
	uses: ['Ext.data.Request'],
	/*
	 * @cfg {String} pageParam 请求页数时候的参数名, 默认为page
	 */
	//pageParam: "page",
	/*
	 * @cfg {String} startParam 请求开始时候的参数名, 默认为start
	 */
	//startParam: "start",
	/*
	 * @cfg {String} limitParam 请求数据数量的参数名, 默认为limit
	 */
	//limitParam: "limit",
	filterParam: "",
	filters: [],
	//sortParam: "sort",
	directionParam: "dir",
	/*
	 * @cfg {Boolean} noCache (可选) 默认为true, Disable caching by adding a unique parameter name to the request
	 */
	noCache: true,
	cacheString: "_dc",
	
	/*
	 * @cfg {Object} b_scope 设置调用callback函数时候的作用域
	 */
	b_scope: undefined,

	/*
	 * @cfg {Function} b_method callback函数. 如果没用设定将抛出异常
	 */
	b_method: undefined,
	
	constructor: function(config){
		var that = this;
		config = config || {}
		this.addEvents(
			'exception'
		);
	
		that.callParent([config])
		if (!config.b_method){
			Ext.Error.raise("No process function specified for this proxy");
		}

		that.nocache = that.nocache;
	},
	
	create: function(){
		return this.doRequest.apply(this, arguments);
	},
	read: function(){
		return this.doRequest.apply(this, arguments);
	},
	update: function(){
		return this.doRequest.apply(this, arguments);
	},
	destroy: function(){
		return this.doRequest.apply(this, arguments);
	},

	processResponse: function(operation, callback, scope, data){
		var that = this, reader = that.getReader(),
			result = reader.read(data);
		
		Ext.apply(operation, {
			resultSet: result
		});

		operation.setCompleted();
		operation.setSuccessful();
		Ext.callback(callback, scope || that, [operation]);
	},
	setException: function(){

	},
	applyEncoding: function(value){
		return Ext.encode(value)
	},

	encodeFilters: function(filters){
		var min = [], length = filters.length, i = 0;
		for (; i < length; i++){
			min[i] = {
				property: filters[i].property,
				value: filters[i].value
			}
		}

		return this.applyEncoding(min)
	},
	getParams: function(params, operation){
		var that = this, filters = operation.filters,
			filterParam = that.filter

		if (filters && filterParam && filters.length > 0){
			params[filterParam] = that.encodeFilters(filters);
		}
	
		return params;
	},
	/*
	 *
	 * @param {}operation
	 * @param {Function} callback
	 * @param {}scope 
	 */
	doRequest: function(operation, callback, scope){
		/**
		 * @param {Function} ajax_callback user custom callback
		 */
		var that = this, filter = "", filters = that.filters, method = that.b_method, writer = that.getWriter(), request = [], ajax_callback;

		if (Ext.isDefined(filters["filter"])){
			filter = that.encodeFilters(filters["filter"]);
		}
		
		//add filter
		request.push(filter);//filters
		
		//add arguments
		if (Ext.isDefined(filters["b_onlySchema"])){
			request.push(filters["b_onlySchema"]);	
		}
		
		//ajax callback
		ajax_callback = {
			success: function(data){
				data = Ext.JSON.decode(data);
				that.processResponse(operation, callback, scope, data)
			},
			failure: function(error){
				console.log(error);
			}
		}
		request.push(ajax_callback);

		if (Ext.isFunction(this.b_method)){
			method.apply(that.b_scope, request);
		}
	},

	afterRequest: Ext.emptyFn,
	onDestroy: function(operation, callback, scope){
		Ext.destroy(this.reader, this.writer)
	}
})
