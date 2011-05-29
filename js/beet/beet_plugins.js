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
