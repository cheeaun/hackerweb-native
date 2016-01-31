'use strict';

var React = require('react-native');
var {
  AppStateIOS,
  AppRegistry,
  StyleSheet,
  Modal,
  NavigatorIOS,
  View,
} = React;

var StoryActions = require('./actions/StoryActions');
var StoriesView = require('./views/StoriesView');
var AboutView = require('./views/AboutView');

var colors = require('./colors');

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    backgroundColor: colors.viewBackgroundColor,
  },
});

var App = new React.createClass({
  getInitialState: function(){
    return {
      currentAppState: AppStateIOS.currentState,
      isAboutVisible: false,
      showNav: false,
    };
  },
  componentDidMount: function(){
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
  },
  componentWillUnmount: function(){
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
  },
  _handleAppStateChange: function(currentAppState){
    if (currentAppState == 'active' && this.state.currentAppState != currentAppState){
      StoryActions.fetchStoriesIfExpired();
    }
    this.setState({
      currentAppState: currentAppState,
    });
  },
  _showAbout: function(){
    this.setState({
      isAboutVisible: true,
    });
    var self = this;
    setTimeout(function(){
      self.setState({
        showNav: true,
      });
    }, 1);
  },
  _hideAbout: function(){
    this.setState({
      isAboutVisible: false,
      showNav: false,
    });
  },
  render: function(){
    var isAboutVisible = this.state.isAboutVisible;
    var pointerEvents = isAboutVisible ? 'none' : 'auto';
    var nav = this.state.showNav ? <NavigatorIOS
      style={styles.container}
      initialRoute={{
        title: 'About',
        component: AboutView,
        wrapperStyle: styles.wrapper,
        leftButtonTitle: 'Close',
        onLeftButtonPress: this._hideAbout,
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
              onLeftButtonPress: this._showAbout,
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
});

AppRegistry.registerComponent('HackerWeb', () => App);
