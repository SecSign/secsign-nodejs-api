
/*!
 * (c) 2015 SecSign Technologies Inc.
 */

// imports 
var querystring = require('querystring');
var http = require('http');
var https = require('https');

// version string
var SECSIGNID_NODEJS_API_VERSION = "1.5";


/**
 * Javascript class to connect to a secsign id server. 
 * The class will check secsign id server certificate and request for an authentication session for a given
 * user id which is called secsign id. 
 * Each authentication session generation needs a new instance of this class.
 *
 * @author SecSign Technologies Inc.
 */
function SecSignIDApi(options){
	// private members
	var _options = merge({"idserver":'httpapi.secsign.com', 
						  "port" 	: '443',
      					  "posturl" : '/',
						  "async" : true,
						  "method" : "POST"}, options, true);
    var _dump = false;
    
    // public members
    this.referer = 'SecSignIDApi_Node.js';
    this.pluginName = 'SecSignIDApi_Node.js';
    
    if(options && options.pluginname){
        this.pluginName = options.pluginname;
    }
    
    this.log = function(description, object){
    	if(_dump){
			console.log("-------------");
			console.log(description);
    		console.log(object);
	    	console.log("-------------");
	    }
    };
    
    this.getOptions = function(){
    	return _options;
    };
    
    this.log("instance version: ", SECSIGNID_NODEJS_API_VERSION);
    this.log("instanceoptions : ", _options);
}



//
//
// prototypes of SecSignIDApi
//
//



//
// prototype function to send a request to a specified server
//
SecSignIDApi.prototype.sendRequest = function(requestDataObj, callbackFunction){
	var instance = this;
	var fixParameters = {
							"apimethod" : this.referer
						 };
	var requestData = querystring.stringify(merge(requestDataObj, fixParameters, true));
	instance.log("requestData: ", requestData);
		
	// An object of options to indicate where to post to
	var opt = instance.getOptions();
	var requestOptions = { 	host: opt["idserver"],
							port: opt["port"],
							path: opt["posturl"],
							method: 'POST',
							headers: {
									  'Content-Type': 'application/x-www-form-urlencoded',
									  'Content-Length': requestData.length
									}
	};
	

	instance.log("requestoptions: ", requestOptions);

	// Set up the request
	var postRequest = https.request(requestOptions, function(response) {
		var receivedData = '';
		
		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			// chunks of data are sent
			receivedData += chunk;
		});
		response.on('end', function() {
			// data reception is done
			instance.log("received data: ", receivedData);
			
			if(callbackFunction){
				
				// this will cut of base64 encoding paddings
				//var receivedDataObject = querystring.parse(receivedData);
				var receivedDataObject = {};
        		var parts = receivedData.split(/&/g);
        		for(var i = 0; i < parts.length; i++){
        			var idx = parts[i].indexOf("=");
            		if(idx > -1){
                		var key = parts[i].substring(0, idx).trim();
                		if(key && key.length){
							receivedDataObject[key] = parts[i].substring(idx+1).trim();
						}
                    }
                }
				
				callbackFunction(receivedDataObject);
			}
        });
	});

	// post the data
	postRequest.write(requestData);
	postRequest.end();
	
	return this;
};



//
// Send query to secsign id server to create an authentication session for a certain secsign id.
//
SecSignIDApi.prototype.requestAuthSession = function(options, callbackFunction) {
	if(! options.secsignid){
		throw new Error("SecSign ID field 'secsignid' is null.");
	}
	if(! options.servicename){
	   throw new Error("Servicename field 'servicename' is null.");
	}
	if(! options.serviceaddress){
	   throw new Error("Serviceaddress field 'serviceaddress' is null.");
	}
	
	var secsignid = options.secsignid.toLowerCase().trim();
	if(! secsignid){
	   throw new Error("SecSign ID field 'secsignid' is null.");
	}
	
	// create request object
	var request	= {
		"secsignid" : secsignid,
		"servicename" : options.servicename.trim(),
		"serviceaddress" : options.serviceaddress.trim(),
		"request" : 'ReqRequestAuthSession'
	};
	
	return this.sendRequest(request, callbackFunction);
};



//
// Gets the authentication session state for a certain secsign id whether the authentication session is still pending or it was accepted or denied.
//
SecSignIDApi.prototype.getAuthSessionState = function(options, callbackFunction) {
	if(! options.secsignid){
		throw new Error("SecSign ID field 'secsignid' is null.");
	}
	if(! options.requestid){
	   throw new Error("Request ID field 'requestid' is null.");
	}
	if(! options.authsessionid){
	   throw new Error("Authentication session ID field 'authsessionid' is null.");
	}

	// create request object
	var request	= {
		"secsignid" : options.secsignid.toLowerCase(),
		"requestid" : options.requestid,
		"authsessionid" : options.authsessionid,
		"request" : 'ReqGetAuthSessionState'
	};
	
	return this.sendRequest(request, callbackFunction);
};



//
// Cancel the given auth session.
//
SecSignIDApi.prototype.cancelAuthSession = function(options, callbackFunction) {
	if(! options.secsignid){
		throw new Error("SecSign ID field 'secsignid' is null.");
	}
	if(! options.requestid){
	   throw new Error("Request ID field 'requestid' is null.");
	}
	if(! options.authsessionid){
	   throw new Error("Authentication session ID field 'authsessionid' is null.");
	}

	// create request object
	var request	= {
		"secsignid" : options.secsignid.toLowerCase(),
		"requestid" : options.requestid,
		"authsessionid" : options.authsessionid,
		"request" : 'ReqCancelAuthSession'
	};
	
	return this.sendRequest(request, callbackFunction);
};



//
// Releases an authentication session if it was accepted and not used any longer 
//
SecSignIDApi.prototype.releaseAuthSession = function(options, callbackFunction) {
	if(! options.secsignid){
		throw new Error("SecSign ID field 'secsignid' is null.");
	}
	if(! options.requestid){
	   throw new Error("Request ID field 'requestid' is null.");
	}
	if(! options.authsessionid){
	   throw new Error("Authentication session ID field 'authsessionid' is null.");
	}
	
	// create request object
	var request	= {
		"secsignid" : options.secsignid.toLowerCase(),
		"requestid" : options.requestid,
		"authsessionid" : options.authsessionid,
		"request" : 'ReqReleaseAuthSession'
	};
	
	return this.sendRequest(request, callbackFunction);
};



/**
 * Javascript class to encapsulate an object with data about an authentication session
 *
 * @author SecSign Technologies Inc.
 */
function AuthSession(authSession){

	// merge given properties into myself
	_merge(this, authSession);

	//
	// gets the state of this authentication session
	//
	this.getState = function(){
		return this["authsessionstate"] ? this["authsessionstate"] : NOSTATE;
	}
	
	//
	// sets a new state to the authentication object
	//
	this.setState = function(authSessionState){
		this["authsessionstate"] = authSessionState;
	}
	
	//
	// gets the name of the authentication session state
	//
	this.getStateName = function (){
	
		var stateInt = parseInt(this["authsessionstate"]);
		switch(stateInt) {
    		case PENDING:
    			return "PENDING";
    		case EXPIRED:
    			return "EXPIRED";
    		case AUTHENTICATED:
    			return "AUTHENTICATED";
    		case DENIED:
    			return "DENIED";
    		case SUSPENDED:
    			return "SUSPENDED";
    		case CANCELED:
    			return "CANCELED";
    		case FETCHED:
    			return "FETCHED";
    		case INVALID:
    			return "INVALID";
    	}
    	return "NOSTATE";
	}
}


//
//
//
//
//
//
//
//
//
//
//
//

//
// merges the objects together. if clone is true a new object is created
//
var merge = function(obj1, obj2, clone){
	if(clone === true){
		var newobj = _merge({}, obj1);
		return _merge(newobj, obj2);
	} else {
		return _merge(obj1, obj2);
	}
}

//
// merges the objects together. if clone is true a new object is created
//
var _merge = function(obj1, obj2){
	for(var key in obj2){
		if(obj2.hasOwnProperty(key)){
			obj1[key] = obj2[key]; 
		}
	}
	return obj1;
}



//
// No State: Used when the session state is undefined. 
//
var NOSTATE = 0;

//
// Pending: The session is still pending for authentication.
//
var PENDING = 1;

//
// Expired: The authentication timeout has been exceeded.
//
var EXPIRED = 2;

//
// Authenticated: The user was successfully authenticated.
//
var AUTHENTICATED = 3;

//
// Denied: The user denied this session.
//
var DENIED = 4;

//
// Suspended: The server suspended this session, because another authentication request was received while this session was still pending.
//
var SUSPENDED = 5;

//
// Canceled: The service has canceled this session.
//
var CANCELED = 6;

//
// Fetched: The device has already fetched the session, but the session hasn't been authenticated or denied yet.
//
var FETCHED = 7;

//
// Invalid: This session has become invalid.
//
var INVALID = 8;


// export the class
module.exports = SecSignIDApi;
module.exports.AuthSession = AuthSession;


// export the constants
module.exports.AuthSession.NOSTATE 			= NOSTATE;
module.exports.AuthSession.PENDING 			= PENDING;
module.exports.AuthSession.EXPIRED 			= EXPIRED;
module.exports.AuthSession.AUTHENTICATED 	= AUTHENTICATED;
module.exports.AuthSession.DENIED 			= DENIED;
module.exports.AuthSession.SUSPENDED 		= SUSPENDED;
module.exports.AuthSession.CANCELED 		= PENDING;
module.exports.AuthSession.FETCHED 			= FETCHED;
module.exports.AuthSession.INVALID 			= INVALID;
