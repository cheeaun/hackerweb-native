'use strict';

import React from 'react-native';
var {
  Component,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
} = React;

const styles = StyleSheet.create({
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

export default class LoadingIndicator extends Component {
  constructor(props){
    super(props);
    this.state = {
      opacity: 0,
    };
  }
  componentDidMount(){
    var self = this;
    this._timer = setTimeout(function(){
      self.setState({
        opacity: 1
      });
    }, 900); // less than 1 second
  }
  componentWillUnmount(){
    clearTimeout(this._timer);
  }
  render(){
    return (
      <View style={[styles.container, {opacity: this.state.opacity}]}>
        <ActivityIndicatorIOS animating={true} style={styles.spinner}/>
        <Text style={styles.text}>Loading&hellip;</Text>
      </View>
    );
  }
}
