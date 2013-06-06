var net = require('net');
var fs = require('fs');
var settings = require('./settings');

function createStaticHTTPServer(rootFolder) {

    function onRequest(request, response) {
        console.log("Request received.");
        console.log(typeof request);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("Hello World\n");
        response.end();
    }
    
    var ServerInstance = function() {
        var root = rootFolder;
        var isStarted = false;
        var server = net.createServer(onTcpConnection);
        var port = undefined;
        var startedDate = undefined;
        var activeRequests = 0;
        var acceptedRequests = 0;
        var totalRequests = 0;
        
        function status() {
            var requestSuccessRate;
            if (totalRequests === 0) {
                requestSuccessRate = 100;
            } else {
                requestSuccessRate = (acceptedRequests * 100)/totalRequests;
            }
            return {
                isStarted: isStarted,
                startedDate: startedDate,
                port: port,
                numOfCurrentRequests: activeRequests,
                precntageOfSuccesfulRequests: requestSuccessRate
            };
        };
     
        function routeRequest(socket, request) {
            switch(request.method) {
                case 'GET': {
                    if(request.uri === '/status') {
                        var stats = status();
                        var statsPage = getStatusHtml(stats);
                        socket.write("HTTP/1.1 200 OK\r\n");
                        socket.write("Content-Type: text/html\r\nContent-Length: " + statsPage.length +"\r\n\r\n");
                        socket.write(statsPage);
                    } else {
                        fs.exists(root + request.uri, function(exists) {
                            if(exists) {
                                /*file is there*/
                                fs.lstat(root + request.uri, function(err, stats) {
                                    if(err) {
                                        console.log("found err");
                                        throw err;
                                    }
                                    if(stats.isFile()) {
                                        /*is file*/
                                        fs.readFile(root + request.uri, function(err, data) {
                                            if(err) {
                                                console.log("error on file read: " + request.uri);
                                                console.log(err);
                                            }
                                            console.log("Serving file " + request.uri + " to client");
                                            socket.write("HTTP/1.1 200 OK\r\n");
                                            socket.write("Content-Type: text/html\r\nContent-Length: " + data.toString().length +"\r\n\r\n");
                                            socket.write(data.toString());
                                        });
                                    } else {
                                        /*is directory*/
                                        
                                    }
                                });
                            } else {
                                /*file not found*/
                                socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\nContent-Length: 26\r\n\r\n<b>404 File not found!</b>");
                            }
                        });
                    }
                    break;
                }
                case 'POST': {
                
                    break;
                }
                default: {
                    /*the request type is not supported*/
                    socket.write("HTTP/1.1 405 Method Not Allowed\r\nAllow: GET,POST\r\nContent-Type: text/html\r\nContent-Length: 0\r\n\r\n");
                    break;
                }
            }
        };
     
        function onTcpConnection(socket) {
            console.log("new connection");
            var lastRequest = new Date();
            setTimeout(keepAlive(socket), settings.LAST_REQUEST_TIMEOUT_SEC*1000);
            socket.on('data', function(dat){
                lastRequest = new Date();
                activeRequests++;
                totalRequests++;
                var request = parseRequest(dat.toString());
                if(request !== {}) {
                    routeRequest(socket, request);
                    acceptedRequests++;
                    /*console.log(dat.toString());
                    console.log(request);*/
                }
                activeRequests--;
            });
            
            function keepAlive(socket) {
                var ka = function() {
                    if((new Date().getTime() - lastRequest.getTime()) > (settings.LAST_REQUEST_TIMEOUT_SEC*1000)) {
                        console.log("a client connection timed out");
                        socket.end();
                    } else {
                        setTimeout(ka,settings.LAST_REQUEST_TIMEOUT_SEC*1000);
                    }
                }
                
                return ka;
            }
        }   
        
        this.start = function(p) {        
          server.listen(p, "127.0.0.1");
          startedDate = new Date();
          isStarted = true;
          port = p;

          console.log("Server has started.");
        };
        
        this.stop = function() {
            server.close();
            isStarted = false;
            port = undefined;
            startedDate = undefined;
            activeRequests = 0;
            acceptedRequests = 0;
            totalRequests = 0;
            console.log("Server has stopped.");
        };
        
        this.status = status;
    };
    
    return new ServerInstance();
}

exports.createStaticHTTPServer = createStaticHTTPServer;

/* below is the http parser from exercise 3 */
function HttpRequest(method, uri, resource, resPath, headers, body) {
	/*This is an Object representation of a HttpRequest*/
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
	if(requestLineArray.length !== 3) {
		return new Object();
	}
    /*get the method from the requets line*/
	method = requestLineArray[0];
/*	if(method !== 'GET' && method !== 'POST') {
		return new Object();
	}*/
    /*get the uri/resource*/
	uri = requestLineArray[1];
	resource = uri.substring(uri.lastIndexOf("/") + 1);
	resPath = uri.substring(0, uri.lastIndexOf("/")+1);
	
    /*extract the headers*/
	var headersEnd = requestString.indexOf("\r\n\r\n");
    if (headersEnd === -1) {
		return new Object();
	}
	var headersArray = requestString.substring(reqLineEnd+2, headersEnd).split("\r\n");
	headers = {};
    /*loop on all the headers to extract them*/
	for(var h in headersArray) {
		var hPair = headersArray[h].split(/[ ]*:[ ]*(.+)?/, 2);
		if(hPair.length != 2 || hPair[0] === "" || hPair[0] === undefined) {
			return new Object();
		}
		headers[hPair[0]] = hPair[1];
	}
	
    /*get the body*/
	body = requestString.substring(headersEnd+4);
	
	/*if we didn't return at some point the request was parsed,
        and we can safely construct the object and return it*/
	return new HttpRequest(method, uri, resource, resPath, headers, body);
}

function getStatusHtml(stats) {
    var ret = '<html><link rel="stylesheet" type="text/css" href="status.css" /><table><tr><th>Property</th><th>Value</th></tr>';
    for(var prop in stats) {
        ret += "<tr><td>" + prop + "</td><td>" + stats[prop] + "</td></tr>";
    }
    ret += "</table><html>";
    return ret;
}