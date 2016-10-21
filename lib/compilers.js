'use strict';

module.exports = function(snapdragon) {
  var reflinks = snapdragon.reflinks;
  snapdragon.compiler

    /**
     * Escaped characters
     */

    .set('bos', function(node) {
      while (reflinks.unresolved.length) {
        var tok = reflinks.unresolved.pop();
        var m = /(\[([^\]]+)\])(.*)/.exec(tok.link);
        if (!m) {
          reflinks.resolved[tok.label] = tok;
          continue;
        }

        var key = m[2];
        var res = reflinks.resolved[key];
        if (res) {
          tok.link = tok.link.replace(m[1], res.link);
          tok.data = res;
          reflinks.unresolved.push(tok);
          continue;
        }

        tok.unresolved = m[2];
      }
    })

    /**
     * Text
     */

    .set('text', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Newlines
     */

    .set('newline', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Reflinks
     */

    .set('reflink', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('reflink.open', function(node) {
      return this.emit(node.val, node);
    })
    .set('reflink.inner', function(node) {
      return this.emit(node.val, node);
    })
    .set('reflink.close', function(node) {
      return this.emit(node.val, node);
    })
    .set('reflink.link', function(node) {
      var key = node.unresolved;
      if (key && reflinks.resolved[key]) {
        var val = reflinks.resolved[key];
        node.link = val.link;
        node.data = val;
      }

      var data = node.data || {};
      var text = node.text || data.text;
      var parent = data;

      while (!text && parent) {
        text = parent.text;
        parent = parent.data;
      }

      if (text) {
        node.link += ' "' + text + '"';
      }
      return this.emit(node.link, node);
    });
};
