'use strict';

var grunt = require('grunt');

exports.assets_versioning = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  options_tag_date: function(test) {
    test.expect(1);

    var configLog = grunt.config.get('assets_versioning.options_tag_date.revFiles');

    var expectedConfigLog =
      [
        { src: [ 'test/fake/file1.js', 'test/fake/file2.js' ],
          dest: 'tmp/js/js_bundle_a.20140925013734.js' },
        { src: [ 'test/fake/file3.js', 'test/fake/file4.js' ],
          dest: 'tmp/js/js_bundle_b.20140101080000.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');
    test.done();
  },

  options_timezoneOffset: function(test) {
    test.expect(1);

    var configLog = grunt.config.get('assets_versioning.options_timezoneOffset.revFiles');

    var expectedConfigLog =
      [
        { src: [ 'test/fake/file1.js', 'test/fake/file2.js' ],
          dest: 'tmp/js/js_bundle_a.20140924183734.js' },
        { src: [ 'test/fake/file3.js', 'test/fake/file4.js' ],
          dest: 'tmp/js/js_bundle_b.20140101010000.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'Should set a date version tag with a 7 hours offset');
    test.done();
  },

  // It should respect the dateFormat passed as an option
  options_dateFormat: function(test) {
    test.expect(1);

    var configLog = grunt.config.get('assets_versioning.options_dateFormat.revFiles');

    var expectedConfigLog =
      [
        { src: [ 'test/fake/file1.js', 'test/fake/file2.js' ],
          dest: 'tmp/js/js_bundle_a.140924183734.js' },
        { src: [ 'test/fake/file3.js', 'test/fake/file4.js' ],
          dest: 'tmp/js/js_bundle_b.140101010000.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'should respect the dateFormat passed as an option');
    test.done();
  },

  // hash length should be as specified by options.hashLength
  options_hashLength: function (test) {
    test.expect(2);

    test.ok(grunt.file.exists('tmp/js/options_hashlength_a.3d04f3759854724f.js'), 'should create a versioned file with a 16 character long hash');
    test.equal(grunt.file.read('tmp/js/options_hashlength_a.3d04f3759854724f.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));

    test.done();
  },

  // when skipExisting=true, don't run the task
  options_skipExisting_true: function (test) {
    test.expect(1);
    test.equal(grunt.file.read('tmp/skip_existing_true.3d04f375.js'), grunt.file.read('test/expected/js/skip.js'));
    test.done();
  },

  // when skipExisting=false, run the task anyway
  options_skipExisting_false: function (test) {
    test.expect(1);
    test.notEqual(grunt.file.read('tmp/skip_existing_false.3d04f375.js'), grunt.file.read('test/expected/js/skip.js'));
    test.done();
  },

  // when skipExisting=[], run the task if the file is not already part of that array
  options_skipExisting_array: function (test) {
    test.expect(4);

    // skip_existing_array_1 should have been skipped
    test.notEqual(grunt.file.read('tmp/js/skip_existing_array_1.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/skip_existing_array_1.3d04f375.js'), grunt.file.read('test/expected/js/skip.js'));

    // skip_
    test.notEqual(grunt.file.read('tmp/js/skip_existing_array_2.bfcf287e.js'), grunt.file.read('test/expected/js/skip.js'));
    test.equal(grunt.file.read('tmp/js/skip_existing_array_2.bfcf287e.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));
    test.done();
  },

  options_output: function (test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/options_output.json');
    var expected = grunt.file.read('test/expected/output/options_output.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');

    test.done();

  },

  options_output_trim_dir: function (test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/options_output_trim.json');
    var expected = grunt.file.read('test/expected/output/options_output_trim.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');

    test.done();

  },

  files_compact_format: function(test) {
    test.expect(3);

    var configLog = grunt.config.get('assets_versioning.files_compact_format.revFiles');

    var expectedConfigLog = [
      {
        src: [
          'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js'
        ],
        dest: 'tmp/js/files_compact_format.906eac86.js'
      }
    ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/js/files_compact_format.js'), 'should not create an un-versioned file');
    test.ok(grunt.file.exists('tmp/js/files_compact_format.906eac86.js'), 'should create a versioned file');

    test.done();
  },

  files_object_format: function(test) {
    test.expect(4);

    var configLog = grunt.config.get('assets_versioning.files_object_format.revFiles');

    test.ok(grunt.file.exists('tmp/js/files_object_format_a.3d04f375.js'), 'should create a versioned a bundle.');
    test.ok(grunt.file.exists('tmp/js/files_object_format_b.bfcf287e.js'), 'should create a versioned b bundle.');

    test.equal(grunt.file.read('tmp/js/files_object_format_a.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/files_object_format_b.bfcf287e.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  files_array_format: function(test) {
    test.expect(4);

    var configLog = grunt.config.get('assets_versioning.files_array_format.revFiles');

    test.ok(grunt.file.exists('tmp/js/files_object_format_a.3d04f375.js'), 'should create a versioned default_a bundle.');
    test.ok(grunt.file.exists('tmp/js/files_object_format_b.bfcf287e.js'), 'should create a versioned default_b bundle.');

    test.equal(grunt.file.read('tmp/js/files_object_format_a.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/files_object_format_b.bfcf287e.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  files_expand_format: function(test) {
    test.expect(9);

    var configLog = grunt.config.get('assets_versioning.files_expand_format.revFiles');

    var expectedConfigLog = [
        { src: ['test/fixtures/images/folder/subfolder/img3.png'], dest: 'tmp/files_expand_format/folder/subfolder/img3.f69ba99c.png' },
        { src: ['test/fixtures/images/img1.png'], dest: 'tmp/files_expand_format/img1.0aab5fd0.png' },
        { src: ['test/fixtures/images/img2.jpg'], dest: 'tmp/files_expand_format/img2.ec1bd0de.jpg' },
        { src: ['test/fixtures/images/folder/img2.gif'], dest: 'tmp/files_expand_format/folder/img2.05953adc.gif' }
    ];

    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/files_expand_format/folder/subfolder/img3.png'), 'should not create an un-versioned img3.png');
    test.ok(grunt.file.exists('tmp/files_expand_format/folder/subfolder/img3.f69ba99c.png'), 'should create a versioned img3.png');

    test.ok(!grunt.file.exists('tmp/files_expand_format/img1.png'), 'should not create an un-versioned img1.png');
    test.ok(grunt.file.exists('tmp/files_expand_format/img1.0aab5fd0.png'), 'should create a versioned img1.png');

    test.ok(!grunt.file.exists('tmp/files_expand_format/img2.jpg'), 'should not create an un-versioned img2.jpg');
    test.ok(grunt.file.exists('tmp/files_expand_format/img2.ec1bd0de.jpg'), 'should create a versioned img2.jpg');

    test.ok(!grunt.file.exists('tmp/files_expand_format/folder/img2.gif'), 'should not create an un-versioned img2.gif');
    test.ok(grunt.file.exists('tmp/files_expand_format/folder/img2.05953adc.gif'), 'should create a versioned img2.gif');


    test.done();
  },

  task_files_compact_format: function(test) {
    test.expect(3);

    var configLog = grunt.config.get('assets_versioning.task_files_compact_format.revFiles');

    var expectedConfigLog = [
      {
        src: [
          'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js'
        ],
        dest: 'tmp/js/task_files_compact_format.906eac86.js'
      }
    ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/js/task_files_compact_format.js'), 'should not create an un-versioned file');
    test.ok(grunt.file.exists('tmp/js/task_files_compact_format.906eac86.js'), 'should create a versioned file');

    test.done();
  },

  task_files_object_format: function(test) {
    test.expect(4);

    var configLog = grunt.config.get('assets_versioning.task_files_object_format.revFiles');

    test.ok(grunt.file.exists('tmp/js/task_files_object_format_a.3d04f375.js'), 'should create a versioned a bundle.');
    test.ok(grunt.file.exists('tmp/js/task_files_object_format_b.bfcf287e.js'), 'should create a versioned b bundle.');

    test.equal(grunt.file.read('tmp/js/task_files_object_format_a.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/task_files_object_format_b.bfcf287e.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  task_files_array_format: function(test) {
    test.expect(4);

    var configLog = grunt.config.get('assets_versioning.task_files_array_format.revFiles');

    test.ok(grunt.file.exists('tmp/js/task_files_array_format_a.3d04f375.js'), 'should create a versioned a bundle.');
    test.ok(grunt.file.exists('tmp/js/task_files_array_format_b.bfcf287e.js'), 'should create a versioned b bundle.');

    test.equal(grunt.file.read('tmp/js/task_files_array_format_a.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/task_files_array_format_b.bfcf287e.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  task_files_expand_format: function(test) {
    test.expect(9);

    var configLog = grunt.config.get('assets_versioning.task_files_expand_format.revFiles');

    var expectedConfigLog = [
      { src: ['test/fixtures/images/folder/subfolder/img3.png'], dest: 'tmp/task_files_expand_format/folder/subfolder/img3.f69ba99c.png' },
      { src: ['test/fixtures/images/img1.png'], dest: 'tmp/task_files_expand_format/img1.0aab5fd0.png' },
      { src: ['test/fixtures/images/img2.jpg'], dest: 'tmp/task_files_expand_format/img2.ec1bd0de.jpg' },
      { src: ['test/fixtures/images/folder/img2.gif'], dest: 'tmp/task_files_expand_format/folder/img2.05953adc.gif' }
    ];

    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/folder/subfolder/img3.png'), 'should not create an un-versioned img3.png');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/folder/subfolder/img3.f69ba99c.png'), 'should create a versioned img3.png');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/img1.png'), 'should not create an un-versioned img1.png');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/img1.0aab5fd0.png'), 'should create a versioned img1.png');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/img2.jpg'), 'should not create an un-versioned img2.jpg');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/img2.ec1bd0de.jpg'), 'should create a versioned img2.jpg');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/folder/img2.gif'), 'should not create an un-versioned img2.gif');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/folder/img2.05953adc.gif'), 'should create a versioned img2.gif');

    test.done();
  },

  files_default_behaviour: function (test) {
    test.expect(5);

    var configLog = grunt.config.get('assets_versioning.files_default_behaviour.revFiles');

    var expectedConfigLog = [
        { src: [ 'test/fixtures/js/file1.js', 'test/fixtures/js/file2.js' ],
          dest: 'tmp/js/default_a.3d04f375.js' },
        { src: [ 'test/fixtures/js/file3.js', 'test/fixtures/js/file4.js' ],
          dest: 'tmp/js/default_b.bfcf287e.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(grunt.file.exists('tmp/js/default_a.3d04f375.js'), 'should create a versioned default_a bundle.');
    test.ok(grunt.file.exists('tmp/js/default_b.bfcf287e.js'), 'should create a versioned default_b bundle.');

    test.equal(grunt.file.read('tmp/js/default_a.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/default_b.bfcf287e.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();

  },

  fails: function (test) {
    test.expect(3);

    test.throws(function () {
      grunt.run.task('assets_versioning:fail_no_valid_files');
    }, 'error', 'It should throw an error if no valid source files are passed.');

    test.throws(function () {
      grunt.run.task('assets_versioning:fail_no_valid_external_task');
    }, 'error', 'It should throw an error if it is pointing to a non-existent external task.');

    test.throws(function () {
      grunt.run.task('assets_versioning:fail_no_files');
    }, 'error', 'It should throw an error if no source files are defined');


    test.done();
  }
};
