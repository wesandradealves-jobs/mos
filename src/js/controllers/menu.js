'use strict';

/* eslint-env browser */
/* global _app */

_app.controller('MenuController', ['$scope', 'AppConfig',
  function($scope, AppConfig) {

    $scope.version = AppConfig.version;
    $scope.envLabel = AppConfig.envLabel;
    $scope.mos2RegisterUrl = AppConfig.resources.mos2.register;
    $scope.mos2Url = AppConfig.resources.mos2.url;

    /* Menu lateral */
    const mobileView = 992;
    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function(newValue) {
        if (newValue >= mobileView) {
            $scope.hamburguer = false;
            $scope.toggleSidebar = function(flag) {
                if (flag === true || flag === false) {
                    $scope.toggle = flag;
                } else {
                    $scope.toggle = !$scope.toggle;
                }
            };
        } else {
            $scope.hamburguer = true;
            $scope.clickSidebar = function() {
                $scope.toggle = !$scope.toggle;
            };
        }
    });

}]);
