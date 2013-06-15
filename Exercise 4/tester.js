var http = require('http');
var myHttp = require("./myHttp");
var server = myHttp.createHTTPServer("./public");
server.start(8888);

/*test test test*/


/* -------------------------Interesting function-1 -------------------------------------------------------- 
This interesting test function will test the passing parameters to the call back assign via the URI (as describe at the assignment).

The expected result on screen:
"Hello Dear Grader 'first' 'last'";

Invoke example:
http://localhost:8888/test1/ahmad/tibi
*/
server.get("/test1/:first/:last", function(req, res) {
	for (var key in req.params) {
		console.log(key + ":" + req.params[key]);
	}

	res.write("Hello Dear Grader " + req.params.first + " " + req.params.last);
	res.end();
});

/* -------------------------Interesting function-2 -------------------------------------------------------- 
This interesting test will test an invokation for a uri assign.

The expected result on screen:
"Hello Grader, This is the most intresting function ever! Have a nice day".

Invoke example:
http://localhost:8888/test2

*/

server.get("/test1", function(req, res) {
	res.write("Hello Grader, This is the most intresting function ever! Have a nice day");
	res.end();
});

/* -------------------------Interesting function-3 AJAX -------------------------------------------------------- 
This (is the most) interesting function will test sending an AJAX requset on demand.

The expected result on screen:
 ------    ------    -------   
| One  |  | Two  |  | Three | 
 ------    ------    -------
(if One button is click) This is ajax one
(if Two button is click)This is ajax two
(if Three button is click)This is ajax three
(if Clear is click, it'a clear the screen, just leave the buttons).

Invoke example:
http://localhost:8888/ajaxTest.html

Some compliments on the nice drawing?!

*/
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

setTimeout(function() {
	server.stop();
}, 10000000);

