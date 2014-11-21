/**
 * @module versioners/ExternalVersioner
 */

var TaskClass = require('../helpers/task');
var AbstractVersioner = require('./abstractVersioner');
var inherit = require('../helpers/inherit');
var grunt = require('grunt');
var _ = require('lodash');

/**
 * External Task Versioner
 * @constructor
 * @alias module:versioners/ExternalVersioner
 * @augments module:versioners/AbstractVersioner
 */
var ExternalVersioner = inherit(AbstractVersioner);

/**
 * Initialization function run by the constructor
 */
ExternalVersioner.prototype.initialize = function () {
  // display a warning if both assets versioning and target tasks have a file configuration object
  if (this.taskData.data.files != null) {
    grunt.log.error("Files passed to '" + this.getAssetsVersioningTaskName() + "' won't be versioned.");
  }

  if (this.options.post) {
    grunt.log.debug("Post-Versioning Mode");
    this.surrogateTasks = this.options.tasks;

    var intermediateDestFiles = _.flatten(this.getTargetTasks().map(this.retrieveDestFiles.bind(this)));
    grunt.log.debug("Retrieved all external tasks destination files: " + intermediateDestFiles.join(', '));
    var filesArray = intermediateDestFiles.map(function (destFile) {
      return {src: [destFile], dest: destFile};
    });

    var task = new TaskClass(this.getAssetsVersioningTaskName(), filesArray);
    this.surrogateTasks.push(task.createPostVersioningTask(filesArray));
  } else {
    grunt.log.debug("Pre-Versioning Mode");
    this.surrogateTasks = this.hijackTargetTasks();
  }
};

/**
 * Retrieve all destination files
 * @param task
 * @returns {Array}
 */
ExternalVersioner.prototype.retrieveDestFiles = function (task) {
  var destFiles = [];
  var filesMapLength = task.taskFiles.length;
  task.taskFiles.forEach(function(f, index) {
    if (!this.checkFilesObjValidity(f, task, index, filesMapLength)) { return false; }
    destFiles.push(f.dest);
  }.bind(this));
  return destFiles;
};

/**
 * Get the target task full name
 * @returns {Array.<Task>}
 */
ExternalVersioner.prototype.getTargetTasks = function () {
  return this.options.tasks.map(function (taskName) {
    return new TaskClass(taskName);
  });
};

/**
 * Do the actual versioning
 */
ExternalVersioner.prototype.doVersion = function () {
  if (this.options.runTask) {
    grunt.verbose.writeln("Tasks triggered: '" + this.surrogateTasks.join(", ") + "'");
    grunt.task.run(this.surrogateTasks);
    this.saveVersionsMap();
  }
};

/**
 * Create a surrogate task
 * @param {Array} updatedTaskFiles
 * @param task
 * @returns {surrogateTask}
 */
ExternalVersioner.prototype.createSurrogateTask = function (updatedTaskFiles, task) {
  return task.createSurrogate(updatedTaskFiles);
};

module.exports = ExternalVersioner;
