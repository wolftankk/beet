Ext.define("Beet.apps.HeaderPanel", {
    extend: "Ext.panel.Panel",
    width: "100%",
    autoHeight: true,
    autoScroll: true,
    layout: "fit",
    renderTo: "header",
    shadow: true,
    border: 0,
    initComponent: function(){
	var me = this;
	//目录设置面板
	me.getOperatorList();
	//将所有的子panel加入到此列表中
	Beet.cache.containerList = {};

	me.configurePanel = new Ext.tab.Panel(me.getCPanelConfig());

	//当框体变动的时候 进行自动调整大小
	Ext.EventManager.onWindowResize(me.fireResize, me);
	me.callParent(arguments);

	me.add(me.configurePanel);
	me.addDocked(
	    Ext.create("Beet.apps.HeaderToolbar", {
	       configurePanel: me.configurePanel    
	    })
	)
	me.doLayout();
    },
    _updateMenu: function(item){
	var _key = item["_key"];
	if (Beet.menus[_key]){
	    item.b_loaded = true;
	    var panel = item.add(
		{
		    xtype: "container",
		    layout: "hbox",
		    flex: 1,
		    defaultType: "buttongroup",
		    defaults: {
			height: 100
		    }
		}
	    );
	    Beet.menus[_key].panel = panel;
	    if (Beet.menus[_key] && Beet.menus[_key].menus){
		var menus = Beet.menus[_key].menus;
		for (var menuName in menus){
		    if (!menus[menuName].panel){
			menus[menuName].panel = panel.add(
			    {
				xtype: "buttongroup",
				title: menus[menuName].title,
				layout: "anchor",
				width: 150,
				defaults: {
				    scale: "large",
				    rowspan: 1
				}
			    }
			)
			menus[menuName].panel.on("add", function(frame){
			    var btns = frame.items.items;
			    if (btns.length == 0){return;}
			    setTimeout(
				function(){
				    var totalWidth = 30;
				    for (var b = 0; b < btns.length; b++){
					var btn = btns[b];
					if (btn.getWidth && btn.el){
					   totalWidth += btn.getWidth();
					}else{
					    totalWidth += 60
					}
				    }
				    if (totalWidth > 100){
					frame.setWidth(totalWidth);
				    }
				}, 
				10
			    );
			});
		    }
		    if (menus[menuName].data && menus[menuName].data.length > 0){
		       for (var a = 0; a < menus[menuName].data.length; ++a){
			   menus[menuName].panel.add(menus[menuName].data[a])
		       }
		    }
		}
	    }
	}
    },
    refreshMenu: function(){
	var me = this;
	var tabs = me.configurePanel.tabBar.items.items;
	for (var c = 0; c < tabs.length; ++c){
	    tabs[c].addListener("activate", function(tab){
		if (!!tab.card.b_loaded){ return; }
		me._updateMenu(tab.card)
	    })
	};
	setTimeout(function(){
	    var activeTab = me.configurePanel.getActiveTab();
	    me._updateMenu(activeTab)
	}, 100)
    },
    getOperatorList: function(__callback){
        //获取权限
        if (Beet.cache.Operator == undefined){
            Beet.cache.Operator = {};
        }
        var that = this, customerServer = Beet.constants.customerServer, employeeServer = Beet.constants.employeeServer;

        //客户
        customerServer.GetOperatorList(Beet.constants.RES_CUSTOMER_IID, {
            success: function(data){
                Beet.cache.Operator.customer = data.split(",");
                that.updatePanelStatus();
            },
            failure: function(error){
            }
        });

        //员工
        employeeServer.GetOperatorList(Beet.constants.RES_DEPARTMENT_IID, {
            success: function(data){
                Beet.cache.Operator.employee = data.split(",");
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });

        //store
        customerServer.GetOperatorList(Beet.constants.RES_STORE_IID, {
            success: function(data){
                Beet.cache.Operator.store = data.split(",");
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    updatePanelStatus: function(){
        var that = this;
        
        for (var k in Beet.constants.privileges){
            var privilege = Beet.constants.privileges[k], btn = that.query("#"+k), hidden = false, c = 0;
            while (true){
                var p = privilege[c];
                if (p == undefined){
                    break;
                }
                if (Beet.cache.Operator.customer.indexOf(p) > -1){
                    hidden = hidden || false;
                }else{
                    hidden = hidden || true;
                }
                c++;
            }
            if (hidden && btn[0]){
                btn[0].hide();
            }
        }
    },
    getCPanelConfig: function(){
        var items = [];
        for (var type in Beet.menus){
            items.push({
                title: Beet.menus[type].title,
                _key: type,
                tabConfig: {
                    minWidth: 100
                }
            });
        }
        
        var config = {
            border: 1,
            width: '100%',
            height: 80,//fixed by ext4.0.7
            autoHeight: true,
            autoWidth: true,
            autoScroll: true,
            layout: "fit",
            id: "configurePanel",
            plain: true,
            minTabWidth: 100,
            bodyStyle: "background-color: #dfe8f5",
            defaults: {
                bodyStyle: "background-color: #dfe8f5"
            },
            items: items
        }

        return config;
    },
    fireResize: function(w, h){
        Beet.constants.WORKSPACE_HEIGHT = h;
        Beet.constants.WORKSPACE_WIDTH = w;
        Beet.constants.VIEWPORT_HEIGHT = h - 137;

        if (w < 960){
            //donothing
        }else{
            this.setWidth(w);
        }
    }
})

Ext.define("Beet.apps.HeaderToolbar", {
    extend: "Ext.toolbar.Toolbar",
    height: 30,
    width: "100%",
    cls: "beet-navigationbar",
    useQuickTips: true,
    //设置两个私有属性, 为了与ext不冲突 使用 b_xxx 命名
    b_collapseDirection : 'top',
    b_collapsed: false,
    b_collapsedCls: 'collapsed',
    border: 0,
    initComponent: function(){
        var that = this, privilegeServer = Beet.constants.privilegeServer;
        if (that.useQuickTips){
            Ext.QuickTips.init();
        }

        ////导航栏toolbar
        that.navigationToolbar = new Ext.toolbar.Toolbar(that.getNavitionConfig());
        that.navigationToolbar.parent = that;

        ////username
        that.logoutButton = new Ext.toolbar.Toolbar(that.getLogoutButtonConfig());
        that.helpButton = new Ext.toolbar.Toolbar(that.getHelpButtonConfig());
        that.toggleButton = new Ext.toolbar.Toolbar(that.getToggleButtonConfig());
        that.username = new Ext.toolbar.TextItem({
            text: "#"
        }); 

        that.items = [
            //about button / menu
            {
                xtype: "splitbutton",
                text: "美度"
            }, "-",
            that.navigationToolbar,
            "->",//设定到右边区域
            '-',
            //help
            "当前用户: ", that.username, '-', ' ', 
            that.logoutButton, ' ',
            that.toggleButton, ' ',
            that.helpButton,
            //add clock
            {
                xtype: "trayclock"
            }
        ];
        //
        that.callParent();
        Ext.defer(function(){
            Ext.EventManager.on(that.configurePanel.getTabBar().body, "click", that.onTabBarClick, that);
        }, 1);
        that.b_collapseDirection = that.b_collapseDirection || Ext.Component.DIRECTION_TOP;
        that.updateUsername();
    },
    afterLayout: function(){
        var that = this;
        that.callParent();
    },
    updateUsername: function(){
        var me = this, privilegeServer = Beet.constants.privilegeServer, employeeServer = Beet.constants.employeeServer;
        privilegeServer.GetUserInfo({
            success: function(data){
                var data = Ext.JSON.decode(data);
                data = data["Data"];
                var guid = data[0]["UserGUID"];
                var UserName = data[0]["UserName"];

                Beet.cache.currentEmployGUID = guid;
                employeeServer.GetEmployeeData(0, 1, "em_userid='" + guid + "'", false, {
                    success: function(_data){
                        _data = Ext.JSON.decode(_data)["Data"];
                        if (_data[0] && _data[0]["EM_NAME"]){
                            me.username.setText(_data[0]["EM_NAME"]);
                            Beet.cache.currentEmployStoreID = _data[0]["EM_STOREID"];
                            Beet.cache.currentEmployStoreName = _data[0]["EM_STORENAME"];
                            Beet.cache.currentEmployName = _data[0]["EM_NAME"];
                        }else{
                            me.username.setText(UserName);
                            Beet.cache.currentEmployStoreID = -1;
                            Beet.cache.currentEmployName = UserName;
                        }
                    },
                    failure: function(error){
                        Ext.Error.raise(error);
                    }
                });
            },
            failure: function(error){
                Ext.Error.raise(error);
            }
        });
    },
    //获取导航栏配置
    getNavitionConfig: function(){
        var that = this, config;
        var configurePanel = that.configurePanel, navigationTab = configurePanel.getTabBar();
        //remove tab from tabpanel dockeditems
        configurePanel.removeDocked(navigationTab, false);
        navigationTab.dock = "";
        navigationTab.setWidth(600);
        navigationTab.setHeight(23);
        navigationTab.border=0;

        config = {
            cls: "beet-navtoolbar",
            width: 600,
            autoWidth: true,
            items: [
                "&#160;",
                navigationTab    
            ],
            enableOverflow: false
        }
        return config
    },
    getLogoutButtonConfig: function(){
        var that = this, config;
        config = {
            layout: "fit",
            items: [
                {
                    xtype: "button",
                    text: "退出",
                    tooltip: "安全退出美度ERP系统",
                    handler: function(){
                        var customerLoginServer = Beet.constants.customerLoginServer;
                        customerLoginServer.Logout({
                            success: function(){
                                Ext.util.Cookies.clear("userName");
                                Ext.util.Cookies.clear("userId");
                                Ext.util.Cookies.clear("sessionId");
                                window.location = "index.html";    
                            },
                            failure: function(){
                                window.location = "index.html";        
                            }
                        });    
                    }
                }
            ]
        };
        return config;
    },
    //右边区域
    getHelpButtonConfig: function(){
        var that = this, config;
        config = {
            layout: "fit",
            items: [
                {
                    xtype: "tool",
                    type: "restore",
                    handler: function(){
                        if (document.body.webkitRequestFullScreen){
                            document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                        }else{
                            document.body.mozRequestFullScreen()
                        }
                        //refresh
                        setTimeout(function(){
                            location.reload();
                        }, 500);

                        //document.addEventListener("fullscreenchange", function(){
                        //    console.log(1)
                        //}, false)
                    },
                    tooltip: "切换至全屏模式"
                }
            ]
        }
        return config;
    },
    getToggleButtonConfig: function(){
        var that = this, config;
        
        //创建expand/collapse工具
        that.collapseTool = that.expandTool = that.createComponent({
            xtype: 'tool',
            type: 'collapse-' + that.b_collapseDirection,
            //expandType:
            handler: Ext.Function.bind(that.toggleCollapse, that, []),
            scope: that
        });
        config = {
            layout: "fit",
            items: [
                that.collapseTool
            ]
        };
        return config;
    },
    toggleCollapse: function(){
        var that = this;
        if (that.b_collapsed){
            that.expand();
        }else{
            that.collapse(that.b_collapseDirection);
        }
        return that
    },
    expand: function(){
        if (!this.b_collapsed || this.fireEvent('beforeexpand', this) === false ){
            return false;
        }
        var that = this, parent = that.ownerCt, configurePanel = that.configurePanel, c = Ext.Component,
        direction=that.b_expandDirection, anim,
        toolbarHeight = that.getHeight(), toolbarWidth = that.getWidth();
        
        if (that.collapseTool){
            that.collapseTool.disable();
        }

        //update tool style
        if (that.collapseTool){
            that.collapseTool.setType("collapse-"+that.b_collapseDirection);
        }
        that.b_collapsed = false;
        configurePanel.show();

        that.removeClsWithUI(that.b_collapsedCls);
        anim = {
            to: {
            },
            from: {
                height: toolbarHeight,
                width: toolbarWidth
            },
            listeners: {
                afteranimate: that.afterExpand,
                scope: that
            }
        }
        if (direction == c.DIRECTION_TOP || direction == c.DIRECTION_BOTTOM){
            parent.setCalculatedSize(parent.width, null);
            anim.to.height = parent.getHeight();
            parent.setCalculatedSize(parent.width, anim.from.height);
        }
        
        parent.animate(anim);
        return that;
    },
    afterExpand: function(){
        var that = this, parent = that.ownerCt, configurePanel = that.configurePanel;
        parent.setAutoScroll(parent.initialConfig.autoScroll);
        parent.suspendLayout=null;

        var h = Ext.core.Element.getViewHeight();
        Beet.constants.VIEWPORT_HEIGHT = h - 137;
        if (Beet.workspace){
            Beet.workspace.setAutoScroll(false);
            Beet.workspace.setHeight(h - 112)
            Beet.workspace.setAutoScroll(true);
        }

        if (parent.ownerCt){
            parent.ownerCt.doLayout();
        }
        that.fireEvent("expand", that);
        if (that.collapseTool){
            that.collapseTool.enable();
        }

        //update children
        for (var childName in Beet.cache.containerList){
            var child = Beet.cache.containerList[childName];
            if (child && child.setHeight){
                child.setHeight(Beet.constants.VIEWPORT_HEIGHT - 1);
            }
        }
    },
    getOppositeDirection: function(direction){
        var c = Ext.Component;
        switch (direction){
            case c.DIRECTION_TOP:
                return c.DIRECTION_BOTTOM;
            case c.DIRECTION_BOTTOM:
                return c.DIRECTION_TOP;
        }
    },
    collapse: function(direction){
        var that = this, parent = that.ownerCt, configurePanel = that.configurePanel, c = Ext.Component, newSize = 0,
        toolbarHeight = that.getHeight() + 2, toolbarWidth = that.getWidth(),
        parentHeight = parent.getHeight(), parentWidth= parent.getWidth(), 
        panelHeight = configurePanel.getHeight(), panelWidth = configurePanel.getWidth(), pos = 0,
        anim = {
            from:{
                height: parentHeight,
                width: parentWidth
            },
            to: {
                height: toolbarHeight,
                width: toolbarWidth
            },
            listeners: {
                afteranimate: that.afterCollapse,
                scope: that
            },
            duration: Ext.Number.from(true, Ext.fx.Anim.prototype.duration)
        };

        if (!direction){
            direction = that.b_collapseDirection;
        }

        if (that.b_collapsed || that.fireEvent('beforecollapse', that, direction) === false){
            return false;
        }
        that.b_expandDirection = that.getOppositeDirection(direction);

        if (direction == c.DIRECTION_TOP){
            that.b_expandedSize = parent.getHeight();
        }
        
        //no scrollbars    
        parent.setAutoScroll(false);
        parent.suspendLayout = true;
        parent.body.setVisibilityMode(Ext.core.Element.DISPLAY);

        if (that.collapseTool){
            that.collapseTool.disable();
        }
        that.addClsWithUI(that.b_collapsedCls);

        //开始动画
        configurePanel.hide();
        parent.animate(anim);

        return that;
    },
    afterCollapse: function(){
        var that = this, configurePanel = that.configurePanel;
        var h = Ext.core.Element.getViewHeight();
        that.b_collapsed = true;
        Beet.constants.VIEWPORT_HEIGHT = h - 57;
        if (Beet.workspace){
            Beet.workspace.setAutoScroll(false);
            Beet.workspace.setHeight(h - 32);
            Beet.workspace.setAutoScroll(true);
        }
        if (that.collapseTool){
            that.collapseTool.setType("expand-"+that.b_expandDirection);
        }
        if (that.collapseTool){
            that.collapseTool.enable();
        }
        //update children
        for (var childName in Beet.cache.containerList){
            var child = Beet.cache.containerList[childName];
            if (child && child.setHeight){
                child.setHeight(Beet.constants.VIEWPORT_HEIGHT - 1);
            }
        }
    },
    onTabBarClick: function(){
        var that = this;
        if (that.b_collapsed){
            //fire expand
            //设置延迟执行函数 避免点击的时候界面乱掉
            Ext.defer(function(){
                that.toggleCollapse();
            }, 1);
        }
    }
});

Ext.define("Beet.apps.Viewport", {
    extend: "Ext.container.Container",    
    renderTo: "viewport",
    layout: "fit",
    floatable: false,
    border: 0,
    plain: true,
    initComponent: function(){
        var that=this;
        Ext.apply(this, {});

        Ext.EventManager.onWindowResize(that.fireResize, that);

        that.callParent();
        that.add(that.createMainPanel());
        that.doLayout();
        setTimeout(function(){
            that.readPound();
        }, 500);
    },
    onRender: function(){
        var that = this, h = Ext.core.Element.getViewHeight();
        ////自动计算高度 总高度 - menu高度
        that.setHeight(h-112);
        that.callParent(arguments);
    },
    createMainPanel: function(){
        var panel = Ext.create("Ext.tab.Panel", {
            border: false,
            maxTabWidth: 230,
            minTabWidth: 150,
            cls: "iScroll",
            width: "100%",
            id: "beet_workspace",
            height: Beet.constants.VIEWPORT_HEIGHT,
            shadow: true,
            layout: "anchor",
            defaults: {
                autoScroll: true,
                border: 0,
                closable: true,
                height: Beet.constants.VIEWPORT_HEIGHT,//child height
                bodyStyle: "background-color: #dfe8f5",
                plain: true
            },
            border: false,
            bodyStyle: "background-color: #dfe8f5",
            autoDestroy: true,
            listeners: {
                remove: function(container, item,opts){
                    var name = item.b_name;
                    if (!!name){
                        var hash = location.hash;
                        var title = name + ":" + item.title;
                        if (hash.indexOf("#") > -1){
                            var list = hash.substring(1);
                            var list = list.split("|");
                            if (Ext.Array.indexOf(list, title) > -1){
                                list = Ext.Array.remove(list, title);
                                hash = list.join("|");
                                location.replace("#"+hash);
                            }
                        }
                        
                        if (Beet.cache.menus[name]){
                            Beet.cache.menus[name] = null;
                            //remove
                            Beet.cache.containerList[name] = null;
                        }
                    }
                },
                add: function(component, item){
                    setTimeout(function(){
                        var name = item.b_name;
                        if (!!name){
                            var items = item.items;
                            var realPanel = items.getAt(0);
                            if (realPanel){
                                realPanel.setWidth(Beet.constants.WORKSPACE_WIDTH);
                                realPanel.setHeight(Beet.constants.VIEWPORT_HEIGHT - 1);
                                Beet.cache.containerList[name] = realPanel;

                                //force reset width & height
                                realPanel.addListener({
                                    resize: function(f, adjWidth, adjHeight, opts){
                                        f.setAutoScroll(false);
                                        f.setWidth(adjWidth);
                                        f.setHeight(adjHeight);
                                        f.doLayout();
                                        f.setAutoScroll(true)
                                    }
                                })
                            }
                        }
                    }, 100);
                }
            }
        })
        this.workspace = panel;
        return panel
    },
    fireResize: function(w, h){
        if (w >= 960){
            this.setWidth(w);
        }
        if (h > 300){
            this.setHeight(h - 112);
        }

        //update children
        for (var childName in Beet.cache.containerList){
            var child = Beet.cache.containerList[childName];
            if (child && child.setHeight && child.setWidth){
                child.setHeight(Beet.constants.VIEWPORT_HEIGHT - 1);
                child.setWidth(Beet.constants.WORKSPACE_WIDTH);
            }
        }
    },
    removePanel: function(name){
        var item = Beet.cache.menus[name];
        Beet.workspace.workspace.getTabBar().closeTab(item.tab);
        if (item){
            this.workspace.remove(item, true);
            item.close();
        }
        this.workspace.doLayout();
    },
    addPanel: function(name, title, config, notHash){
        var item = this.workspace.add(Ext.apply({
            inTab: true, 
            title: title,
            tabTip: title
        }, config));
        this.workspace.doLayout();

        item.b_name = name;
        Beet.cache.menus[name] = item;
        this.workspace.setActiveTab(item);

        if (notHash == false){
            return
        }

        var hash = location.hash;
        if (hash.indexOf("#") == -1){
            var url = "#" + name + ":" + title
            location.replace(url);
        }else{
            var list = hash.substring(1);
            var list = list.split("|");
            var title = name + ":" + title;
            if (Ext.Array.indexOf(list, title) == -1){
                hash += "|" + title;
                location.replace(hash);
            }
        }

    },
    readPound: function(){
        var hash = location.hash.substring(1);
        var list = hash.split("|"), me = this;
        if (list.length == 0){return;}
        for (var c =0; c < list.length; ++c){
            var app = list[c].split(":");
            var appName = app.shift();
            var title = app.shift()

            var app = appName.split(".");
            if (app.length == 1){
                continue;
            }
            var appNamespace = app.shift();
            var appMethod = app.shift();

            if (Beet.apps[appNamespace] && Beet.apps[appNamespace][appMethod]){
                me.addPanel(appName, title, {
                    items: [
                        Ext.create("Beet.apps."+appName)
                    ]    
                })
            }
        }
    }
});
