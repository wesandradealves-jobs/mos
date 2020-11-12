'use strict';

// banner (
//       save: boolean,
//       title: string,
//       subtitle: string,
//       disclaimer: string,
//       section_type_id: integer,
//       offer_type_id: nullable_integer,
//       place: nullable_string,
//       isExclusive: nullable_boolean,
//       backgroundBuffer: string,
//       quality: nullable_integer
// );

/* global _app, moment, cuid */

_app.controller('BannerController', ['$scope', 'PopUp', 'AppConfig', 'Channel',
  'EventBus', '$route',
  function ($scope, PopUp, AppConfig, Channel, EventBus, $route) {

    const weekdays = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado'
    ];

    const bannerWidths = [ 960, 960, 600 ]; // index 0=featured, 1=food, 2=event
    const bannerHeights = [ 540, 540, 400 ]; // index 0=featured, 1=food, 2=event

    var params = $scope.dialogParams;

    $scope.weekdays = weekdays; // give direct access by ng directives

    const originalBackgroundId = cuid(); // moment().valueOf();

    $scope.ignore = false;
    $scope.mode = params.mode;
    $scope.banner = {
      // Id que controla a sessão atual com o servidor (para evitar enviar o BG em todas as requisições)
      originalBackgroundId: originalBackgroundId,
      //originalBackgroundId: moment().valueOf(),
      processing: (params.banner ? params.banner.processing : undefined),
      save: (params.banner ? params.banner.save : undefined),
      rendered: true,
      metadata: {}
    };

    $scope.banner.processing = params.banner.type != "campaign";

    $scope.banner.metadata.originalBackgroundId = $scope.banner.originalBackgroundId;
    $scope.banner.metadata.offerParams = {};

    if (
      $scope.banner.metadata.weekdayA === undefined ||
      $scope.banner.metadata.weekdayA === null
    ) {
      $scope.banner.metadata.weekdayA = '';
    }

    if (
      $scope.banner.metadata.weekdayB === undefined ||
      $scope.banner.metadata.weekdayB === null
    ) {
      $scope.banner.metadata.weekdayB = '';
    }

    /* Validações de campo */
    $scope.titleError = false;
    $scope.validateTitle = function () {
      $scope.titleError = !$scope.banner.title;
    };

    $scope.subtitleError = false;
    $scope.validateSubtitle = function () {
      $scope.subtitleError = !$scope.banner.subtitle;
    };

    $scope.priceError = false;
    $scope.validatePrice = function () {
      $scope.priceError = !$scope.banner.price;
    };

    $scope.disclaimerError = false;
    $scope.validateDisclaimer = function () {
      $scope.disclaimerError = !$scope.banner.disclaimer;
    };

    if (params.banner.type == 'campaign') {
      $scope.processing = false;
      $scope.banner.processing = false;
    }

    if ( params.banner && params.banner.isExclusive )
      $scope.banner.metadata.isExclusive = params.banner.isExclusive ? "true" : "false";
    else
      $scope.banner.metadata.isExclusive = "false";

    if ( params.banner && params.banner.store )
      $scope.banner.title = params.banner.store;

    if ( params.banner && params.banner.title )
      $scope.banner.title = params.banner.title;

    if ( params.banner && params.banner.bannerType ) {
      // $scope.banner.section_type_id = params.banner.bannerType;
    } else {
      // $scope.banner.section_type_id = 1;
      // $scope.bannerSectionTypes = [];

      Channel.listSectionTypes().success(function (result) {
        $scope.bannerSectionTypes = result;
      }).error(function () {
        PopUp.alert(AppConfig.messages.flash.title,
          AppConfig.messages.apiGenericError, function () {
            $route.reload();
          });
      });
    }

    if (params.banner && params.banner.startDate) {
      $scope.banner.metadata.startDate = moment(params.banner.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    if (params.banner && params.banner.endDate) {
      $scope.banner.metadata.endDate = moment(params.banner.endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    $scope.bannerWidth = bannerWidths[Number($scope.banner.section_type_id) - 1];
    $scope.bannerHeight = bannerHeights[Number($scope.banner.section_type_id) - 1];

    $scope.bannerOfferTypes = [];

    Channel.listOfferTypes().success(function (result) {
      $scope.bannerOfferTypes = result;
    }).error(function () {
      PopUp.alert(AppConfig.messages.flash.title,
        AppConfig.messages.apiGenericError, function () {
          $route.reload();
        });
    });

    // Variáveis que controlam a atualização do preview
    var backgroundUpToDate = false; // Se o servidor está com a versão mais atualizada do background
    var previewUpToDate = false;    // Se teve alguma alteração dos campos enquanto o servidor estava gerando um preview
    var serverIsBusy = 0;           // Se o servidor está processando alguma requisição

    if ( params.mode != 'CREATE' ) {
      //params.bannerId;
      // $scope.banner.rendered = true;
      loadBanner(function () {
        $scope.previewBanner();
      });
    } else {
      // $scope.banner.rendered = false;
      // $scope.banner.section_type_id = 1;
    }

    function close () {
      $scope.closeThisDialog( { bannerId: $scope.banner.id } );
      //value: {val1: 10, val2: 500, val3: "Yeah!"} -> função $scope.closeThisDialog()
      //value: "$document" -> clicou fora
      //value: "$closeButton" -> clicou no botão de fechar
      //value: "$escape" -> clicou no esc
    }

    function loadBanner (done) {

      PopUp.loading(AppConfig.messages.channel.banner.loading);

      Channel.getBanner( params.bannerId ).success(function (_banner) {
        $scope.banner = _banner;
        $scope.banner.originalBackgroundId = originalBackgroundId;
        $scope.banner.preview = _banner.image;
        $scope.banner.bannerType = _banner.section_type_id;

        if (_banner.metadata.startHour) {
          $scope.banner.metadata.startHour = moment(_banner.metadata.startHour, 'HH:mm').format('HH:mm');
        }

        if (_banner.metadata.endHour) {
          $scope.banner.metadata.endHour = moment(_banner.metadata.endHour, 'HH:mm').format('HH:mm');
        }

        PopUp.hide();

        if (done) {
          done();
        }
      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.banner.title, AppConfig.messages.apiGenericError);

        console.warn(error);

        if (done) {
          done(error);
        }
      });

    }

    function checkBannerOfferType(_banner) {
      _banner.types = undefined;
      if (_banner.offer_type_id === 8 && !_banner.metadata.offerParams.price) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 9 && !_banner.metadata.offerParams.price) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 1 && !_banner.metadata.offerParams.text) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 2 && !_banner.metadata.offerParams.oldPrice) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 2 && !_banner.metadata.offerParams.newPrice) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 3 && !_banner.metadata.offerParams.percent) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 6 && !_banner.metadata.offerParams.percent) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 7 && !_banner.metadata.offerParams.points) {
        _banner.offer_type_id = undefined;
      }

      if (_banner.offer_type_id === 8 && !_banner.metadata.offerParams.price) {
        _banner.offer_type_id = undefined;
      }

      return _banner;
    }

    //$scope.$on('ngDialog.closed', function () {
    //  console.log("Vai fechar!");
    //  $scope.closeThisDialog( { val1: 10, val2: 500, val3: "Yeah!" } );
    //});


    $scope.createBanner = function () {

      PopUp.loading(AppConfig.messages.channel.banner.creating);

      var _banner = JSON.parse(JSON.stringify($scope.banner));

      _banner.quality = 85;
      _banner.save = true;

      if ( !_banner.subtitle )
        _banner.subtitle = "-";

      _banner = checkBannerOfferType(_banner);

      if (_banner.metadata.startHour) {
        _banner.metadata.startHour = moment(_banner.metadata.startHour, 'HH:mm').format('HH:mm');
      }

      if (_banner.metadata.endHour) {
        _banner.metadata.endHour = moment(_banner.metadata.endHour, 'HH:mm').format('HH:mm');
      }

      if (_banner.section_type_id === 3) {
        _banner.offer_type_id = null;
      }

      Channel.createBanner( _banner ).success(function (fetchedBanner) {

        $scope.banner = fetchedBanner;

        console.log($scope.banner);

        PopUp.success(AppConfig.messages.channel.banner.title,
          AppConfig.messages.channel.banner.success, function () {

            close();

          });

      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.banner.title, AppConfig.messages.apiGenericError);

        console.warn(error);

      });

    };

    $scope.updateBanner = function() {

      PopUp.loading(AppConfig.messages.channel.banner.updating);

      const _banner = JSON.parse(JSON.stringify($scope.banner));

      if (_banner.metadata.startHour) {
        _banner.metadata.startHour = moment(_banner.metadata.startHour, 'HH:mm').format('HH:mm');
      }

      if (_banner.metadata.endHour) {
        _banner.metadata.endHour = moment(_banner.metadata.endHour, 'HH:mm').format('HH:mm');
      }

      _banner.save = true;
      _banner.quality = 85;

      delete _banner.preview;
      delete _banner.image;

      if (params.banner.type == "campaign") {
        _banner.processing = false;
      }

      if (_banner.section_type_id === 3) {
        _banner.offer_type_id = null;
      }


      Channel.updateBanner($scope.banner.id, _banner).success(function (fetchedBanner) {

          $scope.banner = fetchedBanner;

          console.log($scope.banner);

          PopUp.success(AppConfig.messages.channel.banner.title,
            AppConfig.messages.channel.banner.success, function () {

              close();

            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.channel.banner.title, AppConfig.messages.apiGenericError);

          console.warn(error);

        });
    }

    $scope.deleteBanner = function() {

      PopUp.confirm(AppConfig.messages.channel.banner.title, AppConfig.messages.channel.banner.deleteMsg, function(resp) {

        if ( !resp ) {
          PopUp.hide();
          return;
        }

        PopUp.loading(AppConfig.messages.channel.banner.deleting);

        Channel.deleteBanner(params.banner.campaignId, $scope.banner.id).success(function () {

          $scope.banner = {};

          PopUp.success(AppConfig.messages.channel.banner.title,
            AppConfig.messages.channel.banner.success, function () {
              // não importa o controlador origem/pai, o evento vai ser
              // enviado pra quem estiver ouvindo...
              EventBus.publish('flash-reload-flash-list', {});
              EventBus.publish('campaign-reload-campaign-list', {});
              close();
            });

        }).error(function (error) {
          PopUp.alert(AppConfig.messages.channel.banner.title, AppConfig.messages.apiGenericError);

          console.warn(error);

        });

      });

    }

    $scope.resetPreviewBanner = function () {
      $scope.ignore = true;
      $scope.banner.rendered = false;
      $scope.banner.processing = params.banner.type != "campaign";
      $scope.banner.image = '';
      $scope.banner.preview = '';
      $scope.bannerWidth = bannerWidths[Number($scope.banner.section_type_id) - 1];
      $scope.bannerHeight = bannerHeights[Number($scope.banner.section_type_id) - 1];

      /*
      $scope.banner.preview = null;
      $scope.previewBanner();
      */
    };

    $scope.previewBanner = function ( updateBG ) {

      console.log("Server Status: " +serverIsBusy);
      console.log("updatebg: " + updateBG);
      console.log("bg: " + $scope.banner.backgroundBuffer);

      $scope.bannerWidth = bannerWidths[Number($scope.banner.section_type_id) - 1];
      $scope.bannerHeight = bannerHeights[Number($scope.banner.section_type_id) - 1];

      if ((!$scope.banner.image && !$scope.banner.backgroundBuffer) || ( serverIsBusy && !updateBG ) ) {
        console.log(" [ Preview Banner ] Requisição não enviada ...");
        previewUpToDate = false;
        return;
      }

      console.log(" [ Preview Banner ] Requisição ENVIADA ...");

      previewUpToDate = true;
      serverIsBusy++;

      var _banner = JSON.parse(JSON.stringify($scope.banner));

      console.log(_banner);
      if (_banner.metadata.startHour) {
        _banner.metadata.startHour = moment(_banner.metadata.startHour, 'HH:mm').format('HH:mm');
      }

      if (_banner.metadata.endHour) {
        _banner.metadata.endHour = moment(_banner.metadata.endHour, 'HH:mm').format('HH:mm');
      }

      delete _banner.image;
      delete _banner.preview;
      //_banner.originalBackgroundId = originalBackgroundId;

      if ( !updateBG ) {
        delete _banner.backgroundBuffer;
      }

      $scope.banner.loading = true;

      _banner.quality = 50;
      _banner.save = false;

      console.log($scope.banner);
      console.log(_banner);

      _banner.processing = params.banner.type != "campaign";

      Channel.previewBanner(_banner).success(function (result) {
        $scope.banner.loading = false;
        $scope.banner.preview = result.image;
        $scope.banner.rendered = true;
        $scope.ignore = false;

        console.log(result);
        // console.log("banner: " + JSON.stringify($scope.banner));

        serverIsBusy--;
        if ( !previewUpToDate ) {
          $scope.previewBanner();
        }

      }).error(function (error) {
        serverIsBusy--;
        $scope.banner.loading = false;
        console.warn(error);
      });

    };


    $scope.file_changed = function (element) {
      $scope.ignore = true;
      $scope.banner.loading = true;
      $scope.banner.rendered = false;
      // $scope.banner.backgroundBuffer = null;

      function updateProgress(evt) {
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
          var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
          console.log(percentLoaded);
          // Increase the progress bar length.
          if (percentLoaded < 100) {
            console.log( percentLoaded + '%' );
            //progress.textContent = percentLoaded + '%';
          }
        }
      }

      var dataFile = element.files[0];
      var reader = new FileReader();
      reader.onprogress = updateProgress;
      reader.onload = function (e) {
        $scope.$apply(function () {
          $scope.image = dataFile;

          $scope.banner.image = reader.result;
          $scope.banner.backgroundBuffer = reader.result;
          $scope.banner.preview = reader.result;

          backgroundUpToDate = false;

          // if (params.banner.type != "campaign")
            $scope.previewBanner( true );

        });
      };
      reader.readAsDataURL(dataFile);
    };

  }]);


/*

      function newBanner(_banner) {

        console.log("_banner");
        console.log(_banner);
        console.log("_banner_");

        _banner.quality = 85;
        _banner.save = true;
        _banner.offer_type_id = 8;
        _banner.section_type_id = 1;

        PopUp.loading(AppConfig.messages.flash.creating);

        if (!$scope.channels.banner) {

          Channel.createBanner(_banner).success(function (fetchedBanner) {

            $scope.channels.banner = fetchedBanner.id;
            banner = fetchedBanner;

            banner.tmp_preview = _banner.tmp_preview;
            banner.isExclusive = _banner.isExclusive;
            banner.price = _banner.offerParams.price;

            console.log("***banner");
            console.log(banner);
            console.log("banner***");

            PopUp.success(AppConfig.messages.flash.title,
              AppConfig.messages.flash.success, function () {
                ngDialog.close();
                //$route.reload();
              });
          }).error(function (error) {
            PopUp.alert(AppConfig.messages.flash.title,
              AppConfig.messages.flash.error);
            console.warn(error);
          });

        } else {

          Channel.updateBanner($scope.channels.banner, _banner).success(function (fetchedBanner) {

            banner = fetchedBanner;

            banner.tmp_preview = _banner.tmp_preview;
            banner.isExclusive = _banner.isExclusive;
            banner.price = _banner.offerParams.price;

            if ( reportMode == 'edit' ) {
              banner = {};
              $scope.channels.banner = undefined;
            }

            PopUp.success(AppConfig.messages.flash.title,
              AppConfig.messages.flash.success, function () {
                //$route.reload();
                ngDialog.close();
              });
          }).error(function (error) {
            PopUp.alert(AppConfig.messages.flash.title,
              AppConfig.messages.flash.error);
            console.warn(error);
          });

        }

      }

      function previewBanner(_banner) {
        _banner.quality = 50;
        _banner.save = false;
        _banner.offer_type_id = 8;
        _banner.section_type_id = 1;

        console.log(_banner);

        return Channel.previewBanner(_banner);

        // .success(function(fetchedBanner) {

        //   $scope.channels.banner = fetchedBanner.id;s
        //   banner = fetchedBanner;

        //   PopUp.success(AppConfig.messages.flash.title,
        //     AppConfig.messages.flash.success, function() {
        //         //$route.reload();
        //     });
        // }).error(function(error) {
        //   PopUp.alert(AppConfig.messages.flash.title,
        //     AppConfig.messages.flash.error);
        //     console.warn(error);
        // });

      };


      if  ( reportMode == 'show' ) {

        ngDialog.open({
          template: 'partials/lightbox/banner-campanha.html',
          controller: ['$scope', function ($scope) {

            $scope.hideButton = true;

            $scope.banner = banner;
            $scope.banner.preview = banner.image;

          }]
        });

      } else {

        ngDialog.open({
          template: 'partials/lightbox/banner-app.html',
          preCloseCallback: function(){

            if  ( reportMode == 'edit' ) {
              banner = {};
              $scope.channels.banner = 0;
              $scope.channels.banner = false;
              $scope.channels.banner = undefined;
              delete $scope.channels.banner;
            }

          },
          controller: ['$scope', function ($scope) {

            var locker = false;
            var changed = false;

            console.log("++banner");
            console.log(banner);
            console.log("banner++");

            $scope.banner = banner;

            if ( JSON.stringify($scope.banner) != "{}" && banner.tmp_preview ) {
              $scope.image = banner.tmp_preview.image;
              $scope.banner.preview =  banner.tmp_preview.preview;
            }

            $scope.banner.isExclusive = isExclusive ? "true" : "false";
            $scope.banner.title = store;
            $scope.banner.loading = false;

            console.log("load...");
            console.log($scope.banner);

            //$scope.banner.backgroundBuffer = "xyz";

            $scope.createBanner = function () {
              $scope.banner.tmp_preview = { image: $scope.image, preview: $scope.banner.preview };

              console.log("NEW $scope.banner");
              console.log($scope.banner);

              newBanner($scope.banner);
            };

          }]

        });
      }
*/
