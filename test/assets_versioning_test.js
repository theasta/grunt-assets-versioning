'use strict';

var grunt = require('grunt');

exports.assets_versioning = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  date_several_sources: function(test) {
    test.expect(1);

    var configLog = grunt.config.get('assets_versioning.date_several_sources.revFiles');

    var expectedConfigLog =
      [
        { src: [ 'test/fake/file1.js', 'test/fake/file2.js' ],
          dest: 'tmp/js/js_bundle_a.140925013734.js' },
        { src: [ 'test/fake/file3.js', 'test/fake/file4.js' ],
          dest: 'tmp/js/js_bundle_b.140101080000.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');
    test.done();
  },

  // It should exclude files that were created before the startDate options
  date_options_startdate: function(test) {
    test.expect(1);

    var configLog = grunt.config.get('assets_versioning.date_options_startdate.revFiles');

    var expectedConfigLog =
      [
        { src: [ 'test/fake/file1.js', 'test/fake/file2.js' ],
          dest: 'tmp/js/js_bundle_a.140925013734.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');
    test.done();
  },

  images_with_hash: function(test) {
    test.expect(2);

    var configLog = grunt.config.get('assets_versioning.images_with_hash.revFiles');

    var expectedConfigLog = [
        { src: ['test/fixtures/images/folder/subfolder/img3.png'], dest: 'tmp/images_with_hash/folder/subfolder/img3.f69ba99cdb.png' },
        { src: ['test/fixtures/images/img1.png'], dest: 'tmp/images_with_hash/img1.0aab5fd0e5.png' },
        { src: ['test/fixtures/images/img2.jpg'], dest: 'tmp/images_with_hash/img2.ec1bd0dedd.jpg' },
        { src: ['test/fixtures/images/folder/img2.gif'], dest: 'tmp/images_with_hash/folder/img2.05953adc52.gif' }
    ];

    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    var actual = grunt.file.read('tmp/images_with_hash.json');
    var expected = grunt.file.read('test/expected/output/images_with_hash.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');

    test.done();
  },

  files_compact_format: function(test) {
    test.expect(3);

    var configLog = grunt.config.get('assets_versioning.files_compact_format.revFiles');

    var expectedConfigLog = [
      {
        src: [ 'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js' ],
        dest: 'tmp/js/compact_format.906eac.js'
      }
    ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/js/compact_format.js'), 'should not create an un-versioned file');
    test.ok(grunt.file.exists('tmp/js/compact_format.906eac.js'), 'should create a versioned file');

    test.done();
  }
};
