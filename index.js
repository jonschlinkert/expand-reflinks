'use strict';

var Snapdragon = require('snapdragon');

module.exports = function expand(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  var snapdragon = new Snapdragon(options);
  snapdragon.use(require('./lib/parsers'));
  snapdragon.use(require('./lib/compilers'));

  var ast = snapdragon.parse(str);
  var res = snapdragon.compile(ast);
  return res.output;
};
