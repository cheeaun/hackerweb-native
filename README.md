HackerWeb
===

A simply readable Hacker News app for iOS and Android.

Read about the story here: [Building HackerWeb for iOS](http://cheeaun.com/blog/2016/03/building-hackerweb-ios/).

Preview
---

### iOS

![Preview on iOS](media/hackerweb-preview-ios.gif)

### Android

![Preview on Android](media/hackerweb-preview-android.gif)

Development
---

### Requirements

- [React Native](https://facebook.github.io/react-native/)
- [React Native Package Manager](https://github.com/rnpm/rnpm)
- [Node.js](https://nodejs.org/)
- [Xcode](https://developer.apple.com/xcode/)
- [iOS](https://www.apple.com/ios/) **9**
- Android SDK API **21**

### Getting started

- `npm install` - Install all dependencies
- `rnpm link` - Linking all native dependencies

### Implementations

- [Alt](http://alt.js.org/) - the Flux thing
- [htmlparser2](https://github.com/fb55/htmlparser2) - for parsing the comments HTML
- [url-parse](https://github.com/unshiftio/url-parse) - for extracting domains out of story URLs
- **iOS**
  - [react-native-safari-view](https://github.com/naoufal/react-native-safari-view) - the reason why iOS 9 is the minimum requirement

- **Android**
  - [react-native-chrome-custom-tabs](https://github.com/dstaley/react-native-chrome-custom-tabs) - same as SafariView for iOS, but for Chrome
  - [react-native-android-share](https://github.com/haydenth/react-native-android-share) - for sharing

### Components

- `LoadingIndicator` - inspired by [react-native-activity-indicator-ios](https://github.com/pwmckenna/react-native-activity-indicator-ios)
- `HTMLView` - inspired by [react-native-htmlview](https://github.com/jsdf/react-native-htmlview), [react-native-htmltext](https://github.com/siuying/react-native-htmltext) and [react-native-html-render](https://github.com/soliury/react-native-html-render)
- [react-native-cache-store](https://github.com/cheeaun/react-native-cache-store) - for local caching

Similar apps
---

- [HackerNews-React-Native](https://github.com/iSimar/HackerNews-React-Native)
- [ReactNativeHackerNews](https://github.com/jsdf/ReactNativeHackerNews)

License
---

[MIT](http://cheeaun.mit-license.org/).
