var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var queryString = require('querystring');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('open db');
});

//Users Schema
var UsersSchema = mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    age: Number
});

var EmailsSchema = mongoose.Schema({
    from: String,
    to: String,
    date: Date,
    text: String
});
var User = mongoose.model('User', UsersSchema);
var Email = mongoose.model('Email', EmailsSchema);


var http = require('http');
var fs = require('fs');
var events = require('events');
var server = http.createServer(requestHandler);
//var url = require('url');
var socket = require('socket.io').listen(server),
    _ = require('underscore')._,
    Backbone = require('backbone'),
  //  models = require('./Public/Models/models'),
    uuid = require('node-uuid');

//redis
var redis = require("redis"),
    rc = redis.createClient();

rc.on("error", function (err) {
    console.log("Error " + err);
});
//
var root = 'Public';
var TTL = 6000;
var incomeUUID;
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
            console.log('UNHANDLE REQUEST:' + request.method);
            break;

    }

}

server.listen(8080);

function getHandler(request, response) {
//    console.log('GET');
    console.log(request.url);
//    console.log('ZIVVV:' + request.body);

    if(request.url === '/emails'){
        try{
            incomeUUID = queryString.parse(request.headers['cookie']).uuid;
            console.log(incomeUUID);
        }catch(err){
            console.log(err);
        }
        console.log('Client request for EMAILS');
        getEmailsHelper(request, response);
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
                        response.write(data);
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
            //response.write("<b>404 Not Found</b>");
            response.end();
        }
    });
}

function postHandler(request, response) {
//    console.log("POST");
//    console.log(request.url);

    var tmp = {ran: "greenberg"};
    console.log(tmp);
    console.log(tmp.ran);

    //console.log('ZIVVV:'+request.body)
    var body = '';
    request.on('data', function(data) {
        body += data;
        var parseBody = queryString.parse(body);
        console.log("Body: " + body);
        console.log(parseBody.action);
        switch (parseBody.action) {

            case 'register':
                console.log('REGISTER!!!');
                var currentUser = new User({
                    username: parseBody.username,
                    password: parseBody.password,
                    firstname: parseBody.firstname,
                    lastname: parseBody.lastname,
                    age: parseBody.age
                });
                //var myDocument = myCollection.findOne( { username: parseBody.username } );
                User.findOne({username: parseBody.username}, function(err,obj) {
                    console.log(obj);
                    if (!obj) {
                        var uuidTMP = startSession(parseBody.username);
                        insertUser(currentUser, response, uuidTMP);
                    }

                    else {
                        existsUser(parseBody, response);
                    }
                });
                break;

            case 'login':
                console.log('LOGIN!!!');

                console.log(incomeUUID);

                var currentUser = new User({
                    username: parseBody.username,
                    password: parseBody.password
                });

                User.findOne({username: currentUser.username, password: currentUser.password}, function(err,obj) {
                    console.log(obj);
                    if (obj) {
                        var currentUsername = rc.get(incomeUUID);
                        if(currentUsername.length<16){
                            incomeUUID = startSession(parseBody.username);
                        }
                        else{
                            extendExpiration(incomeUUID);
                        }
                        console.log('good :)');
                        rc.expire(incomeUUID, TTL);
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write("OK registered");
                        response.end();
                    }
                    else {
                        console.log('bad :(');
                        response.writeHead(403, {"Content-Type": "text/plain"});
                        response.write("incorrect password");
                        response.end();

                    }
                });

                break;
        };
    });
    response.on('end', function() {
        console.log("End_Body: " + body);
    });
}

function insertUser (user, response, curUUID){
    console.log("going to insert:" + user.username);
    user.save(function(err, currentUser) {
        if (err) {
            console.log(err);
        } // TODO handle the error
        else {
            console.log('OK '+user.username+" Addad :)");
            var cookieToHeader = 'uuid=' + curUUID;
            console.log(cookieToHeader);
            response.writeHead(200, {"Content-Type": "text/plain", "Set-Cookie" : cookieToHeader});
            response.write("user registered");
            response.end();

        }
    });
}

function existsUser(user, response) {

    response.writeHead(403, {"Content-Type": "text/plain"});
    response.write("invalid username:" + user.username + " already exist at db");
    response.end();

}

function startSession(username) {
    var currentUUID = uuid.v1();
    console.log("start session for:" + username + " with UUID:" + currentUUID);
    rc.get(currentUUID, redis.print);
    rc.set(currentUUID, username, redis.print);
    extendExpiration(currentUUID);
    return currentUUID;

}

function extendExpiration(curUUID){
    rc.expire(curUUID, TTL);
}

function getEmailsHelper(request, respond){
    if(incomeUUID.length === 16){
       // console.log(rc.get(currentUUID));
        extendExpiration(incomeUUID);
        var currentUsername = rc.get(incomeUUID);

        console.log(currentUsername);
        User.findOne({username: currentUsername}, function(err,obj){

            if(obj){

                console.log(obj);
            }

        });
    }
}