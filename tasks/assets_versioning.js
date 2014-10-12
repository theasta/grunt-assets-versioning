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

  var getTaskConfigKey = function (taskName) {
    return taskName.replace(':', '.');
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
      tasks: false,
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
    var targetTaskConfigKey = this.name + '.' + this.target;
    var targetTask = this.name + ':' + this.target;
    var isExternalTaskMode = !!options.multitask || Array.isArray(options.tasks);

    if (isExternalTaskMode) {

      grunt.log.debug('External Task Mode');

      if (!!options.multitask) {
        options.tasks = [options.multitask + ':' + options.multitaskTarget]
      }

      if (options.tasks.length !== 1) {
        grunt.fail.fatal("grunt-assets-versioning v0.5.0 can only version one external task at a time. Aborting");
      }

      targetTask = options.tasks[0];

      targetTaskConfigKey = getTaskConfigKey(targetTask);
      grunt.log.writeln("Versioning files from " + targetTask + " task.");

      surrogateTask = targetTask + '_' + this.name;
      surrogateTaskConfigKey = targetTaskConfigKey + '_' + this.name;
      grunt.log.debug("Surrogate task: " + surrogateTask);

      taskConfig = grunt.config.get(targetTaskConfigKey);

      if (!taskConfig) {
        grunt.fail.warn("Task '" + targetTask + "' doesn't exist or doesn't have any configuration.", 1);
      }

      // In surrogate task mode, there should not be any 'files' property
      if (this.data.files != null) {
        grunt.log.error("In external task mode, files passed directly to the assets_versioning task won't be processed. Instead, the task is going to version files from the target task: '" + targetTask + "'");
      }

      // retrieve files from the target task
      taskFiles = grunt.task.normalizeMultiTaskFiles(taskConfig, this.target);

    } else {

      grunt.log.debug('Internal Task Mode');

      grunt.log.debug("Versioning files passed directly to '" + targetTask + "' task.");
      taskFiles = this.files;

    }

    if (!taskFiles || taskFiles.length === 0) {
      grunt.fail.warn("Task '" + targetTask + "' doesn't have any src-dest file mappings.", 1);
    }

    taskFiles.forEach(function(f, index) {

      grunt.log.debug("Iterating through file mapping - " + (index+1) + "/" + taskFiles.length);

      var rev;
      var destFilePath;
      var src = f.src.filter(function (file) {
        return grunt.file.isFile(file);
      });

      grunt.log.debug('Source files: ', src);
      if (src.length === 0) {
        grunt.fail.warn("Task '" + targetTask + "' has no source files.");
        grunt.log.debug(JSON.stringify(f.orig));
        return false;
      }

      if (typeof f.dest !== 'string') {
        grunt.log.error("Task '" + targetTask + "' has no destination file.");
        grunt.log.debug(JSON.stringify(f.orig));
        return;
      }

      rev = getVersionProcessor(options.use)(src, options);
      grunt.log.debug('Version tag (' + options.use + '): ' + rev);

      if (rev === '') {
        grunt.fail.warn("Failed at generating a version tag for " + f.dest, 1);
        return false;
      }

      destFilePath = options.rename.call(this, f.dest, rev);
      grunt.log.debug('Destination filename: ' + destFilePath);

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
          grunt.log.debug('Destination file already exists. Task skipped.');
          return false;
        }
        grunt.log.debug("Destination file doesn't exist. Task will be processed.");
      } else if (Array.isArray(options.skipExisting)) {
        if (options.skipExisting.indexOf(destFilePath) !== -1) {
          grunt.log.debug('Destination file listed in options.skipExisting. Task skipped');
          return false;
        }
        grunt.log.debug("Destination file not list in options.skipExisting. Task will be processed.");
      }

      // log the src and dest data
      revFiles.push({ src: src, dest: destFilePath });

    });

    if (options.output) {
      grunt.file.write(options.output, JSON.stringify(output));
      grunt.log.debug("Output content: ", output);
    }

    grunt.config.set(this.name + '.' + this.target + '.revFiles', revFiles);
    grunt.log.debug("Version file mapping: ", revFiles);

    // run surrogate task if defined
    if (isExternalTaskMode) {

      // remove src & dest keys as they take precedence over the files key
      delete taskConfig.src;
      delete taskConfig.dest;
      taskConfig.files = revFiles;
      grunt.config.set(surrogateTaskConfigKey, taskConfig);
      grunt.log.debug("Created surrogateTask 'surrogateTaskConfigKey'");
      grunt.log.debug(taskConfig);

      if (options.runTask) {
        grunt.verbose.writeln("Trigger task '" + surrogateTask + "'");
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

