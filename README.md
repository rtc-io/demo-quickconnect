# rtcio-demo-quickconnect

This is a starter project for working with [WebRTC](http://webrtc.org).
This demo showcases how to use the following packages to build a
fully functional WebRTC application:

- [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect)

  The `rtc-quickconnect` package provides operations that make it simpler
  to work with WebRTC peer connections.

- [rtc-media](https://github.com/rtc-io/rtc-media)

  Media capture and rendering.

- [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard)

  A websocket powered signaling server that is used to help setup
  peer connections between two clients.


[![NPM](https://nodei.co/npm/rtcio-demo-quickconnect.png)](https://nodei.co/npm/rtcio-demo-quickconnect/)



## Getting Started

First, clone this repository:

```
git clone https://github.com/rtc-io/rtcio-demo-quickconnect.git
```

Next, install node dependencies:

```
cd rtcio-demo-quickconnect
npm install
```

Once the dependencies have been installed, you should then be able to run
the demonstration server:

```
npm start
```

If everything has worked correctly, you should now be able to open your
browser to the following url:

<http://localhost:3000/>

You can test that you have WebRTC peer connections operating correctly by
opening two browser windows to the same url; or, you can find someone else
that has access to your machine and point them to: <http://your.ip:3000/>.
All being well you should be able to communicate with that person using
WebRTC!

## License(s)

### Apache 2.0

Copyright 2014 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
