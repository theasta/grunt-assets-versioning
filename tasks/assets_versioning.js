/*
 * grunt-assets-versioning
 * https://github.com/theasta/grunt-assets-versioning
 *
 * Copyright (c) 2013 Alexandrine Boissière
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

require('./processors/date');
require('./processors/hash');

module.exports = function(grunt) {

  var getVersionProcessor = function (type) {
    return require('./processors/' + type);
  };

  grunt.registerMultiTask('assets_versioning', 'Version static assets', function() {

    var done = this.async();

    var options = this.options({
      use: 'hash',
      hashLength: 8,
      encoding: 'utf8',
      dateFormat: 'YYYYMMDDHHmmss',
      timezoneOffset: 0,
      outputTrimDir: '',
      rename: function(destPath, rev) {
        return path.dirname(destPath) + path.sep + path.basename(destPath, path.extname(destPath)) + '.' + rev + path.extname(destPath);
      },
      output: null,
      skipExisting: true,
      multitask: false,
      multitaskTarget: this.target,
      runTask: true
    });

    if (['hash', 'date'].indexOf(options.use) === -1) {
      grunt.fail.warn('Invalid argument : options.use should be equal to date or hash', 1);
    }

    var revFiles = [];
    var output = [];
    var taskFiles;
    var surrogateTask;
    var surrogateTaskConfigKey;
    var taskConfig;
    var taskConfigKey;
    var isSurrogateTaskMode = !!options.multitask;

    if (isSurrogateTaskMode) {

      grunt.log.debug('Versioning files from another task.');

      taskConfigKey = options.multitask + '.' + options.multitaskTarget;
      surrogateTask = options.multitask + ':' + options.multitaskTarget + '_' + this.name;
      surrogateTaskConfigKey = taskConfigKey + '_' + this.name;

      taskConfig = grunt.config.get(taskConfigKey);

      if (!taskConfig) {
        grunt.fail.warn("Couldn't find configuration for the targeted task " + taskConfigKey, 1);
      }

      // In surrogate task mode, there should not be any 'files' property
      if (this.data.files != null) {
        grunt.log.warn("Files passed directly to the task won't be processed. Instead processing files from " + taskConfigKey);
      }

      // retrieve files from the targeted task
      taskFiles = grunt.task.normalizeMultiTaskFiles(taskConfig, this.target);

    } else {

      grunt.log.debug('Versioning files passed to this task directly.');
      taskFiles = this.files;

    }

    if (!taskFiles || taskFiles.length === 0) {
      grunt.fail.warn("Couldn't find any file to process " + taskConfigKey, 1);
    }

    taskFiles.forEach(function(f) {

      var rev;
      var destFilePath;
      var src = f.src.filter(function (file) {
        return grunt.file.isFile(file);
      });

      if (src.length === 0) {
        grunt.log.warn('src is an empty array');
        return false;
      }

      rev = getVersionProcessor(options.use)(src, options);
      grunt.log.debug('Version tag: ' + rev);

      if (rev === '') {
        grunt.fail.warn("Failed at generating a version tag for " + f.dest, 1);
        return false;
      }

      destFilePath = options.rename.call(this, f.dest, rev);
      grunt.log.debug('Destination filename: ' + rev);

      if (options.output) {
        output.push({
          rev: rev,
          path: f.dest.replace(options.outputTrimDir, ''),
          revved_path: destFilePath.replace(options.outputTrimDir, '')
        });
      }

      // check if file already exists
      if (options.skipExisting === true) {
        grunt.log.debug('options.skipExisting is true, checking if destination file already exists.');
        if (grunt.file.exists(destFilePath)) {
          return false;
        }
      }

      // log the src and dest data
      revFiles.push({ src: src, dest: destFilePath });

    });

    if (options.output) {
      grunt.file.write(options.output, JSON.stringify(output));
    }

    grunt.config.set(this.name + '.' + this.target + '.revFiles', revFiles);

    // run surrogate task if defined
    if (isSurrogateTaskMode) {

      // remove src & dest keys as they take precedence over the files key
      delete taskConfig.src;
      delete taskConfig.dest;
      taskConfig.files = revFiles;
      grunt.config.set(surrogateTaskConfigKey, taskConfig);

      if (options.runTask) {
        grunt.task.run(surrogateTask);
      }

    } else {

      revFiles.forEach(function (fRev) {

        var content = fRev.src.map(function (filepath) {
          return grunt.file.read(filepath);
        }).join(grunt.util.linefeed);

        grunt.file.write(fRev.dest, content);

        grunt.log.writeln('File ' + fRev.dest + ' created.');

      });

    }

    done();

  });

};

