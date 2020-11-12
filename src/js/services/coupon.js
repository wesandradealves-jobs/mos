'use strict';

_app.service('Coupon', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

        getPendents: function(mallIds, filter) {
          //return $http.get(AppConfig.resources.coupon.pendents + '/' + mallIds.join(','));
          return $http.post(AppConfig.resources.coupon.pendents + '/' + mallIds.join(','), filter);
        },

        getImages: function(couponId) {
            return $http.get(AppConfig.resources.coupon.images + '/' + couponId);
        },

        getLastApproveds: function(clientId, storeId) {
            return $http.get(AppConfig.resources.coupon.lastApproveds + '/' + clientId + '/' + storeId);
        },

        getPointReason: function () {
            return $http.get(AppConfig.resources.coupon.pointReason);
        },

        update: function(coupon) {
            var _dataToRequest = {
                employeeMallId: coupon.employeeMallId,
                clientPointStatusId: coupon.clientPointStatusId,
                clientPointReasonId: coupon.clientPointReasonId,
                lastOperation: coupon.lastOperation
            };

            return $http.put(AppConfig.resources.coupon.images + '/' + coupon.id, _dataToRequest);

        },

        byClient: function (clientId, mallIds) {
          let url = AppConfig.resources.coupon.byClient;
          url = url.replace(':clientId', clientId);
          url = url.replace(':mallIds', mallIds.join(','));

          return $http.get(url);
        },

    }


}]);
