'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('LoanController', [
  '$scope', 'AppConfig','$compile',
  function (
    $scope,  AppConfig, $compile
  ) {

    $scope.mos2Url = AppConfig.resources.mos2.loan;

    angular.element(document.getElementById('loan-container'))
    .append($compile('<iframe id="loan-react" src={{mos2Url}} scrolling="no" onLoad="iFrameResize()"></iframe>'
    )($scope));

}]);

