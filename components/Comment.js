'use strict';

import React, {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';

import SafariView from 'react-native-safari-view';
import HTMLView from '../components/HTMLView';

import colors from '../colors';

const styles = StyleSheet.create({
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

var linkPress = function(u){
  if (!u) return;
  SafariView.show({
    url: u
  });
};

export default (props) => {
  var data = props.data;
  var op = props.op;
  var level = data.level;
  var commentArrow = level > 0 ? <Image style={styles.commentArrowIcon} source={require('../images/comment-arrow.png')}/> : null;

  var innerComment = data.deleted ? (
    <View style={styles.commentMetadata}>
      <Text style={styles.commentDeleted}>[deleted]</Text>
      <Text style={styles.commentTime}>{data.time_ago}</Text>
    </View>
  ) : (
    <View>
      <View style={styles.commentMetadata}>
        <Text style={styles.commentUser} onPress={linkPress.bind(null, `https://news.ycombinator.com/user?id=${encodeURIComponent(data.user)}`)}><Text>{data.user}</Text> {op == data.user && <Text style={styles.opUser}>OP</Text>}</Text>
        <Text style={styles.commentTime} onPress={linkPress.bind(null, `https://news.ycombinator.com/item?id=${data.id}`)}>{data.time_ago}</Text>
      </View>
      <HTMLView html={data.content}/>
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
