'use strict';

_app.service('Settings', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

        getStoresByMall: function(mallId) {
            return $http.get(AppConfig.resources.settings.getStoresByMall + '/' + mallId);
        },

        getStore: function(storeId) {
            return $http.get(AppConfig.resources.settings.getStore + '/' + storeId);
        },

        createStore: function(store) {
          return $http.post(AppConfig.resources.settings.getStore, store);
        },

        updateStore: function (storeId, store) {
          return $http.put(AppConfig.resources.settings.getStore + '/' + storeId, store);
        },

        getEmployeeMall: function(mallId) {
          return $http.get(AppConfig.resources.settings.getEmployeeMall + '/' + mallId);
        },

        createEmployee: function(employee) {
          return $http.post(AppConfig.resources.settings.getEmployee, employee);
        },

        getEmployee: function(employeeId) {
            return $http.get(AppConfig.resources.settings.getEmployee + '/' + employeeId);
        },

        updateEmployee: function (employeeId, employee) {
            return $http.put(AppConfig.resources.settings.getEmployee + '/' + employeeId, employee);
        },

        getMccActivities: function() {
            return $http.get(AppConfig.resources.settings.getMccActivities);
        },

        getSegments: function() {
          return $http.get(AppConfig.resources.settings.getSegments);
        },

        createRole: function(role) {
            return $http.post(AppConfig.resources.settings.getRole, role);
        },

        updateRole: function(roleId, role) {
            return $http.put(AppConfig.resources.settings.getRole + '/' + roleId, role);
        },

        deleteRole: function(roleId) {
            return $http.delete(AppConfig.resources.settings.getRole + '/' + roleId);
        },

        getRolesByMall: function(mallId) {
            return $http.get(AppConfig.resources.settings.getRolesByMall + '/' + mallId);
        },

        getPermissions: function() {
            return $http.get(AppConfig.resources.settings.getPermissions);
        },

        getSegmentsByMall: function (mallId) {
          return $http.get(AppConfig.resources.settings.getSegmentsByMall + '/' + mallId);
        },

        setSegments: function (payload) {
          return $http.post(AppConfig.resources.settings.setSegments, payload);
        },
    };

}]);
