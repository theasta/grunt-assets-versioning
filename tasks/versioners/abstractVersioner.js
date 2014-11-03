/**
 * @module versioners/AbstractVersioner
 */

var grunt = require('grunt');
var taggers = require('../taggers');

/**
 * A grunt files configuration object
 * @typedef {{src: Array, dest: string}} filesConfigurationObject
 */

/**
 * A surrogate task - task with destination files tagged with a revision marker
 * @typedef {(string|{files: Array})} surrogateTask
 */

/**
 * Abstract Versioner
 * @constructor
 * @alias module:versioners/AbstractVersioner
 * @param {object} options - Grunt options
 * @param {object} taskData - Grunt Assets Versioning Task Object
 */
function AbstractVersioner(options, taskData) {
  this.options = options;
  this.taskData = taskData;

  /**
   * Map of versioned files
   * @type {Array.<{version, originalPath: string, versionedPath: string}>}
   */
  this.versionsMap = [];

  /**
   * Get one of the tagger functions: hash or date
   * @type {function}
   */
  this.versionTagger = taggers[this.options.tag];

  this.initialize();

  /**
   * Array of surrogate tasks
   * @type {Array.<surrogateTask>}
   */
  this.surrogateTasks = this.getTargetTasks().map(this.hijackTask.bind(this));
}

/**
 * Get the assets versioning task name (for example assets_versioning:mytask)
 * @returns {string}
 */
AbstractVersioner.prototype.getAssetsVersioningTaskName = function () {
  return this.taskData.name + ':' + this.taskData.target;
};

/**
 * Get the assets versioning task configuration key (for example assets_versioning.mytask)
 * @returns {string}
 */
AbstractVersioner.prototype.getAssetsVersioningTaskConfigKey = function () {
  return this.taskData.name + '.' + this.taskData.target;
};

/**
 * Hijack a task by deducing the versioned name of its destination files and creating a surrogate task
 * @returns {Array.<surrogateTask>} - Array of surrogate tasks objects
 */
AbstractVersioner.prototype.hijackTask = function (task) {

  var updatedTaskFiles = [];
  task.taskFiles.forEach(function(f, index) {

    grunt.log.debug("Iterating through file mapping - " + ( index + 1 ) + "/" + task.taskFiles.length);

    var version;
    var destFilePath;
    var src = f.src.filter(function (file) {
      return grunt.file.isFile(file);
    });

    grunt.log.debug('Source files: ', src);
    if (src.length === 0) {
      grunt.fail.warn("Task '" + task.taskName + "' has no source files.");
      grunt.log.debug(JSON.stringify(f.orig));
      return false;
    }

    if (typeof f.dest !== 'string') {
      grunt.log.error("Task '" + task.taskName + "' has no destination file.");
      grunt.log.debug(JSON.stringify(f.orig));
      return;
    }

    version = this.versionTagger(src, this.options);
    grunt.log.debug('Version tag (' + this.options.tag + '): ' + version);

    if (version === '') {
      grunt.fail.warn("Failed at generating a version tag for " + f.dest, 1);
      return false;
    }

    destFilePath = this.options.versionize.call(this, f.dest, version);
    grunt.log.debug('Destination filename: ' + destFilePath);

    // push to the map of versions
    this.versionsMap.push({
      version: version,
      originalPath: f.dest.replace(this.options.versionsMapTrimPath, ''),
      versionedPath: destFilePath.replace(this.options.versionsMapTrimPath, '')
    });

    // check if file already exists
    if (this.options.skipExisting === true) {
      grunt.log.debug('options.skipExisting is true, checking if destination file already exists.');
      if (grunt.file.exists(destFilePath)) {
        grunt.log.debug('Destination file already exists. Task skipped.');
        return false;
      }
      grunt.log.debug("Destination file doesn't exist. Task will be processed.");
    } else if (Array.isArray(this.options.skipExisting)) {
      if (this.options.skipExisting.indexOf(destFilePath) !== -1) {
        grunt.log.debug('Destination file listed in options.skipExisting. Task skipped');
        return false;
      }
      grunt.log.debug("Destination file not list in options.skipExisting. Task will be processed.");
    }

    // log the src and dest data
    updatedTaskFiles.push({ src: src, dest: destFilePath });

  }.bind(this));

  grunt.log.debug("Versioned Files Object: ", updatedTaskFiles);

  return this.createSurrogateTask(updatedTaskFiles, task);
};

/**
 * Save the versions map to a grunt configuration variable
 * and also optionally to a file
 */
AbstractVersioner.prototype.saveVersionsMap = function () {

  if (typeof this.options.versionsMapFile === "string") {
    grunt.file.write(this.options.versionsMapFile, JSON.stringify(this.versionsMap));
  }

  grunt.config.set(this.getAssetsVersioningTaskConfigKey() + '.versionsMap', this.versionsMap);

  grunt.log.debug("Versions Map: ", this.versionsMap);
};

/* ---- ABSTRACT METHODS ---- */

/**
 * Initiliaze the task
 * @abstract
 */
AbstractVersioner.prototype.initialize = function () {};

/**
 * Get target tasks instances
 * @abstract
 * @returns {TaskClass}
 */
AbstractVersioner.prototype.getTargetTasks = function () {
  throw new Error('Should be implemented by the subclass');
};

/**
 * Create a surrogate task
 * @abstract
 */
AbstractVersioner.prototype.createSurrogateTask = function () {
  throw new Error('Should be implemented by the subclass');
};

/**
 * Run the target task
 * @abstract
 */
AbstractVersioner.prototype.doVersion = function () {
  throw new Error('Should be implemented by the subclass');
};

module.exports = AbstractVersioner;
