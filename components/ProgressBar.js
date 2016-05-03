'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Animated,
} from 'react-native';

import colors from '../colors';

const styles = StyleSheet.create({
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

export default class ProgressBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      progressWidth: new Animated.Value(0),
    };
    this._onBarLayout = this._onBarLayout.bind(this);
  }
  _onBarLayout(e){
    const {value, max} = this.props;
    const width = e.nativeEvent.layout.width;
    Animated.spring(this.state.progressWidth, {
      toValue: value/max*width,
      duration: 300,
    }).start();
  }
  render(){
    return (
      <View style={styles.bar} onLayout={this._onBarLayout}>
        <Animated.View style={[styles.progress, {width: this.state.progressWidth}]}></Animated.View>
      </View>
    );
  }
}
