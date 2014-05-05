// Headers
//
var mailer = require('nodemailer')
var Hapi = require('hapi')
var util = require('util')
var template = require('swig')
var path = require('path')
 
var PORT = process.env.PORT || 18080
var server = new Hapi.Server(PORT)
 
template.init({
   root : path.resolve('./templates')
 , cache: process.env.NODE_ENV === 'production'
})
 
var pages = {
    '/' : 'index.html'
  , '/node' : 'node.html'
  , '/full-stack' : 'full-stack.html'
  , '/open-source' : 'open-source.html'
  , '/databases' : 'databases.html'
  , '/testing-continuous-deployment' : 'testing-continuous-deployment.html'
  , '/web' : 'web.html'
}
 
// If production, compilation of templates once.
if (process.env.NODE_ENV === 'production') {
  for (var k in pages) {
    pages[k] = template.compileFile(pages[k]).render({})
  }
}
 
var emailConfig = {
  service: "Mailgun",
  auth: {
    user: "foo",
    pass: "bar",
  }
}
 
// Send leads to this address
var emailDestination = "hello@example.com"
 
var emailTransport = mailer.createTransport("SMTP", emailConfig)
 
for (var k in pages){
  server.route({
    method : "GET"
    , path: k
    , handler : (function(url){
        return function(r){
          // Regenerate template on each request if NODE_ENV != "production"
          // Nodejitsu sets NODE_ENV="production" by default
          var resp = pages[url]
          if (process.env.NODE_ENV !== 'production') {
            resp = template.compileFile(pages[url]).render({})
          }
          r.reply(resp)
        }
      })(k)
    })
}
 
// Serve static files from `static` dir.
server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
      directory: { path: './static', listing: false, index: true }
  }
})
 
function emailTemplate(opts) {
  var text = "Hi! Hope you are having a great day. "
  text += "Wanted to let you know someone just submitted a contact request on example.com:"
  text += "\n\nname: %s\nphone: %s\nemail: %s\nmessage: %s\n"
  text += "\n\nBest,\n -example.com Website"
  return util.format(text, opts.fullName, opts.phone, opts.email, opts.message)
}
 
// Handler for /api/contact AJAX endpoint
var contact = {
  handler: function (request) {
    var envelope = {
      from: "Example Website <noreply@example.com>",
      to: emailDestination,
      subject: "Example.com Contact",
      text:emailTemplate(request.payload)
    }
    emailTransport.sendMail(envelope)
    request.reply({ status: 'ok', errors: [], result: {}})
  },
  validate: { 
    schema: {
      fullName: Hapi.Types.String().required(),
      phone: Hapi.Types.String().required(),
      email: Hapi.Types.String().email().required(),
      message: Hapi.Types.String(),
    }
  }
}
 
server.route({
  method: 'POST',
  path: '/api/contact',
  config: contact
})
 
server.start()
console.log("Example.com website on http://localhost:%s", PORT)
