//hello world
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
