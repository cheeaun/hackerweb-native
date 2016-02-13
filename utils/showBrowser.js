'use strict';

import { LinkingIOS, AlertIOS } from 'react-native';
import SafariView from 'react-native-safari-view';
import LinkActions from '../actions/LinkActions';

export default (url) => {
  if (!url) return;
  SafariView.isAvailable()
    .then(() => {
      SafariView.show({
        url: url,
      });
      // Log link visit to History
      setTimeout(() => LinkActions.addLink(url), 1000);
    })
    .catch(() => {
      LinkingIOS.canOpenURL(url, (supported) => {
        if (!supported){
          AlertIOS.alert('Can\'t handle URL: ' + url);
        } else {
          LinkingIOS.openURL(url);
          // Log link visit to History
          setTimeout(() => LinkActions.addLink(url), 1000);
        }
      });
    });
}
