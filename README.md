# rtc-helloworld

This is a starter project for working with [WebRTC](http://webrtc.org).  This "Hello World" demo introduces the following concepts:

- Creating a WebRTC client application using [Browserify](https://github.com/substack/node-browserify)
- Using the simple `rtc-signal-reflector` for simple signalling using [socket.io](http://socket.io/)

## Getting Started

First, clone this repository:

```console
git clone git://github.it.nicta.com.au/doehlman/rtc-helloworld.git
```

Then, so you don't have to deal with me breaking things in master, checkout the latest stable tag (which is currently `v0.0.2`):

```console
git checkout v0.0.2
```

Next, install node dependencies:

```console
cd rtc-helloworld
npm install
```

Once the dependencies have been installed, you should then be able to run the demonstration server:

```console
npm start
```

If everything has worked correctly, you should now be able to open your browser to the following url:

<http://localhost:3000/>

You can test that you have WebRTC peer connections operating correctly by opening two browser windows to the same url; or, you can find someone else that has access to your machine and point them to: <http://your.ip:3000/>.  All being well you should be able to communicate with that person using WebRTC!
