/* jshint node: true */
'use strict';

/**
  # rtc-helloworld

  This is a starter project for working with [WebRTC](http://webrtc.org).

  ## Getting Started

  First, clone this repository:

  ```
  git clone git://github.it.nicta.com.au/Telepresence/rtc-helloworld.git
  ```

  Next, install node dependencies:

  ```
  cd rtc-helloworld
  npm install
  ```

  Once the dependencies have been installed, you should then be able to run
  the demonstration server:

  ```
  npm start
  ```

  If everything has worked correctly, you should now be able to open your
  browser to the following url:

  <http://localhost:3000/>

  You can test that you have WebRTC peer connections operating correctly by
  opening two browser windows to the same url; or, you can find someone else
  that has access to your machine and point them to: <http://your.ip:3000/>.
  All being well you should be able to communicate with that person using
  WebRTC!
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
  '/rtc',
  express.static(__dirname + '/node_modules/rtc/dist')
);

// start the server
server.listen(3000, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port 3000');
});
