'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
} = React;

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    width: 30,
    height: 30,
  },
  text: {
    opacity: .6,
  },
});

var LoadingIndicator = React.createClass({
  getInitialState: function(){
    return {
      opacity: 0,
    };
  },
  componentDidMount: function(){
    var self = this;
    this._timer = setTimeout(function(){
      self.setState({
        opacity: 1
      });
    }, 900); // less than 1 second
  },
  componentWillUnmount: function(){
    clearTimeout(this._timer);
  },
  render: function(){
    return (
      <View style={[styles.container, {opacity: this.state.opacity}]}>
        <ActivityIndicatorIOS animating={true} style={styles.spinner}/>
        <Text style={styles.text}>Loading&hellip;</Text>
      </View>
    );
  }
});

module.exports = LoadingIndicator;
