/**
 * @module versioners/ExternalVersioner
 */

var TaskClass = require('../helpers/task');
var AbstractVersioner = require('./abstractVersioner');
var inherit = require('../helpers/inherit');
var grunt = require('grunt');

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

ExternalVersioner.prototype.doVersion = function () {
  if (this.options.runTask) {
    grunt.verbose.writeln("Tasks triggered: '" + this.surrogateTasks.join(", ") + "'");
    grunt.task.run(this.surrogateTasks);
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
