/**
 * @module versioners/ExternalVersioner
 */

var taskHelper = require('../helpers/task');
var AbstractVersioner = require('./abstractVersioner');
var inherit = require('../helpers/inherit');

/**
 * External Task Versioner
 * @constructor
 * @alias module:versioners/ExternalVersioner
 * @augments module:versioners/AbstractVersioner
 */
var ExternalVersioner = inherit(AbstractVersioner);

ExternalVersioner.prototype.getTaskFiles = function () {

  var taskConfig = this.getTaskConfig();

  this.grunt.log.writeln("Versioning files from " + this.targetTask + " task.");
  this.grunt.log.debug("Surrogate task: " + this.getSurrogateTaskName());

  if (!taskConfig) {
    this.grunt.fail.warn("Task '" + this.targetTask + "' doesn't exist or doesn't have any configuration.", 1);
  }

  // In surrogate task mode, there should not be any 'files' property
  if (this.taskContext.data.files != null) {
    this.grunt.log.error("This task is going to version the files from '" + this.targetTask + "'" +
      ", and will ignore the ones passed directly to it.");
  }

  // retrieve files from the target task
  return this.grunt.task.normalizeMultiTaskFiles(taskConfig, this.taskContext.target);
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

  this.grunt.config.set(surrogateTaskConfigKey, taskConfig);
  this.grunt.log.debug("Created surrogateTask '" + surrogateTaskConfigKey + "'");
  this.grunt.log.debug(taskConfig);

  if (this.options.runTask) {
    this.grunt.verbose.writeln("Trigger task '" + surrogateTask + "'");
    this.grunt.task.run(surrogateTask);
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
