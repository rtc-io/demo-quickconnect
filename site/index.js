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
quickconnect({ ns: 'helloworld', data: true, dtls: true })
  .on('peer', function(connection, id, data, monitor) {
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