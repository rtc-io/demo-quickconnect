var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var crel = require('crel');
var qsa = require('fdom/qsa');
var reRoomName = /^\/room\/(.*?)\/?$/;
var room = location.pathname.replace(reRoomName, '$1').replace('/', '');

// local & remote video areas
var local = qsa('.local')[0];
var remote = qsa('.zone.remote')[0];

// get the message list DOM element
var messages = qsa('#messageList')[0];
var chat = qsa('#commandInput')[0];

// data channel & peers
var channel;
var peerMedia = {};

// console.log(room);

// debugging
// require('cog/logger').enable('rtc-quickconnect');

// capture local media
var localMedia = media();

// initialise a connection
function handleConnect(pc, id, data, monitor) {
  pc.getRemoteStreams().forEach(renderRemote(id));
  console.log('got a new friend: ' + id, pc);
}

// render a remote video
function renderRemote(id) {
  // create the peer videos list
  peerMedia[id] = peerMedia[id] || [];

  return function(stream) {
    console.log("number of streams:");
    console.log(Object.keys(peerMedia).length);
    if (Object.keys(peerMedia).length > 2) {
      remote = qsa('.zone.remote')[1];
    }
    peerMedia[id] = peerMedia[id].concat(media(stream).render(remote));
  }
}

function handleLeave(id) {
    // remove old streams
  (peerMedia[id] || []).forEach(function(el) {
    el.parentNode.removeChild(el);
  });
  peerMedia[id] = undefined;
}

// render our local media to the target element
localMedia.render(local);

// once the local media is captured broadcast the media
localMedia.once('capture', function(stream) {
  // handle the connection stuff
  quickconnect(location.href + '../../', { room: room })
    .broadcast(stream)
    .createDataChannel('chat')
    .on('peer:connect', handleConnect)
    .on('peer:leave', handleLeave)
    .on('chat:open', function(dc, id) {
      dc.onmessage = function(evt) {
        if (messages) {
          messages.appendChild(crel('li', evt.data));
        }
      };

      // save the channel reference
      channel = dc;
      console.log('dc open for peer: ' + id);
    });
});

// handle chat messages being added
if (chat) {
  chat.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 13) {
      messages.appendChild(crel('li', { class: 'local' }, chat.value));
      chat.select();
      if (channel) {
        channel.send(chat.value);
      }
    }
  });
}
