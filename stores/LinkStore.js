'use strict';

var alt = require('../alt');
var LinkActions = require('../actions/LinkActions');

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

module.exports = alt.createStore(LinkStore, 'LinkStore');
