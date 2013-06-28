var	signaller = require('rtc/signaller'),
    PeerConnection = require('rtc/peerconnection'),
	channel = signaller({ channel: 'test', debug: true }),
    media = require('rtc/media'),
    localVideo = media();

// set the transport as the socket.io signaller
channel.setTransport(require('rtc-signaller-ws')({ host: location.origin || 'http://localhost:3000/' }));

// wait for ready event
channel.once('ready', function() {
    console.log('connected to ' + channel.name + ' with ' + channel.peers.length + ' other peers');
});

channel.on('peer:discover', function(peer) {
    var connection = channel.connect(peer.id),
        videoElements = [];

    // var connection = channel.dial(peer.id);

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

    connection.on('stream:add', function(stream) {
        videoElements = videoElements.concat(media(stream).render('.zone.remote'));
    });

    // when the connection is closed, remove the streams
    connection.on('close', function() {
        // remove the video elements
        videoElements.splice(0).forEach(function(el) {
            el.parentNode.removeChild(el);
        });
    });
});

localVideo.render('.zone.local').on('start', function(stream) {
    console.log('video started, stream: ', stream);
});
