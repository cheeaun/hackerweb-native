'use strict';

var React = require('react-native');
var htmlparser = require('../vendor/htmlparser2');
var {
  StyleSheet,
  Text,
  View,
  ScrollView,
} = React;

var colors = require('../colors');

var nodeStyles = StyleSheet.create({
  p: {
    marginBottom: 8,
  },
  pre: {
    paddingVertical: 10,
    backgroundColor: colors.blockCodeBackgroundColor,
    borderRadius: 3,
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 12,
  },
  a: {
    color: colors.linkColor,
  },
  i: {
    fontStyle: 'italic',
  }
});

var dom2elements = function(nodes, opts){
  if (!nodes || !nodes.length) return;
  var linkHandler = opts.linkHandler;
  return nodes.map(function(node){
    var nodeName = node.name;
    var style = nodeStyles[nodeName];
    if (node.type == 'tag'){
      var elements = dom2elements(node.children, opts);
      if (!elements) return null;
      if (nodeName == 'pre'){
        return (
          <ScrollView
            horizontal={true}
            automaticallyAdjustContentInsets={false}
            scrollsToTop={false}
            style={style}>
            {elements}
          </ScrollView>
        );
      }
      if (nodeName == 'p'){
        // Weird that <pre> is inside <p>
        if (node.children.some(function(c){ return c.name == 'pre'; })){
          return {elements};
        }
        return <Text style={style}>{elements}</Text>;
      }
      if (nodeName == 'a'){
        return <Text style={style} onPress={linkHandler.bind(null, node.attribs.href)}>{elements}</Text>
      }
      return <Text style={style}>{elements}</Text>;
    } else if (node.type == 'text'){
      return <Text style={style}>{node.data}</Text>;
    }
  });
};

var processDOM = function(html, opts, callback){
  var handler = new htmlparser.DomHandler(function(err, dom){
    var elements = dom2elements(dom, opts);
    callback(elements);
  });
  var parser = new htmlparser.Parser(handler, {
    recognizeSelfClosing: true,
    lowerCaseAttributeNames: true,
    lowerCaseTags: true,
    decodeEntities: true,
  });
  parser.write(html);
  parser.end();
}

var HTMLView = React.createClass({
  mixins: [ React.addons.PureRenderMixin ],
  getInitialState: function(){
    return {
      elements: null
    };
  },
  statics: {
    processDOM: processDOM
  },
  componentDidMount: function(){
    var html = this.props.html;
    if (!html) return null;
    var onLinkPress = this.props.onLinkPress;
    var self = this;
    processDOM(html, {
      linkHandler: onLinkPress
    }, function(elements){
      self.setState({
        elements: elements
      });
    });
  },
  render: function(){
    return (
      <View>{this.state.elements}</View>
    );
  }
});

module.exports = HTMLView;
