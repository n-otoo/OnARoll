var http = require("http");
var fs = require('fs');

const PORT = process.env.PORT || 8080;

http.createServer(function(request, resp){
    resp.writeHead(200, {
        'Content-Type':'text/html',
        'Access-Control-Allow-Origin':'*'
    });
    var readStream = fs.createReadStream(__dirname + '/index.html');
    readStream.pipe(resp);

    //resp.end("Hello World");
}).listen(PORT);

console.log("Server running on localhost port 8080");