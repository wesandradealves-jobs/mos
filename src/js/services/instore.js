'use strict';

_app.service('InStoreView', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

        serialize (storeId, offset) {
    		var querystring = "storeId="+ storeId + "&offset=" + offset;
    		return querystring;
		},
		
        serializeMall (mallId) {
    		var querystring = "mallId="+ mallId;
    		return querystring;
    	},

        getClient: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			return $http.get(AppConfig.resources.instoreView.getClient + '?' +  querystring);
		}, 

		getAverageTicket: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			return $http.get(AppConfig.resources.instoreView.getAverageTicket + '?' +  querystring);
		}, 

		getSelling: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			return $http.get(AppConfig.resources.instoreView.getSelling + '?' +  querystring);
		},

		getTotalUniqueClients: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			return $http.get(AppConfig.resources.instoreView.getTotalUniqueClients + '?' +  querystring);
		},

		getTransactionQuantity: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			return $http.get(AppConfig.resources.instoreView.getTransactionQuantity + '?' +  querystring);
		},

		getTransactionValue: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			return $http.get(AppConfig.resources.instoreView.getTransactionValue + '?' +  querystring);
		},

		getStoreTransactions: function(storeId, offset) {
			var querystring = this.serialize(storeId, offset);
			console.log(AppConfig.resources.instoreView.getStoreTransactions);
			console.log(querystring);
			console.log(AppConfig.resources.instoreView.getStoreTransactions + '?' +  querystring);

			return $http.get(AppConfig.resources.instoreView.getStoreTransactions + '?' +  querystring);
		},

		getStores: function(mallId, search) {
			var body = {
				mallId: mallId,
				search: search,
			};
			return $http.post(AppConfig.resources.instoreView.getStores, body);
		},

		getTopStore: function(mallId) {
			var querystring = this.serializeMall(mallId);
			console.log(AppConfig.resources.instoreView.getTopStore);
			console.log(querystring);
			console.log(AppConfig.resources.instoreView.getTopStore + '?' +  querystring);

			return $http.get(AppConfig.resources.instoreView.getTopStore + '?' +  querystring);
		},
		
    }

}]);
