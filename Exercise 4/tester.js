var http = require('http');
var myHttp= require("./myHttp");
var server = myHttp.createStaticHTTPServer("./public");
server.start(8888);

/*test test test*/




//setTimeout(requestStatus, 5000);
setTimeout(function(){
    server.stop();
    }, 10000000);
    
function requestStatus() {
    console.log(server.status());
    setTimeout(requestStatus, 5000);
}

