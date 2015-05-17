angular.module('starter.controllers', [])

.controller('WelcomeCtrl', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.login = function() {
        $state.go('login');
    };

    $scope.signUp = function() {
        $state.go('register');
    };

    if ($rootScope.isLoggedIn) {
        $state.go('tab.dash');
    }
})

.controller('DashCtrl', function($scope, $state) {
  $scope.logOut = function() {
    Parse.User.logOut();
    $state.transitionTo('welcome');
  };
})

.controller('BLECtrl', function($scope, $stateParams, BLE, BLEActiveDevice) {

  // keep a reference since devices will be added
  $scope.devices = BLE.devices;

  var success = function () {
      if ($scope.devices.length < 1) {
          // a better solution would be to update a status message rather than an alert
          alert("Didn't find any Bluetooth Low Energy devices.");
      }
  };

  var failure = function (error) {
      alert(error);
  };

  // pull to refresh
  $scope.onRefresh = function() {
      BLE.scan().then(
          success, failure
      ).finally(
          function() {
              $scope.$broadcast('scroll.refreshComplete');
          }
      )
  }

  // initial scan
  BLE.scan().then(success, failure);
})

.controller('BLEServicesCtrl', function($scope, $stateParams, BLE, BLEActiveDevice) {
  // connect to the appropriate device
  BLE.connect($stateParams.deviceId).then(
    function(peripheral) {
      $scope.device = peripheral;
    }
  );

  // populate factory with attributes we want to use for notify
  $scope.setAttributes = function(deviceId, serviceId, characteristicId) {
    BLEActiveDevice.setAttributes(deviceId, serviceId, characteristicId);
    BLEActiveDevice.read();
  }
})

.controller('BLENotifyCtrl', function($scope, $stateParams, BLE, BLEActiveDevice) {
  // grab attributes from factory
  $scope.device = BLEActiveDevice.getAttributes()['device'];
  $scope.service = BLEActiveDevice.getAttributes()['service'];
  $scope.characteristic = BLEActiveDevice.getAttributes()['characteristic'];
  $scope.notifications = [];

  // subscribe to notifications
  BLE.startNotification($scope.device, $scope.service, $scope.characteristic,
    function(notification) {
      notifications.push(notification);
    },
    function() {
      console.log('Failed to start notifications');
      alert('Failed to start notifications');
    });
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading) {
    $scope.user = {
        username: null,
        password: null
    };

    $scope.error = {};

    $scope.login = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = $scope.user;
        Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.transitionTo('tab.dash', {
                    clear: true
                });
            },
            error: function(user, err) {
                $ionicLoading.hide();
                // The login failed. Check error to see why.
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
    };

    $scope.forgot = function() {
        $state.go('forgot');
    };
})

.controller('LoginHomeController', function($scope, $state, $rootScope) {

    if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }
})

.controller('LoginForgotPasswordController', function($scope, $state, $ionicLoading) {
    $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
                // TODO: show success
                $ionicLoading.hide();
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('login');
    };
})

.controller('LoginRegisterController', function($scope, $state, $ionicLoading, $rootScope) {
    $scope.user = {};
    $scope.error = {};

    $scope.register = function() {

        // TODO: add age verification step

        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = new Parse.User();
        user.set("username", $scope.user.email);
        user.set("password", $scope.user.password);
        user.set("email", $scope.user.email);

        user.signUp(null, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('connect', {
                  clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                } else if (error.code === 202) {
                    $scope.error.message = 'The email address is already ' +
                        'registered';
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
        });
    };
})

.controller('CalibrateController', function($scope, $state, $stateParams, $ionicLoading, $rootScope, BLE, BLEActiveDevice) {
    $scope.user = {};
    $scope.error = {};

    // connect to the appropriate device
    BLE.connect($stateParams.deviceId).then(
      function(peripheral) {
        $scope.device = peripheral;
      }
    );

    BLEActiveDevice.setDevice($stateParams.deviceId);

    $scope.calibrate = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    $scope.confirm = function() {
      $state.go('fill-water', {
        clear:true
      });
    };
})

.controller('FillWaterController', function($scope, $state, $ionicLoading, $rootScope) {
    $scope.user = {};
    $scope.error = {};

    $scope.calibrate = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    $scope.confirm = function() {
      $state.go('tab.dash', {
        clear:true
      });
    }
})
