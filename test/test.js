'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var expand = require('..');

function read(filepath) {
  return fs.readFileSync(path.join(__dirname, filepath), 'utf8');
}

describe('expand-reflinks', function() {
  describe('lib', function() {
    it('should export a function', function() {
      assert.equal(typeof expand, 'function');
    });

    it('should throw an error when invalid args are passed', function(cb) {
      try {
        expand();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected a string');
        cb();
      }
    });
  });

  describe('reflinks', function() {
    it('should not mistake links for reflinks', function() {
      assert.equal(expand(read('fixtures/list.md')), read('fixtures/list.md'));
    });

    it('should throw when a reflink is not found', function(cb) {
      try {
        expand(read('fixtures/missing.md'));
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'cannot find a reflink for "assemble"');
        cb();
      }
    });

    it('should expand variables in reflinks', function() {
      var fixture = '[foo]: [github]\n[github]: https://github.com/';
      var result = '[foo]: https://github.com/\n[github]: https://github.com/';
      assert.equal(expand(fixture), result);

      var a = '[assemble]: [github]assemble/\n[github]: https://github.com/';
      var b = '[assemble]: https://github.com/assemble/\n[github]: https://github.com/';
      assert.equal(expand(a), b);

      assert.equal(expand(read('fixtures/variables.md')), read('expected/variables.md'));
    });

    it('should expand multiple variables reflinks', function() {
      assert.equal(expand(read('fixtures/path.md')), read('expected/path.md'));
    });
  });
});
