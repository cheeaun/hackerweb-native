'use strict';

var alt = require('../alt');
var CacheStore = require('../components/CacheStore');

var API_HOST = 'https://node-hnapi.herokuapp.com/';
var fetchTimeout = function(){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('Response timeout.'));
    }, 20000); // 20 seconds
  })
};

class StoryActions {
  updateStories(stories){
    this.dispatch(stories);
  }

  fetchStories(){
    this.dispatch();
    var self = this;
    var request = function(){
      Promise.race([
        fetch(API_HOST + 'news'),
        fetchTimeout()
      ])
        .then(function(response){
          return response.json();
        })
        .then(function(stories){
          if (!stories || !stories.length) throw new Error('Stories payload is empty');
          self.actions.updateStories(stories);
          CacheStore.set('stories', stories, 10); // 10 minutes
        })
        .catch(self.actions.storiesFailed);
    };
    CacheStore.get('stories').then(function(stories){
      if (stories){
        self.actions.updateStories(stories);
      } else {
        request();
      }
    }).catch(request);
  }

  storiesFailed(error){
    this.dispatch(error);
  }

  updateStory(story){
    this.dispatch(story);
  }

  fetchStory(id){
    this.dispatch(id);
    var self = this;
    var request = function(){
      Promise.race([
        fetch(API_HOST + 'item/' + id),
        fetchTimeout()
      ])
        .then(function(response){
          return response.json();
        })
        .then(function(story){
          if (!story) throw new Error('Story payload is empty');
          self.actions.updateStory(story);
          CacheStore.set('story' + id, story, 5); // 5 minutes
        })
        .catch(self.actions.storyFailed);
    };
    CacheStore.get('story-' + id).then(function(story){
      if (story){
        self.actions.updateStory(story);
      } else {
        request();
      }
    }, request);
  }

  storyFailed(error){
    this.dispatch(error);
  }
}

module.exports = alt.createActions(StoryActions);
