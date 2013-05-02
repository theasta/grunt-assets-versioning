/*
 * grunt-assets-versioning
 * https://github.com/theasta/grunt-assets-versioning
 *
 * Copyright (c) 2013 Alexandrine Boissière
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var crypto = require('crypto');

module.exports = function(grunt) {

  grunt.registerMultiTask('assets_versioning', 'Static Assets revving', function() {

    var done = this.async();

    var options = this.options({
      use: 'date',
      hashLength: 8,
      encoding: 'utf8',
      dateStart: false,
      dateFormat: 'YYYYMMDDHHmmss',
      outputTrimDir: '',
      rename: function(destPath, rev) {
        return path.dirname(destPath) + path.sep + path.basename(destPath, path.extname(destPath)) + '.' + rev + path.extname(destPath);
      },
      output: null,
      skipExisting: false,
      multitask: false,
      multitaskTarget: this.target,
      runTask: true
    });

    var revFiles = [];
    var output = [];

    var taskFiles = this.files;

    var surrogateTask, surrogateTaskConfigKey, taskConfig, taskConfigKey;
    if (options.multitask) {
      // @todo check if tasks exists
      taskConfigKey = options.multitask + '.' + options.multitaskTarget;
      taskConfig = grunt.config.get(taskConfigKey);

      // if there is no 'files' property, try to get the files from the multitask
      if (this.data.files == null) {
        if (taskConfig) {
          taskFiles = grunt.task.normalizeMultiTaskFiles(taskConfig, this.target);
        }
      }

      surrogateTask = options.multitask + ':' + options.multitaskTarget + '_' + this.name;
      surrogateTaskConfigKey = taskConfigKey + '_' + this.name;
    }


    taskFiles.forEach(function(f){

      if (f.src.length === 0) {
        grunt.log.warn('src is an empty array');
        return false;
      }

      var rev;
      if (options.use === 'date') {
        var dateStartTime = !(options.dateStart instanceof Date) ? false : +options.dateStart;
        var lastMtime = f.src.map(function(filepath){
          return +fs.statSync(filepath).mtime;
        }).sort().pop();
        var lastMTimeFormatted = moment(lastMtime).format(options.dateFormat);

        rev = (!dateStartTime || dateStartTime < lastMtime) ? lastMTimeFormatted : '';

      } else if (options.use === 'hash') {
        var hash = '';
        f.src.forEach(function(f){
          hash += crypto.createHash('md5').update(grunt.file.read(f, options.encoding)).digest('hex');
        });
        if (f.src.length > 1){
          hash = crypto.createHash('md5').update(hash).digest('hex');
        }
        rev = hash;
        var hashLength = parseInt(options.hashLength, 10);
        if (Object.prototype.toString.call(hashLength) === '[object Number]') {
          rev = rev.substr(0, options.hashLength);
        }
      } else {
        grunt.fail.warn('Invalid argument : options.use should be equal to date or hase');
      }

      if (rev !== '') {
        // @todo : should I check if f.dest if not null ? or should it be done from inside the rename function ?
        var destFilePath = options.rename.call(this, f.dest, rev);

        if (options.output) {
          output.push({
            rev: rev,
            path: f.dest.replace(options.outputTrimDir, ''),
            revved_path: destFilePath.replace(options.outputTrimDir, ''),
          });
        }

        // check if file already exists
        if (options.skipExisting === true) {
          if (grunt.file.exists(destFilePath)) {
            return false;
          }
        }

        // log the src, dest data
        revFiles.push({ src: f.src, dest: destFilePath });
      }
    });

    if (options.output) {
      grunt.file.write(options.output, JSON.stringify(output));
    }

    grunt.config.set(this.name + '.'+ this.target + '.revFiles' , revFiles);

    // run surrogate task if defined
    if (surrogateTask) {
      if (taskConfig) {
        taskConfig.files = revFiles;
      } else {
        taskConfig = { files: revFiles };
      }
      grunt.config.set(surrogateTaskConfigKey, taskConfig);

      if (options.runTask) {
        grunt.task.run(surrogateTask);
      }
    }
    done();
  });

};

