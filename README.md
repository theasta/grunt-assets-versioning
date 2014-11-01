# grunt-assets-versioning [![Build Status](https://travis-ci.org/theasta/grunt-assets-versioning.svg?branch=master)](https://travis-ci.org/theasta/grunt-assets-versioning) [![NPM version](https://badge.fury.io/js/grunt-assets-versioning.svg)](http://badge.fury.io/js/grunt-assets-versioning)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/theasta/grunt-assets-versioning?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Versioning static assets with Grunt

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-assets-versioning --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-assets-versioning');
```

## The "assets_versioning" task

### Overview
In your project's Gruntfile, add a section named `assets_versioning` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  assets_versioning: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
        tasks: ['uglify:targetTask']
      }
    },
  },
})
```

This task will version the files output by the task uglify:targetTask.

### Options

#### options.use
Type: `String`
Possible values: `date`, `hash`
Default value: `hash`

Should the revision marker be a md5 hash or a date ?

#### options.hashLength
Type: `Integer`
Default value: `8`

If you choose to version your files using a hash, hashLength let you set how
long the hash is going to be.

#### options.dateFormat
Type: `String`
Default value: `YYYYMMDDHHmmss`

If you choose to version your files using a date, you can specify a
dateformat. grunt-assets-versioning is using moment.js to format date.

#### options.timezoneOffset
Type: `Number`
Default value: `0`

Only works if you choose to version your files using a date.
Timezone offset (in hours) to take into account when generating the date version tag. By default, set to 0 (GMT time).

#### options.tasks
Type: `String` or `Boolean`
Default value: `false`

The task you want to run while versioning the output.

#### options.skipExisting
Type: `Boolean` or `Array`
Default value: `false`

If true, will skip the task if the destination file already exists.
If type Array, will skip the task if the destination file, once versioned, is listed in the array.

### Usage Examples

#### Versioning using a hash
In this example, dest.bundle.js is going to be versioned with a hash. All sources files are going to be hashed and those hashes are also going to be hashed. The generated result should be
dest/bundle.2j4h2kds.js

```js
grunt.initConfig({
  assets_versioning: {
    options: {
      use: 'hash',
      hashLength: 6,
    },
    files: {
      'dest/bundle.js': ['src/file1.js', 'src/file2.js'],
    },
  },
})
```

#### Versioning using a date
In this example, dest.bundle.js is going to be versioned with a date, using
the default format YYYYMMDDHHmmss. The newest modification dates of all src files is
going to be used to create this timestamp. The generated result should be
dest/bundle.20130413004500.js

```js
grunt.initConfig({
  assets_versioning: {
    options: {
      use: 'date',
    },
    files: {
      'dest/bundle.js': ['src/file1.js', 'src/file2.js'],
    },
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* 2014-10-12   v0.5.0   Add an option tasks that will eventually replace options.multitask and options.multitaskTarget. Only accept a single task so far.
* 2014-10-11   v0.4.0   Skip task by providing an array of destination files to ignore.
* 2014-10-10   v0.3.1   Provide more feedback in debug mode. Improve unit tests coverage significantly.
* 2014-09-27   v0.3.0   Concatenate files if no surrogate task is passed. Changes in default options. Use hash instead of date. Skip versioning if destination file already exists.
* 2014-09-26   v0.2.0   Travis Integration, options.timezoneOffset (default: 0 - UTC Time)
* 2013-06-30   v0.1.5   Update JSHint Configuration and fix warnings
* 2013-06-30   v0.1.4   Make it work with the Compact format file mapping
* 2013-06-02   v0.1.3   Fix dateFormat bug
* 2013-06-02   v0.1.2   Minor bug fixes
* 2013-05-01   v0.1.1   Add Surrogate tasks and documentation
* 2013-04-26   v0.1.0   Initial commit
