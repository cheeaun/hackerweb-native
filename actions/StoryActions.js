'use strict';

import alt from '../alt';
import CacheStore from '../components/CacheStore';

const API_HOST = 'https://api.hackerwebapp.com/';
var fetchTimeout = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Response timeout.'));
    }, 20000); // 20 seconds
  })
};

class StoryActions {
  updateStories(stories){
    return stories;
  }

  fetchStories(){
    return (dispatch) => {
      dispatch();
      var request = () => {
        Promise.race([
          fetch(API_HOST + 'news'),
          fetchTimeout()
        ])
          .then((response) => response.json())
          .then((stories) => {
            if (!stories || !stories.length) throw new Error('Stories payload is empty');
            this.updateStories(stories);
            CacheStore.set('stories', stories, 10); // 10 minutes
          })
          .catch(this.storiesFailed);
      };
      CacheStore.get('stories').then((stories) => {
        if (stories){
          this.updateStories(stories);
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
    return (dispatch) => {
      dispatch(id);
      var request = () => {
        Promise.race([
          fetch(API_HOST + 'item/' + id),
          fetchTimeout()
        ])
          .then((response) =>  response.json())
          .then((story) => {
            if (!story) throw new Error('Story payload is empty');
            this.updateStory(story);
            CacheStore.set('story' + id, story, 5); // 5 minutes
          })
          .catch(this.storyFailed);
      };
      CacheStore.get('story-' + id).then((story) => {
        if (story){
          this.updateStory(story);
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

export default alt.createActions(StoryActions);
