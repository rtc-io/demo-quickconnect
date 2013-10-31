# rtc-helloworld

This is a starter project for working with [WebRTC](http://webrtc.org).

## Getting Started

First, clone this repository:

```
git clone https://github.com/rtc-io/rtc-helloworld.git
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

## The Code

### Server

```js
/* jshint node: true */
'use strict';

/**
  # rtc-helloworld

  This is a starter project for working with [WebRTC](http://webrtc.org).

  ## Getting Started

  First, clone this repository:

  ```
  git clone https://github.com/rtc-io/rtc-helloworld.git
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

  ## The Code

  ### Server

  <<< server.js

  ### Client

  <<< site/index.js

**/

var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var app = express();
var server = require('http').Server(app);
var browserify = require('browserify-middleware');

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


// serve the rest statically
app.use(browserify('./site'));
app.use(express.static(__dirname + '/site'));

// we need to expose the primus library
app.get('/rtc.io/primus.js', switchboard.library());

// start the server
server.listen(3000, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port 3000');
});

```

### Client

```js
var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var crel = require('crel');
var qsa = require('dd/qsa');
var channel;

// get the message list DOM element
var messages = qsa('#messageList')[0];
var chat = qsa('#commandInput')[0];

// capture local media
var localMedia = media();

require('cog/logger').enable('*');

// initialise a connection
quickconnect({ ns: 'helloworld', data: false, dtls: true })
  .on('peer', function(connection, id) {
    // add the local media to the peer
    if (localMedia.stream) {
      connection.addStream(localMedia.stream);
    }
    else {
      localMedia.once('capture', function(stream) {
        connection.addStream(stream);
      });
    }

    // when we can a remote stream, then add to our remote media
    connection.addEventListener('addstream', function(evt) {
      console.log('remote stream added');
      media(evt.stream).render(qsa('.zone.remote')[0]);
    });

    console.log('got a new friend: ' + id, connection);
  })
  .on('dc:open', function(dc, id) {
    dc.addEventListener('message', function(evt) {
      messages.appendChild(crel('li', evt.data));
    });

    // save the channel reference
    channel = dc;
    console.log('dc open for peer: ' + id);
  });

// handle chat messages being added
chat.addEventListener('keydown', function(evt) {
  if (evt.keyCode === 13) {
    messages.appendChild(crel('li', { class: 'local' }, chat.value));
    chat.select();
    if (channel) {
      channel.send(chat.value);
    }
  }
});

// render our local media to the target element
localMedia.render(qsa('.zone.local')[0]);
```

## License(s)

### Apache 2.0

Copyright 2013 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
