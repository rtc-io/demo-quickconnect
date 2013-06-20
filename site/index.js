var	signaller = require('rtc/signaller'),
	channel = signaller({ channel: 'test', debug: true });

// set the transport as the socket.io signaller
channel.setTransport(require('rtc-signaller-ws')({ host: 'http://localhost:3000/' }));

// wait for ready event
channel.once('ready', function() {
    console.log('connected to ' + channel.name + ' with ' + channel.peers.length + ' other peers');
});

channel.on('peer:discover', function(peer) {
    var connection = channel.connect(peer);

    // add a stream to the connection
    connection.addStream(media.stream);
});
