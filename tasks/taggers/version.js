/**
 * @module taggers/version
 */

var fs = require('fs');

/**
 * Version Tagger
 * @param {Array} src - Array of files
 * @param {Object} options
 * @param {string} options.version - Version
 * @returns {string}
 */
module.exports = function (src, options) {
  return options.version;
};
