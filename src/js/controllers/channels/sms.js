'use strict';

// sms (
//     id SERIAL NOT NULL PRIMARY KEY,
//     subject VARCHAR(20),
//     content VARCHAR(160) NOT NULL,
//     create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
//     send_after TIMESTAMP WITHOUT TIME ZONE,
//     description VARCHAR(500),
//     marketing BOOLEAN NOT NULL DEFAULT false
//     CONSTRAINT when_marketing_subject_required CHECK (NOT (marketing AND (subject IS NULL OR char_length(content) > (160 - (char_length(subject) + 11))))),
//     CONSTRAINT when_not_marketing_subject_optional CHECK (NOT (NOT marketing AND subject IS NOT NULL AND char_length(content) > (160 - (char_length(subject) + 1))))
// );

/* global _app */

_app.controller('SmsController', ['$scope', 'PopUp', 'AppConfig', 'Channel',
  'EventBus',
  function ($scope, PopUp, AppConfig, Channel, EventBus) {

    var params = $scope.dialogParams;


    $scope.mode = params.mode;
    $scope.sms = {};

    if ( params.mode != 'CREATE' ) {
      //params.smsId;
      loadSms();
    }

    function close () {
      $scope.closeThisDialog( { smsId: $scope.sms.id } );
      //value: {val1: 10, val2: 500, val3: "Yeah!"} -> função $scope.closeThisDialog()
      //value: "$document" -> clicou fora
      //value: "$closeButton" -> clicou no botão de fechar
      //value: "$escape" -> clicou no esc
    }

    function loadSms () {

      PopUp.loading(AppConfig.messages.channel.sms.loading);

      Channel.getSms( params.smsId ).success(function (_sms) {
        $scope.sms = _sms;

        PopUp.hide();

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.sms.title, AppConfig.messages.apiGenericError);

        console.log(error);

      });

    }

    //$scope.$on('ngDialog.closed', function () {
    //  console.log("Vai fechar!");
    //  $scope.closeThisDialog( { val1: 10, val2: 500, val3: "Yeah!" } );
    //});


    $scope.createSms = function () {

      PopUp.loading(AppConfig.messages.channel.sms.creating);

      Channel.createSms( $scope.sms ).success(function (fetchedSms) {

        $scope.sms = fetchedSms;

        console.log($scope.sms);

        PopUp.success(AppConfig.messages.channel.sms.title,
          AppConfig.messages.channel.sms.success, function () {

            close();

          });

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.sms.title, AppConfig.messages.apiGenericError);

        console.log(error);

      });

    };

    $scope.updateSms = function() {

      PopUp.loading(AppConfig.messages.channel.sms.updating);

      Channel.updateSms($scope.sms.id, $scope.sms).success(function (fetchedSms) {

          $scope.sms = fetchedSms;

          console.log($scope.sms);

          PopUp.success(AppConfig.messages.channel.sms.title,
            AppConfig.messages.channel.sms.success, function () {

              close();

            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.channel.sms.title, AppConfig.messages.apiGenericError);

          console.log(error);

        });
    }

    $scope.deleteSms = function() {

      PopUp.confirm(AppConfig.messages.channel.sms.title, AppConfig.messages.channel.sms.deleteMsg, function(resp) {

        if ( !resp ) {
          PopUp.hide();
          return;
        }

        PopUp.loading(AppConfig.messages.channel.sms.deleting);

        Channel.deleteSms(params.sms.campaignId, $scope.sms.id).success(function () {

          $scope.sms = {};

          PopUp.success(AppConfig.messages.channel.sms.title,
            AppConfig.messages.channel.sms.success, function () {
              // não importa o controlador origem/pai, o evento vai ser
              // enviado pra quem estiver ouvindo...
              EventBus.publish('flash-reload-flash-list', {});
              EventBus.publish('campaign-reload-campaign-list', {});
              close();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.channel.sms.title, AppConfig.messages.apiGenericError);

          console.log(error);

        });

      });

    }

  }]);
