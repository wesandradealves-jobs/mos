'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('CustomerServiceExtController', [
  '$scope', 'AppConfig','$compile',
  function (
    $scope,  AppConfig, $compile
  ) {

    $scope.mos2Url = AppConfig.resources.mos2.sac;
    angular.element(document.getElementById('sac-container'))
    .append($compile('<iframe id="sac-react" src={{mos2Url}} scrolling="no"  onLoad="iFrameResize()" data-hj-allow-iframe=""></iframe>'
    )($scope));
}]);

