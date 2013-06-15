var http = require('http');
var myHttp = require("./myHttp");
var server = myHttp.createHTTPServer("./public");
server.start(8888);

/*test test test*/


/* --- Interesting function-1 --- */
server.get("/test1/:first/:last", function(req, res) {
	for (var key in req.params) {
		console.log(key + ":" + req.params[key]);
	}

	res.write("Hello Dear Grader " + req.params.first + " " + req.params.last);
	res.end();
});

/* --- Interesting function-2 --- */
server.get("/test1", function(req, res) {
	res.write("Hello Grader, This is the most intresting function ever! Have a nice day");
	res.end();
});

/* --- Interesting function-3 - AJAX --- */
server.get("/test/:num", function(req, res) {
	switch (req.params.num) {
	case 'one':
		{
			res.write("This is ajax one");
			res.end();
			break;
		}
	case 'two':
		{
			res.write("This is ajax two");
			res.end();
			break;
		}
	case 'three':
		{
			res.write("This is ajax three");
			res.end();
			break;
		}
	default:
		{
			res.status=404;
			res.end("Sorry, no such test: " + req.params.num);
			break;
		}
	}
});


//setTimeout(requestStatus, 5000);
setTimeout(function() {
	server.stop();
}, 10000000);

