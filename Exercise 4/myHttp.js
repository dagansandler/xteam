/*
- content type like .css to respond
- POST
*/

var net = require('net');
var fs = require('fs');
var settings = require('./settings');
var events = require('events');


function createHTTPServer(rootFolder) {
	var eventEmitter = new events.EventEmitter();

	

	var ServerInstance = function() {

		var root = rootFolder;
		var isStarted = false;
		var server = net.createServer(onTcpConnection);
		var port = undefined;
		var startedDate = undefined;
		var activeRequests = 0;
		var acceptedRequests = 0;
		var totalRequests = 0;
		var shuttingDown = false;
		var listenerMap = {
			'GET': {},
			'POST': {}
		};
		eventEmitter.on('onResponse', sendResponse);
		eventEmitter.on('onRequest', routeRequest);

		function status() {
			var requestSuccessRate;
			if (totalRequests === 0) {
				requestSuccessRate = 100;
			} else {
				requestSuccessRate = (acceptedRequests * 100) / totalRequests;
			}
			return {
				isStarted: isStarted,
				startedDate: startedDate,
				port: port,
				numOfCurrentRequests: activeRequests,
				precntageOfSuccesfulRequests: requestSuccessRate
			};
		};

		function assignGetHandler(resource, callback) {
			assignHandler('GET', resource, callback);
		}

		function assignPostHandler(resource, callback) {
			assignHandler('POST', resource, callback);
		}

		function assignHandler(method, resource, callback) {
			//update listener map
			listenerMap[method][resource] = callback;

			/*events are inserted with the method at start
			 to allow different callbacks on same resources with different URIs*/
			eventEmitter.removeAllListeners(resource);
			eventEmitter.on(method + resource, callback);
		}

		function routeRequest(socket, request) {
			if (request.uri.indexOf("..") !== -1) {
				console.log('Request include ".."');
				return;
				//return error message
			}
			var listener = getListener(request.method, request.uri);
			if (listener !== undefined) {
				//add params to request
				request.params = listener.params;
				eventEmitter.emit(request.method + listener.resource, request, new Response(socket));
				return;
			}


			/*default behavior - no user listener was found*/
			var content_type = contentHelper(request);
			console.log(content_type);
			var response = new Response(socket);
			//		  console.log(request);
			switch (request.method) {
			case 'GET':
				{
					if (request.uri === '/status') {
						var stats = status();
						var statsPage = getStatusHtml(stats);
						response.headers["Content-Type"] = content_type;
						response.write(statsPage);
						response.end();
					} else {
						fs.exists(root + request.uri, function(exists) {
							if (exists) { /*file is there*/
								fs.lstat(root + request.uri, function(err, stats) {
									if (err) {
										console.log("found err");
										throw err;
									}
									if (stats.isFile()) { /*is file*/
										fs.readFile(root + request.uri, function(err, data) {
											if (err) {
												console.log("error on file read: " + request.uri);
												console.log(err);
											}
											response.headers["Connection"] = "Keep-Alive";
											response.headers["Content-Type"] = content_type;
											response.write(data.toString());
											response.end();
											console.log("Serving file " + request.uri + " to client");
										});
									} else { /*is directory*/

									}
								});
							} else { /*file not found*/
								response.status = 404;
								response.headers["Content-Type"] = "text/html";
								response.write("<b>404 Not Found</b>");
								response.end();
							}
						});
					}
					break;
				}
			case 'POST':
				{
					console.log("got post request");
					response.headers["Content-Type"] = "text/html";
					response.end();
					break;
				}
			default:
				{ /*the request type is not supported*/
					response.status = 405;
					response.headers["Allow"] = "GET,POST";
					response.headers["Content-Type"] = "text/html";
					response.end();
					break;
				}
			}
		};

		function getListener(method, reqURI) {

			var ansParams = {};
			var uriData = reqURI.split('/');

			for (var mapKey in listenerMap[method]) {
				var flag = false;
				var tmpResource = mapKey.split('/');

				if (tmpResource.length !== uriData.length) {
					ansParams = {};
					console.log("length -NOT EQUALS!");
					continue;
				} else {
					for (var resourceIndex in tmpResource) {
						var resourceCurrentElm = tmpResource[resourceIndex];
						var uriCurrentElm = uriData[resourceIndex];

						if (uriCurrentElm.length !== 0 && resourceCurrentElm.charAt(0) !== ':') {
							if (resourceCurrentElm === uriCurrentElm) {
								console.log(uriCurrentElm + " -EQUALS!");
								continue;
							} else {
								console.log(uriCurrentElm + " and " + resourceCurrentElm + "-NOT EQUALS");
								ansParams = {};
								flag = true;
								break;
							}
						} else if (uriCurrentElm.length !== 0 && resourceCurrentElm.charAt(0) === ':') {
							ansParams[resourceCurrentElm.substring(1, resourceCurrentElm.length)] = uriCurrentElm;
							console.log("OK -EQUALS!");
							continue;
						}
					}
					if (flag) {
						continue;
					}
					return {
						"resource": mapKey,
						"params": ansParams
					};
				}
			}

			return undefined;
		}
		//  /photos/:first/xxx/:last  resourceCurrentElm
		//  /photos/dagan/ttt/sandler     uriCurrentElm


		function contentHelper(request) {
			// console.log("rrr:"+request.headers['Accept'])
			var accArr = (request.headers['Accept']);
			if (accArr === undefined) {
				return "text/html";
			}

			accArr = accArr.split(/[,;]/);
			
			for(var index in accArr) {
				if(settings.CONTENT_TYPES[accArr[index]] !== undefined) {
					return accArr[index];
				}
			}
		}

		function onTcpConnection(socket) {

			console.log("new connection");
			var lastRequest = new Date();
			setTimeout(keepAlive(socket), settings.LAST_REQUEST_TIMEOUT_SEC * 1000);
			socket.on('data', function(dat) {
				if (!shuttingDown) {
					lastRequest = new Date();
					var request = parseRequest(dat.toString());
					if (request !== {}) {
						activeRequests++;
						totalRequests++;
						
						eventEmitter.emit('onRequest', socket, request);
				
						//routeRequest(socket, request);
						acceptedRequests++;
						/*console.log(dat.toString());
                    console.log(request);*/
					}
					//activeRequests--;

					if (shuttingDown && activeRequests === 0) {
						console.log('shuttingDown from onTcpConnection');
						eventEmitter.emit('shutDown');


					}
				}
			});

			function keepAlive(socket) {
				var ka = function() {
					if ((new Date()
						.getTime() - lastRequest.getTime()) > (settings.LAST_REQUEST_TIMEOUT_SEC * 1000)) {
						console.log("a client connection timed out");
						socket.end();
						socket.destroy();
					} else {
						setTimeout(ka, settings.LAST_REQUEST_TIMEOUT_SEC * 1000);
					}
				}

				return ka;
			}

		}
		
		function Response(socket) {
			this.headers = {};
			var body = "";
			this.status = 200;

			this.write = function(addToBody) {
				body += addToBody;
			}

			this.end = function(addToBody) {
				//set content length and send response
				if (addToBody !== undefined) {
					body += addToBody;
				}
				this.body = body;
				this.headers["Content-Length"] = this.body.length;
				eventEmitter.emit('onResponse', this, socket);
			}
		}

		function sendResponse(res, socket) {
			socket.write(settings.HTTPVERSION + " " + settings.STATUSCODES[res.status] + settings.CRLF);
			for(var header in res.headers) {
				socket.write(header + ":" + res.headers[header] + settings.CRLF);
			}
			socket.write(settings.CRLF);
			socket.write(res.body);
			activeRequests--;
		}

		this.onStart = function(callback) {
			eventEmitter.on('start', callback);
		}

		this.start = function(p) {
			server.listen(p, "127.0.0.1");
			eventEmitter.once('shutDown', closeServer);
			startedDate = new Date();
			isStarted = true;
			port = p;

			//support user callback when starting listening
			eventEmitter.emit('start');

			console.log("Server has started.");
		};

		this.stop = function() {
			shuttingDown = true;
			if (activeRequests === 0) {
				console.log('shuttingDown from this.stop');
				eventEmitter.emit('shutDown');
			}
		};

		function closeServer() {
			server.close();
			console.log(activeRequests);
			isStarted = false;
			port = undefined;
			startedDate = undefined;
			activeRequests = 0;
			acceptedRequests = 0;
			totalRequests = 0;

			console.log("Server has stopped.");
		}

		this.status = status;

		this.get = assignGetHandler;

		this.post = assignPostHandler;
	};

	return new ServerInstance();
}

exports.createHTTPServer = createHTTPServer;

/* below is the http parser from exercise 3 */

function HttpRequest(method, uri, resource, resPath, headers, body) { /*This is an Object representation of a HttpRequest*/
	/*It is simply a container with all the fields being public members*/
	this.method = method;
	this.uri = uri;
	this.resource = resource;
	this.resPath = resPath;
	this.headers = headers;
	this.body = body;
}

function parseRequest(requestString) {
	var method;
	var uri;
	var resource;
	var resPath;
	var headers;
	var body;

	if (requestString === undefined || !(typeof requestString === "string")) {
		return new Object();
	}

	/*extract the request line*/
	var reqLineEnd = requestString.indexOf("\r\n");
	if (reqLineEnd === -1) {
		return new Object();
	}
	var requestLine = requestString.substring(0, reqLineEnd);

	/*extract the request line content*/
	var requestLineArray = requestLine.split(/[ ]+/);
	if (requestLineArray.length !== 3) {
		return new Object();
	} /*get the method from the requets line*/
	method = requestLineArray[0];
	/*	if(method !== 'GET' && method !== 'POST') {
		return new Object();
	}*/
	/*get the uri/resource*/
	uri = requestLineArray[1];
	resource = uri.substring(uri.lastIndexOf("/") + 1);
	resPath = uri.substring(0, uri.lastIndexOf("/") + 1);

	/*extract the headers*/
	var headersEnd = requestString.indexOf("\r\n\r\n");
	if (headersEnd === -1) {
		return new Object();
	}
	var headersArray = requestString.substring(reqLineEnd + 2, headersEnd)
		.split("\r\n");
	headers = {}; /*loop on all the headers to extract them*/
	for (var h in headersArray) {
		var hPair = headersArray[h].split(/[ ]*:[ ]*(.+)?/, 2);
		if (hPair.length != 2 || hPair[0] === "" || hPair[0] === undefined) {
			return new Object();
		}
		headers[hPair[0]] = hPair[1];
	}

	/*get the body*/
	body = requestString.substring(headersEnd + 4);

	/*if we didn't return at some point the request was parsed,
        and we can safely construct the object and return it*/
	return new HttpRequest(method, uri, resource, resPath, headers, body);
}

function getStatusHtml(stats) {
	var ret = '<html><link rel="stylesheet" type="text/css" href="status.css" /><table><tr><th>Property</th><th>Value</th></tr>';
	for (var prop in stats) {
		ret += "<tr><td>" + prop + "</td><td>" + stats[prop] + "</td></tr>";
	}
	ret += "</table><html>";
	return ret;
}
