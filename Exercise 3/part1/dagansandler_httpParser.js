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
	if(testValidHttpRequest(requestString)) {
		
	} else {
		return Object();
	};
}