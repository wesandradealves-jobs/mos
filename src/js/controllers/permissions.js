'use strict';

/* eslint-env browser */
/* global _app */

_app.controller('PermissionsController', [
  '$scope', 'Permission',
  function ($scope, Permission) {
    // model de somente leitura pelo menu lateral incluido nas rotas
    // pela tag ng-include de templates
    $scope.menuPermissions = Permission.menuPermissions();
  }
]);
