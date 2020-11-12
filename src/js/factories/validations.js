'use strict';

/* global _app, moment */

_app.factory('Validations', [
  function () {
    const Validations = {};

    Validations.birthday = function (date) {
      if (!date) {
        return false;
      }

      const birthday = moment(date);
      return birthday.isBefore(moment());
    };

    return Validations;
  }
]);
