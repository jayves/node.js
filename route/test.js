
var options = {
	views: {
	    engines: { jade: "jade" },
	    path: __dirname + "/views",
	    compileOptions: { pretty: true }
	}
}


var Hapi = require("hapi");
var server = new Hapi.Server("localhost", 18080, options);



server.start(function() {
    console.log("Hapi server started @ " + server.info.uri);
});

server.route({
    path: "/",
    method: "GET",
	
    handler: function (request, reply) {
        reply.view('test');
      }
});
