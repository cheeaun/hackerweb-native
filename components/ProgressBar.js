'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Animated,
} = React;

var colors = require('../colors');

var styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.progressBarBackgroundColor,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progress: {
    backgroundColor: colors.progressBarColor,
    height: 3,
  }
});

var ProgressBar = React.createClass({
  mixins: [ React.addons.PureRenderMixin ],
  getInitialState: function(){
    return {
      progressWidth: new Animated.Value(0),
    };
  },
  _onBarLayout: function(e){
    var width = e.nativeEvent.layout.width;
    Animated.spring(this.state.progressWidth, {
      toValue: this.props.value/this.props.max*100,
      duration: 300,
    }).start();
  },
  render: function(){
    return (
      <View style={styles.bar} onLayout={this._onBarLayout}>
        <Animated.View style={[styles.progress, {width: this.state.progressWidth}]}></Animated.View>
      </View>
    );
  }
});

module.exports = ProgressBar;
