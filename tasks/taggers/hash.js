/**
 * @module taggers/hash
 */

var crypto = require('crypto');
var fs = require('fs');

/**
 * Hash tagger
 * @param {Array} src - Array of files
 * @param {Object} options
 * @param {string} options.encoding - File encoding ('uf8')
 * @param {number} options.hashLength - Hash marker length
 * @returns {string}
 */
module.exports = function (src, options) {
  'use strict';
  var hash = crypto.createHash('md5');

  var digest = null;

  src.forEach(function (f) {
    var input = fs.openSync(f, 'r');
    var chunk = Buffer.alloc(256);
    var offset;
    while (0 !== (offset = fs.readSync(input, chunk, 0, 256))) {
      hash.update(chunk);
    }
    hash.update(f);
  });

  var hashLength = parseInt(options.hashLength, 10);
  digest = hash.digest('hex');

  // can't use typeof since typeof NaN == 'number'
  if (Object.prototype.toString.call(hashLength) === '[object Number]') {
    digest = digest.substr(0, hashLength);
  }

  return digest;
};
