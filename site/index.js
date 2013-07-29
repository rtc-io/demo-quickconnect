var	signaller = require('rtc/signaller').create({
        channel: 'test',
        host: location.origin || 'http://rtc.io'
    }),
    media = require('rtc/media'),
    localMedia = media(),
    crel = require('crel'),
    commandInput,
    messageList;

// render the local stream
localMedia.render('.zone.local');

signaller.on('peer:discover', function(id) {
    var connection = signaller.dial(id),
        videoElements = [];

    /* some potential nodey apis

    // send the local video to the connection
    localMedia.pipe(connection.createInput());

    // send connection streams to the media
    connection.createOutput().pipe(media.inject('.zone.remote'));
    */

    /* some potential more traditional apis

    connection.attach(localMedia);
    connection.renderTo('.zone.remote');
    */

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
