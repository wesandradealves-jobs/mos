'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('CustomerServiceController', [
  '$scope', '$route', '$q', '$location', 'CustomerService', 'ngDialog', 'DTColumnDefBuilder',
  'DTOptionsBuilder', 'Client', 'PopUp', 'AppConfig', 'Session', 'EventBus', 'Permission', 'ClientMall',
  'Validations', 'CustomerView',
  function (
    $scope, $route, $q, $location, CustomerService, ngDialog, DTColumnDefBuilder,
    DTOptionsBuilder, Client, PopUp, AppConfig, Session, EventBus, Permission, ClientMall,
    Validations, CustomerView
  ) {

    $scope.menuPermissions = Permission.menuPermissions();

    /* Pegando dados de usuário e logout de sistema */
    $scope.user = Session.get('user');
    $scope.userMalls = Session.get('malls');
    $scope.logout = function() {

        Session.setAll({});
        $location.path('/');
    };

    /* Validações de campo */
    $scope.mallError = false;
    $scope.validateMall = function () {
      $scope.mallError = !$scope.registerMall;
    };

    $scope.nameError = false;
    $scope.validateName = function () {
      $scope.nameError = !$scope.client.fullName;
    };

    $scope.cpfError = false;
    $scope.validateCpf = function () {
      $scope.cpfError = !$scope.client.cpf;
    };

    $scope.birthdayError = false;
    $scope.validateBirthday = function () {
      $scope.birthdayError = !Validations.birthday($scope.client.birthday);
    };

    $scope.sexError = false;
    $scope.validateSex = function () {
      $scope.sexError = !$scope.client.sex;
    };

    $scope.emailError = false;
    $scope.validateEmail = function () {
      $scope.emailError = !$scope.client.email;
    };

    $scope.phoneError = false;
    $scope.validatePhone = function () {
      $scope.phoneError = !$scope.client.mobileNumber;
    };

    $scope.zipCodeError = false;
    $scope.validateZipCode = function () {
      $scope.zipCodeError = !$scope.client.address.zipCode;
    };

    $scope.firstError = false;
    $scope.validateFirst = function () {
      $scope.firstError = !$scope.firstReason;
    };

    $scope.secondError = false;
    $scope.validateSecond = function () {
      $scope.secondError = !$scope.secondReason;
    };

    $scope.thirdError = false;
    $scope.validateThird = function () {
      $scope.thirdError = !$scope.thirdReason;
    };

    // --- trava a seleção do canal do termo de adesão -------------------------
    $scope.club = true;
    $scope.clubUnlock = function() {
      $scope.club = false;
    }

    $scope.clubLock = function() {
      $scope.club = true;
    }
    // -------------------------------------------------------------------------

    $scope.choiceMall = true;
    $scope.choiceCPF = true;

    $scope.unlockFields = function() {
      if ($scope.registerMall) {
        $scope.choiceMall = false;
        $scope.selectedTargeting = false;
        $scope.client = {};

        $scope.choiceCPF = true;
        $scope.secondLevel = false;
        $scope.thirdLevel = false;
        $scope.firstReason = -1;
        $scope.customerService = { };
        $scope.client.clubAcceptance = false;
      }
    }

    /* Limpeza das sessões dos gráficos */
    sessionStorage.graphic_data = JSON.stringify({});

/*
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('responsive', true);
    $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef([0, 1, 2, 3, 4]).notSortable()
    ];
*/

    $scope.dtOptions = {
      paging: true,
      ordering: true,
      processing: true,
      stateSave: false,
      order: [[0, 'desc']]
    };

    /* Registros */
    $scope.customerService = {};
    $scope.customerService.clientId = null;
    $scope.malls = Session.get('malls');
    $scope.customerService.originRegistry = AppConfig.originRegistry['CUSTOMERSERVICE'];
    $scope.customerService.employeeId = $scope.user.id;
    $scope.customerService.origin = "PRESENCIAL"

    $scope.client = {
      address: {},
    };

    $scope.client.clubAcceptance = false;

    $scope.loading = {
        dailyAttendance: 0,
        statusFlow: 0,
        attendanceReason: 0,
        weeklyAttendance: 0,
        attendanceScore: 0,
    };

    $scope.getData = function () {

      PopUp.loading(AppConfig.messages.loading);

      CustomerService.getCustomerServiceByMall($scope.controlMall).success(function(items) {
          PopUp.hide();
          $scope.customers = items.map(function (item) {
            item.registerDate = moment(item.registerDate, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
            return item;
          });
      }).error(function(error) {
          console.log(error.stack);
      });

    };

    $scope.clientExist = false;

    // callback de evento pra procurar e popular dados do cliente
    $scope.searchClient = function() {
      if ($scope.client.cpf && $scope.client.cpf.length == 11) {
        $scope.clientExist = false;
        $scope.choiceCPF = false;

        Client.getByCPF($scope.client.cpf).success(function(fetchedClient) {
          if (!fetchedClient) {
            // cliente não encontrado
            const cpf = $scope.client.cpf;

            $scope.client = {};
            $scope.customerService = {};

            $scope.client.cpf = cpf;
            $scope.client.clubAcceptance = false;

            return;
          }

          console.log(fetchedClient);
          $scope.selectedTargeting = false;

          // TODO: usar list.filter(conditionProcedure) pra filtrar o shopping
          // desejado pelo mallId assim como feito no controlador de detalhes
          // do client / customer (serve tanto pro lightbox no fraldário quanto sac)
          for ( var i = 0; i < fetchedClient.clientMalls.length; i++ ) {
            if ( fetchedClient.clientMalls[i].mallId == $scope.registerMall ) {
              $scope.selectedTargeting =  fetchedClient.clientMalls[i].targeting;
              $scope.selectedClubAcceptance =  fetchedClient.clientMalls[i].clubAcceptance;
            }
          }

          fetchedClient.birthday = moment(fetchedClient.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY');

          $scope.clientExist = true;
          $scope.client = fetchedClient;

          // --- popula o club acceptance se o client é prospect -----------
          const associatedMall = $scope.client.clientMalls.filter(function (item) {
            return Number(item.mallId) === Number($scope.registerMall);
          })[0];

          ClientMall.getClientMall(
            $scope.client.id,
            $scope.registerMall
          ).success(function (clientMall) {
            if (!clientMall) {
              $scope.clientTargetingName = 'Prospect';
              $scope.client.clubAcceptance = false;
              return;
            }

            const clubAcceptance = clientMall.clubAcceptance;
            $scope.clientTargetingName = (associatedMall && clubAcceptance) ? associatedMall.targeting.name : 'Prospect';

            PopUp.hide();
          }).catch(function (reason) {
            PopUp.hide();
            PopUp.alert(
              AppConfig.messages.customerService.title,
              AppConfig.messages.apiGenericError,
              function () { $route.reload(); }
            );
            console.log(reason);
          });
          // ---------------------------------------------------------------

        }).error(function(error) {
          PopUp.hide();
          PopUp.alert(AppConfig.messages.customerService.title,
            AppConfig.messages.apiGenericError);
          console.log(error);
        });
      } else {
        $scope.choiceCPF = true;
        $scope.client = {};
        $scope.secondLevel = false;
        $scope.thirdLevel = false;
        $scope.firstReason = -1;
        $scope.customerService = { };
        $scope.client.clubAcceptance = false;
      }

    };

    $scope.newClient = function() {

      PopUp.loading(AppConfig.messages.customerService.creating);

      // máscara já transforma a data
      // $scope.client.birthday = moment($scope.client.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
      $scope.client.originRegistry = AppConfig.originRegistry['CUSTOMERSERVICE'];
      $scope.client.employeeId = $scope.user.id;
      $scope.client.mallId = $scope.registerMall;

      console.log($scope.client);

      Client.create($scope.client).success(function(fetchedClient) {

        $scope.client.id = fetchedClient.id;

        if ( $scope.client.clubAcceptance ) {
          let body = {
              mallId: $scope.registerMall,
              clientId: $scope.client.id,
              clubAcceptance: $scope.client.clubAcceptance,
              clubAcceptanceChannel: $scope.client.clubAcceptanceChannel,
          }
          ClientMall.sendClubAcceptance(body);
        }

        $scope.newCustomerService();

        /*PopUp.success(AppConfig.messages.customerService.title,
          AppConfig.messages.customerService.success, function() {
              $route.reload();
          });
        */
      }).error(function(error) {
        PopUp.alert(AppConfig.messages.customerService.title,
          AppConfig.messages.apiGenericError);
          console.log(error);
      });

    };

    $scope.updateClient = function() {

      PopUp.loading(AppConfig.messages.customerService.creating);

      // máscara já transforma a data
      $scope.client.birthday = moment($scope.client.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
      $scope.client.employeeId = $scope.user.id;
      $scope.client.mallId = $scope.registerMall;
      $scope.client.originRegistry = AppConfig.originRegistry['CUSTOMERSERVICE'];

      Client.update($scope.client.id, $scope.client).success(function(fetchedClient) {

        $scope.client.id = fetchedClient.id;

        if ( $scope.client.clubAcceptance ) {
            let body = {
                mallId: $scope.registerMall,
                clientId: $scope.client.id,
                clubAcceptance: $scope.client.clubAcceptance,
                clubAcceptanceChannel: $scope.client.clubAcceptanceChannel,
                originRegistry: AppConfig.originRegistry['CUSTOMERSERVICE'],
            }
            ClientMall.sendClubAcceptance(body);
        }

        $scope.newCustomerService();

      }).error(function(error) {
        PopUp.alert(AppConfig.messages.customerService.title,
          AppConfig.messages.apiGenericError);
          console.log(error);
      });

    };

    $scope.newCustomerService = function() {
      $scope.customerService.clientId = $scope.client.id;
      $scope.customerService.mallId = $scope.registerMall;
      $scope.customerService.employeeMallId = $scope.user.id;

      CustomerService.create($scope.customerService)
        .success(function () {
          PopUp.success(AppConfig.messages.customerService.title,
            AppConfig.messages.customerService.success, function() {
              $scope.sendEmail();
              $route.reload();
            });
        }).error(function (error) {
          PopUp.alert(AppConfig.messages.customerService.title,
            AppConfig.messages.apiGenericError);
          console.log(error);
        });
    };

    $scope.sendEmail = function() {

      $scope.mallId = $scope.registerMall;
      $scope.role = $scope.customerService.role;
      $scope.customerService.client = $scope.client;
      $scope.customerService.customerServiceReason = {
        "customerServiceReason": {
          "name": $scope.rootReason
        }
      };

      if ($scope.customerService.role != "-1") {
        CustomerService.send($scope.mallId, $scope.role, $scope.customerService)
        .success(function () {
          console.log("E-mail enviado com sucesso!")
        }).error(function (error) {
          console.log(error);
        });
      }

    };

    $scope.saveCustomerService = function() {
      if ($scope.clientExist == false) {
        $scope.newClient();
      } else {
        $scope.updateClient();
      }
    }

    $scope.getCustomerServiceReason = function() {
      CustomerService.getCustomerServiceReason().success(function(items) {
        $scope.firstLevel = items;
      }).error(function (error){
        PopUp.alert(AppConfig.messages.customerService.title,
          AppConfig.messages.apiGenericError);
          console.log(error);
      })
    }
    $scope.getCustomerServiceReason();

    function findElement( vet, id ) {
      for ( var i = 0; i < vet.length; i++ ) {
        if ( vet[i].id == id ) {
          return vet[i];
        }
      }
      return [];
    };

    $scope.rootReason = null;
    $scope.reasonFlag = false;
    $scope.selectedItem = null;
    $scope.secondLevel = null;
    $scope.thirdLevel = null;
    $scope.customerService.customerServiceReasonId = null;

    $scope.selectReason = function(lvl) {

      if ( lvl == 1 ) {
        $scope.secondLevel = null;
        $scope.thirdLevel = null;
        $scope.customerService.customerServiceReasonId = null;
        $scope.secondReason = null;
        $scope.thirdReason = null;
        $scope.selectedItem = findElement( $scope.firstLevel, $scope.firstReason );
        $scope.rootReason = $scope.selectedItem.name;
        if ( $scope.selectedItem.children.length == 0 ) {
          $scope.customerService.customerServiceReasonId = $scope.selectedItem.id;
          $scope.reasonFlag = true;
        } else {
          $scope.secondLevel = $scope.selectedItem.children;
          $scope.reasonFlag = false;
        }
      }

      if ( lvl == 2 ) {
        $scope.thirdLevel = null;
        $scope.customerService.customerServiceReasonId = null;
        $scope.thirdReason = null;
        $scope.selectedItem = findElement( $scope.secondLevel, $scope.secondReason );
        if ( $scope.selectedItem.children.length == 0 ) {
          $scope.customerService.customerServiceReasonId = $scope.selectedItem.id;
          $scope.reasonFlag = true;
        } else {
          $scope.thirdLevel = $scope.selectedItem.children;
          $scope.reasonFlag = false;
        }
      }

      if ( lvl == 3 ) {
        $scope.customerService.customerServiceReasonId = null;
        $scope.selectedItem = findElement( $scope.thirdLevel, $scope.thirdReason );
        $scope.customerService.customerServiceReasonId = $scope.selectedItem.id;
        $scope.reasonFlag = true;
      }

    };

    $scope.getCustomerServiceReason();

    /* Escopo inicial forçado para os gráficos */
    $scope.malls = [$scope.userMalls[0].id];
    $scope.origins = ["todos"];
    $scope.offset = "month";

    $scope.data = {};

    function getDailyAttendance() {

      $scope.loading.dailyAttendance = 1;

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      CustomerService.getDailyAttendance($scope.malls, $scope.origins, $scope.offset).success(function (_data) {

        $scope.loading.dailyAttendance = 0;
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getStatusFlow() {

      $scope.loading.statusFlow = 1;

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      CustomerService.getStatusFlow($scope.malls, $scope.origins, $scope.offset).success(function (_data) {
        $scope.loading.statusFlow = 0;
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getAttendanceReason() {

      $scope.loading.attendanceReason = 1;

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      CustomerService.getAttendanceReason($scope.malls, $scope.origins, $scope.offset).success(function (_data) {

        $scope.loading.attendanceReason = 0;
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getWeeklyAttendance() {

      $scope.loading.weeklyAttendance = 1;

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      CustomerService.getWeeklyAttendance($scope.malls, $scope.origins, $scope.offset).success(function (_data) {

        $scope.loading.weeklyAttendance = 0;
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getAttendanceScore() {

      $scope.loading.attendanceScore = 1;

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      CustomerService.getAttendanceScore($scope.malls, $scope.origins, $scope.offset).success(function (_data) {

        $scope.loading.attendanceScore = 0;
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getAverageScore() {

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      CustomerService.getAverageScore($scope.malls, $scope.origins, $scope.offset).success(function (_data) {

        $scope.avg = _data;
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    $scope.loadGraphics = function () {

      getDailyAttendance().then(function (_data) {
        var element = document.getElementById("dailyAttendance");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.CustomerService_stackedbar = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/stacked-bar/stacked-bar.html?params={"data":"CustomerService_stackedbar"}';
        //element.src = '../graph/stacked-bar/stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.log(error);
      });

      getStatusFlow().then(function (_data) {
        var element = document.getElementById("statusFlow");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.CustomerService_sankey = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/sankey/sankey.html?params={"data":"CustomerService_sankey"}';
        //element.src = '../graph/sankey/sankey.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.log(error);
      });

      getAttendanceReason().then(function (_data) {
        var element = document.getElementById("attendanceReason");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.CustomerService_treemap = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/treemap/treemap.html?params={"data":"CustomerService_treemap"}';
        //element.src = '../graph/treemap/treemap.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.log(error);
      });

      getWeeklyAttendance().then(function (_data) {
        var element = document.getElementById("weeklyAttendance");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.CustomerService_groupedbar = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/grouped-bar/grouped-bar.html?params={"data":"CustomerService_groupedbar"}';
        //element.src = '../graph/grouped-bar/grouped-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.log(error);
      });

      getAttendanceScore().then(function (_data) {
        var element = document.getElementById("attendanceScore");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.CustomerService_bullet = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/bullet-chart/bullet-chart.html?params={"data":"CustomerService_bullet"}';
        //element.src = '../graph/bullet-chart/bullet-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.log(error);
      });

      getAverageScore();

    }

    function updateSelectedMalls(malls) {
      $scope.malls = malls;

      sessionStorage.graphic_data = JSON.stringify({});

      // $scope.loadGraphics();
    }

    $scope.loadGraphics();

    /* Dialog */
    $scope.openNgDialog = function (graphicName) {



      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'statusFlow':
          graphic.title = "Categorias/Tipo/Avaliação";
          graphic.graphicUrl = '../graph/sankey/sankey.html';
          graphic.loadDataFunction = getStatusFlow;
          graphic.height = 450;
          break;
        case 'weeklyAttendance':
          graphic.title = "Quantidade de Atendimentos";
          graphic.graphicUrl = '../graph/grouped-bar/grouped-bar.html';
          graphic.loadDataFunction = getWeeklyAttendance;
          graphic.height = 300;
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'CustomerService', function ($scope, CustomerService) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;


          window.addEventListener("keydown", myEventHandler, false);

          function myEventHandler(e){
              if  (e.key ==  'Escape') {
                  window.removeEventListener("keydown", myEventHandler, false);
                  $scope.closeThisDialog();
              }
          };

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.CustomerService_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"CustomerService_lightbox"}';
              //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.log(error);
            });

          };

          setTimeout(function () {
              $scope.loadGraphic();
          }, 1000);

        }]
      });
    };

    $scope.openTreeMapBar = function (graphicName) {
      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'attendanceReason':
          graphic.title = "Motivos";
          graphic.graphicUrl = '../graph/treemap/treemap.html';
          graphic.loadDataFunction = getAttendanceReason;
          graphic.height = 600;
          graphic.prop1 = 'Elogio - Banheiros';
          graphic.prop2 = 'Elogio - Estacionamento';
          graphic.prop3 = 'Elogio - Lojas';
          graphic.prop4 = 'Elogio - Mall';
          graphic.prop5 = 'Elogio - Praça de Alimentação';
          graphic.prop6 = 'Informação - Banheiros';
          graphic.prop7 = 'Informação - Estacionamento';
          graphic.prop8 = 'Informação - Lojas';
          graphic.prop9 = 'Informação - Mall';
          graphic.prop10 = 'Informação - Praça de Alimentação';
          graphic.prop11 = 'Reclamação - Banheiros';
          graphic.prop12 = 'Reclamação - Estacionamento';
          graphic.prop13 = 'Reclamação - Lojas';
          graphic.prop14 = 'Reclamação - Mall';
          graphic.prop15 = 'Reclamação - Praça de Alimentação';
          graphic.prop16 = 'Solicitação - Banheiros';
          graphic.prop17 = 'Solicitação - Estacionamento';
          graphic.prop18 = 'Solicitação - Lojas';
          graphic.prop19 = 'Solicitação - Mall';
          graphic.prop20 = 'Solicitação - Praça de Alimentação';
          break;
        default:
          alert("No suitable graphic found!");
      };

      ngDialog.open({
        template: 'partials/lightbox/treemap-chart.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'CustomerService', function ($scope, CustomerService) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;
          $scope.prop3 = graphic.prop3;
          $scope.prop4 = graphic.prop4;
          $scope.prop5 = graphic.prop5;
          $scope.prop6 = graphic.prop6;
          $scope.prop7 = graphic.prop7;
          $scope.prop8 = graphic.prop8;
          $scope.prop9 = graphic.prop9;
          $scope.prop10 = graphic.prop10;
          $scope.prop11 = graphic.prop11;
          $scope.prop12 = graphic.prop12;
          $scope.prop13 = graphic.prop13;
          $scope.prop14 = graphic.prop14;
          $scope.prop15 = graphic.prop15;
          $scope.prop16 = graphic.prop16;
          $scope.prop17 = graphic.prop17;
          $scope.prop18 = graphic.prop18;
          $scope.prop19 = graphic.prop19;
          $scope.prop20 = graphic.prop20;


          window.addEventListener("keydown", myEventHandler, false);

          function myEventHandler(e){
              if  (e.key ==  'Escape') {
                  window.removeEventListener("keydown", myEventHandler, false);
                  $scope.closeThisDialog();
              }
          };

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.CustomerService_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"CustomerService_lightbox"}';
              //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.log(error);
            });

          };

          setTimeout(function () {
              $scope.loadGraphic();
          }, 1000);

        }]
      });

    };

    /* Stacked Bar Modal */
    $scope.openStackedBar = function (graphicName) {

      var graphic = {
        title: "Gráfico",
        loadDataFunction: null,
        height: null,
        prop1: "",
        prop2: "",
        prop3: "",
        prop4: ""
      }

      switch (graphicName) {
        case 'dailyAttendance':
          graphic.title = "Número de Avaliações";
          graphic.graphicUrl = '../graph/stacked-bar/stacked-bar.html';
          graphic.loadDataFunction = getDailyAttendance;
          graphic.height = 300;
          graphic.prop1 = "Elogio";
          graphic.prop2 = "Informação";
          graphic.prop3 = "Reclamação";
          graphic.prop4 = "Solicitação/Sugestão";
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/stacked-bar.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;
          $scope.prop3 = graphic.prop3;
          $scope.prop4 = graphic.prop4;


          window.addEventListener("keydown", myEventHandler, false);

          function myEventHandler(e){
              if  (e.key ==  'Escape') {
                  window.removeEventListener("keydown", myEventHandler, false);
                  $scope.closeThisDialog();
              }
          };

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.CustomerService_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"CustomerService_lightbox"}';
              //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.log(error);
            });

          };

          setTimeout(function () {
              $scope.loadGraphic();
          }, 1000);

        }]
      });

    };

    /* Bullet Chart Modal */
    $scope.openBulletChart = function (graphicName) {

      var graphic = {
        title: "Gráfico",
        loadDataFunction: null,
        height: null,
        prop1: "",
        prop2: ""
      }

      switch (graphicName) {
        case 'attendanceScore':
          graphic.title = "Avaliações";
          graphic.graphicUrl = '../graph/bullet-chart/bullet-chart.html';
          graphic.loadDataFunction = getAttendanceScore;
          graphic.height = 150;
          graphic.prop1 = "Período anterior";
          graphic.prop2 = "Período atual";
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/bullet-chart.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'CustomerService', function ($scope, CustomerService) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;


          window.addEventListener("keydown", myEventHandler, false);

          function myEventHandler(e){
              if  (e.key ==  'Escape') {
                  window.removeEventListener("keydown", myEventHandler, false);
                  $scope.closeThisDialog();
              }
          };

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.CustomerService_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"CustomerService_lightbox"}';
              //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.log(error);
            });

          };

          setTimeout(function () {
              $scope.loadGraphic();
          }, 1000);

        }]
      });

    };

    $scope.openMalls = function (malls) {

      PopUp.loading(AppConfig.messages.loading);

      // hack pra funfar o carregamento no seletor de shoppings
      setTimeout(function () {
        EventBus.publish('malls-load-dataset', malls);
      }, 1000);

      EventBus.subscribeOnce('malls-update-selection', function (mallsResult) {
        updateSelectedMalls(mallsResult);

        ngDialog.close();
      });

      ngDialog.open({
        template: 'partials/lightbox/malls.html',
        controller: 'MallsSelectorController'
      });

    };

    // LIGHTBOX DETAILING CUSTOMER SERVICE

    $scope.openDetailingCustomerService = function (customerData) {
      PopUp.loading(AppConfig.messages.loading);

      console.log(customerData);

      Client.getByCPF(customerData.client.cpf).success(function (client) {
        console.log(client);
        customerData.client.address = client.address;
        customerData.client.clientMalls = client.clientMalls;

        ClientMall.getClientMall(
          customerData.clientId,
          customerData.mallId
        ).success(function (clientMall) {
          customerData.client.clientMall = clientMall;

          $scope.parentController = 'CUSTOMERSERVICE';
          $scope.customerData = customerData;

          PopUp.hide();

          ngDialog.open({
              template: 'partials/lightbox/detailing-customer.html',
              controller: 'CustomerDetailsController',
              scope: $scope
          });
        }).error(function (reason) {
          console.log(`Could not get client mall relation! ${reason.toString()}`);
        });
      }).error(function (reason) {
        console.log(`Could not get client address! ${reason.toString()}`);
      });
    }

    $scope.openEditClient = function (clientId){
      ngDialog.open({
        template: 'partials/lightbox/edit-client.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'CustomerService', function ($scope, CustomerService) {

          window.addEventListener("keydown", myEventHandler, false);

          function myEventHandler(e){
              if  (e.key ==  'Escape') {
                  window.removeEventListener("keydown", myEventHandler, false);
                  $scope.closeThisDialog();
              }
          };

          $scope.updateClient = function () {

          };

        }]
      });
    }


    /* não mais necessário??
    setTimeout(function () {
      document.getElementById('customer-service-search-button').click();;
    }, 1000);

    setTimeout(function () {
      document.getElementById('customer-service-search-button').click();;
    }, 2000);

    setTimeout(function () {
      document.getElementById('customer-service-search-button').click();;
    }, 3000);
    */

  $scope.clientMall = '-1';
  $scope.searchClientByCpf = function () {
    PopUp.loading(AppConfig.messages.loading);

    CustomerView.getEditClient($scope.cpf, $scope.clientMall).success(function (editClient)  {

      PopUp.hide();
      $scope.editClients = {editClient};
      console.log($scope.editClients);

    }).error(function(error) {
        PopUp.alert(AppConfig.messages.customerView.title,
            AppConfig.messages.apiGenericError);
          console.log(error.stack);
    })
  }

  $scope.openEditClient = function (cpf){
    ngDialog.open({
      template: 'partials/lightbox/edit-client.html',
      closeByEscape: true,
      closeByDocument: true,
      preCloseCallback: function() {
        $scope.searchClientByCpf();
        return true;
      },
      controller: ['$scope', 'Client', 'Session', function ($scope, Client, Session) {

        $scope.user = Session.get('user');

        window.addEventListener("keydown", myEventHandler, false);

        function myEventHandler(e){
            if  (e.key ==  'Escape') {
                window.removeEventListener("keydown", myEventHandler, false);
                $scope.closeThisDialog();
            }
        };

        $scope.prepareToUpdate = function () {

          PopUp.loading(AppConfig.messages.loading);

          Client.getByCPF(cpf).success(function (fetchedClient) {
            $scope.client = fetchedClient;
            $scope.client.birthday = moment(fetchedClient.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY');
            PopUp.hide();
          }).error(function (error) {
            PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
            console.log(error);
          });
        };

        $scope.prepareToUpdate();

        $scope.updateClient = function() {

          PopUp.loading(AppConfig.messages.loading);

          // máscara já transforma a data
          $scope.client.birthday = moment($scope.client.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
          $scope.client.employeeId = $scope.user.id;
          $scope.client.mallId = $scope.registerMall;
          console.log($scope.client.id)

          Client.update($scope.client.id, $scope.client).success(function() {
            PopUp.success(AppConfig.messages.customerView.title,
              AppConfig.messages.customerView.updateSuccess, function() {
                $scope.client.birthday = moment($scope.client.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY');
                ngDialog.close();
            });
          }).error(function(error) {
            PopUp.alert(AppConfig.messages.customerService.title,
              AppConfig.messages.apiGenericError);
              console.log(error);
          });

        };

      }]
    });
  }

}]);


  // LIGHTBOX EDIT-CLIENT

