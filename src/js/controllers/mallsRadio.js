'use strict';

/* global _app */

_app.controller('MallsRadioController', [
  '$scope', 'Session', 'PopUp', 'ngDialog', 'EventBus',
  function ($scope, Session, PopUp, ngDialog, EventBus) {
    PopUp.hide();

    $scope.radioControl.saveMall = function() {

      if ( !$scope.radioControl.selectedMall ) {
        PopUp.alert("Selecionar Shoppings", "Favor selecionar um shopping!");
        return;
      }

      console.log($scope.radioControl.selectedMall);

      EventBus.publish("customer-view-update-mall", {
        mallName: $scope.radioControl.selectedMall.name,
        mallId: $scope.radioControl.selectedMall.id
      })

      ngDialog.close();
    };
  }
])
