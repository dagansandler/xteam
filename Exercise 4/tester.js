var http = require('http');
var myHttp = require("./myHttp");
var server = myHttp.createHTTPServer("./public");
server.start(8888);

/*test test test*/

server.get('/status/ds', function(req, res) {
	res.headers["Content-Type"] = "text/html";
	res.headers["fake"] = "fakeheader";
	res.status = 404;
	res.write("custom status message");
	res.end();
});


//setTimeout(requestStatus, 5000);
setTimeout(function() {
	server.stop();
}, 10000);

var isErr = false;
setTimeout(requestStatus, 10);


function requestStatus() {
	var options = {
		hostname: 'localhost',
		port: 8888,
		path: '/status',
		method: 'GET'
	};

	var req = http.request(options, function(res) {console.log("all good!");});
	req.on('error', function(err) {
		isErr = true;
		console.log('error occure!!!');
	});
	req.end();

	if (!isErr) {
		setTimeout(requestStatus, 10);
	}
}
