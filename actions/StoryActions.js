'use strict';

import alt from '../alt';
import CacheStore from 'react-native-cache-store';

const API_HOST = 'https://api.hackerwebapp.com/';
const FETCH_TIMEOUT = 20000; // 20 seconds
function fetchTimeout(){
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Response timeout.')), FETCH_TIMEOUT);
  })
};
const MAX_RETRIES = 3;
function betterFetch(url, times){
  times = times || 0;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.json())
      .then(resolve)
      .catch((times >= MAX_RETRIES) ? reject : (e) => {
        setTimeout(() => {
          betterFetch(url, times+1).then(resolve).catch(reject);
        }, 500);
      });
  });
};

class StoryActions {
  updateStories(stories){
    return stories;
  }

  updateMoreStories(stories){
    return stories;
  }

  flush(){
    CacheStore.flush(); // Clears everything
  }

  fetchStories(){
    return (dispatch) => {
      dispatch();

      var request = () => {
        Promise.race([
          betterFetch(API_HOST + 'news'),
          fetchTimeout()
        ])
          .then((stories) => {
            if (!stories || !stories.length) throw new Error('Stories payload is empty');
            this.updateStories(stories);
            CacheStore.set('stories', stories, 10); // 10 minutes
          })
          .catch(this.storiesFailed);

        // Meanwhile...
        betterFetch(API_HOST + 'news2')
          .then((stories) => {
            if (!stories || !stories.length) return;
            this.hasMoreStories();
            CacheStore.set('stories2', stories, 10); // 10 minutes
          })
          .catch(() => {});
      };

      CacheStore.get('stories').then((stories) => {
        if (stories){
          this.updateStories(stories);
        } else {
          request();
        }
      }).catch(request);

      CacheStore.get('stories2').then((stories) => {
        if (stories) this.hasMoreStories();
      }).catch(() => {});
    };
  }

  hasMoreStories(){
    return true;
  }

  fetchMoreStories(){
    CacheStore.get('stories2').then((stories) => {
      if (stories) this.updateMoreStories(stories);
    }).catch(() => {});
  }

  fetchStoriesIfExpired(){
    CacheStore.isExpired('stories').then(this.fetchStories).catch(() => {});
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
      const key = `story-${id}`;
      var request = () => {
        Promise.race([
          betterFetch(API_HOST + 'item/' + id),
          fetchTimeout()
        ])
          .then((story) => {
            if (!story) throw new Error('Story payload is empty');
            this.updateStory(story);
            CacheStore.set(key, story, 5); // 5 minutes
          })
          .catch(this.storyFailed);
      };
      CacheStore.get(key).then((story) => {
        if (story){
          this.updateStory(story);
        } else {
          request();
        }
      }).catch(request);
    };
  }

  storyFailed(error){
    return error;
  }
}

export default alt.createActions(StoryActions);
