'use strict';

/* eslint-env browser */
/* global _app */
/* eslint no-var: off */

_app.factory('Utils', [function () {

  var helpers = {};

  helpers.responseCallback = function (requestKey, promises, timestamps, getAllChartsData) {
    return function (malls, offset) {
      const querystring = helpers.serialize(malls, offset);
      const now = (new Date()).getTime();
      const timestamp = timestamps[querystring];
      let promise = promises[querystring];

      if (!promise || !timestamp || (now - timestamp) > 15000) {
        promises[querystring] = getAllChartsData(malls, offset);
        timestamps[querystring] = now;
        promise = promises[querystring];
      }

      return helpers.requestifyPromise(promise.then(function (responses) {
        return responses[requestKey];
      }));
    };
  };

  helpers.promisifyRequest = function (request) {
    return new Promise(function (resolve, reject) {
      request.success(resolve).error(reject);
    });
  };

  helpers.requestifyPromise = function (promise) {
    const request = {};

    request.success = function (callback) {
      promise = promise.then(callback);

      return request;
    };

    request.error = function (callback) {
      promise = promise.catch(callback);

      return request;
    };

    return request;
  };

  helpers.serialize = function (malls, offset) {
    let querystring = '';

    for (let i = 0; i < malls.length; i += 1) {
      querystring += `malls[${i}]=${malls[i]}&`;
    }

    querystring += `offset=${offset}`;
    return querystring;
  };

  helpers.formatPhoneNumber = function (number) {
    const digits = number.toString().split('');

    if (digits[0] === '0' && digits.length === 12) {
      digits.shift();
    }

    if (digits.length === 11) {
      const ddd = [ digits.shift(), digits.shift() ];

      const first = [
        digits.shift(),
        digits.shift(),
        digits.shift(),
        digits.shift(),
        digits.shift(),
      ];

      const second = [
        digits.shift(),
        digits.shift(),
        digits.shift(),
        digits.shift(),
      ];

      return `(${ddd.join('')}) ${first.join('')}-${second.join('')}`;
    }

    if (digits.length === 10) {
      const ddd = [ digits.shift(), digits.shift() ];

      const first = [
        digits.shift(),
        digits.shift(),
        digits.shift(),
        digits.shift(),
      ];

      const second = [
        digits.shift(),
        digits.shift(),
        digits.shift(),
        digits.shift(),
      ];

      return `(${ddd.join('')}) 9${first.join('')}-${second.join('')}`;
    }

    return number;
  };

  helpers.defer = function () {
    const deferred = {};

    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    return deferred;
  };

  helpers.labelGenerator = function (filter, input) {
    let scope = {};

    Object.keys(input).filter(key => !filter.includes(key)).forEach(function(key, index) {
      scope['prop' + (index + 1)] = key;
    });

    return scope;
  }

  helpers.deferred = helpers.defer;

  return helpers;
}]);
