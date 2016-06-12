'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
  ProgressBarAndroid,
  Platform,
} from 'react-native';

const isIOS = Platform.OS === 'ios';

import colors from '../colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: isIOS ? {
    width: 30,
    height: 30,
  } : {
    width: 24,
    height: 24,
  },
  text: {
    opacity: .6,
  },
});

export default class LoadingIndicator extends Component {
  constructor(props){
    super(props);
    this.state = {
      opacity: 0,
    };
  }
  componentDidMount(){
    this._timer = setTimeout(() => {
      this.setState({
        opacity: 1,
      });
    }, 900); // less than 1 second
  }
  componentWillUnmount(){
    clearTimeout(this._timer);
  }
  render(){
    const {opacity} = this.state;

    if (isIOS){
      return (
        <View style={[styles.container, {opacity}]}>
          <ActivityIndicatorIOS animating={true} style={styles.spinner}/>
          <Text style={styles.text}>Loading&hellip;</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, {opacity}]}>
        <ProgressBarAndroid color={colors.disabledColor} styleAttr="Small" style={styles.spinner} indeterminate={true} />
      </View>
    );
  }
}
