'use strict';

var React = require('react-native');
var {
  StyleSheet,
  TouchableHighlight,
  View
} = React;

var colors = require('../colors');

var styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.sectionBackgroundColor,
    paddingLeft: 15
  },
  item: {
    flexDirection: 'row'
  }
});

var ListItemIOS = React.createClass({
  render: function(){
    return (
      <TouchableHighlight onPress={this.props.onPress} onLongPress={this.props.onLongPress} onShowUnderlay={this.props.onHighlight} onHideUnderlay={this.props.onUnhighlight}>
        <View style={styles.itemContainer}>
          <View style={styles.item}>
            {this.props.children}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
});

module.exports = ListItemIOS;
