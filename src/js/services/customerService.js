'use strict';

_app.service('CustomerService', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

        //Customer Service
        getCustomerService: function() {
            return $http.get(AppConfig.resources.customerService.get);
        },

        getCustomerServiceByMall: function(mallId) {
            return $http.get(AppConfig.resources.customerService.get + '/mall/' + mallId);
        },

        create: function(customerService) {
            return $http.post(AppConfig.resources.customerService.get, customerService);
        },

        getCustomerServiceReason: function() {
            return $http.get(AppConfig.resources.customerService.getCustomerServiceReason);
        },

        send: function(mallId, role, customerService) {
            return $http.post(AppConfig.resources.customerService.systemChannels, {"mallId": mallId, "role": role, "customerService": customerService})
        },

        //Charts
        serialize: function (malls, origins, offset) {
          if (origins[0] !== 'todos') {
            origins = [ origins[0] ]; // cleanup of unselected origins
          } else {
            origins = ['presencial', 'telefone', 'outros'];
          }

      		var querystring = "";

      		for ( var i = 0; i < malls.length; i++ ) {
      			querystring += "malls["+  i +"]="+ malls[i] + '&'
              }

              for ( var i = 0; i < origins.length; i++ ) {
      			querystring += "origins["+  i +"]="+ origins[i] + '&'
              }

      		querystring += "offset=" + offset;
      		return querystring;
        },

        getDailyAttendance: function(malls, origins, offset) {
            var querystring = this.serialize(malls, origins, offset);
            return $http.get(AppConfig.resources.customerService.getDailyAttendance + '?' +  querystring);
        },

        getStatusFlow: function(malls, origins, offset) {
            var querystring = this.serialize(malls, origins, offset);
            return $http.get(AppConfig.resources.customerService.getStatusFlow + '?' +  querystring);
        },

        getAttendanceReason: function(malls, origins, offset) {
            var querystring = this.serialize(malls, origins, offset);
            return $http.get(AppConfig.resources.customerService.getAttendanceReason + '?' +  querystring);
        },

        getWeeklyAttendance: function(malls, origins, offset) {
            var querystring = this.serialize(malls, origins, offset);
            return $http.get(AppConfig.resources.customerService.getWeeklyAttendance + '?' +  querystring);
        },

        getAttendanceScore: function(malls, origins, offset) {
            var querystring = this.serialize(malls, origins, offset);
            return $http.get(AppConfig.resources.customerService.getAttendanceScore + '?' +  querystring);
        },

        getAverageScore: function(malls, origins, offset) {
            var querystring = this.serialize(malls, origins, offset);
            return $http.get(AppConfig.resources.customerService.getAverageScore + '?' +  querystring);
        }

    }

}]);
