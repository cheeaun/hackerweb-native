'use strict';

import React, {
  Component,
  StyleSheet,
  ActivityIndicatorIOS,
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ActionSheetIOS,
  ListView,
  LayoutAnimation,
  Platform,
} from 'react-native';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

import ChromeCustomTabsClient from 'react-native-chrome-custom-tabs';

import StoryStore from '../stores/StoryStore';
import StoryActions from '../actions/StoryActions';

import CommentRow from '../components/CommentRow';
import LoadingIndicator from '../components/LoadingIndicator';
import HTMLView from '../components/HTMLView';
import ProgressBar from '../components/ProgressBar';
import showBrowser from '../utils/showBrowser';
import showActivity from '../utils/showActivity';
import domainify from '../utils/domainify';

import colors from '../colors';

const hairlineWidth = isIOS ? StyleSheet.hairlineWidth : 1;
const styles = StyleSheet.create({
  viewCommentsBlank: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    backgroundColor: colors.sectionBackgroundColor,
  },
  footer: {
    borderTopColor: colors.separatorColor,
    borderTopWidth: hairlineWidth,
    height: 30,
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
    width: isIOS ? 12 : 10,
    height: isIOS ? 9 : 10,
    marginLeft: 2,
    marginRight: 4,
    opacity: isIOS ? 1 : .54,
  },
  storyLink: {
    backgroundColor: colors.viewBackgroundColor,
  },
  storyTitle: {
    color: colors.primaryTextColor,
    fontSize: 17,
  },
  storySection: {
    padding: 15,
  },
  storyDomain: {
    fontSize: isIOS ? 13 : 14,
    color: colors.domainColor,
  },
  storyMetadataWrap: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginBottom: 2,
  },
  storyMetadata: {
    fontSize: isIOS ? 13 : 14,
    color: colors.insignificantColor,
  },
  storyContent: {
    backgroundColor: colors.sectionBackgroundColor,
    padding: isIOS ? 15 : 16,
    borderTopColor: colors.separatorColor,
    borderTopWidth: hairlineWidth,
    borderBottomColor: colors.separatorColor,
    borderBottomWidth: hairlineWidth,
    marginBottom: 30,
  },
  separator: {
    backgroundColor: colors.separatorColor,
    height: hairlineWidth,
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
  touchableLink: {
    borderRadius: 3,
    transform: [
      {translateX: -2},
      {translateY: -2}
    ]
  },
  touchableLinkInner: {
    padding: 2
  },
});

export default class CommentsView extends Component {
  constructor(props){
    super(props);
    var { story, storyLoading, storyError } = StoryStore.getState();
    this.state = {
      data: story,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
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
    const {story} = state;
    const comments = (story && story.comments) || [];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      data: story,
      dataSource: this.state.dataSource.cloneWithRows(comments),
      loading: state.storyLoading,
      error: state.storyError,
    });

    if (isAndroid && story && story.url){
      const externalLink = !/^item/i.test(story.url);
      const url = externalLink ? story.url : `https://news.ycombinator.com/item?id=${story.id}`;
      ChromeCustomTabsClient.mayLaunchUrl(url);
    }

    /* Note:
      Title update doesn't work yet due to https://github.com/facebook/react-native/issues/476
      Hopefully this works https://github.com/bjornco/react-native/commit/5fcb2a8673a2c17f4fdb03327008397a10a9c53a
    */
    if (state.story && state.story.title){
      var route = this.props.navigator.navigationContext.currentRoute;
      if (!route) return;
      if (route.title != state.story.title){
        route.title = state.story.title;
        this.props.navigator.replace(route);
      }
    }
  }
  _renderHeader(){
    let {data, loading, error} = this.state;
    data = data || this.props.data;
    const commentsText = <Text>&middot; {data.comments_count} comment{data.comments_count != 1 && 's'}</Text>;
    const url = data.url;
    const externalLink = !/^item/i.test(url);
    let domainText = null;
    let storyHeader = null;

    if (externalLink){
      domainText = <Text style={styles.storyDomain}>{domainify(data.url)}</Text>;
      storyHeader = (
        <TouchableHighlight onPress={showBrowser.bind(null, url)} onLongPress={showActivity.bind(null, url, data.title)} style={styles.touchableLink}>
          <View style={[styles.storyLink, styles.touchableLinkInner]}>
            <Text style={styles.storyTitle}>{data.title}</Text>
            {domainText}
          </View>
        </TouchableHighlight>
      );
    } else {
      storyHeader = <View><Text style={styles.storyTitle}>{data.title}</Text></View>;
    }

    const hnShortURL = `news.ycombinator.com/item?id=${data.id}`;
    const hnURL = `https://${hnShortURL}`;

    let contentSection;
    if (data.content){
      let pollElements;
      if (data.poll && data.poll.length){
        let maxPoints = Math.max.apply(null, data.poll.map((p) => p.points ));
        pollElements = data.poll.map((p) => {
          let {points} = p;
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

      contentSection = (
        <View style={styles.storyContent}>
          <HTMLView html={data.content} onLinkPress={showBrowser}/>
          {pollElements}
        </View>
      );
    }

    let commentsSection;
    if (data && data.comments && data.comments.length){
      commentsSection = null;
    } else if (loading){
      commentsSection = (
        <View style={styles.viewCommentsBlank}>
          <LoadingIndicator/>
        </View>
      );
    } else if (error){
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
    } else {
      commentsSection = (
        <View style={styles.viewCommentsBlank}>
          <Text style={styles.noCommentsText}>No comments.</Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.storySection}>
          {storyHeader}
          <View style={styles.storyMetadataWrap}>
            <Text style={styles.storyMetadata}>{data.points} points by {data.user} </Text>
            <Text style={styles.storyMetadata}>{data.time_ago} {data.comments_count>0 && commentsText}</Text>
          </View>
          <TouchableHighlight onPress={showBrowser.bind(null, hnURL)} onLongPress={showActivity.bind(null, hnURL, data.title)} style={styles.touchableLink}>
            <View style={[styles.externalLink, styles.touchableLinkInner]}>
              <Image style={styles.externalArrowIcon} source={require('../images/external-arrow.png')}/>
              <Text style={styles.storyMetadata}>{hnShortURL}</Text>
            </View>
          </TouchableHighlight>
        </View>
        {contentSection}
        <View style={styles.separator}/>
        {commentsSection}
      </View>
    );
  }
  render(){
    const {data, dataSource} = this.state;
    const comments = (data && data.comments) || [];
    const hasManyComments = JSON.stringify(comments).length > 20*1000;
    const op = data && data.user;
    return (
      <ListView
        renderHeader={this._renderHeader.bind(this)}
        dataSource={dataSource}
        pageSize={5}
        renderRow={(comment) => <CommentRow key={comment.id} comment={comment} op={op} hasManyComments={hasManyComments}/>}
        renderSeparator={(sectionID, rowID) => <View key={rowID} style={styles.separator}/>}
        renderFooter={() => <View style={styles.footer}/>}
      />
    );
  }
}
