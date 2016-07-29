'use strict';

module.exports = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  var reflinkRe = /^\[[^\W][^\]]+\]:[^\n]+/gm;
  var reflinks = str.match(reflinkRe) || [];
  var orig = reflinks.slice();

  reflinks = reflinks.reduce(function(acc, ele) {
    var segs = ele.split(']: ');
    acc[segs[0].slice(1)] = segs[1] || '';
    return acc;
  }, {});

  var re = /\[([^\W\[\]]+?)\]/;
  for (var key in reflinks) {
    if (reflinks.hasOwnProperty(key)) {
      var url = reflinks[key], match;
      var prev;

      while (prev !== url && (match = re.exec(url))) {
        prev = url;
        var name = match[1];
        if (!reflinks.hasOwnProperty(name)) {
          throw new Error(`cannot find a reflink for "${name}"`);
        }
        url = url.replace(match[0], reflinks[name]);
      }
      reflinks[key] = url;
    }
  }

  orig.forEach(function(reflink) {
    var name = /^\[(.+?)\]/.exec(reflink);
    if (!name || !reflinks[name[1]]) return;
    var link = `[${name[1]}]: ${reflinks[name[1]]}`;
    str = str.split(reflink).join(link);
  });

  return str;
};
