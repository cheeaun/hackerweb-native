// This file is used for resolving stupid "Naming collision detected".
// TODO: Remove this file when it's fixed in React Native

/*eslint-disable */
const blacklist= require('react-native/packager/blacklist');
module.exports = {
  getBlacklistRE(platform){
    return blacklist(platform, [/hackerweb.+\/node_modules\/.+\/node_modules\/fbjs\/.*/]);
  }
};
