'use strict';

/* global _app */

_app.service('BabyCare', ['$http', 'AppConfig', 'Utils',
function($http, AppConfig, Utils) {
    const promises = {}; // cache
    const timestamps = {};

    const serialize = Utils.serialize;
    const promisifyRequest = Utils.promisifyRequest;
    const responseCallback = Utils.responseCallback;

    // Charts
    function getVisitsByDayRequest (malls, offset) {
        const querystring = serialize(malls, offset);
        return $http.get(`${AppConfig.resources.babyCare.getVisitsByDay}?${querystring}`);
    }

    function getCategoriesRequest (malls, offset) {
        const querystring = serialize(malls, offset);
        return $http.get(`${AppConfig.resources.babyCare.getCategories}?${querystring}`);
    }

    function getVisitsRequest (malls, offset) {
        const querystring = serialize(malls, offset);
        return $http.get(`${AppConfig.resources.babyCare.getVisits}?${querystring}`);
    }

    function getRecurrenceRequest (malls, offset) {
        const querystring = serialize(malls, offset);
        return $http.get(`${AppConfig.resources.babyCare.getRecurrence}?${querystring}`);
    }

    function getConversionsRequest (malls, offset) {
        const querystring = serialize(malls, offset);
        return $http.get(`${AppConfig.resources.babyCare.getConversions}?${querystring}`);
    }

    function getAverageConsumptionRequest (malls, offset) {
        const querystring = serialize(malls, offset);
        return $http.get(`${AppConfig.resources.babyCare.getAverageConsumption}?${querystring}`);
    }

    function getAllChartsData (malls, offset) {
      const requests = [
        getVisitsByDayRequest(malls, offset),
        getCategoriesRequest(malls, offset),
        getVisitsRequest(malls, offset),
        getRecurrenceRequest(malls, offset),
        getConversionsRequest(malls, offset),
        getAverageConsumptionRequest(malls, offset)
      ];

      return Promise.all(requests.map(promisifyRequest)).then(function (responses) {
        return {
          visitsByDay: responses[0],
          categories: responses[1],
          visits: responses[2],
          recurrence: responses[3],
          conversions: responses[4],
          averageConsumption: responses[5]
        };
      });
    }

    return {
        serialize: serialize,

        //Baby Care
        getListBabyCare: function (malls) {
            const querystring = serialize(malls);
            return $http.get(`${AppConfig.resources.babyCare.get}?${querystring}`);
        },

        getActivities: function() {
            return $http.get(AppConfig.resources.babyCare.getActivities);
        },

        getUsages: function() {
            return $http.get(AppConfig.resources.babyCare.getUsages);
        },

        create: function(babyCare) {
            return $http.post(AppConfig.resources.babyCare.get, babyCare);
        },

        getById: function (babycareId) {
          return $http.get(`${AppConfig.resources.babyCare.get}/${babycareId}`);
        },

        addUsageType: function (babycareId, usageId) {
          const route = `${AppConfig.resources.babyCare.get}/${babycareId}/add-usage/${usageId}`;
          return $http.post(route, {});
        },

        addActivityType: function (babycareId, activityId) {
          const route = `${AppConfig.resources.babyCare.get}/${babycareId}/add-activity/${activityId}`;
          return $http.post(route, {});
        },

        getVisitsByDay: responseCallback('visitsByDay', promises, timestamps, getAllChartsData),
        getCategories: responseCallback('categories', promises, timestamps, getAllChartsData),
        getVisits: responseCallback('visits', promises, timestamps, getAllChartsData),

        getRecurrence: responseCallback('recurrence', promises, timestamps, getAllChartsData),
        getConversions: responseCallback('conversions', promises, timestamps, getAllChartsData),
        getAverageConsumption: responseCallback('averageConsumption', promises, timestamps, getAllChartsData),
    };

}]);
