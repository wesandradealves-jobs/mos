'use strict';

/* eslint-env browser */
/* global _app */
/* eslint
  vars-on-top: off,
  no-underscore-dangle: off,
  space-in-parens: off,
  no-useless-return: off,
  no-var: off */

var __login_bounce_timing = 0;

_app.controller('LoginController', ['$scope', '$location', 'Login', 'PopUp', 'AppConfig', 'Session', 'Permission',
  function($scope, $location, Login, PopUp, AppConfig, Session, Permission) {

  $scope.login = {};

  $scope.enterLogin = function() {
    PopUp.loading(AppConfig.messages.login.validating);

    Login.validate($scope.login).success(function(user) {

      const now = Math.ceil((new Date()).getTime());

      if ((now - __login_bounce_timing) <= 1000) {
        console.log('Triggered bouncing for login...');
        return;
      }

      __login_bounce_timing = now;

      sessionStorage.graphic_data = JSON.stringify({});

      Session.set('user', user);

      const menuPermissions = Permission.menuPermissions();

      Session.set('menuPermissions', menuPermissions);

      var malls = [];
      for ( var i = 0; i < user.malls.length; i += 1 ) {
        malls.push( user.malls[i] );
      }

      Session.set('malls', malls);

      function sendCredentialsIframe() {
        const iframe = document.getElementById('register-session')
        const data = sessionStorage.getItem('sessionSpot')
        if(iframe && data) {
          console.log('REGISTRANDO SESSÃO NO MOS2');
          console.log(data);
          var iframeEvent = new Event('message')
          iframe.contentWindow.postMessage({
            action: 'save',
            key: 'sessionSpot',
            value: data
          }, "*")
        }
      }

      sendCredentialsIframe();

      PopUp.hide();

      function chosepath() {
          if ( menuPermissions['ACCESS-INMALVIEW'] ) {
            $location.path('/inMallView');
            return;
          }

          if ( menuPermissions['ACCESS-CUSTOMERVIEW'] ) {
            $location.path('/customerView');
            return;
          }

          if ( menuPermissions['ACCESS-FLASH'] ) {
            $location.path('/flash');
            return;
          }

          if ( menuPermissions['ACCESS-CAMPAIGN'] ) {
            $location.path('/campaign');
            return;
          }

          if (menuPermissions['ACCESS-PROMOTIONS']) {
            $location.path('/promocoes');
            return;
          }

          if ( menuPermissions['ACCESS-CUSTOMERSERVICE'] ) {
            $location.path('/customerService');
            return;
          }

          if ( menuPermissions['ACCESS-BABYCARE'] ) {
            $location.path('/babyCare');
            return;
          }

          if ( menuPermissions['ACCESS-VIPROOM'] ) {
            $location.path('/vipLounge');
            return;
          }

          if ( menuPermissions['ACCESS-CUPONS'] ) {
            $location.path('/cupons');
            return;
          }

          if ( menuPermissions['ACCESS-INSTOREVIEW'] ) {
            $location.path('/instoreView');
            return;
          }
      }

      chosepath();

      //$location.path('/inMallView');

    }).error(function(error) {
        PopUp.alert(AppConfig.messages.login.validating, AppConfig.messages.login.invalidData);
        console.log(error.stack);
        loginSuccess = false;
    });

  };

}]);

/*
{
    "id": 1,
    "registerDate": "2018-10-03 17:35:24",
    "name": "Administrador",
    "cpf": "00000000000",
    "email": "admin@cariocashopping.com.br",
    "area": "Presidente",
    "malls": [
        {
            "id": 1,
            "name": "Carioca Shopping",
            "logo": "",
            "alternativeLogo": "",
            "roleId": 1,
            "role": {
                "id": 1,
                "name": "Administrador",
                "permissions": [
                    {
                        "id": 1,
                        "code": "CREATE-ROLES",
                        "name": "Criar novos papéis de usuários"
                    },
                    {
                        "id": 2,
                        "code": "CREATE-USER",
                        "name": "Criar novos usuários"
                    },
                    {
                        "id": 3,
                        "code": "ACCESS-INMALVIEW",
                        "name": "Visualizar área InMall View"
                    },
                    {
                        "id": 4,
                        "code": "ACCESS-CUSTOMERVIEW",
                        "name": "Vizualizar área Customer View"
                    },
                    {
                        "id": 5,
                        "code": "ACCESS-FLASH",
                        "name": "Vizualizar área de Flashs"
                    },
                    {
                        "id": 6,
                        "code": "CREATE-FLASH",
                        "name": "Criar novos flashs"
                    },
                    {
                        "id": 7,
                        "code": "REPORT-FLASH",
                        "name": "Vizualizar relatórios de Flash"
                    },
                    {
                        "id": 8,
                        "code": "LIST-FLASH",
                        "name": "Listar Flash"
                    },
                    {
                        "id": 9,
                        "code": "PUBLISH-FLASH",
                        "name": "Publicar Flash"
                    },
                    {
                        "id": 10,
                        "code": "ACCESS-CUSTOMERSERVICE",
                        "name": "Vizualizar área de SAC"
                    },
                    {
                        "id": 11,
                        "code": "CREATE-CUSTOMERSERVICE",
                        "name": "Registrar nova entrada do SAC"
                    },
                    {
                        "id": 12,
                        "code": "REPORT-CUSTOMERSERVICE",
                        "name": "Vizualizar relatórios de SAC"
                    },
                    {
                        "id": 13,
                        "code": "LIST-CUSTOMERSERVICE",
                        "name": "Listar SAC"
                    },
                    {
                        "id": 14,
                        "code": "ACCESS-BABYCARE",
                        "name": "Vizualizar área de Fraldário"
                    },
                    {
                        "id": 15,
                        "code": "CREATE-BABYCARE",
                        "name": "Registrar nova entrada no Fraldário"
                    },
                    {
                        "id": 16,
                        "code": "REPORT-BABYCARE",
                        "name": "Vizualizar relatórios de Fraldário"
                    },
                    {
                        "id": 17,
                        "code": "LIST-BABYCARE",
                        "name": "Listar Fraldário"
                    },
                    {
                        "id": 18,
                        "code": "ACCESS-VIPROOM",
                        "name": "Vizualizar área de Sala Vip"
                    },
                    {
                        "id": 19,
                        "code": "CREATE-VIPROOM",
                        "name": "Registrar nova entrada na Sala Vip"
                    },
                    {
                        "id": 20,
                        "code": "REPORT-VIPROOM",
                        "name": "Vizualizar relatórios de Sala Vip"
                    },
                    {
                        "id": 21,
                        "code": "LIST-VIPROOM",
                        "name": "Listar Sala Vip"
                    },
                    {
                        "id": 22,
                        "code": "ACCESS-CAMPAIGN",
                        "name": "Vizualizar área de Camapnhas"
                    },
                    {
                        "id": 23,
                        "code": "CREATE-CAMPAIGN",
                        "name": "Criar novas Camapnhas"
                    },
                    {
                        "id": 24,
                        "code": "REPORT-CAMPAIGN",
                        "name": "Vizualizar relatórios de Camapnhas"
                    },
                    {
                        "id": 25,
                        "code": "LIST-CAMPAIGN",
                        "name": "Listar Camapnhas"
                    },
                    {
                        "id": 26,
                        "code": "PUBLISH-CAMPAIGN",
                        "name": "Publicar Camapnha"
                    }
                ]
            }
        },
        {
            "id": 2,
            "name": "Pátio Alcântara",
            "logo": "",
            "alternativeLogo": "",
            "roleId": 9,
            "role": {
                "id": 9,
                "name": "Administrador",
                "permissions": [
                    {
                        "id": 1,
                        "code": "CREATE-ROLES",
                        "name": "Criar novos papéis de usuários"
                    },
                    {
                        "id": 2,
                        "code": "CREATE-USER",
                        "name": "Criar novos usuários"
                    },
                    {
                        "id": 3,
                        "code": "ACCESS-INMALVIEW",
                        "name": "Visualizar área InMall View"
                    },
                    {
                        "id": 4,
                        "code": "ACCESS-CUSTOMERVIEW",
                        "name": "Vizualizar área Customer View"
                    },
                    {
                        "id": 5,
                        "code": "ACCESS-FLASH",
                        "name": "Vizualizar área de Flashs"
                    },
                    {
                        "id": 6,
                        "code": "CREATE-FLASH",
                        "name": "Criar novos flashs"
                    },
                    {
                        "id": 7,
                        "code": "REPORT-FLASH",
                        "name": "Vizualizar relatórios de Flash"
                    },
                    {
                        "id": 8,
                        "code": "LIST-FLASH",
                        "name": "Listar Flash"
                    },
                    {
                        "id": 9,
                        "code": "PUBLISH-FLASH",
                        "name": "Publicar Flash"
                    },
                    {
                        "id": 10,
                        "code": "ACCESS-CUSTOMERSERVICE",
                        "name": "Vizualizar área de SAC"
                    },
                    {
                        "id": 11,
                        "code": "CREATE-CUSTOMERSERVICE",
                        "name": "Registrar nova entrada do SAC"
                    },
                    {
                        "id": 12,
                        "code": "REPORT-CUSTOMERSERVICE",
                        "name": "Vizualizar relatórios de SAC"
                    },
                    {
                        "id": 13,
                        "code": "LIST-CUSTOMERSERVICE",
                        "name": "Listar SAC"
                    },
                    {
                        "id": 14,
                        "code": "ACCESS-BABYCARE",
                        "name": "Vizualizar área de Fraldário"
                    },
                    {
                        "id": 15,
                        "code": "CREATE-BABYCARE",
                        "name": "Registrar nova entrada no Fraldário"
                    },
                    {
                        "id": 16,
                        "code": "REPORT-BABYCARE",
                        "name": "Vizualizar relatórios de Fraldário"
                    },
                    {
                        "id": 17,
                        "code": "LIST-BABYCARE",
                        "name": "Listar Fraldário"
                    },
                    {
                        "id": 18,
                        "code": "ACCESS-VIPROOM",
                        "name": "Vizualizar área de Sala Vip"
                    },
                    {
                        "id": 19,
                        "code": "CREATE-VIPROOM",
                        "name": "Registrar nova entrada na Sala Vip"
                    },
                    {
                        "id": 20,
                        "code": "REPORT-VIPROOM",
                        "name": "Vizualizar relatórios de Sala Vip"
                    },
                    {
                        "id": 21,
                        "code": "LIST-VIPROOM",
                        "name": "Listar Sala Vip"
                    },
                    {
                        "id": 22,
                        "code": "ACCESS-CAMPAIGN",
                        "name": "Vizualizar área de Camapnhas"
                    },
                    {
                        "id": 23,
                        "code": "CREATE-CAMPAIGN",
                        "name": "Criar novas Camapnhas"
                    },
                    {
                        "id": 24,
                        "code": "REPORT-CAMPAIGN",
                        "name": "Vizualizar relatórios de Camapnhas"
                    },
                    {
                        "id": 25,
                        "code": "LIST-CAMPAIGN",
                        "name": "Listar Camapnhas"
                    },
                    {
                        "id": 26,
                        "code": "PUBLISH-CAMPAIGN",
                        "name": "Publicar Camapnha"
                    }
                ]
            }
        }
    ],
    "token": "XXX"
}
*/
