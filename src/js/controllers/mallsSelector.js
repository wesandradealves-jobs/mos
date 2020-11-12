'use strict';

/* eslint-env browser */
/* global _app */
/* eslint no-var: off */

_app.controller('MallsSelectorController', [
'$scope', 'Session', 'PopUp', 'EventBus',
function ($scope, Session, PopUp, EventBus) {
  PopUp.hide();

  $scope.inputAll = false;
  $scope.user = Session.get('user');
  $scope.selectedMalls = {
    "-1": false
  };

  $scope.user.malls.forEach(function (mall) {
    $scope.selectedMalls[ mall.id.toString() ] = false;
  });

  EventBus.subscribeOnce('malls-load-dataset', function (malls) {
    window.dispatchEvent(new CustomEvent('malls-lightbox-load-dataset', {
      detail: {
        malls: malls
      }
    }));
  });

  $scope.selecionarTodos = function () {
    Object.keys($scope.selectedMalls)
    .filter(function (mallId) {
      return mallId !== '-1';
    }).forEach(function (mallId) {
      $scope.selectedMalls[mallId] = $scope.inputAll;
    });
  };

  $scope.checkedMalls = function () {
    var malls = [];

    Object.keys($scope.selectedMalls)
    .filter(function (mallId) {
      return mallId !== '-1';
    }).forEach(function (mallId) {
      if ($scope.selectedMalls[ mallId ]) {
        malls.push(Number(mallId));
      }
    });

    return malls;
  };

  $scope.saveMalls = function () {
    var malls = $scope.checkedMalls();

    if (!malls.length) {
      PopUp.alert('Selecionar Shoppings', 'Favor selecionar um shopping!');
      return;
    }

    EventBus.publish('malls-update-selection', malls);
  };

}]);
