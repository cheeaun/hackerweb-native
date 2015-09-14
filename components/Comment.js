'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  Image,
} = React;

var SafariView = require('react-native-safari-view');
var HTMLView = require('../components/HTMLView');

var colors = require('../colors');

var styles = StyleSheet.create({
  comment: {
    padding: 15,
    flex: 1,
    flexDirection: 'row',
  },
  subComment: {
    paddingTop: 0,
    marginTop: -10
  },
  commentInner: {
    flex: 1,
    flexDirection: 'column',
  },
  commentMetadata: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: '500',
    color: colors.userColor,
    flex: 1,
  },
  opUser: {
    fontSize: 11,
    color: colors.opColor,
  },
  commentDeleted: {
    flex: 1,
  },
  commentTime: {
    color: colors.insignificantColor,
  },
  commentArrowIcon: {
    width: 8,
    height: 9,
    marginRight: 6,
    marginTop: 4,
  },
});

var Comment = React.createClass({
  mixins: [ React.addons.PureRenderMixin ],
  render: function(){
    var data = this.props.data;
    var op = this.props.op;
    var level = data.level;
    var commentArrow = level > 0 ? <Image style={styles.commentArrowIcon} source={require('image!comment-arrow')}/> : null;
    var linkPress = function(url){
      SafariView.show({
        url: url
      });
    };
    var innerComment = data.deleted ? (
      <View style={styles.commentMetadata}>
        <Text style={styles.commentDeleted}>[deleted]</Text>
        <Text style={styles.commentTime}>{data.time_ago}</Text>
      </View>
    ) : (
      <View>
        <View style={styles.commentMetadata}>
          <Text style={styles.commentUser}><Text>{data.user}</Text> {op == data.user && <Text style={styles.opUser}>OP</Text>}</Text>
          <Text style={styles.commentTime}>{data.time_ago}</Text>
        </View>
        <HTMLView html={data.content} onLinkPress={linkPress}/>
      </View>
    );
    return (
      <View style={[styles.comment, level > 0 && styles.subComment]}>
        {commentArrow}
        <View style={styles.commentInner}>
          {innerComment}
        </View>
      </View>
    );
  }
});

module.exports = Comment;
