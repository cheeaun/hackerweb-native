'use strict';

import alt from '../alt';
import CacheStore from '../components/CacheStore';

class LinkActions {
  getLinks(){
    return function(dispatch){
      var self = this;
      CacheStore.get('links').then(function(links){
        links = links || [];
        dispatch(links);
      });
    };
  }

  addLink(link){
    return function(dispatch){
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

export default alt.createActions(LinkActions);
