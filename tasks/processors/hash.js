var crypto = require('crypto');
var fs = require('fs');

module.exports = function (src, options) {
  var hash = '';

  src.forEach(function(f){
    hash += crypto.createHash('md5').update(fs.readFileSync(f, options.encoding)).digest('hex');
  });
  if (src.length > 1){
    hash = crypto.createHash('md5').update(hash).digest('hex');
  }
  var hashLength = parseInt(options.hashLength, 10);

  // can't use typeof since typeof NaN == 'number'
  if (Object.prototype.toString.call(hashLength) === '[object Number]') {
    hash = hash.substr(0, options.hashLength);
  }

  return hash;
};
