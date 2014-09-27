/*
 * grunt-assets-versioning
 * https://github.com/theasta/grunt-assets-versioning
 *
 * Copyright (c) 2013 Alexandrine Boissière
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var _fileGlobSync;
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
      date_several_sources: {
        options: {
          use           : 'date'
        },
        files: {
          'tmp/js/js_bundle_a.js': ['test/fake/file1.js', 'test/fake/file2.js'],
          'tmp/js/js_bundle_b.js': ['test/fake/file3.js', 'test/fake/file4.js']
        }
      },
      date_options_dateFormat: {
        options: {
          use           : 'date',
          dateFormat: 'YYMMDDHHmmss',
          timezoneOffset: 7
        },
        files: {
          'tmp/js/js_bundle_a.js': ['test/fake/file1.js', 'test/fake/file2.js'],
          'tmp/js/js_bundle_b.js': ['test/fake/file3.js', 'test/fake/file4.js']
        }
      },
      date_options_timezoneOffset: {
        options: {
          use           : 'date',
          timezoneOffset: 7
        },
        files: {
          'tmp/js/js_bundle_a.js': ['test/fake/file1.js', 'test/fake/file2.js'],
          'tmp/js/js_bundle_b.js': ['test/fake/file3.js', 'test/fake/file4.js']
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
          output     : 'tmp/images_with_hash.json'
        }
      },
      surrogate_compact_format: {
        options: {
          use:          'hash',
          multitask: 'concat'
        }
      },
      files_default_behaviour: {
        options: {
          use:          'hash'
        },
        files: {
          'tmp/js/default_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/default_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },

      fail_no_valid_files: {
          'tmp/js/no_file/no_file.js': ['test/fixtures/js/file2.js']
      },

      fail_no_files: {},

      fail_no_valid_external_task: {
        options: {
          multitask: 'dontexist'
        }
      }

    },

    concat: {
      surrogate_compact_format:{
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

  var mock = require('mock-fs');

  grunt.registerTask('startMocking', function () {

    mock({
      'test/fake/': {
        'file1.js': mock.file({
          content: 'file content here',
          ctime: new Date(1411609054470),
          mtime: new Date(1411609054470) //Wed Sep 24 2014 18:37:34 GMT-0700 (PDT)
        }),
        'file2.js': mock.file({
          content: 'file content here',
          ctime: new Date(1369140245000),
          mtime: new Date(1369140245000) //Tue May 21 2013 05:44:05 GMT-0700 (PDT)
        }),
        'file3.js': mock.file({
          content: 'file content here',
          ctime: new Date(1328091453000),
          mtime: new Date(1328091453000) //Wed Feb 01 2012 02:17:33 GMT-0800 (PST)
        }),
        'file4.js': mock.file({
          content: 'file content here',
          ctime: new Date(1388563200000),
          mtime: new Date(1388563200000) //Wed Jan 01 2014 00:00:00 GMT-0800 (PST)
        })
      }
    });

    // grunt is using glob that is using graceful-fs.
    // It also needs to be mocked
    _fileGlobSync = grunt.file.glob.sync;
    grunt.file.glob.sync = function (pattern, options) {
      if (/^test\/fake\/.*/.test(pattern)) {
        return pattern;
      } else {
        return _fileGlobSync(pattern, options);
      }
    };
  });

  grunt.registerTask('stopMocking', function () {
    mock.restore();
    grunt.file.glob.sync = _fileGlobSync;
  });
  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'startMocking',
    'assets_versioning:date_several_sources',
    'assets_versioning:date_options_dateFormat',
    'assets_versioning:date_options_timezoneOffset',
    'stopMocking',
    'assets_versioning:images_with_hash',
    'assets_versioning:surrogate_compact_format',
    'assets_versioning:files_default_behaviour',
    'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
