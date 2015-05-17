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
  };
})

.factory('BLEActiveDevice', function() {
  // store services/characteristics here so we can subscribe to notifications
  var device;
  var serviceId;
  var characteristicId;

  return {
    getAttributes: function() {
      return {
        'device': device,
        'service': serviceId,
        'characteristic': characteristicId
      };
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
    }
  }
});
