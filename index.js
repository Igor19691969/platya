'use strict';

var express = require('express'),


    http = require('http'),
    index = require('./lib/controllers/index'),
    path = require('path');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.set('port', process.env.PORT || 8800);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
/*app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);*/

// redirect all others to the index (HTML5 history)
app.get('/', index.index);
app.get('/partials/:name', index.partials);
app.get('*', index.index);

// Socket.io Communication
io.set('transports', [
    'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
]);
io.sockets.on('connection', require('./lib/controllers/socket'));

/**
 * Start Server
 */

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

return;

/*var express = require('express');


   *//* http = require('http'),
    path = require('path');*//*

var app  = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

*//*var express = require('express'),
    path = require('path'),
    fs = require('fs'),*//*

    var mongoose = require('mongoose'),
    fs = require('fs');
server.listen(3000);
io.sockets.on('connection',function(socket){console.log('sdsd');});
return;*/


/*

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    app=express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose=require('mongoose');
    */
/*Socket = require('./lib/controllers/socket');

var socket = new Socket(io);*//*


*/
/*server.listen(3000);
io.sockets.on('connection',function(socket){console.log('sdsd');});

return;*//*


var phantomExpress = require("phantom-express");

*/
/**
 * Main application file
 *//*


// Default node environment to development

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Connect to database

var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

// Populate empty DB with sample data
//require('./lib/config/dummydata');

// Passport Configuration
require('./lib/config/passport')();

*/
/*var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);*//*


var optionsphantom = {
    // Currently the middleware caches the response from the
    // phantomjs process in the memory. The parameter defines
    // TTL in seconds. If 0 is passed the cache will be ignored.
    cacheLifetime: 3600,

    // Dump status to the console or not
    verbose: false,

    // Prepends the string to the pretty generated hash
    // ex. if '!' is defined ->  #!/home/page
    hashPrepend: '!'
}
app.use(phantomExpress(optionsphantom));


// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

io.sockets.on('connection',require('./lib/controllers/socket'));


// Start server
server.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});
//io.sockets.on('connection',function(socket){connsole.log('sss');});
//io.sockets.on('connection', require('./lib/controllers/socket'));
// Expose app
exports = module.exports = app;*/
