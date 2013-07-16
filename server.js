/* jshint node: true */

'use strict';

/**
# rtc-helloworld
**/

var browserify = require('browserify-middleware');
var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'rtc-helloworld' });
var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var app = express();
var server = require('http').Server(app);
var signaller = require('rtc-signaller-ws/server')(server);
var ChannelManager = require('rtc-channelmanager');

// attach the signaller to the express application
signaller.channelManager = new ChannelManager();

// browserify valid things
app.use(browserify(__dirname + '/site'));

// convert stylus stylesheets
app.use(stylus.middleware({
  src: __dirname + '/site',
  compile: function(str, sourcePath) {
    return stylus(str)
      .set('filename', sourcePath)
      .set('compress', false)
      .use(nib());
  }
}));

// serve the rest statically
app.use(express.static(__dirname + '/site'));

// start the server
server.listen(3000, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port 3000');
});
