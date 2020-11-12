'use strict';
_app.factory('Session', [function() {

  return {
    get: function(field) {
      if ( sessionStorage.sessionSpot ) {
        var tmp = JSON.parse(sessionStorage.sessionSpot);
        return tmp[field];
      } else
        return {};
    },

    set: function(field, value) {
      if ( sessionStorage.sessionSpot ) {
        var tmp = JSON.parse(sessionStorage.sessionSpot);
        tmp[field] = value;
        sessionStorage.sessionSpot = JSON.stringify(tmp);
      } else {
        var tmp = {};
        tmp[field] = value;
        sessionStorage.sessionSpot = JSON.stringify(tmp);
      }
    },

    getAll: function() {
      if (! sessionStorage.sessionSpot )
        return {};

      return JSON.parse(sessionStorage.sessionSpot);
    },

    setAll: function(_obj) {
        sessionStorage.sessionSpot = JSON.stringify(_obj);
    },


/*
    getConfig: function(field) {
      if ( sessionStorage.configSpot )
        return sessionStorage.configSpot[field];
      else
        return {};
    },

    setConfig: function(field, value) {
      if (  sessionStorage.configSpot )
        sessionStorage.configSpot[field] = value;
      else {
        sessionStorage.configSpot = { };
        $sessionStorage.configSpot[field] = value;
      }
    },
*/

  }

}]);
