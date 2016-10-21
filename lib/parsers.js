'use strict';

var utils = require('./utils');
var define = require('define-property');
var extend = require('extend-shallow');

/**
 * Text regex
 */

var TEXT_REGEX = '(\\[(?=.*\\])|\\])+';
var not = utils.createRegex(TEXT_REGEX);

/**
 * Brackets parsers
 */

function parsers(snapdragon, options) {
  var reflinks = snapdragon.reflinks = {unresolved: [], resolved: {}};
  if (options && options.reflinks) {
    reflinks.resolved = extend({}, options.reflinks);
  }

  snapdragon.parser.sets.reflink = snapdragon.parser.sets.reflink || [];
  snapdragon.parser

    /**
     * Newlins
     */

    .capture('newline', /^\n/)

    /**
     * Text parser
     */

    .capture('text', function() {
      if (this.isInside('reflink')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    })

    /**
     * Bracket (noop)
     */

    .capture('reflink', function() {})

    /**
     * Open: '['
     */

    .capture('reflink.open', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\[(?=.*\])/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);

      var open = pos({
        type: 'reflink.open',
        val: m[0]
      });

      var node = pos({
        type: 'reflink',
        label: '',
        nodes: [open]
      });

      define(node, 'parsed', parsed);
      define(node, 'parent', prev);
      define(open, 'parent', node);
      this.push('reflink', node);
      prev.nodes.push(node);
    })

    /**
     * Bracket text
     */

    .capture('reflink.inner', function() {
      if (!this.isInside('reflink')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      var prev = this.prev();
      var node = pos({
        type: 'reflink.inner',
        val: m[0]
      });

      if (prev.type !== 'reflink') {
        node.type = 'text';
      }

      prev.nodes.push(node);
      define(node, 'parent', prev);
      prev.label = node.val;
    })

    /**
     * Close: ']'
     */

    .capture('reflink.close', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^(\])(:?)([^\n]+)?/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);

      var node = pos({
        type: 'reflink.close',
        val: m[1] + (m[2] ? (m[2] + ' ') : '')
      });

      define(node, 'rest', this.input);

      if (last.type === 'reflink.open') {
        node.type = 'reflink.inner';
        node.escaped = true;
        return node;
      }

      var parent = this.pop('reflink');
      if (!this.isType(parent, 'reflink')) {
        if (this.options.strict) {
          throw new Error('missing opening "["');
        }
        node.type = 'reflink.inner';
        node.escaped = true;
        return node;
      }

      parent.nodes.push(node);
      define(node, 'parent', parent);

      if (m[3] && !m[2]) {
        node.val += m[3];
        return;
      }

      if (m[2] && m[3]) {
        var tok = pos({type: 'reflink.link'});
        parseLink(m[3], tok, parent);
        parent.nodes.push(tok);
        define(tok, 'parent', parent);

        var key = parent.label;
        tok.label = key;

        if (tok.resolved) {
          reflinks.resolved[key] = tok;
        } else {
          reflinks.unresolved.push(tok);
        }
      }
    });
}

function parseLink(str, node, parent) {
  var link = (str || '').trim();
  node.val = link;
  var m = /^([^'"]+)(.*)/.exec(str);
  if (!m) {
    node.text = '';
    node.resolved = false;
  } else {
    node.link = (m[1] || '').trim();
    node.text = (m[2] || '').trim();
    if (node.text) {
      node.text = node.text.replace(/^(['"])(.*?)(\1)$/, '$2');
    }
    node.resolved = !/\[[^\]]+\]/.test(node.link);
  }
}

/**
 * Brackets parsers
 */

module.exports = parsers;

/**
 * Expose text regex
 */

module.exports.TEXT_REGEX = TEXT_REGEX;
