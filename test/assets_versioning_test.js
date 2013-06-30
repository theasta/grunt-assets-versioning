'use strict';

var grunt = require('grunt');

exports.assets_versioning = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  bundles_with_date: function(test) {
    test.expect(4);

    var configLog = grunt.config.get('assets_versioning.bundles_with_date.revFiles');

    var expectedConfigLog =
      [ { src:
        [ 'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js' ],
          dest: 'tmp/js/js_bundle_a.130421054405.js' },
          { src:
            [ 'test/fixtures/js/file3.js',
              'test/fixtures/js/file4.js' ],
              dest: 'tmp/js/js_bundle_b.130421054425.js' }
    ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(grunt.file.exists('tmp/js/js_bundle_a.130421054405.js'), 'should create a versioned file - part 1');
    test.ok(grunt.file.exists('tmp/js/js_bundle_b.130421054425.js'), 'should create a versioned file - part 2');

    var actual = grunt.file.read('tmp/bundles_with_date.json');
    var expected = grunt.file.read('test/expected/output/bundles_with_date.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');


    test.done();
  },
  images_with_date: function(test) {
    test.expect(2);

    var configLog = grunt.config.get('assets_versioning.images_with_date.revFiles');

    var expectedConfigLog = [
        { src: ['test/fixtures/images/folder/subfolder/img3.png'], dest: 'tmp/images_with_date/folder/subfolder/img3.20100926040404.png' },
        { src: ['test/fixtures/images/img1.png'], dest: 'tmp/images_with_date/img1.20120627165521.png' },
        { src: ['test/fixtures/images/img2.jpg'], dest: 'tmp/images_with_date/img2.20110502130421.jpg' },
        { src: ['test/fixtures/images/folder/img2.gif'], dest: 'tmp/images_with_date/folder/img2.20130413000015.gif' }
    ];

    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    var actual = grunt.file.read('tmp/images_with_date.json');
    var expected = grunt.file.read('test/expected/output/images_with_date.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');

    test.done();
  },
  images_with_start_date: function(test) {
    test.expect(2);

    var configLog = grunt.config.get('assets_versioning.images_with_start_date.revFiles');

    var expectedConfigLog = [
        { src: ['test/fixtures/images/folder/img2.gif'], dest: 'tmp/images_with_start_date/folder/img2.20130413000015.gif' }
    ];

    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    var actual = grunt.file.read('tmp/images_with_startdate.json');
    var expected = grunt.file.read('test/expected/output/images_with_startdate.json');
    test.deepEqual(JSON.parse(actual), JSON.parse(expected), 'should create a json file with proper data');

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

    var expectedConfigLog =
      [ { src:
        [ 'test/fixtures/js/file1.js',
          'test/fixtures/js/file2.js',
          'test/fixtures/js/file3.js' ],
        dest: 'tmp/js/compact_format.906eac.js' }
      ];
    test.deepEqual(configLog, expectedConfigLog, 'should set a config object listing all files');

    test.ok(!grunt.file.exists('tmp/js/compact_format.js'), 'should not create an unversioned file');
    test.ok(grunt.file.exists('tmp/js/compact_format.906eac.js'), 'should create a versioned file');

    test.done();
  },
};
