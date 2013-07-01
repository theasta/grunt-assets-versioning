/*
 * grunt-assets-versioning
 * https://github.com/theasta/grunt-assets-versioning
 *
 * Copyright (c) 2013 Alexandrine Boissière
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    assets_versioning: {
      bundles_with_date: {
        options: {
          use           : 'date',
          dateFormat    : 'YYMMDDhhmmss',
          multitask     : 'concat',
          output        : 'tmp/bundles_with_date.json',
          outputTrimDir : 'tmp/js/'
        },
        files: {
          'tmp/js/js_bundle_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/js_bundle_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },
      files_from_another_task: {
        files: '<%= concat.test1.files %>',
        options: {
          multitask     : 'concat',
          multitaskTarget    : 'test1',
          skipExisting  : true,
          output        : 'tmp/files_from_another_task.json'
        }
      },
      images_with_date: {
        files:[{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/images_with_date/"
        }],
        options: {
          use         : 'date',
          output      : 'tmp/images_with_date.json'
        }
      },
      images_with_start_date: {
        files:[{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/images_with_start_date/"
        }],
        options: {
          use           : 'date',
          dateStart     : new Date(1359647460000), //Thu Jan 31 2013 07 : 51 : 00 GMT-0800 (PST)
          output        : 'tmp/images_with_startdate.json',
          outputTrimDir : 'tmp/images_with_start_date/'
        }
      },
      images_with_hash: {
        files:[{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/images_with_hash/"
        }],
        options: {
          use        : 'hash',
          hashLength : 10,
          output     : 'tmp/images_with_hash.json'
        }
      },

      files_compact_format: {
        options: {
          use: 'hash',
          hashLength: 6,
          multitask: 'concat'
        }
      }

    },

    concat: {
      test1:{
        files: {
          'tmp/js/js_bundle.js': ['test/fixtures/js/**/*.js', '!test/fixtures/js/file3.js']
        }
      },
      files_compact_format:{
        src: [
          'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js'
        ],
        filter: 'isFile',
        dest: 'tmp/js/compact_format.js'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

    watch: {
      files: ['<%= jshint.all %>'],
      tasks: ['jshint', 'test']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [ 'clean', 'assets_versioning',  'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
