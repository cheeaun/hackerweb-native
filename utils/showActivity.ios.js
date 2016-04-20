'use strict';

import { ActionSheetIOS } from 'react-native';

export default (url, message) => {
  if (!url) return;
  ActionSheetIOS.showShareActionSheetWithOptions({
    url: url,
    message: message || '',
  }, () => {}, () => {});
}
