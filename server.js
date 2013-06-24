var browserify = require('browserify-middleware'),
    bunyan = require('bunyan'),
    log = bunyan.createLogger({
        name: 'rtc-helloworld'
    }),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    signaller = require('rtc-signaller-ws/server')(server, { log: log }),
    ChannelManager = require('rtc-channelmanager');

// attach the signaller to the express application
signaller.channelManager = new ChannelManager({ log: log });

// use the site handler
app.use(browserify(__dirname + '/site'));
app.use(express.static(__dirname + '/site'));

// start the server
server.listen(3000, function(err) {
    console.log('server running on port 3000');
});
