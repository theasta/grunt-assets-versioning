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
    grunt.log.debug("Post Versioning Mode");
    this.surrogateTasks = this.options.tasks;
    var filesArray = _.flatten(this.getTargetTasks().map(this.retrieveDestFiles.bind(this)))
      .map(function (destFile) {
      return {src: [destFile], dest: destFile};
    });
    var task = new TaskClass(this.getAssetsVersioningTaskName(), filesArray);
    this.surrogateTasks.push(task.createPostVersioningTask(filesArray));
  } else {
    this.surrogateTasks = this.hijackTargetTasks();
  }
};

ExternalVersioner.prototype.retrieveDestFiles = function (task) {
  var destFiles = [];
  task.taskFiles.forEach(function(f, index) {

    grunt.log.debug("Iterating through file mapping - " + ( index + 1 ) + "/" + task.taskFiles.length);

    var src = f.src.filter(function (file) {
      return grunt.file.isFile(file);
    });

    grunt.log.debug('Source files: ', src);
    if (src.length === 0) {
      grunt.fail.warn("Task '" + task.taskName + "' has no source files.");
      grunt.log.debug(JSON.stringify(f.orig));
      return;
    }

    if (typeof f.dest !== 'string') {
      grunt.log.error("Task '" + task.taskName + "' has no destination file.");
      grunt.log.debug(JSON.stringify(f.orig));
      return;
    }

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
