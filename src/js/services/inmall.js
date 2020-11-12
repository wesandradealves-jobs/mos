'use strict';

_app.service('InMallView', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

        serialize (malls, startDate, offset) {

    		var querystring = "";

    		for ( var i = 0; i < malls.length; i++ ) {
    			querystring += "malls["+  i +"]="+ malls[i] + '&'
            }

    		querystring += "startDate="+ startDate+ "&offset=" + offset;
    		return querystring;

    	},

        getAppInteractions: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getAppInteractions + '?' +  querystring);
		},

		getFacilitiesUse: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getFacilitiesUse + '?' +  querystring);
		},

		getBaseView: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getBaseView + '?' +  querystring);
		},

		getStoreSpending: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getStoreSpending + '?' +  querystring);
		},

		getWeeklyAppInteractions: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getWeeklyAppInteractions + '?' +  querystring);
		},

		getMixedMetrics: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getMixedMetrics + '?' +  querystring);
		},

		getModalityFlow: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getModalityFlow + '?' +  querystring);
		},

		getNewSignup: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getNewSignup + '?' +  querystring);
		},

		getDailySpending: function(malls, startDate, offset) {
			var querystring = this.serialize(malls, startDate, offset);
			return $http.get(AppConfig.resources.inmallView.getDailySpending + '?' +  querystring);
		}

    }

}]);
