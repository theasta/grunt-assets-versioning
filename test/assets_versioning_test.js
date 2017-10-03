'use strict';

var grunt = require('grunt');

exports.assets_versioning = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  options_tag_date: function(test) {
    test.expect(1);

    var versionsMap = grunt.config.get('assets_versioning.options_tag_date.versionsMap');
    var expectedVersionsMap = [
      { version: '20140925013734', originalPath: 'tmp/js/js_bundle_a.js', versionedPath: 'tmp/js/js_bundle_a.20140925013734.js'},
      { version: '20140101080000', originalPath: 'tmp/js/js_bundle_b.js', versionedPath: 'tmp/js/js_bundle_b.20140101080000.js'}
    ];

    test.deepEqual(versionsMap, expectedVersionsMap, 'should create a map of versions with all versioned files');
    test.done();
  },

  options_tag_date_rename: function(test) {
    test.expect(1);

    var versionsMap = grunt.config.get('assets_versioning.options_tag_date_rename.versionsMap');
    var expectedVersionsMap = [
      { version: '20140925013734', originalPath: 'tmp/js/js_bundle_a.js', versionedPath: 'tmp/js/20140925013734.js'},
      { version: '20140101080000', originalPath: 'tmp/js/js_bundle_b.js', versionedPath: 'tmp/js/20140101080000.js'}
    ];

    test.deepEqual(versionsMap, expectedVersionsMap, 'should create a map of versions with all versioned files');
    test.done();
  },

  options_timezoneOffset: function(test) {
    test.expect(1);

    var versionsMap = grunt.config.get('assets_versioning.options_timezoneOffset.versionsMap');
    var expectedVersionsMap = [
      { version: '20140924183734', originalPath: 'tmp/js/js_bundle_a.js', versionedPath: 'tmp/js/js_bundle_a.20140924183734.js'},
      { version: '20140101010000', originalPath: 'tmp/js/js_bundle_b.js', versionedPath: 'tmp/js/js_bundle_b.20140101010000.js'}
    ];
    test.deepEqual(versionsMap, expectedVersionsMap, 'should create a map of versions with all versioned files');

    test.done();
  },

  // It should respect the dateFormat passed as an option
  options_dateFormat: function(test) {
    test.expect(1);

    var versionsMap = grunt.config.get('assets_versioning.options_dateFormat.versionsMap');
    var expectedVersionsMap = [
      { version: '140924183734', originalPath: 'tmp/js/js_bundle_a.js', versionedPath: 'tmp/js/js_bundle_a.140924183734.js'},
      { version: '140101010000', originalPath: 'tmp/js/js_bundle_b.js', versionedPath: 'tmp/js/js_bundle_b.140101010000.js'}
    ];
    test.deepEqual(versionsMap, expectedVersionsMap, 'should create a map of versions that respects the dateFormat passed as an option');

    test.done();
  },

  // hash length should be as specified by options.hashLength
  options_hashLength: function (test) {
    test.expect(2);

    test.ok(grunt.file.exists('tmp/js/options_hashlength_a.5042cab73cfe30e5.js'), 'should create a versioned file with a 16 character long hash');
    test.equal(grunt.file.read('tmp/js/options_hashlength_a.5042cab73cfe30e5.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));

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
    test.notEqual(grunt.file.read('tmp/skip_existing_false.5042cab7.js'), grunt.file.read('test/expected/js/skip.js'));
    test.done();
  },

  // when skipExisting=[], run the task if the file is not already part of that array
  options_skipExisting_array: function (test) {
    test.expect(4);

    // skip_existing_array_1 should have been skipped
    test.notEqual(grunt.file.read('tmp/js/skip_existing_array_1.3d04f375.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/skip_existing_array_1.3d04f375.js'), grunt.file.read('test/expected/js/skip.js'));

    // skip_
    test.notEqual(grunt.file.read('tmp/js/skip_existing_array_2.5c726b9a.js'), grunt.file.read('test/expected/js/skip.js'));
    test.equal(grunt.file.read('tmp/js/skip_existing_array_2.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));
    test.done();
  },

  options_post_external: function (test) {
    test.expect(5);

    test.ok(grunt.file.exists('tmp/js/options_post_a.ccc03b4c.js'), 'should create a versioned file with a different hash');
    test.equal(grunt.file.read('tmp/js/options_post_a.ccc03b4c.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/options_post_b.a7dd5963.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    var versionsMapAlt = grunt.config.get('assets_versioning.options_post_external_post_assets_versioning.versionsMap');
    test.equal(versionsMapAlt.length, 2, 'map of versions should contain 2 entities');

    var versionsMap = grunt.config.get('assets_versioning.options_post_external.versionsMap');
    test.equal(versionsMap.length, 2, 'map of versions should contain 2 entities');

    test.done();
  },

  options_post_internal: function (test) {
    test.expect(6);

    test.ok(grunt.file.exists('tmp/js/options_post_internal_a.efa0ffa4.js'), 'should create a versioned file with a different hash');
    test.equal(grunt.file.read('tmp/js/options_post_internal_a.efa0ffa4.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.ok(grunt.file.exists('tmp/js/options_post_internal_b.e4f3be42.js'), 'should create a second versioned file with a different hash');
    test.equal(grunt.file.read('tmp/js/options_post_internal_b.e4f3be42.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    var versionsMapAlt = grunt.config.get('assets_versioning.options_post_internal_post_assets_versioning.versionsMap');
    test.equal(versionsMapAlt.length, 2, 'map of versions should contain 2 entities');

    var versionsMap = grunt.config.get('assets_versioning.options_post_internal.versionsMap');
    test.equal(versionsMap.length, 2, 'map of versions should contain 2 entities');

    test.done();
  },

  options_versionsMapFile: function (test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/options_output.json');
    var expected = grunt.file.read('test/expected/output/options_output.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');

    test.done();
  },

  output_versionsMapTrimPath: function (test) {
    test.expect(1);

    var actual = grunt.file.readJSON('tmp/options_output_trim.json');
    var expected = grunt.file.readJSON('test/expected/output/options_output_trim.json');
    test.deepEqual(actual, expected, 'should create a json file with proper data');

    test.done();
  },

  options_versionsMapTemplateFail: function (test) {
      test.expect(1);

      var actual = grunt.util.normalizelf(grunt.file.read('tmp/options_versionsMapTemplateFail.php'));
      var expected = grunt.util.normalizelf(grunt.file.read('test/expected/output/options_output_trim.json'));
      test.equal(actual, expected, 'should create a file using the default JSON template and the versions map data');

      test.done();
  },

  options_versionsMapTemplateFile: function (test) {
      test.expect(1);

      var actual = grunt.util.normalizelf(grunt.file.read('tmp/options_versionsMapTemplateFile.php'));
      var expected = grunt.util.normalizelf(grunt.file.read('test/expected/output/dict.php'));
      test.equal(actual, expected, 'should create a file using a template from a file and the versions map data');

      test.done();
  },

  options_versionsMapTemplateString: function (test) {
      test.expect(1);

      var actual = grunt.util.normalizelf(grunt.file.read('tmp/options_versionsMapTemplateString.php'));
      var expected = grunt.util.normalizelf(grunt.file.read('test/expected/output/dict.php'));
      test.equal(actual, expected, 'should create a file using a template from the provided string and the versions map data');

      test.done();
  },

  options_versionsMapTemplateFunction: function (test) {
    test.expect(1);

    var actual = grunt.util.normalizelf(grunt.file.read('tmp/options_versionsMapTemplateFunction.php'));
    var expected = grunt.util.normalizelf(grunt.file.read('test/expected/output/dict.php'));
    test.equal(actual, expected, 'should create a file using a template returned by the function and the versions map data');

    test.done();
  },

  options_versionsMapDataFile: function (test) {
    test.expect(1);

    var actual = grunt.util.normalizelf(grunt.file.read('tmp/options_versionsMapDataFile.json'));
    var expected = grunt.util.normalizelf(grunt.file.read('test/expected/output/options_output_trim.json'));
    test.equal(actual, expected, 'should create a file data file representing the currently mapped files');

    test.done();
  },

  files_compact_format: function(test) {
    test.expect(2);

    test.ok(!grunt.file.exists('tmp/js/files_compact_format.js'), 'should not create an un-versioned file');
    test.ok(grunt.file.exists('tmp/js/files_compact_format.94184eb4.js'), 'should create a versioned file');

    test.done();
  },

  files_object_format: function(test) {
    test.expect(4);

    test.ok(grunt.file.exists('tmp/js/files_object_format_a.5042cab7.js'), 'should create a versioned a bundle.');
    test.ok(grunt.file.exists('tmp/js/files_object_format_b.5c726b9a.js'), 'should create a versioned b bundle.');

    test.equal(grunt.file.read('tmp/js/files_object_format_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/files_object_format_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  files_array_format: function(test) {
    test.expect(4);

    test.ok(grunt.file.exists('tmp/js/files_object_format_a.5042cab7.js'), 'should create a versioned default_a bundle.');
    test.ok(grunt.file.exists('tmp/js/files_object_format_b.5c726b9a.js'), 'should create a versioned default_b bundle.');

    test.equal(grunt.file.read('tmp/js/files_object_format_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/files_object_format_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  files_expand_format: function(test) {
    test.expect(9);

    var versionsMap = grunt.config.get('assets_versioning.files_expand_format.versionsMap');
    test.equal(versionsMap.length, 4, 'map of versions should contain 4 entities');

    test.ok(!grunt.file.exists('tmp/files_expand_format/folder/subfolder/img3.png'), 'should not create an un-versioned img3.png');
    test.ok(grunt.file.exists('tmp/files_expand_format/folder/subfolder/img3.d8deeedb.png'), 'should create a versioned img3.png');

    test.ok(!grunt.file.exists('tmp/files_expand_format/img1.png'), 'should not create an un-versioned img1.png');
    test.ok(grunt.file.exists('tmp/files_expand_format/img1.64317d28.png'), 'should create a versioned img1.png');

    test.ok(!grunt.file.exists('tmp/files_expand_format/img2.jpg'), 'should not create an un-versioned img2.jpg');
    test.ok(grunt.file.exists('tmp/files_expand_format/img2.08abdf2a.jpg'), 'should create a versioned img2.jpg');

    test.ok(!grunt.file.exists('tmp/files_expand_format/folder/img2.gif'), 'should not create an un-versioned img2.gif');
    test.ok(grunt.file.exists('tmp/files_expand_format/folder/img2.77e84a5f.gif'), 'should create a versioned img2.gif');

    test.done();
  },

  files_expand_format_directory: function(test) {
    test.expect(1);

    var versionsMap = grunt.config.get('assets_versioning.files_expand_format_directory.versionsMap');
    test.equal(versionsMap.length, 5, 'map of versions should contain 5 entities');

    test.done();
  },

  task_files_compact_format: function(test) {
    test.expect(3);

    var versionsMap = grunt.config.get('assets_versioning.task_files_compact_format.versionsMap');
    var expectedVersionsMap = [
      {
        version: '94184eb4', versionedPath: 'tmp/js/task_files_compact_format.94184eb4.js', originalPath: 'tmp/js/task_files_compact_format.js'
      }
    ];
    test.deepEqual(versionsMap, expectedVersionsMap, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/js/task_files_compact_format.js'), 'should not create an un-versioned file');
    test.ok(grunt.file.exists('tmp/js/task_files_compact_format.94184eb4.js'), 'should create a versioned file');

    test.done();
  },

  task_files_object_format: function(test) {
    test.expect(4);

    test.ok(grunt.file.exists('tmp/js/task_files_object_format_a.5042cab7.js'), 'should create a versioned a bundle.');
    test.ok(grunt.file.exists('tmp/js/task_files_object_format_b.5c726b9a.js'), 'should create a versioned b bundle.');

    test.equal(grunt.file.read('tmp/js/task_files_object_format_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/task_files_object_format_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  task_files_array_format: function(test) {
    test.expect(4);

    test.ok(grunt.file.exists('tmp/js/task_files_array_format_a.5042cab7.js'), 'should create a versioned a bundle.');
    test.ok(grunt.file.exists('tmp/js/task_files_array_format_b.5c726b9a.js'), 'should create a versioned b bundle.');

    test.equal(grunt.file.read('tmp/js/task_files_array_format_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/task_files_array_format_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  task_files_expand_format: function(test) {
    test.expect(9);

    var versionsMap = grunt.config.get('assets_versioning.task_files_expand_format.versionsMap');
    test.equal(versionsMap.length, 4, 'map of versions should contain 4 entities');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/folder/subfolder/img3.png'), 'should not create an un-versioned img3.png');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/folder/subfolder/img3.d8deeedb.png'), 'should create a versioned img3.png');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/img1.png'), 'should not create an un-versioned img1.png');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/img1.64317d28.png'), 'should create a versioned img1.png');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/img2.jpg'), 'should not create an un-versioned img2.jpg');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/img2.08abdf2a.jpg'), 'should create a versioned img2.jpg');

    test.ok(!grunt.file.exists('tmp/task_files_expand_format/folder/img2.gif'), 'should not create an un-versioned img2.gif');
    test.ok(grunt.file.exists('tmp/task_files_expand_format/folder/img2.77e84a5f.gif'), 'should create a versioned img2.gif');

    test.done();
  },

  multiple_tasks: function (test) {
    test.expect(6);
    var versionsMap = grunt.config.get('assets_versioning.multiple_tasks.versionsMap');

    test.equal(versionsMap.length, 5, 'should accumulate all the files created by all the tasks');

    test.equal(grunt.file.read('tmp/js/multiple_task_2.94184eb4.js'), grunt.file.read('test/expected/js/concat_file1_file2_file3.js'));
    test.equal(grunt.file.read('tmp/js/multiple_task_1_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/multiple_task_1_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));
    test.equal(grunt.file.read('tmp/js/multiple_task_3_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/multiple_task_3_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

    test.done();
  },

  files_default_behaviour: function (test) {
    test.expect(5);

    var versionsMap = grunt.config.get('assets_versioning.files_default_behaviour.versionsMap');

    var expectedVersionsMap = [
      { version: '5042cab7',
        versionedPath: 'tmp/js/default_a.5042cab7.js',
        originalPath: 'tmp/js/default_a.js'
      },
      {
        version: '5c726b9a',
        versionedPath: 'tmp/js/default_b.5c726b9a.js',
        originalPath: 'tmp/js/default_b.js'
      }
    ];
    test.deepEqual(versionsMap, expectedVersionsMap, 'should set a config object listing all files');

    test.ok(grunt.file.exists('tmp/js/default_a.5042cab7.js'), 'should create a versioned default_a bundle.');
    test.ok(grunt.file.exists('tmp/js/default_b.5c726b9a.js'), 'should create a versioned default_b bundle.');

    test.equal(grunt.file.read('tmp/js/default_a.5042cab7.js'), grunt.file.read('test/expected/js/concat_file1_file2.js'));
    test.equal(grunt.file.read('tmp/js/default_b.5c726b9a.js'), grunt.file.read('test/expected/js/concat_file3_file4.js'));

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
