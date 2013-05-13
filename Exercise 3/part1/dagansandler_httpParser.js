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

var testGeneralStructure = function(requestString) {
	/*this method should test the general structure of the string
		using a simple regex.*/
	return false;
};

var getHeaders = function(headersString) {
	/*this method should return the headers as a key value mapping*/
};

function parseRequest(requestString) {
	var method;
	var uri;
	var resource;
	var resPath;
	var headers;
	var body;
	
	if(testGeneralStructure(requestString)) {
		var requestArray = reuest.split("\r\n");
		var requestLine = requestArray[0];
		var requestLineArray = requestLine.split(" ");
		if(requestLineArray.length !== 3) {
			break;
		}
		method = requestLineArray[0];
		if(method !== 'GET' && method !== 'POST') {
			break;
		}
		uri = requestLineArray[1];
		resource = uri.substring(uri.lastIndexOf("/"));
		resPath = uri.substring(0, uri.lastIndexOf("/"));
		headersString = requestArray[1];
		headers = getHeaders(headersString);
		if(requestArray[2] !== ')') {
			break;
		}
		body = requestArray[3];
		
		
		/*if we didn't return at some point the request was parsed*/
		return new HttpRequest(method, uri, resource, resPath, headers, body);
	}
	return new Object();

}




