'use strict';

/* global _app, moment */
/* eslint-env browser */

_app.controller('FlashController', [
  '$scope', '$route', 'ngDialog', '$q', '$location', 'PopUp', 'AppConfig',
  'Campaign', 'Channel', 'Session', 'DTOptionsBuilder', 'Permission', 'EventBus',
  '$templateCache',
  function (
    $scope, $route, ngDialog, $q, $location, PopUp, AppConfig,
    Campaign, Channel, Session, DTOptionsBuilder, Permission, EventBus,
    $templateCache
  ) {

    $templateCache.removeAll();
    $scope.menuPermissions = Permission.menuPermissions();

    /* Data table responsive */
    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('responsive', true);


      $scope.dtInstanceCallback = function (dtInstance) {
        var datatableObj = dtInstance;
        $scope.tableInstance = datatableObj;
      }
      $scope.searchTable = function () {
        var query = $scope.searchText;
        $scope.tableInstance.DataTable.search(query, false, false, true).draw();
      };

    /* Pegando dados de usuário e logout de sistema */
    $scope.user = Session.get('user');
    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };

    $scope.isFlashSaved = false;
    $scope.currentTab = 'new-flash';

    function parseChannels( campaignChannels ) {
      let channels = {};

      for ( let i=0; i < campaignChannels.length; i++ ) {
        switch ( campaignChannels[i].channelType ) {
          // PUSH
          case 1:
            channels.push = campaignChannels[i].channelId;
            break;
          // EMAIL
          case 2:
            channels.email = campaignChannels[i].channelId;
            break;
          // SMS
          case 3:
            channels.sms = campaignChannels[i].channelId;
            break;
          // BANNER
          case 4:
            channels.banner = campaignChannels[i].channelId;
            break;
        }

      }

      return channels;

    }

    $scope.switchToTab = function (tabName) {
      // protects against event click recursion
      if ($scope.currentTab === tabName) {
        return;
      }
      if ($scope.isFlashSaved) {
        $scope.currentTab = tabName;
        $scope.performClearForm();
        return;
      }
      $scope.channels.email = null;

      if (
        ($scope.currentTab === 'new-flash' &&
        tabName !== 'new-flash') &&
        $scope.flash.mallId !== '-1' &&
        (Object.keys($scope.flash).length > 2 ||
        Object.keys($scope.channels).length > 1)
      ) {
        PopUp.confirm(
          AppConfig.messages.discardFormChanges.title,
          AppConfig.messages.discardFormChanges.subtitle,
          function (response) {
            if (response) {
              $scope.performClearForm();
              PopUp.hide();

              document.getElementById($scope.currentTab).checked = false;
              document.getElementById(tabName).checked = true;
              $scope.currentTab = tabName;

              // workaround to force things under Angular side
              document.getElementById(tabName).click();
              if (tabName === 'flash') {
                setTimeout($scope.selectMallReport, 100);
              }
            } else {
              // revert order to ensure things are unchanged
              document.getElementById(tabName).checked = false;
              document.getElementById($scope.currentTab).checked = true;

              // PopUp.hide();

              // workaround to force things under Angular side
              document.getElementById($scope.currentTab).click();
            }
          }
        );
      } else {
        document.getElementById($scope.currentTab).checked = false;
        document.getElementById(tabName).checked = true;
        $scope.currentTab = tabName;

        // PopUp.hide();
        // comentado para o popup de loading não desaparecer antes de carregar a lista de todos os flashes

        // workaround to force things under Angular side
        const tab = document.getElementById(tabName);
        if (tab && tab.click) { tab.click(); }

        if (tabName === 'flash') {
          $scope.selectMallReport();
        }
        setTimeout(function() {
          $('.dataTables_filter input').attr('placeholder', 'Pesquisar por Flash');
        }, 500);
      }
    };

    $scope.performClearForm = function () {
      $scope.flash = {};
      $scope.flash.bannerType = 1;
      $scope.flash.clubExclusive = false;
      $scope.flash.mallId = '-1';
      $scope.channels = {};
      $scope.isFlashSaved = false;
    };

    /* Validações de campo */
    $scope.startError = false;
    $scope.validateStart = function () {
      $scope.startError = !$scope.flash.startDate;
    };

    $scope.endError = false;
    $scope.validateEnd = function () {
      $scope.endError = !$scope.flash.endDate;
    };

    /* Limpeza das sessões dos gráficos */
    sessionStorage.graphic_data = JSON.stringify({});

    $scope.malls = Session.get('malls');
    $scope.reportMall = '-1';
    $scope.stores = [];
    $scope.flash = {};
    $scope.flash.mallId = $scope.malls[0].id;
    $scope.flash.clubExclusive = false;

    $scope.selectedMallRep = $scope.malls[0];

    let createdFlash = null;

    $scope.loading = {
      dailySales: 0,
    };

    $scope.channels = {};

    // Retornos do ngDialog
    // value: "$document" -> clicou fora
    // value: "$closeButton" -> clicou no botão de fechar
    // value: "$escape" -> clicou no esc
    const successExit = [ "$document", "$closeButton", "$escape" ];

    $scope.reportSelectedFlash = {};

    $scope.formatDate = function ( date ) {
      return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
    };

    $scope.bannerSectionTypes = [];

    Channel.listSectionTypes().success(function (result) {
      $scope.bannerSectionTypes = result;
    }).error(function () {
      PopUp.alert(AppConfig.messages.flash.title,
        AppConfig.messages.apiGenericError, function () {
          $route.reload();
        });
    });


    $scope.loadStoreByMall = function (mallId) {
      Campaign.getStoresByMall(mallId).success(function (stores) {

        $scope.stores = stores;

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.flash.title,
          AppConfig.messages.apiGenericError);

        console.warn(error);
      });
    };
    //$scope.loadStoreByMall($scope.malls[0].id);

    $scope.fillStoreSelect = function() {
      $scope.loadStoreByMall($scope.flash.mallId);
    };

    $scope.selectedMall = $scope.malls[0];
    $scope.flashList = [];

    // callback que os modals de canais forçam um refresh ao excluir uma
    // de suas respectivas mensagens
    EventBus.subscribe('flash-reload-flash-list', function () {
      $scope.getAllFlashs();
    });

    $scope.getAllFlashs = function () {
      PopUp.loading("Atualizando Dados!");
      $scope.flashList = [];

      Campaign.getByMall([$scope.selectedMall], "flash").success(function (flashs) {
        for (var i = 0; i < flashs.length; i++) {
          $scope.flashList[i] = flashs[i];

          //var channels = JSON.parse( flashs[i].campaignChannels );
          var channels = parseChannels( flashs[i].campaignChannels);

          $scope.flashList[i].published = flashs[i].published;
          $scope.flashList[i].clubExclusive = flashs[i].clubExclusive;
          $scope.flashList[i].hasSms = channels.sms;
          $scope.flashList[i].hasEmail = channels.email;
          $scope.flashList[i].hasPush = channels.push;
          $scope.flashList[i].hasBanner = channels.banner;
        }

        PopUp.hide();

      }).error(function (error) {
        PopUp.hide();
        console.warn(error);
      });
    };

    $scope.selectMallReport = function () {
      $scope.selectedMall = JSON.parse( JSON.stringify( $scope.selectedMallRep) );
      $scope.getAllFlashs();
    };

/*
    $scope.storesToSearch = [];
    function loadStoreSearch(offset) {

      Campaign.getStoresByMall($scope.malls[offset].id).success(function (stores) {

        for (var i = 0; i < stores.length; i++) {
          $scope.storesToSearch.push({ id: stores[i].id, name: stores[i].name + " - " + stores[i].mall.name });
        }

        if (offset + 1 < $scope.malls.length)
          loadStoreSearch(offset + 1);

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.campaign.error);

        console.warn(error);
      });
    }
    loadStoreSearch(0);
*/

    $scope.allFlashs = [];
    $scope.storesWithFlashs = [];
    var flashPeriods = {};

    function loadStoreWithFlashs(mallsFilter) {
      mallsFilter = mallsFilter || $scope.malls;

      Campaign.getByMall(mallsFilter, "flash").success(function(flashs) {

        var filteredStores = {};
        flashPeriods = {};
        for (var i=0; i < flashs.length; i++) {
          $scope.allFlashs.push( flashs[i] );

          if ( flashs[i].stores[0] && flashs[i].published ) {
            filteredStores[ flashs[i].stores[0].id.toString() ] = flashs[i].stores[0].name + " - " + flashs[i].mall.name;
            if ( ! flashPeriods[ flashs[i].stores[0].id.toString() ] )
              flashPeriods[ flashs[i].stores[0].id.toString() ] = [];
            flashPeriods[ flashs[i].stores[0].id.toString() ].push({
              id: flashs[i].id,
              period: moment(flashs[i].startDate, 'YYYY-MM-DD').format("DD/MM/YYYY")+" - "+moment(flashs[i].endDate, 'YYYY-MM-DD').format("DD/MM/YYYY")
            });
          }
        }

        $scope.storesWithFlashs = [];
        for ( var key in filteredStores) {
          $scope.storesWithFlashs.push( { id: key, name: filteredStores[key] } );
        }

      }).error(function(error) {
        PopUp.alert(AppConfig.messages.flash.title,
          AppConfig.messages.flash.error);

        console.warn(error);
      });
    }
    loadStoreWithFlashs();

    $scope.loadStoreWithFlashs = loadStoreWithFlashs;

    $scope.resetSearchStore = function () {
      $scope.storeSearchId = '-1';
      $scope.reportSelectedFlashId = '-1';
      $scope.loadStoreWithFlashs([{ id: $scope.reportMall }]);
    };

    $scope.unselectedFields = function () {
      return $scope.reportMall == '-1'
      || $scope.storeSearchId == '-1'
      || $scope.reportSelectedFlashId == '-1';
    };

    $scope.reportSelectStore = function () {
      $scope.reportSelectedFlashId = '-1';
      $scope.period = flashPeriods[ $scope.storeSearchId.toString() ];
    };

    $scope.reportSearchFlash = function() {

      Campaign.get($scope.reportSelectedFlashId).success(function(flash) {

        $scope.reportSelectedFlash = flash;

        $scope.loadGraphics();

      }).error(function(error) {
        PopUp.alert(AppConfig.messages.flash.title,
          AppConfig.messages.flash.error);

        console.warn(error);
      });
    };

    /*
    campaign (
      id SERIAL NOT NULL PRIMARY KEY,
      name VARCHAR(30) NOT NULL,
      mall_id INTEGER NOT NULL,
      type VARCHAR(15) NOT NULL,
      mautic_campaign_id INTEGER,
      tags VARCHAR(100),
      create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      club_exclusive BOOLEAN NOT NULL DEFAULT false,
      published BOOLEAN DEFAULT false,
    );
    */
    $scope.newFlash = function ( cb_publish ) {
      PopUp.loading(AppConfig.messages.flash.creating);

      var flash = JSON.parse(JSON.stringify($scope.flash));

      flash.type = "flash";
      flash.stores = flash.store;

      flash.name = "Flash";
      for (var i = 0; i < $scope.stores.length; i++) {
        if ($scope.stores[i].id == flash.store) {
          flash.name = "Flash " + $scope.stores[i].name;
          break;
        }
      }

      flash.channels = $scope.channels;

      flash.startDate = moment($scope.flash.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      flash.endDate = moment($scope.flash.endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');


      if ( $scope.flash.id ) {

        Campaign.update($scope.flash.id, flash).success(function (updatedFlash) {

          createdFlash = updatedFlash;


          loadStoreWithFlashs();
          $scope.getAllFlashs();
          if ( typeof cb_publish == 'undefined' ) {

            $scope.getAllFlashs();
            $scope.isFlashSaved = true;

            PopUp.success(AppConfig.messages.flash.title,
              AppConfig.messages.flash.success);

          } else {
            if ( cb_publish ){
              cb_publish(createdFlash.id);
            }
          }

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      } else {

        Campaign.create(flash).success(function (fetchedFlash) {

          createdFlash = fetchedFlash;

          loadStoreWithFlashs();

          if ( !cb_publish ) {

            PopUp.success(AppConfig.messages.flash.title,
              AppConfig.messages.flash.success, function () {
                $scope.isFlashSaved = true;
                $scope.getAllFlashs();
                //$route.reload();
              });

          } else {
            if ( cb_publish ){
              cb_publish(createdFlash.id);
            }
          }

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      }

    };

    $scope.deleteFlash = function ( ) {

      PopUp.loading(AppConfig.messages.flash.deleting);

      if ( ! $scope.flash.id ) {
        $scope.flash = {};
      }

      function finishDeleteFlash() {
        Campaign.delete( $scope.flash.id ).success(function () {

          $scope.flash = {};

          loadStoreWithFlashs();

          PopUp.success(AppConfig.messages.flash.title,
            AppConfig.messages.flash.success, function () {
              $scope.isFlashSaved = true;
              $route.reload();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      }

      var promessas = 0;

      if ($scope.channels.push) {
        promessas++;
        Channel.deletePush($scope.flash.id, $scope.channels.push).success(function () {

          $scope.channels.push = 0;
          $scope.channels.push = null;
          $scope.channels.push = undefined;

          promessas--;
          if ( promessas == 0 ) {
            finishDeleteFlash();
          }

          PopUp.success(AppConfig.messages.flash.title,
            AppConfig.messages.flash.success, function () {
              ngDialog.close();
              //$route.reload();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      }


      if ($scope.channels.sms) {
        promessas++;
        Channel.deleteSms($scope.flash.id, $scope.channels.sms).success(function () {

          $scope.channels.sms = 0;
          $scope.channels.sms = null;
          $scope.channels.sms = undefined;

          promessas--;
          if ( promessas == 0 ) {
            finishDeleteFlash();
          }

          PopUp.success(AppConfig.messages.flash.title,
            AppConfig.messages.flash.success, function () {
              ngDialog.close();
              //$route.reload();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      }

      if ($scope.channels.email) {
        promessas++;
        Channel.deleteEmail($scope.flash.id, $scope.channels.email).success(function () {

          $scope.channels.email = 0;
          $scope.channels.email = null;
          $scope.channels.email = undefined;

          promessas--;
          if ( promessas == 0 ) {
            finishDeleteFlash();
          }

          PopUp.success(AppConfig.messages.flash.title,
            AppConfig.messages.flash.success, function () {
              ngDialog.close();
              //$route.reload();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      }

      if ($scope.channels.banner) {
        promessas++;
        Channel.deleteBanner($scope.flash.id, $scope.channels.banner).success(function () {

          $scope.channels.banner = 0;
          $scope.channels.banner = null;
          $scope.channels.banner = undefined;

          promessas--;
          if ( promessas == 0 ) {
            finishDeleteFlash();
          }

          PopUp.success(AppConfig.messages.flash.title,
            AppConfig.messages.flash.success, function () {
              ngDialog.close();
              //$route.reload();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.flash.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      }

      if ( promessas == 0 ) {
        finishDeleteFlash();
      }

    };

    $scope.publishFlash = function (flashId) {

      if ( !flashId ) {
        if ( createdFlash ) {
          flashId = createdFlash.id;
        } else {
          $scope.newFlash( $scope.publishFlash );
          return;
        }
      }

      PopUp.loading(AppConfig.messages.flash.publishing);

      flashId = flashId || $scope.flash.id;

      Campaign.publish(flashId).success(function () {

        PopUp.success(AppConfig.messages.flash.title,
          AppConfig.messages.flash.success, function () {
            $route.reload();
          });

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.flash.title, AppConfig.messages.apiGenericError);
        console.warn(error);
      });

    };

    $scope.editFlash = function( flashId ) {

      PopUp.loading("Abrindo Flash ...");
      var promessas = 0;

      Campaign.get(flashId).success(function (flash) {

        flash.clubExclusive = !(
          flash.clubExclusive === 'false' ||
          flash.clubExclusive === 'null' ||
          flash.clubExclusive === 'undefined' ||
          flash.clubExclusive === '' ||
          flash.clubExclusive === false ||
          flash.clubExclusive === null ||
          flash.clubExclusive === undefined
        );

        // redundant garbage
        // flash.clubExclusive = flash.clubExclusive;

        // deep copy of
        $scope.flash = JSON.parse( JSON.stringify(flash));

        $scope.flash.startDate = moment(flash.startDate, 'YYYY-MM-DD').format("DD/MM/YYYY");
        $scope.flash.endDate = moment(flash.endDate, 'YYYY-MM-DD').format("DD/MM/YYYY");

        /*
        document.getElementById('new-flash-input-start-date').value = $scope.flash.startDate;
        document.getElementById('new-flash-input-end-date').value = $scope.flash.endDate;
        */

        $scope.flash.mallId = flash.mallId.toString();

        $scope.fillStoreSelect();

        $scope.flash.store = flash.stores.map(function (store) {
          return store.id;
        });
        //$scope.flash.store = ( flash.stores[0] ) ? [ flash.stores[0].id ] : null;

        $scope.flash.clubExclusive = flash.clubExclusive;

        // TODO: pegar isso do objeto banner, pois é inconsistente definir um
        // padrão aqui quando já temos estes dados dentro do banner
        $scope.flash.bannerType = $scope.flash.bannerType || 1;

        $scope.channels = parseChannels( flash.campaignChannels );

        PopUp.hide();
        setTimeout(function () {
          document.getElementById('new-flash').click();
        }, 500);


      }).error(function(error) {
        PopUp.alert(AppConfig.messages.flash.title,
          AppConfig.messages.flash.error);

        console.warn(error);
      });

    };


    $scope.reportShowChannel = function( c, _id, edit, _campaignId ) {
      if ( c == "push" ) {

        $scope.openPush( _id, edit, _campaignId );

      } else if ( c == "sms"  ) {

        $scope.openSMS( _id, edit, _campaignId );

      } else if ( c == "email"  ) {

        $scope.openEmail( _id, edit, _campaignId );

      } else if ( c == "banner"  ) {
        $scope.openBanner( _id, edit, _campaignId );

      }

    };

    /* Open Dialogs */
    $scope.openPush = function ( _pushId, edit, _campaignId ) {

      $scope.dialogParams = {};

      if ( $scope.channels.push ) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.pushId = $scope.channels.push;
        $scope.dialogParams.push = {
          campaignId: _campaignId
        }
      } else if ( _pushId ) {
        if ( edit ) {
          $scope.dialogParams.mode = 'EDIT';
          $scope.dialogParams.push = {
            campaignId: _campaignId
          }
        } else {
          $scope.dialogParams.mode = 'SHOW';
        }
        $scope.dialogParams.pushId = _pushId;
      } else {
        $scope.dialogParams.mode = 'CREATE';
      }

      var dialog = ngDialog.open({
          template: 'partials/lightbox/push.html',
          controller: 'PushController',
          scope: $scope,
      });

      dialog.closePromise.then(function (data) {
        if ( data && data.value ) {
          if ( data.value.pushId ){
            $scope.channels.push = data.value.pushId;
          } else if ( data.value.pushId == null  &&  successExit.indexOf(data.value) < 0) { // Apagou o Push
            delete $scope.channels.push;
          }
        }

      });

    };

    $scope.openSMS = function ( _smsId, edit, _campaignId ) {

      $scope.dialogParams = {};

      if ( $scope.channels.sms ) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.smsId = $scope.channels.sms;
        $scope.dialogParams.sms = {
          campaignId: _campaignId
        }
      } else if ( _smsId ) {
        if ( edit ) {
          $scope.dialogParams.mode = 'EDIT';
          $scope.dialogParams.sms = {
            campaignId: _campaignId
          }
        } else {
          $scope.dialogParams.mode = 'SHOW';
        }
        $scope.dialogParams.smsId = _smsId;
      } else {
        $scope.dialogParams.mode = 'CREATE';
      }

      var dialog = ngDialog.open({
          template: 'partials/lightbox/sms.html',
          controller: 'SmsController',
          scope: $scope,
      });

      dialog.closePromise.then(function (data) {

        if ( data && data.value ) {
          if ( data.value.smsId ){
            $scope.channels.sms = data.value.smsId;
          } else if ( data.value.smsId == null   &&  successExit.indexOf(data.value) < 0) { // Apagou o SMS
            delete $scope.channels.sms;
          }
        }

      });

    };

    $scope.openEmail = function ( _emailId, edit, _campaignId ) {
      console.log(_emailId);

      $scope.dialogParams = {};

      if ( _emailId ) {
        if ( edit ) {
          $scope.dialogParams.mode = 'EDIT';
          $scope.dialogParams.email = {
            campaignId: _campaignId
          }
        } else {
          $scope.dialogParams.mode = 'SHOW';
        }
        $scope.dialogParams.emailId = _emailId;

      } else if ( $scope.channels.email ) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.emailId = $scope.channels.email;

        $scope.dialogParams.email = {
          campaignId: _campaignId
        }
      } else {
        $scope.dialogParams.mode = 'CREATE';
      }

      var dialog = ngDialog.open({
          template: 'partials/lightbox/email-builder-ext.html',
          controller: 'EmailBuilderExtController',
          scope: $scope,
          cache: false,
          className: 'ngdialog-theme-default dialog-for-email'
      });

      dialog.closePromise.then(function (data) {
        if ( data && data.value ) {
          if ( data.value.emailId ){
            $scope.channels.email = data.value.emailId;
          } else if ( data.value.emailId == null   &&  successExit.indexOf(data.value) < 0) { // Apagou o Email
            delete $scope.channels.email;
            $scope.channels.email = null;
          }
        }
      });
    };

    $scope.openBanner = function ( _bannerId, edit, _campaignId ) {

      $scope.dialogParams = {};
      if (_bannerId) {
        if (edit) {
          $scope.dialogParams.mode = 'EDIT';
          $scope.dialogParams.banner = {
            type: "flash",
            campaignId: _campaignId,
          };
        } else {
          $scope.dialogParams.mode = 'SHOW';
          $scope.dialogParams.banner = {
            type: "flash",
            campaignId: _campaignId,
          };
        }
        $scope.dialogParams.bannerId = _bannerId;
      }
      else if ($scope.channels.banner) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.bannerId = $scope.channels.banner;
        $scope.dialogParams.banner = {
          type: "flash",
          campaignId: _campaignId,
        };
      } else {

        var bannerStore = "";
        for (var i = 0; i < $scope.stores.length; i++) {
          if ($scope.stores[i].id == $scope.flash.store) {
            bannerStore = $scope.stores[i].name;
            break;
          }
        }

        $scope.dialogParams.banner = {
          type: "flash",
          store: bannerStore,
          isExclusive: $scope.flash.clubExclusive || false,
          bannerType: $scope.flash.bannerType,
          startDate: $scope.flash.startDate,
          endDate: $scope.flash.endDate,
        };

        $scope.dialogParams.mode = 'CREATE';
      }

      var dialog = null;

      if ($scope.dialogParams.mode === 'SHOW') {
        dialog = ngDialog.open({
          template: 'partials/lightbox/banner-campanha.html',
          controller: 'BannerController',
          scope: $scope,
          cache: false,
        });
      } else {
        dialog = ngDialog.open({
          template: 'partials/lightbox/banner-app.html',
          controller: 'BannerController',
          scope: $scope,
          cache: false,
        });
      }

      dialog.closePromise.then(function (data) {

        if ( data && data.value ) {
          if ( data.value.bannerId ){
            $scope.channels.banner = data.value.bannerId;
          } else if ( data.value.bannerId == null   &&  successExit.indexOf(data.value) < 0 ) { // Apagou o Banner
            delete $scope.channels.banner;
          }
        }

      });

    };


    /* Charts */
    function getDailySales() {

      $scope.loading.dailySales = 1;

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getDailySales($scope.reportSelectedFlash.id).success(function (_data) {

        deferred.resolve(_data);
        $scope.loading.dailySales = 0;

        $scope.showFunelDiv = true;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getEmailFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getEmailFunnel($scope.reportSelectedFlash.id).success(function (_data) {

        deferred.resolve(_data);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(JSON.stringify(error));
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getSmsFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getSmsFunnel($scope.reportSelectedFlash.id).success(function (_data) {

        deferred.resolve(_data);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(JSON.stringify(error));
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getPushFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getPushFunnel($scope.reportSelectedFlash.id).success(function (_data) {

        deferred.resolve(_data);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(JSON.stringify(error));
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getCampaignFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getCampaignFunnel($scope.reportSelectedFlash.id).success(function (_data) {

        deferred.resolve(_data);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(JSON.stringify(error));
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function loadBanner() {
      var deferred = $q.defer();
      var channels = parseChannels($scope.reportSelectedFlash.campaignChannels);

      if (channels.banner) {
        var bannerId = channels.banner;
      } else {
        console.log("Flash não tem Banner!");
        deferred.resolve({});
        return deferred.promise;
      }


      Channel.getBanner(bannerId).success(function (_banner) {
        deferred.resolve(_banner);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    $scope.loadGraphics = function () {
      var graphic_data = {};

      if ( !graphic_data.Flash_barchart ) {
        getDailySales().then(function (_data) {
          var element = document.getElementById("dailySales");

          var graphic_data = JSON.parse(sessionStorage.graphic_data);
          graphic_data.Flash_barchart = JSON.stringify(_data);
          sessionStorage.graphic_data = JSON.stringify(graphic_data);

          element.src = '../graph/bar-chart/bar-chart.html?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"Flash_barchart"}';
        }).catch(function (error) {
          console.warn(error);
        });
      } else {
        document.getElementById("dailySales").src = '../graph/bubble-chart/bubble-chart.html?params={"data":"Flash_barchart"}';
      }

      loadBanner();

      getEmailFunnel().then(function (_data) {
        $scope.emailFunnelData = _data.graphics;
      }).catch(function (error) {
        console.warn(error);
      });

      getSmsFunnel().then(function (_data) {
        $scope.smsFunnelData = _data.graphics;
      }).catch(function (error) {
        console.warn(error);
      });

      getPushFunnel().then(function (_data) {
        $scope.pushFunnelData = _data.graphics;
      }).catch(function (error) {
        console.warn(error);
      });

      getCampaignFunnel().then(function (_data) {
        $scope.campaignFunnelData = _data.graphics;
      }).catch(function (error) {
        console.warn(error);
      });

    };

    /* Funnel Chart Modal */
    $scope.openFunnelChart = function () {
      const $parentScope = $scope;
      ngDialog.open({
        template: 'partials/lightbox/channel-campaign.html',
        controller: ['$scope', function ($scope) {

          $scope.emailFunnelData = $parentScope.emailFunnelData;
          $scope.smsFunnelData = $parentScope.smsFunnelData;
          $scope.pushFunnelData = $parentScope.pushFunnelData;
          $scope.campaignFunnelData = $parentScope.campaignFunnelData;

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
      case 'dailySales':
        graphic.title = "Relatório Geral";
        graphic.graphicUrl = '../graph/bar-chart/bar-chart.html';
        graphic.loadDataFunction = getDailySales;
        graphic.height = 300;
        graphic._cache = "Flash_barchart";
        break;
      default:
        alert("No suitable graphic found!");
      }

      var graphic_data = JSON.parse(sessionStorage.graphic_data);

      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', 'Campaign', function ($scope, Campaign) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphic = function () {
            if ( !graphic_data[ graphic._cache ] ) {
              $scope.loadDataFunction().then(function (_data) {
                var element = document.getElementById("graphic");

                graphic_data[ graphic._cache ] = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"'+ graphic._cache +'"}';
              }).catch(function (error) {
                console.warn(error);
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

  }]);
