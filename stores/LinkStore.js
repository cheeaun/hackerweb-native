'use strict';

import alt from '../alt';
import LinkActions from '../actions/LinkActions';

class LinkStore {
  constructor(){
    this.links = [];

    this.bindListeners({
      handleGetLinks: LinkActions.GET_LINKS,
      handleAddLink: LinkActions.ADD_LINK,
    });
  }

  handleGetLinks(links){
    this.links = links;
  }

  handleAddLink(link){
    this.links.push(link);
  }
}

export default alt.createStore(LinkStore, 'LinkStore');
