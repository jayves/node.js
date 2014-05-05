http = require "http"
str = "Hello CoffeeScript Again!9"
varname = false

http.createServer (req, res) ->
	res.writeHead 200
	res.write 'First ' if varname?
	res.end str unless false
.listen 4000