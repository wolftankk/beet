Ext.namespace("Beet.apps.employees");

(function(window){
    Ext.syncRequire([
        "employees.addemployee",
        "employees.employeelist"
    ]);

    var getDepartmentList, getSubbrachesList;
    function getDepartmentList(){
	var employeeServer = Beet.constants.employeeServer;
	employeeServer.GetDepartmentData("", false, {
	    success: function(data){
		data = Ext.JSON.decode(data);
		data = data["Data"];
		list = [];
		for (var c in data){
		    var d = data[c];
		    list.push(
			{attr: d["MD_DEPID"], name: d["MD_DEPNAME"]}
		    );
		}
		Beet.cache.employee.departmentList = list;
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})
    }

    function getSubbrachesList(){
	var employeeServer = Beet.constants.employeeServer;
	employeeServer.GetStoreData("", false, {
	    success: function(data){
		data = Ext.JSON.decode(data);
		data = data["Data"];
		list = [];
		list.push({attr: "-1", name: "&nbsp;"});
		for (var c in data){
		    var d = data[c];
		    list.push(
			{attr: d["MD_StoreID"], name: d["MD_StoreName"]}
		    );
		}

		Beet.cache.employee.branchesList = list;
		(function(){
		    var me = this;
		    if (Beet.cache.branchesList == undefined){
			Beet.cache.branchesList = Ext.create("Ext.data.Store", {
			    fields: ["attr", "name"],
			    data: Beet.cache.employee.branchesList
			});
		    }
		})();
	    },
	    failure: function(error){
		Ext.Error.raise(error);
	    }
	})
    }


    if (Beet.cache.employee == undefined){
	Beet.cache.employee = {}
    }
    if (Beet.cache.employee.departmentList == undefined){
	getDepartmentList();
    }
    if (Beet.cache.employee.branchesList == undefined){
	getSubbrachesList();
    }
})(window);
