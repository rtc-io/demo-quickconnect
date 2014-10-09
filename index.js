var attach = require('rtc-attach');
var capture = require('rtc-capture');
var quickconnect = require('rtc-quickconnect');
var append = require('fdom/append');
var kgo = require('kgo');
var config = require('./config.js');
var conference;

function init() {
  // use kgo to help with flow control
  kgo(config)
  ('capture', [ 'constraints' ], capture)
  ('attach', [ 'capture' ], attach.local)
  ('render-local', [ 'attach' ], append.to('.local'))
  ('start-conference', [ 'capture' ], conference.addStream)
  .on('error', reportError);
}

function renderRemote(id, stream) {
  kgo({ stream: stream })
  ('attach', [ 'stream' ], attach)
  ('render-remote', [ 'attach' ], function(el) {
    el.dataset.peer = id;
    append.to('.remote', el);
  })
  .on('error', reportError);
}

function reportError(err) {
  console.error('Encountered error: ', err);
}

conference = quickconnect('//switchboard.rtc.io', {
  // we are going to let quickconnect autogenerate #room names if not
  // supplied, but we will announce in the "qcdemo" namespace
  ns: 'qcdemo',

  // only start the conference when we have received 1 local stream
  expectedLocalStreams: 1,

  // use some standard free ice servers
  iceServers: require('freeice')()
});

conference
.createDataChannel('chat')
.on('call:ended', function(id) {
  var videos = [].slice.call(document.querySelectorAll('[data-peer="' + id + '"]'));

  videos.forEach(function(vid) {
    vid.parentNode.removeChild(vid);
  });
})
.on('stream:added', renderRemote);

init();
