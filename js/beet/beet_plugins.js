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
			this.fireEvent("checkchange", this, recordIndex, checked);
			return false;
		} else {
			return this.callParent(arguments);
		}
	},
	renderer: function(value){
		var cssPrefix = Ext.baseCSSPrefix,
			cls = [cssPrefix + 'grid-checkheader'];

		if (value){
			cls.push(cssPrefix + 'grid-checkheader-checked');
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
	pageParam: "page",
	/*
	 * @cfg {String} startParam 请求开始时候的参数名, 默认为start
	 */
	startParam: "start",
	/*
	 * @cfg {String} limitParam 请求数据数量的参数名, 默认为limit
	 */
	limitParam: "limit",
	filterParam: "filter",
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
	buildRequest: function(operation){
		var params = Ext.applyIf(operation.params || {}, this.b_params || {}),
			request = [];
		//params = Ext.applyIf(params, this.getParams(params, operation));

		request = this.getParams(params, operation);

		//operation.request = request;

		return request;
	},
	processResponse: function(operation, callback, scope, data){
		var that = this, 
			mc,
			reader = that.getReader();
		
		if (that.preProcessData && Ext.isFunction(that.preProcessData)){
			data = that.preProcessData(data);
		}

		var result = reader.read(data),
		records = result.records,
		length = records.length;

		//mc = Ext.create('Ext.util.MixedCollection', true, function(r) {return r.getId();});
		//mc.addAll(operation.records);

		Ext.apply(operation, {
			response: data,
			resultSet: result
		});

		operation.setCompleted();
		operation.setSuccessful();

		if (typeof callback == "function"){
			Ext.callback(callback, scope || that, [operation]);
		}
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
		params = params || {};
		var me = this,
			request = [],
			isDef = Ext.isDefined,
			page = operation.page,
			start = operation.start,
			limit = operation.limit,

			pageParam = me.pageParam,
			startParam = me.startParam,
			limitParam = me.limitParam,
			filterParam = me.filterParam;

		if (startParam && Ext.isDefined(params[startParam])){
			request.push(params[startParam]);
		}
		
		if (limitParam && isDef(params[limitParam])){
			request.push(params[limitParam]);
		}

		if (filterParam && isDef(params[filterParam])){
			request.push(params[filterParam]);
		}

		if (isDef(params["awhere"])){
			request.push(params["awhere"]);
		}

		if (isDef(params["b_onlySchema"])){
			request.push(params["b_onlySchema"]);
		}

		return request;
	},
	/*
	 *
	 * @param {}operation
	 * @param {Function} callback
	 * @param {}scope 
	 */
	doRequest: function(operation, callback, scope){
		var that = this, filter = "", filters = that.filters, method = that.b_method, writer = that.getWriter(), request = [], ajax_callback;
		
		request = that.buildRequest(operation);

		if (Ext.isFunction(method)){
			ajax_callback = {
				success: function(data){
					data = Ext.JSON.decode(data);
					that.processResponse(operation, callback, scope, data)
				},
				failure: function(error){
					Ext.Error.raise(error);
				}
			}
			request.push(ajax_callback);
			method.apply(that.b_scope, request);
		}else{
			if (Ext.isArray(method) && method.length > 1){
				var _cache = [], methods = method;//cache ajax data
				var __method = methods.pop();
				var ajax_callback = {
					success: function(data){
						_cache.push(data);
						if (methods.length == 0){
							that.processResponse(operation, callback, scope, _cache);
						}else{
							var _nextMethod = methods.pop();
							_nextMethod.apply(that.b_scope, request);
						}
					},
					failure: function(error){
						Ext.Error.raise(error);
					}
				}
				request.push(ajax_callback);
				__method.apply(that.b_scope, request);
			}
		}

		operation.setStarted();

		return request;
	},

	afterRequest: Ext.emptyFn,
	onDestroy: function(operation, callback, scope){
		Ext.destroy(this.reader, this.writer)
	}
})

Ext.define("Beet.plugins.contextMenu", {
	alias: "plugin.b_contextmenu",
	mixins: {
		observable: "Ext.util.Observable"
	},
	
	contextMenu: [],

	constructor: function(config){
		var that = this;
		Ext.apply(that, config);
	},

	//private
	init: function(grid){
		var that = this;
		that.grid = grid;
		that.view = grid.view;

		that.initEvents();
	},

	initEvents: function(){
		var that = this;
		that.initMouseTriggers();
	},
	startPopupByClick: function(view, record, item, index, e){
		this.Popup(record, e);
	},
	Popup: function(record, e){
		//raw 原始数据
		var that = this, data = record.data, raw = record.raw;
		e.stopEvent();
		if (!record.contextMenu){
			record.contextMenu = new Ext.menu.Menu({
				plain: true,
				items: that.contextMenu,
				rawData: raw
			})
		}
		var xy = e.getXY();
		record.contextMenu.showAt(xy);
		return false;
	},
	//private
	initMouseTriggers: function(){
		var that = this, view = that.view;
		//开始设定事件
		//mon addManagedListener
		that.mon(view, "beforeitemcontextmenu", that.startPopupByClick, that);
	}
});


Ext.define("Beet.plugins.LiveSearch",{
	extend: "Ext.grid.Panel",
	searchValue: null,
	indexes: [],
	currentIndex: null,
	searchRegExp: null,
	regExpMode: false,
	defaultStatusText: "没有找到",
	tagsRe: /<[^>]*>/gm,
	tagsProtect: '\x0f',
	regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm,
	matchCls: 'x-livesearch-match',
	initComponent: function(){
		var me = this;
		me.tbar = [
			'搜索', {
				xtype: "textfield",
				name: "searchField",
				hideLabel: true,
				width: 200,
				listeners: {
					change: {
						fn: me.onTextFieldChange,
						scope: this,
						buffer: 1000
					}
				}
			},{
				xtype: "button",
				text: "<",
				handler: me.onPreviousClick,
				scope: me,
				tooltip: "查找前一项"
			},
			{
				xtype: "button",
				text: ">",
				handler: me.onNextClick,
				scope: me,
				tooltip: "查找后一项"
			},
		]
		me.callParent(arguments);
	},
	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.textField = me.down('textfield[name=searchField]');
	},
	getSearchValue: function(){
		var me = this, value = me.textField.getValue();

		if (value ===''){return null;}

		if (!me.regExpMode){
			value = value.replace(me.regExpProtect, function(m) {
                return '\\' + m;
            });
		}else{
			try {
                new RegExp(value);
            } catch (error) {
                return null;
            }
            // this is stupid
            if (value === '^' || value === '$') {
                return null;
            }
		}
			
		var length = value.length, resultArray = [me.tagsProtect + '*'],
			i = 0,
			c;
            
		for(; i < length; i++) {
			c = value.charAt(i);
			resultArray.push(c);
			if (c !== '\\') {
				resultArray.push(me.tagsProtect + '*');
			}	 
		}
		return resultArray.join('');
	},
	onTextFieldChange: function(){
		var me = this, count = 0;

		me.view.refresh();

		me.searchValue = me.getSearchValue();
		console.log(me.searchValue);
		me.indexes = [];

		me.currentIndex = null;

         if (me.searchValue !== null) {
             me.searchRegExp = new RegExp(me.searchValue, 'g');
             
             me.store.each(function(record, idx) {
                 var td = Ext.fly(me.view.getNode(idx)).down('td'),
                     cell, matches, cellHTML;
                 while(td) {
                     cell = td.down('.x-grid-cell-inner');
                     matches = cell.dom.innerHTML.match(me.tagsRe);
                     cellHTML = cell.dom.innerHTML.replace(me.tagsRe, me.tagsProtect);
                     
                     // populate indexes array, set currentIndex, and replace wrap matched string in a span
                     cellHTML = cellHTML.replace(me.searchRegExp, function(m) {
                        count += 1;
                        if (Ext.Array.indexOf(me.indexes, idx) === -1) {
                            me.indexes.push(idx);
                        }
                        if (me.currentIndex === null) {
                            me.currentIndex = idx;
                        }
                        return '<span class="' + me.matchCls + '">' + m + '</span>';
                     });
                     // restore protected tags
                     Ext.each(matches, function(match) {
                        cellHTML = cellHTML.replace(me.tagsProtect, match); 
                     });
                     // update cell html
                     cell.dom.innerHTML = cellHTML;
                     td = td.next();
                 }
             }, me);

             // results found
             if (me.currentIndex !== null) {
                 me.getSelectionModel().select(me.currentIndex);
             }
         }

         // no results found
         if (me.currentIndex === null) {
             me.getSelectionModel().deselectAll();
         }

         me.textField.focus();

	},
	onPreviousClick: function(){
		var me = this, idx;
		
		if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx - 1] || me.indexes[me.indexes.length - 1];
            me.getSelectionModel().select(me.currentIndex);
        }
		
	},
	onNextClick: function(){
		var me = this, idx;
        if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
			me.currentIndex = me.indexes[idx + 1] || me.indexes[0];
			me.getSelectionModel().select(me.currentIndex);
        }
		
	}
});

Beet.constants.OperatorsList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: ">", name: "大于"},
		{ attr: ">=", name: "大于等于"},
		{ attr: "<", name: "小于"},
		{ attr: "<=", name: "小于等于"},
		{ attr: "=", name: "等于"},
		{ attr: "!=", name: "不等于"},
		{ attr: "LIKE", name: "约等于"}
	]
});

Beet.constants.monthesList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: 1, name: "01"},
		{ attr: 2, name: "02"},
		{ attr: 3, name: "03"},
		{ attr: 4, name: "04"},
		{ attr: 5, name: "05"},
		{ attr: 6, name: "06"},
		{ attr: 7, name: "07"},
		{ attr: 8, name: "08"},
		{ attr: 9, name: "09"},
		{ attr: 10, name: "10"},
		{ attr: 11, name: "11"},
		{ attr: 12, name: "12"}
	]	
})


Beet.constants.daysList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: 1, name: "01"},
		{ attr: 2, name: "02"},
		{ attr: 3, name: "03"},
		{ attr: 4, name: "04"},
		{ attr: 5, name: "05"},
		{ attr: 6, name: "06"},
		{ attr: 7, name: "07"},
		{ attr: 8, name: "08"},
		{ attr: 9, name: "09"},
		{ attr: 10, name: "10"},
		{ attr: 11, name: "11"},
		{ attr: 12, name: "12"},
		{ attr: 13, name: "13"},
		{ attr: 14, name: "14"},
		{ attr: 15, name: "15"},
		{ attr: 16, name: "16"},
		{ attr: 17, name: "17"},
		{ attr: 18, name: "18"},
		{ attr: 19, name: "19"},
		{ attr: 20, name: "20"},
		{ attr: 21, name: "21"},
		{ attr: 22, name: "22"},
		{ attr: 23, name: "23"},
		{ attr: 24, name: "24"},
		{ attr: 25, name: "25"},
		{ attr: 26, name: "26"},
		{ attr: 27, name: "27"},
		{ attr: 28, name: "28"},
		{ attr: 29, name: "29"},
		{ attr: 30, name: "30"},
		{ attr: 31, name: "31"}
	]	
});

Beet.constants.sexList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{ attr: 1, name: "先生"},
		{ attr: 2, name: "女士"}
	]	
});

Beet.constants.MarryList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{attr: 0, name: "未知"},
		{attr: 1, name: "未婚"},
		{attr: 2, name: '已婚'}
	]	
});

Beet.constants.NewUpdateModes = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{attr: 0, name: "电话"},
		{attr: 1, name: "短信"},
		{attr: 2, name: 'Email'},
		{attr: 3, name: '邮寄'},
		{attr: 4, name: '微薄'}
	]	
});

Beet.constants.EducationList = Ext.create("Ext.data.Store", {
	fields: ["attr", "name"],
	data: [
		{attr: 0, name: "大专"},
		{attr: 1, name: "本科"},
		{attr: 2, name: '硕士及以上'},
		{attr: 3, name: '其他'}
	]	
});

Beet.constants.EnjoyModeList = Ext.create("Ext.data.Store", {
	fields: ["attr"],
	data: [
		{attr: "友人介绍"},
		{attr: "杂志"},
		{attr: "广告"},
		{attr: "报纸"},
		{attr: "电视"},
		{attr: "网络"}
	]	
});
