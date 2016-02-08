'use strict';

import alt from '../alt';
import CacheStore from '../components/CacheStore';

class LinkActions {
  getLinks(){
    return (dispatch) => {
      CacheStore.get('links').then((links) => dispatch(links || []));
    };
  }

  addLink(link){
    return (dispatch) => {
      CacheStore.get('links').then((links) => {
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
