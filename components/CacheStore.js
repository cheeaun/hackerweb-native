'use strict';

var React = require('react-native');
var {
  AsyncStorage,
} = React;

// Inspired by lscache https://github.com/pamelafox/lscache

var CACHE_PREFIX = 'cachestore-';
var CACHE_EXPIRATION_PREFIX = 'cacheexpiration-';
var EXPIRY_UNITS = 60 * 1000; // Time resolution in minutes

function currentTime(){
  return Math.floor((new Date().getTime())/EXPIRY_UNITS);
}

var CacheStore = {
  get: function(key){
    var theKey = CACHE_PREFIX + key;
    var exprKey = CACHE_EXPIRATION_PREFIX + key;
    return AsyncStorage.getItem(exprKey).then(function(expiry){
      if (expiry && currentTime() >= parseInt(expiry, 10)){
        AsyncStorage.multiRemove([exprKey, theKey]);
        return new Promise.reject(null);
      }
      return AsyncStorage.getItem(theKey).then(function(item){
        return Promise.resolve(JSON.parse(item));
      });
    });
  },

  set: function(key, value, time){
    var theKey = CACHE_PREFIX + key;
    var exprKey = CACHE_EXPIRATION_PREFIX + key;
    if (time){
      return AsyncStorage.setItem(exprKey, (currentTime() + time).toString()).then(function(){
        return AsyncStorage.setItem(theKey, JSON.stringify(value));
      });
    } else {
      AsyncStorage.removeItem(exprKey);
      return AsyncStorage.setItem(theKey, JSON.stringify(value));
    }
  },

  remove: function(key){
    return AsyncStorage.multiRemove([CACHE_EXPIRATION_PREFIX + key, CACHE_PREFIX + key]);
  },

  flush: function(){
    return AsyncStorage.getAllKeys().then(function(keys){
      var theKeys = keys.filter(function(key){
        return key.indexOf(CACHE_PREFIX) == 0 || key.indexOf(CACHE_EXPIRATION_PREFIX) == 0;
      });
      return AsyncStorage.multiRemove(theKeys);
    });
  },

  flushExpired: function(){
    return AsyncStorage.getAllKeys().then(function(keys){
      keys.forEach(function(key){
        if (key.indexOf(CACHE_EXPIRATION_PREFIX) == 0){
          var exprKey = key;
          return AsyncStorage.getItem(exprKey).then(function(expiry){
            if (expiry && currentTime() >= parseInt(expiry, 10)){
              var theKey = CACHE_PREFIX + key.replace(CACHE_EXPIRATION_PREFIX, '');
              return AsyncStorage.multiRemove([exprKey, theKey]);
            }
            return Promise.resolve();
          });
        }
        return Promise.resolve();
      });
    });
  }
};

// Always flush expired items on start time
CacheStore.flushExpired();

module.exports = CacheStore;
