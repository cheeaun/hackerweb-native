'use strict';

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableNativeFeedback,
  Linking,
  Platform,
} from 'react-native';

const isIOS = Platform.OS === 'ios';
const CrossTouchable = isIOS ? TouchableOpacity : TouchableNativeFeedback;

// import SafariView from 'react-native-safari-view';

import colors from '../colors';

const hairlineWidth = isIOS ? StyleSheet.hairlineWidth : 1;
const styles = StyleSheet.create({
  aboutContainer: {
    marginTop: isIOS ? 34 : 0,
    paddingVertical: isIOS ? 10 : 32,
    paddingHorizontal: isIOS ? 15 : 16,
    borderTopWidth: isIOS ? hairlineWidth : 0,
    borderTopColor: colors.separatorColor,
    borderBottomWidth: hairlineWidth,
    borderBottomColor: colors.separatorColor,
    backgroundColor: colors.sectionBackgroundColor,
    flexDirection: 'row',
  },
  appIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderColor: colors.separatorColor,
    borderWidth: hairlineWidth,
    borderRadius: isIOS ? 14 : 2,
  },
  aboutTextContainer: {
    flex: 1,
  },
  aboutHeading: {
    color: colors.primaryTextColor,
    fontWeight: '500',
    fontSize: 17,
  },
  aboutDescription: {
    fontSize: 15,
    color: colors.insignificantColor,
  },
  listContainer: {
    marginTop: 34,
    borderTopWidth: hairlineWidth,
    borderTopColor: colors.separatorColor,
    borderBottomWidth: hairlineWidth,
    borderBottomColor: colors.separatorColor,
    backgroundColor: colors.sectionBackgroundColor,
  },
  listItem: {
    paddingVertical: isIOS ? 13 : 16,
    paddingHorizontal: isIOS ? 15 : 16,
  },
  listItemSeparator: {
    marginLeft: 15,
    marginTop: -1,
    height: hairlineWidth,
    backgroundColor: colors.separatorColor,
  },
  link: {
    color: colors.linkColor,
    fontSize: isIOS ? 17 : 16,
  },
  disclaimer: {
    paddingVertical: 27,
    paddingHorizontal: 15,
  },
  disclaimerText: {
    color: colors.sectionInsignificantColor,
  }
});

var linkPress = function(url){
  Linking.openURL(url);
  /* BUG: Once <Modal> is open, SafariView can't work anymore.
  if (/^mailto:/.test(url)){
    // Note: won't work in Simulator because there's no Mail there
    Linking.openURL(url);
  } else {
    SafariView.show({
      url: url
    });
  }
  */
};

function linksContainer(links){
  return <View style={styles.listContainer}>
    {links.map((link, i) => {
      return (
        <View key={link.text}>
          <CrossTouchable onPress={linkPress.bind(null, link.url)}>
            <View style={styles.listItem}>
              <Text style={styles.link}>{link.text}</Text>
            </View>
          </CrossTouchable>
          {i < links.length-1 && <View style={styles.listItemSeparator}/>}
        </View>
      );
    })}
  </View>
};

export default (props) => {
  return (
    <ScrollView>
      <View style={styles.aboutContainer}>
        <View>
          <Image style={styles.appIcon} source={require('../images/app-icon.png')}/>
        </View>
        <View style={styles.aboutTextContainer}>
          <Text style={styles.aboutHeading}>HackerWeb</Text>
          <Text style={styles.aboutDescription}>A simply readable Hacker News app.</Text>
        </View>
      </View>
      {linksContainer([
        isIOS ? {
          text: '🌟 Rate HackerWeb on the App Store',
          url: 'http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=1084209377&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8'
        } : {
          text: '🌟 Rate HackerWeb on Google Play',
          url: 'https://play.google.com/store/apps/details?id=cheeaun.hackerweb'
        },
        { text: '☕️ Buy me a cup of coffee', url: 'https://donorbox.org/support-cheeaun' },
      ])}
      {linksContainer([
        { text: 'HackerWeb homepage', url: 'https://hackerwebapp.com/' },
        { text: 'Hacker News homepage', url: 'https://news.ycombinator.com/' },
        { text: 'Hacker News FAQ', url: 'https://news.ycombinator.com/newsfaq.html' },
        { text: 'HackerWeb on GitHub', url: 'https://github.com/cheeaun/hackerweb-native' },
        { text: 'Follow @cheeaun', url: 'https://twitter.com/cheeaun' },
        { text: 'Send Feedback', url: 'mailto:cheeaun+hackerweb@gmail.com?subject=HackerWeb feedback' },
      ])}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>Built by Lim Chee Aun.</Text>
        <Text style={styles.disclaimerText}>Not affiliated with Hacker News or YCombinator.</Text>
      </View>
    </ScrollView>
  );
}
