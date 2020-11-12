'use strict';
_app.controller('CouponController', ['$scope', '$location', '$route', 'Session', 'Permission',
    'AppConfig', 'ngDialog', 'Coupon', 'PopUp', 'DTOptionsBuilder', 'ClientMall','$timeout',
    function($scope, $location, $route, Session, Permission,
             AppConfig, ngDialog, Coupon, PopUp, DTOptionsBuilder, ClientMall, $timeout) {

        $scope.menuPermissions = Permission.menuPermissions();
        $scope.malls = Session.get('malls');
        $scope.user = Session.get('user');

        $scope.coupons = [];

        $scope.filter = {
          cpf: '',
          initialDate: null,
          finalDate: null,
          clientPointStatusId: 1,
        }

        $scope.pointStatusIds = [
          {
            id: 1,
            name: 'Pendente',
          },{
            id: 2,
            name: 'Aprovado',
          },{
            id: 3,
            name: 'Negado',
          }
        ];

        $scope.selectedMalls = [];
        $scope.selectedMalls.push( $scope.malls[0].id );
        /*
        for (let i=0; i < $scope.malls.length; i++) {
          $scope.selectedMalls.push( $scope.malls[i].id );
        }
        */

        $scope.logout = function () {
          Session.setAll({});
          $location.path('/');
        };

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('responsive', true);

        $scope.getCoupons = function() {

            PopUp.loading(AppConfig.messages.coupon.gettingPendents);

            let filter = JSON.parse(JSON.stringify($scope.filter));

            if ( filter.initialDate ) {
              if( !moment(filter.initialDate).isValid() ) {
                delete filter.initialDate;
              } else {
                filter.initialDate = moment(filter.initialDate).format('YYYY-MM-DD');
              }
            }

            if ( filter.finalDate ) {
              if ( ! moment(filter.finalDate).isValid() ) {
                delete filter.finalDate;
              } else {
                filter.finalDate = moment(filter.finalDate).format('YYYY-MM-DD');
              }
            }

            let selected = Array.isArray($scope.selectedMalls) ? $scope.selectedMalls : [$scope.selectedMalls];

            Coupon.getPendents(selected, filter).success(function(coupons) {
                $scope.coupons = coupons;
                PopUp.hide();
            }).error(function(error) {
                PopUp.alert(AppConfig.messages.coupon.title.plural,
                    AppConfig.messages.coupon.errorWhileGetting);
                console.log(JSON.stringify(error));
            });
        };

        $scope.validadeDate = function(field) {
          if ( !moment($scope.filter[ field ], 'DD/MM/YYYY').isValid() )
            $scope.filter[ field ] = '';
            
            $scope.initialDateError = !$scope.filter.initialDate;
            $scope.finalDateError = !$scope.filter.finalDateDate;

        };

        $scope.parseDateToLocale = function(date) {
          try {
          var parsedDate = new Date(date).toLocaleDateString();
          return parsedDate;
          }
          catch {
            return "Sem data"
          }

        }

        var updateCoupon = function(coupon) {
            PopUp.loading(AppConfig.messages.coupon.updating);

            if (coupon.clientPointStatusId == 2) {
              coupon.clientPointReasonId = null;
            }

            Coupon.update(coupon).success(function() {

                $scope.coupons = $scope.coupons.filter((c) => { return c.id != coupon.id });

                ClientMall.update({
                    mallId: coupon.mall.id,
                    clientId: coupon.client.id
                }).success(function() {

                    PopUp.success(AppConfig.messages.coupon.title.singular, AppConfig.messages.coupon.updated,
                        function() {
                            ngDialog.close();
                        });

                }).error(function(error) {

                    PopUp.alert(AppConfig.messages.coupon.title.plural,
                        AppConfig.messages.coupon.errorWhileUpdating);
                    console.log(JSON.stringify(error));

                });

            }).error(function(error) {
                PopUp.alert(AppConfig.messages.coupon.title.plural,
                    AppConfig.messages.coupon.errorWhileUpdating);
                console.log(JSON.stringify(error));
            });

        };

        Coupon.getPointReason().success(function (reasons) {
            $scope.reasons = reasons;
            PopUp.hide();
        }).error(function (error) {
            PopUp.alert(AppConfig.messages.pointReason.title, AppConfig.messages.pointReason.errorWhileGetting);
            console.log(JSON.stringify(error));
        });

        $scope.openDialog = function(coupon) {
            PopUp.loading(AppConfig.messages.coupon.gettingImages);
            Coupon.getImages(coupon.id).success(function (fetchedImages) {

              coupon.cupom = fetchedImages.cupom;
              coupon.otherCupom = fetchedImages.otherCupom;
              coupon.employeeMallId = $scope.user.id;
              coupon.lastOperation = moment().format('YYYY-MM-DD');

              ngDialog.open({
                  scope: $scope,
                  template: 'partials/lightbox/coupon-detailing.html',
                  controller: ['$scope', 'Coupon', function ($scope, Coupon) {
                      PopUp.hide();

                      $scope.statusUpdate = {
                        id: coupon.id,
                        mall: {
                          id: coupon.mall.id
                        },
                        client: {
                          id: coupon.client.id
                        },
                        clientPointStatusId: coupon.pointStatus.id,
                        employeeMallId: $scope.user.id,
                        lastOperation: moment().format('YYYY-MM-DD'),
                      };

                      if ( coupon.reason && coupon.reason.id ) {
                        $scope.statusUpdate.clientPointReasonId = coupon.reason.id;
                      }

                      $scope.item = coupon;
                      $scope.cliente = coupon.client;
                      //$scope.approveds = coupon;
                      $scope.updateCoupon = updateCoupon;

                      let nome = coupon.client.fullName.split(' ');
                      $scope.cliente.firstName = nome[0];
                      $scope.cliente.lastName = nome[nome.length-1];


                      $scope.getReason = function () {

                          PopUp.loading(AppConfig.messages.coupon.gettingImages);

                            Coupon.getLastApproveds(coupon.client.id, coupon.storeId).success(function (approveds) {

                                $scope.approveds = approveds;

                                for (let i =0; i < $scope.approveds.length; i++ ) {
                                  $scope.approveds[i].behaviorDate = moment($scope.approveds[i].behaviorDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
                                }

                                /*
                                if ( coupon.reason && coupon.reason.id ) {
                                  $scope.statusUpdate.clientPointReasonId = coupon.reason.id;
                                }
                                */
                                PopUp.hide();

                              }).error(function (error) {
                              PopUp.alert(AppConfig.messages.coupon.title.singular,
                                  AppConfig.messages.coupon.errorWhileGettingApproveds);
                              console.log(JSON.stringify(error));
                            });
                      };

                      $scope.getReason();

                  }]
              });

              PopUp.hide();
            }).error(function (error) {
              PopUp.alert(AppConfig.messages.coupon.title.singular,
                  AppConfig.messages.coupon.errorWhileGettingImages);
              console.log(JSON.stringify(error));
            });

        };

        $scope.getCoupons();
    }]);
