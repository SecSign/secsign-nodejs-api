# SecSign ID Node.js Interface

**Overview**

SecSign ID Api is a two-factor authentication for Node.js

This API allows a secure login using a private key on a smart phone running SecSign ID by SecSign Technologies Inc.
A complete tutorial is found at <https://www.secsign.com/nodejs-tutorial/> or just visit <https://www.secsign.com> for more information.
 
**Files**

* `SecSignIDApi.nodejs.js` - The SecSign ID Node.js Api itself. The file contains the module SecSignIDApi which contains two exported classes: SecSignIDApi and AuthSession
* `secsignid-example.js` - A small example how to request and check an authentication session on serverside.
* `secsignid-server.js` - A small example of a webserver based on Node.js framework. The webserver will accept and redirect some requests to the SecSign ID Server. The requested and checked authentication session data is sent to the browser.
* `web-example/index.html` - html page to be used by the webserver example.
* `web-example/access-pass.html` - html page to be used by the webserver example.
* `web-example/login-success.html` - html page to be used by the webserver example.
* `web-example/error.html` - html page to be used by the webserver example.

**Integration of the API**

Download the SecSign ID Node.js API (SecSignIDApi.nodejs.js) and add it to your Node.js project.

**Usage**
* Request a session
* Show access pass to the user
* Request the state of the session to check whether the user has already authenticated
* Login user at system

```javascript
// include SecSign ID Api for node.js
var SecSignIDApi = require('./SecSignIDApi.nodejs.js');

// the later auth session object
var authSession = null;

// call back function for the call of secSignIDApi.requestAuthSession(...)
var receivedAuthSessionCallback = function(authSessionObj){
	if(authSessionObj.error){
		console.log("Error " + authSessionObj.errorcode + " : " + authSessionObj.errormsg);
	} else {
		// create an authentication object. this stores the data about secsign id, request id and auth session id
		authSession = new SecSignIDApi.AuthSession(authSessionObj);
		secSignIDApi.getAuthSessionState({
	    	"secsignid" : authSessionObj.secsignid,
    		"requestid" : authSessionObj.requestid,
    		"authsessionid" : authSessionObj.authsessionid
		}, receivedAuthSessionStateCallback);
	}
};

var authenticationSessionFor = {
    "secsignid" : "zoidberg", // the secsign id itself
    "servicename" : "Node.js test", // a name which will be shown in the push notification
    "serviceaddress" : "localhost" // an address which is shown at top in the app, when user has to pick the correct access pass
};

// start by requesting an authentication session
secSignIDApi.requestAuthSession(authenticationSessionFor, receivedAuthSessionCallback);

// example for authentication session callback function. this is an example how to deal with the authentication state
var receivedAuthSessionStateCallback = function(authSessionObj){
    if(authSessionObj.error){
        console.log("Error " + authSessionObj.errorcode + " : " + authSessionObj.errormsg);
    } else {
   
        // check which state the session has
        // PENDING, EXPIRED, AUTHENTICATED, DENIED, SUSPENDED, CANCELED, FETCHED, INVALID, NOSTATE
   
        if(authSessionObj.authsessionstate == SecSignIDApi.AuthSession.PENDING){
            console.log("the authentication session is pending");
            // check again..
        }
        
        if(authSessionObj.authsessionstate == SecSignIDApi.AuthSession.AUTHENTICATED){
            //release authSession and log user in
            secSignIDApi.releaseAuthSession(authSession, userIsLoggedInCallback);
            
            // now, we can login user herer at our backend/system etc
        }
    }
};
```

**Tutorial**

A complete tutorial with the examples can be found at <https://www.secsign.com/nodejs-tutorial/>.

===============

SecSign Technologies Inc. official site: <https://www.secsign.com>
