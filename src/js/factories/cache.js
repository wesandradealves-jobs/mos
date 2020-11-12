'use strict';

/* global _app */
/* eslint-env browser */

_app.factory('Cache', [function () {
  const Cache = {};
  const prefix = 'spot-cache-';

  Cache.set = function (key, value, expiration) {
    const now = (new Date()).getTime();
    const data = JSON.stringify({
      value: value,
      expiresAt: now + expiration
    });

    localStorage.setItem(prefix + key, data);
  };

  Cache.get = function (key) {
    const now = (new Date()).getTime();
    const data = localStorage.getItem(prefix + key);
    const result = JSON.parse(data || '{}');

    result.expiresAt = result.expiresAt || now;

    if (now < result.expiresAt && result.value) {
      return result.value;
    } else {
      localStorage.removeItem(prefix + key);
      return null;
    }
  };

  return Cache;
}]);
