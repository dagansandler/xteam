/* 
This is the load tester (bonus part):
This file contains a load test. 
First, the we user (the one who uses our extention module) assign to '/loadTest' with call back (see line 18).
After that a server been created for 10 seconds.
Start this point, each 10ms the same request sends to server.
After 10 seconds, the server get a close invokation (server.stop() at line 24),
but activeRequests is still > 0, so the server stop getting new request, finishe his requests left,
and after the active request will be = 0 the server will really stop.
*/
var http = require('http');
var myHttp = require("./myHttp");
var server = myHttp.createHTTPServer("./public");
server.start(8888);

/*test test test*/

server.get('/loadTest', function(req, res) {
	res.end();
});


setTimeout(function() {
	server.stop();
}, 10000);

var isErr = false;
setTimeout(request, 10);


function request() {
	var options = {
		hostname: 'localhost',
		port: 8888,
		path: '/loadTest',
		method: 'GET'
	};

	var req = http.request(options, function(res) {console.log("all good!");});
	req.on('error', function(err) {
		isErr = true;
	});
	req.end();

	if (!isErr) {
		setTimeout(request, 10);
	}
}
