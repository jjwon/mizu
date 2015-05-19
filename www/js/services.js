angular.module('starter.services', [])

.factory('BLE', function($q) {

  var connected;

  return {

    devices: [],

    disconnect: function() {
      if (connected) {
        var id = connected.id;
        ble.disconnect(connected.id, function() {
          console.log("Disconnected " + id);
        });
        connected = null;
      }
    },

    scan: function() {
        var that = this;
        var deferred = $q.defer();

        that.devices.length = 0;

        ble.startScan([],  /* scan for all services */
            function(peripheral){
                that.devices.push(peripheral);
            },
            function(error){
                deferred.reject(error);
            });

        // stop scan after 5 seconds
        setTimeout(ble.stopScan, 5000,
            function() {
                deferred.resolve();
            },
            function() {
                console.log("stopScan failed");
                deferred.reject("Error stopping scan");
            }
        );

        return deferred.promise;
    },

    connect: function(deviceId) {
        var deferred = $q.defer();

        ble.connect(deviceId,
            function(peripheral) {
                connected = peripheral;
                deferred.resolve(peripheral);
            },
            function(reason) {
                deferred.reject(reason);
            }
        );

        return deferred.promise;
    },

    notify: function(deviceId) {
      var deferred = $q.defer();
      var serviceId = "c84fcc88-8610-4874-85c6-fe7483abe0c1";
      var accelCharacteristic = "ACC119df-eb7a-49d0-92f9-b6b97846a860";

      ble.startNotification(deviceId, serviceId, accelCharacteristic,
          function(data) {
            deferred.resolve(data);
          },
          function(reason){
            deferred.reject(reason);
          }
      );

      return deferred.promise;
    },
  };
})

.factory('BLEActiveDevice', function() {
  // store services/characteristics here so we can subscribe to notifications
  var device;
  var serviceId = "c84fcc88-8610-4874-85c6-fe7483abe0c1";
  var characteristicId;
  var accelCharacteristic = "ACC119df-eb7a-49d0-92f9-b6b97846a860";
  var pitch;
  var roll;
  var z;

  // ASCII only
  function bytesToString(buffer) {
      return String.fromCharCode.apply(null, new Uint16Array(buffer));
  }

  function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  function accWrap(x) {
    if (x > 32768) {
      return (x % 32768) - 32768;
    }
    return x;
  }

  return {
    getAttributes: function() {
      return {
        'device': device,
        'service': serviceId,
        'characteristic': characteristicId
      };
    },
    setBias: function() {
      var success = function() {
        alert("Calibrated!");
      }
      ble.write(device, serviceId, writeCharacteristic, z - 1000, success);
    },
    stopNotify: function() {
      ble.stopNotification(device, serviceId, accelCharacteristic);
    },
    setAttributes: function(newDevice, service, characteristic) {
      device = newDevice;
      serviceId = service;
      characteristicId = characteristic;
    },
    setDevice: function(newDevice) {
      device = newDevice;
    },
    read: function() {
      var successCallback = function(data) {
        alert(data);
      }
      ble.read( device, 
                serviceId, 
                characteristicId, 
                successCallback
              );
    },
    notifyAccel: function(scope) {
      var successCallback = function(data) {
        var dataRead = function(data) {
          var bufView = new Uint16Array(data);
          var x = accWrap(bufView[0]);
          var y = accWrap(bufView[1]);
          z = accWrap(bufView[2]);
          pitch = Math.atan(-y/z) * Math.PI * 90 / 4;
          roll = Math.atan(-x/z) * Math.PI * 90 / 4;
          if (Math.abs(pitch) > Math.abs(roll)) {
            rotateAmount = pitch;
          } else {
            rotateAmount = roll;
          }
          scope.bottlestyle = "-webkit-transform: rotate(" + rotateAmount + "deg)";
          scope.$apply()
        }
        alert("test");
        ble.read(device, serviceId, accelCharacteristic, dataRead);
      }

      var failureCallback = function(reason) {
        alert("ERROR: " + reason);
      }

      ble.notify(device, serviceId, accelCharacteristic, successCallback, failureCallback);
    },

    readAccel: function() {
      var successCallback = function(data) {
        alert(bytesToString(data));
        alert(data);
      }

      ble.read(device, serviceId, accelCharacteristic, successCallback);
    },
  }
});
