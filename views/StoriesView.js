'use strict';

import React from 'react-native';
var {
  Component,
  StyleSheet,
  View,
  Text,
  ListView,
  TouchableOpacity,
  Image,
} = React;

import SafariView from 'react-native-safari-view';
import ActivityView from 'react-native-activity-view';

import StoryStore from '../stores/StoryStore';
import StoryActions from '../actions/StoryActions';
import LinkStore from '../stores/LinkStore';
import LinkActions from '../actions/LinkActions';

import LoadingIndicator from '../components/LoadingIndicator';
import ListItemIOS from '../components/ListItemIOS';
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

export default class StoriesView extends Component {
  constructor(props){
    super(props);
    var { stories, storiesLoading, storiesError } = StoryStore.getState();
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
  componentDidMount(){
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
    this.setState({
      // Have to "clone" state.stories because `cloneWithRows` is confused with the reference
      dataSource: this.state.dataSource.cloneWithRows([].concat(state.stories)),
      stories: state.stories,
      loading: state.storiesLoading,
      error: state.storiesError,
    });
  }
  _onLinkChange(state){
    this.setState({
      links: state.links,
    });
  }
  _navigateToComments(data){
    this.props.navigator.push({
      title: data.title,
      component: CommentsView,
      wrapperStyle: styles.wrapper,
      passProps: {
        data: data
      }
    });
  }
  renderRow(row, sectionID, rowID, highlightRow){
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
        <Image style={styles.commentIcon} source={require('../images/comments-icon.png')}/>
      </View>
    </TouchableOpacity> : <View style={styles.storyDisclosure}>
      <Image style={styles.disclosureIcon} source={require('../images/disclosure-indicator.png')}/>
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
  }
  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return <View key={rowID} style={[styles.itemSeparator, adjacentRowHighlighted && styles.itemHighligtedSeparator]}/>;
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
      />
    );
  }
}
