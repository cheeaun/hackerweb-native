import { Platform } from 'react-native';
const isIOS = Platform.OS === 'ios';

export default {
  linkColor: '#007aff',
  viewBackgroundColor: isIOS ? '#efeff4' : '#fafafa',
  userColor: isIOS ? '#bf223f' : '#b71c1c',
  opColor: '#fff',
  opBackgroundColor: isIOS ? '#bf223f' : '#b71c1c',
  insignificantColor: 'rgba(0,0,0,.54)',
  sectionInsignificantColor: '#6d6d72',
  separatorColor: isIOS ? '#c8c7cc' : '#ebebeb',
  blockCodeBackgroundColor: '#eee',
  progressBarBackgroundColor: '#eee',
  progressBarColor: '#007aff',
  sectionBackgroundColor: '#fff',
  domainColor: isIOS ? '#003d80' : '#0D47A1',
  defaultButtonThemeColor: isIOS ? '#848484' : '#f5f5f5',
  primaryTextColor: isIOS ? null : 'rgba(0,0,0,.87)',
  toolbarBackgroundColor: isIOS ? null: '#f5f5f5',
  disabledColor: 'rgba(0,0,0,.38)',
}
