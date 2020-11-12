'use strict';

// push (
//     id SERIAL NOT NULL PRIMARY KEY,
//     heading VARCHAR(40) NOT NULL,
//     content VARCHAR(200),
//     url VARCHAR(200),
//     photo VARCHAR(200),
//     android_color VARCHAR(6),
//     send_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
//     send_after TIMESTAMP WITHOUT TIME ZONE,
//     created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
//     description VARCHAR(500)
// );

/* global _app */

_app.controller('PushController', ['$scope', 'PopUp', 'AppConfig', 'Channel',
  'EventBus',
  function ($scope, PopUp, AppConfig, Channel, EventBus) {

    var params = $scope.dialogParams;

    $scope.mode = params.mode;
    $scope.push = {};

    // Validação de campos
    $scope.pushHeadingError = false;
    $scope.validatePushHeading = function () {
      $scope.pushHeadingError = !$scope.push.heading;
    };

    $scope.pushError = false;
    $scope.validatePush = function () {
      $scope.pushError = !$scope.push.content;
    };

    if ( params.mode != 'CREATE' ) {
      //params.pushId;
      loadPush();
    }

    function close () {
      $scope.closeThisDialog( { pushId: $scope.push.id } );
      //value: {val1: 10, val2: 500, val3: "Yeah!"} -> função $scope.closeThisDialog()
      //value: "$document" -> clicou fora
      //value: "$closeButton" -> clicou no botão de fechar
      //value: "$escape" -> clicou no esc
    }

    function loadPush () {

      PopUp.loading(AppConfig.messages.channel.push.loading);

      Channel.getPush( params.pushId ).success(function (_push) {
        $scope.push = _push;

        PopUp.hide();

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.push.title, AppConfig.messages.apiGenericError);

        console.log(error);

      });

    }

    //$scope.$on('ngDialog.closed', function () {
    //  console.log("Vai fechar!");
    //  $scope.closeThisDialog( { val1: 10, val2: 500, val3: "Yeah!" } );
    //});


    $scope.createPush = function () {

      PopUp.loading(AppConfig.messages.channel.push.creating);

      Channel.createPush( $scope.push ).success(function (fetchedPush) {

        $scope.push = fetchedPush;

        console.log($scope.push);

        PopUp.success(AppConfig.messages.channel.push.title,
          AppConfig.messages.channel.push.success, function () {

            close();

          });

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.push.title, AppConfig.messages.apiGenericError);

        console.log(error);

      });

    };

    $scope.updatePush = function() {

      PopUp.loading(AppConfig.messages.channel.push.updating);

      Channel.updatePush($scope.push.id, $scope.push).success(function (fetchedPush) {

          $scope.push = fetchedPush;

          console.log($scope.push);

          PopUp.success(AppConfig.messages.channel.push.title,
            AppConfig.messages.channel.push.success, function () {

              close();

            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.channel.push.title, AppConfig.messages.apiGenericError);

          console.log(error);

        });
    }

    $scope.deletePush = function() {

      PopUp.confirm(AppConfig.messages.channel.push.title, AppConfig.messages.channel.push.deleteMsg, function(resp) {

        if ( !resp ) {
          PopUp.hide();
          return;
        }

        PopUp.loading(AppConfig.messages.channel.push.deleting);

        Channel.deletePush(params.push.campaignId, $scope.push.id).success(function () {

          $scope.push = {};

          PopUp.success(AppConfig.messages.channel.push.title,
            AppConfig.messages.channel.push.success, function () {
              // não importa o controlador origem/pai, o evento vai ser
              // enviado pra quem estiver ouvindo...
              EventBus.publish('flash-reload-flash-list', {});
              EventBus.publish('campaign-reload-campaign-list', {});
              close();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.channel.push.title, AppConfig.messages.apiGenericError);

          console.log(error);

        });

      });

    }

  }]);
