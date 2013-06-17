var signaller = require('rtc-signaller'),
	channel = signaller('test');

// set the transport as the socket.io signaller
channel.transport = require('rtc-signaller-ws')({ host: 'http://localhost:3000/' });