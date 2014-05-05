

var Joi = require("joi");
var Nipple = require('nipple');

var helloConfig = {
    handler: function(request, reply) {
		    var names = request.params.name.split("/");
		    server.methods.getColour(request.params.name, function(err, colour) {
		        reply.view("hello",{
		            first: names[0],
		            last: names[1],
		            mood: request.query.mood,
		            age: request.query.age,
		            colour: colour
		        });
		    });
    },
    validate: {
        path: {
            name: Joi.string().min(8).max(100)
        },
        query: {
            mood: Joi.string().valid(["neutral","happy","sad"]).default("neutral"),
			age: Joi.number().integer().min(13).max(100)
        }
    }
};

var options = {
	views: {
	    engines: {
	        jade: "jade"
	    },
	    path: "./views",
	    compileOptions: {
	      // should be set only in dev-context!
	      pretty: true
	    }
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
      Nipple.get('http://data.nasa.gov/api/get_recent_datasets/', function (err, res, payload) {
        reply(err || payload);
      });
  }
});

server.route({
    path: "/hello/{name*2}",
    method: "GET",
	config: helloConfig
});

server.method("getColour", function(name, next) {
    var colours = ["red", "blue", "indigo", "violet", "green"];
    var colour = colours[Math.floor(Math.random() * colours.length)];
    next(null, colour);
}, {
    cache: {
        expiresIn: 30000,
    }
});