'use strict';

/* eslint-env browser */
/* global _app, moment */

_app.controller('CustomerDetailsController', [
  '$scope', '$route', '$location', 'ngDialog', 'PopUp', 'Client', 'EventBus',
  'Permission', 'CustomerService', 'AppConfig', 'Utils', 'Cache',
  function (
    $scope, $route, $location, ngDialog, PopUp, Client, EventBus,
    Permission, CustomerService, AppConfig, Utils, Cache
  ) {
    if (
      $scope.customerData.client.sex === 'F' || $scope.customerData.client.sex === 'f'
    ) {
      $scope.customerData.client.sex = 'Feminino'
    }
    else if (
      $scope.customerData.client.sex === 'M' || $scope.customerData.client.sex === 'm'
    ) {
      $scope.customerData.client.sex = 'Masculino'
    }
    else {
      $scope.customerData.client.sex = 'Outro';
    }

    const permissions = Permission.menuPermissions();
    $scope.canAccessCustomerView = permissions['ACCESS-CUSTOMERVIEW'];

    if ($scope.customerData.client.clientMall.clubAcceptance) {
      $scope.customerData.client.clientMall.clubAcceptance = 'Sim';
    } else {
      $scope.customerData.client.clientMall.clubAcceptance = 'Não';
    }

    // registerDate já vem formatado pelo controlador do fraldário
    $scope.customerData.client.birthday = moment(
      $scope.customerData.client.birthday, 'YYYY-MM-DD'
    ).format('DD/MM/YYYY');

    const names = $scope.customerData.client.fullName.split(' ');

    const clientMall = $scope.customerData.client.clientMalls.filter(function (item) {
      return item.mallId === $scope.customerData.mallId;
    })[0];

    const clubAcceptance = $scope.customerData.client.clientMall.clubAcceptance;

    $scope.data = {
      score: $scope.customerData.score,
      registerDate: $scope.customerData.registerDate,
      clientTargetingName: (clientMall && (clubAcceptance == 'Sim') ? clientMall.targeting.name : 'Prospect' ),
      clientName: $scope.customerData.client.fullName,
      clientFirstName: names[0],
      clientLastName: names[names.length - 1],
      clientCpf: $scope.customerData.client.cpf,
      clientEmail: $scope.customerData.client.email,
      clientPhone: Utils.formatPhoneNumber($scope.customerData.client.mobileNumber),
      clientBirthday: $scope.customerData.client.birthday,
      clientSex: $scope.customerData.client.sex,
      comment: $scope.customerData.comment,
      clientCep: $scope.customerData.client.address.zipCode,
      clientAcceptance: clubAcceptance,
    };

    if ($scope.parentController === 'BABYCARE') {
      $scope.data.babycareActivity = $scope.customerData.babycareActivities[0] || 'Nenhuma atividade';
      $scope.data.babycareUsage = $scope.customerData.babycareUsages[0] || 'Nenhum uso';
    } else if ($scope.parentController === 'CUSTOMERSERVICE') {
      $scope.data.reasonName = $scope.customerData.customerServiceReason.customerServiceReason.name;
    }

    $scope.seeCustomerView = function () {
      Cache.set('send-customer-view-data', {
          cpf: $scope.data.clientCpf,
          mallName: clientMall.mall.name,
          mallId: Number(clientMall.mall.id),
          clientId: Number($scope.customerData.clientId),
      }, 1500);

      ngDialog.close();
      $location.path('/customerView');
    };


    $scope.sendEmail = function() {

      $scope.mallId = $scope.customerData.mallId;
      $scope.role = $scope.customerService.role;
      $scope.customerService.customerServiceReason = {
        "customerServiceReason": {
          "name": $scope.rootReason
        }
      };

      if ($scope.customerService.role != "-1") {
        CustomerService.send($scope.mallId, $scope.role, $scope.customerData)
        .success(function () {
          PopUp.success(AppConfig.messages.customerService.title,
            AppConfig.messages.customerService.success);
        }).error(function () {
          PopUp.success(AppConfig.messages.customerService.title,
            AppConfig.messages.customerService.success);
        });
      }

    };

  }

]);
