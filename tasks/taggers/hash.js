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
    var input = fs.readFileSync(f, options.encoding);
    hash.update(input, 'binary');
    hash.update(f, 'binary');
  });

  var hashLength = parseInt(options.hashLength, 10);
  digest = hash.digest('hex');

  // can't use typeof since typeof NaN == 'number'
  if (Object.prototype.toString.call(hashLength) === '[object Number]') {
    digest = digest.substr(0, hashLength);
  }

  return digest;
};
