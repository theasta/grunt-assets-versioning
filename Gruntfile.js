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
      options_tag_date: {
        options: {
          use           : 'date'
        },
        files: {
          'tmp/js/js_bundle_a.js': ['test/fake/file1.js', 'test/fake/file2.js'],
          'tmp/js/js_bundle_b.js': ['test/fake/file3.js', 'test/fake/file4.js']
        }
      },
      options_dateFormat: {
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
      options_timezoneOffset: {
        options: {
          use           : 'date',
          timezoneOffset: 7
        },
        files: {
          'tmp/js/js_bundle_a.js': ['test/fake/file1.js', 'test/fake/file2.js'],
          'tmp/js/js_bundle_b.js': ['test/fake/file3.js', 'test/fake/file4.js']
        }
      },
      options_hashLength: {
        options: {
          hashLength: 16
        },
        files: {
          'tmp/js/options_hashlength_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/options_hashlength_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },
      options_skipExisting_true: {
        options: {
          skipExisting: true
        },
        files: {
          'tmp/skip_existing_true.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js']
        }
      },
      options_skipExisting_false: {
        options: {
          skipExisting: false
        },
        files: {
          'tmp/skip_existing_false.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js']
        }
      },
      options_skipExisting_array: {
        options: {
          skipExisting: ['tmp/js/skip_existing_array_1.3d04f375.js']
        },
        files: {
          'tmp/js/skip_existing_array_1.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/skip_existing_array_2.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },
      options_multitask: {
        options: {
          multitask: 'concat'
        }
      },
      options_multitaskTarget: {
        options: {
          multitask: 'concat',
          multitaskTarget: 'options_multitaskTarget_subtask'
        }
      },
      options_versionsMapFile: {
        files: [{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/options_output/"
        }],
        options: {
          versionsMapFile     : 'tmp/options_output.json'
        }
      },
      options_output_trim_dir: {
        files: [{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/options_output_trim/"
        }],
        options: {
          versionsMapFile     : 'tmp/options_output_trim.json',
          versionsMapTrimPath : 'tmp/options_output_trim/'
        }
      },
      files_compact_format: {
        src: [
          'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js'
        ],
        dest: 'tmp/js/files_compact_format.js'
      },
      files_object_format: {
        files: {
          'tmp/js/files_object_format_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/files_object_format_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },
      files_array_format: {
        files: [
          {src: ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'], dest: 'tmp/js/files_array_format_a.js'},
          {src: ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js'], dest: 'tmp/js/files_array_format_b.js'}
        ]
      },
      files_expand_format: {
        files: [{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/files_expand_format/"
        }]
      },
      task_files_compact_format: {
        options: {
          tasks: ['concat:task_files_compact_format']
        }
      },
      task_files_object_format: {
        options: {
          tasks: ['concat:task_files_object_format']
        }
      },
      task_files_array_format: {
        options: {
          tasks: ['concat:task_files_array_format']
        }
      },
      task_files_expand_format: {
        options: {
          tasks: ['concat:task_files_expand_format']
        }
      },
      files_default_behaviour: {
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
          task: ['dontexist']
        }
      },

      fail_no_src: {
        files: {
          'tmp/js/whatever.js': ['test/fixtures/js/']
        }
      },

      fail_no_dest: {
        src: ['test/fixtures/js/file2.js']
      },

      fail_mix_files_task: {
        options: {
          tasks: ['concat:fail_mix_files_task']
        },
        files: {
          'tmp/fail_mix_files_task.js':  'test/fixtures/js/file3.js'
        }
      }

    },

    concat: {
      task_files_compact_format:{
        src: [
          'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js'
        ],
        dest: 'tmp/js/task_files_compact_format.js'
      },
      task_files_object_format: {
        files: {
          'tmp/js/task_files_object_format_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/task_files_object_format_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },
      task_files_array_format: {
        files: [
          {src: ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'], dest: 'tmp/js/task_files_array_format_a.js'},
          {src: ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js'], dest: 'tmp/js/task_files_array_format_b.js'}
        ]
      },
      task_files_expand_format: {
        files: [{
          expand : true,
          cwd    : "test/fixtures/images/",
          src    : ['**/*.png', '**/*.jpg', '**/*.gif'],
          dest   : "tmp/task_files_expand_format/"
        }]
      },
      fail_mix_files_task: {},
      options_multitask: {
        files: {
          'tmp/js/options_multitask_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/options_multitask_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
      },
      options_multitaskTarget_subtask: {
        files: {
          'tmp/js/options_multitaskTarget_subtask_a.js': ['test/fixtures/js/file1.js', 'test/fixtures/js/file2.js'],
          'tmp/js/options_multitaskTarget_subtask_b.js': ['test/fixtures/js/file3.js', 'test/fixtures/js/file4.js']
        }
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

  grunt.registerTask('prepareSkipExistingTest', function () {
    grunt.file.copy('test/expected/js/skip.js', 'tmp/skip_existing_true.3d04f375.js');
    grunt.file.copy('test/expected/js/skip.js', 'tmp/skip_existing_false.3d04f375.js');
    grunt.file.copy('test/expected/js/skip.js', 'tmp/js/skip_existing_array_1.3d04f375.js');
    grunt.file.copy('test/expected/js/skip.js', 'tmp/js/skip_existing_array_2.bfcf287e.js');
  });

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'startMocking',
    'assets_versioning:options_tag_date',
    'assets_versioning:options_dateFormat',
    'assets_versioning:options_timezoneOffset',
    'stopMocking',
    'assets_versioning:options_hashLength',
    'prepareSkipExistingTest',
    'assets_versioning:options_skipExisting_true',
    'assets_versioning:options_skipExisting_false',
    'assets_versioning:options_skipExisting_array',
    'assets_versioning:options_multitask',
    'assets_versioning:options_multitaskTarget',
    'assets_versioning:options_versionsMapFile',
    'assets_versioning:options_output_trim_dir',
    'assets_versioning:files_compact_format',
    'assets_versioning:files_object_format',
    'assets_versioning:files_array_format',
    'assets_versioning:files_expand_format',
    'assets_versioning:task_files_compact_format',
    'assets_versioning:task_files_object_format',
    'assets_versioning:task_files_array_format',
    'assets_versioning:task_files_expand_format',
    'assets_versioning:files_default_behaviour',
    'nodeunit']);

  grunt.registerTask('fail', [
    'assets_versioning:fail_no_src',
    'assets_versioning:fail_no_dest',
    'assets_versioning:fail_no_files',
    'assets_versioning:fail_no_valid_files',
    'assets_versioning:fail_mix_files_task',
    'assets_versioning:fail_no_valid_external_task'
  ]);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
