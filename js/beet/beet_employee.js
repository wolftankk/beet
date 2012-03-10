Ext.namespace("Beet.apps.employees");

Ext.onReady(function(){
    Ext.syncRequire([
        "employees.addemployee",
        "employees.employeelist"
    ])
});
