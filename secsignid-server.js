// $Id: secsignid-server.js,v 1.1 2015/03/24 17:38:01 titus Exp $


/*!
 * (c) 2015 SecSign Technologies Inc.
 */
 
 
 
//
// An example how a webserver based on Node.js could fetch authentication session requested by a website.
// The authentication will be requested, checked etc and the result is sent to browser
//
 
var path = require("path");
var fs = require("fs");
var url = require("url");
var http = require('http');
var querystring = require('querystring');

// include SecSign ID Api for node.js
var SecSignIDApi = require('./SecSignIDApi.nodejs.js');

// start webserver to listen for requests...
var server = http.createServer(function(request, response) {
	
	// reads in the file and replace specified replacements
	var getHtmlFile = function(filename, replacements){
		var file = fs.readFileSync(filename, 'utf8');
		if(replacements){
			for(var key in replacements){
				if(replacements.hasOwnProperty(key)){
					var re = new RegExp(key, 'g');
					file = file.replace(re, replacements[key]);
				}
			}
		}
		return file;
	};
	
	
	//
	// function to handle either parameter or requested files...
	//
	var handleParameter = function(data){
		
		// check secsign id parameter exists. otherwise serve the requestor with the requested files
		
		
		var hostname = request.headers.host;
		var uri = url.parse(request.url).pathname;
    	var file = path.join(process.cwd(), uri);
    	var pathname = path.parse(file).dir;
    	var exists = fs.existsSync(file);
    	
    	if(exists && fs.statSync(file).isDirectory()){
    		pathname = file;
    	}

		if(data){
			// check whether some parameter were sent which we need to redirect to id-server
			if(data.secsignid && data.login){
				// login for a secsign id is requested...
				// create new instance of SecSign ID Api
				var secSignIDApi = new SecSignIDApi();
				
				secSignIDApi.requestAuthSession({"secsignid" : data.secsignid, 
												 "servicename" : "Node.js Test Website", 
												 "serviceaddress" : hostname}, function(receivedAuthSession){
												 	if(receivedAuthSession.error){
												 		// error occured: get error html and sent it to browser
												 		var f = getHtmlFile(pathname + "/error.html", {"%errormsg%" : receivedAuthSession.errormsg});
												 		
												 		response.writeHead(200);
												 		response.write(f);
												 		response.end();
												 	} else {
												 		// received an authentication session
												 		var f = getHtmlFile(pathname + "/access-pass.html", {
												 								"%requestid%" : receivedAuthSession.requestid,
												 								"%secsignid%" : receivedAuthSession.secsignid,
												 								"%authsessionid%" : receivedAuthSession.authsessionid,
												 								"%servicename%" : receivedAuthSession.servicename,
												 								"%serviceaddress%" : receivedAuthSession.serviceaddress,
												 								"%icondata%" : receivedAuthSession.authsessionicondata,
												 								"%msg%" : ""
												 							});

												 		response.writeHead(200);
												 		response.write(f);
												 		response.end();
												 	}
												 });
				return;					 										 
			} else if(data.secsignid && data.requestid && data.cancel){
				// need to cancel the authentication session
				var secSignIDApi = new SecSignIDApi();
				secSignIDApi.cancelAuthSession({"secsignid" : data.secsignid, 
												 "requestid" : data.requestid, 
												 "authsessionid" : data.authsessionid}, function(canceledAuthSession){
												 	var msg = "The auth session was canceled";
												 	
												 	if(canceledAuthSession.error){
												 		msg = canceledAuthSession.errormsg;
												 	}
												 	var f = getHtmlFile(pathname + "/error.html", {"%errormsg%" : msg});

												 	response.writeHead(200);
												 	response.write(f);
												 	response.end();
												 });
				return;	
			} else if(data.secsignid && data.requestid && data.check){
				// need to check the authentication session
				var secSignIDApi = new SecSignIDApi();
				secSignIDApi.getAuthSessionState({"secsignid" : data.secsignid, 
												 "requestid"  : data.requestid, 
												 "authsessionid" : data.authsessionid}, function(checkedAuthSession){
												 	if(checkedAuthSession.error){
												 		// error occured: get error html and sent it to browser
												 		var f = getHtmlFile(pathname + "/error.html", {"%errormsg%" : checkedAuthSession.errormsg});
												 		
												 		response.writeHead(200);
												 		response.write(f);
												 		response.end();
												 	} else {
												 		if(checkedAuthSession.authsessionstate == SecSignIDApi.AuthSession.PENDING || 
												 		   checkedAuthSession.authsessionstate == SecSignIDApi.AuthSession.FETCHED){
															
															// get the access pass page and send it to the caller/browser
															var f = getHtmlFile(pathname + "/access-pass.html", {
												 								"%requestid%" : data.requestid,
												 								"%secsignid%" : data.secsignid,
												 								"%authsessionid%" : data.authsessionid,
												 								"%servicename%" : data.servicename,
												 								"%serviceaddress%" : data.serviceaddress,
												 								"%icondata%" : data.authsessionicondata,
												 								"%msg%" : "The authentication session is still pending... It has neither be accepted nor denied. "
												 							});

												 			response.writeHead(200);
												 			response.write(f);
												 			response.end();
														} else if(checkedAuthSession.authsessionstate == SecSignIDApi.AuthSession.AUTHENTICATED) {
															
															//
															//
															// the authentication was accepted by the user. he picked the correct access pass on his smartphone.
															// now the user could be logged in into a cms or the website or something else.
															// the user - secsign id mapping is the job of the system.
															// e.g.: 
															//		logging in into wordpress at this point the authenticated secsign id will be checked if it is assigned to a wordpress user
															//		in that case the wordpress user will be logged in at wordpress by setting flags and indicators of the user session
															//		therefor the authentication process according secsign id ends here. the session can be released so it will be removed at the id server.
															//		in case the session state must be checked later, the session should not be released now.
															//
															//
															
															//
															// release the auth session
															//
															var secSignIDApi = new SecSignIDApi();
															secSignIDApi.releaseAuthSession({"secsignid" : data.secsignid, 
												 											"requestid" : data.requestid, 
												 											"authsessionid" : data.authsessionid});
															
															// get success page and send to browser					
															var f = getHtmlFile(pathname + "/login-success.html", {"%secsignid%" : data.secsignid});
												 		
													 		response.writeHead(200);
													 		response.write(f);
													 		response.end();
														} else {
															// something happend... the session state is invalid, expired, suspended, denied, canceled or something else...
															// go back to start
															var authSession = new SecSignIDApi.AuthSession(checkedAuthSession);
												 			var f = getHtmlFile(pathname + "/error.html", {"%errormsg%" : "Canceled process because session was in state: " + authSession.getStateName()});
												 		
													 		response.writeHead(200);
													 		response.write(f);
													 		response.end();
														}
												 	}
												 });
				return
			}
		}

		if(! exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}

		if(fs.statSync(file).isDirectory()){
			file += '/index.html';
		}
		
		// read requested file and sent to browser
		fs.readFile(file, "binary", function(error, file) {
			if(error) { 
				// probably the file does not exists
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(error + "\n");
				response.end();
				return;
			}

			response.writeHead(200);
			response.write(file, "binary");
			response.end();
    	});
	};
	
	
	//
	// check the request and read in parameter
	// parameter are sent either by post or by get
	//
	var r = request;
	if(r.method === 'POST'){
		// parse post data...
		var queryData = "";
		r.on('data', function(data){
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                
                // data was to loong
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                r.connection.destroy();
            }
        });
        
		// finished reading post data
        r.on('end', function() {
            r.post = querystring.parse(queryData);
            
            // handle parameter and sent result to caller/browser
            handleParameter(r.post);
        });
	} else if(r.method === 'GET'){
		if(r.url.indexOf("?") > -1){
			r.get = querystring.parse(r.url.substring(r.url.indexOf("?")+1));
		} else {
			r.get = {};
		}	
		
		// handle parameter and sent result to caller/browser
	    handleParameter(r.get);
	}
});

// start webserver
server.listen(8080);



