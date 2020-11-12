'use strict';

_app.service('CustomerView', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

    	getClientByCpf: function(cpf) {
  			return $http.get(AppConfig.resources.customerView.getClientByCpf + '/' + cpf);
      },

      getClientByNameAndCpf: function(search) {
        return $http.post(AppConfig.resources.customerView.getClientByNameAndCpf, search);
      },

      getClientByCpfMall: function(cpf, objMalls) {

        let malls  = "";
        for ( let i=0; i < objMalls.length; i++ ) {
          malls += objMalls[i].id + ",";
        }

        return $http.get(AppConfig.resources.customerView.getClientByCpfMall + '/' + cpf + '/' + malls);
      },

      getEditClient: function(cpf, mall) {
  			return $http.get(AppConfig.resources.customerView.getClientByCpfMall + '/' + cpf + '/' + mall);
  		},

      getTransactionalData: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getTransactionalData + '/' + clientId + '/' + mallId);
  		},

  		getRegistrationData: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getRegistrationData + '/' + clientId + '/' + mallId);
  		},

  		getEngagementData: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getEngagementData + '/' + clientId + '/' + mallId);
  		},

  		getPurchaseBySegment: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getPurchaseBySegment + '/' + clientId + '/' + mallId);
  		},

  		getSpending: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getSpending + '/' + clientId + '/' + mallId);
  		},

  		getAppUse: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getAppUse + '/' + clientId + '/' + mallId);
  		},

  		getFacilitiesUse: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getFacilitiesUse + '/' + clientId + '/' + mallId);
  		},

  		getTopStores: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getTopStores + '/' + clientId + '/' + mallId);
  		},

  		getTopStoresAlike: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getTopStoresAlike + '/' + clientId + '/' + mallId);
  		},

  		getBuyerProfile: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getBuyerProfile + '/' + clientId + '/' + mallId);
  		},

  		getEventsPropension: function(clientId, mallId) {
  			return $http.get(AppConfig.resources.customerView.getEventsPropension + '/' + clientId + '/' + mallId);
  		},

    }

}]);
