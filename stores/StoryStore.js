'use strict';

import alt from '../alt';
import StoryActions from '../actions/StoryActions';

class StoryStore {
  constructor(){
    this.stories = [];
    this.storiesLoading = false;
    this.storiesError = false;
    this.story = null;
    this.storyLoading = false;
    this.storyError = false;

    this.bindListeners({
      handleFetchStories: StoryActions.FETCH_STORIES,
      handleUpdateStories: StoryActions.UPDATE_STORIES,
      handleStoriesFailed: StoryActions.STORIES_FAILED,
      handleFetchStory: StoryActions.FETCH_STORY,
      handleUpdateStory: StoryActions.UPDATE_STORY,
      handleStoryFailed: StoryActions.STORY_FAILED,
    });
  }

  handleFetchStories(){
    this.storiesLoading = true;
    this.storiesError = false;
  }

  handleUpdateStories(stories){
    this.stories = stories;
    this.storiesLoading = false;
    this.storiesError = false;
  }

  handleStoriesFailed(error){
    this.storiesLoading = false;
    this.storiesError = error;
  }

  handleFetchStory(id){
    if (this.story && this.story.id != id){
      this.story = null;
      this.storyLoading = true;
    }
    if (!this.story) this.storyLoading = true;
    this.storyError = false;
  }

  handleUpdateStory(story){
    this.story = story;
    this.storyLoading = false;
    this.storyError = false;

    // Update story in stories
    var stories = this.stories;
    for (var i=0, l=stories.length; i<l; i++){
      var s = stories[i];
      if (s.id == story.id){
        this.stories[i] = story;
        break;
      }
    }
  }

  handleStoryFailed(error){
    this.storyLoading = false;
    this.storyError = error;
  }
}

export default alt.createStore(StoryStore, 'StoryStore');
