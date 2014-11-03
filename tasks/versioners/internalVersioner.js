/**
 * @module versioners/InternalVersioner
 */

var TaskClass = require('../helpers/Task');
var AbstractVersioner = require('./abstractVersioner');
var inherit = require('../helpers/inherit');
var grunt = require('grunt');

/**
 * Internal Task Versioner
 * @constructor
 * @alias module:versioners/InternalVersioner
 * @augments module:versioners/AbstractVersioner
 */
var InternalVersioner = inherit(AbstractVersioner, {});

/**
 * Get target tasks instances
 * @returns {Array.<Task>}
 */
InternalVersioner.prototype.getTargetTasks = function () {
  return [new TaskClass(this.getAssetsVersioningTaskName(), this.taskData.files)];
};

/**
 * Create a surrogate task
 * @param {Array} updatedTaskFiles
 * @returns {surrogateTask}
 */
InternalVersioner.prototype.createSurrogateTask = function (updatedTaskFiles) {
  return { files: updatedTaskFiles };
};

InternalVersioner.prototype.doVersion = function () {

  if (this.surrogateTasks.length !== 1) {
    grunt.log.error('There should be only one surrogate task in internal mode.');
  }

  this.surrogateTasks[0].files.forEach(function (fRev) {

    var content = fRev.src.map(function (filepath) {
      return grunt.file.read(filepath);
    }).join(grunt.util.linefeed);

    grunt.file.write(fRev.dest, content);

    grunt.log.writeln('File ' + fRev.dest + ' created.');

  });

};

module.exports = InternalVersioner;
