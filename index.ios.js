'use strict';

import React from 'react-native';
var {
  Component,
  AppStateIOS,
  AppRegistry,
  StyleSheet,
  Modal,
  NavigatorIOS,
  View,
} = React;

import StoryActions from './actions/StoryActions';
import StoriesView from './views/StoriesView';
import AboutView from './views/AboutView';

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
      showNav: false,
    };
    this._handleAppStateChange = this._handleAppStateChange.bind(this);
  }
  componentDidMount(){
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
  }
  componentWillUnmount(){
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange(currentAppState){
    if (currentAppState == 'active' && this.state.currentAppState != currentAppState){
      StoryActions.fetchStoriesIfExpired();
    }
    this.setState({
      currentAppState: currentAppState,
    });
  }
  _showAbout(){
    this.setState({
      isAboutVisible: true,
    });
    var self = this;
    setTimeout(function(){
      self.setState({
        showNav: true,
      });
    }, 1);
  }
  _hideAbout(){
    this.setState({
      isAboutVisible: false,
      showNav: false,
    });
  }
  render(){
    var isAboutVisible = this.state.isAboutVisible;
    var pointerEvents = isAboutVisible ? 'none' : 'auto';
    var nav = this.state.showNav ? <NavigatorIOS
      style={styles.container}
      initialRoute={{
        title: 'About',
        component: AboutView,
        wrapperStyle: styles.wrapper,
        leftButtonTitle: 'Close',
        onLeftButtonPress: this._hideAbout.bind(this),
      }}/> : null;
    return (
      <View style={styles.container}>
        <View style={styles.container} pointerEvents={pointerEvents}>
          <NavigatorIOS
            style={styles.container}
            initialRoute={{
              title: 'HackerWeb',
              backButtonTitle: 'News',
              component: StoriesView,
              leftButtonTitle: 'About',
              onLeftButtonPress: this._showAbout.bind(this),
              rightButtonIcon: require('./images/refresh-icon.png'),
              onRightButtonPress: StoryActions.fetchStories,
            }}/>
        </View>
        <Modal animated={true} visible={isAboutVisible}>
          {nav}
        </Modal>
      </View>
    );
  }
}

AppRegistry.registerComponent('HackerWeb', () => App);
