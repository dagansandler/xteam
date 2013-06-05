var http = require("http");

function createStaticHTTPServer(rootFolder) {

    function onRequest(request, response) {
        console.log("Request received.");
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("Hello World");
        response.end();
    }

    var serverInstance = function() {        
        var root = rootFolder;
        var isStarted = false;
        var server = http.createServer(onRequest);
    
        this.start = function(port) {
          server.listen(port);
          isStarted = true;
          console.log("Server has started.");
        }
        
        this.stop = function() {
            server.stop();
            console.log("Server has stopped.");
        }
    }
    
    return new serverInstance();
}

exports.createStaticHTTPServer = createStaticHTTPServer;