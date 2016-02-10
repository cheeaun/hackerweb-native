'use strict';

import React, {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  LinkingIOS,
} from 'react-native';

import SafariView from 'react-native-safari-view';

import colors from '../colors';

const styles = StyleSheet.create({
  aboutContainer: {
    marginTop: 34,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separatorColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separatorColor,
    backgroundColor: colors.sectionBackgroundColor,
    flexDirection: 'row',
  },
  appIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderColor: colors.separatorColor,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
  },
  aboutTextContainer: {
    flex: 1,
  },
  aboutHeading: {
    fontWeight: '500',
    fontSize: 17,
  },
  aboutDescription: {
    fontSize: 15,
    color: colors.insignificantColor,
  },
  listContainer: {
    marginTop: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separatorColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separatorColor,
    backgroundColor: colors.sectionBackgroundColor,
  },
  listItem: {
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  listItemSeparator: {
    marginLeft: 15,
    marginTop: -1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separatorColor,
  },
  link: {
    backgroundColor: colors.sectionBackgroundColor,
    color: colors.linkColor,
    fontSize: 17,
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
  LinkingIOS.openURL(url);
  /* BUG: Once <Modal> is open, SafariView can't work anymore.
  if (/^mailto:/.test(url)){
    // Note: won't work in Simulator because there's no Mail there
    LinkingIOS.openURL(url);
  } else {
    SafariView.show({
      url: url
    });
  }
  */
};

const links = [
  { text: 'HackerWeb homepage', url: 'http://hackerwebapp.com/' },
  { text: 'Hacker News homepage', url: 'https://news.ycombinator.com/' },
  { text: 'Hacker News FAQ', url: 'https://news.ycombinator.com/newsfaq.html' },
  { text: 'HackerWeb for iOS on GitHub', url: 'https://github.com/cheeaun/hackerweb-ios' },
  { text: 'Follow @cheeaun', url: 'https://twitter.com/cheeaun' },
  { text: 'Send Feedback', url: 'mailto:cheeaun+hackerweb@gmail.com?subject=HackerWeb feedback' },
];

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
      <View style={styles.listContainer}>
        {(() => links.map((link, i) => {
          return (
            <View key={link.text}>
              <TouchableOpacity onPress={linkPress.bind(null, link.url)} style={styles.listItem}>
                <Text style={styles.link}>{link.text}</Text>
              </TouchableOpacity>
              {i < links.length-1 && <View style={styles.listItemSeparator}></View>}
            </View>
          );
        }))()}
      </View>
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>Built by Lim Chee Aun.</Text>
        <Text style={styles.disclaimerText}>Not affiliated with Hacker News or YCombinator.</Text>
      </View>
    </ScrollView>
  );
}
