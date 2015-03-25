// $Id: secsignid-example.js,v 1.1 2015/03/24 17:38:01 titus Exp $


/*!
 * (c) 2015 SecSign Technologies Inc.
 */
 
var http = require('http');
var querystring = require('querystring');

// include SecSign ID Api for node.js
var SecSignIDApi = require('./SecSignIDApi.nodejs.js');


// !!! test purposes only !!!
// do not reject invalid, expired or unautharized certificates.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



//
// example
//



//
// create new instance of SecSign ID Api
//
var secSignIDApi = new SecSignIDApi();

// in case a different id server shall be used
/*var secSignIDApi = new SecSignIDApi({
	"idserver":'localhost', 
	"port" 	: '28100',
});*/

//
// example for whom an auth session coukld be requested
//
var authenticationSessionFor = {"secsignid" : "zoidberg", // the secsign id itself
								"servicename" : "Node.js test", // a name which will be shown in the push notification
								"serviceaddress" : "localhost" // an address which is shown at top in the app, when user has to pick the correct access pass
						};
								 


//
// this auth session object will encapsulate all required data such as request id, authentication session id and the secsign id
//
var authSession = null;



//
// call back function for the call of secSignIDApi.cancelAuthSession(...)
//
var canceledAuthSessionCallback = function(authSessionObj){
	if(authSessionObj.error){
		console.log("Error " + authSessionObj.errorcode + " : " + authSessionObj.errormsg);
	} else {
		// the received parsed data:
		// { 
		//		authsessionid: '-6928134574892437226',
	  	//		authsessionstate: '6'
	  	// }

		secSignIDApi.log("canceled auth session: ", authSessionObj);
	}
};


//
// call back function for the call of secSignIDApi.getAuthSessionState(...)
//
var receivedAuthSessionStateCallback = function(authSessionObj){
	if(authSessionObj.error){
		console.log("Error " + authSessionObj.errorcode + " : " + authSessionObj.errormsg);
	} else {
		// the received parsed data:
		// { 
		//		authsessionid: '-6928134574892437226',
	  	//		secsignid: 'local',
	  	//		authsessionstate: '1'
	  	// }

		secSignIDApi.log("auth session state: ", authSessionObj);
		
		// check which state the session has
		if(authSessionObj.authsessionstate == SecSignIDApi.AuthSession.PENDING){
			console.log("the authentication session is pending");
		}
				
		// store the new state in auth session object
		authSession.setState(authSessionObj.authsessionstate);
		
		// cancel session because the example ends here
		secSignIDApi.cancelAuthSession(authSession, canceledAuthSessionCallback);
	}
};



//
// call back function for the call of secSignIDApi.requestAuthSession(...)
//
var receivedAuthSessionCallback = function(authSessionObj){
	if(authSessionObj.error){
		console.log("Error " + authSessionObj.errorcode + " : " + authSessionObj.errormsg);
	} else {
		// received an authentication session
		// sent data is an url encoded parameter list: authsessionid=-429097454724893700&servicename=Node.js test&secsignid=titus&authsessionstate=1&serviceaddress=localhost&requestid=.....
		// when data was parsed, it looks like:
		// { 
		//		secsignid: 'farnsworth',
		//		requestid: 'F2C5F138E72008AD0ABCC2E83ACCD7B71B415FF58DA35DEAA5AA79D83B939246',
		//		authsessionid: '-8337412603900330717',
  		//		authsessionstate: '1',
  		//      servicename: 'Node.js test',
  		//		serviceaddress: 'localhost',
  		//		authsessionicondata: 'iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAYAAABxlTA0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAB1BJREFUeNrsnT1oI0cUgEd3ghOcIYYzxBDDKcSFIAdRwIXhVKgIxIUhKVw4YIgLFy5cpDhIChc2XOHiioNckSKFj7hw4cJFigs4oMAVKhyigAsHVCjggA0O6MABH9g4 3Jvc8/PO7vzt9JYngeDdqXd2dlPb95787OzhYuLCxEkP7kVEATAAXAQuRTpTqFQ6Hd5SlF6EKWJKI1HaSxKo5hK7NjTKB1iOohSO0q7UdrD3/om1K8VLu30HjD8wbUoTUWpjmBvW Z5jqAbUdrBz7N Af5vJ049FID5fZSOoQg5p2O8Vr2XgP9n2kPAUMWXorSfAQSq91aUlqM0h2AqUXpKjnmK39XxmGXFP2sfy1AaJMBwM1 hrUy66TO2Py/JZ4Ucs5Lw 1QCzAPJNQ xTKXrDnhWcpMnWG0BSod8v5mSVxZgkDVyTBedZA2vdZpQjgMs47UDXEYHI9OcYTyOVvsO d4UMDjNFjlui/wGeT S1KQdLPO1ALyIGnrBtIlXyQlmHrKckApgkCrLd1pisroJtWrRZ8BDWMW5ff1OoplNcty6Qv6qgEEek2PbEls7jGXjPmAT78UrwGUM8C/YjU1Kjp9j2j3iGHCJ2fZvUo6dTIhs9mxMhmvA1QS7tp6iBUWEHx/7SPE6OoBBZtifOJxR 9YT/EW134BrzN5CdVvIOGeeaXkxJ8AgLzXPWWAm4wTvsS AOVzY/kShadxWiHldAa5raDE958QGsgvAFdZyOsSoQOSkvaaABfZFqNjiNLN3jPfcE8CjzIF0NS5OY9QFzRpjCniKKULRUIk6eO 5Ai4yjdCpPjV2o6UeARYswpm1MIMNlT/IBvAa87QzGoXdIOc9NnCoNoAXGSQd Zzd81pegOvsQjo3OUT6As6wj6CXgIeYJpYtrp3Z6jQBPMTsbkPoOagFcu4Lw3jbBrDADp/4/GXNc4usb6WT1tqjTFUhQYHuk/1TLLCOLYtlRLFpnOTZabXV1cJxZjLGNc noyL3kUl2VKKgwZWE9npIb5hUspiqjCqDUbcdJxtEua3i8LIGPaFa/kb2v8AQS0cgYniI26sGXpw2Ur7E7eeGZgZGrL/F7T8MuyfBQf9A9j/G P6SBquaiG1SJbYNwdAW0aiFxtg6ubiX7YRUcdNuyVQuqlHEOLM5VUONoV2Aos ABUYxcT5TFj2IlM24iQ2m1ednXg0MoocdT2xnQ1I HWkhkyRWl RWStxHe7qeGhaEdrg3PQH8UlI XXnG/ENRBzC0VO7h9pFF44D2sO16Ahi07zyhfLryI7IRyKquA5h2iGwKs6lH4FA xO1X2D3pg4CT28ftd4T50NCZuDzNYFYHMDX W4YFqDCt8Un2mCM2lS0Js1TAAOY9onlNB4D3PAPckjShdaWJjAQyq6gArjOPazozkRa87RngtiPAZywqqasAnpB4XF2htq3jGeCOI8Cc0YQuYBvPT/t8DzwDfCApp4ns6gJ25ZxGWXPZJ6HlGbHMqyVhlwgYAu87uP23eDOgaSrDHmswyF/4 a5lPl1kJZDdZBZgV3Yz1uB/hJ9yKlEGW5ueCpg6pmPLi95xlE8v7LAt4GMJwyuAqx7bTZ/lUMLwSnclxHRhOMguNXSHjIJYSADcR8Aw7lWwSLH8aZlPnFZJnqsO8vuF5Pe ZV7PVQG3JA2FIOqNqlYa4I7DFs5rR/nkJWOssWAjI7L2AwfclMVzFqHLXU8BlxwCLksYJgKONe eZQDeddihkofEfd5HlvkMi7fDa6 zAIPsS4Nm8 DbN3s 6rDF kDCTgo4tfvNsCnqmwa77EpN7d7NAlyzuHDHoT13LbQ8tqMtdV3ADXZy0fDCroZl8pBxmdfXlKK4OsSWCRjsSNxXCsPappMz9iV2ygepptlNDZlERgKZKdlgEDrRZMYC8LkDZ5mH0D/cZsR7RsIsEzCfUGFiJk7F5QkevpgJiH/joZ1XFiaiKK5O0FEG3CDxIQypTBsWwlVE4lLowks2g7rT4u1w05GQzHuWAYbx/g2yv2RYiCazVz5ITdbq0hTKZEPI5o/kPD 4Im74/OAww91MlGe4FxVu6jPchs85g5ZPm9iqRWH jEaZbdcNo4e7pFwmfmGMMBGZf7bCY1zbIoyzydJ2JtPwnFy z8mpxLcQyz6J0tfku5 E3rA eO4PcPtXQ4cHjuUj3P5d6E/rAkf0kLS6dJ8ZAf/xKdl/otQKDM8qKzcqGsLgWeXwtL3 tXN52j6Wm7hexIzo0XoRSVUlrHjiGHBs7Kk9Nl2zZ75HgG3W7OmKHq/ZQy8eVp3KEXBS9QnrpjkGnARZZeW/RRFW/tNuANisXbmUE CBWLuSdr74vPpq2gKk3q  SrUgrB8s rMCNnjhsAK2QykLtTXcn6m270VYwz1RdN9CsGEJ Ma8hSCpSvb6PRptcQPeo8FB67wJZkWEN8EYS1xtB/5dRoP Nq4X2Jrr29u4 g04yYwM7vvkgriX8CBiAHy95V8BBgCume40N2lAMAAAAABJRU5ErkJggg==',
  		// }
  		//
  		// the authentication session icon data must be shown to user e.g. by sending it back to the caller or the website.
  		// to check the authentication state the request id and the authentication session is needed.
  		// therefor the auth session object must be stored by sending it to the browser, so it could be posted back, by storing it in a session object or somewhere else
  		// 
		secSignIDApi.log("received auth session: ", authSessionObj);
		
		// create an authentication object. this stores the data about secsign id, request id and auth session id
		authSession = new SecSignIDApi.AuthSession(authSessionObj);
		
		// secSignIDApi.getAuthSessionState(authSession);
		// secSignIDApi.getAuthSessionState(authSessionObj);
		secSignIDApi.getAuthSessionState({
							"secsignid" : authSessionObj.secsignid,
							"requestid" : authSessionObj.requestid,
							"authsessionid" : authSessionObj.authsessionid
		}, receivedAuthSessionStateCallback);
	}
};



//
// start by requesting an authentication session
//
secSignIDApi.requestAuthSession(authenticationSessionFor, receivedAuthSessionCallback);




//
// end of example
//