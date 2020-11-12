'use strict';

/* global _app */
/* eslint-env browser */

_app.controller('InstoreController', [
  '$scope', '$location', 'CustomerView', 'ngDialog', '$q', 'PopUp', 'AppConfig',
  'Session', 'Permission', 'EventBus', 'Cache', 'ClientMall', 'InStoreView',
  function (
    $scope, $location, CustomerView, ngDialog, $q, PopUp, AppConfig,
    Session, Permission, EventBus, Cache, ClientMall, InStoreView
  ) {

    $scope.menuPermissions = Permission.menuPermissions();
    $scope.canAccessCustomerView = $scope.menuPermissions['ACCESS-INSTOREVIEW'];

    /* Pegando dados de usuário e logout de sistema */
    $scope.user = Session.get('user');
    $scope.userMalls = Session.get('malls');
    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };

    /* Escopo inicial forçado para testar os gráficos */
    var startDate = new Date();
    $scope.startDate = moment(startDate).format("YYYY-MM-DD");
    $scope.offset = "year";
    $scope.storeId = 0;
    $scope.inStoreView = {
      mallId: $scope.userMalls[0] ? $scope.userMalls[0].id.toString() : '-1',
      storeSearch: "",
    };
    $scope.stores = [];
    $scope.report = {};

    $scope.searchStores = function () {
      InStoreView.getStores($scope.inStoreView.mallId, $scope.inStoreView.storeSearch).then(function (stores) {
        $scope.stores = stores.data;
        console.log($scope.stores)

        if ($scope.stores && $scope.stores.length > 0) {
          $scope.boxAutoComplete = true;
        } else {
          $scope.boxAutoComplete = false;
        }



      }).catch(function (error) {
        console.warn(error);
      });
    };

    $scope.changePeriod = function () {
      if ($scope.inStoreView.storeSearch == "") {
        $scope.showTopStore($scope.inStoreView.mallId);
      }
      $scope.reloadGraphics();
    }

    $scope.changeMall = function (mallId) {
      $scope.clearStoreSearch();
      $scope.showTopStore(mallId);
      $scope.reloadGraphics();
    }

    $scope.showTopStore = function (mallId) {
      PopUp.hide();
      PopUp.loading(AppConfig.messages.loading);

      cache_defaultStore = {};

      $scope.userMalls = Session.get('malls');

      InStoreView.getTopStore(mallId).success(function (store) {
        $scope.storeId = store[0].store_id;
        $scope.storeName = store[0].name;

        cache_defaultStore.storeId = store[0].store_id;
        cache_defaultStore.storeName = store[0].name;

        Session.set('defaultStore', cache_defaultStore);

        $scope.loadGraphics({
          id: $scope.storeId,
          name: $scope.storeName
        });
      }).error(function (error) {
        PopUp.alert('Instore View',
          AppConfig.messages.apiGenericError);
        console.warn(error);
      });
    }

    $scope.reloadGraphics = function () {
      if ($scope.inStoreView.storeSearch !== null && $scope.inStoreView.storeSearch !== undefined && $scope.inStoreView.storeSearch !== "") {
        $scope.loadGraphics({
          id: $scope.storeId,
          name: $scope.inStoreView.storeSearch
        });
      }
    };

    $scope.clearStoreSearch = function () {
      $scope.storeId = 0;
      $scope.inStoreView.storeSearch = "";
    }

    function getStoreTransactions() {

      //        PopUp.loading(AppConfig.messages.coupon.gettingPendents);
      var deferred = $q.defer();

      InStoreView.getStoreTransactions($scope.storeId, $scope.offset).success(function (_data) {
        deferred.resolve(_data);
        //            PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    }

    function getClient() {
      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InStoreView.getClient($scope.storeId, $scope.offset).success(function (_data) {
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getAverageTicket() {

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InStoreView.getAverageTicket($scope.storeId, $scope.offset).success(function (_data) {
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getSelling() {

      //$scope.loading.mixedMetrics = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InStoreView.getSelling($scope.storeId, $scope.offset).success(function (_data) {
        //$scope.loading.mixedMetrics = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getTotalUniqueClients() {

      PopUp.loading(AppConfig.messages.loading);

      InStoreView.getTotalUniqueClients($scope.storeId, $scope.offset).success(function (_data) {

        $scope.report.TotalUniqueClients = _data[0].result;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
      });
    };

    function getTransactionQuantity() {

      PopUp.loading(AppConfig.messages.loading);

      InStoreView.getTransactionQuantity($scope.storeId, $scope.offset).success(function (_data) {

        $scope.report.TransactionQuantity = _data[0].result;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
      });
    };

    function getTransactionValue() {

      PopUp.loading(AppConfig.messages.loading);

      InStoreView.getTransactionValue($scope.storeId, $scope.offset).success(function (_data) {

        $scope.report.TransactionValue = _data[0].result;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
      });
    };

    $scope.loadGraphics = function (store) {
      $scope.boxAutoComplete = false;
      $scope.boxMouseIn = false;

      $scope.storeId = store.id;
      $scope.inStoreView.storeSearch = store.name;

      getClient().then(function (_data) {
        var element = document.getElementById("baseClient");
        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.InStoreView_pie = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/pie-chart/pie-chart.html?params={"data":"InStoreView_pie"}';
        //element.src = '../graph/pie-chart/pie-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.warn(error);
      });

      getStoreTransactions().then(function (_data) {
        var element = document.getElementById("storeTransactions");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.InStoreView_groupedbar = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/grouped-bar/grouped-bar.html?params={"data":"InStoreView_groupedbar"}';
        //element.src = '../graph/grouped-bar/grouped-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.warn(error);
      });

      getAverageTicket().then(function (_data) {
        var element = document.getElementById("averageTicket");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.InStoreView_multiserieline = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/multi-serie-line/multi-serie-line.html?params={"data":"InStoreView_multiserieline"}';
      }).catch(function (error) {
        console.warn(error);
      });

      getSelling().then(function (_data) {
        var element = document.getElementById("selling");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.InStoreView_bulletchart = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/bullet-chart/bullet-chart.html?params={"data":"InStoreView_bulletchart"}';
        //element.src = '../graph/bullet-chart/bullet-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.warn(error);
      });

      getTotalUniqueClients();

      getTransactionQuantity();

      getTransactionValue();

    };

      /* Escopo inicial para pegar a melhor loja do shopping */
      let cache_defaultStore = Session.get('defaultStore');
      // let cache_defaultClient = Session.get('defaultClient');

      // if (cache_defaultStore) {        
      //   $scope.storeId = cache_defaultStore.storeId;
      //   $scope.storeName = cache_defaultStore.storeName;
      
      //   Session.set('defaultStore', undefined);

      //   $scope.loadGraphics({
      //     id: $scope.storeId,
      //     name: $scope.storeName
      //   });

      //   if (cache_defaultClient) {
      //     $scope.mallId = cache_defaultClient.tmpMall.id.toString();
      //     console.log($scope.mallId)
      //     $scope.showTopStore($scope.mallId);
      //   }

      // } else {
        $scope.showTopStore($scope.inStoreView.mallId);
      // }


    /*
        $timeout(function () {
          $scope.loadGraphics();
        }, 100);
    */
    /* Dialog */
    $scope.openNgDialog = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'baseClient':
          graphic.title = "Clientes";
          graphic.graphicUrl = '../graph/pie-chart/pie-chart.html';
          graphic.loadDataFunction = getClient;
          graphic.height = 600;
          break;

        case 'storeTransactions':
          graphic.title = "Transações";
          graphic.graphicUrl = '../graph/grouped-bar/grouped-bar.html';
          graphic.loadDataFunction = getStoreTransactions;
          graphic.height = 300;
          graphic.prop1 = "Total da Loja";
          graphic.prop2 = "Média do Segmento";
          break;

        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', 'CustomerView', function ($scope, CustomerView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;

          $scope.loadGraphic = function () {

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.CustomerView_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"CustomerView_lightbox"}';
              //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.warn(error);
            });

          };
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
      }

      switch (graphicName) {
        case 'averageTicket':
          graphic.title = "Ticket Médio";
          graphic.graphicUrl = '../graph/multi-serie-line/multi-serie-line.html';
          graphic.loadDataFunction = getAverageTicket;
          graphic.height = 300;
          graphic.prop1 = "Loja",
            graphic.prop2 = "Segmento",
            graphic.prop3 = "",
            graphic.prop4 = "",
            graphic.prop5 = ""
          graphic._cache = "InStoreView_multiserieline";
          break;
        default:
          alert("No suitable graphic found!");
      };

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/multi-line.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;
          $scope.prop3 = graphic.prop3;
          $scope.prop4 = graphic.prop4;
          $scope.prop5 = graphic.prop5;

          $scope.loadGraphic = function () {

            if (!graphic_data[graphic._cache]) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                //var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data[graphic._cache] = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = graphic.graphicUrl + '?params={"data":"' + graphic._cache + '"}';
                //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
              }).catch(function (error) {
                console.warn(error);
              });
            } else {
              document.getElementById("graphic").src = graphic.graphicUrl + '?params={"data":"' + graphic._cache + '"}';
            }

          };
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
        case 'selling':
          graphic.title = "Vendas";
          graphic.graphicUrl = '../graph/bullet-chart/bullet-chart.html';
          graphic.loadDataFunction = getSelling;
          graphic.height = 440;
          graphic.prop1 = "Loja";
          graphic.prop2 = "Segmento";
          graphic._cache = "InStoreView_bulletchart";
          break;
        default:
          alert("No suitable graphic found!");
      };

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/bullet-chart.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;

          $scope.loadGraphic = function () {
            if (!graphic_data[graphic._cache]) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data[graphic._cache] = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = graphic.graphicUrl + '?params={"data":"' + graphic._cache + '"}';
                //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
              }).catch(function (error) {
                console.warn(error);
              });
            } else {
              document.getElementById("graphic").src = graphic.graphicUrl + '?params={"data":"' + graphic._cache + '"}';
            }

          };
        }]
      });

    };


    PopUp.hide();
    PopUp.loading(AppConfig.messages.loading);
    //$scope.loadGraphics();


  }
]);
