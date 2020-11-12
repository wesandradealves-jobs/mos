/* eslint-env browser */
/* global _app, moment, jQuery */
/* eslint
  quotes: off,
  no-useless-escape: off,
  no-console: off,
  indent: off */

'use strict';

_app.controller('VipLoungeController', [
  '$scope', '$route', '$q', 'VipLounge', 'ngDialog', 'DTColumnDefBuilder', 'DTOptionsBuilder',
  'PopUp', 'AppConfig', 'Client', '$location', 'Session', 'EventBus', 'Permission', 'ClientMall',
  'Validations', 'Utils', 'CustomerView',
  function (
    $scope, $route, $q, VipLounge, ngDialog, DTColumnDefBuilder, DTOptionsBuilder,
    PopUp, AppConfig, Client, $location, Session, EventBus, Permission, ClientMall,
    Validations, Utils, CustomerView
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
      $scope.mallError = !$scope.vipLounge.mallId;
      $scope.selectedTargeting = false;
      $scope.choiceMall = false;
      $scope.lockedFields = true;
      $scope.client = {};
      $scope.client.clubAcceptance = false;
      $scope.clientClub = false;
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

    $scope.phoneError = false;
    $scope.validatePhone = function () {
      $scope.phoneError = !$scope.client.mobileNumber;
    };

    $scope.zipCodeError = false;
    $scope.validateZipCode = function () {
      $scope.zipCodeError = !$scope.client.zipCode;
    };

    $scope.sexError = false;
    $scope.validateSex = function () {
      $scope.sexError = !$scope.client.sex;
    };

    $scope.emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    $scope.emailError = false;
    $scope.validateEmail = function () {
      $scope.emailError = !$scope.client.email;
    };

    $scope.club = true;
    $scope.clubUnlock = function() {
      $scope.club = false;
    };

    $scope.clubLock = function() {
      $scope.club = true;
    };

    /* Limpeza das sessões dos gráficos */
    sessionStorage.graphic_data = JSON.stringify({});

    /* Escopo inicial forçado para os gráficos */
    $scope.malls = [$scope.userMalls[0].id];
    $scope.offset = "month";

    $scope.vipLounge = {};
    $scope.client = {};

    $scope.clientExist = false;
    $scope.client.clubAcceptance = false;

    jQuery.extend(jQuery.fn.dataTableExt.oSort, {
        "brazilDateTime-pre": function (x) {
            return moment(x, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        },
        "brazilDateTime-asc": function (x, y) {
            return x > y;
        },
        "brazilDateTime-desc": function (x, y) {
            return x < y;
        }
    });

    $scope.dtOptions = {
        paging: true,
        ordering: true,
        processing: true,
        stateSave: false,
        columnDefs: [{
            type: 'brazilDateTime',
            targets: 1,
        }],
        order: [
            [1, 'desc']
        ]
    };

    $scope.loading = {
      visits: 0,
      permanence: 0,
      visitsOnly: 0,
      recurrence: 0,
    };

    $scope.lockedFields = true;
    $scope.choiceMall = true;
    $scope.unlockFields = function() {
      if ($scope.vipLounge.mallId) {
        $scope.choiceMall = false;
      }
      if ( !$scope.client.cpf || $scope.client.cpf.length != 11) {
        $scope.selectedTargeting = false;
        $scope.choiceMall = false;
        $scope.lockedFields = true;
        $scope.client = "";
        $scope.clientClub = false;
      } else {
        $scope.lockedFields = false;
      }

    }

    $scope.searchClient = function() {
      /*
      let cpf = document.getElementById('vip-lounge-register-cpf').value;
      cpf = cpf.toString().replace(/\./g, '').replace(/\-/g, '');
      */

      const cpf = $scope.client.cpf;

      if (!cpf || cpf.length !== 11) {
        $scope.selectedTargeting = false;
        $scope.choiceMall = false;
        $scope.lockedFields = true;
        $scope.client = {};
        $scope.client.clubAcceptance = false;
        $scope.clientClub = false;
        return;
      }

      Client.getByCPF(cpf)
        .success(function(fetchedClient) {

          const mallId = $scope.vipLounge.mallId; // copy/mirror

          if (fetchedClient) {
            $scope.clientExist = true;
            $scope.client = fetchedClient;
            $scope.client.zipCode = fetchedClient.address.zipCode;
            $scope.client.clubAcceptance = false;

            VipLounge.getCanAccess(fetchedClient.id, mallId).success(function (response) {
              $scope.canAccessMsg = response.message;
              $scope.canAccessStatus = response.status;
            }).error(function (error) {
              $scope.canAccessStatus = 0;
              $scope.canAccessMsg = JSON.stringify(error);
            });

            if (fetchedClient.birthday !== null && fetchedClient.birthday !== undefined) {
              $scope.client.birthday = moment($scope.client.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY');
            }

            $scope.vipLounge = {};
            $scope.vipLounge.mallId = mallId;
            $scope.vipLounge.clientId = fetchedClient.id;
            $scope.vipLounge.cpf = cpf;
            $scope.vipLounge.fullName = fetchedClient.fullName;
            $scope.vipLounge.email = fetchedClient.email;
            $scope.vipLounge.homePhone = fetchedClient.homePhone;
            $scope.vipLounge.mobileNumber = fetchedClient.mobileNumber;
            $scope.vipLounge.zipCode = fetchedClient.address.zipCode;

            $scope.selectedTargeting = false;

            // TODO: usar list.filter(conditionProcedure) pra filtrar o shopping
            // desejado pelo mallId assim como feito no controlador de detalhes
            // do client / customer (serve tanto pro lightbox no fraldário quanto sac)
            for ( var i = 0; i < fetchedClient.clientMalls.length; i++ ) {
              if ( fetchedClient.clientMalls[i].mallId == $scope.vipLounge.mallId ) {
                $scope.selectedTargeting =  fetchedClient.clientMalls[i].targeting;
                $scope.selectedClubAcceptance =  fetchedClient.clientMalls[i].clubAcceptance;
              }
            }

          } else {
            $scope.clientExist = false;
            $scope.client = {};
            $scope.client.cpf = cpf;
            $scope.client.clubAcceptance = false;
            $scope.vipLounge = {};
            $scope.vipLounge.mallId = mallId;
            $scope.vipLounge.cpf = cpf;
          }

          $scope.unlockFields();
        }).error(function(error) {
          PopUp.alert(AppConfig.messages.vipLounge.title,
            AppConfig.messages.apiGenericError);
          console.log(error);
        });
    };

    $scope.newClient = function() {

      PopUp.loading(AppConfig.messages.vipLounge.creating);


      $scope.client.address = {};

      $scope.client.mallId = $scope.vipLounge.mallId;
      $scope.client.address.zipCode = $scope.client.zipCode;
      $scope.client.originRegistry = AppConfig.originRegistry['VIPLOUNGE'];
      $scope.client.birthday = moment($scope.client.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
      $scope.client.employeeId = $scope.user.id;

      // deep copy to not break object within $scope vip-lounge controller
      const client = JSON.parse(JSON.stringify($scope.client));
      client.cpf = client.cpf.toString().replace(/\./g, '').replace(/\-/g, '');

      Client.create(client).success(function(fetchedClient) {

        fetchedClient.mallId = $scope.vipLounge.mallId;
        $scope.vipLounge = {};
        $scope.vipLounge.mallId = fetchedClient.mallId;
        $scope.vipLounge.clientId = fetchedClient.id;
        $scope.vipLounge.cpf = fetchedClient.cpf;
        $scope.vipLounge.fullName = fetchedClient.fullName;
        $scope.vipLounge.email = fetchedClient.email;
        $scope.vipLounge.homePhone = fetchedClient.homePhone;
        $scope.vipLounge.mobileNumber = fetchedClient.mobileNumber;
        $scope.vipLounge.originRegistry = fetchedClient.originRegistry;
        $scope.vipLounge.employeeId = fetchedClient.employeeId;

        if ( $scope.client.clubAcceptance ) {
          let body = {
              mallId: $scope.vipLounge.mallId,
              clientId: $scope.vipLounge.clientId,
              clubAcceptance: $scope.client.clubAcceptance,
              clubAcceptanceChannel: $scope.client.clubAcceptanceChannel,
          }
          ClientMall.sendClubAcceptance(body);
        }

        $scope.enterVipLounge();

        /*PopUp.success(AppConfig.messages.customerService.title,
          AppConfig.messages.customerService.success, function() {
              $scope.reload();
          });
        */
      }).error(function(error) {
        PopUp.alert(AppConfig.messages.vipLounge.title,
          AppConfig.messages.apiGenericError, function () {
            $scope.reload();
          });
          console.log(error);
      });

    };

    $scope.updateClient = function() {

      PopUp.loading(AppConfig.messages.vipLounge.creating);

      $scope.client.address = {};

      $scope.client.mallId = $scope.vipLounge.mallId;
      $scope.client.address.zipCode = $scope.client.zipCode;
      $scope.client.birthday = moment($scope.client.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
      $scope.client.employeeId = $scope.user.id;
      $scope.client.originRegistry = AppConfig.originRegistry['VIPLOUNGE'];

      const client = JSON.parse(JSON.stringify($scope.client));

      Client.update($scope.vipLounge.clientId, client).success(function(fetchedClient) {

        $scope.client.id = fetchedClient.id;

        if ( $scope.client.clubAcceptance ) {
            let body = {
                mallId: $scope.vipLounge.mallId,
                clientId: $scope.vipLounge.clientId,
                clubAcceptance: $scope.client.clubAcceptance,
                clubAcceptanceChannel: $scope.client.clubAcceptanceChannel,
                originRegistry: AppConfig.originRegistry['VIPLOUNGE'],
            }
            ClientMall.sendClubAcceptance(body);
        }

        $scope.enterVipLounge();

      }).error(function(error) {
        PopUp.alert(AppConfig.messages.vipLounge.title,
          AppConfig.messages.apiGenericError);
          console.log(error);
      });

    };

    $scope.enterVipLounge = function() {

      PopUp.loading(AppConfig.messages.vipLounge.entering);

      $scope.vipLounge.employeeEnterId = $scope.user.id;

      VipLounge.enterVipLounge($scope.vipLounge).success(function (result) {

        if (result.status) {
          PopUp.success(
            AppConfig.messages.vipLounge.title,
            AppConfig.messages.vipLounge.success,
            function () {
              $scope.reload();
            }
          );
        } else {
          switch (result.code) {
            case 1:
              PopUp.alert(
                AppConfig.messages.vipLounge.title,
                AppConfig.messages.vipLounge.clientStillOnVIPLounge,
                function () { $scope.reload(); }
              );
              break;
            case 2:
              PopUp.alert(
                AppConfig.messages.vipLounge.title,
                AppConfig.messages.vipLounge.monthlyLimitReached,
                function () { $scope.reload(); }
              );
              break;
            case 3:
              PopUp.alert(
                AppConfig.messages.vipLounge.title,
                AppConfig.messages.vipLounge.clubAcceptanceFalse,
                function () { $scope.reload(); }
              );
              break;
            case 4:
                PopUp.alert(
                  AppConfig.messages.vipLounge.title,
                  AppConfig.messages.vipLounge.clubAcceptanceFalse,
                  function () { $scope.reload(); }
                );
                break;
            default:
              PopUp.alert(
                AppConfig.messages.vipLounge.title,
                AppConfig.messages.vipLounge.unknownErrorCode,
                function () { $scope.reload(); }
              );
          }
        }

      }).error(function (error) {
        console.log(error.stack);
        PopUp.alert(
          AppConfig.messages.vipLounge.title,
          AppConfig.messages.apiGenericError,
          function () { $scope.reload(); }
        );

        // TODO: lançar essa mensagem quando o cliente não poder mais entrar
        /*
        PopUp.alert(AppConfig.messages.vipLounge.title,
          AppConfig.messages.vipLounge.notAccess, function () {
            $scope.reload();
          });

        */
      });
    };

    $scope.reload = function () {
      const controlMall = $scope.controlMall;

      $route.reload();

      setTimeout(function () {
        $scope.controlMall = controlMall; // persiste control mall selecionado após refresh
        $scope.getListVipLounge();
      }, 500);
    };

    $scope.checkinVipLounge = function() {
      if ($scope.clientExist == false) {
        $scope.newClient();
      } else {
        //$scope.enterVipLounge();
        $scope.updateClient();
      }
    };

    $scope.disableIfInvalidClient = function () {
      const client = $scope.client || {};

      const cpfInput = document.getElementById('vip-lounge-register-cpf');

      client.cpf = cpfInput.value.replace(/\./g, '').replace(/\-/g, '');

      return !(
        (client.cpf !== '' && client.cpf !== null && client.cpf !== undefined) &&
        (client.fullName !== '' && client.fullName !== null && client.fullName !== undefined) &&
        (client.birthday !== '' && client.birthday !== null && client.birthday !== undefined) &&
        (client.email !== '' && client.email !== null && client.email !== undefined) &&
        (client.mobileNumber !== '' && client.mobileNumber !== null && client.mobileNumber !== undefined) &&
        (client.sex !== '' && client.sex !== null && client.sex !== undefined)
      );
    };

    $scope.getListVipLounge = function () {
      PopUp.loading(AppConfig.messages.loading);

      let controlMall = $scope.controlMall;

      if (controlMall == '-1') {
        controlMall = $scope.malls[0];
      }

      VipLounge.getListVipLounge([ controlMall ]).success(function (items) {
          PopUp.hide();
          $scope.vips = items.map(function (visit) {
            visit.enterDate = moment(
              visit.enterDate, 'YYYY-MM-DD HH:mm:ss'
            ).format('DD/MM/YYYY HH:mm:ss');
            return visit;
          });
      }).error(function(error) {
          PopUp.alert(AppConfig.messages.vipLounge.title,
              AppConfig.messages.apiGenericError);
          console.log(error.stack);
      });
    };

    $scope.checkinValidationFails = function () {
      return !$scope.vipLounge.mallId
      || !$scope.client.cpf
      || !$scope.client.fullName
      || !$scope.client.sex
      || !$scope.client.email
      || !$scope.client.zipCode
      || !$scope.client.birthday
      || ($scope.client.clubAcceptance && !$scope.client.clubAcceptanceChannel)
      || !$scope.client.mobileNumber;
    };

    $scope.exitVipLounge = function(clientId, enterDate, vipLounge) {
      enterDate = moment(enterDate, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');

      PopUp.confirm(AppConfig.messages.vipLounge.title,
          AppConfig.messages.vipLounge.askToRemove,
          function(isConfirmed) {

              if(isConfirmed) {

                  PopUp.loading(AppConfig.messages.vipLounge.removing);

                  vipLounge.employeeExitId = $scope.user.id;

                  VipLounge.exitVipLounge(clientId, enterDate, vipLounge).success(function() {
                      PopUp.success(AppConfig.messages.vipLounge.title,
                          AppConfig.messages.vipLounge.removed,
                          function() {
                              // $scope.reload();
                              $scope.getListVipLounge();

                              document.getElementById('vip-lounge-register-mall-select')
                                .value = $scope.controlMall.toString();
                              $scope.choiceMall = false;
                              setTimeout(function () {
                                document.getElementById('vip-lounge-register').click();
                              }, 100);
                          });

                  }).error(function(error) {
                      PopUp.alert(AppConfig.messages.vipLounge.title, AppConfig.messages.vipLounge.errorWhileRemoving);
                      console.log(error);
                  });

              }

          }
      );

    };


    /*
     * Charts
     */

    function getVisits() {


        $scope.loading.visits = 1;

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
        var deferred = $q.defer();

        VipLounge.getVisits($scope.malls, $scope.offset).success(function (_data) {
          $scope.loading.visits = 0;
          deferred.resolve(_data);
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
          deferred.reject(error);
        });

        return deferred.promise;

      }

      function getVisitsOnly() {

        $scope.loading.visitsOnly = 1;

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
        var deferred = $q.defer();

        VipLounge.getVisitsOnly($scope.malls, $scope.offset).success(function (_data) {

          $scope.loading.visitsOnly = 0;
          deferred.resolve(_data);
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
          deferred.reject(error);
        });

        return deferred.promise;

      }

      function getRecurrence() {

        $scope.loading.recurrence = 1;

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
        var deferred = $q.defer();

        VipLounge.getRecurrence($scope.malls, $scope.offset).success(function (_data) {
          $scope.loading.recurrence = 0;
          deferred.resolve(_data);
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
          deferred.reject(error);
        });

        return deferred.promise;

      }

      function getPermanence() {

        $scope.loading.permanence = 1;

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
        var deferred = $q.defer();

        VipLounge.getPermanence($scope.malls, $scope.offset).success(function (_data) {

          $scope.loading.permanence = 0;
          deferred.resolve(_data);
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
          deferred.reject(error);
        });

        return deferred.promise;

      }

      function getAverageConsumption() {

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);

        VipLounge.getAverageConsumption($scope.malls, $scope.offset).success(function (_data) {

          $scope.avg = _data;
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
        });

      }

      function getLower() {

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);

        VipLounge.getLower($scope.malls, $scope.offset).success(function (_data) {

          $scope.lower = _data;
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
        });

      }

      function getHigher() {

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);

        VipLounge.getHigher($scope.malls, $scope.offset).success(function (_data) {

          $scope.higher = _data;
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
        });

      }

      function getMean() {

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);

        VipLounge.getMean($scope.malls, $scope.offset).success(function (_data) {

          $scope.mean = _data;
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
        });

      }

      function getAutoForced() {

        //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);

        VipLounge.getAutoForced($scope.malls, $scope.offset).success(function (_data) {

          $scope.autoForced = _data;
          //            PopUp.hide();
        }).error(function (error) {
          //            PopUp.alert(AppConfig.messages.coupon.title.plural,
          //                AppConfig.messages.coupon.errorWhileGetting);
          console.log(error.stack);
        });

      }

      $scope.loadGraphics = function () {

        getVisits().then(function (_data) {
          var element = document.getElementById("visits");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.BabyCare_stockedbar = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/stacked-bar/stacked-bar.html?params={"data":"BabyCare_stockedbar"}';
          //element.src = '../graph/stacked-bar/stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });

        getVisitsOnly().then(function (_data) {
          var element = document.getElementById("visitsOnly");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.BabyCare_heat = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/heat-map/heat-map.html?params={"data":"BabyCare_heat"}';
          //element.src = '../graph/heat-map/heat-map.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });

        getRecurrence().then(function (_data) {
          var element = document.getElementById("recurrence");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.BabyCare_groupedbar = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/grouped-bar/grouped-bar.html?params={"data":"BabyCare_groupedbar"}';
          //element.src = '../graph/grouped-bar/grouped-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });

        getPermanence().then(function (_data) {
          var element = document.getElementById("permanence");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.BabyCare_multiserie = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/multi-serie-line/multi-serie-line.html?params={"data":"BabyCare_multiserie"}';
          //element.src = '../graph/multi-serie-line/multi-serie-line.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });

        getAverageConsumption();
        getLower();
        getHigher();
        getMean();
        getAutoForced();

      };

      function updateSelectedMalls(malls) {
        $scope.malls = malls;

        if (malls.length == 1) {
          var mall = $scope.user.malls.filter((mall)=>
         {
           return mall.id == malls[0]
         })
         $scope.singleMallSelected = mall[0].name
       }

        sessionStorage.graphic_data = JSON.stringify({});

        $scope.loadGraphics();
      }

      $scope.loadGraphics();

      /* Dialog */
      $scope.openNgDialog = function (graphicName) {

        var graphic = {
          title: 'Gráfico',
          loadDataFunction: null,
          height: null
        };

        switch (graphicName) {
          case 'visitsOnly':
            graphic.title = "Visitas";
            graphic.graphicUrl = '../graph/heat-map/heat-map.html';
            graphic.loadDataFunction = getVisitsOnly;
            graphic.height = 450;
            break;
          case 'recurrence':
            graphic.title = "Recorrência";
            graphic.graphicUrl = '../graph/grouped-bar/grouped-bar.html';
            graphic.loadDataFunction = getRecurrence;
            graphic.height = 300;
            break;
          case 'permanence':
            graphic.title = "Amplitude de Permanência";
            graphic.graphicUrl = '../graph/multi-serie-line/multi-serie-line.html';
            graphic.loadDataFunction = getPermanence;
            graphic.height = 300;
            break;
          default:
            alert("No suitable graphic found!");
        }


        ngDialog.open({
          template: 'partials/lightbox/default-chart.html',
          closeByEscape: true,
          closeByDocument: true,
          controller: ['$scope', 'VipLounge', function ($scope, VipLounge) {
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
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data.BabyCare_lightbox = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = graphic.graphicUrl + '?params={"data":"BabyCare_lightbox"}';
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
      };

      switch (graphicName) {
        case 'visits':
          graphic.title = "Visitas/Categorias";
          graphic.graphicUrl = '../graph/stacked-bar/stacked-bar.html';
          graphic.loadDataFunction = getVisits;
          graphic.height = 300;
          break;
        default:
          alert("No suitable graphic found!");
      }


      ngDialog.open({
        template: 'partials/lightbox/stacked-bar.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
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
              Object.assign($scope, Utils.labelGenerator(['date'], _data[0]));
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.BabyCare_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"BabyCare_lightbox"}';
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

    /* Multi Lines Modal */
    $scope.openMultiLines = function (graphicName) {

      var graphic = {
        title: "Gráfico",
        loadDataFunction: null,
        height: null,
        prop1: "",
        prop2: "",
        prop3: "",
        prop4: "",
        prop5: ""
      };

      switch (graphicName) {
      case 'permanence':
          graphic.title = "Amplitude de Permanência";
          graphic.graphicUrl = '../graph/multi-serie-line/multi-serie-line.html';
          graphic.loadDataFunction = getPermanence;
          graphic.height = 300;
          graphic.prop1 = "Mínimo";
          graphic.prop2 = "Máximo";
          graphic.prop3 = "Média";
          break;
        default:
          alert("No suitable graphic found!");
      }


      ngDialog.open({
        template: 'partials/lightbox/multi-line.html',
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
          $scope.prop5 = graphic.prop5;


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
              graphic_data.BabyCare_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"BabyCare_lightbox"}';
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

    $scope.openEditClient = function (clientId){
      ngDialog.open({
        template: 'partials/lightbox/edit-client.html',
        closeByEscape: true,
        closeByDocument: true,
        controller: ['$scope', 'VipLounge', function ($scope, vipLounge) {

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
