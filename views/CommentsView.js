'use strict';

import React from 'react-native';
var {
  Component,
  StyleSheet,
  ActivityIndicatorIOS,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Image,
} = React;

import SafariView from 'react-native-safari-view';
import ActivityView from 'react-native-activity-view';

import StoryStore from '../stores/StoryStore';
import StoryActions from '../actions/StoryActions';
import LinkActions from '../actions/LinkActions';

import LoadingIndicator from '../components/LoadingIndicator';
import HTMLView from '../components/HTMLView';
import CommentsThread from '../components/CommentsThread';
import ProgressBar from '../components/ProgressBar';
import domainify from '../utils/domainify';

import colors from '../colors';

const styles = StyleSheet.create({
  viewCommentsBlank: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    backgroundColor: colors.sectionBackgroundColor,
    borderTopColor: colors.separatorColor,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separatorColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 30,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    opacity: .6,
    textAlign: 'center',
  },
  retryText: {
    color: colors.linkColor,
    textAlign: 'center',
  },
  noCommentsText: {
    opacity: .6,
  },
  externalArrowIcon: {
    width: 12,
    height: 9,
    marginRight: 6,
  },
  storyTitle: {
    fontSize: 17
  },
  storySection: {
    padding: 15,
  },
  storyDomain: {
    fontSize: 13,
    color: colors.domainColor,
  },
  storyMetadata: {
    fontSize: 13,
    color: colors.insignificantColor,
  },
  storyContent: {
    backgroundColor: colors.sectionBackgroundColor,
    padding: 15,
    borderTopColor: colors.separatorColor,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separatorColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 30,
  },
  commentsThread: {
    backgroundColor: colors.sectionBackgroundColor,
    borderTopColor: colors.separatorColor,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 30,
  },
  externalLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.viewBackgroundColor,
  },
  pollContainer: {
    flexDirection: 'row',
    marginTop: 9,
    marginBottom: 2,
    alignItems: 'flex-end',
  },
  pollItem: {
    fontWeight: '500',
    flex: 1,
  },
  pollPoints: {
    color: colors.insignificantColor,
  },
});

var showBrowser = function(u){
  if (!u) return;
  SafariView.show({
    url: u
  });
  setTimeout(function(){
    LinkActions.addLink(u);
  }, 1000); // Set the link inactive after 1 second
};

var showActivity = function(u, t){
  if (!u) return;
  ActivityView.show({
    text: t || '',
    url: u,
  });
};

export default class CommentsView extends Component {
  constructor(props){
    super(props);
    var { story, storyLoading, storyError } = StoryStore.getState();
    this.state = {
      data: story,
      loading: storyLoading,
      error: storyError,
    };
    this._onChange = this._onChange.bind(this);
    this._fetchStory = this._fetchStory.bind(this);
  }
  componentDidMount(){
    StoryStore.listen(this._onChange);
    this._fetchStory();
  }
  componentWillUnmount(){
    StoryStore.unlisten(this._onChange);
  }
  _fetchStory(){
    StoryActions.fetchStory(this.props.data.id);
  }
  _onChange(state){
    this.setState({
      data: state.story,
      loading: state.storyLoading,
      error: state.storyError,
    });
    /* Note:
      Title update doesn't work yet due to https://github.com/facebook/react-native/issues/476
      Hopefully this works https://github.com/bjornco/react-native/commit/5fcb2a8673a2c17f4fdb03327008397a10a9c53a
    */
    if (state.story && state.story.title){
      var route = this.props.navigator.navigationContext.currentRoute;
      if (!route) return;
      route.title = state.story.title;
      this.props.navigator.replace(route);
    }
  }
  render(){
    var data = this.state.data || this.props.data;
    var commentsText = <Text>&middot; {data.comments_count} comment{data.comments_count != 1 && 's'}</Text>;
    var url = data.url;
    var externalLink = !/^item/i.test(url);
    var domainText = null;
    var storyHeader = <View><Text style={styles.storyTitle}>{data.title}</Text></View>;

    if (externalLink){
      domainText = <Text style={styles.storyDomain}>{domainify(data.url)}</Text>;
      storyHeader = (
        <TouchableHighlight onPress={showBrowser.bind(null, url)} onLongPress={showActivity.bind(null, url, data.title)}>
          <View style={{backgroundColor: colors.viewBackgroundColor}}>
            <Text style={styles.storyTitle}>{data.title}</Text>
            {domainText}
          </View>
        </TouchableHighlight>
      );
    }

    var hnShortURL = 'news.ycombinator.com/item?id=' + data.id;
    var hnURL = 'https://' + hnShortURL;

    var contentSection;
    if (data.content){
      var contentElements;
      HTMLView.processDOM(data.content, (elements) => {
        contentElements = elements;
      });

      var pollElements;
      if (data.poll && data.poll.length){
        var maxPoints = Math.max.apply(null, data.poll.map((p) => p.points ));
        pollElements = data.poll.map((p) => {
          var points = p.points;
          return (
            <View>
              <View style={styles.pollContainer}>
                <Text style={styles.pollItem}>{p.item}</Text>
                <Text style={styles.pollPoints}>{points} point{points != 1 && 's'}</Text>
              </View>
              <ProgressBar value={points} max={maxPoints}></ProgressBar>
            </View>
          );
        });
      }

      contentSection = <View style={styles.storyContent}>{contentElements}{pollElements}</View>;
    }

    var commentsSection;
    if (this.state.loading){
      commentsSection = (
        <View style={styles.viewCommentsBlank}>
          <LoadingIndicator/>
        </View>
      );
    } else if (this.state.error){
      commentsSection = (
        <View style={styles.viewCommentsBlank}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Couldn't load comments.</Text>
            <TouchableOpacity onPress={this._fetchStory}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (data && data.comments && data.comments.length){
      commentsSection = (
        <View style={styles.commentsThread}>
          <CommentsThread data={data.comments} op={data.user} />
        </View>
      );
    } else {
      commentsSection = (
        <View style={styles.viewCommentsBlank}>
          <Text style={styles.noCommentsText}>No comments.</Text>
        </View>
      );
    }

    return (
      <ScrollView>
        <View style={styles.storySection}>
          {storyHeader}
          <Text style={styles.storyMetadata}>{data.points} points by {data.user}</Text>
          <Text style={styles.storyMetadata}>{data.time_ago} {data.comments_count ? commentsText : null}</Text>
          <TouchableHighlight onPress={showBrowser.bind(null, hnURL)} onLongPress={showActivity.bind(null, hnURL, data.title)}>
            <View style={styles.externalLink}>
              <Image style={styles.externalArrowIcon} source={require('../images/external-arrow.png')}/>
              <Text style={styles.storyMetadata}>{hnShortURL}</Text>
            </View>
          </TouchableHighlight>
        </View>
        {contentSection}
        {commentsSection}
      </ScrollView>
    );
  }
}
