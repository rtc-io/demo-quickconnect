var rtc = require('rtc');
var socket = io.connect('https//rtcjs.io:50001');
var scope = rtc.signaller(socket, {
  dataEvent: 'message',
  openEvent: 'connect'
});

var peers = [];
var localMedia;
var debug = rtc.logger('helloworld');

rtc.logger.enable('*');

scope.on('open', function() {
  debug('scope open');
});

var dataChannel = null;
var messageList, commandInput;

// var currentRoom;
// if (currentRoom = location.hash.slice(1)) {
//   scope.send('/enter', currentRoom);
// }

// window.addEventListener('hashchange', function() {
//   var newRoom = location.hash.slice(1);

//   if (newRoom !== currentRoom) {
//     scope.send('/exit', currentRoom);
//     scope.send('/enter', currentRoom = newRoom);
//   }
// });

function createPeer(data) {
  /* add a data channel on the peer connection */
  var dcConstraints = {
    optional: [
      { RtpDataChannels: true }
    ]
  };
  var connection = rtc.createConnection({}, dcConstraints);
  var videoElements = [];
  debug('created peer for remote id: ' + data.id);

  // couple to the remote peer using the id over the signalling scope
  var coupling;

  coupling = rtc.couple(connection, { id: data.id }, scope);

  coupling.once('active', function() {
    debug('connection active');
    if (connection.localDescription.type == "offer") {
      createDataChannel();
    }
  });

  // if we already have a stream, then add the stream
  if (localMedia.stream) {
    debug('local video stream active, adding to the connection');
    connection.addStream(localMedia.stream);
  }
  // otherwise, wait for the start and bind
  else {
    localMedia.once('capture', function(stream) {
      debug('local video has started streaming');
      connection.addStream(stream);
    });
  }

  connection.addEventListener('addstream', function(evt) {
    debug('remote stream added');

    rtc.media(evt.stream).render('.zone.remote').forEach(function(el) {
      videoElements.push(el);
    });
  });

  connection.addEventListener('removestream', function(evt) {
    debug('!!!! remote stream removed');
  });

  function createDataChannel(evt) {
    if (!dataChannel) {
      console.log("creating data channel");
      dataChannel = connection.createDataChannel("chat");

      addDataChannelEvents();
    }
  }

  function addDataChannelEvents() {
      dataChannel.addEventListener('message', function (evt) {
        console.log("Received message");
        appendMsg(evt.data, 'remote');
      });

      dataChannel.addEventListener('open', function (evt) {
        console.log("Data channel open");
      });
  }


  connection.addEventListener('datachannel', function(evt) {
    if (!dataChannel) {
      console.log("creating data channel received");
      dataChannel = evt.channel;

      addDataChannelEvents();
    }
  });

  return {
    connection: connection,
    videoElements: videoElements
  };
}


/* media setup */

localMedia = rtc.media();

// render the local stream
localMedia.on('capture', function() {
  localMedia.render('.zone.local');
});

/* peer connection setup */

scope.on('request', function() {
  debug(arguments);
});

// when another peer is discovered, try and communicate with it
scope.on('announce', function(data) {
  if (! peers[data.id]) {
    peers[data.id] = createPeer(data);

    // tell our new friend about ourself
    console.log("peer discovered - sending announce");
    scope.to(data.id).announce();
  }
});

scope.on('leave', function(peerId) {
  if (peers[peerId]) {
    debug('I lost a good friend today');

    // remove the video elements
    peers[peerId].videoElements.splice(0).forEach(function(el) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    peers[peerId].connection.close();

    // reset the data connection
    if (dataChannel) {
      dataChannel.close();
      dataChannel = null;
    }

    // reset the peer reference
    peers[peerId] = null;

  }
});

// say hello
scope.announce();

window.addEventListener('load', function() {
    messageList = document.getElementById('messageList');
    commandInput = document.getElementById('commandInput');
    commandInput.addEventListener('keydown', handleCommand);
});

/* internals */

function appendMsg(msg, cls) {
  var msgEl = document.createElement('li');
  msgEl.className = cls;
  msgEl.innerHTML = msg;
  messageList.appendChild(msgEl);
}

function handleCommand(evt) {
    if (evt && evt.keyCode === 13) {
        dataChannel.send(commandInput.value);
        appendMsg(commandInput.value, 'local');
        commandInput.select();
    }
}
