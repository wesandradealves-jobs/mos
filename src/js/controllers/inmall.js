'use strict';

/* eslint-env browser */
/* global _app */

_app.controller('InMallController', [
  '$scope', '$q', 'InMallView', 'ngDialog', 'PopUp', 'AppConfig', '$location',
  'Session', 'EventBus', 'Permission', 'Utils',
  function (
    $scope, $q, InMallView, ngDialog, PopUp, AppConfig, $location,
    Session, EventBus, Permission, Utils
  ) {

    $scope.menuPermissions = Permission.menuPermissions();

    /* Pegando dados de usuário e logout de sistema */
    $scope.user = Session.get('user');
    $scope.userMalls = Session.get('malls');
    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };

    /* Limpeza das sessões dos gráficos */
    //sessionStorage.graphic_data = JSON.stringify({});
    try {
      JSON.parse(sessionStorage.graphic_data);
    } catch (e) {
      sessionStorage.graphic_data = JSON.stringify({});
    }

    /* Escopo inicial forçado para testar os gráficos */
    var startDate = new Date();
    $scope.malls = [$scope.userMalls[0].id];
    $scope.startDate = moment(startDate).format("YYYY-MM-DD");
    $scope.offset = "month";

    $scope.data = {};


    $scope.loading = {
        baseView: 0,
        facilitiesUse: 0,
        storeSpending: 0,
        mixedMetrics: 0,
        weeklyAppInteractions: 0,
        modalityFlow: 0,
        appInteractions: 0,
        newSignup: 0,
        dailySpending: 0,
    };

    function getAppInteractions() {

      $scope.loading.appInteractions = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getAppInteractions($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {

        $scope.loading.appInteractions = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getFacilitiesUse() {

      $scope.loading.facilitiesUse = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getFacilitiesUse($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        $scope.loading.facilitiesUse = 0;
        deferred.resolve(_data.graphics);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getBaseView() {

      $scope.loading.baseView = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getBaseView($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        $scope.loading.baseView = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getStoreSpending() {

      $scope.loading.storeSpending = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getStoreSpending($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        deferred.resolve(_data);
        $scope.loading.storeSpending = 0;
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getWeeklyAppInteractions() {

      $scope.loading.weeklyAppInteractions = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getWeeklyAppInteractions($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        $scope.loading.weeklyAppInteractions = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getMixedMetrics() {

      $scope.loading.mixedMetrics = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getMixedMetrics($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        $scope.loading.mixedMetrics = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getModalityFlow() {

      $scope.loading.modalityFlow = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getModalityFlow($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        $scope.loading.modalityFlow = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getNewSignup() {

      $scope.loading.newSignup = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getNewSignup($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        $scope.loading.newSignup = 0;
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    function getDailySpending() {

      $scope.loading.dailySpending = 1;

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      InMallView.getDailySpending($scope.malls, $scope.startDate, $scope.offset).success(function (_data) {
        deferred.resolve(_data);
        $scope.loading.dailySpending = 0;
        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.log(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;

    };

    $scope.loadGraphics = function () {

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      if ( !graphic_data.InMallView_sunburn ) {
        getBaseView().then(function (_data) {
          var element = document.getElementById("baseView");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_sunburn = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/sun-burn/sun-burn.html?params={"data":"InMallView_sunburn"}';
          //element.src = '../graph/sun-burn/sun-burn.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("baseView").src = '../graph/sun-burn/sun-burn.html?params={"data":"InMallView_sunburn"}';
      }

      if ( !graphic_data.InMallView_heatmap ) {
        getWeeklyAppInteractions().then(function (_data) {
          var element = document.getElementById("weeklyAppInteractions");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_heatmap = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/heat-map/heat-map.html?params={"data":"InMallView_heatmap"}';
          //element.src = '../graph/heat-map/heat-map.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("weeklyAppInteractions").src = '../graph/heat-map/heat-map.html?params={"data":"InMallView_heatmap"}';
      }

      if ( !graphic_data.InMallView_multiserieline ) {
        getAppInteractions().then(function (_data) {
          var element = document.getElementById("appInteractions");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_multiserieline = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/multi-serie-line/multi-serie-line.html?params={"data":"InMallView_multiserieline"}';
          //element.src = '../graph/multi-serie-line/multi-serie-line.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("appInteractions").src = '../graph/multi-serie-line/multi-serie-line.html?params={"data":"InMallView_multiserieline"}';
      }

      //if ( !graphic_data.InMallView_radar ) {
      //  console.log("Carregado!");
        getFacilitiesUse().then(function (_data) {
          var element = document.getElementById("facilitiesUse");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_radar = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/radar-chart/radar-chart.html?params={"data":"InMallView_radar"}';
          //element.src = '../graph/radar-chart/radar-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      //} else {
      //  console.log("Não carregado!");
      //  document.getElementById("facilitiesUse").src = '../graph/radar-chart/radar-chart.html?params={"data":"InMallView_radar"}';
      //}

      if ( !graphic_data.InMallView_bulletchart ) {
        getMixedMetrics().then(function (_data) {
          var element = document.getElementById("mixedMetrics");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_bulletchart = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/bullet-chart/bullet-chart.html?params={"data":"InMallView_bulletchart"}';
          //element.src = '../graph/bullet-chart/bullet-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("mixedMetrics").src = '../graph/bullet-chart/bullet-chart.html?params={"data":"InMallView_bulletchart"}';
      }

      if ( !graphic_data.InMallView_sankey ) {
        getModalityFlow().then(function (_data) {
          var element = document.getElementById("modalityFlow");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_sankey = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/sankey/sankey.html?params={"data":"InMallView_sankey"}';
          //element.src = '../graph/sankey/sankey.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("modalityFlow").src = '../graph/sankey/sankey.html?params={"data":"InMallView_sankey"}';
      }

      if ( !graphic_data.InMallView_stackedbar1 ) {
        getNewSignup().then(function (_data) {
          var element = document.getElementById("newSignup");
          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_stackedbar1 = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/stacked-bar/stacked-bar.html?params={"data":"InMallView_stackedbar1"}';
          //element.src = '../graph/stacked-bar/stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("newSignup").src = '../graph/stacked-bar/stacked-bar.html?params={"data":"InMallView_stackedbar1"}';
      }

      if ( !graphic_data.InMallView_stackedbar2 ) {
        getDailySpending().then(function (_data) {
          var element = document.getElementById("dailySpending");
          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_stackedbar2 = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/stacked-bar/stacked-bar.html?params={"data":"InMallView_stackedbar2"}';
          //element.src = '../graph/stacked-bar/stacked-bar.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("dailySpending").src = '../graph/stacked-bar/stacked-bar.html?params={"data":"InMallView_stackedbar2"}';
      }

      if ( !graphic_data.InMallView_bubble ) {
        getStoreSpending().then(function (_data) {
          var element = document.getElementById("storeSpending");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.InMallView_bubble = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/bubble-chart/bubble-chart.html?params={"data":"InMallView_bubble"}';
          //element.src = '../graph/bubble-chart/bubble-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        document.getElementById("storeSpending").src = '../graph/bubble-chart/bubble-chart.html?params={"data":"InMallView_bubble"}';
      }

    }

    function updateSelectedMalls(malls) {
      $scope.malls = malls;
      console.log($scope.malls)

      sessionStorage.graphic_data = JSON.stringify({});

      $scope.loadGraphics();
    }

    $scope.updateOffset = function() {
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
      }

      switch (graphicName) {
        case 'baseView':
          graphic.title = "Visão da Base";
          graphic.graphicUrl = '../graph/sun-burn/sun-burn.html';
          graphic.loadDataFunction = getBaseView;
          graphic.height = 600;
          graphic._cache = "InMallView_sunburn";
          break;
        case 'weeklyAppInteractions':
          graphic.title = "Login por dia no App";
          graphic.graphicUrl = '../graph/heat-map/heat-map.html';
          graphic.loadDataFunction = getWeeklyAppInteractions;
          graphic.height = 450;
          graphic._cache = "InMallView_heatmap";
          break;
        case 'modalityFlow':
          graphic.title = "Fluxo de Segmentos";
          graphic.graphicUrl = '../graph/sankey/sankey.html';
          graphic.loadDataFunction = getModalityFlow;
          graphic.height = 450;
          graphic._cache = "InMallView_sankey";
          break;
        default:
          alert("No suitable graphic found!");
      };

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));

            if ( !graphic_data[ graphic._cache ] ) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                //var graphic_data = JSON.parse(sessionStorage.graphic_data);
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

    /* Bubble Chart Modal */
    $scope.openBubbleChart = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'storeSpending':
          graphic.title = "Spending das Lojas";
          graphic.graphicUrl = '../graph/bubble-chart/bubble-chart.html';
          graphic.loadDataFunction = getStoreSpending;
          graphic.height = 600;
          graphic._cache = "InMallView_bubble";
          break;
        default:
          alert("No suitable graphic found!");
      };

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/bubble-chart.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));

            if ( !graphic_data[ graphic._cache ] ) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                //var graphic_data = JSON.parse(sessionStorage.graphic_data);
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
        case 'appInteractions':
          graphic.title = "Visualizações do App";
          graphic.graphicUrl = '../graph/multi-serie-line/multi-serie-line.html';
          graphic.loadDataFunction = getAppInteractions;
          graphic.height = 300;
          graphic.prop1 = "Alimentação",
          graphic.prop2 = "Destaques",
          graphic.prop3 = "Eventos",
          graphic.prop4 = "Pontuação",
          graphic.prop5 = "WiFi"
          graphic._cache = "InMallView_multiserieline";
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
            console.log(document.getElementById("graphic"));

            if ( !graphic_data[ graphic._cache ] ) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                //var graphic_data = JSON.parse(sessionStorage.graphic_data);
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

    /* Stacked Bar Modal */
    $scope.openStackedBar = function (graphicName) {

      var graphic = {
        title: "Gráfico",
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'newSignup':
          graphic.title = "Novos Cadastros";
          graphic.graphicName = graphicName;
          graphic.graphicUrl = '../graph/stacked-bar/stacked-bar.html';
          graphic.loadDataFunction = getNewSignup;
          graphic.height = 300;
          graphic._cache = "InMallView_stackedbar1";
          break;
        case 'dailySpending':
          graphic.title = "Spending no período";
          graphic.graphicName = graphicName;
          graphic.graphicUrl = '../graph/stacked-bar/stacked-bar.html';
          graphic.loadDataFunction = getDailySpending;
          graphic.height = 300;
          graphic._cache = "InMallView_stackedbar2";
          break;
        default:
          alert("No suitable graphic found!");
      };

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/stacked-bar.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.graphicName = graphic.graphicName;

          $scope.loadGraphic = function () {
            console.log(document.getElementById("graphic"));
            $scope.loadDataFunction().then(function (_data) {
              if ( !graphic_data[ graphic._cache ] ) {

                Object.assign($scope, Utils.labelGenerator(['date'], _data[0]));

                var element = document.getElementById("graphic");

                //var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data[ graphic._cache ] = JSON.stringify(_data);

                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = graphic.graphicUrl + '?params={"data":"'+ graphic._cache +'"}';
                //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
              } else {

                Object.assign($scope, Utils.labelGenerator(['date'], _data[0]));

                document.getElementById("graphic").src = graphic.graphicUrl + '?params={"data":"'+ graphic._cache +'"}';
              }
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
        case 'mixedMetrics':
          graphic.title = "Métricas Diversas";
          graphic.graphicUrl = '../graph/bullet-chart/bullet-chart.html';
          graphic.loadDataFunction = getMixedMetrics;
          graphic.height = 330;
          graphic.prop1 = "Período anterior";
          graphic.prop2 = "Período atual";
          graphic._cache = "InMallView_bulletchart";
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
        case 'facilitiesUse':
          graphic.title = "Facilities";
          graphic.graphicUrl = '../graph/radar-chart/radar-chart.html';
          graphic.loadDataFunction = getFacilitiesUse;
          graphic.height = 600;
          graphic._cache = "InMallView_radar";
          graphic.prop1 = "Período atual";
          graphic.prop2 = "Período anterior";
          graphic.prop3 = "Mesmo período do ano anterior";
          graphic.prop4 = "";
          graphic.top = "Sala VIP";
          graphic.bottom = "";
          break;
        default:
          alert("No suitable graphic found!");
      };

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/radar-chart.html',
        controller: ['$scope', 'InMallView', function ($scope, InMallView) {
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
  }]);
