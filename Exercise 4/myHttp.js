/*
* Require necessary modules to use with this http server module
*/
var net = require('net');
var fs = require('fs');
var settings = require('./settings');
var events = require('events');

/* Constructor for the server*/
var ServerInstance = function(rootFolder) {

    /* Initialize an event emitter for this server*/
    var eventEmitter = new events.EventEmitter();
    /*local server variables*/
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
    
    /*register default server events*/
    eventEmitter.on('onResponse', sendResponse);
    eventEmitter.on('onRequest', routeRequest);
    assignGetHandler('/status', onStatusRequest);

    function onStatusRequest(req, res) {
        /*this function handles requests for /status resource*/
        var stats = status();
        var statsPage = getStatusHtml(stats);
        res.headers["Content-Type"] = "text/html";
        res.write(statsPage);
        res.end();
    }

    function status() {
        /*this function returns an object representation of the server status*/
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
        /*assign a handlers for an HTTP request with method and resource. callback will be invoked upon request*/
        listenerMap[method][resource] = callback;

        /*events are inserted with the method at start
         to allow different callbacks on same resources with different URIs*/
        eventEmitter.removeAllListeners(resource);
        eventEmitter.on(method + resource, callback);
    }

    function routeRequest(socket, request) {
        if (request.uri.indexOf("..") !== -1) {
            /*don't allow moving up the path, might be malicious action*/
            console.log('Request include ".."');
            return;
        }
        
        var listener = getListener(request.method, request.uri);
        
        if (listener !== undefined) {
            /*found a user listener. add params to request and invoke user response*/
            request.params = listener.params;
            eventEmitter.emit(request.method + listener.resource, request, new Response(socket));
            return;
        }

        /*default behavior - no user listener was found*/
        var content_type = contentHelper(request);
        switch (request.method) {
        case 'GET':
            {
                fs.exists(root + request.uri, function(exists) {
                    if (exists) { /*file is there*/
                        fs.lstat(root + request.uri, function(err, stats) {
                            if (err) {
                                console.log("found err: " + err);
                                throw err;
                            }
                            if (stats.isFile()) { /*is file*/
                                fs.readFile(root + request.uri, function(err, data) {
                                    if (err) {
                                        console.log("error on file read: " + request.uri);
                                        console.log(err);
                                    }
                                    var response = new Response(socket);
                                    response.headers["Connection"] = "Keep-Alive";
                                    response.headers["Content-Type"] = content_type;
                                    response.write(data.toString());
                                    response.end();
                                    console.log("Serving file " + request.uri + " to client");
                                });
                            } else { /*is directory*/
                                var response = new Response(socket);
                                response.headers["Content-Type"] = "text/html";
                                response.write("Can not access directories");
                                response.end();
                            }
                        });
                    } else { /*file not found*/
                        var response = new Response(socket);
                        response.status = 404;
                        response.headers["Content-Type"] = "text/html";
                        response.write("<b>404 Not Found</b>");
                        response.end();
                    }
                });
                break;
            }
        case 'POST':
            {
                console.log("got post request");
                var response = new Response(socket);
                response.headers["Content-Type"] = "text/html";
                response.end();
                break;
            }
        default:
            { /*the request type is not supported*/
                var response = new Response(socket);
                response.status = 405;
                response.headers["Allow"] = "GET,POST";
                response.headers["Content-Type"] = "text/html";
                response.end();
                break;
            }
        }
    };

    function getListener(method, reqURI) {
        /* 
         * returns an object with the listener pattern and the params of the pattern. 
         * returns undefined if no listener for URI is found
         */
        var ansParams = {};
        var uriData = reqURI.split('/');
        for (var mapKey in listenerMap[method]) {
            var flag = false;
            var tmpResource = mapKey.split('/');

            if (tmpResource.length !== uriData.length) {
                ansParams = {};
                /*console.log("length -NOT EQUALS!");*/
                continue;
            } else {
                for (var resourceIndex in tmpResource) {
                    var resourceCurrentElm = tmpResource[resourceIndex];
                    var uriCurrentElm = uriData[resourceIndex];

                    if (uriCurrentElm.length !== 0 && resourceCurrentElm.charAt(0) !== ':') {
                        if (resourceCurrentElm === uriCurrentElm) {
                            /*console.log(uriCurrentElm + " -EQUALS!");*/
                            continue;
                        } else {
                            /*console.log(uriCurrentElm + " and " + resourceCurrentElm + "-NOT EQUALS");*/
                            ansParams = {};
                            flag = true;
                            break;
                        }
                    } else if (uriCurrentElm.length === 0) {
                        continue;
                    } else if (resourceCurrentElm.charAt(0) === ':') {
                        ansParams[resourceCurrentElm.substring(1, resourceCurrentElm.length)] = uriCurrentElm;
                        /*console.log("OK -EQUALS!");*/
                        continue;
                    }
                    flag = true;
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

    function contentHelper(request) {
        /*return the first content-type matching allowed content-types*/
        var accArr = (request.headers['Accept']);
        if (accArr === undefined) {
            return "text/html";
        }
        accArr = accArr.split(/[,;]/);
        for (var index in accArr) {
            if (settings.CONTENT_TYPES[accArr[index]] !== undefined) {
                return accArr[index];
            }
        }
    }

    function onTcpConnection(socket) {

        console.log("New Tcp connection opened");
        var lastRequest = new Date();
        var buf = "";

        setTimeout(keepAlive(socket), settings.LAST_REQUEST_TIMEOUT_SEC * 1000);
        socket.on('data', function(dat) {
            if (!shuttingDown) {
                lastRequest = new Date();
                var request = parseRequest(dat.toString());
                totalRequests++;
                if (request !== {}) {
                    activeRequests++;
                    eventEmitter.emit('onRequest', socket, request);
                    acceptedRequests++;
                }
            }
        });

        function keepAlive(socket) {
            /*keep socket alive - as long as new data came in during the last 2 seconds*/
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
        /*response constructor*/
        this.headers = { "Content-Type" : "text/html" };
        var body = "";
        this.status = 200;
        var responseSent = false;

        this.write = function(addToBody) {
            body += addToBody;
        }

        this.end = function(addToBody) {
            if (!responseSent) {
                responseSent = true; /*don't allow the user to send a response twice*/
                /*set content length and send response*/
                if (addToBody !== undefined) {
                    body += addToBody;
                }
                this.body = body;
                this.headers["Content-Length"] = this.body.length;
                eventEmitter.emit('onResponse', this, socket);
            }
        }

        function reqTimeOut() {
            /*on request time out - send a 408 to client and kill the user's response*/
            if (!responseSent) {
                var r = new Response(socket);
                responseSent = true;
                r.status = 408;
                r.headers["Content-Type"] = "text/html";
                r.write("Request Timed Out");
                r.end();
            }
        }
        setTimeout(reqTimeOut, 1000);
    }

    function sendResponse(res, socket) {
        /*send response to socket.*/
        try {
            socket.write(settings.HTTPVERSION + " " + settings.STATUSCODES[res.status] + settings.CRLF);
            for (var header in res.headers) {
                socket.write(header + ":" + res.headers[header] + settings.CRLF);
            }
            socket.write(settings.CRLF);
            socket.write(res.body);
        } catch (err) {
            console.log("sendResponse error: " + err);
        }
        activeRequests--;
        if (shuttingDown && activeRequests === 0) {
            /*console.log('shuttingDown from onTcpConnection');*/
            eventEmitter.emit('shutDown');
        }
    }

    function closeServer() {
        server.close();
        isStarted = false;
        port = undefined;
        startedDate = undefined;
        activeRequests = 0;
        acceptedRequests = 0;
        totalRequests = 0;

        console.log("Server has stopped.");
    }

    /*expose public members of server*/
    this.onStart = function(callback) {
        eventEmitter.on('start', callback);
    }
    this.start = function(p) {
        server.listen(p, "127.0.0.1");
        eventEmitter.once('shutDown', closeServer);
        startedDate = new Date();
        isStarted = true;
        port = p;
        /*invoke user callback when starting listening (only after we initialized everything*/
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
    this.status = status;
    this.get = assignGetHandler;
    this.post = assignPostHandler;
};

/* Method to create an http server. this is the only exported method of this module */
function createHTTPServer(rootFolder) {
    /*return a new server instance*/
	return new ServerInstance(rootFolder);
}

/*export module method*/
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
    /*return an html template for the server stats*/
	var ret = '<html><link rel="stylesheet" type="text/css" href="status.css" /><table><tr><th>Property</th><th>Value</th></tr>';
	for (var prop in stats) {
		ret += "<tr><td>" + prop + "</td><td>" + stats[prop] + "</td></tr>";
	}
	ret += "</table><html>";
	return ret;
}
