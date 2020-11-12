'use strict';

_app.controller('UserMenuController', [
          '$scope', 'ngDialog', 'PopUp', 'AppConfig', 'Session', 'Settings', '$location',
  function ($scope, ngDialog, PopUp, AppConfig, Session, Settings, $location) {

    //Pegando dados de usuário e lougout de sistema
    $scope.user = Session.get('user');
    $scope.userMalls = Session.get('malls');

    const nameParts = $scope.user.name.split(' ');
    $scope.user.firstName = nameParts.shift() || '';
    $scope.user.lastName = nameParts.pop() || '';

    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };


    // OPEN LIGHTBOX USER MENU
    $scope.openUserMenu = function () {
      ngDialog.open({
        template: 'partials/lightbox/user-menu.html',
        scope: $scope,
        controller: ['$scope', 'Session',
          function ($scope, Session) {

            $scope.employeeMall = Session.get('user');

           $scope.confirmPassword = function () {
              if (($scope.employeeMall.newPassword || $scope.employeeMall.newPasswordConfirmation) && $scope.employeeMall.newPassword != $scope.employeeMall.newPasswordConfirmation) {
                PopUp.alert(AppConfig.messages.settings.employee.title, "As senhas devem ser iguais!")
              }
            }

            $scope.saveUserUpdates = function() {
              PopUp.loading(AppConfig.messages.loading);

              if ( $scope.employeeMall.newPassword && $scope.employeeMall.newPassword == $scope.employeeMall.newPasswordConfirmation )
                $scope.employeeMall.password = $scope.employeeMall.newPassword;

              Settings.updateEmployee($scope.user.id, $scope.employeeMall).success(function (employee) {

                PopUp.success(AppConfig.messages.settings.employee.title,
                  AppConfig.messages.settings.employee.success, function () {
                    ngDialog.close();
                });

              }).error(function (error) {
                  PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
                  console.log(error.stack);
              });

            };

          }
        ]
      })
    }

  }
]);
