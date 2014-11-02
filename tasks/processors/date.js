/**
 * @module processors/date
 */

var fs = require('fs');
var moment = require('moment');

module.exports = function (src, options) {

  var lastMtime = src.map(function(filepath){
    return +fs.statSync(filepath).mtime;
  }).sort().pop();
  return moment(lastMtime).zone(options.timezoneOffset).format(options.dateFormat);

};
