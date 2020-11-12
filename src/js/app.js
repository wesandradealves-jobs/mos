'use strict';

var _app = angular.module('metrics', ['ngAnimate', 'ngRoute', 'ngDialog', 'localytics.directives', 'datatables',
'ui.utils.masks', 'oitozero.ngSweetAlert', 'ngFileUpload', 'idf.br-filters', 'funnel', 'clusteredColumn', 'angulartics', 'angulartics.google.analytics',  'angulartics.google.tagmanager']);

_app.run(dtLanguageConfig);

function dtLanguageConfig(DTDefaultOptions) {
  DTDefaultOptions.setLanguageSource('js/util/dataTables-pt-br.json');
}

_app.config(['$routeProvider', '$locationProvider', '$sceDelegateProvider', '$analyticsProvider',
  function ($routeProvider, $locationProvider, $sceDelegateProvider, $analyticsProvider) {
        /* https://webcache.googleusercontent.com/search?q=cache:https://github.com/angulartics/angulartics-google-analytics/issues/79 */
        // Set the default settings for this module
        $analyticsProvider.settings.ga = {
            additionalAccountNames: undefined,
            // Select hits to send to all additional accounts
            additionalAccountHitTypes: {
                pageview: true,
                event: true,
                exception: false,
                ecommerce: false,
                userTiming: false,
                setUserProperties: false,
                userId: false
            },
            disableEventTracking: null,
            disablePageTracking: null,
            userId: null,
            enhancedEcommerce: false
        };

        $locationProvider.html5Mode = true;

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain. **.
            'https://dev.spotmetrics.com:3001/**',
            'http://localhost:3000/**',
            'http://localhost:4001/**',
            'http://localhost:3001/**',
            'https://api.spotmetrics.com:3001/**',
            'https://staging.spotmetrics.com:3001/**',
            'https://demo.spotmetrics.com:3001/**',

          ]);

        $routeProvider.when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginController'
        });

        $routeProvider.when('/customerView', {
            templateUrl: 'partials/customer.html',
            controller: 'CustomerController'
        });

        $routeProvider.when('/inMallView', {
            templateUrl: 'partials/inmall.html',
            controller: 'InMallController'
        });

        $routeProvider.when('/instoreView', {
            templateUrl: 'partials/instore-view.html',
            controller: 'InstoreController'
        });

        $routeProvider.when('/flash', {
            templateUrl: 'partials/flash.html',
            controller: 'FlashController'
        });

        $routeProvider.when('/campaign', {
            templateUrl: 'partials/campaign.html',
            controller: 'CampaignController'
        });

        $routeProvider.when('/promocoes', {
            templateUrl: 'partials/promo.html',
            controller: 'PromoController'
        });

        /*
        $routeProvider.when('/customerService', {
            templateUrl: 'partials/customer-service.html',
            controller: 'CustomerServiceController'
        });
        */
        $routeProvider.when('/customerService', {
            templateUrl: 'partials/customer-service-ext.html',
            controller: 'CustomerServiceExtController'

        });

        $routeProvider.when('/vipLounge', {
            templateUrl: 'partials/vip-lounge.html',
            controller: 'VipLoungeController'
        });

        $routeProvider.when('/babyCare', {
            templateUrl: 'partials/baby-care.html',
            controller: 'BabyCareController'
        });

        $routeProvider.when('/settings', {
            templateUrl: 'partials/settings.html',
            controller: 'SettingsController'
        });

        $routeProvider.when('/coupons', {
          templateUrl: 'partials/coupons.html',
          controller: 'CouponController'
        });

        $routeProvider.when('/coalition', {
            templateUrl: 'partials/coalition.html',
            controller: 'CoalitionController'
          });

        $routeProvider.when('/storekeeper', {
            templateUrl: 'partials/storekeeper.html',
            controller: 'StorekeeperController'
          });

        $routeProvider.when('/loan', {
            templateUrl: 'partials/loan.html',
            controller: 'LoanController'
          });

          $routeProvider.when('/lostfound', {
            templateUrl: 'partials/lostfound.html',
            controller: 'LostFoundController'
          });

        $routeProvider.otherwise({
            redirectTo: '/login'
        });

}]);


_app.run(['$rootScope', '$location', 'Session',
  function($rootScope, $location, Session) {
  $rootScope.$on("$routeChangeStart", function(next) {
    var _session = Session.getAll();
    //var yourTagToken = 'UA-151160210-3'

    //ga('create', yourTagToken, 'auto');
    if (next.templateUrl !== 'partials/login.html') {
      if(!_session || !_session.user) {
        $location.path('/login');
        return;
      }
    }

    /* validar se o usuário tem permissão para acessar a página */
    var menuPermissions = Session.get('menuPermissions');

    if ( $location.$$path == '/inMallView' && ! menuPermissions['ACCESS-INMALVIEW'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/customerView' && ! menuPermissions['ACCESS-CUSTOMERVIEW'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/instoreView'  && ! menuPermissions['ACCESS-INSTOREVIEW']  ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/flash' && ! menuPermissions['ACCESS-FLASH'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/campaign' && !menuPermissions['ACCESS-CAMPAIGN'] ) {
        $location.path('/login');
        return;
    }

    if ($location.$$path == '/promocoes' && !menuPermissions['ACCESS-PROMOTIONS']) {
      $location.path('/login');
      return;
    }

    if ( $location.$$path == '/customerService' && !menuPermissions['ACCESS-CUSTOMERSERVICE'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/babyCare' && !menuPermissions['ACCESS-BABYCARE'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/vipLounge' && !menuPermissions['ACCESS-VIPROOM'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/settings' && !menuPermissions['ACCESS-SETTINGS'] ) {
        $location.path('/login');
        return;
    }


    if ( $location.$$path == '/cupons' && !menuPermissions['ACCESS-COUPONS'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/coalition' && !menuPermissions['ACCESS-COALITION'] ) {
        $location.path('/login');
        return;
    }

    if ( $location.$$path == '/storekeeper' && !menuPermissions['ACCESS-STORE-AREA'] ) {
      console.log('sem permissao')
      $location.path('/login');
      return;
    }

    if ( $location.$$path == '/loan' && !menuPermissions['ACCESS-LOAN'] ) {
      console.log('sem permissao')
      $location.path('/login');
      return;
    }

    if ( $location.$$path == '/lostfound' && !menuPermissions['ACCESS-LOST-FOUND'] ) {
      console.log('sem permissao')
      $location.path('/login');
      return;
    }

  });
}]);
