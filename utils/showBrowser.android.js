'use strict';

import ChromeCustomTabsClient from 'react-native-chrome-custom-tabs';
import LinkActions from '../actions/LinkActions';

export default (url) => {
  if (!url) return;
  ChromeCustomTabsClient.launchCustomTab(url);
  // Log link visit to History
  setTimeout(() => LinkActions.addLink(url), 1000);
}
