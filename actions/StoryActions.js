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
    return stories;
  }

  fetchStories() {
    var self = this;
    return function(dispatch) {
      dispatch();
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
            self.updateStories(stories);
            CacheStore.set('stories', stories, 10); // 10 minutes
          })
          .catch(self.storiesFailed);
      };
      CacheStore.get('stories').then(function(stories){
        if (stories){
          self.updateStories(stories);
        } else {
          request();
        }
      }).catch(request);
    };
  }

  fetchStoriesIfExpired(){
    CacheStore.isExpired('stories').then(this.fetchStories);
  }

  storiesFailed(error){
    return error;
  }

  updateStory(story){
    return story;
  }

  fetchStory(id) {
    var self = this;
    return function(dispatch) {
      dispatch(id);
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
            self.updateStory(story);
            CacheStore.set('story' + id, story, 5); // 5 minutes
          })
          .catch(self.storyFailed);
      };
      CacheStore.get('story-' + id).then(function(story){
        if (story){
          self.updateStory(story);
        } else {
          request();
        }
      }, request);
    };
  }

  storyFailed(error){
    return error;
  }
}

module.exports = alt.createActions(StoryActions);
