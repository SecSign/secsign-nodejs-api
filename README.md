# SecSign ID Node.js Interface

**Overview**

SecSign ID Api is a two-factor authentication for Node.js

This API allows a secure login using a private key on a smart phone running SecSign ID by SecSign Technologies Inc.


**Files**

* `SecSignIDApi.nodejs.js` - The SecSign ID Node.js Api itself. The file contains the module SecSignIDApi which contains two exported classes: SecSignIDApi and AuthSession
* `secsignid-example.js` - A small example how to request and check an authentication session on serverside.
* `secsignid-server.js` - A small example of a webserver based on Node.js framework. The webserver will accept and redirect some requests to the SecSign ID Server. The requested and checked authentication session data is sent to the browser.
* `web-example/index.html` - html page to be used by the webserver example.
* `web-example/access-pass.html` - html page to be used by the webserver example.
* `web-example/login-success.html` - html page to be used by the webserver example.
* `web-example/error.html` - html page to be used by the webserver example.


===============

SecSign Technologies Inc. official site: <https://www.secsign.com>
