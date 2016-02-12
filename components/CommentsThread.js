'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Text,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';

import Comment from './Comment';
import Button from './Button';

import colors from '../colors';

const styles = StyleSheet.create({
  indentedThread: {
    marginLeft: 14,
  },
  commentsSeparator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separatorColor,
    height: 0,
  },
  repliesButton: {
    marginTop: -7,
    marginRight: 15,
    marginBottom: 15,
    marginLeft: 15,
  },
  moreLink: {
    padding: 19,
    textAlign: 'center',
    color: colors.linkColor,
    fontSize: 17,
  }
});

const SubCommentsThread = (props) => {
  const {data, op} = props;
  if (!data || !data.length) return <View></View>;
  return (
    <View>
      {data.map((comment) => {
        return (
          <View key={comment.id} style={comment.level > 1 && styles.indentedThread}>
            <Comment data={comment} op={op}/>
            <SubCommentsThread data={comment.comments} op={op}/>
          </View>
        );
      })}
    </View>
  );
}

const LIMIT = 30;
export default class CommentsThread extends Component {
  constructor(props){
    super(props);
    this.state = {
      expandedComments: [], // List of comment IDs with expand/collapse buttons
      limit: LIMIT,
    };
  }
  _toggleComments(commentID){
    var {expandedComments} = this.state;
    var index = expandedComments.indexOf(commentID);
    if (index >= 0){
      expandedComments.splice(index, 1);
    } else {
      expandedComments.push(commentID);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      expandedComments: expandedComments,
    });
  }
  _increaseLimit(){
    this.setState({
      limit: this.state.limit + LIMIT,
    });
  }
  render(){
    const {data, op} = this.props;
    if (!data || !data.length) return null;
    const {limit} = this.state;
    const tooManyComments = JSON.stringify(data).length > 20*1000;
    const commentItems = data.slice(0, limit).map((comment) => {
      let subComments = <SubCommentsThread data={comment.comments} op={op}/>;
      let {comments} = comment;
      let hasComments = comments && comments.length;
      let hasOnlyOneComment = comments.length == 1 && !comments[0].comments.length;

      if (tooManyComments && hasComments && !hasOnlyOneComment){
        let expanded = this.state.expandedComments.indexOf(comment.id) >= 0;
        let commentsCount = comment.comments.length;
        let dive = function(comments){
          comments.forEach(function(c){
            var len = c.comments.length;
            commentsCount += len;
            if (len) dive(c.comments);
          });
        };
        dive(comment.comments);

        let subCommentsButton = commentsCount && <Button onPress={this._toggleComments.bind(this, comment.id)} buttonStyles={styles.repliesButton}>{commentsCount} {commentsCount == 1 ? 'reply' : 'replies'}</Button>;

        return (
          <View key={comment.id}>
            <Comment data={comment} op={op}/>
            {subCommentsButton}
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
    });

    return (
      <View>
        {commentItems}
        {data.length > limit && <TouchableOpacity onPress={this._increaseLimit.bind(this)}>
          <Text style={styles.moreLink}>More comments&hellip;</Text>
        </TouchableOpacity>}
      </View>
    );
  }
}
