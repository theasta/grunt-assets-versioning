# grunt-assets-versioning
[![Build Status](https://travis-ci.org/theasta/grunt-assets-versioning.svg?branch=master)](https://travis-ci.org/theasta/grunt-assets-versioning) [![GitHub version](https://badge.fury.io/gh/theasta%2Fgrunt-assets-versioning.svg)](https://badge.fury.io/gh/theasta%2Fgrunt-assets-versioning) [![NPM version](https://badge.fury.io/js/grunt-assets-versioning.svg)](http://badge.fury.io/js/grunt-assets-versioning) [![dependencies](https://david-dm.org/theasta/grunt-assets-versioning.svg)](https://david-dm.org/theasta/grunt-assets-versioning) [![devDependencies](https://david-dm.org/theasta/grunt-assets-versioning/dev-status.svg)](https://david-dm.org/theasta/grunt-assets-versioning?type=dev) [![peerDependencies](https://david-dm.org/theasta/grunt-assets-versioning/peer-status.svg)](https://david-dm.org/theasta/grunt-assets-versioning?type=peer) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/theasta/grunt-assets-versioning?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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

#### options.tag
Type: `String`
Possible values: `date`, `hash`
Default value: `hash`

Should the revision marker be a md5 hash or a date ?

#### options.hashLength
Type: `Integer`
Default value: `8`

If you choose to version your files using a hash, hashLength let you set how long the hash is going to be.

#### options.renameToVersion
Type: `Boolean`
Default value: `false`

Should the hash replace the file name before the final extension, or (default) should it be just be appended before the final extension? 

#### options.dateFormat
Type: `String`
Default value: `YYYYMMDDHHmmss`

If you choose to version your files using a date, you can specify a dateformat. grunt-assets-versioning is using moment.js to format date.

#### options.timezoneOffset
Type: `Number`
Default value: `0`

Only works if you choose to version your files using a date.
Timezone offset (in hours) to take into account when generating the date version tag. By default, set to 0 (GMT time).

#### options.tasks
Type: `Array` or `Boolean`
Default value: `false`

The tasks you want to run while versioning their destination files.

#### options.versionsMapFile
Type: `String`
Path to the file in which the versions map will be dumped.

The assets versioning files outputs a map of versions of all the files processed. Here's how that map looks like:
```
[
  {
    version: '3d04f375',
    originalPath: 'path/to/bundle-a.js',
    versionedPath: 'path/to/bundle-a.3d04f375.js'
  },
  {
    version: '92jdi2j1',
    originalPath: 'path/to/bundle-b.js',
    versionedPath: 'path/to/bundle-b.92jdi2j1.js'
  }
]
```

By default you can retrieve the map of versions by accessing this configuration variable.
`grunt.config('assets_versioning.yourTask.versionsMap')`
The versionsMapFile gives you the possibility to also output that map to a file.

#### options.versionsMapTemplate
Type: `String` or `Function: String`
Default value: `null`

Path to a lodash template file or URL-encoded string, optionally returned by a function, that is going to be used to generate the versions map file (options.versionsMapFile).

By default, when no valid template is indicated, the task will output a json file.

The lo-dash template may reuse the keys from the version maps (version, originalPath, versionedPath).
Here's an example of a lo-dash template to generate a php dictionary.

```
<?php

class MyDict
{
  public static $myDict = array(
<% _.forEach(files, function(file) { %>
    "<%= file.originalPath %>" => "<%= file.versionedPath %>",
<% }); %>
  );
```

#### options.versionsMapDataFile
Type: `String`

Specifying a file here will store the internal version data in this file for use on subsequent runs.

#### options.versionsMapFilesAutoDelete
Type: `Boolean`
Default value: `false`

When generating a new hashed file, delete the old one.

_NOTE: This depends on `options.versionsMapDataFile` being set._

#### options.versionsMapTrimPath
Type: `String`
This gives you the possibility to trim the path output in the version map.

For example, if you set options.versionsMapTrimPath to be 'super/long/path/to/', instead of getting this map:

```js
[
  {
    version: '3d04f375',
    originalPath: 'super/long/path/to/bundle-a.js',
    versionedPath: 'super/long/path/to/bundle_a.3d04f375.js'
  },
  {
    version: '92jdi2j1',
    originalPath: 'super/long/path/to/bundle-b.js',
    versionedPath: 'super/long/path/to/bundle-b.92jdi2j1.js'
  }
]
```

you will get this one:


```js
[
  {
    version: '3d04f375',
    originalPath: 'bundle-a.js',
    versionedPath: 'bundle_a.3d04f375.js'
  },
  {
    version: '92jdi2j1',
    originalPath: 'bundle-b.js',
    versionedPath: 'bundle-b.92jdi2j1.js'
  }
]
```

#### options.skipExisting
Type: `Boolean` or `Array`
Default value: `false`

If true, will skip the task if the destination file already exists.
If type Array, will skip the task if the destination file, once versioned, is listed in the array.

#### options.post
Type: `Boolean`
Default value: `false`

By default, the grunt-assets-versioning task uses the content of the source files to create a version hash.
Combined with the skipExisting option, it allows to speed up the deployment process by skipping tasks that would output an already-existing destination file.

If ever you're trying to version a task that doesn't expose all its source files but only an entry point (less, requirejs), you should set the post options to true.

```js
less: {
  production: {
    files: {
      "path/to/result.css": "path/to/source.less"
    }
  }
},
assets_versioning: {
  css: {
    options: {
      post: true,
      tasks: ["less:production"]
    }
  }
}
```

### Usage Examples

#### Versioning using a hash
In this example, dest.bundle.js is going to be versioned with a hash. All sources files are going to be hashed and those hashes are also going to be hashed. The generated result should be
dest/bundle.2j4h2kds.js

```js
grunt.initConfig({
  assets_versioning: {
    options: {
      tag: 'hash',
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
      tag: 'date',
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

* 2017-09-07   v1.1.0   Add support for templates from strings, persisting version data between runs, deleting old hashed files, and renaming target files instead of append hash. Also include file name in hash.
* 2015-01-29   v1.0.4   Fix MomentJS warning
* 2015-01-28   v1.0.3   Bug fixing.
* 2014-11-22   v1.0.2   Add a post mode which generates the version hash based on the destination files and not the source files.
* 2014-11-02   v1.0.1   Add the ability to generate a version map based on a lo-dash template
* 2014-11-02   v1.0.0   options.tasks accepts multiple.tasks. options.use replaced by options.tag
* 2014-11-01   v0.6.0   Major refactoring. skipVersioning false by default. options.versionsMapFile replaces options.output
* 2014-10-12   v0.5.0   Add tasks option that will eventually replace options.multitask and options.multitaskTarget. Only accept a single task so far.
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
