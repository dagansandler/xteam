var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var queryString = require('querystring');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('open db');
});


//Define the Email Object for mongo
var EmailsSchema = mongoose.Schema({
    from: String,
    to: String,
    sentDate: String,
    subject: String,
    body: String,
    isRead: String
});
//Define the User Object for mongo
var UsersSchema = mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    age: Number,
    received_emails: [String],
    sent_emails:[String]

});

var User = mongoose.model('User', UsersSchema);
var Email = mongoose.model('Email', EmailsSchema);


var http = require('http');
var fs = require('fs');
var events = require('events');
var server = http.createServer(requestHandler);
var socket = require('socket.io').listen(server),
    _ = require('underscore')._,
    Backbone = require('backbone'),
    uuid = require('node-uuid');

uuidSocket = {};

//Define the Socket.io connection event and add the username to the uuidSocket object
socket.sockets.on('connection', function (socket) {
    var tmpUUID = queryString.parse(socket.handshake.headers.cookie).uuid;
    console.log('From SocketIO:' + tmpUUID);
    rc.get(tmpUUID, function(err, value){

        if (err){
            console.log('ERROR:' + err);
        }
        else if (value) {
            uuidSocket[value] = socket;
        }
        else if(!value){
            console.log('No UUID found!');
        }

    });
    //Emit got_email to the client side
    socket.emit('got_email', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });


});

//redis definition
var redis = require("redis"),
    rc = redis.createClient();
//If an error occur, print to screen the error
rc.on("error", function (err) {
    console.log("Error " + err);
});
//root folder
var root = 'Public';
var TTL = 6000;
var incomeUUID;


function requestHandler(request, response) {

    //route GET/POST/DELETE requests
    switch (request.method) {
        case 'GET':
            getHandler(request, response);
            break;

        case 'POST':
            postHandler(request, response);
            break;

        case 'DELETE':
            deleteHandeler(request, response);
            break;

        default:
            console.log('UNHANDLE REQUEST:' + request.method);
            break;
    }

}
server.listen(8080);//listen to port 8080

function getHandler(request, response) {
    console.log(request.url);

    //If the user asked form his received emails
    if(request.url === '/emails'){
        incomeUUID = getUUIDFromGetRequest(request);
        console.log(incomeUUID);
        console.log('Client request for EMAILS');
        getEmailsHelper(request, response);
    }
    //If the user asked for file
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

                            response.write(data);
                            response.end();
                            console.log("Serving file " + request.url + " to client");
                        });
                    } else { /*is directory*/
                        response.write("Can not access directories");
                        response.end();
                    }
                });
            } else { /*file not found*/
                response.end();
            }
        });
    }
}

function postHandler(request, response) {
    var body = '';
    //If the user send some data at the body od the http
    request.on('data', function(data) {
        body += data;
        var parseBody = queryString.parse(body);

        switch (parseBody.action) {
            case 'register':
                console.log('REGISTER!');
                //New user wants to register to the email service, build a new email Object (define above)
                var currentUser = new User({
                    username: parseBody.username,
                    password: parseBody.password,
                    firstname: parseBody.firstname,
                    lastname: parseBody.lastname,
                    age: parseBody.age,
                    received_emails: {},
                    sent_emails: {}

                });
                //Checks whether the same username already exists
                User.findOne({username: parseBody.username}, function(err,obj) {
                    if (!obj) {//User not exists
                        var uuidTMP = startSession(parseBody.username);
                        insertUser(currentUser, response, uuidTMP);
                    }
                    else {//User already exists
                        console.log('The username:' + parseBody.username + ' is aready in the DB');
                        existsUser(parseBody.username, response);
                    }
                });
                break;

            case 'login':
                //An exists user try to sign in to the email service
                console.log('LOGIN!');
                var currentUser = new User({//create temporary user
                    username: parseBody.username,
                    password: parseBody.password
                });
                //Cookie got from user
                var tmpUUID = getUUIDFromGetRequest(request);

                //get the username from the DB
                User.findOne({username: currentUser.username, password: currentUser.password}, function(err,obj) {
                    console.log(obj);
                    if (obj) {
                        //look for the redis server session
                        rc.get(tmpUUID, function(err, value){
                            if(err){
                                console.log('ERROR:'+err);
                            }
                            else if(value){//redis session is OK
                                extendExpiration(tmpUUID)
                                loginUserRespond(currentUser, response, tmpUUID);
                            }
                            else if(!value){//no redis session found for this username
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
                break

            case 'sendNewMail':
                //The user sent new eamil
                var tmpUUID = getUUIDFromGetRequest(request);
                //extend the session TTL for the relevant user
                extendExpiration(tmpUUID);
                sendNewEmailHelper(parseBody, response);
                break;

            default:
                console.log('Unhandled Post Request!');
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
        //concatenate the data got from the http DELETE
        body += data;

        var parseDeleteBody = queryString.parse(body);//parse the DELETE request body
        var tmpUUID = getUUIDFromGetRequest(request);
        extendExpiration(tmpUUID);//extend the session TTL for the relevant user
        if(parseDeleteBody._id){//if the emailID is OK
            Email.findOne({_id: mongoose.Types.ObjectId(parseDeleteBody._id)}, function(err, email){
                updateSchemas(err, email, parseDeleteBody);//update the user send/receive emails arrays
            });
        }
        else{//if the emailID is undefine, look for the email by it's values
            Email.findOne({from:parseDeleteBody.from, to:parseDeleteBody.to, sentDate:parseDeleteBody.sentDate, subject:parseDeleteBody.subject, body:parseDeleteBody.body}, function(err, email){
                updateSchemas(err, email, parseDeleteBody);//update the user send/receive emails arrays
            });
        }
    });
}

//Update the Email, Users schemas about the email delete
function updateSchemas(err, email, parseDeleteBody){
    if(err){
        console.log('Error during find:' + err);
    }
    else if (email){//Email found for delete
        email.remove(function(err, email){//Remove the relevant email from the Emails schema
            if(err){
                console.log('Error during remove email' + err);
            }
            else {
                console.log('email deleted:' + email);
            }
        });

        //Update the sender user sent_emails pointers array about the delete
        User.update({'username':email.from}, {$pull: {'sent_emails': email._id.toString()}}, function (err,numAffected,raw){
            if (err) {
                console.log('Error during update user array' + err);
            }
            else {
                console.log('numAffected:' + numAffected);
                console.log('raw:' + raw);

            }

        });
        //Update the receiver user received_emails pointers array about the delete
        User.update({'username':email.to}, {$pull: {'received_emails': email._id.toString()}}, function (err,numAffected,raw){
            if (err) {
                console.log('Error during update user array' + err);
            }
            else {
                console.log('numAffected:' + numAffected);
                console.log('raw:' + raw);
            }
        });
    }
    else if(!email){//No emails found
        console.log("NO EMAIL FOUND!!!!!!!!");
    }
}

//Bad login, send back 403 response to the user
function badUsernameLogin(response){
    console.log('bad :(');
    response.writeHead(403, {"Content-Type": "text/plain"});
    response.write("incorrect password");
    response.end();
}

//insert the user to the users DB, part of the registration
function insertUser (user, response, curUUID){
    user.save(function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            loginUserRespond(user, response, curUUID);
        }
    });
}

//Helper function for extract the UUID from request cookie.
//Return the UUID or undefined
function getUUIDFromGetRequest(request){
    var tmpUUID;
    try{
        tmpUUID = queryString.parse(request.headers['cookie']).uuid;
    }catch(err){
        console.log('ERROR:' + err);
    }
    return tmpUUID;

}

//Send back to the user the response include the relevant cookie (header)
function loginUserRespond (user, response, curUUID){
    console.log('OK ' + user.username + " Addad :)");
    var cookieToHeader = 'uuid=' + curUUID;
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

//Start new session in redis server
//Generate new uuid and gives TTL
function startSession(username) {
    var currentUUID = uuid.v1();
    console.log("start session for:" + username + " with UUID:" + currentUUID);
    rc.get(currentUUID, redis.print);
    rc.set(currentUUID, username, redis.print);
    extendExpiration(currentUUID);
    return currentUUID;

}

//Helper function for extends the expiration of a key in the redis server
function extendExpiration(curUUID){
    try{
        rc.expire(curUUID, TTL);
    }catch (err){
        console('An error occur during expire the session');
    }

}
//Get the relevant email for user's GET request
function getEmailsHelper(request, response){
    var tmpUUID = getUUIDFromGetRequest(request);
    if(tmpUUID){
        //extends expiration at the redis server
        extendExpiration(tmpUUID);
        var currentUsername;

        rc.get(tmpUUID, function(err, value) {//figure out if the session has TTL>0
            if (err) {
                console.error("error from redis get:" + err);
                currentUsername = 0;
            }
            else {
                currentUsername = value;
                if(currentUsername){//if the value from the redis server isn't undefined
                    User.findOne({username: currentUsername}, function(err,obj){//look for the user at the Users schema
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
//Really extract the emails for the 'user', and send him back the emails at the response
function extractReceivedMails(user, response){
    var emailsReceivePointersArr = user.received_emails;
    var ans = [];
    if(emailsReceivePointersArr){//if there are any mails to send back to the user
        var emailSize = emailsReceivePointersArr.length;
        var counter = 0;
        emailsReceivePointersArr.forEach(function(emailID){//run over the emails _ids
            //console.log('emailID:' + emailID);
            Email.findOne({_id: emailID}, function(err,emailObject){//find the current email _id at the Emails schema
                if(err){
                    console.log('ERROR:' + err);
                }
                else {
                    ans.push(emailObject);//collect the emails
                    counter++;
                    if (counter === emailSize){//at the last iteration, send back to the user his emails
                        sendBackEmails(ans, response);
                    }
                }
            });

        });

    }
}

//Actually sends the emails to the user
function sendBackEmails(emails, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(JSON.stringify(emails));
    response.end();
}

//New email helper
function sendNewEmailHelper(email, response) {
    var newEmail = new Email({//create new Email Object
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.body,
        sentDate: email.sentDate,
        isRead: 'false'
    });

    //saves the new email at the Emails schema
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

//Update the users helper
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
    //update receiver
    User.update({username:email.to}, {$push: {received_emails: email._id}}, {upsert:false}, function(err, data){
        if(err){
            console.log('failed fo update receiver:' + err);
        }
        //date is the number of row effected
        else if (data === 1){
            var currentReceiverSocket = uuidSocket[email.to];
            if(currentReceiverSocket){//if the socket is not undefined send to his socket the update about the new email arrived
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

//Helper function for send back to the user 400 request 'inalid sender'
function send400BadRequest(response){
    response.writeHead(400, {"Content-Type": "text/plain"});
    response.write("invalid sender");
    response.end();

}