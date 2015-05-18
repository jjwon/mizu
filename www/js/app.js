// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($state, $rootScope) {
  Parse.initialize('CaaabJFvADd2dauVErCW7rVGg3djQ8dMJLhMtFBm', 'Z2VicEiifGL6wgvqnw24dmeoYCNvxYFRXu0yVpUh');
  var currentUser = Parse.User.current();
  $rootScope.user = null;
  $rootScope.isLoggedIn = false;
  $rootScope.device = null;

  if (currentUser) {
    $rootScope.user = currentUser;
    $rootScope.isLoggedIn = true;
    $state.go('tab.dash');
  }
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('welcome', {
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'WelcomeCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginController'
  })

  .state('forgot', {
    url: '/forgot',
    templateUrl: 'templates/forgotPassword.html',
    controller: 'LoginForgotPasswordController'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'LoginRegisterController'
  })

  .state('calibrate', {
    url: '/calibrate/:deviceId',
    templateUrl: 'templates/calibrate.html',
    controller: 'CalibrateController'
  })

  .state('fill-water', {
    url: '/fill-water',
    templateUrl: 'templates/fill-water.html',
    controller: 'FillWaterController'
  })

  .state('connect', {
    url: "/connect",
    templateUrl: 'templates/connect.html',
    controller: 'BLECtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
    .state('tab.ble', {
      url: '/ble',
      views: {
        'tab-ble': {
          templateUrl: 'templates/tab-ble.html',
          controller: 'BLECtrl'
        }
      }
    })
    .state('tab.ble-services', {
      url: '/ble/:deviceId',
      views: {
        'tab-ble': {
          templateUrl: 'templates/ble-services.html',
          controller: 'BLEServicesCtrl'
        }
      }
  })

  .state('tab.ble-notify', {
    url: '/ble/:deviceId/notify',
    views: {
      'tab-ble': {
        templateUrl: 'templates/ble-notify.html',
        controller: 'BLENotifyCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');

});
