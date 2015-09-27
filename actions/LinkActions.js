'use strict';

var alt = require('../alt');
var CacheStore = require('../components/CacheStore');

class LinkActions {
  getLinks(){
    var self = this;
    CacheStore.get('links').then(function(links){
      links = links || [];
      self.dispatch(links);
    });
  }

  addLink(link){
    var self = this;
    CacheStore.get('links').then(function(links){
      links = links || [];
      if (!links.includes(link)){
        self.dispatch(link);
        links.push(link);
        CacheStore.set('links', links.slice(0, 100));
      }
    });
  }
}

module.exports = alt.createActions(LinkActions);
