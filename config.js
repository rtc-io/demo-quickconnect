// configure the switchboard address
exports.switchboard = 'https://switchboard.rtc.io';

// initialise constraints that will be used for local media capture
exports.constraints = { video: true, audio: true };

// initialise common options that are used across rtc.io packages
exports.options = {
  plugins: []
};
