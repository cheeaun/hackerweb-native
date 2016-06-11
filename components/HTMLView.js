'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';

const isIOS = Platform.OS === 'ios';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import htmlparser from 'htmlparser2';

import colors from '../colors';

const nodeStyles = StyleSheet.create({
  p: {
    color: colors.primaryTextColor,
    marginBottom: 8,
    lineHeight: isIOS ? null : 20,
  },
  pre: {
    paddingVertical: 10,
    backgroundColor: colors.blockCodeBackgroundColor,
    borderRadius: 3,
    marginBottom: 8,
  },
  code: {
    color: colors.primaryTextColor,
    fontFamily: isIOS ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  a: {
    color: colors.linkColor,
  },
  i: {
    fontStyle: 'italic',
  },
});

function dom2elements(nodes, opts, parentName){
  if (!nodes || !nodes.length) return;
  const {onLinkPress} = opts;
  return nodes.map((node) => {
    const {name, type, children} = node;
    const key = (name || type) + '-' + Math.random();
    const style = nodeStyles[name];
    if (type == 'tag'){
      var elements = dom2elements(children, opts, name);
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
      if (name == 'a'){
        const {href} = node.attribs;
        // Steps to make sure children inside is ACTUALLY text
        const child = children && children.length == 1 && children[0];
        const text = child && child.type == 'text' && child.data;
        return <Text key={key} style={style} onPress={onLinkPress.bind(null, href)}>{text || elements}</Text>;
      }
      return <Text key={key} style={style}>{elements}</Text>;
    } else if (type == 'text'){
      const {data} = node;
      let text;
      if (parentName == 'code'){
        // Trim EOL newline
        text = data.replace(/\n$/, '');
      } else {
        // Trim ALL newlines, because HTML
        text = data.replace(/[\n\s\t]+/g, ' ');
      }
      return <Text key={key} style={style}>{text}</Text>;
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
  // Stop <pre> from being wrapped by <p>
  html = html.replace(/<p>\s*<pre>/ig, '</p><pre>');
  if (!html.match(/<\/pre>\s*<p>/i)){
    html = html.replace(/<\/pre>([^<])/ig, '</pre><p>$1');
  }
  parser.write(html);
  parser.end();
}

export default class HTMLView extends Component {
  constructor(props){
    super(props);
    this.state = {
      elements: null,
    };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
