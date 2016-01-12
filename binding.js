'use strict';

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var request = require('request');
var tar = require('tar');

var tmp = require('os').tmpdir();

var distBaseUrl = 'https://dl.bintray.com/lovell/sharp/';

var vipsHeaderPath = path.join(__dirname, 'include', 'vips', 'vips.h');

// Does this file exist?
var isFile = function(file) {
  var exists = false;
  try {
    exists = fs.statSync(file).isFile();
  } catch (err) {}
  return exists;
};

var unpack = function(tarPath, done) {
  var extractor = tar.Extract({
    path: __dirname
  });
  extractor.on('error', error);
  extractor.on('end', function() {
    if (!isFile(vipsHeaderPath)) {
      error('Could not unpack ' + tarPath);
    }
    if (typeof done === 'function') {
      done();
    }
  });
  fs.createReadStream(tarPath).on('error', error)
    .pipe(zlib.Unzip())
    .pipe(extractor);
};

// Error
var error = function(msg) {
  if (msg instanceof Error) {
    msg = msg.message;
  }
  process.stderr.write('ERROR: ' + msg + '\n');
  process.exit(1);
};

module.exports.download_vips = function() {
  if (!isFile(vipsHeaderPath)) {
    if (process.platform !== 'win32') {
      error('This only works on Windows');
    }
    var tarFilename = 'libvips-' + process.env.npm_package_config_libvips + '-win.tar.gz';
    var tarPath = path.join(__dirname, 'packaging', tarFilename);
    if (isFile(tarPath)) {
      unpack(tarPath);
    } else {
      // Download to per-process temporary file
      tarPath = path.join(tmp, process.pid + '-' + tarFilename);
      var tmpFile = fs.createWriteStream(tarPath).on('finish', function() {
        unpack(tarPath, function() {
          // Attempt to remove temporary file
          try {
            fs.unlinkSync(tarPath);
          } catch (err) {}
        });
      });
      request(distBaseUrl + tarFilename).on('response', function(response) {
        if (response.statusCode !== 200) {
          error(distBaseUrl + tarFilename + ' status code ' + response.statusCode);
        }
      }).on('error', function(err) {
        error('Download from ' + distBaseUrl + tarFilename + ' failed: ' + err.message);
      }).pipe(tmpFile);
    }
  }
};
