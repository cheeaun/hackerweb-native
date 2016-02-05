'use strict';

import React from 'react-native';
var {
  StyleSheet,
  TouchableHighlight,
  View
} = React;

import colors from '../colors';

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.sectionBackgroundColor,
    paddingLeft: 15,
  },
  item: {
    flexDirection: 'row',
  }
});

export default (props) => {
  return <TouchableHighlight onPress={props.onPress} onLongPress={props.onLongPress} onShowUnderlay={props.onHighlight} onHideUnderlay={props.onUnhighlight}>
    <View style={styles.itemContainer}>
      <View style={styles.item}>
        {props.children}
      </View>
    </View>
  </TouchableHighlight>
}
