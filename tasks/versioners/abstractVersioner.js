/**
 * @module versioners/AbstractVersioner
 */

var grunt = require('grunt');
var taggers = require('../taggers');
var _ = require('lodash');

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
}

AbstractVersioner.prototype.hijackTargetTasks = function () {
  return this.getTargetTasks().map(this.hijackTask.bind(this));
};

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
 * Check if task files are valid
 * @param filesObj
 * @param task
 * @param filesMapIndex
 * @param filesMapLength
 * @returns {*}
 */
AbstractVersioner.prototype.checkFilesObjValidity = function (filesObj, task, filesMapIndex, filesMapLength) {
  grunt.log.debug("Iterating through file mapping - " + ( filesMapIndex + 1 ) + "/" + filesMapLength);

  var src = filesObj.src.filter(function (file) {
    return grunt.file.isFile(file);
  });

  grunt.log.debug('Source files: ', src);
  if (src.length === 0) {
    grunt.fail.warn("Task '" + task.taskName + "' has no source files.");
    grunt.log.debug(JSON.stringify(filesObj.orig));
    return false;
  }

  if (typeof filesObj.dest !== 'string') {
    grunt.log.error("Task '" + task.taskName + "' has no destination file.");
    grunt.log.debug(JSON.stringify(filesObj.orig));
    return false;
  }

  return src;
};

/**
 * Hijack a task by deducing the versioned name of its destination files and creating a surrogate task
 * @returns {Array.<surrogateTask>} - Array of surrogate tasks objects
 */
AbstractVersioner.prototype.hijackTask = function (task) {

  var updatedTaskFiles = [];
  var allVersionedPath = [];

  var filesMapLength = task.taskFiles.length;

  task.taskFiles.forEach(function(taskFilesObj, index) {
    var src = this.checkFilesObjValidity(taskFilesObj, task, index, filesMapLength);
    if (!src) { return false; }

    var version = this.versionTagger(src, this.options);
    grunt.log.debug('Version tag (' + this.options.tag + '): ' + version);

    if (version === '') {
      grunt.fail.warn("Failed at generating a version tag for " + taskFilesObj.dest, 1);
      return false;
    }

    var destFilePath = this.options.versionize.call(this, taskFilesObj.dest, version);
    grunt.log.debug('Destination filename: ' + destFilePath);

    // push to the map of versions

    var versionedPath = destFilePath.replace(this.options.versionsMapTrimPath, '');
    if (_.contains(allVersionedPath, versionedPath)) {
      grunt.fail.warn("Duplicate versioned path detected: '" + versionedPath +"'.");
    } else {
      allVersionedPath.push(versionedPath);
      this.versionsMap.push({
        version: version,
        originalPath: taskFilesObj.dest.replace(this.options.versionsMapTrimPath, ''),
        versionedPath: versionedPath
      });
    }

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
  if (this.options.post) { return; }
  if (typeof this.options.versionsMapFile === "string") {
    var versionsMapContent;

    // Are we generating a json file or are we using a template file?
    var templateFile = this.options.versionsMapTemplate;
    if (typeof templateFile === "string") {
      if (!grunt.file.exists(templateFile)) {

      }
      var template = grunt.util.normalizelf(grunt.file.read(templateFile, 'utf8'));
      versionsMapContent = grunt.template.process(template, {
        data: {
          files: this.versionsMap
        }
      }).replace(/[\n]{2}/g,"\n");
    } else {
      versionsMapContent = JSON.stringify(this.versionsMap);
    }
    grunt.file.write(this.options.versionsMapFile, versionsMapContent);
  }

  grunt.config.set(this.getAssetsVersioningTaskConfigKey() + '.versionsMap', this.versionsMap);
  var originalTask = grunt.config(this.getAssetsVersioningTaskConfigKey() + '.isPostVersioningTaskFor');
  if (typeof originalTask === 'string') {
    grunt.config.set(originalTask + '.versionsMap', this.versionsMap);
  }

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
