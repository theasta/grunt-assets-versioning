/**
 * @module helpers/Task
 */

var grunt = require('grunt');
var surrogateSuffix = '_assets_versioning';
var postSuffix = '_post_assets_versioning';

/**
 * Create a task instance
 * @param {string} taskName
 * @param {Array} [taskFiles]
 * @constructor
 */
var Task = function (taskName, taskFiles) {
  grunt.log.writeln("Versioning files from " + taskName + " task.");
  this.taskName = taskName;

  this.taskConfig = this.getTaskConfig();

  if (!this.taskConfig) {
    grunt.fail.warn("Task '" + this.taskName + "' doesn't exist or doesn't have any configuration.", 1);
  }

  this.taskFiles = taskFiles || this.getFiles();
  if (!this.taskFiles || this.taskFiles.length === 0) {
    grunt.fail.warn("Task '" + this.taskName + "' doesn't have any src-dest file mappings.", 1);
  }

};

/**
 * Get the task configuration
 * @returns {Object}
 */
Task.prototype.getTaskConfig = function () {
  return grunt.config(this.getTaskConfigKey());
};

/**
 * Get the task configuration key
 * @returns {string}
 */
Task.prototype.getTaskConfigKey = function (taskName) {
  taskName = taskName || this.taskName;
  return taskName.replace(':', '.');
};

/**
 * Get the target task grunt files configuration
 * @returns {Array}
 */
Task.prototype.getFiles = function () {
  return grunt.task.normalizeMultiTaskFiles(this.taskConfig);
};

/**
 *
 * @param {Array} filesObj
 * @returns {string}
 */
Task.prototype.createSurrogate = function (filesObj) {
  var surrogateTask = this.taskName + surrogateSuffix;
  var surrogateTaskConfigKey = this.getTaskConfigKey(surrogateTask);

  if (grunt.config(surrogateTaskConfigKey)) {
    grunt.fail.warn("Task '" + surrogateTask + "' already exists!");
  }

  var surrogateTaskConfig = this.taskConfig;
  // remove src & dest keys as they take precedence over the files key
  delete surrogateTaskConfig.src;
  delete surrogateTaskConfig.dest;
  surrogateTaskConfig.files = filesObj;

  grunt.config.set(surrogateTaskConfigKey, surrogateTaskConfig);
  grunt.log.debug("Created surrogateTask '" + surrogateTaskConfigKey + "'");
  grunt.log.debug(surrogateTaskConfig);

  return surrogateTask;
};

/**
 *
 * @param {Array} filesObj
 * @returns {string}
 */
Task.prototype.createPostVersioningTask = function (filesObj) {
  var postTask = this.taskName + postSuffix;
  var taskConfigKey = this.getTaskConfigKey(postTask);

  if (grunt.config(taskConfigKey)) {
    grunt.fail.warn("Task '" + postTask + "' already exists!");
  }

  var postTaskConfig = this.taskConfig;
  // remove src & dest keys as they take precedence over the files key
  delete postTaskConfig.src;
  delete postTaskConfig.dest;
  postTaskConfig.options = postTaskConfig.options || {};
  postTaskConfig.options.post = false;
  postTaskConfig.options.tasks = false;
  postTaskConfig.versionsMapCopyTo = this.getTaskConfigKey();
  postTaskConfig.files = filesObj;

  grunt.config.set(taskConfigKey, postTaskConfig);
  grunt.log.debug("Created versioningTask '" + taskConfigKey + "'");
  grunt.log.debug(postTaskConfig);

  return this.taskName + postSuffix;
};


module.exports = Task;
