'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';

import colors from '../colors';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderColor: colors.defaultButtonThemeColor,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  text: {
    color: colors.defaultButtonThemeColor,
    textAlign: 'center',
  },
  pressedButton: {
    backgroundColor: colors.defaultButtonThemeColor,
  },
  pressedText: {
    color: '#ffffff',
  },
});

export default class Button extends Component {
  constructor(props){
    super(props);
    this.state = {
      pressed: false,
    };
  }
  _onPressIn(){
    this.setState({
      pressed: true,
    });
  }
  _onPressOut(){
    this.setState({
      pressed: false,
    });
  }
  render(){
    const {pressed} = this.state;
    const {onPress, buttonStyles, pressedButtonStyles, textStyles, pressedTextStyles, children} = this.props;
    return (
      <TouchableWithoutFeedback onPress={onPress} onPressIn={this._onPressIn.bind(this)} onPressOut={this._onPressOut.bind(this)}>
        <View style={[buttonStyles, styles.button, pressed && styles.pressedButton, pressed && pressedButtonStyles]}>
          <Text style={[textStyles, styles.text, pressed && styles.pressedText, pressed && pressedTextStyles]}>
            {children}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
