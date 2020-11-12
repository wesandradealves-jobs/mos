'use strict';

/* global _app */

_app.service('ClientMall', [
  '$http', 'AppConfig', 'Utils',
  function($http, AppConfig) {
    const ClientMall = {};

    ClientMall.getClientMall = function (clientId, mallId) {
        return $http.get(`${AppConfig.resources.clientMall.getClientMall}/${clientId}/${mallId}`);
    };

    ClientMall.sendClubAcceptance = function (clientMall) {
        return $http.post(AppConfig.resources.clientMall.sendClubAcceptance, clientMall);
    };

    ClientMall.getBestClient = function (mallId) {
        return $http.get(AppConfig.resources.clientMall.getBestClient + '/' + mallId);
    };

    ClientMall.update = function (obj) {
        return $http.put(AppConfig.resources.clientMall.updateTargeting + '/' + obj.mallId + '/' + obj.clientId, obj);
    }

    return ClientMall;
  }
]);
