'use strict';

/* eslint-env browser */
/* global _app, moment, jQuery */

_app.controller('BabyCareController', [
    '$scope', '$route', '$q', '$location', 'BabyCare', 'ngDialog', 'PopUp',
    'AppConfig', 'Client', 'ClientMall', 'Session', 'EventBus', 'Permission',
    'Utils', 'Validations', 'CustomerView',
    function (
        $scope, $route, $q, $location, BabyCare, ngDialog, PopUp,
        AppConfig, Client, ClientMall, Session, EventBus, Permission,
        Utils, Validations, CustomerView
    ) {

        $scope.menuPermissions = Permission.menuPermissions();

        /* Pegando dados de usuário e logout de sistema */
        $scope.user = Session.get('user');
        $scope.userMalls = Session.get('malls');
        $scope.logout = function () {
            Session.setAll({});
            $location.path('/');
        };

        $scope.client = {};
        $scope.client.address = {};
        $scope.babyCare = {};

        /* Validações de campo */
        $scope.mallError = false;
        $scope.validateMall = function () {
            $scope.mallError = !$scope.babyCare.mallId;
        };

        $scope.cpfError = false;
        $scope.validateCpf = function () {
            $scope.cpfError = !$scope.client.cpf;
        };

        $scope.phoneError = false;
        $scope.validatePhone = function () {
            $scope.phoneError = !$scope.client.mobileNumber;
        };

        $scope.nameError = false;
        $scope.validateName = function () {
            $scope.nameError = !$scope.client.fullName;
        };

        $scope.zipCodeError = false;
        $scope.validateZipCode = function () {
            $scope.zipCodeError = !$scope.client.address.zipCode;
        };

        $scope.birthdayError = false;
        $scope.validateBirthday = function () {
            $scope.birthdayError = !Validations.birthday($scope.client.birthday);
        };

        $scope.babyBirthdayError = false;
        $scope.validateBabyBirthday = function () {
            $scope.babyBirthdayError = !Validations.birthday($scope.babyCare.birthday);
        };

        $scope.sexError = false;
        $scope.validateSex = function () {
          $scope.sexError = !$scope.client.sex;
        };

        $scope.babyNameError = false;
        $scope.validateBabyName = function () {
            $scope.babyNameError = !$scope.babyCare.babyName;
        };

        $scope.emailError = false;
        $scope.validateEmail = function () {
            $scope.emailError = !$scope.client.email;
        };

        $scope.firstError = false;
        $scope.validateFirst = function () {
          $scope.firstError = !$scope.babyCare.activities;
        };

        $scope.secondError = false;
        $scope.validateSecond = function () {
          $scope.secondError = !$scope.babyCare.usages;
        };

        $scope.clientTargetingName = 'Prospect'; // default
        $scope.lockedFields = true;

        /* Limpeza das sessões dos gráficos */
        sessionStorage.graphic_data = JSON.stringify({});

        /* Escopo inicial forçado para os gráficos */
        $scope.malls = [$scope.userMalls[0].id];

        $scope.controlMall = -1;
        $scope.selectedRegisterMall = false;

        $scope.offset = "month";
        $scope.clientTargetingName = 'Prospect';
        $scope.clientExist = false;
        $scope.client.clubAcceptance = false;

        $scope.choiceMall = true;

        window.addEventListener("keydown", myEventHandler, false);
        function myEventHandler(e){
            if  (e.key ==  'Escape') {
                //window.removeEventListener("keydown", myEventHandler, false);
                ngDialog.close();
            }
        };

        $scope.unlockFields = function() {
          if ($scope.babyCare.mallId) {
            $scope.choiceMall = false;
            $scope.clientTargetingName = "Prospect"
            $scope.selectedTargeting = false;
            $scope.lockedFields = true;

            $scope.client.clubAcceptance = false;
            $scope.client = {};

            $scope.babyCare.babyName = "";
            $scope.babyCare.birthday = "";
            $scope.babyCare.activities = "";
            $scope.babyCare.usages = "";
            $scope.babyCare.comment = "";
          }

        }

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
                targets: 0,
            }],
            order: [
                [0, 'desc']
            ]
        };

        $scope.loading = {
            visitsByDay: 0,
            categories: 0,
            recurrence: 0,
            visits: 0,
        };

        $scope.searchClient = function () {

            if ((!$scope.client.cpf) || ($scope.client.cpf.length !== 11)) {
              $scope.clientExist = false;

              $scope.clientTargetingName = "Prospect"
              $scope.selectedTargeting = false;
              $scope.lockedFields = true;

              $scope.client.clubAcceptance = false;
              $scope.client = {};

              $scope.babyCare.babyName = "";
              $scope.babyCare.birthday = "";
              $scope.babyCare.activities = "";
              $scope.babyCare.usages = "";
              $scope.babyCare.comment = "";
              return;
            }

            const cpf = $scope.client.cpf;

            Client.getByCPF(cpf)
            .success(function (fetchedClient) {
                $scope.unlockFields();
                if (!fetchedClient) {
                  $scope.client = {};
                  $scope.client.clubAcceptance = false;
                  $scope.clientExist = false;
                  $scope.client.cpf = cpf;
                  $scope.lockedFields = false;
                  return;
                }

                $scope.lockedFields = false;

                $scope.clientExist = true;

                $scope.selectedTargeting = false;

                // TODO: usar list.filter(conditionProcedure) pra filtrar o shopping
                // desejado pelo mallId assim como feito no controlador de detalhes
                // do client / customer (serve tanto pro lightbox no fraldário quanto sac)
                for ( var i = 0; i < fetchedClient.clientMalls.length; i++ ) {
                  if ( fetchedClient.clientMalls[i].mallId == $scope.babyCare.mallId ) {
                    $scope.selectedTargeting =  fetchedClient.clientMalls[i].targeting;
                    $scope.selectedClubAcceptance =  fetchedClient.clientMalls[i].clubAcceptance;
                  }
                }

                fetchedClient.birthday = moment(fetchedClient.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY');

                $scope.clientExist = true;
                $scope.client = fetchedClient;

                const associatedMall = $scope.client.clientMalls.filter(function (item) {
                  return Number(item.mallId) === Number($scope.babyCare.mallId);
                })[0];

                ClientMall.getClientMall(
                  $scope.client.id,
                  $scope.babyCare.mallId
                ).success(function (clientMall) {
                  if (!clientMall) {
                    $scope.clientTargetingName = 'Prospect';
                    $scope.client.clubAcceptance = false;
                    return;
                  }

                  const clubAcceptance = clientMall.clubAcceptance;
                  $scope.clientTargetingName = (associatedMall && clubAcceptance) ? associatedMall.targeting.name : 'Prospect';
                }).catch(function (reason) {
                  PopUp.alert(
                    AppConfig.messages.babyCare.title,
                    AppConfig.messages.apiGenericError,
                    function () { $route.reload(); }
                  );
                  console.log(reason);
                });
            }).error(function (error) {
                PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
                console.log(error);
            });
        };

        $scope.getActivities = function () {
            BabyCare.getActivities().success(function (items) {
                $scope.activities = items;
            }).error(function (error) {
                PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
                console.log(error);
            })
        };

        $scope.getUsages = function () {
            BabyCare.getUsages().success(function (items) {
                $scope.usages = items;
            }).error(function (error) {
                PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
                console.log(error);
            });
        };

        $scope.getActivities();
        $scope.getUsages();

        $scope.getListBabyCare = function () {
            PopUp.loading(AppConfig.messages.loading);

            BabyCare.getListBabyCare([$scope.controlMall], $scope.offset).success(function (items) {
                PopUp.hide();
                $scope.babys = items.map(function (item) {
                    item.registerDate = moment(item.registerDate, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
                    return item;
                });
            }).error(function (error) {
                PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
                console.log(error.stack);
            });
        };

        /* Registros */
        $scope.babyCare = {};
        $scope.babyCare.clientId = null;
        // $scope.babyCare.employeeMallId = 1;
        // $scope.babyCare.mallId = 1;
        $scope.babyCare.originRegistry = AppConfig.originRegistry['BABYCARE'];
        $scope.babyCare.employeeMallId = $scope.user.id;
        // $scope.babyCare.clubAcceptance = false;
        $scope.client.clubAcceptance = false;

        $scope.newClient = function () {
            PopUp.loading(AppConfig.messages.babyCare.creating);

            const client = JSON.parse(JSON.stringify($scope.client));

            client.mallId = Number($scope.babyCare.mallId);
            client.originRegistry = $scope.babyCare.originRegistry;

            Client.create(client).success(function (fetchedClient) {
                $scope.client.id = fetchedClient.id;

                if ( $scope.client.clubAcceptance ) {
                  let body = {
                    mallId: $scope.babyCare.mallId,
                    clientId: $scope.client.id,
                    clubAcceptance: $scope.client.clubAcceptance,
                    clubAcceptanceChannel: $scope.client.clubAcceptanceChannel,
                  }
                  ClientMall.sendClubAcceptance(body);
                }

                $scope.newBabyCare();
            }).error(function (error) {
                PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
                console.log(error);
            });
        };

        $scope.updateClient = function() {

          PopUp.loading(AppConfig.messages.babyCare.creating);

          $scope.client.mallId = Number($scope.babyCare.mallId);
          $scope.client.employeeId = $scope.user.id;
          $scope.client.birthday = moment($scope.client.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
          $scope.client.originRegistry = AppConfig.originRegistry['BABYCARE'];

          console.log($scope.client);

          Client.update($scope.client.id, $scope.client).success(function(fetchedClient) {

            $scope.client.id = fetchedClient.id;

            if ( $scope.client.clubAcceptance ) {
                let body = {
                    mallId: $scope.babyCare.mallId,
                    clientId: $scope.client.id,
                    clubAcceptance: $scope.client.clubAcceptance,
                    clubAcceptanceChannel: $scope.client.clubAcceptanceChannel,
                    originRegistry: AppConfig.originRegistry['BABYCARE'],
                }
                ClientMall.sendClubAcceptance(body);
            }

            $scope.newBabyCare();

          }).error(function(error) {
            PopUp.alert(AppConfig.messages.babyCare.title,
              AppConfig.messages.apiGenericError);
              console.log(error);
          });

        };

        const errorCallback = function (error) {
          PopUp.alert(AppConfig.messages.babyCare.title, AppConfig.messages.apiGenericError);
          console.log(error);
        };

        $scope.newBabyCare = function () {
            $scope.babyCare.clientId = $scope.client.id;

            const babyCare = JSON.parse(JSON.stringify($scope.babyCare));

            babyCare.mallId = Number(babyCare.mallId);

            BabyCare.create(babyCare).success(function (babycare) {
              let addActivityPromise = null;
              let addUsagePromise = null;

              if (Number($scope.babyCare.activities) === -1) {
                addActivityPromise = Promise.resolve(true);
              } else {
                addActivityPromise = Utils.promisifyRequest(
                  BabyCare.addActivityType(babycare.id, Number($scope.babyCare.activities))
                );
              }

              if (Number($scope.babyCare.usages) === -1) {
                addUsagePromise = Promise.resolve(true);
              } else {
                addUsagePromise = Utils.promisifyRequest(
                  BabyCare.addUsageType(babycare.id, Number($scope.babyCare.usages))
                );
              }

              Promise.all([ addActivityPromise, addUsagePromise ])
              .then(function () {
                PopUp.success(AppConfig.messages.babyCare.title,
                  AppConfig.messages.babyCare.success,
                  function () { $route.reload(); });
              }).catch(errorCallback);
            }).error(errorCallback);
        };

        $scope.saveBabyCare = function () {
            if ($scope.clientExist === false) {
                $scope.newClient();
            } else {
                // $scope.newBabyCare();
                $scope.updateClient();
            }
        }

        /*
         * Charts
         */

        function getVisitsByDay() {

            $scope.loading.visitsByDay = 1;

            // PopUp.loading(AppConfig.messages.loading);
            var deferred = $q.defer();

            BabyCare.getVisitsByDay($scope.malls, $scope.offset).success(function (_data) {
                $scope.loading.visitsByDay = 0;
                deferred.resolve(_data);
            }).error(function (error) {
                //            PopUp.alert(AppConfig.messages.coupon.title.plural,
                //                AppConfig.messages.coupon.errorWhileGetting);
                console.log(error.stack);
                deferred.reject(error);
            });

            return deferred.promise;

        };

        function getCategories() {

            $scope.loading.categories = 1;

            // PopUp.loading(AppConfig.messages.loading);
            var deferred = $q.defer();

            BabyCare.getCategories($scope.malls, $scope.offset).success(function (_data) {
                $scope.loading.categories = 0;
                deferred.resolve(_data);
            }).error(function (error) {
                //            PopUp.alert(AppConfig.messages.coupon.title.plural,
                //                AppConfig.messages.coupon.errorWhileGetting);
                console.log(error.stack);
                deferred.reject(error);
            });

            return deferred.promise;

        };

        function getVisits() {

            $scope.loading.visits = 1;

            // PopUp.loading(AppConfig.messages.loading);
            var deferred = $q.defer();

            BabyCare.getVisits($scope.malls, $scope.offset).success(function (_data) {

                $scope.loading.visits = 0;
                deferred.resolve(_data);

            }).error(function (error) {
                //            PopUp.alert(AppConfig.messages.coupon.title.plural,
                //                AppConfig.messages.coupon.errorWhileGetting);
                console.log(error.stack);
                deferred.reject(error);
            });

            return deferred.promise;

        };

        function getRecurrence() {

            $scope.loading.recurrence = 1;

            // PopUp.loading(AppConfig.messages.loading);
            var deferred = $q.defer();

            BabyCare.getRecurrence($scope.malls, $scope.offset).success(function (_data) {

                $scope.loading.recurrence = 0;
                deferred.resolve(_data);

            }).error(function (error) {
                //            PopUp.alert(AppConfig.messages.coupon.title.plural,
                //                AppConfig.messages.coupon.errorWhileGetting);
                console.log(error.stack);
                deferred.reject(error);
            });

            return deferred.promise;

        };

        function getConversions() {

            // PopUp.loading(AppConfig.messages.loading);
            var deferred = $q.defer();

            BabyCare.getConversions($scope.malls, $scope.offset).success(function (_data) {

                $scope.reg = _data;
                deferred.resolve(_data);

            }).error(function (error) {
                //            PopUp.alert(AppConfig.messages.coupon.title.plural,
                //                AppConfig.messages.coupon.errorWhileGetting);
                console.log(error.stack);
                deferred.reject(error);
            });

            return deferred.promise;

        };

        function getAverageConsumption() {

            // PopUp.loading(AppConfig.messages.loading);

            BabyCare.getAverageConsumption($scope.malls, $scope.offset).success(function (_data) {

                PopUp.hide();
                $scope.avg = _data;

            }).error(function (error) {
                //            PopUp.alert(AppConfig.messages.coupon.title.plural,
                //                AppConfig.messages.coupon.errorWhileGetting);
                console.log(error.stack);
            });

        };

        $scope.loadGraphics = function () {

            getVisitsByDay().then(function (_data) {
                var element = document.getElementById("visitsByDay");

                var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data.BabyCare_barchart = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = '../graph/bar-chart/bar-chart.html?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"BabyCare_barchart"}';
                //element.src = '../graph/bar-chart/bar-chart.html' + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
                console.log(error);
            });

            getCategories().then(function (_data) {
                var element = document.getElementById("categories");

                var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data.BabyCare_pie = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = '../graph/pie-chart/pie-chart.html?params={"data":"BabyCare_pie"}';
                //element.src = '../graph/pie-chart/pie-chart.html' + '?params={"data": ' + encodeURIComponent(JSON.stringify(_data)) + '}';
            }).catch(function (error) {
                console.log(error);
            });

            getVisits().then(function (_data) {
                var element = document.getElementById("visits");

                var graphic_data = JSON.parse(sessionStorage.graphic_data);
                graphic_data.BabyCare_heatmap = JSON.stringify(_data);
                sessionStorage.graphic_data = JSON.stringify(graphic_data);

                element.src = '../graph/heat-map/heat-map.html?params={"data":"BabyCare_heatmap"}';
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

            getConversions();
            getAverageConsumption();

        }

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

            // $scope.loadGraphics();
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
                    graphic.height = 450;
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
                closeByEscape: true,
                closeByDocument: true,
                controller: ['$scope', function ($scope) {
                    $scope.title = graphic.title;
                    $scope.loadDataFunction = graphic.loadDataFunction;
                    $scope.height = graphic.height;

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

        /* Dialog with Color */
        $scope.openNgDialogColor = function (graphicName) {

            var graphic = {
                title: 'Gráfico',
                loadDataFunction: null,
                height: null
            }

            switch (graphicName) {
                case 'visitsByDay':
                    graphic.title = "Atendimentos por período";
                    graphic.graphicUrl = '../graph/bar-chart/bar-chart.html';
                    graphic.loadDataFunction = getVisitsByDay;
                    graphic.height = 600;
                    break;
                default:
                    alert("No suitable graphic found!");
            };


            ngDialog.open({
                template: 'partials/lightbox/default-chart.html',
                closeByEscape: true,
                closeByDocument: true,
                controller: ['$scope', 'BabyCare', function ($scope, BabyCare) {
                    $scope.title = graphic.title;
                    $scope.loadDataFunction = graphic.loadDataFunction;
                    $scope.height = graphic.height;

                    $scope.loadGraphic = function () {
                        console.log(document.getElementById("graphic"));

                        $scope.loadDataFunction().then(function (_data) {
                            var element = document.getElementById("graphic");

                            var graphic_data = JSON.parse(sessionStorage.graphic_data);
                            graphic_data.BabyCare_lightbox = JSON.stringify(_data);
                            sessionStorage.graphic_data = JSON.stringify(graphic_data);

                            element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":"BabyCare_lightbox"}';
                            //element.src = graphic.graphicUrl + '?params={"config":' + encodeURIComponent('{"color":"#a24a48"}') + ',"data":' + encodeURIComponent(JSON.stringify(_data)) + '}';
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


        // LIGHTBOX DETAILING BABYCARE

        $scope.openDetailingBabyCare = function (customerData) {
          PopUp.loading('Carregando detalhes...');
          BabyCare.getById(customerData.id).success(function (babycare) {
            customerData.babycareActivities = babycare.activities;
            customerData.babycareUsages = babycare.usages;

            Client.getByCPF(customerData.client.cpf).success(function (client) {
              customerData.client.address = client.address;
              customerData.client.clientMalls = client.clientMalls;

              ClientMall.getClientMall(
                customerData.clientId,
                customerData.mallId
              ).success(function (clientMall) {
                customerData.client.clientMall = clientMall;

                $scope.parentController = 'BABYCARE';
                $scope.customerData = customerData;

                PopUp.hide();

                ngDialog.open({
                    template: 'partials/lightbox/detailing-babycare.html',
                    controller: 'CustomerDetailsController',
                    scope: $scope
                });
              }).error(function (reason) {
                console.log(`Could not get client mall relation! ${reason.toString()}`);
              });
            }).error(function (reason) {
              console.log(`Could not get client address! ${reason.toString()}`);
            });
          }).error(function (reason) {
            console.log(`Could not get babycare visit details! ${reason.toString()}`);
          });
        }

        $scope.openEditClient = function (clientId){
            ngDialog.open({
              template: 'partials/lightbox/edit-client.html',
              closeByEscape: true,
              closeByDocument: true,
              controller: ['$scope', 'BabyCare', function ($scope, BabyCare) {

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



        /* gambiarra não mais necessária??
        setTimeout(function () {
          document.getElementById('babycare-search-button').click();
        }, 1000);

        setTimeout(function () {
          document.getElementById('babycare-search-button').click();
        }, 2000);

        setTimeout(function () {
          document.getElementById('babycare-search-button').click();
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

    }
]);
