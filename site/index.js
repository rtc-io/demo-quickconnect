var	signaller = require('rtc/signaller'),
    PeerConnection = require('rtc/peerconnection'),
	channel = signaller({ channel: 'test', debug: false }),
    media = require('rtc/media'),
    localVideo = media();

// set the transport as the socket.io signaller
channel.setTransport(require('rtc-signaller-ws')({ host: 'http://localhost:3000/' }));

// wait for ready event
channel.once('ready', function() {
    console.log('connected to ' + channel.name + ' with ' + channel.peers.length + ' other peers');
});

channel.on('peer:discover', function(peer) {
    var connection = channel.connect(peer.id); // new PeerConnection();

    // if we already have a stream, then add the stream
    if (localVideo.stream) {
        console.log('local video stream active, adding to the connection');
        connection.addStream(localVideo.stream);
    }
    // otherwise, wait for the start and bind
    else {
        localVideo.once('start', function(stream) {
            console.log('local video has started streaming');
            connection.addStream(stream);
        });
    }

    connection.addEventListener('addstream', function(evt) {
        media(evt.stream).render('.video.remote');
    });
});

localVideo.render('.video.local').on('start', function(stream) {
    console.log('video started, stream: ', stream);
});
