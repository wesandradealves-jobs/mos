'use strict';

/* global _app, moment */

_app.controller('CampaignController', [
  '$scope', '$route', '$q', 'ngDialog', 'PopUp', 'AppConfig', 'Campaign',
  'Channel', 'Session', '$location', 'DTOptionsBuilder', 'Permission',
  'EventBus', '$templateCache',
  function (
    $scope, $route, $q, ngDialog, PopUp, AppConfig, Campaign,
    Channel, Session, $location, DTOptionsBuilder, Permission, EventBus,
    $templateCache
  ) {

    $scope.chartId = 0;
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
    $scope.malls = Session.get('malls');

    $scope.user = Session.get('user');
    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };

    $scope.isCampaignSaved = false;
    $scope.currentTab = 'new-campaign';

    $scope.announcementWarning = function () {
      let selectedTagsAmount = $scope.campaign.tags.length;

      for (let i = 0; i < selectedTagsAmount; i++) {
        if ($scope.campaign.tags[i] === 'Comunicados e Avisos') {
          PopUp.confirm("Atenção!",
            "Ao selecionar essa tag, a campanha será enviada para todos os clientes. Tem certeza de que quer fazer esse tipo de divulgação?",
            function (resp) {
              if (!resp) {
                $scope.campaign.tags = $scope.campaign.tags.filter(item => item !== 'Comunicados e Avisos');
              }
              PopUp.hide();
            }, "Remova a tag", "Quero continuar");
          return;
        }
      }
    };

    $scope.excludeCampaign = function () {
      PopUp.loading(AppConfig.messages.campaign.deleting);

      Campaign.delete($scope.campaign.id).success(function () {
        PopUp.success(
          AppConfig.messages.campaign.title,
          AppConfig.messages.campaign.deleted,
          function () {
            $route.reload();
          }
        );
      }).error(function (error) {
        console.error(error);
        PopUp.alert(
          AppConfig.messages.campaign.title,
          AppConfig.messages.apiGenericError
        );
      })
    };

    function parseChannels(campaignChannels) {
      let channels = {};

      for (let i = 0; i < campaignChannels.length; i++) {
        switch (campaignChannels[i].channelType) {
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

      if ($scope.isCampaignSaved) {
        $scope.currentTab = tabName;
        $scope.performClearForm();
        return;
      }
      $scope.channels.email = null;

      if (
        ($scope.currentTab === 'new-campaign' &&
          tabName !== 'new-campaign') &&
        (Object.keys($scope.campaign).length > 2 ||
          Object.keys($scope.channels).length > 1)
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

              if (tabName === 'campaign') {
                $scope.reloadCampaignsList();
              }
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
          //Paulo -- Gerava erro na console
          //tab.click();
        }

        if (tabName === 'campaign') {
          $scope.reloadCampaignsList();
        }
      }
    };

    $scope.performClearForm = function () {
      $scope.channels = {};
      $scope.campaign = {};
      $scope.campaign.mallId = '-1';
      $scope.campaign.clubExclusive = false;
      $scope.isCampaignSaved = false;
    }

    /* Validações de campo */
    $scope.nameError = false;
    $scope.validateName = function () {
      $scope.nameError = !$scope.campaign.name;
    };

    $scope.startError = false;
    $scope.validateStart = function () {
      $scope.startError = !$scope.campaign.startDate;
    };

    $scope.endError = false;
    $scope.validateEnd = function () {
      $scope.endError = !$scope.campaign.endDate;
    };

    /* Escopo inicial forçado para os gráficos */
    $scope.offset = "month";

    $scope.storeTags = [];
    $scope.stores = [];

    $scope.report = {
      totalSales: 0,
      totalAverageDailySales: 0,
      averageTicketByClient: 0,
      totalTransactions: 0,
      totalClients: 0
    };

    $scope.showFunelDiv = false;
    $scope.loading = {
      dailySales: 0,
      individualSales: 0,
      funel: 0,
    };

    $scope.campaign = {};
    $scope.campaign.clubExclusive = false;
    let createdCampaign = null;

    $scope.reportSelectedCampaign = {};

    $scope.channels = {};

    // ===== unused variables =====
    // let push = {};
    // let sms = {};
    // let email = {};
    // let banner = {};

    // Retornos do ngDialog
    // value: "$document" -> clicou fora
    // value: "$closeButton" -> clicou no botão de fechar
    // value: "$escape" -> clicou no esc
    const successExit = ["$document", "$closeButton", "$escape"];

    $scope.formatDate = function (date) {
      return moment(date).format('DD/MM/YYYY');
    }

    $scope.loadStoreByMall = function (mallId) {
      Campaign.getStoresByMall(mallId).success(function (stores) {

        $scope.stores = stores;

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.apiGenericError);

        console.warn(error);
      });
    };

    $scope.fillStoreSelect = function () {
      $scope.loadStoreByMall($scope.campaign.mallId);
    };

    $scope.selectCampaign = function () {

      /*Paulo - Carregar os gráficos somente apos a consulta
      getEmailFunnel();
      getSmsFunnel();
      getPushFunnel();
      getCampaignFunnel();
      */

      Campaign.get($scope.selectedCampaignId, "campaign").success(function (campaign) {
        $scope.reportSelectedCampaign = campaign;

        $scope.campaignId = campaign.id;

        $scope.showFunelDiv = true;

        $scope.loadGraphics();
        getEmailFunnel();
        getSmsFunnel();
        getPushFunnel();
        getCampaignFunnel();
      }).error(function (error) {
        console.error(error); // TODO: tratar mensagem de erro
      });
    };

    $scope.reportMall = '-1';
    $scope.campaignsList = [];
    $scope.publishedCampaignsList = [];
    $scope.selectedCampaignId = '-1';

    // usado pela tela de relatórios
    $scope.refreshCampaignsList = function () {
      $scope.selectedCampaignId = '-1';
      $scope.publishedCampaignsList = [];
      $scope.getAllCampaigns([{
        id: $scope.reportMall
      }]);
    };

    // usado pela tela de controle
    $scope.reloadCampaignsList = function () {
      if ($scope.controlMall !== '-1') {
        $scope.getAllCampaigns([{
          id: $scope.controlMall
        }]);
      }
    };

    // callback que os modals de canais forçam um refresh ao excluir uma
    // de suas respectivas mensagens
    EventBus.subscribe('campaign-reload-campaign-list', function () {
      $scope.reloadCampaignsList();
    });

    $scope.getAllCampaigns = function (mall) {
      $scope.campaignsList = [];
      PopUp.loading("Atualizando Dados!");

      Campaign.getByMall(mall, "campaign").success(function (campaigns) {

        if (campaigns.length == 0) {
          $scope.campaignsList = [];
          PopUp.hide();
          return;
        }

        var lastPublishedId = campaigns[0].id;

        for (var i = 0; i < campaigns.length; i++) {

          var channels = {};
          if (campaigns[i].campaignChannels)
            channels = parseChannels(campaigns[i].campaignChannels);

          $scope.campaignsList[i] = campaigns[i];

          const startDate = moment(campaigns[i].startDate).format('YYYY-MM-DD');
          const endDate = moment(campaigns[i].endDate).format('YYYY-MM-DD');
          campaigns[i].period = `de ${startDate} até ${endDate}`;

          if (campaigns[i].published) {
            $scope.publishedCampaignsList.push(campaigns[i]);
            lastPublishedId = campaigns[i].id;
          }

          if (campaigns[i].tags) {
            $scope.campaignsList[i].tags = campaigns[i].tags.split("@").join(", ");
          } else {
            // $scope.campaignsList[i].tags = [];
            $scope.campaignsList[i].tags = null;
          }
          $scope.campaignsList[i].published = campaigns[i].published;
          $scope.campaignsList[i].clubExclusive = campaigns[i].clubExclusive;
          $scope.campaignsList[i].hasSms = channels.sms;
          $scope.campaignsList[i].hasEmail = channels.email;
          $scope.campaignsList[i].hasPush = channels.push;
          $scope.campaignsList[i].hasBanner = channels.banner;

          $scope.campaignsList[i].displaySearch = `${campaigns[i].name} - ${campaigns[i].mall.name} - (${$scope.formatDate(campaigns[i].startDate)} - ${$scope.formatDate(campaigns[i].endDate)})`;
        }

        $scope.campaignId = lastPublishedId;

        //$scope.loadGraphics();

        PopUp.hide();

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.apiGenericError);

        console.warn(error);
      })
    };

    $scope.loadStoreTags = function () {
      Campaign.getStoreTags().success(function (tags) {

        $scope.storeTags = tags.tags;

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.apiGenericError);

        console.warn(error);
      });
    };
    $scope.loadStoreTags();

    $scope.editCampaign = function (campaignId) {
      PopUp.loading('Carregando campanha...');

      var promessas = 0;

      Campaign.get(campaignId).success(function (campaign) {

        // cleanup if there's any resource here
        // sms = {};
        // banner = {};
        // email = {};
        // push = {};

        campaign.clubExclusive = !(
          campaign.clubExclusive === 'false' ||
          campaign.clubExclusive === 'null' ||
          campaign.clubExclusive === 'undefined' ||
          campaign.clubExclusive === '' ||
          campaign.clubExclusive === false ||
          campaign.clubExclusive === null ||
          campaign.clubExclusive === undefined
        );

        campaign.clubExclusive = campaign.clubExclusive;

        $scope.campaign = JSON.parse(JSON.stringify(campaign));

        $scope.campaign.startDate = moment(campaign.startDate).format("YYYY/MM/DD");
        $scope.campaign.endDate = moment(campaign.endDate).format("YYYY/MM/DD");

        document.getElementById('new-campaign-input-start-date').value = $scope.campaign.startDate;
        document.getElementById('new-campaign-input-end-date').value = $scope.campaign.endDate;

        $scope.campaign.mallId = campaign.mallId.toString();

        // Carrega as lojas do shopping
        $scope.fillStoreSelect();

        /*
        $scope.campaign.store = ( campaign.stores[0] ) ? campaign.stores[0].id.toString() : null;
        $scope.campaign.store = ($scope.campaign.store === null ? campaign.store : $scope.campaign.store);
        */
        $scope.campaign.tags = campaign.tags ? campaign.tags.split("@") : [];
        $scope.campaign.stores = campaign.stores.map(function (store) {
          return store.id;
        });
        $scope.campaign.clubExclusive = campaign.clubExclusive;
        $scope.campaign.bannerType = 'geral';

        $scope.channels = parseChannels(campaign.campaignChannels);

        PopUp.hide();
        setTimeout(function () {
          document.getElementById('new-campaign').click();
        }, 500);

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.campaign.error);

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
      channels_json VARCHAR(100),
      tags VARCHAR(100),
      create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      club_exclusive BOOLEAN NOT NULL DEFAULT false,
      published BOOLEAN DEFAULT false,
    );
    */
    $scope.newCampaign = function (cb_publish) {
      PopUp.loading(AppConfig.messages.campaign.creating);

      var campaign = JSON.parse(JSON.stringify($scope.campaign));
      campaign.type = "campaign";

      //campaign.mallId = $scope.campaign.mallId;
      campaign.channels = $scope.channels;
      campaign.tags = ($scope.campaign.tags || []).join('@');

      // campaign.startDate = moment($scope.campaign.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      // campaign.endDate = moment($scope.campaign.endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');


      if ($scope.campaign.id) {

        Campaign.update($scope.campaign.id, campaign).success(function (updatedCampaign) {

          createdCampaign = updatedCampaign;

          PopUp.success(AppConfig.messages.campaign.title,
            AppConfig.messages.campaign.success,
            function () {
              $scope.isCampaignSaved = true;
              //$route.reload();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.campaign.title,
            AppConfig.messages.apiGenericError);
          console.warn(error);
        });

      } else {
        if ($scope.campaign.stores.length === 1) {
          PopUp.confirm("Atenção!", "Se deseja selecionar apenas uma loja para esta ação, é indicada a criação de um Flash", function(resp) {

            if (resp) {
              PopUp.hide();
              window.location.replace(AppConfig.appUrl + '#/flash');
              //AppConfig.appUrl atualmente retorna localhost apenas quando está puxando a API em dev
              return;
            }

            Campaign.create(campaign).success(function (fetchedCampaign) {

              createdCampaign = fetchedCampaign;
              $scope.campaign.id = createdCampaign.id;

              if (!cb_publish) {

                PopUp.success(AppConfig.messages.campaign.title,
                  AppConfig.messages.campaign.success,
                  function () {
                    $scope.isCampaignSaved = true;
                    //$route.reload();
                  });
              } else {
                if (cb_publish) {
                  cb_publish(createdCampaign.id);
                }
              }

            }).error(function (error) {
              PopUp.alert(AppConfig.messages.campaign.title,
                AppConfig.messages.apiGenericError);
              console.warn(error);
            });

          }, "Continuar", "Criar um Flash");
        }

      }

    };

    $scope.publishCampaign = function (cId) {
      let campaignId = $scope.campaign.id || cId;
      if (!campaignId) {
        if (createdCampaign) {
          campaignId = createdCampaign.id;
        } else {
          $scope.newCampaign($scope.publishCampaign);
          return;
        }
      }

      PopUp.loading(AppConfig.messages.campaign.creating);

      Campaign.publish(campaignId).success(function (fetchedResults) {

        var results = fetchedResults;

        PopUp.success(AppConfig.messages.campaign.title,
          AppConfig.messages.campaign.success,
          function () {
            $scope.isCampaignSaved = true;
            $route.reload();
          });

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.campaign.title,
          AppConfig.messages.apiGenericError);
        console.warn(error);
      });

    };

    $scope.previewCutBase = function () {

      if (!$scope.campaign.mallId || !$scope.campaign.tags || !$scope.campaign.stores) {
        return;
      }

      var params = {
        mallId: $scope.campaign.mallId,
        tags: $scope.campaign.tags,
        stores: $scope.campaign.stores,
        type: "campaign",
      };

      Campaign.previewBaseCut(params).success(function (result) {

        $scope.previewBaseCutClients = result;

      }).error(function (error) {
        console.warn(error);
      });

    };

    $scope.previewSelectChannel = function () {

      if (!$scope.campaign.mallId || !$scope.previewBaseCutClients || !$scope.channels) {
        return;
      }

      var params = {
        mallId: $scope.campaign.mallId,
        clients: $scope.previewBaseCutClients,
        stores: $scope.channels,
      };

      Campaign.previewSelectChannel(params).success(function (result) {

      }).error(function (error) {
        console.warn(error);
      });

    };

    $scope.reportShowChannel = function (c, _id, edit, _campaignId) {

      if (c == "push") {

        $scope.openPush(_id, edit, _campaignId);

      } else if (c == "sms") {

        $scope.openSMS(_id, edit, _campaignId);

      } else if (c == "email") {

        $scope.openEmail(_id, edit, _campaignId);

      } else if (c == "banner") {

        $scope.openBanner(_id, edit, _campaignId);

      }

    };

    /* Open Dialogs */
    $scope.openPush = function (_pushId, edit, _campaignId) {

      $scope.dialogParams = {};

      if ($scope.channels.push) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.pushId = $scope.channels.push;
        $scope.dialogParams.push = {
          campaignId: _campaignId
        }
      } else if (_pushId) {
        if (edit) {
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

        $scope.previewSelectChannel();

        if (data && data.value) {
          if (data.value.pushId) {
            $scope.channels.push = data.value.pushId;
          } else if (data.value.pushId == null && successExit.indexOf(data.value) < 0) { // Apagou o Push
            delete $scope.channels.push;
          }
        }

      });

    };

    $scope.openSMS = function (_smsId, edit, _campaignId) {

      $scope.dialogParams = {};

      if ($scope.channels.sms) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.smsId = $scope.channels.sms;
        $scope.dialogParams.sms = {
          campaignId: _campaignId
        }
      } else if (_smsId) {
        if (edit) {
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

        $scope.previewSelectChannel();

        if (data && data.value) {
          if (data.value.smsId) {
            $scope.channels.sms = data.value.smsId;
          } else if (data.value.smsId == null && successExit.indexOf(data.value) < 0) { // Apagou o SMS
            delete $scope.channels.sms;
          }
        }

      });

    };

    $scope.openEmail = function (_emailId, edit, _campaignId) {

      $scope.dialogParams = {};

      if (_emailId) {
        if (edit) {
          $scope.dialogParams.mode = 'EDIT';
          $scope.dialogParams.email = {
            campaignId: _campaignId
          }
        } else {
          $scope.dialogParams.mode = 'SHOW';
        }
        $scope.dialogParams.emailId = _emailId;
      } else if ($scope.channels.email) {
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
        className: 'ngdialog-theme-default dialog-for-email',
        width: "100%",
        height: "100%"
      });

      dialog.closePromise.then(function (data) {

        $scope.previewSelectChannel();

        if (data && data.value) {
          if (data.value.emailId) {
            $scope.channels.email = data.value.emailId;
          } else if (data.value.emailId == null && successExit.indexOf(data.value) < 0) { // Apagou o Email
            delete $scope.channels.email;
          }
        }

      });

    };

    $scope.openBanner = function (_bannerId, edit, _campaignId) {

      $scope.dialogParams = {};

      if ((!_bannerId) && $scope.channels.banner) {
        $scope.dialogParams.mode = 'EDIT';
        $scope.dialogParams.bannerId = $scope.channels.banner;
        $scope.dialogParams.banner = {
          type: "campaign",
          campaignId: _campaignId
        }
      } else if (_bannerId) {
        if (edit) {
          $scope.dialogParams.mode = 'EDIT';
          $scope.dialogParams.banner = {
            type: "campaign",
            campaignId: _campaignId,
          }
        } else {
          $scope.dialogParams.mode = 'SHOW';
          $scope.dialogParams.banner = {
            type: "campaign"
          }
        }
        $scope.dialogParams.bannerId = _bannerId;
      } else {

        $scope.dialogParams.banner = {
          type: "campaign",
          title: $scope.campaign.name,
          isExclusive: $scope.campaign.clubExclusive || false,
          startDate: $scope.campaign.startDate,
          endDate: $scope.campaign.endDate,
        };

        $scope.dialogParams.mode = 'CREATE';
      }

      var dialog = ngDialog.open({
        template: 'partials/lightbox/banner-campanha.html',
        controller: 'BannerController',
        scope: $scope,
        cache: false,
      });

      dialog.closePromise.then(function (data) {

        if (data && data.value) {
          if (data.value.bannerId) {
            $scope.channels.banner = data.value.bannerId;
          } else if (data.value.bannerId == null && successExit.indexOf(data.value) < 0) { // Apagou o Banner
            delete $scope.channels.banner;
          }
        }

      });

    };

        /* Dialog */
    $scope.openNgDialog = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'categories':
          graphic.title = "Segmento";
          graphic.graphicUrl = '../graph/pie-chart/pie-chart.html';
          graphic.loadDataFunction = getCategories;
          graphic.height = 600;
          break;
        case 'visits':
          graphic.title = "Atendimentos";
          graphic.graphicUrl = '../graph/heat-map/heat-map.html';
          graphic.loadDataFunction = getVisits;
          graphic.height = 300;
          break;
        case 'recurrence':
          graphic.title = "Recorrência";
          graphic.graphicUrl = '../graph/grouped-bar/grouped-bar.html';
          graphic.loadDataFunction = getRecurrence;
          graphic.height = 300;
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', function ($scope) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphic = function () {

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");
              element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
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
        controller: ['$scope', 'BabyCare', function ($scope, BabyCare) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

          $scope.loadGraphic = function () {

            $scope.loadDataFunction().then(function (_data) {
              var element = document.getElementById("graphic");
              element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
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

    /* Charts */
    function getDailySales() {

      $scope.loading.dailySales = 1;

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getDailySales($scope.campaignId).success(function (_data) {

        $scope.loading.dailySales = 0;
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

    function getIndividualSales() {

      $scope.loading.individualSales = 1;
      $scope.loading.funel = 1;
      $scope.showFunelDiv = false;

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getIndividualSales($scope.campaignId).success(function (_data) {

        $scope.loading.individualSales = 0;
        $scope.loading.funel = 0;
        deferred.resolve(_data);

        $scope.showFunelDiv = true;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getTotalSales() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getTotalSales($scope.campaignId).success(function (_data) {

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

    function getTotalAverageDailySales() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getTotalAverageDailySales($scope.campaignId).success(function (_data) {

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

    function getEmailFunnel() {
      $scope.loading.emailFunnelChart = true;

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getEmailFunnel($scope.campaignId).success(function (_data) {

        deferred.resolve(_data);

        $scope.emailFunnelData = _data.graphics;

        $scope.loading.emailFunnelChart = false;
        PopUp.hide();

        return $scope.emailFunnelData;

      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });



      return deferred.promise;
    };

    function getSmsFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getSmsFunnel($scope.campaignId).success(function (_data) {

        deferred.resolve(_data);

        $scope.smsFunnelData = _data.graphics;
        console.log($scope.smsFunnelData);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getPushFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getPushFunnel($scope.campaignId).success(function (_data) {

        deferred.resolve(_data);

        $scope.pushFunnelData = _data.graphics;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getCampaignFunnel() {

      PopUp.loading(AppConfig.messages.loading);

      var deferred = $q.defer();

      Campaign.getCampaignFunnel($scope.campaignId).success(function (_data) {

        deferred.resolve(_data);

        $scope.campaignFunnelData = _data.graphics;

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getTotalTransactions() {

      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      Campaign.getTotalTransactions($scope.campaignId).success(function (_data) {
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getTotalClients() {
      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      Campaign.getTotalClients($scope.campaignId).success(function (_data) {
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function getAverageTicketByClient() {
      PopUp.loading(AppConfig.messages.loading);
      var deferred = $q.defer();

      Campaign.getAverageTicketByClient($scope.campaignId).success(function (_data) {
        deferred.resolve(_data);
        PopUp.hide();
      }).error(function (error) {
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    function loadBanner() {
      var deferred = $q.defer();

      if (!$scope.reportSelectedCampaign.campaignChannels) {
        return;
      }

      var channels = parseChannels($scope.reportSelectedCampaign.campaignChannels);

      if (channels.banner) {
        var bannerId = channels.banner;
      } else {
        deferred.resolve({});
        return deferred.promise;
      }

      Channel.getBanner(bannerId).success(function (_banner) {

        $scope.reportBannerURL = _banner.image;
        deferred.resolve(_banner);

        PopUp.hide();
      }).error(function (error) {
        //            PopUp.alert(AppConfig.messages.coupon.title.plural,
        //                AppConfig.messages.coupon.errorWhileGetting);
        console.warn(error.stack);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    $scope.loadGraphics = function () {

      $scope.report = {};

      loadBanner();

      getDailySales().then(function (_data) {
        var element = document.getElementById("dailySales");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.Campaign_barchart = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/bar-chart/bar-chart.html?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"Campaign_barchart"}';
        //element.src = '../graph/bar-chart/bar-chart.html' + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.warn(error);
      });

      getIndividualSales().then(function (_data) {
        var element = document.getElementById("individualSales");

        var graphic_data = JSON.parse(sessionStorage.graphic_data);
        graphic_data.Campaign_pie = JSON.stringify(_data);
        sessionStorage.graphic_data = JSON.stringify(graphic_data);

        element.src = '../graph/pie-chart/pie-chart.html?params={"data":"Campaign_pie"}';
        //element.src = '../graph/bar-chart/bar-chart.html' + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
      }).catch(function (error) {
        console.warn(error);
      });

      // ================================================================================
      // let emailFunnelRetry = 0;
      // const emailFunnelCallback = function (_data) {
      //   var element = document.querySelector("#chartdiv");

      //   var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //   graphic_data.Campaign_email = JSON.stringify(_data);
      //   sessionStorage.graphic_data = JSON.stringify(graphic_data);
      // };
      // let emailFunnelHandler = null;
      // emailFunnelHandler = function (error) {
      //   emailFunnelRetry += 1;
      //   console.warn(error);

      //   if (emailFunnelRetry < 3) {
      //     return getEmailFunnel().then(emailFunnelRetry).catch(emailFunnelHandler);
      //   }
      // };
      // getEmailFunnel().then(emailFunnelCallback).catch(emailFunnelHandler);
      // =====================================================================================

      // ======================================================================================
      // let smsFunnelRetry = 0;
      // const smsFunnelCallback = function (_data) {
      //   var element = document.querySelector("#smsFunnel");

      //   var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //   graphic_data.Campaign_sms = JSON.stringify(_data);
      //   sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //   element.src = '../graph/funnel/funnel.html?params={"data":"Campaign_sms"}';
      // };
      // let smsFunnelHandler = null;
      // smsFunnelHandler = function (error) {
      //   smsFunnelRetry += 1;
      //   console.warn(error);

      //   if (smsFunnelRetry < 3) {
      //     return getSmsFunnel().then(smsFunnelCallback).catch(smsFunnelHandler);
      //   }
      // };
      // getSmsFunnel().then(smsFunnelCallback).catch(smsFunnelHandler);
      // =====================================================================================

      // ======================================================================================
      // let pushFunnelRetry = 0;
      // const pushFunnelCallback = function (_data) {
      //   var element = document.querySelector("#pushFunnel");

      //   var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //   graphic_data.Campaign_push = JSON.stringify(_data);
      //   sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //   element.src = '../graph/funnel/funnel.html?params={"data":"Campaign_push"}';
      // };
      // let pushFunnelHandler = null;
      // pushFunnelHandler = function (error) {
      //   pushFunnelRetry += 1;
      //   console.warn(error);

      //   if (pushFunnelHandler < 3) {
      //     return getPushFunnel().then(pushFunnelCallback).catch(pushFunnelHandler);
      //   }
      // };
      // getPushFunnel().then(pushFunnelCallback).catch(pushFunnelHandler);
      // =======================================================================================

      // ======================================================================================
      // let campaignFunnelRetry = 0;
      // const campaignFunnelCallback = function (_data) {
      //   var element = document.querySelector("#campaignFunnel");

      //   var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //   graphic_data.Campaign_general = JSON.stringify(_data);
      //   sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //   element.src = '../graph/funnel/funnel.html?params={"data":"Campaign_general"}';
      // };
      // let campaignFunnelHandler = null;
      // campaignFunnelHandler = function (error) {
      //   campaignFunnelRetry += 1;
      //   console.warn(error);

      //   if (campaignFunnelRetry < 3) {
      //     return getCampaignFunnel().then(campaignFunnelCallback).catch(campaignFunnelHandler);
      //   }
      // };
      // getCampaignFunnel().then(campaignFunnelCallback).catch(campaignFunnelHandler);
      // ======================================================================================

      getTotalSales().then(function (_data) {

        var o = _data[0];
        for (var key in o) {
          $scope.report.totalSales = o[key];
        }

      }).catch(function (error) {
        console.warn(error);
      });

      getTotalAverageDailySales().then(function (_data) {

        var o = _data[0];
        for (var key in o) {
          $scope.report.totalAverageDailySales = o[key];
        }

      }).catch(function (error) {
        console.warn(error);
      });

      getTotalTransactions().then(function (_data) {
        $scope.report.totalTransactions = _data.totalTxs;
      }).catch(function (error) {
        console.warn(error);
      });

      getTotalClients().then(function (_data) {
        $scope.report.totalClients = _data.totalClients;
      }).catch(function (error) {
        console.warn(error);
      });

      getAverageTicketByClient().then(function (_data) {
        $scope.report.averageTicketByClient = _data.averageValue;
      }).catch(function (error) {
        console.warn(error);
      });


    }


    /* Dialog */
    $scope.openNgDialog = function (graphicName) {

      var graphic = {
        title: 'Gráfico',
        loadDataFunction: null,
        height: null
      }

      switch (graphicName) {
        case 'individualSales':
          graphic.title = "Venda Individual por Dia";
          graphic.graphicUrl = '../graph/pie-chart/pie-chart.html';
          graphic.loadDataFunction = getIndividualSales;
          graphic.height = 600;
          break;
        default:
          alert("No suitable graphic found!");
      };


      ngDialog.open({
        template: 'partials/lightbox/default-chart.html',
        controller: ['$scope', 'Campaign', function ($scope, Campaign) {
          $scope.title = graphic.title;
          $scope.loadDataFunction = graphic.loadDataFunction;
          $scope.height = graphic.height;

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
        case 'dailySales':
          graphic.title = "Venda Total Diária";
          graphic.graphicUrl = '../graph/bar-chart/bar-chart.html';
          graphic.loadDataFunction = getDailySales;
          graphic.height = 300;
          graphic._cache = "Campaign_barchart";
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

    /* Funnel Chart Modal */
    $scope.openFunnelChart = function () {
      const $parentScope = $scope;

      const funnelDialog = ngDialog.open({
        template: 'partials/lightbox/channel-campaign.html',
        controller: ['$scope', function ($scope) {
          // Object.assign($scope, funnelObject);

          // setTimeout(function () {
          //   funnelObject.loadAllGraphics();
          // }, 1000);

          $scope.emailFunnelData = $parentScope.emailFunnelData;
          $scope.smsFunnelData = $parentScope.smsFunnelData;
          $scope.pushFunnelData = $parentScope.pushFunnelData;
          $scope.campaignFunnelData = $parentScope.campaignFunnelData;

          console.log($scope.smsFunnelData);
          console.log($scope.pushFunnelData);
          console.log($scope.campaignFunnelData);
        }]
      });
      funnelDialog.closePromise.then(function () {
        $scope.showFunelDiv = true;
        // funnelObject.loadAllGraphics();
        const radio = document.querySelector("#slides_1");
        radio.click();
        radio.checked = true;
      });


      // var graphic = {
      //   title: "Gráfico",
      //   loadDataFunction: null,
      //   height: null,
      //   prop1: "",
      //   prop2: ""
      // }

      // switch (graphicName) {
      //   case 'funnel':
      //     graphic.title = "Funis";
      //     graphic.graphicUrl = '../graph/funnel/funnel.html';
      //     graphic.height = 400;
      //     graphic.loadDataEmail = getEmailFunnel;
      //     graphic._cacheEmail = "Campaign_email";
      //     graphic.loadDataSms = getSmsFunnel;
      //     graphic._cacheSms = "Campaign_sms";
      //     graphic.loadDataPush = getPushFunnel;
      //     graphic._cachePush = "Campaign_push";
      //     graphic.loadDataCampaign = getCampaignFunnel;
      //     graphic._cacheCampaign = "Campaign_general";
      //     break;
      //   default:
      //     alert("No suitable graphic found!");
      // };

      // var graphic_data = JSON.parse(sessionStorage.graphic_data);

      // const funnelObject = {
      //   title: graphic.title,
      //   loadDataEmail: graphic.loadDataEmail,
      //   loadDataSms: graphic.loadDataSms,
      //   loadDataPush: graphic.loadDataPush,
      //   loadDataCampaign: graphic.loadDataCampaign,
      //   height: graphic.height,
      //   showFunelDiv: true
      // };

      // funnelObject.loadEmail = function () {
      //   if (!graphic_data[graphic._cacheEmail]) {
      //     funnelObject.loadDataEmail().then(function (_data) {
      //       var element = document.querySelector("#graphicEmail");

      //       var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //       graphic_data[graphic._cacheEmail] = JSON.stringify(_data);
      //       sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //       element.src = graphic.graphicUrl + '?params={"data":"' + graphic._cacheEmail + '"}';
      //       //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      //     }).catch(function (error) {
      //       console.warn(error);
      //     });
      //   } else {
      //     document.querySelector("#graphicEmail").src = graphic.graphicUrl + '?params={"data":"' + graphic._cacheEmail + '"}';
      //   }
      // };


      // funnelObject.loadSms = function () {
      //   if (!graphic_data[graphic._cacheSms]) {
      //     funnelObject.loadDataSms().then(function (_data) {
      //       var element = document.querySelector("#graphicSms");

      //       var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //       graphic_data[graphic._cacheSms] = JSON.stringify(_data);
      //       sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //       element.src = graphic.graphicUrl + '?params={"data":"' + graphic._cacheSms + '"}';
      //       //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      //     }).catch(function (error) {
      //       console.warn(error);
      //     });
      //   } else {
      //     document.querySelector("#graphicSms").src = graphic.graphicUrl + '?params={"data":"' + graphic._cacheSms + '"}';
      //   }
      // };


      // funnelObject.loadPush = function () {
      //   if (!graphic_data[graphic._cachePush]) {
      //     funnelObject.loadDataPush().then(function (_data) {
      //       var element = document.querySelector("#graphicPush");

      //       var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //       graphic_data[graphic._cachePush] = JSON.stringify(_data);
      //       sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //       element.src = graphic.graphicUrl + '?params={"data":"' + graphic._cachePush + '"}';
      //       //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      //     }).catch(function (error) {
      //       console.warn(error);
      //     });
      //   } else {
      //     document.querySelector("#graphicPush").src = graphic.graphicUrl + '?params={"data":"' + graphic._cachePush + '"}';
      //   }
      // };

      // funnelObject.loadCampaign = function () {
      //   if (!graphic_data[graphic._cacheCampaign]) {
      //     funnelObject.loadDataCampaign().then(function (_data) {
      //       var element = document.querySelector("#graphicCampaign");

      //       var graphic_data = JSON.parse(sessionStorage.graphic_data);
      //       graphic_data[graphic._cacheCampaign] = JSON.stringify(_data);
      //       sessionStorage.graphic_data = JSON.stringify(graphic_data);

      //       element.src = graphic.graphicUrl + '?params={"data":"' + graphic._cacheCampaign + '"}';
      //       //element.src = graphic.graphicUrl + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
      //     }).catch(function (error) {
      //       console.warn(error);
      //     });
      //   } else {
      //     document.querySelector("#graphicCampaign").src = graphic.graphicUrl + '?params={"data":"' + graphic._cacheCampaign + '"}';
      //   }
      // };

      // funnelObject.loadAllGraphics = function () {
      //   funnelObject.loadEmail();
      //   funnelObject.loadSms();
      //   funnelObject.loadPush();
      //   funnelObject.loadCampaign();
      // };

    };
    $scope.$on('$destroy', function(){
      am4core.disposeAllCharts();
    });
  }


]);
