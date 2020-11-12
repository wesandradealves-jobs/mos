'use strict';

/* eslint-env browser */
/* global _app */
/* eslint
  eqeqeq: off,
  space-before-function-paren: off,
  semi: off */

_app.factory('Permission', ['Session', function(Session) {
  const Permission = {};

  Permission.canAccess = function(userPermissions, permission) {

    if (JSON.stringify(userPermissions) != '{}' && userPermissions != undefined) {
      for (let i = 0; i < userPermissions.length; i += 1) {
        for (let j = 0; j < userPermissions[i].role.permissions.length; j += 1) {
          if (userPermissions[i].role.permissions[j].code == permission) {
            return true;
          }
        }
      }
    }

    return false;
  };

  Permission.menuPermissions = function () {
    const malls = Session.get('user').malls;

    return {
      'CREATE-ROLES': Permission.canAccess(malls, 'CREATE-ROLES'),
      'CREATE-USER': Permission.canAccess(malls, 'CREATE-USER'),

      'ACCESS-INMALVIEW': Permission.canAccess(malls, 'ACCESS-INMALVIEW'),
      'ACCESS-CUSTOMERVIEW': Permission.canAccess(malls, 'ACCESS-CUSTOMERVIEW'),

      'ACCESS-FLASH': Permission.canAccess(malls, 'ACCESS-FLASH'),
      'CREATE-FLASH': Permission.canAccess(malls, 'CREATE-FLASH'),
      'REPORT-FLASH': Permission.canAccess(malls, 'REPORT-FLASH'),
      'LIST-FLASH': Permission.canAccess(malls, 'LIST-FLASH'),
      'PUBLISH-FLASH': Permission.canAccess(malls, 'PUBLISH-FLASH'),

      'ACCESS-CUSTOMERSERVICE': Permission.canAccess(malls, 'ACCESS-CUSTOMERSERVICE'),
      'CREATE-CUSTOMERSERVICE': Permission.canAccess(malls, 'CREATE-CUSTOMERSERVICE'),
      'LIST-CUSTOMERSERVICE': Permission.canAccess(malls, 'LIST-CUSTOMERSERVICE'),
      'REPORT-CUSTOMERSERVICE': Permission.canAccess(malls, 'REPORT-CUSTOMERSERVICE'),

      'ACCESS-BABYCARE': Permission.canAccess(malls, 'ACCESS-BABYCARE'),
      'CREATE-BABYCARE': Permission.canAccess(malls, 'CREATE-BABYCARE'),
      'LIST-BABYCARE': Permission.canAccess(malls, 'LIST-BABYCARE'),
      'REPORT-BABYCARE': Permission.canAccess(malls, 'REPORT-BABYCARE'),

      'ACCESS-VIPROOM': Permission.canAccess(malls, 'ACCESS-VIPROOM'),
      'CREATE-VIPROOM': Permission.canAccess(malls, 'CREATE-VIPROOM'),
      'LIST-VIPROOM': Permission.canAccess(malls, 'LIST-VIPROOM'),
      'REPORT-VIPROOM': Permission.canAccess(malls, 'REPORT-VIPROOM'),

      'ACCESS-CAMPAIGN': Permission.canAccess(malls, 'ACCESS-CAMPAIGN'),
      'CREATE-CAMPAIGN': Permission.canAccess(malls, 'CREATE-CAMPAIGN'),
      'REPORT-CAMPAIGN': Permission.canAccess(malls, 'REPORT-CAMPAIGN'),
      'LIST-CAMPAIGN': Permission.canAccess(malls, 'LIST-CAMPAIGN'),
      'PUBLISH-CAMPAIGN': Permission.canAccess(malls, 'PUBLISH-CAMPAIGN'),

      'ACCESS-PROMOTIONS': Permission.canAccess(malls, 'ACCESS-PROMOTIONS'),
      'CREATE-PROMOTIONS': Permission.canAccess(malls, 'CREATE-PROMOTIONS'),
      'REPORT-PROMOTIONS': Permission.canAccess(malls, 'REPORT-PROMOTIONS'),
      'LIST-PROMOTIONS': Permission.canAccess(malls, 'LIST-PROMOTIONS'),
      'OPERATIONS-PROMOTIONS': Permission.canAccess(malls, 'OPERATIONS-PROMOTIONS'),

      'ACCESS-COUPONS': Permission.canAccess(malls, 'ACCESS-COUPONS'),
      'APPROVE-COUPONS': Permission.canAccess(malls, 'APPROVE-COUPONS'),

      'ACCESS-SETTINGS': Permission.canAccess(malls, 'ACCESS-SETTINGS'),
      'SETTINGS-STORES': Permission.canAccess(malls, 'SETTINGS-STORES'),
      'SETTINGS-TARGETINGS': Permission.canAccess(malls, 'SETTINGS-TARGETINGS'),

      'ACCESS-INSTOREVIEW': Permission.canAccess(malls, 'ACCESS-INSTOREVIEW'),

      'ACCESS-COALITION': Permission.canAccess(malls, 'ACCESS-COALITION'),
      'ACCESS-LOAN': Permission.canAccess(malls, 'ACCESS-LOAN'),
      'ACCESS-STORE-AREA': Permission.canAccess(malls, 'ACCESS-STORE-AREA'),
      'ACCESS-LOST-FOUND': Permission.canAccess(malls, 'ACCESS-LOST-FOUND'),
    };
  };

  return Permission;
}]);


// {
//     "mallId": 2,
//     "roleId": 9,
//     "role": {
//         "id": 9,
//         "name": "Administrador",
//         "permissions": [
//             {
//                 "id": 1,
//                 "code": "CREATE-ROLES",
//                 "name": "Criar novos papéis de usuários"
//             },
//             {
//                 "id": 2,
//                 "code": "CREATE-USER",
//                 "name": "Criar novos usuários"
//             },
//             {
//                 "id": 3,
//                 "code": "ACCESS-INMALVIEW",
//                 "name": "Visualizar área InMall View"
//             },
//             {
//                 "id": 4,
//                 "code": "ACCESS-CUSTOMERVIEW",
//                 "name": "Vizualizar área Customer View"
//             },
//             {
//                 "id": 5,
//                 "code": "ACCESS-FLASH",
//                 "name": "Vizualizar área de Flashs"
//             },
//             {
//                 "id": 6,
//                 "code": "CREATE-FLASH",
//                 "name": "Criar novos flashs"
//             },
//             {
//                 "id": 7,
//                 "code": "REPORT-FLASH",
//                 "name": "Vizualizar relatórios de Flash"
//             },
//             {
//                 "id": 8,
//                 "code": "LIST-FLASH",
//                 "name": "Listar Flash"
//             },
//             {
//                 "id": 9,
//                 "code": "PUBLISH-FLASH",
//                 "name": "Publicar Flash"
//             },
//             {
//                 "id": 10,
//                 "code": "ACCESS-CUSTOMERSERVICE",
//                 "name": "Vizualizar área de SAC"
//             },
//             {
//                 "id": 11,
//                 "code": "CREATE-CUSTOMERSERVICE",
//                 "name": "Registrar nova entrada do SAC"
//             },
//             {
//                 "id": 12,
//                 "code": "REPORT-CUSTOMERSERVICE",
//                 "name": "Vizualizar relatórios de SAC"
//             },
//             {
//                 "id": 13,
//                 "code": "LIST-CUSTOMERSERVICE",
//                 "name": "Listar SAC"
//             },
//             {
//                 "id": 14,
//                 "code": "ACCESS-BABYCARE",
//                 "name": "Vizualizar área de Fraldário"
//             },
//             {
//                 "id": 15,
//                 "code": "CREATE-BABYCARE",
//                 "name": "Registrar nova entrada no Fraldário"
//             },
//             {
//                 "id": 16,
//                 "code": "REPORT-BABYCARE",
//                 "name": "Vizualizar relatórios de Fraldário"
//             },
//             {
//                 "id": 17,
//                 "code": "LIST-BABYCARE",
//                 "name": "Listar Fraldário"
//             },
//             {
//                 "id": 18,
//                 "code": "ACCESS-VIPROOM",
//                 "name": "Vizualizar área de Sala Vip"
//             },
//             {
//                 "id": 19,
//                 "code": "CREATE-VIPROOM",
//                 "name": "Registrar nova entrada na Sala Vip"
//             },
//             {
//                 "id": 20,
//                 "code": "REPORT-VIPROOM",
//                 "name": "Vizualizar relatórios de Sala Vip"
//             },
//             {
//                 "id": 21,
//                 "code": "LIST-VIPROOM",
//                 "name": "Listar Sala Vip"
//             },
//             {
//                 "id": 22,
//                 "code": "ACCESS-CAMPAIGN",
//                 "name": "Vizualizar área de Camapnhas"
//             },
//             {
//                 "id": 23,
//                 "code": "CREATE-CAMPAIGN",
//                 "name": "Criar novas Camapnhas"
//             },
//             {
//                 "id": 24,
//                 "code": "REPORT-CAMPAIGN",
//                 "name": "Vizualizar relatórios de Camapnhas"
//             },
//             {
//                 "id": 25,
//                 "code": "LIST-CAMPAIGN",
//                 "name": "Listar Camapnhas"
//             },
//             {
//                 "id": 26,
//                 "code": "PUBLISH-CAMPAIGN",
//                 "name": "Publicar Camapnha"
//             }
//         ]
//     }
// }
// ],
// "token": "XXX"
// }
