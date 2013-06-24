var	signaller = require('rtc/signaller'),
    PeerConnection = require('rtc/peerconnection'),
	channel = signaller({ channel: 'test', debug: true });

// set the transport as the socket.io signaller
channel.setTransport(require('rtc-signaller-ws')({ host: 'http://localhost:3000/' }));

// wait for ready event
channel.once('ready', function() {
    console.log('connected to ' + channel.name + ' with ' + channel.peers.length + ' other peers');
});

channel.on('peer:discover', function(peer) {
    var connection = new PeerConnection();

    connection.setChannel(channel);
    connection.initiate(peer.id, function(err) {
        if (! err) {
            console.log('connection initiated, tunnel id: ' + connection.tunnelId);
        }
    });
});
