'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('EmailBuilderExtController', [
  '$scope', 'PopUp', 'AppConfig',
  function ($scope, PopUp, AppConfig) {

    window.addEventListener('message', messageHandler, false);

    function messageHandler(event) {
      const { action, key, value } = event.data;
      if (action == 'handleEmail') {
        switch (key) {
          case 'delete':
            PopUp.success(AppConfig.messages.channel.email.title,
              'E-mail excluido com sucesso.', $scope.closeThisDialog({ emailId: value }));
            break;
          case 'create':
            PopUp.success(AppConfig.messages.channel.email.title,
              'E-mail criado com sucesso.', $scope.closeThisDialog({ emailId: value }));
            break;
          case 'update':
            PopUp.success(AppConfig.messages.channel.email.title,
              'E-mail atualizado com sucesso.', $scope.closeThisDialog({ emailId: value }));
            break;
          case 'error':
            PopUp.alert(AppConfig.messages.channel.email.title,
              'Erro ao realizar operação. Verique a conexão de rede.', $scope.closeThisDialog({ emailId: value }));
            break;
          default:
            PopUp.alert(AppConfig.messages.channel.email.title,
              'Verique a conexão de rede', $scope.closeThisDialog({ emailId: value }));
        }
      }
    }

    window.sendEmailIdIframe = function() {
      const iframe = document.getElementById('emailBuilder-react');
      var iframeEvent = new Event('message');
      iframe.contentWindow.postMessage({
        action: 'loadEmail',
        key: 'emailId',
        value: $scope.dialogParams.emailId
      }, "*");
    }

    $scope.mos2Url = AppConfig.resources.mos2.emailBuilder;
}]);

