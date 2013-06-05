var net = require('net');
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
     
        function onTcpConnection(socket) {
            var lastRequest = new Date();
            setTimeout(keepAlive(socket), settings.LAST_REQUEST_TIMEOUT_SEC*1000);
            socket.on('data', function(dat){
                lastRequest = new Date();
                activeRequests++;
                totalRequests++;
                var request = parseRequest(dat.toString());
                if(request !== {}) {
                    switch(request.method) {
                        case 'GET': {
                            socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 0\r\n\r\n");
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
        
        this.status = function() {
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