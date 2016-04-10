'use strict';

import React, {
  StyleSheet,
  View,
  Text,
  TouchableNativeFeedback,
} from 'react-native';

import colors from '../colors';

const styles = StyleSheet.create({
  button: {
    borderRadius: 2,
    backgroundColor: colors.defaultButtonThemeColor,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',

  },
});

export default (props) => {
  return (
    <TouchableNativeFeedback onPress={props.onPress}>
      <View style={[props.buttonStyles, styles.button]}>
        <Text style={styles.text}>{props.children.map((c) => c.toUpperCase ? c.toUpperCase() : c)}</Text>
      </View>
    </TouchableNativeFeedback>
  );
}
