/**
 * @module versioners/ExternalVersioner
 */

var taskHelper = require('../helpers/task');
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
 * Display a warning if files have been passed directly to the assetsVersioning task
 */
ExternalVersioner.prototype.checkFilesConflict = function () {
  if (this.taskContext.data.files != null) {
    grunt.log.error("This task is going to version the files from '" + this.targetTask + "'" +
    ", and not the ones passed to '" + this.getAssetsVersioningTaskName() + "'.");
  }
};

ExternalVersioner.prototype.getTaskFiles = function () {

  this.checkFilesConflict();

  var taskConfig = this.getTaskConfig();

  grunt.log.writeln("Versioning files from " + this.targetTask + " task.");

  if (!taskConfig) {
    grunt.fail.warn("Task '" + this.targetTask + "' doesn't exist or doesn't have any configuration.", 1);
  }

  // retrieve files from the target task
  return grunt.task.normalizeMultiTaskFiles(taskConfig, this.taskContext.target);
};

/**
 * Get the target task full name
 * @returns {Array}
 */
ExternalVersioner.prototype.getTargetTask = function () {
  return this.options.tasks[0];
};

ExternalVersioner.prototype.getTargetTaskConfigKey = function () {
  return taskHelper.getTaskConfigKey(this.targetTask);
};

ExternalVersioner.prototype.doVersion = function () {
  var taskConfig = this.getTaskConfig();
  var surrogateTask = this.getSurrogateTaskName();
  var surrogateTaskConfigKey = taskHelper.getTaskConfigKey(surrogateTask);

  // remove src & dest keys as they take precedence over the files key
  delete taskConfig.src;
  delete taskConfig.dest;
  taskConfig.files = this.revFiles;

  grunt.config.set(surrogateTaskConfigKey, taskConfig);
  grunt.log.debug("Created surrogateTask '" + surrogateTaskConfigKey + "'");
  grunt.log.debug(taskConfig);

  if (this.options.runTask) {
    grunt.verbose.writeln("Trigger task '" + surrogateTask + "'");
    grunt.task.run(surrogateTask);
  }
};

/**
 * Get the surrogate task name
 * @returns {string}
 */
ExternalVersioner.prototype.getSurrogateTaskName = function () {
  return this.targetTask + '_' + this.taskContext.name;
};

module.exports = ExternalVersioner;
