'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('CoalitionController', [
  '$scope', 'AppConfig','$compile',
  function (
    $scope,  AppConfig, $compile
  ) {

    $scope.mos2Url = AppConfig.resources.mos2.coalition;

    angular.element(document.getElementById('coalition-container'))
    .append($compile('<iframe id="coalition-react" src={{mos2Url}} scrolling="no" onLoad="iFrameResize()" data-hj-allow-iframe=""></iframe>'
    )($scope));

}]);

