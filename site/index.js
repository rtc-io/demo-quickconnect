var quickconnect = require('rtc-quickconnect');
var captureConfig = require('rtc-captureconfig');
var media = require('rtc-media');
var crel = require('crel');
var qsa = require('fdom/qsa');
var reRoomName = /^\/room\/(.*?)\/?$/;
var room = location.pathname.replace(reRoomName, '$1').replace('/', '');

// local & remote video areas
var local = qsa('.local')[0];
var remote = qsa('.remote')[0];

// get the message list DOM element
var messages = qsa('#messageList')[0];
var chat = qsa('#commandInput')[0];

// data channel & peers
var channel;
var peerMedia = {};

// use google's ice servers
var iceServers = [
  { url: 'stun:stun.l.google.com:19302' }
  // { url: 'turn:192.158.29.39:3478?transport=udp',
  //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //  username: '28224511:1379330808'
  // },
  // { url: 'turn:192.158.29.39:3478?transport=tcp',
  //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //   username: '28224511:1379330808'
  // }
];

// capture local media
var localMedia = media({
  constraints: captureConfig('camera min:1280x720').toConstraints()
});

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
    var activeStreams = Object.keys(peerMedia).filter(function(id) {
      return peerMedia[id];
    }).length;

    console.log('current active stream count = ' + activeStreams);
    if (activeStreams > 2) {
      remote = qsa('.zone.remote')[1];
    }
    peerMedia[id] = peerMedia[id].concat(media(stream).render(remote));
  }
}

function handleLeave(id) {
  var elements = peerMedia[id] || [];

  // remove old streams
  console.log('peer ' + id + ' left, removing ' + elements.length + ' elements');
  elements.forEach(function(el) {
    el.parentNode.removeChild(el);
  });
  peerMedia[id] = undefined;
}

// render our local media to the target element
localMedia.render(local);

// once the local media is captured broadcast the media
localMedia.once('capture', function(stream) {
  // handle the connection stuff
  quickconnect(location.href + '../../', {
    // debug: true,
    room: room,
    iceServers: iceServers
  })
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
