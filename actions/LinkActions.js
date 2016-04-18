'use strict';

import alt from '../alt';
import CacheStore from 'react-native-cache-store';

class LinkActions {
  getLinks(){
    return (dispatch) => {
      CacheStore.get('links')
        .then((links) => dispatch(links || []))
        .catch(() => {});
    };
  }

  addLink(link){
    return (dispatch) => {
      CacheStore.get('links')
        .then((links) => {
          links = links || [];
          if (links.indexOf(link) < 0){
            dispatch(link);
            links.unshift(link);
            CacheStore.set('links', links.slice(0, 100));
          }
        })
        .catch(() => {});
    };
  }
}

export default alt.createActions(LinkActions);
