/*
 * grunt-assets-versioning
 * https://github.com/theasta/grunt-assets-versioning
 *
 * Copyright (c) 2013 Alexandrine Boissière
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var versionerFactory = require('./versioners/versionerFactory');
var _ = require('lodash');

module.exports = function(grunt) {

  grunt.registerMultiTask('assets_versioning', 'Version static assets', function() {

    var done = this.async();

    var options = this.options({
      tag: 'hash',
      hashLength: 8,
      encoding: 'utf8',
      dateFormat: 'YYYYMMDDHHmmss',
      timezoneOffset: 0,
      versionize: function(destPath, version) {
        var dir = path.dirname(destPath);
        var base = path.basename(destPath);
        var name = base.substring(0, base.indexOf('.'));
        var ext = base.substring(base.indexOf('.'));

        return dir + path.sep + name + '.' + version + ext;
      },
      versionsMapFile: null,
      versionsMapTrimPath: '',
      versionsMapTemplate: null,
      skipExisting: false,
      post: false,
      tasks: false,
      runTask: true
    });

    if (!_.contains(['hash', 'date'], options.tag)) {
      grunt.fail.warn('Invalid argument : options.tag should be equal to date or hash', 1);
    }

    if (options.post && options.skipExisting) {
      grunt.fail.fatal("To work, the option skipExisting needs the post option to be false. Please update your configuration to have either post or skipExisting set to false.");
    }

    /**
     * Create a concrete versioner instance
     * @type {AbstractVersioner}
     */
    var versioner = versionerFactory(options, this);

    versioner.initialize();
    versioner.doVersion();

    done();

  });

};

