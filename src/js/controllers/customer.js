'use strict';

/* global _app */
/* eslint-env browser */

_app.controller('CustomerController', [
  '$scope', '$location', 'CustomerView', 'ngDialog', '$q', 'PopUp', 'AppConfig',
  'Session', 'Permission', 'EventBus', 'Cache', 'ClientMall', '$timeout',
  function (
    $scope, $location, CustomerView, ngDialog, $q, PopUp, AppConfig,
    Session, Permission, EventBus, Cache, ClientMall, $timeout
  ) {

    $scope.menuPermissions = Permission.menuPermissions();
    $scope.cpfAndName = "";

    /* Pegando dados de usuário e logout de sistema */
    $scope.user = Session.get('user');
    $scope.logout = function() {
        Session.setAll({});
        $location.path('/');
    };

    /* Limpeza das sessões dos gráficos */
    sessionStorage.graphic_data = JSON.stringify({});
    

    $scope.loading = {
        searchClientByCpf: 0,
        registrationData: 0,
        engagementData: 0,
        purchaseBySegment: 0,
        eventsPropension: 0,
        topStores: 0,
        topStoresAlike: 0,
        buyerProfile: 0,
        appUse: 0,
        facilitiesUse: 0,
        spending: 0,
        transactionalData: 0,
    };

    $scope.data = {};

    $scope.getClient = function (cpf) {
        // if ($scope.cpf === null || $scope.cpf === undefined || $scope.cpf === '') {
        //   return;
        // }

        // var cpf  = $scope.cpf;

        // if ( cpf.length != 11 )
        //     return;

        PopUp.loading(AppConfig.messages.loading);

        document.getElementById("cpfAndName").blur()
        $scope.cpfAndName = cpf;

        $scope.loading.searchClientByCpf = 1;

        CustomerView.getClientByCpfMall(cpf, $scope.user.malls).success(function (client)  {

          console.log(client);

            if ( client ) {
                PopUp.hide();
                $scope.clientId = client.id;
                // Pegar o mall da sessão
                $scope.mallId = client.malls[0].id;
                $scope.mallName = client.malls[0].name;

                $scope.loadGraphics();
            } else {
                PopUp.alert(AppConfig.messages.customerView.title,
                    AppConfig.messages.customerView.clientNotFound);
                $scope.loading.searchClientByCpf = 0;
                return;
            }

            if ( client.clientMalls.length > 1 ) {

                $scope.openMalls = function (malls) {
                    $scope.radioControl = {};
                    $scope.radioControl.clientMalls = [];

                    for ( let i = 0; i < malls.length; i++ ) {
                        for ( let j = 0; j < $scope.user.malls.length; j++) {
                            if ( malls[i].mallId ==  $scope.user.malls[j].id ) {
                                $scope.radioControl.clientMalls.push(malls[i]);
                                break;
                            }
                        }
                    }

                    PopUp.loading(AppConfig.messages.loading);

                    EventBus.subscribeOnce("customer-view-update-mall", function (data) {
                      $scope.malls = [ data.mallId ];
                      $scope.mallName = data.mallName;
                      $scope.mallId = data.mallId;

                      $scope.loadGraphics();
                    })

                    ngDialog.open({
                      template: 'partials/lightbox/clientMalls.html',
                      controller: 'MallsRadioController',
                      scope: $scope
                    });
                  };

                  $scope.openMalls(client.clientMalls);

            }

            $scope.loading.searchClientByCpf = 0;

        }).error(function(error) {
            PopUp.alert(AppConfig.messages.customerView.title,
                AppConfig.messages.apiGenericError);
              console.log(error.stack);
        })
    }

    $scope.boxAutoComplete = false;

    $scope.searchBlur = function() {
      $timeout(function() {
        $scope.boxAutoComplete = false;
      }, 200);
    }

    $scope.searchFocus = function() {
      if ($scope.clients && $scope.clients.length > 0 && $scope.cpfAndName.length > 0) {
        $scope.boxAutoComplete = true;
      }
    }

    $scope.autoComplete = function() {

      $scope.boxAutoComplete = true;

      if (!$scope.cpfAndName) {
        $scope.boxAutoComplete = false;
        return;
      }

      let mallIds = [];
      for (let i=0; i < $scope.user.malls.length; i++ ) {
        mallIds.push($scope.user.malls[i].id);
      }

      let data = {
        "search": $scope.cpfAndName,
        "mallIds": mallIds,
      }

      CustomerView.getClientByNameAndCpf(data).success(function (response)  {
        $scope.clients = response;

      }).error(function(error) {
        PopUp.alert(AppConfig.messages.customerView.title,
            AppConfig.messages.apiGenericError);
          console.log(error.stack);
      })

    }

    function getRegistrationData( ) {

        $scope.loading.registrationData =1;

        PopUp.loading(AppConfig.messages.loading);

        CustomerView.getRegistrationData($scope.clientId, $scope.mallId).success(function(_data) {
            $scope.data.registrationData = {};

            var name = _data.fullName.split(' ');

            $scope.data.registrationData = {
              "name": name[0],
              "lastName": name[name.length - 1],
              "cpf": _data.cpf,
              "targeting": _data.targeting,
              "birthday": moment(_data.birthday).format("DD/MM/YYYY"),
              "age": _data.age,
              "registerDate":  moment(_data.registerDate).format("DD/MM/YYYY"),
              "mobileNumber": _data.mobileNumber,
              "email": _data.email,
              "neighborhood": _data.neighborhood,
              "clubAcceptance": _data.clubAcceptance,
            }

            $scope.loading.registrationData = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
        });
    }


    function getEngagementData( ) {

        PopUp.loading(AppConfig.messages.loading);

        $scope.loading.engagementData = 1;

        CustomerView.getEngagementData($scope.clientId, $scope.mallId).success(function(_data) {
            $scope.data.engagementData = {};

            $scope.data.engagementData = {
              "monthlyVisits": parseFloat(_data.monthlyVisits).toFixed(2),
              "monthlyAppInteractions": parseFloat(_data.monthlyAppInteractions).toFixed(2),
              "lastVisit": moment(_data.lastVisit).format("DD/MM/YYYY"),
              "mdv": parseFloat(_data.mdv).toFixed(2),
            }

            $scope.loading.engagementData = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
        });
    }

    function getPurchaseBySegment( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.purchaseBySegment = 1;

        CustomerView.getPurchaseBySegment($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.purchaseBySegment = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getEventsPropension( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.eventsPropension = 1;

        CustomerView.getEventsPropension($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.eventsPropension = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;
    };


    function getTopStores( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.topStores = 1;

        CustomerView.getTopStores($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.topStores = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;
    };


    function getTopStoresAlike( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.topStoresAlike = 1;

        CustomerView.getTopStoresAlike($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.topStoresAlike = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    function getBuyerProfile( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.buyerProfile = 1;

        CustomerView.getBuyerProfile($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.buyerProfile = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    function getAppUse( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.appUse = 1;

        CustomerView.getAppUse($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.appUse = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;

    };

    function getFacilitiesUse( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.facilitiesUse = 1;

        CustomerView.getFacilitiesUse($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.facilitiesUse = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;

    };

    function getSpending( ) {

        PopUp.loading(AppConfig.messages.loading);

        var deferred = $q.defer();

        $scope.loading.spending = 1;

        CustomerView.getSpending($scope.clientId, $scope.mallId).success(function(_data) {

            deferred.resolve(_data);

            $scope.loading.spending = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
            deferred.reject(error);
        });

        return deferred.promise;

    };


    function getTransactionalData( ) {

        PopUp.loading(AppConfig.messages.loading);

        $scope.loading.transactionalData = 1;

        CustomerView.getTransactionalData($scope.clientId, $scope.mallId).success(function(_data) {
            $scope.data.transactionalData = {};

            $scope.data.transactionalData = {
              "lifetimeSpending": parseFloat(_data.lifetimeSpending).toFixed(2),
              "meanTicket": parseFloat(_data.meanTicket).toFixed(2),
              "meanMonthlySpending": parseFloat(_data.meanMonthlySpending).toFixed(2),
              "maxSpending": parseFloat(_data.maxSpending).toFixed(2),
              "maxTransaction": parseFloat(_data.maxTransaction).toFixed(2),
              "meanVisitySpending": parseFloat(_data.meanVisitySpending).toFixed(2),
              "lastPurchase": {
                "date": _data.lastPurchase.date ? moment(_data.lastPurchase.date).format("DD/MM/YYYY") : "",
                "store": _data.lastPurchase.store,
                "value": parseFloat(_data.lastPurchase.value).toFixed(2),
                "preview": _data.lastPurchase.store+'-'+(_data.lastPurchase.date ? moment(_data.lastPurchase.date).format("DD/MM/YYYY") : ""),
              }
            }

            $scope.data.transactionalData.lastPurchase.preview = $scope.data.transactionalData.lastPurchase.preview.slice(0, 14);

            $scope.loading.transactionalData = 0;
            PopUp.hide();
        }).error(function(error) {
//            PopUp.alert(AppConfig.messages.coupon.title.plural,
//                AppConfig.messages.coupon.errorWhileGetting);
            console.log(error.stack);
        });
    };


    $scope.loadGraphics = function() {
        getRegistrationData();
        getEngagementData();

        getPurchaseBySegment().then(function (_data) {
            var element = document.getElementById("purchaseBySegment");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_pie = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/pie-chart/pie-chart.html?params={"data":"CustomerView_pie"}';
            //element.src = '../graph/pie-chart/pie-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getEventsPropension().then(function (_data) {
            var element = document.getElementById("eventsPropension");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_radar = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/radar-chart/radar-chart.html?params={"data":"CustomerView_radar"}';
            //element.src = '../graph/radar-chart/radar-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getTopStores().then(function (_data) {
            var element = document.getElementById("topStores");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_bar = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/bar-chart/bar-chart.html?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"CustomerView_bar"}';
            //element.src = '../graph/bar-chart/bar-chart.html' + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getTopStoresAlike().then(function (_data) {
            var element = document.getElementById("topStoresAlike");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_bar2 = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/bar-chart/bar-chart.html?params={"config":' + encodeURIComponent('{"color":"#d18f00"}') + ',"data":"CustomerView_bar2"}';
            //element.src = '../graph/bar-chart/bar-chart.html' + '?params={"config":' + encodeURIComponent('{"color":"#d18f00"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getBuyerProfile().then(function (_data) {
            var element = document.getElementById("buyerProfile");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_horizontalstackedbar = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html?params={"data":"CustomerView_horizontalstackedbar"}';
            //element.src = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getAppUse().then(function (_data) {
            var element = document.getElementById("appUse");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_horizontalstackedbar2 = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html?params={"data":"CustomerView_horizontalstackedbar2"}';
            //element.src = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getFacilitiesUse().then(function (_data) {
            var element = document.getElementById("facilitiesUse");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_horizontalstackedbar3 = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html?params={"data":"CustomerView_horizontalstackedbar3"}';
            //element.src = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getSpending().then(function (_data) {
            var element = document.getElementById("spending");

            var graphic_data = JSON.parse(sessionStorage.graphic_data);
            graphic_data.CustomerView_multiserie = JSON.stringify(_data);
            sessionStorage.graphic_data = JSON.stringify(graphic_data);

            element.src = '../graph/multi-serie-line/multi-serie-line.html?params={"data":"CustomerView_multiserie"}';
            //element.src = '../graph/multi-serie-line/multi-serie-line.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
            console.log(error);
        });

        getTransactionalData();
    };

/*
    $timeout(function () {
      $scope.loadGraphics();
    }, 100);
*/
    /* Dialog */
    $scope.openNgDialog = function( graphicName ) {

        var graphic = {
            title: 'Gráfico',
            loadDataFunction: null,
            height: null
        }

        switch ( graphicName ) {
            case 'purchaseBySegment':
                graphic.title = "Compras por Segmento";
                graphic.graphicUrl = '../graph/pie-chart/pie-chart.html';
                graphic.loadDataFunction = getPurchaseBySegment;
                graphic.height = 600;
                break;
            case 'spending':
                graphic.title = "Spending";
                graphic.graphicUrl = '../graph/multi-serie-line/multi-serie-line.html';
                graphic.loadDataFunction = getSpending;
                graphic.height = 300;
                break;
            default:
                alert("No suitable graphic found!");
        };


        ngDialog.open({
            template: 'partials/lightbox/default-chart.html',
            controller: ['$scope', 'CustomerView', function($scope, CustomerView) {
                $scope.title = graphic.title;
                $scope.loadDataFunction = graphic.loadDataFunction;
                $scope.height = graphic.height;

                $scope.loadGraphic = function() {
                    console.log(document.getElementById("graphic"));

                    $scope.loadDataFunction().then(function (_data) {
                        var element = document.getElementById("graphic");

                        var graphic_data = JSON.parse(sessionStorage.graphic_data);
                        graphic_data.CustomerView_lightbox = JSON.stringify(_data);
                        sessionStorage.graphic_data = JSON.stringify(graphic_data);

                        element.src = graphic.graphicUrl + '?params={"data":"CustomerView_lightbox"}';
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

    /* Horizontal Stacked Modal */
    $scope.openHorizontalStacked = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null,
        prop1: "",
        prop2: "",
        prop3: "",
        prop4: "",
        prop5: "",
        prop6: "",
        prop7: "",
        prop8: ""
      }

      switch (graphicName) {
        case 'buyerProfile':
            graphic.title = "Buyer Profile";
            graphic.graphicUrl = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html';
            graphic.loadDataFunction = getBuyerProfile;
            graphic.height = 200;
            graphic.prop1 = "Impacto por Desconto";
            graphic.prop2 = "Impacto por Marca";
            break;
        case 'appUse':
            graphic.title = "Uso do App";
            graphic.graphicUrl = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html';
            graphic.loadDataFunction = getAppUse;
            graphic.height = 200;
            graphic.prop1 = "Destaques";
            graphic.prop2 = "Pontuação";
            graphic.prop3 = "Eventos";
            graphic.prop4 = "Wifi";
            graphic.prop5 = "Alimentação";
            break;
        case 'facilitiesUse':
            graphic.title = "Uso de Facilities";
            graphic.graphicUrl = '../graph/horizontal-stacked-bar/horizontal-stacked-bar.html';
            graphic.loadDataFunction = getFacilitiesUse;
            graphic.height = 200;
            graphic.prop1 = "Sala VIP";
            graphic.prop2 = "Fraldario";
            graphic.prop3 = "SAC";
            break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/horizontal-stacked-bar.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
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

          $scope.loadGraphic = function () {
            //console.log(document.getElementById("graphic"));

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.CustomerView_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"CustomerView_lightbox"}';
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

    /* Radar Chart Modal */
    $scope.openRadarChart = function (graphicName) {

        var graphic = {
          title: "Gráfico",
          loadDataFunction: null,
          height: null,
          prop1: "",
          prop2: "",
          prop3: "",
          prop4: "",
          top: "",
          bottom: ""
        }

        switch (graphicName) {
          case 'eventsPropension':
            graphic.title = "Propensão a Eventos";
            graphic.graphicUrl = '../graph/radar-chart/radar-chart.html';
            graphic.loadDataFunction = getEventsPropension;
            graphic.height = 600;
            graphic.prop1 = "";
            graphic.prop2 = "";
            graphic.prop3 = "";
            graphic.prop4 = "";
            graphic.top = "Beauty index";
            graphic.bottom = "Cultural index";
            break;
          default:
            alert("No suitable graphic found!");
        };

        var graphic_data = JSON.parse(sessionStorage.graphic_data);

        ngDialog.open({
          template: 'partials/lightbox/radar-chart.html',
          controller: ['$scope', 'CustomerView', function ($scope, CustomerView) {
            $scope.title = graphic.title;
            $scope.loadDataFunction = graphic.loadDataFunction;
            $scope.height = graphic.height;
            $scope.prop1 = graphic.prop1;
            $scope.prop2 = graphic.prop2;
            $scope.prop3 = graphic.prop3;
            $scope.prop4 = graphic.prop4;
            $scope.top = graphic.top;
            $scope.bottom = graphic.bottom;

            $scope.loadGraphic = function () {
              console.log(document.getElementById("graphic"));

              if ( !graphic_data[ graphic._cache ] ) {
                $scope.loadDataFunction().then(function (_data) {
                  var element = document.getElementById("graphic");

                  var graphic_data = JSON.parse(sessionStorage.graphic_data);
                  graphic_data[ graphic._cache ] = JSON.stringify(_data);
                  sessionStorage.graphic_data = JSON.stringify(graphic_data);

                  element.src = graphic.graphicUrl + '?params={"data":"'+ graphic._cache +'"}';
                  //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
                }).catch(function (error) {
                  console.log(error);
                });
              } else {
                document.getElementById("graphic").src = graphic.graphicUrl + '?params={"data":"'+ graphic._cache +'"}';
              }

            };

            setTimeout(function () {
                $scope.loadGraphic();
            }, 1000);

          }]
        });

      };

    $scope.openDoubleChart = function( graphicName ) {

        var graphic = {
            title: 'Gráfico',
            loadDataFunction: null,
            loadSecondDataFunction: null,
            height: null,
            prop1: "",
            prop2: "",
        }

        switch ( graphicName ) {
            case 'topStores':
                graphic.title = "Top 5 Lojas";
                graphic.graphicUrl = '../graph/bar-chart/bar-chart.html';
                graphic.loadDataFunction = getTopStores;
                graphic.loadSecondDataFunction = getTopStoresAlike;
                graphic.height = 300;
                graphic.prop1 = "Top Lojas do Cliente";
                graphic.prop2 = "Top Lojas Look Alike";
                break;
            default:
                alert("No suitable graphic found!");
        };


        ngDialog.open({
            template: 'partials/lightbox/double-chart.html',
            controller: ['$scope', 'CustomerView', function($scope, CustomerView) {
                $scope.title = graphic.title;
                $scope.loadDataFunction = graphic.loadDataFunction;
                $scope.loadSecondDataFunction = graphic.loadSecondDataFunction;
                $scope.height = graphic.height;
                $scope.prop1 = graphic.prop1;
                $scope.prop2 = graphic.prop2;


                $scope.loadGraphic = function() {
                    console.log(document.getElementById("graphic"));

                    $scope.loadDataFunction().then(function (_data) {
                        var element = document.getElementById("graphic");

                        var graphic_data = JSON.parse(sessionStorage.graphic_data);
                        graphic_data.CustomerView_lightbox1 = JSON.stringify(_data);
                        sessionStorage.graphic_data = JSON.stringify(graphic_data);

                        element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"CustomerView_lightbox1"}';
                        //element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
                    }).catch(function (error) {
                        console.log(error);
                    });

                };

                $scope.loadSecondGraphic = function() {
                    console.log(document.getElementById("second-graphic"));

                    $scope.loadSecondDataFunction().then(function (_data) {
                        var element = document.getElementById("second-graphic");

                        var graphic_data = JSON.parse(sessionStorage.graphic_data);
                        graphic_data.CustomerView_lightbox2 = JSON.stringify(_data);
                        sessionStorage.graphic_data = JSON.stringify(graphic_data);

                        element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#d18f00"}') + ',"data":"CustomerView_lightbox2"}';
                        //element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#d18f00"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
                    }).catch(function (error) {
                        console.log(error);
                    });

                };

                $scope.loadGraphic();
                $scope.loadSecondGraphic();

            }]
        });

    };

    /* Toggle data */
    $scope.toggleRegistration = function (flag) {
      if (flag !== null && flag !== undefined) {
        $scope.registrationData = flag;
      } else {
        $scope.registrationData = ! $scope.registrationData;
        $scope.toggleEngagement(false);
      }
    };
    $scope.registrationData = false;

    $scope.toggleEngagement = function (flag) {
      if (flag !== null && flag !== undefined) {
        $scope.engagementData = flag;
      } else {
        $scope.engagementData = ! $scope.engagementData;
        $scope.toggleRegistration(false);
      }
    };
    $scope.engagementData = false;


    /*Dados enviados por outras módulos */
    const data = Cache.get('send-customer-view-data');

    /* Escopo inicial para pegar o melhor cliente do shopping */
    let cache_defaultClient = Session.get('defaultClient');

    if (data) {
      $scope.cpf = data.clientCpf || $scope.cpf;
        $scope.mallId = data.mallId || $scope.mallId;
        $scope.mallName = data.mallName || $scope.mallName;
        $scope.clientId = data.clientId || $scope.clientId;
        $scope.malls = [ $scope.mallId ];
        $scope.loadGraphics();
    }

    else if ( cache_defaultClient ) {
      $scope.clientId = cache_defaultClient.clientId; //25314;
      $scope.mallId = cache_defaultClient.tmpMall.id;
      $scope.mallName = cache_defaultClient.tmpMall.name;
      $scope.cpf = cache_defaultClient.cpf;

      Session.set('defaultClient', undefined);

      $scope.loadGraphics();
    } else {

      PopUp.hide();
      PopUp.loading(AppConfig.messages.loading);

      cache_defaultClient = {};

      $scope.userMalls = Session.get('malls');
       // Escolhe um shopping aleatoriamente da lista de shoppings disponíveis
      let tmpMall = $scope.userMalls[ Math.floor(Math.random()*$scope.userMalls.length) ];
      ClientMall.getBestClient(tmpMall.id).success(function (client) {
        $scope.clientId = client[0].id; //25314;

        cache_defaultClient.clientId = client[0].id;

        cache_defaultClient.tmpMall = {
          id: tmpMall.id,
          name: tmpMall.name,
        };

        Session.set('defaultClient', cache_defaultClient);

        $scope.mallId = tmpMall.id;
        $scope.mallName = tmpMall.name;

        $scope.loadGraphics();
      }).error(function (error) {
        PopUp.alert('Customer View',
          AppConfig.messages.apiGenericError);
        console.log(error);
      });

    }

    $scope.openEditClient = function (cpf){
      ngDialog.open({
        template: 'partials/lightbox/edit-client.html',
        closeByEscape: true,
        closeByDocument: true,
        preCloseCallback: function() {
          $scope.cpf = cpf;
          $scope.getClient(cpf);
          return true;
        },
        controller: ['$scope', 'Client', 'Session', function ($scope, Client, Session) {

          console.log(cpf);

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
