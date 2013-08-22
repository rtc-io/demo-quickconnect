(function() {
  var socket = io.connect('http://localhost:3000');
  var scope = rtc.signaller(socket, {
    dataEvent: 'message',
    openEvent: 'connect'
  });

  var peers = {};
  var localMedia;
  var debug = rtc.logger('helloworld');

  rtc.logger.enable('*');

  scope.on('open', function() {
    debug('scope open');
  });

  function createPeer(data) {
    var connection = rtc.createConnection();
    var videoElements = [];
    var coupling;

    debug('created peer for remote id: ' + data.id);

    // couple to the remote peer using the id over the signalling scope
    coupling = rtc.couple(connection, { id: data.id }, scope);
    coupling.once('active', function() {
      debug('connection active');
    });

    // if we already have a stream, then add the stream
    if (localMedia.stream) {
      debug('local video stream active, adding to the connection');
      connection.addStream(localMedia.stream);
    }
    // otherwise, wait for the start and bind
    else {
      localMedia.once('capture', function(stream) {
        debug('local video has started streaming', stream);
        connection.addStream(stream);
      });
    }

    connection.addEventListener('addstream', function(evt) {
      debug('remote stream added', evt.stream);

      rtc.media(evt.stream).render('.zone.remote').forEach(function(el) {
        videoElements.push(el);
      });
    });

    connection.addEventListener('removestream', function(evt) {
      debug('!!!! remote stream removed');
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

      debug('announcing self');
      scope.announce();
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

      // reset the peer reference
      peers[peerId] = null;
    }
  });

  // say hello
  scope.announce();
})();