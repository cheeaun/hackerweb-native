'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Text,
  ListView,
  TouchableOpacity,
  ActionSheetIOS,
  LayoutAnimation,
  Platform,
} from 'react-native';

const isIOS = Platform.OS === 'ios';

import SafariView from 'react-native-safari-view';

import StoryStore from '../stores/StoryStore';
import StoryActions from '../actions/StoryActions';
import LinkActions from '../actions/LinkActions';

import StoryRow from '../components/StoryRow';
import LoadingIndicator from '../components/LoadingIndicator';
import CommentsView from './CommentsView';
import showBrowser from '../utils/showBrowser';
import showActivity from '../utils/showActivity';

import colors from '../colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    opacity: .6,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separatorColor,
    marginLeft: isIOS ? 15 : 0,
    marginTop: -StyleSheet.hairlineWidth,
  },
  itemHighligtedSeparator: {
    opacity: 0,
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

export default class StoriesView extends Component {
  constructor(props){
    super(props);
    const { stories, storiesLoading, storiesError, hasMoreStories } = StoryStore.getState();
    this.state = {
      stories,
      loading: storiesLoading,
      error: storiesError,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      hasMoreStories,
    };
    this._onChange = this._onChange.bind(this);
  }
  componentDidMount(){
    StoryStore.listen(this._onChange);
    StoryActions.fetchStories();
  }
  componentWillUnmount(){
    StoryStore.unlisten(this._onChange);
  }
  _onChange(state){
    const {stories, storiesLoading, storiesError, hasMoreStories} = state;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      stories,
      dataSource: this.state.dataSource.cloneWithRows([].concat(stories)),
      loading: storiesLoading,
      error: storiesError,
      hasMoreStories,
    });
  }
  _navigateToComments(data){
    this.props.navigator.push({
      id: 'Comments',
      title: data.title,
      component: CommentsView,
      wrapperStyle: styles.wrapper,
      rightButtonIcon: require('../images/share-icon.png'),
      onRightButtonPress: showActivity.bind(null, `https://news.ycombinator.com/item?id=${data.id}`, data.title),
      passProps: {
        data: data,
      }
    });
    // Log link visit to History
    const {url} = data;
    if (/^item/i.test(url)) LinkActions.addLink(url);
  }
  _renderRow(row, sectionID, rowID, highlightRow){
    const position = parseInt(rowID, 10) + 1;
    const {url} = row;
    const externalLink = !/^item/i.test(url);
    const navToComments = this._navigateToComments.bind(this, row);
    const linkPress = externalLink ? showBrowser.bind(null, url) : navToComments;

    return (
      <StoryRow position={position} data={row} onCommentPress={navToComments} onPress={linkPress} onLongPress={showActivity.bind(null, url, row.title)} onShowUnderlay={() => highlightRow(sectionID, rowID)} onHideUnderlay={() => highlightRow(null, null)}/>
    );
  }
  _renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return <View key={rowID} style={[styles.itemSeparator, adjacentRowHighlighted && styles.itemHighligtedSeparator]}/>;
  }
  _fetchMoreStories(){
    // Delay the fetching a bit to create that sense of something's happening in the background
    if (this._fetchingMore) return;
    this._fetchingMore = true;
    setTimeout(() => {
      StoryActions.fetchMoreStories();
      this._fetchingMore = false;
    }, 300);
  }
  _renderFooter(){
    const {hasMoreStories, stories} = this.state;
    if (hasMoreStories && stories && stories.length <= 30){
      return (
        <TouchableOpacity onPress={this._fetchMoreStories.bind(this)}>
          <Text style={styles.moreLink}>More&hellip;</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }
  render(){
    const {loading, error, dataSource} = this.state;
    if (loading){
      return (
        <View style={styles.viewLoading}>
          <LoadingIndicator/>
        </View>
      );
    }
    if (error){
      return (
        <View style={styles.viewError}>
          <Text style={styles.errorText}>Couldn't load stories.</Text>
          <Text style={styles.errorText}>{error && error.message ? error.message : '😭'}</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <ListView
          style={isIOS && styles.navbarSpacing}
          pageSize={10}
          dataSource={dataSource}
          renderRow={this._renderRow.bind(this)}
          renderSeparator={this._renderSeparator.bind(this)}
          renderFooter={this._renderFooter.bind(this)}
        />
        {/* Temporary FIX: Prevent the taps on NavigatorIOS buttons "leaking" into the ListView rows' taps */}
        {isIOS && <View onStartShouldSetResponder={() => false} style={{width: 100, height: 10, position: 'absolute', top: styles.navbarSpacing-2}} />}
        {isIOS && <View onStartShouldSetResponder={() => false} style={{width: 60, height: 10, position: 'absolute', top: styles.navbarSpacing-2, right: 0}} />}
      </View>
    );
  }
}
