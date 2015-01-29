/**
 * @module taggers/date
 */

var fs = require('fs');
var moment = require('moment');

/**
 * Date Tagger
 * @param {Array} src - Array of files
 * @param {Object} options
 * @param {string} options.dateFormat - Date format (YYYYMMDDHHmmss)
 * @returns {string}
 */
module.exports = function (src, options) {

  var lastMtime = src.map(function(filepath){
    return +fs.statSync(filepath).mtime;
  }).sort().pop();
  return moment(lastMtime).utcOffset(-options.timezoneOffset).format(options.dateFormat);

};
