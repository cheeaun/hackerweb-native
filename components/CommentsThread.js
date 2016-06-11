'use strict';

import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import Comment from './Comment';

const styles = StyleSheet.create({
  indentedThread: {
    marginLeft: 14,
  },
});

const CommentsThread = (props) => {
  const {data, op} = props;
  if (!data || !data.length) return <View/>;
  return (
    <View>
      {data.map((comment) => {
        return (
          <View key={comment.id} style={comment.level > 1 && styles.indentedThread}>
            <Comment data={comment} op={op}/>
            <CommentsThread data={comment.comments} op={op}/>
          </View>
        );
      })}
    </View>
  );
}

export default CommentsThread;
