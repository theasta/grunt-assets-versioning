/**
 * @module versioners/InternalVersioner
 */

var TaskClass = require('../helpers/task');
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

InternalVersioner.prototype.initialize = function () {
  // if internal task is a post versioning internal task
  //this.isPostVersioningTask = grunt.config(this.getAssetsVersioningTaskConfigKey() + '.isPostVersioningTaskFor');
  this.setSurrogateTasks();
};

InternalVersioner.prototype.getPostVersioningSurrogateTasks = function () {
  return [this.createPostVersioningTask()];
};

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

/**
 * Copy or concat files
 * @param files
 * @private
 */
InternalVersioner.prototype._copyOrConcat = function (files) {
  files.forEach(function (filesObj)  {
    // if only one file, copy it
    // otherwise concatenate the content
    if (filesObj.src.length === 1) {
      grunt.file.copy(filesObj.src[0], filesObj.dest);
      if (this.isPostVersioningTask) {
        grunt.file.delete(filesObj.src[0]);
        grunt.log.debug("Deleted intermediate destination file: " + filesObj.src[0]);
      }
    } else {
      var content = filesObj.src.map(function (filepath) {
        return grunt.file.read(filepath);
      }).join(grunt.util.linefeed);

      grunt.file.write(filesObj.dest, content);
    }

    grunt.log.writeln('File ' + filesObj.dest + ' created.');

  }, this);
};

InternalVersioner.prototype.doVersion = function () {
  this.saveVersionsMap();

  if (this.surrogateTasks.length !== 1) {
    grunt.log.error('There should be only one surrogate task in internal mode.');
  }

  if (this.options.post) {
    this._copyOrConcat(this.getTargetTasks()[0].taskFiles);
    grunt.task.run(this.surrogateTasks);
  } else {
    this._copyOrConcat(this.surrogateTasks[0].files);
  }

};

module.exports = InternalVersioner;
