'use strict';

import AndroidShare from 'react-native-android-share';

export default (url, message) => {
  if (!url) return;
  AndroidShare.openChooserWithOptions({
    subject: message || url,
    text: (message ? (message + ' ') : '') + url,
  }, 'Share via');
}
