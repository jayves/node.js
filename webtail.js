var http = require('http');
var spawn = require('child_process').spawn;

http.createServer(function(req, resp) {
	resp.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	
	var tail_child = spawn('tail', ['-f', '/Volumes/Data/Users/jayves/Developer/node.js/system.log']);
	
	req.connection.on('end', function() {
		tail_child.kill();
	});
	
	tail_child.stdout.on('data', function(data) {
		console.log(data.toString());
		resp.write(data);
	});
}).listen(4000);