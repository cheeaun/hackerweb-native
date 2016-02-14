'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Text,
  ListView,
  TouchableOpacity,
  ActionSheetIOS,
} from 'react-native';

import SafariView from 'react-native-safari-view';

import StoryStore from '../stores/StoryStore';
import StoryActions from '../actions/StoryActions';

import StoryRow from '../components/StoryRow';
import LoadingIndicator from '../components/LoadingIndicator';
import CommentsView from './CommentsView';
import showBrowser from '../utils/showBrowser';

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
      title: data.title,
      component: CommentsView,
      wrapperStyle: styles.wrapper,
      rightButtonIcon: require('../images/share-icon.png'),
      onRightButtonPress: showActivity.bind(null, `https://news.ycombinator.com/item?id=${data.id}`, data.title),
      passProps: {
        data: data,
      }
    });
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
  _renderFooter(){
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
        </View>
      );
    }
    return (
      <ListView
        style={styles.navbarSpacing}
        pageSize={5}
        dataSource={dataSource}
        renderRow={this._renderRow.bind(this)}
        renderSeparator={this._renderSeparator.bind(this)}
        renderFooter={this._renderFooter.bind(this)}
      />
    );
  }
}
