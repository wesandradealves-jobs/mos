'use strict';

/* eslint-env browser */
/* global _app */

_app.controller('EditSegmentsController', [
  '$scope',
  function ($scope) {
    // $scope.segments = $scope.mallSegments;

    console.log($scope.segments);

    $scope.replyModifiedSegments = function () {
      $scope.closeThisDialog($scope.segments);
    };
  }
]);
