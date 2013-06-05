var http= require("./myHttp");
var server = http.createStaticHTTPServer("./public");
server.start(3008);
setTimeout(function(){
    server.stop();
    },10000000);