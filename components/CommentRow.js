'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  LayoutAnimation,
} from 'react-native';

import CommentsThread from '../components/CommentsThread';
import Comment from '../components/Comment';
import Button from '../components/Button';

import colors from '../colors';

const styles = StyleSheet.create({
  comment: {
    backgroundColor: colors.sectionBackgroundColor,
  },
  repliesButton: {
    marginTop: -7,
    marginRight: 15,
    marginBottom: 15,
    marginLeft: 15,
  },
});

export default class CommentRow extends Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: false,
    };
  }
  _toggleComments(){
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      expanded: !this.state.expanded,
    });
  }
  render(){
    const {op, comment, hasManyComments} = this.props;
    const {comments} = comment;
    const commentsThread = <CommentsThread data={comments} op={op}/>;
    const hasComments = comments && comments.length;
    const hasOnlyOneComment = comments.length == 1 && !comments[0].comments.length;

    if (hasManyComments && hasComments && !hasOnlyOneComment){
      let commentsCount = comment.comments.length;
      (function dive(comments){
        comments.forEach(function(c){
          var len = c.comments.length;
          commentsCount += len;
          if (len) dive(c.comments);
        });
      })(comment.comments);

      let repliesButton = commentsCount > 0 && <Button onPress={this._toggleComments.bind(this)} buttonStyles={styles.repliesButton}>{commentsCount} {commentsCount == 1 ? 'reply' : 'replies'}</Button>;

      return (
        <View style={styles.comment}>
          <Comment data={comment} op={op}/>
          {repliesButton}
          {this.state.expanded && commentsThread}
        </View>
      );
    } else {
      return (
        <View style={styles.comment}>
          <Comment data={comment} op={op}/>
          {commentsThread}
        </View>
      );
    }
  }
}
