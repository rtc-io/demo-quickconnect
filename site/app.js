(function() {
  var socket = io.connect('http://localhost:3000');
  var scope = rtc.signaller(socket, { dataEvent: 'message' });
  var peers = {};
  var localMedia;
  var videoElements = [];

  function createPeer(data) {
    var connection = rtc.createConnection();
    console.log('created peer for remote id: ' + data.id);

    // couple to the remote peer using the id over the signalling scope
    rtc.couple(connection, { id: data.id }, scope);

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

    connection.addEventListener('addstream', function(evt) {
      videoElements = videoElements.concat(rtc.media(evt.stream).render('.zone.remote'));
    });

    return connection;
  }
  
  /* media setup */

  localMedia = rtc.media();

  // render the local stream
  localMedia.render('.zone.local');

  /* peer connection setup */

  scope.on('request', function() {
    console.log(arguments);
  });

  // when another peer is discovered, try and communicate with it
  scope.on('announce', function(data) {
    if (! peers[data.id]) {
      peers[data.id] = createPeer(data);

      console.log('announcing self');
      scope.announce();
    }
  });

  // say hello
  scope.announce();
})();