/**
 * @module versioners/AbstractVersioner
 */

var grunt = require('grunt');
var taggers = require('../taggers');
var _ = require('lodash');
var TaskClass = require('../helpers/task');
var slash = require('slash');

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

  // is task a post versioning task?
  this.isPostVersioningTask = grunt.config(this.getAssetsVersioningTaskConfigKey() + '.isPostVersioningTaskFor');
}

/**
 * Initiliaze the task
 * @abstract
 */
AbstractVersioner.prototype.initialize = function () {};

/**
 * Set the property surrogateTasks
 */
AbstractVersioner.prototype.setSurrogateTasks = function () {
  if (this.options.post) {
    grunt.log.debug("Post-Versioning Mode");
    this.surrogateTasks = this.getPostVersioningSurrogateTasks();
  } else {
    grunt.log.debug("Pre-Versioning Mode");
    this.surrogateTasks = this.getPreVersioningSurrogateTasks();
  }
};

/**
 * Create or gather all Surrogate Tasks for the post versioning mode
 * @abstract
 */
AbstractVersioner.prototype.getPostVersioningSurrogateTasks = function () {
  throw new Error('Should be implemented by the subclass');
};

/**
 * Create or gather all surrogate tasks for the pre versioning mode
 * @returns {Array} Array of tasks names
 */
AbstractVersioner.prototype.getPreVersioningSurrogateTasks = function () {
  return this.getTargetTasks().map(this.createPreVersioningSurrogateTask.bind(this));
};

/**
 * Create the Post Versioning Task
 * @returns {string}
 */
AbstractVersioner.prototype.createPostVersioningTask = function () {
  var intermediateDestFiles = _.flatten(this.getTargetTasks().map(this.retrieveDestFiles.bind(this)));
  grunt.log.debug("Retrieved all destination files: " + intermediateDestFiles.join(', '));
  var filesArray = intermediateDestFiles.map(function (destFile) {
    return {src: [destFile], dest: destFile};
  });
  var task = new TaskClass(this.getAssetsVersioningTaskName(), filesArray);
  return task.createPostVersioningTask(filesArray);
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
 * @param filesMapIndex
 * @param filesMapLength
 * @returns {*}
 */
AbstractVersioner.prototype.checkFilesObjValidity = function (filesObj, filesMapIndex, filesMapLength) {
  grunt.log.debug("Iterating through file mapping - " + ( filesMapIndex + 1 ) + "/" + filesMapLength);

  var src = filesObj.src.filter(function (file) {
    return grunt.file.isFile(file);
  });

  grunt.log.debug('Source files: ', src);
  if (src.length === 0) {
    grunt.log.debug(JSON.stringify(filesObj.orig));
    return false;
  }

  if (typeof filesObj.dest !== 'string') {
    grunt.log.debug(JSON.stringify(filesObj.orig));
    return false;
  }

  return src;
};

/**
 * Retrieve all destination files
 * @param task
 * @returns {Array}
 */
AbstractVersioner.prototype.retrieveDestFiles = function (task) {
  var destFiles = [];
  var filesMapLength = task.taskFiles.length;
  task.taskFiles.forEach(function(f, index) {
    if (!this.checkFilesObjValidity(f, index, filesMapLength)) { return false; }
    destFiles.push(f.dest);
  }.bind(this));
  if (destFiles.length === 0) {
    grunt.fail.warn("Task '" + task.taskName + "' has no destination files!");
  }
  return destFiles;
};

/**
 * Create a Pre Versioning Surrogate Task by deducing the versioned name of its destination files and creating a surrogate task
 * @returns {Array.<surrogateTask>} - Array of surrogate tasks objects
 */
AbstractVersioner.prototype.createPreVersioningSurrogateTask = function (task) {

  var updatedTaskFiles = [];
  var allVersionedPath = [];

  var filesMapLength = task.taskFiles.length;
  var filesMapSkipCount = 0;
  task.taskFiles.forEach(function(taskFilesObj, index) {
    var src = this.checkFilesObjValidity(taskFilesObj, index, filesMapLength);
    if (!src) {
      filesMapSkipCount++;
      return false;
    }

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
        originalPath: src.toString().replace(this.options.versionsMapTrimPath, ''),
        versionedPath: slash(versionedPath)
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

  if (filesMapSkipCount === filesMapLength) {
    grunt.fail.warn("File configuration for Task '" + task.taskName + "' is incorrect. Missing valid source files and/or destination files!");
  }

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
  //var originalTask = grunt.config(this.getAssetsVersioningTaskConfigKey() + '.isPostVersioningTaskFor');
  //if (typeof originalTask === 'string') {
  //  grunt.config.set(originalTask + '.versionsMap', this.versionsMap);
  //}

  if (typeof this.isPostVersioningTask  === 'string') {
    grunt.config.set(this.isPostVersioningTask + '.versionsMap', this.versionsMap);
  }

  grunt.log.debug("Versions Map: ", this.versionsMap);
};

/* ---- ABSTRACT METHODS ---- */



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
