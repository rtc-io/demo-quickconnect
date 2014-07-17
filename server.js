/* jshint node: true */
'use strict';

/**
  # rtcio-demo-quickconnect

  This is a starter project for working with [WebRTC](http://webrtc.org).
  This demo showcases how to use the following packages to build a
  fully functional WebRTC application:

  - [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect)

    The `rtc-quickconnect` package provides operations that make it simpler
    to work with WebRTC peer connections.

  - [rtc-media](https://github.com/rtc-io/rtc-media)

    Media capture and rendering.

  - [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard)

    A websocket powered signaling server that is used to help setup
    peer connections between two clients.

  ## Getting Started

  First, clone this repository:

  ```
  git clone https://github.com/rtc-io/rtcio-demo-quickconnect.git
  ```

  Next, install node dependencies:

  ```
  cd rtcio-demo-quickconnect
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

var fs = require('fs');
var path = require('path');
var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var app = express();
var server = require('http').Server(app);
var browserify = require('browserify-middleware');
var serverPort = parseInt(process.env.PORT, 10) || 3000;

// create the switchboard
var switchboard = require('rtc-switchboard')(server);

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


app.get('/', function(req, res) {
  res.redirect(req.uri.pathname + 'room/main/');
});

browserify.settings.development('debug', true);

// force development mode for browserify given this is a demo
browserify.settings('mode', 'development');

// serve the rest statically
app.use(browserify('./site'));
app.use(express.static(__dirname + '/site'));

// we need to expose the primus library
app.get('/rtc.io/primus.js', switchboard.library());
app.get('/room/:roomname', function(req, res, next) {
  res.writeHead(200);
  fs.createReadStream(path.resolve(__dirname, 'site', 'index.html')).pipe(res);
});

// start the server
server.listen(serverPort, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('running @ http://localhost:' + serverPort + '/');
});
