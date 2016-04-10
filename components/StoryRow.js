'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Image,
} from 'react-native';

import LinkStore from '../stores/LinkStore';
import LinkActions from '../actions/LinkActions';
import domainify from '../utils/domainify';

import colors from '../colors';

const styles = StyleSheet.create({
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
});

export default class StoryRow extends Component {
  constructor(props){
    super(props);
    const {data} = props;
    const {links} = LinkStore.getState();
    this.state = {
      visited: links.indexOf(data.url) >= 0,
    };
    this._onLinkChange = this._onLinkChange.bind(this);
  }
  componentDidMount(){
    LinkStore.listen(this._onLinkChange);
    LinkActions.getLinks();
  }
  componentWillUnmount(){
    LinkStore.unlisten(this._onLinkChange);
  }
  _onLinkChange(state){
    this.setState({
      visited: state.links.includes(this.props.data.url),
    });
  }
  _onStoryLayout(e){
    /*
      Temporary flexbox workaround for:
      - https://github.com/facebook/react-native/issues/5141
      - https://github.com/facebook/react-native/issues/1472
    */
    const {height} = e.nativeEvent.layout;
    const {commentButton} = this.refs;
    if (commentButton) commentButton.setNativeProps({ style: { height } });
  }
  render(){
    const {data, position, onCommentPress, ...touchableProps} = this.props;
    const {url, type, comments_count, points, time_ago} = data;
    const externalLink = !/^item/i.test(url);
    const {visited} = this.state;

    // Turns out that longPress is not common at all in native iOS apps
    // But I actually like this feature on the browser, thus I'm keeping
    // this but delay it slightly longer than default 500
    const delayLongPress = 1000;

    return (
      <TouchableHighlight {...touchableProps} delayLongPress={delayLongPress}>
        <View style={styles.story}>
          <View style={styles.storyPosition}>
            <Text style={styles.storyPositionNumber}>{position}</Text>
          </View>
          <View style={styles.storyInfo} onLayout={this._onStoryLayout.bind(this)}>
            <Text style={[styles.storyTitle, visited && styles.storyTitleVisited]}>{data.title}</Text>
            {externalLink && <Text numberOfLines={1} style={styles.storyDomain}>{domainify(url)}</Text>}
            {(() => {
              if (type == 'job'){
                return <Text style={styles.storyMetadata}>{time_ago}</Text>;
              } else {
                const commentsText = comments_count>0 && <Text> &middot; {comments_count} comment{comments_count != 1 && 's'}</Text>;
                return (
                  <View style={styles.storyMetadataWrap}>
                    <Text style={styles.storyMetadata}>{points} point{points != 1 && 's'} by {data.user} </Text>
                    <Text style={styles.storyMetadata}>{time_ago}{commentsText}</Text>
                  </View>
                );
              }
            })()}
          </View>
          {type != 'job' && (() => {
            if (externalLink){
              return (
                <TouchableOpacity onPress={onCommentPress}>
                  <View style={styles.storyComments} ref="commentButton">
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
}
