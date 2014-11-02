/**
 * @module versioners/versionerFactory
 */

var grunt = require('grunt');
var InternalVersioner = require('./internalVersioner');
var ExternalVersioner = require('./externalVersioner');

module.exports = function (options, taskContext) {
  "use strict";
  var Versioner;
  /**
   * Is the current task trying to version files from another task or not?
   * @type {boolean}
   */
  var isExternalTaskMode = !!options.multitask || Array.isArray(options.tasks);

  if (isExternalTaskMode) {
    grunt.log.debug('External Task Mode');
    Versioner = ExternalVersioner;
  } else {
    grunt.log.debug('Internal Task Mode');
    Versioner = InternalVersioner;
  }

  return new Versioner(options, taskContext);
};
