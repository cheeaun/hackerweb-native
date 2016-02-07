'use strict';

import urlparse from 'url-parse';

export default (url) => {
  if (!url) return;
  var link = urlparse(url);
  var domain = link.hostname.replace(/^www\./, '');
  var pathname = link.pathname.replace(/^\//, '').split('/')[0];
  var pathnameLen = pathname.length;
  var firstPath = domain.length <= 25 && pathnameLen > 3 && pathnameLen <= 15 && /^[^0-9][^.]+$/.test(pathname) ? ('/' + pathname) : '';
  return domain + firstPath;
};
