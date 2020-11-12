'use strict';

_app.service('Client', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

        getByCPF: function(cpf) {
            return $http.get(AppConfig.resources.client.get + '/' + cpf);
        },

        getById: function (clientId) {
          return $http.get(AppConfig.resources.client.get + '/id/' + clientId.toString());
        },

        create: function(client) {
            return $http.post(AppConfig.resources.client.get, client);
        },

        update: function(clientId, client) {
            return $http.put(AppConfig.resources.client.get + '/' + clientId, client);
        }

    }

}]);
