'use strict';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
} from 'react-native';

import htmlparser from '../vendor/htmlparser2';

import colors from '../colors';

const nodeStyles = StyleSheet.create({
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
  },
});

function dom2elements(nodes, opts){
  if (!nodes || !nodes.length) return;
  const {onLinkPress} = opts;
  return nodes.map((node) => {
    const {name, type, children} = node;
    const key = (name || type) + '-' + Math.random();
    const style = nodeStyles[name];
    if (type == 'tag'){
      var elements = dom2elements(children, opts);
      if (!elements) return null;
      if (name == 'pre'){
        return (
          <ScrollView
            key={key}
            horizontal={true}
            automaticallyAdjustContentInsets={false}
            scrollsToTop={false}
            style={style}>
            {elements}
          </ScrollView>
        );
      }
      if (name == 'p'){
        // Weird that <pre> is inside <p>
        if (children.some((c) => c.name == 'pre')){
          return elements;
        }
        return <Text key={key} style={style}>{elements}</Text>;
      }
      if (name == 'a'){
        const {href} = node.attribs;
        // Steps to make sure children inside is ACTUALLY text
        const child = children && children.length == 1 && children[0];
        const text = child && child.type == 'text' && child.data;
        return <Text key={key} style={style} onPress={onLinkPress.bind(null, href)}>{text || elements}</Text>;
      }
      return <Text key={key} style={style}>{elements}</Text>;
    } else if (type == 'text'){
      return <Text key={key} style={style}>{node.data.replace(/\n$/, '')}</Text>;
    }
  });
};

function processDOM(html, opts, callback){
  if (typeof opts == 'function'){
    callback = opts;
    opts = {};
  }
  const handler = new htmlparser.DomHandler((err, dom) => {
    const elements = dom2elements(dom, opts);
    callback(elements);
  });
  const parser = new htmlparser.Parser(handler, {
    recognizeSelfClosing: true,
    lowerCaseAttributeNames: true,
    lowerCaseTags: true,
    decodeEntities: true,
  });
  // Clean up HTML first
  if (!html.match(/^<p>/i)) html = '<p>' + html;
  parser.write(html);
  parser.end();
}

export default class HTMLView extends Component {
  constructor(props){
    super(props);
    this.state = {
      elements: null,
    };
  }
  componentDidMount(){
    const {html, onLinkPress} = this.props;
    if (!html) return null;
    processDOM(html, {
      onLinkPress: onLinkPress || Linking.openURL,
    }, (elements) => {
      this.setState({
        elements: elements,
      });
    });
  }
  render(){
    return (
      <View>{this.state.elements}</View>
    );
  }
}
