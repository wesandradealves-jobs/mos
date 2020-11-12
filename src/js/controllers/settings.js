'use strict';

/* global _app */
/* eslint-env browser */
/* eslint
  semi: off */

//import { constants } from "perf_hooks";

_app.controller('SettingsController', [
  '$scope', '$route', 'ngDialog', 'PopUp', 'AppConfig', 'Session',
  'DTOptionsBuilder', 'Settings', '$location', '$timeout', 'Permission',
  function ($scope, $route, ngDialog, PopUp, AppConfig, Session,
    DTOptionsBuilder, Settings, $location, $timeout, Permission) {
    // Pegando dados de usuário e lougout de sistema
    $scope.user = Session.get('user');
    $scope.userMalls = Session.get('malls');
    $scope.menuPermissions = Permission.menuPermissions();
    // $scope.malls = Session.get('malls');
    // $scope.user = Session.get('user');

    $scope.logout = function () {
      Session.setAll({});
      $location.path('/');
    };

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

    $scope.malls = [$scope.userMalls[0].id];

    // --- variables ------------------------------------------------
    $scope.clearStore = function () {
      $scope.store = {
      "activities": [],
      "mccActivityId": 0,
      "uploadedLogo": "",
      "cnpj": "",
      "name": "",
      "legalName": "",
      "standNumber": "",
      "type": "",
      "contactName": "",
      "contactPhone": "",
      "email": "",
      "location": "",
      "receberCurriculo": false,
      "emBreve": false,
      "url": "",
      "facebook": "",
      "instagram": "",
      "title": "",
      "description": "",
      "phones": []
      };

      $scope.activitiesFromSegment = {};
    };

    $scope.segmentMall = '-1';
    $scope.mallSegments = [];
    $scope.employees = [];
    $scope.tabPermissionsRoles = [];

    $scope.clearStore();
    $scope.segments = {};
    $scope.chosenSegment = {};
    $scope.activitiesFromSegment = {};
    $scope.chosenActivities = {};
    $scope.chosenActivitiesIds = {};

    $scope.tabStores = {
      mallId: null,
      stores: [],
    };

    $scope.tabPermissions = {
      mallId: null,
      permissions: [],
      newRolePermissions: [],
    };

    // --- get functions ------------------------------------------------

    Settings.getSegments().success(function(_segments) {
      $scope.segments = _segments;
    }).error(function (error) {
      console.log(error);
      PopUp.alert(AppConfig.messages.settings.role.title,
        AppConfig.messages.apiGenericError);
    });

    $scope.getSubsegmentsFromSegment = function (segmentId) {
      segmentId = parseInt(segmentId);
      const segment = $scope.segments.filter(function (segment) {
        if (segment.id === segmentId) {
          return segment;
        }
      });

      $scope.activitiesFromSegment = segment[0].activities;
    }

    $scope.listMallSegments = function () {
      PopUp.loading(AppConfig.messages.loading);
      Settings.getSegmentsByMall($scope.segmentMall.toString()).success(function (result) {
        $scope.mallSegments = result;

        setTimeout(function () { PopUp.hide(); }, 1000);
      }).error(function (error) {
        console.log(error);
        PopUp.alert(AppConfig.messages.settings.stores.title,
          AppConfig.messages.apiGenericError);
      });
    };

     // Precarregar as Permissões
     Settings.getPermissions().success(function (_permissions) {

      $scope.tabPermissions.permissions = _permissions;

    }).error(function (error) {
      console.log(error);
      PopUp.alert(AppConfig.messages.settings.role.title,
        AppConfig.messages.apiGenericError);
    });

    function listStores(mallId, onSuccess, onFailure) {

      PopUp.loading(AppConfig.messages.loading);

      Settings.getStoresByMall(mallId).success(function (stores) {
        $scope.tabStores.stores = stores;
        PopUp.hide();

        if (onSuccess) {
          onSuccess(stores);
        }
      }).error(function (error) {
        console.log(error);
        PopUp.alert(AppConfig.messages.settings.stores.title,
          AppConfig.messages.apiGenericError);

        if (onFailure) {
          onFailure(error);
        }
      });

    }

    function listRoles(mallId, onSuccess, onFailure) {

      PopUp.loading(AppConfig.messages.loading);

      Settings.getRolesByMall(mallId).success(function (roles) {
        $scope.tabPermissionsRoles = roles;
        PopUp.hide();

        if (onSuccess) {
          onSuccess(roles);
        }
      }).error(function (error) {
        console.error(error);
        PopUp.alert(AppConfig.messages.settings.role.title,
          AppConfig.messages.apiGenericError);
        if (onFailure) {
          onFailure(error);
        }
      });

    };

    $scope.tabStoreSelectMall = function (onSuccess, onFailure) {
      listStores($scope.tabStores.mallId, onSuccess, onFailure);
    };

    $scope.tabPermissionsSelectMall = function (onSuccess, onFailure) {
      listRoles($scope.tabPermissions.mallId, onSuccess, onFailure);
    };

    $scope.formatFuncionalities = function(role) {
      var result = "";

      for (let i=0; i < role.mallRolePermissions.length; i++) {
        result += role.mallRolePermissions[i].name + ", ";
      }

      return result;
    }

    $scope.getEmployeeList = function (onSuccess, onFailure) {
      PopUp.loading(AppConfig.messages.loading);

      Settings.getEmployeeMall($scope.tabEmployees.mallId).success(function (items) {
        PopUp.hide();
        $scope.employees = items;

        if (onSuccess) {
          return onSuccess(items);
        }
      }).error(function (error) {
        PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
        console.log(error.stack);

        if (onFailure) {
          onFailure(error);
        }
      });
    };




    // --- open functions ------------------------------------------------

    $scope.openStoreRegistration = function (id) {
      const $parentScope = $scope;

      ngDialog.open({
        template: 'partials/lightbox/register-store.html',
        scope: $scope,
        controller: ['$scope', function ($scope) {
          $scope.clearStore();
          $scope.store = $scope.selectedStore || {};
          $scope.store.mallId = id;
          $scope.formatedMccActivities = $scope.tabStores.formatedMccActivities;
          $scope.store.phones = [];

          $scope.mallError = false;
          $scope.validateMall = function () {
            $scope.mallError = !$scope.store.mallId;
          };

          $scope.nameError = false;
          $scope.validateName = function () {
            $scope.nameError = !$scope.store.name;
          };

          $scope.legalNameError = false;
          $scope.validateLegalName = function () {
            $scope.legalNameError = !$scope.store.legalName;
          };

          $scope.phone1error = false;
          $scope.validateStorePhone1 = function () {
            $scope.phone1error = !$scope.store.phones[0];
          };

          $scope.cnpjError = false;
          $scope.validateCNPJ = function () {
            $scope.cnpjError = !$scope.store.cnpj;
          };

          $scope.mccError = false;
          $scope.validateMcc = function () {
            $scope.mccError = !$scope.store.mccActivityId;
          };

          $scope.contactNameError = false;
          $scope.validateContactName = function () {
            $scope.contactNameError = !$scope.store.contactName;
          };

          $scope.contactPhoneError = false;
          $scope.validateContactPhone = function () {
            $scope.contactPhoneError = !$scope.store.contactPhone;
          };

          $scope.emailError = false;
          $scope.validateEmail = function () {
            $scope.emailError = !$scope.store.email;
          };

          $scope.selectSoon = function () {
            $scope.store.emBreve = !$scope.store.emBreve;
          }

          $scope.file_changed = function (element) {
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

                $scope.store.uploadedLogo = reader.result;
                $scope.store.logo = reader.result;
              });
            }
            reader.readAsDataURL(dataFile);
          }

          $scope.newStore = function () {

            $scope.store.activities = $scope.chosenActivities.map(activity => activity.id);
            $scope.store.mccActivityId = $scope.store.activities[0];

            PopUp.loading(AppConfig.messages.settings.stores.creating);

            $scope.store.employeeRegisterId = $scope.user.id;

            Settings.createStore($scope.store).success(function () {
              const onSuccess = function () {
                PopUp.hide();
                ngDialog.closeAll();
              };
              const onFailure = onSuccess;

              $parentScope.tabStoreSelectMall(onSuccess, onFailure);
            }).error(function (error) {
                PopUp.alert(AppConfig.messages.settings.stores.title, AppConfig.messages.apiGenericError);
            });
        }
      }]
      });
    }

    // LIGHTBOX EDIT SEGMENT
    $scope.editMallSegments = function () {
      const dialogOptions = {
        scope: $scope,
        template: 'partials/lightbox/edit-segment.html',
        controller: 'EditSegmentsController',
        cache: false
      };

      $scope.segments = $scope.mallSegments; // JSON.parse(JSON.stringify($scope.mallSegments));

      const dialog = ngDialog.open(dialogOptions);

      dialog.closePromise.then(function (data) {
        console.log(data.value);

        if (
          data.value !== '$escape' ||
          data.value !== '$closeButton' ||
          data.value !== '$document'
        ) {
          Settings.setSegments(data.value).success(function () {
            $scope.listMallSegments();
          }).error(function (reason) {
            PopUp.alert(
              AppConfig.messages.settings.segment.title,
              AppConfig.messages.apiGenericError
            );
            console.log(reason);
          });
        }
      });
    };

    $scope.openMalls = function (malls) {
      PopUp.loading(AppConfig.messages.loading);

      ngDialog.open({
        template: 'partials/lightbox/malls.html',
        controller: ['$scope', 'Session', 'PopUp', function ($scope, Session, PopUp) {
          PopUp.hide();
          $scope.user = Session.get('user');
          $scope.selectedMalls = [];
          $scope.selectedMalls = malls;

          $scope.selecionarTodos = function () {
            for (var i = 0; i < $scope.user.malls.length; i++) {
              if ($scope.inputAll) {
                $scope.selectedMalls[i] = $scope.user.malls[i].id;
              } else {
                $scope.selectedMalls[i] = false;
              }
            }
          };

          $scope.saveMalls = function () {

            var malls = [];
            for (var i = 0; i < $scope.selectedMalls.length; i++) {
              if ($scope.selectedMalls[i]) {
                malls.push($scope.selectedMalls[i]);
              }
            }

            if (!malls.length) {
              PopUp.alert("Selecionar Shoppings", "Favor selecionar um shopping!");
              return;
            }

            updateSelectedMalls(malls);

            ngDialog.closeAll();
          }

        }]
      });

    };



    // LIGHTBOX EDIT STORE
    $scope.openEditStore = function (id) {
      const $parentScope = $scope;

      ngDialog.open({
        template: 'partials/lightbox/edit-store.html',
        scope: $scope,
        controller: ['$scope', 'Session',
          function ($scope, Session) {
            $scope.clearStore();

          $scope.nameError = false;
          $scope.validateName = function () {
            $scope.nameError = !$scope.store.name;
          };

          $scope.legalNameError = false;
          $scope.validateLegalName = function () {
            $scope.legalNameError = !$scope.store.legalName;
          };

          $scope.cnpjError = false;
          $scope.validateCNPJ = function () {
            $scope.cnpjError = !$scope.store.cnpj;
          };

          $scope.phone1error = false;
          $scope.validateStorePhone1 = function () {
            $scope.phone1error = !$scope.store.phones[0];
          };

          $scope.mccError = false;
          $scope.validateMcc = function () {
            $scope.mccError = !$scope.store.mccActivityId;
          };

          $scope.contactNameError = false;
          $scope.validateContactName = function () {
            $scope.contactNameError = !$scope.store.contactName;
          };

          $scope.contactPhoneError = false;
          $scope.validateContactPhone = function () {
            $scope.contactPhoneError = !$scope.store.contactPhone;
          };

          $scope.emailError = false;
          $scope.validateEmail = function () {
            $scope.emailError = !$scope.store.email;
          };

          $scope.selectSoon = function () {
            $scope.store.emBreve = !$scope.store.emBreve;
          }

          $scope.user = Session.get('user');
          $scope.store = {};


          $scope.update = function() {
            PopUp.loading(AppConfig.messages.loading);

            $scope.store.employeeUpdateId = $scope.user.id;
            $scope.store.activities = $scope.chosenActivities.map(activity => activity.id);
            $scope.store.mccActivityId = $scope.store.activities[0];


            Settings.updateStore($scope.store.id, $scope.store).success(function() {
              const onSuccess = function () {
                PopUp.hide();
                ngDialog.closeAll();
              };
              const onFailure = onSuccess;

              $parentScope.tabStoreSelectMall(onSuccess, onFailure);
            }).error(function(error) {
              console.log(error);
              PopUp.alert(AppConfig.messages.settings.stores.title, AppConfig.messages.apiGenericError);
                console.log(JSON.stringify(error));
            });
          };

          $scope.getStore = function () {
            PopUp.loading(AppConfig.messages.loading);

            Settings.getStore(id).success(function (item) {
              PopUp.hide();
              $scope.store = item;
              (!$scope.store.type) ? $scope.store.type = "loja" : undefined;

              let activities = $scope.store.activities;
              $scope.store.activities = activities[0].mccSegment;
              $scope.chosenSegment = $scope.store.activities;
              $scope.chosenSegmentId = $scope.store.activities.id;

              $scope.getSubsegmentsFromSegment($scope.chosenSegmentId);

              if (!Array.isArray($scope.store.phones)) {
                let phones = $scope.store.phones;
                $scope.store.phones = [];
                for (let i=0; i<$scope.store.phones.length; i++) {
                  $scope.store.phones[i] = phones[i];
                }
              }


              $scope.chosenActivities = [];
              let j = 0;
              for (let i=0; i<$scope.activitiesFromSegment.length; i++) {
                for (let k=0; k<activities.length; k++) {
                  if ($scope.activitiesFromSegment[i].id === activities[k].id) {
                    $scope.chosenActivities[j] = $scope.activitiesFromSegment[i];
                    j++;
                  }
                }
              }


            }).error(function (error) {
                PopUp.alert(AppConfig.messages.settings.stores.title, AppConfig.messages.apiGenericError);
                console.log(error.stack);
            });
          };

          $scope.getStore();


          $scope.file_changed = function (element) {
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

                $scope.store.uploadedLogo = reader.result;
                $scope.store.logo = reader.result;

              });
            };
            reader.readAsDataURL(dataFile);
          };
          }
        ]
      });
    };

    // LIGHTBOX EDIT ROLE
    $scope.openRoles = function (role) {
      // $scope.tabPermissions.selectedRole = role;
      // console.log(role);

      const $parentScope = $scope;

      ngDialog.open({
        template: 'partials/lightbox/roles.html',
        scope: $scope,
        controller: ['$scope',
          function ($scope) {

            $scope.permissions = $scope.tabPermissions.permissions;
            $scope.role = role; //$scope.tabPermissions.selectedRole;
            $scope.selectedPermissions = [];

            $scope.avaliablePermissions = [];

            if ( !role ){
              $scope.role = {};
              $scope.role.mallId = $scope.tabPermissions.mallId;
            }

            for (let i=0; i < $scope.userMalls.length; i++) {
              if ( $scope.userMalls[i].id == $scope.tabPermissions.mallId) {
                $scope.avaliablePermissions = $scope.userMalls[i].role.permissions;
                break;
              }
            }

            if ( role && role.id ) {
              for ( let i=0; i < role.mallRolePermissions.length; i++ ) {
                $scope.selectedPermissions[ role.mallRolePermissions[i].id ] = role.mallRolePermissions[i].id;
              }
            }

            $scope.permisisonSelected = function(permissionId) {

              if (!role)
                return false;

              for ( let i = 0; i < $scope.role.mallRolePermissions.length; i++ ) {
                if ( $scope.role.mallRolePermissions[i].id == permissionId )
                  return true;
              }

              return false;
            };

            $scope.saveRole = function() {

              $scope.role.mallRolePermissions = [];
              let count = 0;
              for (let i = 0; i < $scope.selectedPermissions.length; i++) {
                if ( $scope.selectedPermissions[i] ) {
                  $scope.role.mallRolePermissions[count] = { id: $scope.selectedPermissions[i] };
                  count++;
                }
              }

              PopUp.loading(AppConfig.messages.loading);

              // == UPDATE ==
              if ( role && role.id ) {
                Settings.updateRole(role.id, $scope.role).success(function (role) {
                  const onSuccess = function () {
                    PopUp.hide();
                    ngDialog.closeAll();
                  };
                  const onFailure = onSuccess;
                  $parentScope.tabPermissionsSelectMall(onSuccess, onFailure);
                }).error(function (error) {
                  PopUp.alert(AppConfig.messages.settings.role.title,
                    AppConfig.messages.apiGenericError);
                });
              // == NEW ==
              } else {
                Settings.createRole($scope.role).success(function (role) {
                  const onSuccess = function () {
                    PopUp.hide();
                    ngDialog.closeAll();
                  };
                  const onFailure = onSuccess;
                  $parentScope.tabPermissionsSelectMall(onSuccess, onFailure);
                }).error(function (error) {
                  PopUp.alert(AppConfig.messages.settings.role.title,
                    AppConfig.messages.apiGenericError);
                });
              }
            }
          }
        ]
      });
    }


    // LIGHTBOX  INSERT CPF
    $scope.openIncludeCpf = function () {
      ngDialog.open({
        template: 'partials/lightbox/include-cpf.html',
        controller: ['$scope', 'Upload',
          function ($scope, Upload) {

            $scope.store = {};

            var self = this;
            $scope.busy = true;
            $scope.ready = false;

            $scope.files = [];

            $scope.$watch('files', function () {
              $scope.upload($scope.files);
            });

            $scope.upload = function (files) {
              // $log.debug("upload... ", files);

              if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                  var file = files[i];
                  Upload.upload({
                    url: '/admin-api/files/upload',
                    fields: {
                      'filecontext': 'product',
                    },
                    file: file
                  }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $log.debug('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                  }).success(function (data, status, headers, config) {
                    $log.debug('file ' + config.file.name + 'uploaded. Response: ' + data);
                  });
                }
              }
            };

                      }
        ]
      })
    }

    // LIGHTBOX INCLUDE SEGMENT
    $scope.openIncludeSegment = function () {
      ngDialog.open({
        template: 'partials/lightbox/include-segment.html',
        controller: ['$scope',
          function ($scope) {

            $scope.store = {};

          }
        ]
      })
    }

    // LIGHTBOX EDIT USER
    $scope.openEditUser = function (id, mallId) {
      const $parentScope = $scope;
      ngDialog.open({
        template: 'partials/lightbox/edit-user.html',
        controller: ['$scope',
          function ($scope) {

            $scope.nameError = false;
            $scope.validateName = function () {
              $scope.nameError = !$scope.employee.name;
            };

            $scope.areaError = false;
            $scope.validateArea = function () {
              $scope.areaError = !$scope.employee.area;
            };

            $scope.cpfError = false;
            $scope.validateCpf = function () {
              $scope.cpfError = !$scope.employee.cpf;
            };

            $scope.phoneError = false;
            $scope.validatePhone = function () {
              $scope.phoneError = !$scope.employee.phone;
            };

            $scope.emailError = false;
            $scope.validateEmail = function () {
              $scope.emailError = !$scope.employee.email;
            };

            $scope.confirmPassword = function () {
              if (($scope.employee.confirmPassword || $scope.employee.password) && $scope.employee.confirmPassword != $scope.employee.password) {
                PopUp.alert(AppConfig.messages.settings.employee.title, "As senhas devem ser iguais!")
              }
            }

            $scope.update = function() {
              PopUp.loading(AppConfig.messages.loading);

              $scope.employee.mallRoles = [{
                mallId: mallId,
                roleId: $scope.employee.roleId
              }];

              if (!$scope.employee.password) {
                delete $scope.employee.password;
              }

              Settings.updateEmployee($scope.employee.id, $scope.employee).success(function () {
                const onSuccess = function () {
                  PopUp.hide();
                  ngDialog.closeAll();
                };
                const onFailure = onSuccess;
                $parentScope.getEmployeeList(onSuccess, onFailure);
              }).error(function (error) {
                PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
                console.log(error);
              });
            };

            $scope.getListRole = function () {
              PopUp.loading(AppConfig.messages.loading);

              Settings.getRolesByMall(mallId).success(function (fetchedRoles) {
                PopUp.hide();
                $scope.roles = fetchedRoles;
              }).error(function (error) {
                  PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
                  console.log(error);
              });
            };

            $scope.getEmployee = function () {
              PopUp.loading(AppConfig.messages.loading);

              Settings.getEmployee(id).success(function (item) {
                PopUp.hide();
                $scope.employee = item;
                $scope.employee.roleId = $scope.employee.employeeMallRelations[0].roleId;
              }).error(function (error) {
                  PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
                  console.log(error.stack);
              });
            };

            $scope.getListRole();
            $scope.getEmployee();
          }
        ]
      });
    };

    // LIGHTBOX REGISTER USER
    $scope.openRegisterUser = function (id) {
      ngDialog.open({
        template: 'partials/lightbox/register-user.html',
        controller: ['$scope', 'Session', 'Settings',
          function ($scope, Session, Settings) {

            $scope.nameError = false;
            $scope.validateName = function () {
              $scope.nameError = !$scope.employee.name;
            };

            $scope.areaError = false;
            $scope.validateArea = function () {
              $scope.areaError = !$scope.employee.area;
            };

            $scope.cpfError = false;
            $scope.validateCpf = function () {
              $scope.cpfError = !$scope.employee.cpf;
            };

            $scope.phoneError = false;
            $scope.validatePhone = function () {
              $scope.phoneError = !$scope.employee.phone;
            };

            $scope.emailError = false;
            $scope.validateEmail = function () {
              $scope.emailError = !$scope.employee.email;
            };

            $scope.passwordError = false;
            $scope.validatePassword = function () {
              $scope.passwordError = !$scope.employee.password;
            };

            $scope.confirmPasswordError = false;
            $scope.validateConfirmPassword = function () {
              $scope.confirmPasswordError = !$scope.employee.confirmPassword;
            };

            $scope.mallError = false;
            $scope.validateMall = function () {
              $scope.mallError = !$scope.employee.mallId;
            };

            $scope.roleError = false;
            $scope.validateRole = function () {
              $scope.roleError = !$scope.employee.roleId;
            };

            $scope.confirmPassword = function () {
              if (($scope.employee.confirmPassword || $scope.employee.password) && $scope.employee.confirmPassword != $scope.employee.password) {
                PopUp.alert(AppConfig.messages.settings.employee.title, "As senhas devem ser iguais!")
              }
            }

            $scope.userMalls = Session.get('malls');
            $scope.employee = {};
            $scope.employee.mallId = id;

            $scope.newEmployee = function () {
              PopUp.loading(AppConfig.messages.settings.employee.creating);

              $scope.employee.mallRoles = [{
                mallId: $scope.employee.mallId,
                roleId: $scope.employee.roleId
              }]

              Settings.createEmployee($scope.employee).success(function () {
                PopUp.hide();
                ngDialog.closeAll();
                $scope.getEmployeeList();
              }).error(function (error) {
                  PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
                  console.log(error);
              });
            };

            $scope.getListRole = function () {
              PopUp.loading(AppConfig.messages.loading);

              Settings.getRolesByMall($scope.employee.mallId).success(function (fetchedRoles) {
                PopUp.hide();
                $scope.roles = fetchedRoles;
              }).error(function (error) {
                  // PopUp.alert(AppConfig.messages.settings.employee.title, AppConfig.messages.apiGenericError);
                  PopUp.hide();
                  console.log(error);
              });
            };

            $scope.getListRole();
          }
        ]
      });
    };

    // CONFIRM DELETE SEGMENT
    $scope.confirmDelete = function () {
      PopUp.confirm(AppConfig.messages.settings.segment.deleteMsgTitle, AppConfig.messages.settings.deleteMsg, (resp) => {
        if (resp) {

          PopUp.loading("Excluindo segmento ...");

          // Exclui segmento. ...

          setTimeout(function () {
            PopUp.hide();
          }, 1000 * 3);
        }
      });
    }

    // CONFIRM DELETE ROLE
    $scope.confirmDeleteRole = function (role) {
      PopUp.confirm(AppConfig.messages.settings.role.deleteMsgTitle, AppConfig.messages.settings.deleteMsg, (resp) => {
        if (resp) {

          PopUp.loading("Excluindo Papel ...");

          // Exclui Papel. ...
          Settings.deleteRole(role.id).success(function () {
            $scope.tabPermissionsSelectMall();
            PopUp.hide();
            ngDialog.closeAll();
          }).error(function (error) {
            PopUp.alert(AppConfig.messages.settings.role.title,
              'Não é possível excluir papeis que possuam funcionários associados!');
          });
        }
      });
    }

    // CONFIRM DELETE A CPF
    $scope.confirmDeleteCpf = function () {
      PopUp.confirm(AppConfig.messages.settings.userControlDelete.deleteMsgTitle, AppConfig.messages.settings.userControlDelete.deleteMsg, (resp) => {
        if (resp) {

          PopUp.loading("Excluindo CPF ...");

          // Exclui segmento. ...

          setTimeout(function () {
            PopUp.hide();
          }, 1000 * 3);
        }
      });
    }


    // CONFIRM DELETE ALL CPF'S
    $scope.confirmDeleteAll = function () {
      PopUp.confirm(AppConfig.messages.settings.userControl.deleteMsgTitle, AppConfig.messages.settings.userControl.deleteMsg, (resp) => {
        if (resp) {

          PopUp.loading("Excluindo todos os cpf's ...");

          // Exclui segmento. ...

          setTimeout(function () {
            PopUp.hide();
          }, 1000 * 3);
        }
      });
    }



    if ($scope.menuPermissions['SETTINGS-STORES']) {
      $scope.defaultTab = 'stores';
    } else if ($scope.menuPermissions['SETTINGS-TARGETINGS']) {
      $scope.defaultTab = 'club';
    } else if ($scope.menuPermissions['CREATE-USER']) {
      $scope.defaultTab = 'operators';
    } else if ($scope.menuPermissions['CREATE-ROLES']) {
      $scope.defaultTab = 'permission';
    } else {
      $scope.defaultTab = '(none)';
    }

    $scope.currentTab = null;
    $scope.switchToTab = function (tabName) {
      if (tabName === $scope.currentTab) {
        return;
      }

      switch (tabName) {
        case 'stores':
          $scope.tabStoreSelectMall();
          break;
        case 'club':
          $scope.listMallSegments();
          break;
        case 'operators':
          $scope.getEmployeeList();
          break;
        case 'permission':
          $scope.tabPermissionsSelectMall();
          break;
        default:
          throw Error('Could not match tab name: ' + tabName.toString());
      }

      $scope.currentTab = tabName;
    };

    // $timeout waits until whole component renders...
    $timeout(function () {
      $scope.switchToTab($scope.defaultTab);
    }, 500);
  }
]);
