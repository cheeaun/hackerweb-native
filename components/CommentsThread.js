'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
} = React;

var Comment = require('./Comment');
var Button = require('./Button');
var devicePx = require('../utils/devicePx');

var colors = require('../colors');

var styles = StyleSheet.create({
  indentedThread: {
    marginLeft: 14,
  },
  commentsSeparator: {
    borderTopWidth: devicePx,
    borderTopColor: colors.separatorColor,
    height: 0,
  },
  repliesButton: {
    marginTop: -7,
    marginRight: 15,
    marginBottom: 15,
    marginLeft: 15,
  },
});

var CommentsThread = React.createClass({
  getInitialState: function(){
    return {
      expandedComments: [] // List of comment IDs with expand/collapse buttons
    };
  },
  _toggleComments: function(commentID){
    var expandedComments = this.state.expandedComments;
    var index = expandedComments.indexOf(commentID);
    if (index >= 0){
      expandedComments.splice(index, 1);
    } else {
      expandedComments.push(commentID);
    }
    this.setState({
      expandedComments: expandedComments
    });
  },
  render: function(){
    var data = this.props.data || [];
    var level = this.props.level || 0;
    var op = this.props.op;
    var self = this;
    var tooManyComments = JSON.stringify(data).length > 20*1000;
    var commentItems = data.map(function(comment){
      var hasComments = comment.comments && comment.comments.length;
      var subComments = hasComments ? <CommentsThread data={comment.comments} op={op} level={comment.level + 1}/> : null;
      var expanded = self.state.expandedComments.indexOf(comment.id) >= 0;

      if (level == 0){
        if (tooManyComments){
          var commentsCount = comment.comments.length;
          var dive = function(comments){
            comments.forEach(function(c){
              var len = c.comments.length;
              commentsCount += len;
              if (len) dive(c.comments);
            });
          };
          dive(comment.comments);

          return (
            <View key={comment.id}>
              <Comment data={comment} op={op}/>
              <Button onPress={self._toggleComments.bind(self, comment.id)} buttonStyles={styles.repliesButton}>{commentsCount} {commentsCount == 1 ? 'reply' : 'replies'}</Button>
              {expanded ? subComments : null}
              <View style={styles.commentsSeparator}></View>
            </View>
          );
        } else {
          return (
            <View key={comment.id}>
              <Comment data={comment} op={op}/>
              {subComments}
              <View style={styles.commentsSeparator}></View>
            </View>
          );
        }
      }
      return (
        <View key={comment.id} style={level > 1 && styles.indentedThread}>
          <Comment data={comment} op={op}/>
          {subComments}
        </View>
      );
    });
    return <View>{commentItems}</View>;
  }
});

module.exports = CommentsThread;
