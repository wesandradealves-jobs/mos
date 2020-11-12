'use strict';

/* global _app */

_app.service('Login', ['$http', 'AppConfig', function($http, AppConfig) {

  return {

    validate: function(login) {
      return $http.post(AppConfig.resources.login, login);
    }

  }

}]);
