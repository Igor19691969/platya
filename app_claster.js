//require('newrelic');
/**
 * Module dependencies
 */
var numCPUs = require('os').cpus().length;
var cluster = require('cluster');
var express = require('express');





if (cluster.isMaster) {
    console.log (' Fork %s worker(s) from master', numCPUs);
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('online', function(worker) {
        console.log ('worker is running on %s pid', worker.process.pid);
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker with %s is closed', worker.process.pid );
    });
} else if (cluster.isWorker) {

    var mongoose=require('mongoose'),
        fs = require('fs'),
        routes = require('./routes'),
        api = require('./routes/api'),
        http = require('http'),
        index = require('./lib/controllers/index'),
        path = require('path');


    var chatRoom=[];

    var app = module.exports = express();
    var server = require('http').createServer(app);
    var io = require('socket.io').listen(server);


    io.set('log level', 1);

    app.set('port', process.env.PORT || 8800);
    process.env.NODE_ENV = app.get('env') || 'development';
//console.log(process.env.NODE_ENV );

// Application Config
    var config = require('./lib/config/config');
    var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
    var modelsPath = path.join(__dirname, 'lib/models');
    fs.readdirSync(modelsPath).forEach(function (file) {
        require(modelsPath + '/' + file);
    });

// Passport Configuration
    require('./lib/config/passport')();

// Express settings
    require('./lib/config/express')(app);

    var Order = require('./lib/controllers/order'),
        order = new Order(chatRoom);

// Routing
    app.get('*', function(req, res) {
        console.log('cluser ' + cluster.worker.process.pid + ' responded \n');
    });

    var routerDescribe = express.Router();
    routerDescribe.use(function(req, res, next) {
        // log each request to the console
        console.log(req.method, req.url);
        // continue doing what we were doing and go to the route
        next();
    });
    routerDescribe.param('id', function(req, res, next, name) {
        // do validation on name here
        // blah blah validation
        // log something so we know its working
        console.log('doing name validations on ' + name);

        // once validation is done save the new item in the req
        req.name = name;
        // go to the next thing
        next();
    });

    require('./lib/routesDescribe')(routerDescribe);
    app.use('/api/describe', routerDescribe);


    var routerOrder = express.Router();
    routerOrder.use(function(req, res, next) {
        // log each request to the console
        //console.log(req.method, req.url);
        // continue doing what we were doing and go to the route
        next();
    });
    require('./lib/routesOrder')(routerOrder,order);
    app.use('/api/order', routerOrder);


    var routerUser = express.Router();
    require('./lib/routesUser')(routerUser);
    app.use('/api/users', routerUser);


    var router = express.Router();
    require('./lib/routes')(router,order);
    app.use('/', router);




// Socket.io Communication
    io.sockets.countSocket=[];
    Socket=require('./lib/controllers/socket');
    socket= new Socket(chatRoom,io.sockets.countSocket);
    io.sockets.on('connection',socket.connect);



    console.log('worker (%s) is now listening to http://localhost:%s', cluster.worker.process.pid, app.get('port'));
    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });








}



//app.use(logger("default"));

/*

*/
/*
var logfile = fs.createWriteStream('./logfile.log', {flags: 'a'});
app.use(logger("default",{"format": "default",
    "stream": logfile}));
*/

/**
 * Configuration
 */

//app.set('port',  8800);
// all environments



// development only
/*if (app.get('env') === 'development') {
  //app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
    console.log('asdasd');
};*/


//process.env.NODE_ENV = process.env.NODE_ENV || 'development';




/**
 * Start Server
 */

