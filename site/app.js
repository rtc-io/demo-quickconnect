(function() {
  var socket = io.connect('http://localhost:3000');
  var scope = signaller(socket, { dataEvent: 'message' });

  scope.on('sdp', function(data) {
    console.log(data);
  });

  // when another peer is discovered, try and communicate with it
  scope.on('announce', function(data) {
    // create a new connection

    // request a connection
    scope.request(data, function(err, channel) {
      if (err) {
        return;
      }

      console.log('got a connection');
      channel.send('/sdp', 'blah');
    });

    console.log('got announce: ', data);
  });

  // say hello
  scope.announce();
})();