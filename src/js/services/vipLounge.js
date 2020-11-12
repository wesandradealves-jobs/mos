'use strict';

/* global _app */
_app.service('VipLounge', ['$http', 'AppConfig', 'Utils',
function($http, AppConfig, Utils) {
  const promises = {}; // cache
  const timestamps = {};

  const serialize = Utils.serialize;
  const promisifyRequest = Utils.promisifyRequest;
  const responseCallback = Utils.responseCallback;

  function getVisitsRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getVisits}?${querystring}`);
  }

  function getVisitsOnlyRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getVisitsOnly}?${querystring}`);
  }

  function getRecurrenceRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getRecurrence}?${querystring}`);
  }

  function getPermanenceRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getPermanence}?${querystring}`);
  }

  function getAverageConsumptionRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getAverageConsumption}?${querystring}`);
  }

  function getLowerRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getLower}?${querystring}`);
  }

  function getHigherRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getHigher}?${querystring}`);
  }

  function getMeanRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getMean}?${querystring}`);
  }

  function getAutoForcedRequest (malls, offset) {
      const querystring = serialize(malls, offset);
      return $http.get(`${AppConfig.resources.vipLounge.getAutoForced}?${querystring}`);
  }

  function getAllChartsData (malls, offset) {
    const requests = [
      getVisitsRequest(malls, offset),
      getVisitsOnlyRequest(malls, offset),
      getRecurrenceRequest(malls, offset),
      getPermanenceRequest(malls, offset),
      getAverageConsumptionRequest(malls, offset),
      getLowerRequest(malls, offset),
      getHigherRequest(malls, offset),
      getMeanRequest(malls, offset),
      getAutoForcedRequest(malls, offset)
    ];

    return Promise.all(requests.map(promisifyRequest)).then(function (responses) {
      return {
        visits: responses[0],
        visitsOnly: responses[1],
        recurrence: responses[2],

        permanence: responses[3],
        averageConsumption: responses[4],
        lower: responses[5],

        higher: responses[6],
        mean: responses[7],
        autoForced: responses[8]
      };
    });
  }

    return {
        serialize: serialize,

        //Vip Lounge
        getListVipLounge: function (mallId) {
            return $http.get(`${AppConfig.resources.vipLounge.get}/${mallId}`);
        },

        exitVipLounge: function (clientId, enterDate, vipLounge) {
            return $http.put(AppConfig.resources.vipLounge.exit + '/' + clientId + '/' + enterDate, vipLounge);
        },

        getCanAccess: function (clientId, mallId) {
            return $http.get(`${AppConfig.resources.vipLounge.canAccess}/${clientId}/${mallId}`);
        },

        enterVipLounge: function(vipLounge) {
            return $http.post(AppConfig.resources.vipLounge.enter, vipLounge);
        },

        getVisits: responseCallback('visits', promises, timestamps, getAllChartsData),
        getVisitsOnly: responseCallback('visitsOnly', promises, timestamps, getAllChartsData),
        getRecurrence: responseCallback('recurrence', promises, timestamps, getAllChartsData),

        getPermanence: responseCallback('permanence', promises, timestamps, getAllChartsData),
        getAverageConsumption: responseCallback('averageConsumption', promises, timestamps, getAllChartsData),
        getLower: responseCallback('lower', promises, timestamps, getAllChartsData),

        getHigher: responseCallback('higher', promises, timestamps, getAllChartsData),
        getMean: responseCallback('mean', promises, timestamps, getAllChartsData),
        getAutoForced: responseCallback('autoForced', promises, timestamps, getAllChartsData),
    };

}]);
