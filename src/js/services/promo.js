'use strict';

/* global _app */
/* eslint
  semi: off,
  quotes: off,
  comma-dangle: off */

_app.service('Promo', ['$http', 'AppConfig', function ($http, AppConfig) {
  return {

    /*
    getByCPF: function(cpf) {
        return $http.get(AppConfig.resources.client.get + '/' + cpf);
    },

    create: function(client) {
        return $http.post(AppConfig.resources.client.get, client);
    },

    update: function(clientId, client) {
        return $http.put(AppConfig.resources.client.get + '/' + clientId, client);
    },
    */

    getPromoTypes: function () {
      return $http.get(AppConfig.resources.mallPromotion.promotionTypes);
    },

    getPromoLabels: function () {
      return $http.get(AppConfig.resources.mallPromotion.promotionLabels);
    },

    newPromo: function (promo) {
      return $http.post(AppConfig.resources.mallPromotion.newPromotion, promo);
    },

    getPromos: function (malls) {
      var query = [];
      for (var i = 0; i < malls.length; i++) {
        query[i] = "malls[]=" + malls[i].toString();
      }
      query = "?" + query.join('&');
      return $http.get(AppConfig.resources.mallPromotion.getPromotions + query);
    },

    publishPromo: function (promotionId) {
      return $http.post(
        AppConfig.resources.mallPromotion.promotion + "/" + promotionId.toString() + "/publish"
      );
    },

    publishFederalDraw: function (promotionId, winnerSequences) {
      return $http.post(
        AppConfig.resources.mallPromotion.promotion + "/" + promotionId.toString() + "/publish-federal-draw", {
          winnerSequences: winnerSequences
        }
      );
    },

    excludePromo: function (promotionId) {
      return $http.post(
        AppConfig.resources.mallPromotion.promotion + "/" + promotionId.toString() + "/exclude"
      );
    },

    editPromo: function (promotionId, changes) {
      return $http.post(
        AppConfig.resources.mallPromotion.promotion + "/" + promotionId.toString() + "/edit",
        changes
      );
    },

    getGiftRights: function (promotionId, clientId) {
      const cId = '/gift-rights' + (clientId ? '/' + clientId.toString() : '');

      return $http.get(
        AppConfig.resources.mallPromotion.promotion + "/" + promotionId.toString() + cId
      );
    },

    redeemGift: function (promotionId, clientId, giftId) {
      let cId = '/redeem-gift' + (clientId ? '/' + clientId.toString() : '');
      cId = cId + (giftId ? '?giftId=' + giftId.toString() : '');

      return $http.post(
        AppConfig.resources.mallPromotion.promotion + "/" + promotionId.toString() + cId
      );
    },

    // === graphics ==========================================================================
    getTotalRaffleTickets: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.totalRaffleTickets + query
      );
    },

    getTotalClients: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.totalClients + query
      );
    },

    getAverageClientTicket: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.averageClientTicket + query
      )
    },

    getTotalTransactions: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.totalTransactions + query
      )
    },

    getAverageTxTicket: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.averageTxTicket + query
      );
    },

    getTotalPurchase: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.totalPurchase + query
      )
    },

    getCrossedChartsView: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.crossedChartsView + query
      );
    },

    getPromotionPerformance: function(promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(AppConfig.resources.mallPromotionGraphics.getPromotionPerformance + query);
    },

    getSalesPerStore: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.salesPerStore + query
      );
    },

    getTotalDailySales: function (promotionId) {
      const query = '?promotionId=' + promotionId.toString();

      return $http.get(
        AppConfig.resources.mallPromotionGraphics.totalDailySales + query
      );
    }
  };
}]);
