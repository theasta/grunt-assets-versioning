/**
 * @module versioners/InternalVersioner
 */

var AbstractVersioner = require('./abstractVersioner');
var inherit = require('../helpers/inherit');

/**
 * Internal Task Versioner
 * @constructor
 * @alias module:versioners/InternalVersioner
 * @augments module:versioners/AbstractVersioner
 */
var InternalVersioner = inherit(AbstractVersioner);

InternalVersioner.prototype.getTaskFiles = function () {
  this.grunt.log.debug('Internal Task Mode');
  this.grunt.log.debug("Versioning files passed directly to '" + this.targetTask + "' task.");
  return this.taskContext.files;
};

InternalVersioner.prototype.getTargetTask = function () {
  return this.getAssetsVersioningTaskName();
};

InternalVersioner.prototype.getTargetTaskConfigKey = function () {
  return this.getAssetsVersioningTaskConfigKey();
};

InternalVersioner.prototype.doVersion = function () {

  var grunt = this.grunt;
  this.revFiles.forEach(function (fRev) {

    var content = fRev.src.map(function (filepath) {
      return grunt.file.read(filepath);
    }).join(grunt.util.linefeed);

    grunt.file.write(fRev.dest, content);

    grunt.log.writeln('File ' + fRev.dest + ' created.');

  });

};

module.exports = InternalVersioner;
