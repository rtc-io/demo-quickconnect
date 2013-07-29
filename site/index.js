var	uuid = require('uuid');
var channelId = window.location.hash || uuid.v4();
var signaller = require('rtc/signaller').create({
  channel: channelId,
  host: 'http://signaller.rtc.io'
});
var media = require('rtc/media');
var localMedia = media();
var crel = require('crel');
var commandInput;
var messageList;

if (! window.location.hash) {
  window.location.hash = uuid.v4();
}

// render the local stream
localMedia.render('.zone.local');

signaller.on('peer:discover', function(id) {
  var connection = signaller.dial(id);
  var videoElements = [];


  console.log('discovered peer: ' + id);

  // if we already have a stream, then add the stream
  if (localMedia.stream) {
    console.log('local video stream active, adding to the connection');
    connection.addStream(localMedia.stream);
  }
  // otherwise, wait for the start and bind
  else {
    localMedia.once('start', function(stream) {
      console.log('local video has started streaming', stream);
      connection.addStream(stream);
    });
  }

  connection.on('stream:add', function(stream) {
    videoElements = videoElements.concat(media(stream).render('.zone.remote'));
    console.log(videoElements);
  });

  // when the connection is closed, remove the streams
  connection.on('close', function() {
    // remove the video elements
    videoElements.splice(0).forEach(function(el) {
      el.parentNode.removeChild(el);
    });

    // release the connection reference
    connection = null;
  });
});

signaller.on('message', function(data) {
  messageList.appendChild(crel('li', data));
});

window.addEventListener('load', function() {
  messageList = document.getElementById('messageList');
  commandInput = document.getElementById('commandInput');
  commandInput.addEventListener('keydown', handleCommand);
});

/* internals */

function handleCommand(evt) {
  if (evt && evt.keyCode === 13) {
    signaller.send(commandInput.value);
    messageList.appendChild(crel('li', { class: 'local' }, commandInput.value));
    commandInput.select();
  }
}
