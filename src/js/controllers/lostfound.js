'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('LostFoundController', [
  '$scope', 'AppConfig','$compile',
  function (
    $scope,  AppConfig, $compile
  ) {

    $scope.mos2Url = AppConfig.resources.mos2.lostfound;

    console.log($scope.mos2Url);

    angular.element(document.getElementById('lostfound-container'))
    .append($compile('<iframe id="lostfound-react" src={{mos2Url}} scrolling="no" onLoad="iFrameResize()" data-hj-allow-iframe=""></iframe>'
    )($scope));

}]);

