'use strict';

/* global _app */
/* eslint-env browser */
/* eslint no-var: off */

_app.factory('EventBus', [function () {

  var prefix = 'spot-metrics-';

  var publish = function (topic, object) {
    window.dispatchEvent(new CustomEvent(prefix + topic, {
      detail: object
    }));
  };

  var subscribe = function (topic, callback) {
    window.addEventListener(prefix + topic, function (event) {
      callback(event.detail);
    });
  };

  // reage só uma vez a um evento enviado, por sua
  // vez, otimiza memória e evita bugs estranhos
  var subscribeOnce = function (topic, callback) {
    window.addEventListener(prefix + topic, function (event) {
      callback(event.detail);
    }, { once: true });
  };

  window.addEventListener('keydown', function (data) {
    if (data.code === 'Escape') {
      publish(prefix + 'escape-button', { });
    } else if (data.code === 'Enter') {
      publish(prefix + 'enter-button', { });
    } else if (data.code === 'Tab') {
      publish(prefix + 'tab-button', { });
    } else {
      console.log('No known keyboard event redirected to event bus...');
    }
  });

  return {
    publish: publish,
    subscribe: subscribe,
    subscribeOnce: subscribeOnce
  };

}]);
