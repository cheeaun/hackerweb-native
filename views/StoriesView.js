'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  ListView,
  TouchableOpacity,
  Image,
} = React;

var SafariView = require('react-native-safari-view');
var ActivityView = require('react-native-activity-view');

var StoryStore = require('../stores/StoryStore');
var StoryActions = require('../actions/StoryActions');
var LinkStore = require('../stores/LinkStore');
var LinkActions = require('../actions/LinkActions');

var LoadingIndicator = require('../components/LoadingIndicator');
var ListItemIOS = require('../components/ListItemIOS');
var HTMLView = require('../components/HTMLView');
var CommentsView = require('./CommentsView');
var domainify = require('../utils/domainify');
var devicePx = require('../utils/devicePx');

var colors = require('../colors');

var styles = StyleSheet.create({
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
    height: devicePx,
    backgroundColor: colors.separatorColor,
    marginLeft: 15,
    marginTop: -devicePx,
  },
  itemHighligtedSeparator: {
    opacity: 0,
  },
  storyPosition: {
    paddingRight: 5,
    paddingTop: 10,
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
    fontSize: 17
  },
  storyTitleVisited: {
    color: colors.insignificantColor,
  },
  storyDomain: {
    fontSize: 13,
    color: colors.domainColor,
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
});

var StoriesView = React.createClass({
  getInitialState: function(){
    var { stories, storiesLoading, storiesError } = StoryStore.getState();
    var { links } = LinkStore.getState();
    return {
      stories: stories,
      loading: storiesLoading,
      error: storiesError,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      links: links,
    };
  },
  componentDidMount: function(){
    StoryStore.listen(this._onChange);
    StoryActions.fetchStories();
    LinkStore.listen(this._onLinkChange);
    LinkActions.getLinks();
  },
  componentWillUnmount: function(){
    StoryStore.unlisten(this._onChange);
    LinkStore.unlisten(this._onLinkChange);
  },
  _onChange: function(state){
    this.setState({
      // Have to "clone" state.stories because `cloneWithRows` is confused with the reference
      dataSource: this.state.dataSource.cloneWithRows([].concat(state.stories)),
      stories: state.stories,
      loading: state.storiesLoading,
      error: state.storiesError,
    });
  },
  _onLinkChange: function(state){
    this.setState({
      links: state.links,
    });
  },
  _navigateToComments: function(data){
    this.props.navigator.push({
      title: data.title,
      component: CommentsView,
      wrapperStyle: styles.wrapper,
      passProps: {
        data: data
      }
    });
  },
  renderRow: function(row, sectionID, rowID, highlightRow){
    var position = parseInt(rowID, 10) + 1;
    var url = row.url;
    var visited = this.state.links.includes(url);
    var externalLink = !/^item/i.test(url);

    var self = this;
    var linkPress = externalLink ? function(){
      SafariView.show({
        url: url
      });
      setTimeout(function(){
        LinkActions.addLink(url);
      }, 1000); // Set the link inactive after 1 second
    } : this._navigateToComments.bind(this, row);
    var linkLongPress = function(){
      ActivityView.show({
        text: row.title,
        url: url,
      });
    };

    var domainText = externalLink ? <Text numberOfLines={1} style={styles.storyDomain}>{domainify(url)}</Text> : null;

    if (row.type == 'job'){
      return (
        <ListItemIOS onHighlight={() => highlightRow(sectionID, rowID)} onUnhighlight={() => highlightRow(null, null)} onPress={linkPress}>
          <View style={styles.storyPosition}>
            <Text style={styles.storyPositionNumber}>{position}</Text>
          </View>
          <View style={styles.storyInfo}>
            <Text style={[styles.storyTitle, visited && styles.storyTitleVisited]}>{row.title}</Text>
            {domainText}
            <Text style={styles.storyMetadata}>{row.time_ago}</Text>
          </View>
        </ListItemIOS>
      );
    }

    var commentsText = <Text>&middot; {row.comments_count} comment{row.comments_count != 1 && 's'}</Text>;
    var disclosureButton = externalLink ? <TouchableOpacity onPress={this._navigateToComments.bind(this, row)}>
      <View style={styles.storyComments}>
        <Image style={styles.commentIcon} source={require('image!comments-icon')}/>
      </View>
    </TouchableOpacity> : <View style={styles.storyDisclosure}>
      <Image style={styles.disclosureIcon} source={require('image!disclosure-indicator')}/>
    </View>;

    return (
      <ListItemIOS onHighlight={() => highlightRow(sectionID, rowID)} onUnhighlight={() => highlightRow(null, null)} onPress={linkPress} onLongPress={linkLongPress}>
        <View style={styles.storyPosition}>
          <Text style={styles.storyPositionNumber}>{position}</Text>
        </View>
        <View style={styles.storyInfo}>
          <Text style={[styles.storyTitle, visited && styles.storyTitleVisited]}>{row.title}</Text>
          {domainText}
          <Text style={styles.storyMetadata}>{row.points} point{row.points != 1 && 's'} by {row.user}</Text>
          <Text style={styles.storyMetadata}>{row.time_ago} {row.comments_count ? commentsText : null}</Text>
        </View>
        {disclosureButton}
      </ListItemIOS>
    );
  },
  renderSeparator: function(sectionID, rowID, adjacentRowHighlighted){
    return <View style={[styles.itemSeparator, adjacentRowHighlighted && styles.itemHighligtedSeparator]}/>;
  },
  render: function(){
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
        initialListSize={10}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
      />
    );
  }
});

module.exports = StoriesView;
