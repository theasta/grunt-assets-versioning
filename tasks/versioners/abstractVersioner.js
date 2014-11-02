/**
 * @module versioners/AbstractVersioner
 */

require('../processors/date');
require('../processors/hash');

/**
 * Abstract Versioner
 * @constructor
 * @alias module:versioners/AbstractVersioner
 * @param {object} g - Grunt object
 * @param {object} options - Grunt options
 * @param {object} taskContext - Grunt task context (=this)
 */
function AbstractVersioner(g, options, taskContext) {
  this.options = options;
  this.grunt = g;
  this.taskContext = taskContext;

  /**
   * Target Task full name (for example assets_versioning:myTask)
   * @type {string}
   */
  this.targetTask = this.getTargetTask();

  /**
   * Task files as provided by Grunt
   */
  this.taskFiles = this.getTaskFiles();

  /**
   * Task files with versioned destination, will be consumed by Grunt
   * @type {Array}
   */
  this.revFiles = [];

  /**
   * Map of versioned files
   * @type {Array}
   */
  this.versionsMap = [];

  /**
   * Get one of the processors : hash or date
   */
  this.versionProcessor = this._getVersionProcessor(this.options.use);
}

/**
 * Get the target task name
 * @abstract
 */
AbstractVersioner.prototype.getTargetTask = function () {
  throw new Error('Should be implemented by the subclass');
};

/**
 * Get the target task configuration key
 * @abstract
 */
AbstractVersioner.prototype.getTargetTaskConfigKey = function () {
  throw new Error('Should be implemented by the subclass');
};

/**
 * Get the target task configuration
 * @returns {Object}
 */
AbstractVersioner.prototype.getTaskConfig = function () {
  return this.grunt.config(this.getTargetTaskConfigKey());
};

/**
 * Get the target task grunt files configuration
 * @returns {Array}
 * @abstract
 */
AbstractVersioner.prototype.getTaskFiles = function () {
  throw new Error('Should be implemented by the subclass');
};

/**
 * Get the assets versioning task name (for example assets_versioning:mytask)
 * @returns {string}
 */
AbstractVersioner.prototype.getAssetsVersioningTaskName = function () {
  return this.taskContext.name + ':' + this.taskContext.target;
};

/**
 * Get the assets versioning task configuration key (for example assets_versioning.mytask)
 * @returns {string}
 */
AbstractVersioner.prototype.getAssetsVersioningTaskConfigKey = function () {
  return this.taskContext.name + '.' + this.taskContext.target;
};

/**
 * Get a version tag processor
 * @param {string} type - version tag type: date or hash
 * @returns {module:processors/hash | module:processors/date}
 * @private
 */
AbstractVersioner.prototype._getVersionProcessor = function (type) {
  return require('../processors/' + type);
};

/**
 * Create a grunt files object where the destination files will have a version tag
 */
AbstractVersioner.prototype.createVersionedGruntFilesObject = function () {

  var grunt = this.grunt;

  if (!this.taskFiles || this.taskFiles.length === 0) {
    grunt.fail.warn("Task '" + this.targetTask + "' doesn't have any src-dest file mappings.", 1);
  }

  this.taskFiles.forEach(function(f, index) {

    grunt.log.debug("Iterating through file mapping - " + ( index + 1 ) + "/" + this.taskFiles.length);

    var version;
    var destFilePath;
    var src = f.src.filter(function (file) {
      return grunt.file.isFile(file);
    });

    grunt.log.debug('Source files: ', src);
    if (src.length === 0) {
      grunt.fail.warn("Task '" + this.targetTask + "' has no source files.");
      grunt.log.debug(JSON.stringify(f.orig));
      return false;
    }

    if (typeof f.dest !== 'string') {
      grunt.log.error("Task '" + this.targetTask + "' has no destination file.");
      grunt.log.debug(JSON.stringify(f.orig));
      return;
    }

    version = this.versionProcessor(src, this.options);
    grunt.log.debug('Version tag (' + this.options.use + '): ' + version);

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
    this.revFiles.push({ src: src, dest: destFilePath });

  }.bind(this));

  grunt.log.debug("Versioned Files Object: ", this.revFiles);

};

/**
 * Save the versions map to a grunt configuration variable
 * and also optionally to a file
 */
AbstractVersioner.prototype.saveVersionsMap = function () {
  var grunt = this.grunt;

  if (typeof this.options.versionsMapFile === "string") {
    grunt.file.write(this.options.versionsMapFile, JSON.stringify(this.versionsMap));
  }

  grunt.config.set(this.getAssetsVersioningTaskConfigKey() + '.versionsMap', this.versionsMap);

  grunt.log.debug("Versions Map: ", this.versionsMap);
};

/**
 * Run the target task
 * @abstract
 */
AbstractVersioner.prototype.doVersion = function () {
  throw new Error('Should be implemented by the subclass');
};



module.exports = AbstractVersioner;
