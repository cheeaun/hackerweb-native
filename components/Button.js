'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} = React;

var devicePx = require('../utils/devicePx');

var colors = require('../colors');

var styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderColor: colors.defaultButtonThemeColor,
    borderWidth: devicePx,
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

var Button = React.createClass({
  getInitialState: function(){
    return {
      pressed: false,
    };
  },
  _onPressIn: function(){
    this.setState({
      pressed: true,
    });
  },
  _onPressOut: function(){
    this.setState({
      pressed: false,
    });
  },
  render: function(){
    var pressed = this.state.pressed;
    var props = this.props;
    return (
      <TouchableWithoutFeedback onPress={props.onPress.bind(this)} onPressIn={this._onPressIn} onPressOut={this._onPressOut}>
        <View style={[props.buttonStyles, styles.button, pressed && styles.pressedButton, pressed && props.pressedButtonStyles]}>
          <Text style={[props.textStyles, styles.text, pressed && styles.pressedText, pressed && props.pressedTextStyles]}>{props.children}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
});

module.exports = Button;
