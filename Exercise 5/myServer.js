var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var queryString = require('querystring');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('open db');
});



var EmailsSchema = mongoose.Schema({
    from: String,
    to: String,
    sendDate: String,
    subject: String,
    body: String,
    isRead: String
});

//Users Schema
var UsersSchema = mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    age: Number,
    received_emails: [mongoose.Schema.Types.ObjectId],
    sent_emails:[mongoose.Schema.Types.ObjectId]

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

uuidSocket = {};

socket.sockets.on('connection', function (socket) {
    var tmpUUID = queryString.parse(socket.handshake.headers.cookie).uuid;
    console.log('From SocketIO:' + tmpUUID);
    rc.get(tmpUUID, function(err, value){

        if (err){
            console.log('ERROR:' + err);
        }
        else if (value) {
            uuidSocket[value] = socket;
            // console.log('SocketIO value:' + value);

            console.log('uuidSocket:' + uuidSocket);
        }
        else if(!value){
            console.log('No UUID found!');
        }

    });
    socket.emit('got_email', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });


});

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

        case 'DELETE':
            deleteHandeler(request, response);
        default:
            console.log('UNHANDLE REQUEST:' + request.method);
            break;
    }

}

server.listen(8080);

function getHandler(request, response) {
    console.log(request.url);

    if(request.url === '/emails'){//If the user asked form his emails

        incomeUUID = getUUIDFromGetRequest(request);
        console.log(incomeUUID);
        console.log('Client request for EMAILS');
        getEmailsHelper(request, response);
    }

    else {
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
}

function postHandler(request, response) {
    //console.log(request);
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
                    age: parseBody.age,
                    received_emails: {},
                    sent_emails: {}

                });

                User.findOne({username: parseBody.username}, function(err,obj) {
                    //console.log(obj);
                    if (!obj) {
                        var uuidTMP = startSession(parseBody.username);
                        insertUser(currentUser, response, uuidTMP);
                    }
                    else {
                        console.log('The username:' + parseBody.username + ' is aready in the DB');
                        existsUser(parseBody.username, response);
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
                var tmpUUID = getUUIDFromGetRequest(request);

                //get the username from the DB
                User.findOne({username: currentUser.username, password: currentUser.password}, function(err,obj) {
                    console.log(obj);
                    if (obj) {
                        //is the session from the redis server available?
                        rc.get(tmpUUID, function(err, value){
                            if(err){
                                console.log('ERROR:'+err);
                            }
                            else if(value){//
                                extendExpiration(tmpUUID)
                                loginUserRespond(currentUser, response, tmpUUID);
                            }
                            else if(!value){
                                var uuidTMP = startSession(parseBody.username);
                                loginUserRespond(currentUser, response, uuidTMP);
                            }

                        });
                    }
                    //The username isn't at tne DB
                    //Return 403 response to the user
                    else {
                        badUsernameLogin(response);
                    }
                });

                break;
            case 'sendNewMail':
                var tmpUUID = getUUIDFromGetRequest(request);
                extendExpiration(tmpUUID);
                sendNewEmailHelper(parseBody, response);
                break;
        };
    });
    response.on('end', function() {
        console.log("End_Body: " + body);
    });
}

function deleteHandeler(request, response) {
    var body = '';
    request.on('data', function(data) {
        body += data;
        console.log('GOT IN DELETE:' + body);
        var parseDeleteBody = queryString.parse(body);
        Email.findOne({from:parseDeleteBody.from, to:parseDeleteBody.to, sendDate:parseDeleteBody.sendDate, subject:parseDeleteBody.subject, body:parseDeleteBody}, function(err, email){
            if(err){
                console.log('Error during find:' + err);
            }
            else if (email){
                console.log('EMAIL FOUND TO DELETE:' + email);
                email.remove();
                console.log('going to remove email:' + email);
                User.update({username:email.from}, {$pull: {sent_emails: email._id}}, false, true);
                User.update({username:email.to}, {$pull: {received_emails: email._id}}, false, true);
            }
        });
    });
}

function badUsernameLogin(response){
    console.log('bad :(');
    response.writeHead(403, {"Content-Type": "text/plain"});
    response.write("incorrect password");
    response.end();
}

//insert the user to the users DB
function insertUser (user, response, curUUID){
    console.log("going to insert:" + user.username);

    user.save(function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            loginUserRespond(user, response, curUUID);

        }
    });
}

function getUUIDFromGetRequest(request){
    var tmpUUID;
    try{
        tmpUUID = queryString.parse(request.headers['cookie']).uuid;
        console.log('tmpUUID:' + tmpUUID);
        //return tmpUUID;
    }catch(err){
        console.log('ERROR:' + err);
    }
    return tmpUUID;

}

//Send back to the user the response include the relevant cookie (header)
function loginUserRespond (user, response, curUUID){
    console.log('OK ' + user.username + " Addad :)");
    var cookieToHeader = 'uuid=' + curUUID;
    console.log(cookieToHeader);
    response.writeHead(200, {"Content-Type": "text/plain", "Set-Cookie" : cookieToHeader});
    response.write("user registered");
    response.end();

}


//If the user try to register with an exists username
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

function getEmailsHelper(request, response){
    var tmpUUID = getUUIDFromGetRequest(request);
    if(tmpUUID){
        extendExpiration(tmpUUID);
        var currentUsername;

        rc.get(tmpUUID, function(err, value) {
            if (err) {
                console.error("error from redis get:" + err);
                currentUsername = 0;
            }
            else {

                console.log("Worked: " + value);
                currentUsername = value;
                if(currentUsername){
                    User.findOne({username: currentUsername}, function(err,obj){
                        if(err) {
                            console.error("error from mongo findOne:" + err);
                        }
                        if(obj){
                            console.log('Found obj in DB');
                            extractReceivedMails(obj, response);

                        }
                    });
                }
            }
        });

    }
}

function extractReceivedMails(user, response){

    var emailsReceivePointersArr = user.received_emails;
    console.log('emailsReceivePointersArr' + emailsReceivePointersArr);
    var ans = [];

    if(emailsReceivePointersArr){
        var emailSize = emailsReceivePointersArr.length;
        var counter = 0;

        emailsReceivePointersArr.forEach(function(emailID){
            //console.log('emailID:' + emailID);
            Email.findOne({_id: emailID}, function(err,emailObject){
                if(err){
                    console.log('ERROR:' + err);
                }
                else {
                    //console.log(JSON.stringify(emailObject));
                    ans.push(emailObject);
                    //response.write(JSON.stringify(emailObject));
                    counter++;
                    //console.log(counter);
                    if (counter === emailSize){
                        sendBackEmails(ans, response);
                    }
                }
            });

        });
    }
}

function sendBackEmails(emails, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(JSON.stringify(emails));
    response.end();
}

function sendNewEmailHelper(email, response) {

    var newEmail = new Email({
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.body,
        sendDate: email.sentDate,
        isRead: 'false'
    });

    newEmail.save(function(err, emailSaved) {
        if (err) {
            console.log('Error on saving' + err);
        }
        else {
            console.log('Email Saved:' + emailSaved);
            updateUsersForEmails(emailSaved, response);
        }
    });
}

function updateUsersForEmails(email, response) {
    //update sender
    User.update({username:email.from}, {$push: {sent_emails: email._id}}, {upsert:false}, function(err, data){
        if(err){
            console.log('failed fo update sender:' + err);
        }
        //date is the number of row effected
        else if (data === 1){
            console.log('OK-Update:' + email.from + ' sent_emails array' );
        }
        else if(data === 0){
            console.log('No data updated (sender) send 400 back!')
            send400BadRequest(response);
        }
        else {
            console.log('Update ' + data + ' rows!!!')
        }
    });
    //update reciever
    User.update({username:email.to}, {$push: {received_emails: email._id}}, {upsert:false}, function(err, data){
        if(err){
            console.log('failed fo update receiver:' + err);
        }
        //date is the number of row effected
        else if (data === 1){
            console.log('OK-Update:' + email.to + ' received_emails array' );
            console.log('emailJson:' + email.toJSON);
            console.log('email:' + email);

            var currentReceiverSocket = uuidSocket[email.to];
            console.log('currentReceiverSocket:' + currentReceiverSocket);
            if(currentReceiverSocket){
                currentReceiverSocket.emit('got_email', email);
            }

        }
        else if(data === 0){
            console.log('No data updated (receiver) send 400 back!');
            send400BadRequest(response);
        }
        else {
            console.log('Update ' + data + ' rows!!!')
        }
    });
}



function send400BadRequest(response){
    response.writeHead(400, {"Content-Type": "text/plain"});
    response.write("invalid sender");
    response.end();

}