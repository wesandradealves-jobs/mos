'use strict';

/* global _app, moment */
/* eslint semi: off */

_app.controller('PromoController', [
  '$scope', '$route', '$q', 'ngDialog', 'PopUp', 'AppConfig', 'Promo', 'Campaign',
  'Session', '$location', 'DTOptionsBuilder', 'Permission',
  'EventBus', '$templateCache', 'Client', '$timeout',
  function (
    $scope, $route, $q, ngDialog, PopUp, AppConfig, Promo, Campaign,
    Session, $location, DTOptionsBuilder, Permission, EventBus,
    $templateCache, Client, $timeout
  ) {

    // REMOVER!!!
    var erro = null;

    $templateCache.removeAll();
    $scope.menuPermissions = Permission.menuPermissions();
    $scope.canAccessPromotions = $scope.menuPermissions['ACCESS-PROMOTIONS'];

    $scope.prettyPrintCpf = function (cpf) {
      return cpf.substr(0, 3) + '.' + cpf.substr(3, 3) + '.' + cpf.substr(6, 3) + '-' + cpf.substr(9, 2);
    };

    $scope.newPromo = function (callbackAfter) {

      PopUp.loading(AppConfig.messages.promotion.title, AppConfig.messages.promotion.creating);
      $scope.promo.giftDetails.clubExchangeValue =
        $scope.promo.giftDetails.clubExchangeValue ||
        $scope.promo.exchangeVolumeValue;

      Promo.newPromo($scope.promo).success(function (promo) {
        $scope.promoId = promo.id;

        PopUp.success(AppConfig.messages.promotion.title,
          AppConfig.messages.promotion.success,
          function () {
            // $scope.getPromos();
            $route.reload();
          });
        callbackAfter(promo);

      }).error(function (error) {
        console.warn(error.error)
        if (error.error === 'Error: Both "sinceDate" and "untilDate" promotion dates must be on the future!') {
          console.warn(error);
          PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreatingOldDate);
        } else if (error.error === 'Error: The "sinceDate" must be lower than "untilDate" to create promotions!') {
          console.warn(error);
          PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreatingHigherSinceDate);
        } else {
          console.warn(error);
          PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreating);
        }
      });
    };

    $scope.promoInEditionMode = false

    $scope.promo = {};
    $scope.didUploadBanner = false;
    $scope.didUploadBlacklist = false;
    $scope.uploadBlacklistError = false;
    $scope.didUploadRegulation = false;
    $scope.didChooseStores = false;
    $scope.promo.giftDetails = {};

    $scope.promo.raffleDetails = {};

    $scope.savePromo = function () {
      $scope.savePromoBefore(function () {
        // $scope.promoAlreadySaved = true;
        $route.reload();
      });
      $scope.promoInEditionMode = false
      $scope.didUploadBanner = false;
      $scope.didUploadBlacklist = false;
      $scope.uploadBlacklistError = false;
      $scope.didUploadRegulation = false;
      $scope.didChooseStores = false;
    };

    $scope.savePromoBefore = function (callbackAfter) {
      if ($scope.promo.id) {
        $scope.editPromo(callbackAfter);
      } else {
        $scope.newPromo(callbackAfter);
      }
    };

    $scope.editPromo = function (callbackAfter) {

      if ($scope.promo.giftDetails === null) {
        delete $scope.promo.giftDetails;
      }

      if ($scope.promo.raffleDetails === null) {
        delete $scope.promo.raffleDetails;
      }

      if ($scope.promo.regulationUrl === null) {
        delete $scope.promo.regulationUrl;
      }

      $scope.promo.labels = $scope.promo.labels.map(function (labelId) {
        return labelId.toString();
      });

      if (moment($scope.promo.sinceDate, "YYYY-MM-DD").isValid()) {
        $scope.promo.sinceDate = moment($scope.promo.sinceDate, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss");
      }

      if (moment($scope.promo.untilDate, "YYYY-MM-DD").isValid()) {
        $scope.promo.untilDate = moment($scope.promo.untilDate, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss");
      }

      Promo.editPromo($scope.promo.id, $scope.promo).success(function (promo) {
        PopUp.success(
          AppConfig.messages.promotion.title,
          AppConfig.messages.promotion.success
        );
        callbackAfter(promo);
      }).error(function (failedError) {
        console.error(failedError);
        PopUp.alert(
          AppConfig.messages.promotion.title,
          AppConfig.messages.promotion.failedEdition
        );
      });
    };

    $scope.excludePromo = function () {
      PopUp.confirm(
        AppConfig.messages.promotion.title,
        AppConfig.messages.promotion.confirmExclusion,

        function (confirmation) {
          if (confirmation) {
            Promo.excludePromo($scope.promo.id).success(function () {
              PopUp.success(
                AppConfig.messages.promotion.title,
                AppConfig.messages.promotion.excluded,
                function () {
                  $route.reload();
                }
              );
            }).error(function (failedError) {
              console.error(failedError);
              PopUp.alert(
                AppConfig.messages.promotion.title,
                AppConfig.messages.promotion.failedExclusion
              );
            });
          }
        }
      );
      $scope.promoInEditionMode = false
    };

    $scope.publishPromo = function () {
      const callbackAfter = function (promo) {
        Promo.publishPromo(promo.id).success(function (data) {
          PopUp.success(AppConfig.messages.promotion.title,
            AppConfig.messages.promotion.success,
            function () {
              window.location.reload();
            });
        }).error(function (error) {

          console.warn(error.error)
          if (error.error === 'Error: Both "sinceDate" and "untilDate" promotion dates must be on the future!') {
            console.warn(error);
            PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreatingOldDate);
          } else if (error.error === 'Error: The "sinceDate" must be lower than "untilDate" to create promotions!') {
            console.warn(error);
            PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreatingHigherSinceDate);
          } else {
            console.warn(error);
            PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreating);
          }

          PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.promotion.failedCreating);


          PopUp.alert(
            AppConfig.messages.promotion.title,
            AppConfig.messages.promotion.failedPublished
          );
        });

        $scope.promoInEditionMode = false
      };
      $scope.savePromoBefore(callbackAfter);
    };

    //$scope.promoTypes = [];
    Promo.getPromoTypes().success(function (promoTypes) {
      $scope.promoTypes = promoTypes;
    }).error(function (error) {
      console.warn(error);
    });

    Promo.getPromoLabels().success(function (promoLabels) {
      $scope.promoLabels = promoLabels;
    }).error(function (error) {
      console.warn(error);
    });

    // CARREGAR INFORMAÇÕES DO BANCO QUANDO TROCAR O SHOPPING

    $scope.getPromos = function () {
      Promo.getPromos([$scope.controlMall]).success(function (promos) {
        $scope.promos = promos;

        for (var i = 0; i < $scope.promos.length; i++) {
          var promo = $scope.promos[i];
          var promoCopy = Object.assign({}, promo);


          promo.interval = moment(promo.sinceDate).format("DD-MM-YYYY") +
            " - " + moment(promo.untilDate).format("DD-MM-YYYY");

          promo.type = promo.mallPromotionTypeId === "1" ?
            "Sorteio por similaridade" : "Compre e Ganhe";
          promo.tags = promo.labels.map(function (label) {
            return label.label.name;
          }).join(", ");
          promo.originalCopy = promoCopy;
          if (promoCopy.giftDetails) {
            promoCopy.giftDetails.totalGiftsAmount = Number.parseInt(promoCopy.giftDetails.totalGiftsAmount, 10);
            promoCopy.giftDetails.currentGiftsAmount = Number.parseInt(promoCopy.giftDetails.currentGiftsAmount, 10);
          }
          $scope.promos[i] = promo;

        }
      }).error(function (error) {
        console.warn(error);
      });
    };

    $scope.validPromo = function () {
      if ($scope.promo.mallPromotionTypeId) {
        if ($scope.promo.mallPromotionTypeId.toString() === '1') {
          if ($scope.promo.exchangeVolumeValue && $scope.promo.raffleDetails.federalLotteryDraw) {
            return true
          }
        } else if ($scope.promo.mallPromotionTypeId.toString() === '2') {
          if ($scope.promo.giftDetails.totalGiftsAmount && $scope.promo.exchangeVolumeValue) {
            return true
          }
          return false
        }
      } else {
        return false
      }
    }

    // TODO: tratar erro com callback no método .error

    /* Data table responsive */
    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('responsive', true);

    /* Pegando dados de usuário e logout de sistema */
    $scope.malls = Session.get('malls');
    $scope.promo.mallId = $scope.malls[0].id.toString();
    $scope.controlMall = $scope.promo.mallId;
    $scope.operationsPromos = [];
    $scope.operationsPromo = "-1";
    $scope.operationsMall = $scope.promo.mallId;
    $scope.operationsGifts = [];
    $scope.reportPromo = "-1";
    $scope.reportValues = {
      totalPurchaseValue: 0,
      averageTicketTx: 0,
      averageTicketClients: 0,
      totalTxs: 0,
      totalClients: "--",
      totalGifts: "--",
      distributedGifts: "--",
      winnerCpf: "--"
    };
    $scope.mallHasPromos = false;

    $scope.loadCards = function () {
      if ($scope.reportPromo == '-1') {
        return;
      }

      $scope.reportPromoData = $scope.reportPromos.filter(function (promo) {
        return $scope.reportPromo.toString() === promo.id.toString();
      })[0];

      Promo.getTotalPurchase($scope.reportPromo).success(function (data) {
        $scope.reportValues.totalPurchaseValue = data.totalValue;
      });

      Promo.getAverageClientTicket($scope.reportPromo).success(function (data) {
        $scope.reportValues.averageTicketClients = data.reais;
      });

      Promo.getAverageTxTicket($scope.reportPromo).success(function (data) {
        $scope.reportValues.averageTicketTx = data.reais;
      });

      Promo.getTotalTransactions($scope.reportPromo).success(function (data) {
        $scope.reportValues.totalTxs = data.totalTxs;
      });

      Promo.getTotalClients($scope.reportPromo).success(function (data) {
        $scope.reportValues.totalClients = data.totalClients;
      });

      if ($scope.reportPromoData.mallPromotionTypeId.toString() === '2') {
        const giftDetails = $scope.reportPromoData.giftDetails;
        $scope.reportValues.totalGifts = giftDetails.totalGiftsAmount;
        $scope.reportValues.distributedGifts = giftDetails.totalGiftsAmount - giftDetails.currentGiftsAmount;
      }

      if ($scope.reportPromoData.raffleDetails && $scope.reportPromoData.raffleDetails.winnerClientId) {
        Client.getById($scope.reportPromoData.raffleDetails.winnerClientId).success(function (client) {
          $scope.reportValues.winnerCpf = $scope.prettyPrintCpf(client.cpf);
          $scope.reportValues.winnerClientId = client.id;
        }).error(function (reason) {
          console.error(reason);
          $scope.reportValues.winnerCpf = '--';
          $scope.reportValues.winnerClientId = 0;
        });
      } else {
        $scope.reportValues.winnerCpf = '--';
        $scope.reportValues.winnerClientId = 0;
      }
    };

    $scope.finishedPromotion = function (promo) {
      return moment().isAfter(moment(promo.untilDate, 'YYYY-MM-DD HH:mm:ss'));
    };

    $scope.getOperationsPromos = function () {
      Promo.getPromos([$scope.operationsMall]).success(function (promos) {
        $scope.operationsPromos = promos.filter(function (promo) {
          return promo.published && promo.mallPromotionTypeId.toString() === "2" &&
            moment().isAfter(promo.sinceDate);
        });
        if ($scope.operationsPromos.length > 0) {
          $scope.operationsPromo = $scope.operationsPromos[0].id.toString();
        } else {
          $scope.operationsPromo = "-1";
        }
      }).error(function (error) {
        console.warn(error);
      });
    };

    $scope.operationsNoCpfFound = function () {
      // cleanup of previous client ID before another request
      $scope.operationsClientId = undefined;

      // catch gift ID if form input is filled with non-CPF data
      $scope.operationsGiftId =
        $scope.operationsClientCpf ? $scope.operationsClientCpf : undefined;
    };

    $scope.operationsClearCpfInput = function () {
      $scope.operationsClientCpf = '';
    };

    $scope.listPromoGifts = function () {
      PopUp.loading(AppConfig.messages.loading);

      Client.getByCPF($scope.operationsClientCpf || '00000000000').success(function (client) {
        if (client) {
          // populated client ID from CPF
          $scope.operationsClientId = client.id;

          // cleanup of previous gift ID before another request
          $scope.operationsGiftId = undefined;
        } else {
          $scope.operationsNoCpfFound();
        }

        $scope.listPromoGiftsAfter();
      }).error(function (error) {
        console.warn(error);

        $scope.operationsNoCpfFound();
        $scope.listPromoGiftsAfter();
      });
    };

    $scope.listPromoGiftsAfter = function () {
      Promo.getGiftRights(
        $scope.operationsPromo,
        $scope.operationsClientId
      ).success(function (data) {
        PopUp.hide();
        $scope.operationsGifts = data;

        // filter by gift ID if it exists
        if ($scope.operationsGiftId) {
          $scope.operationsGifts = $scope.operationsGifts.filter(function (gift) {
            return gift.id.toString() === $scope.operationsGiftId.toString();
          });
        }

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.promotion.title, AppConfig.messages.apiGenericError);
        console.error(error);
      });
    };

    $scope.listPromoGifts();
    $scope.getPromos();
    $scope.getOperationsPromos();

    $scope.operationsRedeemGift = function (giftId, clientId) {
      PopUp.confirm(
        AppConfig.messages.promotion.title,
        AppConfig.messages.promotion.confirmRedeem,
        function (confirmation) {
          if (confirmation) {
            $scope.operationsConfirmedRedeemGift(giftId, clientId);
          } else {
            PopUp.hide();
          }
        }
      );
    };

    $scope.operationsConfirmedRedeemGift = function (giftId, clientId) {
      PopUp.loading(AppConfig.messages.loading);

      Promo.redeemGift(
        $scope.operationsPromo,
        $scope.operationsClientId || clientId,
        giftId
      ).success(function () {
        PopUp.success(
          AppConfig.messages.promotion.title,
          AppConfig.messages.promotion.success,
          function () {
            // $scope.getPromos();
            // $route.reload();
            // dê reload apenas da lista
            $scope.operationsGifts = $scope.operationsGifts.filter(function (gift) {
              return gift.id.toString() !== giftId.toString();
            });
          }
        );
      }).error(function (error) {
        console.warn(error);
        PopUp.alert(
          AppConfig.messages.promotion.title,
          AppConfig.messages.apiGenericError
        );
      });
    };

    $scope.user = Session.get('user');
    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };

    $scope.selectedMall = $scope.malls[0].id;

    $scope.currentTab = 'new-promo';

    $scope.switchToTab = function (tabName) {
      // protects against event click recursion
      if ($scope.currentTab === tabName) {
        return;
      }

      if ($scope.isPromoSaved) {
        $scope.currentTab = tabName;
        $scope.performClearForm();
        return;
      }
      if (
        ($scope.currentTab === 'new-promo' &&
          tabName !== 'new-promo') &&
        (Object.keys($scope.promo).length > 4) &&
        !$scope.promoAlreadySaved
      ) {
        PopUp.confirm(
          AppConfig.messages.discardFormChanges.title,
          AppConfig.messages.discardFormChanges.subtitle,
          function (response) {
            if (response) {
              $scope.performClearForm();

              document.getElementById($scope.currentTab).checked = false;
              document.getElementById(tabName).checked = true;
              $scope.currentTab = tabName;

              PopUp.hide();

              // workaround to force things under Angular side
              document.getElementById(tabName).click();
            } else {
              // revert order to ensure things are unchanged
              document.getElementById(tabName).checked = false;
              document.getElementById($scope.currentTab).checked = true;

              PopUp.hide();

              // workaround to force things under Angular side
              document.getElementById($scope.currentTab).click();
            }
          }
        );
      } else {
        document.getElementById($scope.currentTab).checked = false;
        document.getElementById(tabName).checked = true;
        $scope.currentTab = tabName;

        PopUp.hide();

        // workaround to force things under Angular side
        const tab = document.getElementById(tabName);

        if (tab && tab.click) {
          tab.click();
        }
      }
      if (tabName === 'promo-report') {
        const mallIds = $scope.malls.map(mall => mall.id)
        Promo.getPromos(mallIds).success((promos) => {
          // TODO: ter um critério melhor p/ escolher a promoção padrão
          if (promos.length > 0) {
            const promo = promos[0]
            $scope.reportMall = promo.mallId
            $scope.refreshPromosList()
          }
        })
      }
    };

    $scope.switchToRegister = function (promo) {
      $scope.promoInEditionMode = true
      var subscribedStores = promo.subscribedStores.filter(function () {
        return true;
      });

      var labels = promo.labels.filter(function () {
        return true;
      });

      $scope.promo = Object.assign({}, promo);
      $scope.promo = Object.assign($scope.promo, {
        subscribedStores: subscribedStores,
        labels: labels,
      });

      $scope.promo.labels = $scope.promo.labels.map(function (label) {
        return label.label.id;
      });

      $scope.promo.sinceDate = moment($scope.promo.sinceDate).format("DD/MM/YYYY");
      $scope.promo.untilDate = moment($scope.promo.untilDate).format("DD/MM/YYYY");

      $scope.promo.subscribedStores = $scope.promo.subscribedStores.map(function (store) {
        return store.storeId;
      });

      $scope.switchToTab("new-promo");
    };

    $scope.performClearForm = function () {
      $scope.promo = {};
      $scope.promo.mallId = $scope.malls[0].id.toString();
      $scope.promo.clubExclusive = false;
      $scope.isPromoSaved = false;
      $scope.promo.raffleDetails = {};
      $scope.promo.giftDetails = {};
      $scope.promoInEditionMode = false
    }

    /* Validações de campo */
    $scope.nameError = false;
    $scope.validateName = function () {
      $scope.nameError = !$scope.promo.name;
    };

    $scope.sinceError = false;
    $scope.validateSince = function () {
      $scope.sinceError = !$scope.promo.sinceDate;
    };

    $scope.untilError = false;
    $scope.validateUntil = function () {
      $scope.untilError = !$scope.promo.untilDate;
    };

    /* Escopo inicial forçado para os gráficos */
    $scope.offset = "month";

    $scope.storeTags = [];
    $scope.stores = [];

    $scope.report = {
      totalSales: 0,
      totalAverageDailySales: 0,
    };

    $scope.showFunelDiv = false;
    $scope.loading = {
      dailySales: 0,
      individualSales: 0,
      funel: 0,
    };

    const successExit = ["$document", "$closeButton", "$escape"];

    $scope.formatDate = function (date) {
      return moment(date).format('DD/MM/YYYY');
    }

    $scope.loadStoreByMall = function (mallId) {
      if (!mallId) {
        return;
      }
      Campaign.getStoresByMall(mallId).success(function (stores) {
        $scope.stores = stores;
      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.apiGenericError);

        console.warn(error);
      });
    };

    $scope.fillStoreSelect = function () {
      $scope.loadStoreByMall($scope.promo.mallId);
    };

    $scope.fillStoreSelect();

    // TODO retirar funções de campanha abaixo
    // usado pela tela de relatórios
    $scope.refreshPromosList = function () {
      return Promo.getPromos([$scope.reportMall]).success(function (promos) {
        $scope.reportPromos = promos;
        if (promos.length > 0) {
          $scope.reportPromo = promos[0].id.toString();
          $scope.mallHasPromos = true
        }
        $scope.reportPromoData = promos[0];
      }).error(function(error) {
        console.warn(error);
      });
    }

    // callback que os modals de canais forçam um refresh ao excluir uma
    // de suas respectivas mensagens
    EventBus.subscribe('campaign-reload-campaign-list', function () {
      $scope.reloadCampaignsList();
    });

    /* Dialog with Color */
    $scope.openNgDialogColor = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'visitsByDay':
          graphic.title = "Atendimentos por Dia";
          graphic.graphicUrl = '../graph/bar-chart/bar-chart.html';
          graphic.loadDataFunction = getVisitsByDay;
          graphic.height = 600;
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', 'Promo', function ($scope, Promo) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphics = function () {
            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");
              element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.warn(error);
            });

          };

          setTimeout(function () {
            $scope.loadGraphics();
          }, 1000);

        }]
      });

    };

    /* Charts */

    function totalDailySales() {

      $scope.loading.individualSalesStore = 1;
      $scope.loading.funel = 1;
      $scope.showFunelDiv = false;

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Promo.getTotalDailySales($scope.reportPromo).success(function (_data) {

        $scope.loading.individualSalesStore = 0;
        $scope.loading.funel = 0;
        deferred.resolve(_data);

        $scope.showFunelDiv = true;

        PopUp.hide();
      });

      return deferred.promise;
    };

    function individualSalesPerStore() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Promo.getSalesPerStore($scope.reportPromo).success(function (_data) {
        _data = _data.map(function (node) {
          return {
            label: node.store_name,
            value: node.total_value.toString(),
          }
        });

        $scope.loading.individualSalesStore = 0;
        $scope.loading.funel = 0;
        deferred.resolve(_data);

        $scope.showFunelDiv = true;

        PopUp.hide();
      });

      return deferred.promise;
    };

    function promoPanorama() {
      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Promo.getCrossedChartsView($scope.reportPromo).success(function(_data) {
        const panoramaData = _data.map(function(node) {
          return {
            "date": moment(node.date).format("YYYY-MM-DD"),
            "value1": node.total_clients,
            "value2": node.average_value,
            "value3": node.total_txs
          }
        });
        deferred.resolve(panoramaData);

        PopUp.hide();

      }).error(function (error) {
        console.warn(error);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getPromotionPerformance() {
      $scope.loading.promotionPerformanceChart = true;

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Promo.getPromotionPerformance($scope.reportPromo).success(function (_data) {

        deferred.resolve(_data);
        _data.forEach((item, i) => {
          _data[i].behavior_date = moment(item.behavior_date).format("DD/MM");
          //console.log(moment(item.behavior_date).format("DD/MM"));
        });
        
        $scope.promoPerformanceData = _data;

        $scope.loading.promotionPerformanceChart = false;

        PopUp.hide();

      }).error(function (error) {
        console.warn(error);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    $scope.loadGraphics = function () {
      $scope.report = {};

      $scope.loadCards();

      totalDailySales().then(function (_data) {
        var element = document.getElementById("dailySales");
        const dailySalesData = _data.map(function (node) {
          return {
            letter: moment(node.date).format("DD/MM"),
            frequency: node.value
          }
        });

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.Campaign_barchart = JSON.stringify(dailySalesData);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/bar-chart/bar-chart.html?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"Campaign_barchart"}';
      }).catch(function (error) {
        console.warn(error);
      });

      individualSalesPerStore().then(function (_data) {
        var element = document.getElementById("individualSalesStore");
        const individualSalesData = _data

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.Campaign_pie = JSON.stringify(individualSalesData);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/pie-chart/pie-chart.html?params={"data":"Campaign_pie"}';
        //element.src = '../graph/bar-chart/bar-chart.html' + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.warn(error);
      });
      /*
      promoPanorama().then(function (_data) {
        var element = document.getElementById("crossedChartsView");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.Campaign_crossedCharts = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);
        element.src = '../graph/double-axis/double-axis.html?params={"data":"Campaign_crossedCharts"}';
      }).catch(function (error) {
        console.warn(error);
      });*/

      getPromotionPerformance().then( function(_data){
        $scope.promoPerformanceData = _data;
        
      }).catch( function(error){
        console.warn(error);
      });

    }

    $scope.openBannerPromo = function () {
      const promo = $scope.promo;

      ngDialog.open({
        template: 'partials/lightbox/banner-promo.html',
        controller: ['$scope', function ($scope) {
          $scope.image = promo.image || promo.imageUrl;
          $scope.disclaimer = promo.disclaimer || "";
          $scope.bannerWidth = 960;
          $scope.bannerHeight = 540;

          $scope.dismissBanner = function () {
            if ($scope.changed) {
              promo.image = $scope.image;
            }
            promo.disclaimer = $scope.disclaimer;
            promo.didUploadBanner = true;
            ngDialog.close();
          }

          $scope.file_changed = function (element) {
            $scope.ignore = true;
            $scope.loading = true;
            $scope.rendered = false;
            // $scope.banner.backgroundBuffer = null;

            function updateProgress(evt) {
              // evt is an ProgressEvent.
              if (evt.lengthComputable) {
                var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                // Increase the progress bar length.
                if (percentLoaded < 100) {
                  //progress.textContent = percentLoaded + '%';
                }
              }
            }

            var dataFile = element.files[0];
            var reader = new FileReader();
            reader.onprogress = updateProgress;
            reader.onload = function (e) {
              $scope.$apply(function () {
                $scope.imageinput = dataFile;

                $scope.image = reader.result;
                $scope.backgroundBuffer = reader.result;
                $scope.preview = reader.result;
                $scope.loading = false;
                $scope.changed = true;
                $scope.didUploadBanner = true;
              });
            };
            reader.readAsDataURL(dataFile);
          };

        }]
      });

    };

    $scope.openSelectStore = function () {
      const forbiddenActivities = {
        '78': true, // SERVIÇOS MÉDICOS
        '60': true, // FARMÁCIAS
        '58': true, // BEBIDAS ALCOOLICAS
        '56': true, // TABACARIA
        '48': true, // CLINICAS DE ESTETICA
        '71': true, // LOTERICA
        '74': true // SERVIÇOS POLICIAIS/SEGURANÇAS
      };
      const stores = $scope.stores.filter(function () {
        return true;
      });
      ngDialog.open({
        template: 'partials/lightbox/selectstore-promo.html',
        controller: ['$scope',
          function ($scopeChild) {


            $scopeChild.promoStores = stores.map(function (store) {
              store.allowed = !forbiddenActivities[store.mccActivityId.toString()];
              store.marked = !!store.marked; // POR PADRÃO TODA AS LOJAS ESTAO DESMARCADAS
              return store;
            });
            $scopeChild.allowedStores = $scopeChild.promoStores.filter(function (store) {
              return store.allowed;
            });
            $scopeChild.promoStoresLength = $scopeChild.allowedStores.length;
            $scopeChild.promoSelectedStores = [];
            $scopeChild.promoDeletedStores = [];

            $scopeChild.saveSelectedStores = function () {
              let chosenStores = $scopeChild.promoSelectedStores.filter(store => store.marked === true)
              $scope.promo.subscribedStores = chosenStores.map(function (store) {
                return store.id.toString()
              })
              ngDialog.close();
              $scope.didChooseStores = true;
              return $scope.promo.subscribedStores
            };

            $scopeChild.selectedAll = false;
            $scopeChild.toggleAllStores = function () {
              $scopeChild.selectedAll = !$scopeChild.selectedAll;
              for (let index = 0; index < $scopeChild.promoStores.length; index += 1) {
                if ($scopeChild.promoStores[index].allowed) {
                  $scopeChild.promoStores[index].marked = $scopeChild.selectedAll;
                }
              }

              // $scopeChild.updateSelections();
            };

            $scopeChild.updateSelections = function () {
              $scopeChild.promoSelectedStores = $scopeChild.promoStores.filter(function (store) {
                if (store.allowed === true) {
                  return store;
                }
              });

              $scopeChild.promoDeletedStores = $scopeChild.promoStores.filter(function (store) {
                if (store.allowed === false) {
                  return store;
                }
              });

              $scopeChild.selectedStores = $scopeChild.promoSelectedStores.filter(store => store.marked === true)
              
              if ($scopeChild.selectedStores.length === $scopeChild.promoSelectedStores.length) {
                $scopeChild.selectedAll = true;
              } else {
                $scopeChild.selectedAll = false;
              }

            };

            $scopeChild.currentTab = "ALL-STORES";

            $scopeChild.updateSelections();
          }
        ]
      });
    };

    $scope.openPromoWinner = function (clientId, raffleDetails) {
      const $parentScope = $scope;

      Client.getById(clientId).success(function (client) {
        ngDialog.open({
          template: 'partials/lightbox/winner.html',
          controller: ['$scope', function ($scope) {
            const namePieces = client.fullName.toUpperCase().split(' ');
            let clientSex = client.sex.toUpperCase();

            clientSex = clientSex === 'M' ? 'Masculino' : clientSex === 'F' ? 'Feminino' : 'Outros';

            const clientMall = client.clientMalls.filter(function (clientMall) {
              return clientMall.mallId.toString() === $parentScope.controlMall.toString();
            })[0];

            const clubAcceptance = clientMall && clientMall.clubAcceptance;
            const targeting = clientMall && clientMall.targeting && clientMall.targeting.name ?
              clientMall.targeting.name : 'Prospect';

            let birthday = null;

            if (client.birthday) {
              birthday = moment(client.birthday, 'YYYY-MM-DD');

              if (birthday.isValid()) {
                birthday = birthday.format('DD/MM/YYYY');
              } else {
                birthday = moment(client.birthday, 'DD/MM/YYYY');

                if (!birthday.isValid()) {
                  birthday = 'Não registrado';
                } else {
                  birthday = birthday.format('DD/MM/YYYY');
                }
              }
            } else {
              birthday = 'Não registrado';
            }

            const clientState = client.address ? client.address.state : '';
            const clientCep = client.address ? client.address.zipCode : '';
            const clientCity = client.address ? client.address.city : '';
            const clientStreet = client.address ? client.address.street : '';
            const clientDistrict = client.address ? client.address.neighborhood : '';

            $scope.data = {
              firstWinnerSequence: raffleDetails.firstWinnerSequence,
              winnerClientSequence: raffleDetails.winnerClientSequence,
              clientFirstName: namePieces[0],
              clientLastName: namePieces[namePieces.length - 1],
              clientName: client.fullName,
              clientEmail: client.email || 'Não registrado',
              clientCpf: $parentScope.prettyPrintCpf(client.cpf),
              clientPhone: client.mobileNumber,
              clientSex: clientSex,
              clientTargetingName: clubAcceptance ? targeting : 'Prospect',
              clientAcceptance: clubAcceptance ? 'Sim' : 'Não',
              clientBirthday: birthday,
              clientHomePhone: client.homePhone || 'Não registrado',
              clientComercialPhone: client.comercialPhone || 'Não registrado',
              clientState: clientState || 'Não registrado',
              clientCep: clientCep || 'Não registrado',
              clientCity: clientCity || 'Não registrado',
              clientStreet: clientStreet || 'Não registrado',
              clientDistrict: clientDistrict || 'Não informado',
            };
          }]
        });
      }).error(function (reason) {
        console.error(reason);
        PopUp.alert(
          AppConfig.messages.promotion.title,
          AppConfig.messages.apiGenericError
        );
      });

    };

    $scope.openPromoDraw = function (promotionId) {
      const $parentScope = $scope;

      ngDialog.open({
        template: 'partials/lightbox/promo-result.html',
        controller: ['$scope', function ($scope) {
          $scope.winnerSequences = [];
          $scope.publishFederalDraw = function () {
            Promo.publishFederalDraw(promotionId, $scope.winnerSequences).success(function (winnerTicket) {
              PopUp.success(
                AppConfig.messages.promotion.title,
                AppConfig.messages.promotion.success,
                function () {
                  // TODO: open client data
                  ngDialog.close();
                  $parentScope.openPromoWinner(winnerTicket.client.id);
                }
              );
            }).error(function (error) {
              console.error(error);
              PopUp.alert(
                AppConfig.messages.promotion.title,
                AppConfig.messages.promotion.failedPublishDraw
              );
            });
          };
        }]
      });
    };

    $scope.openPromoResult = function (promo) {
      if (promo.raffleDetails.winnerClientId) {
        $scope.openPromoWinner(promo.raffleDetails.winnerClientId, promo.raffleDetails);
      } else {
        $scope.openPromoDraw(promo.id);
      }
    };

    $scope.openPromoEditCpf = function () {
      const promo = $scope.promo;
      ngDialog.open({
        template: 'partials/lightbox/promo-edit-cpf.html',
        controller: ['$scope', function ($scope) {
          $scope.closeWindow = function () {
            console.log($scope.blacklist)
            promo.blacklist = $scope.blacklist
            console.log(promo)
            promo.didUploadBlacklist = true;
            ngDialog.close();
          }

          $scope.file_changed = function (files) {
            function updateProgress(evt) {
              // evt is an ProgressEvent.
              if (evt.lengthComputable) {
                var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                // Increase the progress bar length.
                if (percentLoaded < 100) {
                  //progress.textContent = percentLoaded + '%';
                }
              }
            }

            var dataFile = files[0];
            var reader = new FileReader();
            reader.onprogress = updateProgress;
            reader.onload = function (e) {
              $scope.$apply(function () {
                $scope.cpfBlacklist = dataFile;
                try {
                  $scope.blacklist = atob(reader.result.replace(/data:.*\/.*\;base64,/, ""))
                    .split(/\r?\n/g)
                    .filter(function (line, lineNumber) {
                      if (line.match(/([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})/)== null) 
                        {
                        $scope.cpfUploadLineNumberError = lineNumber + 1
                        throw  "CPF invalido"
                        }
                      return line !== "";
                    });
                  $scope.didUploadBlacklist = true;
                  $scope.uploadBlacklistError = false;

                } catch (error) {
                  $scope.uploadBlacklistError = true;
                }
              });
            };
            reader.readAsDataURL(dataFile);
          };
        }]
      });
    };

    $scope.openRule = function () {
      const promo = $scope.promo;

      ngDialog.open({
        template: 'partials/lightbox/promo-rule.html',
        controller: ['$scope', function ($scope) {

          $scope.closeRuleWindow = function () {
            promo.regulation = $scope.regulation;
            promo.didUploadRegulation = true;
            ngDialog.close();
          };

          $scope.file_changed = function (files) {
            function updateProgress(evt) {
              // evt is an ProgressEvent.
              if (evt.lengthComputable) {
                var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                // Increase the progress bar length.
                if (percentLoaded < 100) {
                  //progress.textContent = percentLoaded + '%';
                }
              }
            }

            var dataFile = files[0];
            var reader = new FileReader();
            reader.onprogress = updateProgress;
            reader.onload = function (e) {
              $scope.$apply(function () {
                $scope.regulationinput = dataFile;
                $scope.regulation = reader.result;
                $scope.didUploadRegulation = true;
              });
            };
            reader.readAsDataURL(dataFile);
          }
        }]
      });
    };

    $scope.openUploadedBlacklist = function (promo) {
      ngDialog.open({
        template: 'partials/lightbox/promo-show-cpfs.html',
        controller: ['$scope', function ($scope) {
          $scope.blacklist = promo.blacklist;
        }]
      })
    }

    $scope.openUploadedRegulation = function (promo) {
      ngDialog.open({
        template: 'partials/lightbox/promo-show-regulation.html',
        controller: ['$scope', function ($scope) {
          $scope.regulationUrl = promo.regulationUrl;
        }]
      })
    }

    /* Dialog */
    $scope.openNgDialog = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'individualSalesStore':
          graphic.title = "Venda individual por loja";
          graphic.graphicUrl = '../graph/pie-chart/pie-chart.html';
          graphic.loadDataFunction = individualSalesPerStore;
          graphic.height = 600;
          break;
        case 'crossedChartsView':
          graphic.title = 'Panorama da Promoção';
          graphic.graphicUrl = '../graph/double-axis/double-axis.html';
          graphic.loadDataFunction = promoPanorama;
          graphic.height = 600;
          graphic.prop1 = "Total de clientes";
          graphic.prop2 = "Ticket médio de transações";
          graphic.prop3 = "Total de transações";
          graphic.promoChart = true;
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/default-promo-chart.html',
        controller: ['$scope', 'Promo', function ($scope, Promo) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;
          $scope.prop1 = graphic.prop1;
          $scope.prop2 = graphic.prop2;
          $scope.prop3 = graphic.prop3;
          $scope.promoChart = graphic.promoChart;

          $scope.loadGraphic = function () {
            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");

              var graphic_data = JSON.parse(sessionStorage.graphic_data);
              graphic_data.Campaign_lightbox = JSON.stringify(_data);
              sessionStorage.graphic_data = JSON.stringify(graphic_data);

              element.src = graphic.graphicUrl + '?params={"data":"Campaign_lightbox"}';
              //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
              console.warn(error);
            });

          };

          setTimeout(function () {
            $scope.loadGraphic();
          }, 1000);

        }]
      });

    };

    $scope.openBarChart = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        loadSecondDataFunction: null,
        height: null
      };

      switch (graphicName) {
        case 'totalDailySales':
            graphic.title = "Venda Total Diária";
            graphic.graphicUrl = '../graph/bar-chart/bar-chart.html';
            graphic.loadDataFunction = totalDailySales;
            graphic.height = 300;
            graphic._cache = "Campaign_barchart";
            break;
      }

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', 'Campaign', function ($scope, Campaign) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphic = function () {
            if (!graphic_data[graphic._cache]) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                //var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data[graphic._cache] = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"' + graphic._cache + '"}';
                //element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
              }).catch(function (error) {
                console.warn(error);
              });
            } else {
              document.getElementById("graphic").src = graphic.graphicUrl + '?params={"data":"' + graphic._cache + '"}';
            }

          };

          setTimeout(function () {
            $scope.loadGraphic();
          }, 1000);

        }]
      });
    };

    /* Clustered Column Chart Modal */
    $scope.openClusteredColumnChart = function () {
      const $parentScope = $scope;
      
      const clusteredColumnDialog = ngDialog.open({
        template: 'partials/lightbox/clustered-columns-chart.html',
        controller: ['$scope', function ($scope) {
          $scope.promoPerformanceData = $parentScope.promoPerformanceData;

          //console.log($scope.promoPerformanceData)
        }]
      });
      clusteredColumnDialog.closePromise.then( function () {
          $scope.showFunelDiv = true;
      });
    };

    $timeout(function () {
      $scope.refreshPromosList()
        .then(() => {
          $scope.loadGraphics()
        })
    })
  }
]);
