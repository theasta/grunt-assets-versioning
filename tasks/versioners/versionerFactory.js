/**
 * @module versioners/versionerFactory
 */

var grunt = require('grunt');
var InternalVersioner = require('./internalVersioner');
var ExternalVersioner = require('./externalVersioner');

/**
 * Create a concrete Versioner instance
 * @param {Object} options
 * @param {Array.<string>} [options.tasks] - Array of tasks to run and version
 * @param {Object} taskData
 * @returns {module:versioners/AbstractVersioner}
 */
module.exports = function (options, taskData) {
  "use strict";
  var Versioner;

  // Is the current task trying to version files from another task or not?
  if (Array.isArray(options.tasks)) {
    grunt.log.debug('External Task Mode');
    Versioner = ExternalVersioner;
  } else {
    grunt.log.debug('Internal Task Mode');
    if (options.tasks) grunt.log.warn("'tasks' option ignored: it can only be an array!");
    Versioner = InternalVersioner;
  }

  return new Versioner(options, taskData);
};
