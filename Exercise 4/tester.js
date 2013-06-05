var http= require("./myHttp");
var server = http.createStaticHTTPServer("./public");
server.start(8888);
//setTimeout(requestStatus, 5000);
setTimeout(function(){
    server.stop();
    }, 10000000);
    
function requestStatus() {
    console.log(server.status());
    setTimeout(requestStatus, 5000);
}