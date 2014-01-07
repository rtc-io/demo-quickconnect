var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var crel = require('crel');
var qsa = require('fdom/qsa');

// local & remote video areas
var local = qsa('.zone.local')[0];
var remote = qsa('.zone.remote')[0];

// get the message list DOM element
var messages = qsa('#messageList')[0];
var chat = qsa('#commandInput')[0];

// data channel & peers
var channel;
var peers = {};
var peerVideos = {};

// initialise the quickconnect opts
var qcOpts = {
  data: true,
  ns: 'conftest',
  signalhost: 'http://rtc.io/switchboard/'
};

// debugging
// require('cog/logger').enable('rtc-quickconnect');

// capture local media
var localMedia = media();

// initialise a connection
function handleConnect(connection, id, data, monitor) {
  // save the peer
  peers[id] = connection;

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
    renderRemote(id)(evt.stream);
  });

  console.log('got a new friend: ' + id, connection);
}

// render a remote video
function renderRemote(id) {
  // create the peer videos list
  peerVideos[id] = peerVideos[id] || [];

  return function(stream) {
    peerVideos[id] = peerVideos[id].concat(media(stream).render(remote));
  }
}

function handleLeave(id) {
    // remove old streams
  (peerVideos[id] || []).forEach(function(el) {
    el.parentNode.removeChild(el);
  });
  peerVideos[id] = undefined;

  // close the peer connection
  peers[id].close();
  peers[id] = undefined;
}

// render our local media to the target element
localMedia.render(local);

// handle the connection stuff
quickconnect(qcOpts)
  .on('peer', handleConnect)
  .on('leave', handleLeave)
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

