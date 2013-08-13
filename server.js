/* jshint node: true */
'use strict';

/**
# rtc-helloworld
**/

var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var signaller = require('rtc-signaller-socket.io')(io);

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

// simple socket reflector implementation
io.sockets.on('connection', signaller);

// serve the rest statically
app.use(express.static(__dirname + '/site'));

// serve the signaller files front-end files
app.use(
  '/signaller',
  express.static(__dirname + '/node_modules/rtc-signaller/dist')
);

// start the server
server.listen(3000, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port 3000');
});
