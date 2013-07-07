var http = require('http');
var fs = require('fs');
var events = require('events');
var server = http.createServer(requestHandler);
var socket = require('socket.io').listen(server),
	_ = require('underscore')._,
	Backbone = require('backbone'),
	redis = require('redis'),
	rc = redis.createClient(),
	models = require('./Models/models');
	
	var root = 'Public';

function requestHandler(request, response) {

	//route get/post requests
	switch (request.method) {
	case 'GET':
		getHandler(request, response);
		break;

	case 'POST':
		postHandler(request, response);
		break;

	default:
		break;

	}

}

server.listen(8080);


function getHandler(request, response) {
	console.log('GET');
	console.log(request.url);
	//
     fs.exists(root + request.url, function(exists) {
         if (exists) { /*file is there*/
             fs.lstat(root + request.url, function(err, stats) {
                 if (err) {
                     console.log("found err: " + err);
                     throw err;
                 }
                 if (stats.isFile()) { /*is file*/
                     fs.readFile(root + request.url, function(err, data) {
                         if (err) {
                             console.log("error on file read: " + request.url);
                             console.log(err);
                         }
                         //response.headers["Connection"] = "Keep-Alive";
                         //response.headers["Content-Type"] = content_type;
                         response.write(data.toString());
                         response.end();
                         console.log("Serving file " + request.url + " to client");
                     });
                 } else { /*is directory*/
                     //response.headers["Content-Type"] = "text/html";
                     response.write("Can not access directories");
                     response.end();
                 }
             });
         } else { /*file not found*/
             //response.status = 404;
             //response.headers["Content-Type"] = "text/html";
             response.write("<b>404 Not Found</b>");
             response.end();
         }
     });
	//
	
	
}

function postHandler(request, response) {
	console.log("POST");
	console.log(request.url);
	var body = '';
	request.on('data', function(data) {
		body += data;
		console.log("Partial body: " + body);
	});
	response.on('end', function() {
		console.log("Body: " + body);

		
	});
}
