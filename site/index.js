var	signaller = require('rtc/signaller').create({
        channel: 'test',
        host: location.origin || 'http://localhost:3000/'
    }),
    PeerConnection = require('rtc/peerconnection'),
    media = require('rtc/media'),
    localVideo = media();

// wait for ready event
signaller.once('ready', function() {
    console.log('ready');
});

signaller.on('peer:discover', function(peer) {
    var connection = signaller.dial(peer.id),
        videoElements = [];

    console.log('discovered peer: ' + peer.id);

    // if we already have a stream, then add the stream
    if (localVideo.stream) {
        console.log('local video stream active, adding to the connection');
        connection.addStream(localVideo.stream);
    }
    // otherwise, wait for the start and bind
    else {
        localVideo.once('start', function(stream) {
            console.log('local video has started streaming', stream);
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

        // release the connection reference
        connection = null;
    });
});

localVideo.render('.zone.local');
