'use strict';

var React = require('react-native');
var {
  StyleSheet,
  ActivityIndicatorIOS,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Image,
} = React;

var SafariView = require('react-native-safari-view');
var ActivityView = require('react-native-activity-view');

var StoryStore = require('../stores/StoryStore');
var StoryActions = require('../actions/StoryActions');
var LinkActions = require('../actions/LinkActions');

var LoadingIndicator = require('../components/LoadingIndicator');
var HTMLView = require('../components/HTMLView');
var CommentsThread = require('../components/CommentsThread');
var ProgressBar = require('../components/ProgressBar');
var domainify = require('../utils/domainify');
var devicePx = require('../utils/devicePx');

var colors = require('../colors');

var styles = StyleSheet.create({
  viewCommentsBlank: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    backgroundColor: colors.sectionBackgroundColor,
    borderTopColor: colors.separatorColor,
    borderTopWidth: devicePx,
    borderBottomColor: colors.separatorColor,
    borderBottomWidth: devicePx,
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
    borderTopWidth: devicePx,
    borderBottomColor: colors.separatorColor,
    borderBottomWidth: devicePx,
    marginBottom: 30,
  },
  commentsThread: {
    backgroundColor: colors.sectionBackgroundColor,
    borderTopColor: colors.separatorColor,
    borderTopWidth: devicePx,
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

var CommentsView = React.createClass({
  getInitialState: function(){
    var { story, storyLoading, storyError } = StoryStore.getState();
    return {
      data: story,
      loading: storyLoading,
      error: storyError,
    };
  },
  componentDidMount: function(){
    StoryStore.listen(this._onChange);
    this._fetchStory();
  },
  componentWillUnmount: function(){
    StoryStore.unlisten(this._onChange);
  },
  _fetchStory: function(){
    StoryActions.fetchStory(this.props.data.id);
  },
  _onChange: function(state){
    this.setState({
      data: state.story,
      loading: state.storyLoading,
      error: state.storyError,
    });
  },
  render: function(){
    var data = this.state.data || this.props.data;
    var commentsText = <Text>&middot; {data.comments_count} comment{data.comments_count != 1 && 's'}</Text>;
    var url = data.url;
    var externalLink = !/^item/i.test(url);
    var domainText = null;
    var storyHeader = <View><Text style={styles.storyTitle}>{data.title}</Text></View>;

    var linkPress = function(u){
      if (!u) return;
      SafariView.show({
        url: u
      });
      setTimeout(function(){
        LinkActions.addLink(url);
      }, 1000); // Set the link inactive after 1 second
    };

    var linkLongPress = function(u, t){
      if (!u) return;
      ActivityView.show({
        text: t || '',
        url: u,
      });
    };

    if (externalLink){
      domainText = <Text style={styles.storyDomain}>{domainify(data.url)}</Text>;
      storyHeader = (
        <TouchableHighlight onPress={linkPress.bind(null, url)} onLongPress={linkLongPress.bind(null, url, data.title)}>
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
      HTMLView.processDOM(data.content, function(elements){
        contentElements = elements;
      });

      var pollElements;
      if (data.poll && data.poll.length){
        var maxPoints = Math.max.apply(null, data.poll.map(function(p){ return p.points }));
        pollElements = data.poll.map(function(p){
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
          <TouchableHighlight onPress={linkPress.bind(null, hnURL)} onLongPress={linkLongPress.bind(null, hnURL, data.title)}>
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
});

module.exports = CommentsView;
