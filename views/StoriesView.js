'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Text,
  ListView,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  ActionSheetIOS,
} from 'react-native';

import SafariView from 'react-native-safari-view';

import StoryStore from '../stores/StoryStore';
import StoryActions from '../actions/StoryActions';
import LinkStore from '../stores/LinkStore';
import LinkActions from '../actions/LinkActions';

import LoadingIndicator from '../components/LoadingIndicator';
import HTMLView from '../components/HTMLView';
import CommentsView from './CommentsView';
import domainify from '../utils/domainify';

import colors from '../colors';

const styles = StyleSheet.create({
  navbarSpacing: {
    marginTop: 64,
  },
  viewLoading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewError: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    opacity: .6,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separatorColor,
    marginLeft: 15,
    marginTop: -StyleSheet.hairlineWidth,
  },
  itemHighligtedSeparator: {
    opacity: 0,
  },
  story: {
    backgroundColor: colors.sectionBackgroundColor,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  storyPosition: {
    paddingTop: 10,
    paddingLeft: 15,
  },
  storyPositionNumber: {
    width: 22,
    textAlign: 'center',
    color: colors.insignificantColor,
    fontSize: 17,
  },
  storyInfo: {
    padding: 10,
    flex: 1,
  },
  storyComments: {
    padding: 10,
  },
  storyDisclosure: {
    paddingVertical: 15,
    paddingRight: 15,
    paddingLeft: 5,
  },
  storyTitle: {
    fontSize: 17,
  },
  storyTitleVisited: {
    color: colors.insignificantColor,
  },
  storyDomain: {
    fontSize: 13,
    color: colors.domainColor,
  },
  storyMetadataWrap: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  storyMetadata: {
    fontSize: 13,
    color: colors.insignificantColor,
  },
  commentIcon: {
    width: 20,
    height: 19,
    marginHorizontal: 2,
    marginTop: 3,
    marginBottom: 2,
  },
  disclosureIcon: {
    width: 8,
    height: 13,
    marginLeft: 2,
    marginTop: 1,
  },
  wrapper: {
    backgroundColor: colors.viewBackgroundColor,
  },
  moreLink: {
    padding: 19,
    textAlign: 'center',
    color: colors.linkColor,
    fontSize: 17,
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
  ActionSheetIOS.showShareActionSheetWithOptions({
    url: u,
    message: t || '',
  }, () => {}, () => {});
};

export default class StoriesView extends Component {
  constructor(props){
    super(props);
    var { stories, storiesLoading, storiesError, hasMoreStories } = StoryStore.getState();
    var { links } = LinkStore.getState();
    this.state = {
      stories,
      loading: storiesLoading,
      error: storiesError,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      links,
    };
    this._onChange = this._onChange.bind(this);
    this._onLinkChange = this._onLinkChange.bind(this);
  }
  componentWillMount(){
    StoryStore.listen(this._onChange);
    StoryActions.fetchStories();
    LinkStore.listen(this._onLinkChange);
    LinkActions.getLinks();
  }
  componentWillUnmount(){
    StoryStore.unlisten(this._onChange);
    LinkStore.unlisten(this._onLinkChange);
  }
  _onChange(state){
    let stories = state.stories.map((story) => {
      story._visited = this.state.links.includes(story.url);
      return Object.assign({}, story);
    });
    this.setState({
      stories,
      // Have to "clone" state.stories because `cloneWithRows` is confused with the reference
      dataSource: this.state.dataSource.cloneWithRows(stories),
      loading: state.storiesLoading,
      error: state.storiesError,
      hasMoreStories: state.hasMoreStories,
    });
  }
  _onLinkChange(state){
    this.setState({
      links: state.links,
    });
    this._onChange(this.state);
  }
  _navigateToComments(data){
    this.props.navigator.push({
      title: data.title,
      component: CommentsView,
      wrapperStyle: styles.wrapper,
      rightButtonIcon: require('../images/share-icon.png'),
      onRightButtonPress: showActivity.bind(null, `https://news.ycombinator.com/item?id=${data.id}`, data.title),
      passProps: {
        data: data
      }
    });
  }
  _onStoryLayout(e, rowID){
    /*
      Temporary workaround for:
      - https://github.com/facebook/react-native/issues/5141
      - https://github.com/facebook/react-native/issues/1472
    */
    const height = e.nativeEvent.layout.height;
    const ref = this[`_disclosure-${rowID}`];
    if (ref) ref.setNativeProps({ style: { height } });
  }
  renderRow(row, sectionID, rowID, highlightRow){
    var position = parseInt(rowID, 10) + 1;
    var url = row.url;
    var visited = row._visited;
    var externalLink = !/^item/i.test(url);

    var self = this;
    var linkPress = externalLink ? showBrowser.bind(null, url) : this._navigateToComments.bind(this, row);
    var domainText = externalLink && (<Text numberOfLines={1} style={styles.storyDomain}>{domainify(url)}</Text>);

    return (
      <TouchableHighlight onPress={linkPress} onLongPress={showActivity.bind(null, url, row.title)} onShowUnderlay={() => highlightRow(sectionID, rowID)} onHideUnderlay={() => highlightRow(null, null)}>
        <View style={styles.story}>
          <View style={styles.storyPosition}>
            <Text style={styles.storyPositionNumber}>{position}</Text>
          </View>
          <View style={styles.storyInfo} onLayout={e => this._onStoryLayout.call(this, e, rowID)}>
            <Text style={[styles.storyTitle, visited && styles.storyTitleVisited]}>{row.title}</Text>
            {domainText}
            {(() => {
              if (row.type == 'job'){
                return <Text style={styles.storyMetadata}>{row.time_ago}</Text>;
              } else {
                var commentsText = row.comments_count>0 && (<Text> &middot; {row.comments_count} comment{row.comments_count != 1 && 's'}</Text>);
                return (
                  <View style={styles.storyMetadataWrap}>
                    <Text style={styles.storyMetadata}>{row.points} point{row.points != 1 && 's'} by {row.user} </Text>
                    <Text style={styles.storyMetadata}>{row.time_ago}{commentsText}</Text>
                  </View>
                );
              }
            })()}
          </View>
          {row.type != 'job' && (() => {
            if (externalLink){
              return (
                <TouchableOpacity onPress={this._navigateToComments.bind(self, row)}>
                  <View style={styles.storyComments} ref={(component) => this[`_disclosure-${rowID}`] = component}>
                    <Image style={styles.commentIcon} source={require('../images/comments-icon.png')}/>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return (
                <View style={styles.storyDisclosure}>
                  <Image style={styles.disclosureIcon} source={require('../images/disclosure-indicator.png')}/>
                </View>
              );
            }
          })()}
        </View>
      </TouchableHighlight>
    );
  }
  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return <View key={rowID} style={[styles.itemSeparator, adjacentRowHighlighted && styles.itemHighligtedSeparator]}/>;
  }
  renderFooter(){
    const {hasMoreStories, stories} = this.state;
    if (hasMoreStories && stories && stories.length <= 30){
      return (
        <TouchableOpacity onPress={StoryActions.fetchMoreStories}>
          <Text style={styles.moreLink}>More&hellip;</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }
  render(){
    if (this.state.loading){
      return (
        <View style={styles.viewLoading}>
          <LoadingIndicator/>
        </View>
      );
    }
    if (this.state.error){
      return (
        <View style={styles.viewError}>
          <Text style={styles.errorText}>Couldn't load stories.</Text>
        </View>
      );
    }
    return (
      <ListView
        style={styles.navbarSpacing}
        initialListSize={10}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow.bind(this)}
        renderSeparator={this.renderSeparator.bind(this)}
        renderFooter={this.renderFooter.bind(this)}
      />
    );
  }
}
