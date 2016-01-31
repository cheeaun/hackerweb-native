'use strict';

var alt = require('../alt');
var CacheStore = require('../components/CacheStore');

class LinkActions {
  getLinks() {
    return function(dispatch) {
      var self = this;
      CacheStore.get('links').then(function(links){
        links = links || [];
        dispatch(links);
      });
    };
  }

  addLink(link) {
    return function(dispatch) {
      var self = this;
      CacheStore.get('links').then(function(links){
        links = links || [];
        if (!links.includes(link)){
          dispatch(link);
          links.push(link);
          CacheStore.set('links', links.slice(0, 100));
        }
      });
    };
  }
}

module.exports = alt.createActions(LinkActions);
