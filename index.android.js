/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Navigator,
  Text,
  View,
  ToolbarAndroid,
} from 'react-native';

import StoriesView from './views/StoriesView';
import CommentsView from './views/CommentsView';
import AboutView from './views/AboutView';

import StoryActions from './actions/StoryActions';

import colors from './colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    backgroundColor: colors.viewBackgroundColor,
  },
  toolbar: {
    backgroundColor: colors.toolbarBackgroundColor,
    height: 56,
    elevation: 4,
  },
});

class HackerWeb extends Component {
  _navigatorRenderScene(route, navigator){
    switch (route.id){
      case 'Stories':
        return <View style={styles.container}>
          <ToolbarAndroid
            title="HackerWeb"
            titleColor={colors.primaryTextColor}
            style={styles.toolbar}
            actions={[
              {
                title: 'Reload',
                icon: require('./images/refresh-icon.png'),
                show: 'always',
              },
              { title: 'About' },
            ]}
            onActionSelected={(position) => {
              switch (position){
                case 0:
                  StoryActions.fetchStories();
                  break;
                case 1:
                  navigator.push({
                    id: 'About',
                  });
                  break;
              }
            }}
          />
          <StoriesView navigator={navigator} />
        </View>;
      case 'Comments':
        const { component, title, passProps, rightButtonIcon, onRightButtonPress } = route;
        const TheComponent = component;
        return <View style={[styles.container, styles.wrapper]}>
          <ToolbarAndroid
            title={title}
            titleColor={colors.primaryTextColor}
            style={styles.toolbar}
            navIcon={require('./images/arrow-back.png')}
            onIconClicked={navigator.pop}
            actions={[{
              title: 'Share',
              icon: rightButtonIcon,
              show: 'always'
            }]}
            onActionSelected={onRightButtonPress}
          />
            <TheComponent navigator={navigator} {...passProps}/>
          </View>;
      case 'About':
        return <View style={[styles.container, styles.wrapper]}>
          <ToolbarAndroid
            title="About"
            titleColor={colors.primaryTextColor}
            style={styles.toolbar}
          />
          <AboutView />
        </View>;
    }
  }
  render(){
    return (
      <Navigator
        initialRoute={{id: 'Stories'}}
        renderScene={this._navigatorRenderScene}
        configureScene={(route) => {
          if (route.id == 'About'){
            return Navigator.SceneConfigs.FloatFromBottom;
          }
          return Navigator.SceneConfigs.PushFromRight;
        }}
      />
    );
  }
}

AppRegistry.registerComponent('HackerWeb', () => HackerWeb);
