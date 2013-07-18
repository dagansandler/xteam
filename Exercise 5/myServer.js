var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	console.log('open db');
});

var UsersSchema = mongoose.Schema({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	age: Number
});
var User = mongoose.model('User', UsersSchema);

var http = require('http');
var fs = require('fs');
var events = require('events');
var server = http.createServer(requestHandler);
var url = require('url');
var socket = require('socket.io').listen(server),
	_ = require('underscore')._,
	Backbone = require('backbone'),
	//redis = require('redis'),
	//rc = redis.createClient(),
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
	var urlContainer = url.parse(request.url, true);
	console.log(urlContainer);
	if(urlContainer.pathname === '/register'){
		console.log(urlContainer.query.username);
		console.log(urlContainer.query.pass);
		
		var currentUser = new User({
			username: urlContainer.query.username,
			password: urlContainer.query.pass,
			firstname: urlContainer.query.firstname,
			lastname: urlContainer.query.lastname,
			age: urlContainer.query.age
		});
		
		currentUser.save(function(err, currentUser) {
			if (err) {
				console.log(err);
			} // TODO handle the error
			else {
				console.log('OK');
				
			}

		});
		response.write('xxx');
		response.end();
	}
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

/*
var kittySchema = mongoose.Schema({
	name: String,
	age: Number
});


kittySchema.methods.speak = function() {
	var greeting = this.name ? "Meow name is " + this.name : "I don't have a name"
	console.log(greeting);
};


var Kitten = mongoose.model('Kitten', kittySchema);

var silence = new Kitten({
	name: 'Silence',
	age: 12
});
console.log(silence.name);
silence.save(function(err, fluffy) {
	if (err) {
		console.log(err);
	} // TODO handle the error
	else {
		console.log('OK');
		silence.speak();
	}

});

var fluffy = new Kitten({
	name: 'fluffy',
	age: 30
});
fluffy.speak(); // "Meow name is fluffy"

fluffy.save(function(err, fluffy) {
	if (err) {
		console.log(err);
	} // TODO handle the error
	else {
		console.log('OK');
		fluffy.speak();
	}

});

Kitten.find(function(err, kittens) {
	if (err) // TODO handle err
	console.log(kittens)
});


Kitten.find({
	name: /^Fluff/
}, function() {
	console.log("ran")
});
*/
