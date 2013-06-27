var browserify = require('browserify-middleware'),
    bunyan = require('bunyan'),
    log = bunyan.createLogger({
        name: 'rtc-helloworld'
    }),
    express = require('express'),
    stylus = require('stylus'),
    app = express(),
    server = require('http').Server(app),
    signaller = require('rtc-signaller-ws/server')(server),
    ChannelManager = require('rtc-channelmanager');

// attach the signaller to the express application
signaller.channelManager = new ChannelManager();

// browserify valid things
app.use(browserify(__dirname + '/site'));

// convert stylus stylesheets
app.use(stylus.middleware({
    src: __dirname + '/site'
}));

// serve the rest statically
app.use(express.static(__dirname + '/site'));

// start the server
server.listen(3000, function(err) {
    console.log('server running on port 3000');
});
