'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('StorekeeperController', [
  '$scope', 'AppConfig','$compile',
  function (
    $scope,  AppConfig, $compile
  ) {

    $scope.mos2Url = AppConfig.resources.mos2.storekeeper;

    angular.element(document.getElementById('storekeeper-container'))
    .append($compile('<iframe id="storekeeper-react" src={{mos2Url}} scrolling="no" onLoad="iFrameResize()" data-hj-allow-iframe=""></iframe>'
    )($scope));

}]);

