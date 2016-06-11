'use strict';

import React, { Component } from 'react';
import {
  AppStateIOS,
  AppRegistry,
  StyleSheet,
  Modal,
  NavigatorIOS,
  View,
  Linking,
} from 'react-native';

import StoryActions from './actions/StoryActions';
import StoriesView from './views/StoriesView';
import AboutView from './views/AboutView';
import CommentsView from './views/CommentsView';

import colors from './colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    backgroundColor: colors.viewBackgroundColor,
  },
});

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentAppState: AppStateIOS.currentState,
      isAboutVisible: false,
    };
    this._reloadCount = 0;
    this._reloadCountTimeout = null;
    this._handleAppStateChange = this._handleAppStateChange.bind(this);
    this._handleOpenURL = this._handleOpenURL.bind(this);
  }
  componentDidMount(){
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
    Linking.addEventListener('url', this._handleOpenURL);
  }
  componentWillUnmount(){
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
    Linking.removeEventListener('url', this._handleOpenURL);
  }
  _handleAppStateChange(currentAppState){
    if (currentAppState == 'active' && this.state.currentAppState != currentAppState){
      StoryActions.fetchStoriesIfExpired();
    }
    this.setState({
      currentAppState,
    });
  }
  _handleOpenURL(e){
    const {url} = e;
    if (!url) return;
    const id = (url.match(/item\?id=([a-z\d]+)/i) || [,null])[1];
    if (!id) return;
    this.refs.nav.push({
      component: CommentsView,
      wrapperStyle: styles.wrapper,
      passProps: {
        data: {id}
      },
    });
  }
  _showAbout(){
    this.setState({
      isAboutVisible: true,
    });
  }
  _hideAbout(){
    this.setState({
      isAboutVisible: false,
    });
  }
  render(){
    const {isAboutVisible} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.container} pointerEvents={isAboutVisible ? 'none' : 'auto'}>
          <NavigatorIOS
            ref="nav"
            style={styles.container}
            initialRoute={{
              title: 'HackerWeb',
              backButtonTitle: 'News',
              component: StoriesView,
              leftButtonTitle: 'About',
              onLeftButtonPress: this._showAbout.bind(this),
              rightButtonIcon: require('./images/refresh-icon.png'),
              onRightButtonPress: () => {
                // For the compulsive-type of people who likes to press Reload multiple times
                this._reloadCount++;
                clearTimeout(this._reloadCountTimeout);
                if (this._reloadCount >= 3){
                  StoryActions.flush();
                  this._reloadCount = 0;
                } else {
                  this._reloadCountTimeout = setTimeout(() => this._reloadCount = 0, 3000);
                }
                StoryActions.fetchStories();
              },
            }}/>
        </View>
        <Modal animated={true} visible={isAboutVisible}>
          <NavigatorIOS
            style={styles.container}
            initialRoute={{
              title: 'About',
              component: AboutView,
              wrapperStyle: styles.wrapper,
              leftButtonTitle: 'Close',
              onLeftButtonPress: this._hideAbout.bind(this),
            }}/>
        </Modal>
      </View>
    );
  }
}

AppRegistry.registerComponent('HackerWeb', () => App);
