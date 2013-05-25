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

	if (requestString === undefined || typeof requestString !== "string") {
		return new Object();
	}

	var reqLineEnd = requestString.indexOf("\r\n");
	
	if (reqLineEnd === -1) {
		return new Object();
	}
	
	var requestLine = requestString.substring(0, reqLineEnd);
	var requestLineArray = requestLine.split(/[ ]+/);
	if(requestLineArray.length !== 3) {
		return new Object();
	}
	
	method = requestLineArray[0];
	if(method !== 'GET' && method !== 'POST') { 
		/*Return an empty object if recieve different methods from GET or POST*/
		return new Object();
	}
	uri = requestLineArray[1];
	resource = uri.substring(uri.lastIndexOf("/") + 1);
	resPath = uri.substring(0, uri.lastIndexOf("/"));

	var headersEnd = requestString.indexOf("\r\n\r\n");
	
	if (headersEnd === -1) {
		return new Object();
	}
	
	var headersArray = requestString.substring(reqLineEnd+2, headersEnd).split("\r\n");
	headers = {};
	for(var h in headersArray) {
		var hPair = headersArray[h].split(/[ ]*:[ ]*(.+)?/, 2);
		if(hPair.length != 2 || hPair[0] === "" || hPair[0] === undefined) {
				return new Object();
		}
		headers[hPair[0]] = hPair[1];
	}

	body = requestString.substring(headersEnd+4);

	/*if we didn't return at some point the request was parsed*/
	return new HttpRequest(method, uri, resource, resPath, headers, body);

}





