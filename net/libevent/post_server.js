var http = require('http');
http.createServer(function(req, res) {
  req.setEncoding('utf-8');
  var buffer = "";
  req.on('data', function(data) {
    buffer += data;
  });
  req.on('end', function() {
    console.log(buffer);
    res.end('hello world!');
  });
}).listen(1337);
