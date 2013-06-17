var browserify = require('browserify-middleware'),
	express = require('express'),
	signaller = require('rtc-signaller-ws/server'),
	app = express(),
	server = require('http').Server(app);

// attach the signaller to the express application
signaller(server);

// use the site handler
app.use(browserify(__dirname + '/site'));
app.use(express.static(__dirname + '/site'));

// start the server
server.listen(3000, function(err) {
	console.log('server running on port 3000');
});