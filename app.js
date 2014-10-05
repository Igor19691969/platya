var queryStringToJSON = function (url) {
    if (url === '')
        return '';
    var pairs = (url || location.search).split('&');
    var result = {};
    /*for (var idx in pairs) {
        var pair = pairs[idx].split('=');
        if (!!pair[0])
            result[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || '');
    }*/
    result = pairs.reduce(function(a,b) {
        var pair = b.split("=");
        a[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || '');
        return a;
    },{});
    return result;
}

//require('newrelic');
/**
 * Module dependencies
 */
/*var numCPUs = require('os').cpus().length;
var cluster = require('cluster');*/

var express = require('express'),
    mongoose=require('mongoose'),
    fs = require('fs'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
    index = require('./lib/controllers/index'),
  path = require('path');
    var url=require('url');
//var middleware = require('./middleware');
//var logger = require("morgan");

var chatRoom=[];

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


var phantom = require('node-phantom');


io.set('log level', 1);


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
app.set('port', process.env.PORT || 8808);
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

// crawling

/*app.use(express.query())
app.use(phantomExpress(optionsphantom));*/

/*app.use(function (req, res, next) {
    console.log(req.url);
    if ('/robots.txt' == req.url) {
        //console.log('sdssdsd');
        res.type('text/plain')
        res.send("User-agent: *\nDisallow: /");
    } else {
        next();
    }
});*/

app.use(function(req, res, next) {
    if(typeof(req.query._escaped_fragment_) !== "undefined") {
        var urlParse = url.parse(req.url);
        var urlQuery=urlParse.query;
        var urlparams =urlParse.pathname;
        //console.log(urlparams);
        var prsUrlparams=urlparams.split('/');
        if (prsUrlparams[2]&& prsUrlparams[5]&& prsUrlparams[2]=='stuff' && prsUrlparams[5]=='stuffdetail'){
            prsUrlparams[3]='category';
            urlparams =prsUrlparams.join('/');
        }
        //console.log(urlparams);

        if (urlparams=='/ru/tovaryi/13/thumbIMG_3919'){ //платье Литиция (синий)
            //console.log('/ru/stuff/section/5364d9c9707981801b25648f/stuffdetail/5368a212a3fe6bdc1fdc09ed/5364db8d707981801b256498');
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367c99e1b72646400c298f8/5367c9d61b72646400c298fb';
        }else if(urlparams=='/ru/tovaryi/100/thumb0L9F3074'){ //туника Ажур (электрик)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07e433a62a3815491ba12/5367c9d61b72646400c298fb';
        }
        else if(urlparams=='/ru/tovaryi/61/thumbIMG_1008'){ //платье Керри (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368c171d00a0d940e2d115f/5364db8d707981801b256498';
        }else if(urlparams=='/ru/tovaryi/122/thumb0L9F3774'){ //сарафан Бриз (розовый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a2806d89ed366e72bf88dc/53a05de23a62a3815491b9cd';
        }else if(urlparams=='/ru/tovaryi/118/thumb0L9F3315'){  //сарафан Кавалли (розовый)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2a7c589ed366e72bf88f6/53a05de23a62a3815491b9cd';
        }

        else if(urlparams=='/ru/tovaryi/90/thumbALX_9261'){//юбка Бриджит (синий)
            urlparams='/ru/stuff/category/539c3462bfb495d70ff7939b/stuffdetail/539c33d2bfb495d70ff7939a/5367c9d61b72646400c298fb';
        }else if(urlparams=='/ru/tovaryi/1/thumbIMG_3702'){ //платье Астория (коралловый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367c7ea1b72646400c298ed/5367e30c1b72646400c29903';
        }

        else if(urlparams=='/ru/tovaryi/62/thumbIMG_1118'){ //платье Фиджи (молочный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368c228d00a0d940e2d1166/5367c9be1b72646400c298f9';
        }
        else if(urlparams=='/ru/tovaryi/101/thumbIMG_9159'){ //платье Dolce&Gabbana (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a05b913a62a3815491b9c2/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/117/thumb0L9F3507'){ //сарафан Флори (коралловый)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2aa0289ed366e72bf88ff/5364dbb2707981801b25649a';
        }
        else if(urlparams=='/ru/tovaryi/113/thumb0L9F3426'){ //сарафан Шанди (красный)

            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3';
        }
        else if(urlparams=='/ru/tovaryi/57/thumbIMG_9377'){ //платье Франческа (электрик)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368b9bcd00a0d940e2d1133/5367c9d61b72646400c298fb';
        }
        else if(urlparams=='/ru/tovaryi/52/thumbIMG_9844'){//платье Валентино (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368a212a3fe6bdc1fdc09ed/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/140/thumb0L9F8683'){ //туника Ажур (сиреневый)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07ac53a62a3815491ba01/5399c88d60a171812bd46c9e';
        }
        else if(urlparams=='/ru/tovaryi/93/thumbALX_8984'){ //платье Перис (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/539c2959103b3b680b0de308/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/117/thumb0L9F3241'){ //сарафан Флори (голубой)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2aa0289ed366e72bf88ff/5368ca99d00a0d940e2d11a6';
        }
        else if(urlparams=='/ru/tovaryi/68/thumbALX_3961'){ //туника Пальмира (чёрный)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/5368c4c2d00a0d940e2d1181/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/56/thumbIMG_9402'){ //платье Мэгги (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368b7bfd00a0d940e2d112f/5364db8d707981801b256498';
        }

        else if(urlparams=='/ru/tovaryi/27/thumbIMG_0025'){ //платье Валенсия (коралловый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367e6301b72646400c29915/5367e30c1b72646400c29903';
        }
        else if(urlparams=='/ru/tovaryi/59/thumbIMG_1179'){ //костюм Винтаж (молочный)
            urlparams='/ru/stuff/category/53a45cb0c9e647221f485349/stuffdetail/5368c04ed00a0d940e2d1153/5367c9be1b72646400c298f9';
        }
        else if(urlparams=='/ru/tovaryi/22/thumbIMG_2885'){ //платье Прада (бежевый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367ea7f1b72646400c29924/5364db9a707981801b256499';
        }
        else if(urlparams=='/ru/tovaryi/99/thumbIMG_8948'){ //туника Ажур (фуксия)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07e433a62a3815491ba12/5368bbc8d00a0d940e2d1136';
        }
        else if(urlparams=='/ru/tovaryi/76/thumbALX_4132'){ //платье Рим (коралл)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/5368ca60d00a0d940e2d11a5/5367e30c1b72646400c29903';
        }
        else if(urlparams=='/ru/tovaryi/95/thumbIMG_9290'){ //платье Chloe (белый)

            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a1325325835e0d6ff25de3/5368c6c1d00a0d940e2d1190';
        }
        else if(urlparams=='/ru/tovaryi/29/thumbIMG_3637'){ //платье Верда (серый)

            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a8169b85c84bfc3340a719/5367c9cb1b72646400c298fa';
        }
        else if(urlparams=='/ru/tovaryi/112/thumb0L9F3397'){ //сарафан Афродита (красный)

            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a060683a62a3815491b9d4/5367e30c1b72646400c29903';
        }
        else if(urlparams=='/ru/tovaryi/8/thumbIMG_0108'){ //кардиган Империя (черный)
            urlparams='/ru/stuff/category/53a806c085c84bfc3340a6e3/stuffdetail/53a8067d85c84bfc3340a6e2/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/75/thumbALX_4112'){ //платье Рим (корица)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/5368ca60d00a0d940e2d11a5/5368c8cbd00a0d940e2d1198';
        }
        else if(urlparams=='/ru/tovaryi/104/thumbALX_0516'){ //сарафан Розалия (красные розы)

            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a14354d27e0adb6febb019/5367e30c1b72646400c29903';
        }
        else if(urlparams=='/ru/tovaryi/96/thumbALX_0568'){ //сарафан Lola (бирюза)

            urlparams= '/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/5367e3371b72646400c29906';
        }

        else if(urlparams=='/ru/tovaryi/10/thumbIMG_3864'){ //кардиган Корона (черный)
            urlparams='/ru/stuff/category/53a806c085c84bfc3340a6e3/stuffdetail/53a80be185c84bfc3340a6ec/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/114/thumb0L9F3556'){ //сарафан Сафари (оранжевый)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a075ba3a62a3815491b9ef/53a073313a62a3815491b9ee';
        }
        else if(urlparams=='/ru/tovaryi/20/thumbIMG_3775'){ //платье Нюша (коралловый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a814cf85c84bfc3340a710/5367e30c1b72646400c29903';
        }
        else if(urlparams=='/ru/tovaryi/96/thumbALX_0443'){ //сарафан Lola (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/539ed01ae3629ebd1ce62c9e/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/103/thumbIMG_8934'){ //платье Ришелье (белый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a1304c0260a82c6b2f15cb/5368c6c1d00a0d940e2d1190';
        }
        else if(urlparams=='/ru/tovaryi/12/thumbIMG_3822'){ //платье Лилия (лиловый)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a80f8285c84bfc3340a6fa/5367e32c1b72646400c29905';
        }

        else if(urlparams=='/ru/tovaryi/19/thumbIMG_3726'){ //платье Нори (черный)
            urlparams='/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367e4b81b72646400c2990e/5364db8d707981801b256498';
        }
        else if(urlparams=='/ru/tovaryi/8/thumbIMG_3866'){ //кардиган Империя (коричневый)
            urlparams='/ru/stuff/category/53a806c085c84bfc3340a6e3/stuffdetail/53a8067d85c84bfc3340a6e2/53a806e485c84bfc3340a6e4';
        }
        else if(urlparams=='/ru/tovaryi/100/thumbIMG_9061'){ //туника Ажур (белый)
            urlparams='/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07ac53a62a3815491ba01/5368c6c1d00a0d940e2d1190';
        }
        else if(urlparams=='/ru/tovaryi/123/thumb0L9F3707'){ //сарафан Фиалка (фиолетовый)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a27f7b89ed366e72bf88d8/5367e32c1b72646400c29905';
        }
        else if(urlparams=='/ru/tovaryi/96/thumbALX_0549'){ //сарафан Lola (салатовый)

            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3';
        }
        else if(urlparams=='/ru/tovaryi/115/thumb0L9F3653'){ //сарафан Мафия (коралловый)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a071193a62a3815491b9e5/5364dbb2707981801b25649a';
        }
        else if(urlparams=='/ru/tovaryi/116/thumb0L9F3204'){ //платье Лагуна (желтый)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2ac9989ed366e72bf8908/5368c8cbd00a0d940e2d1198';
        }
        else if(urlparams=='/ru/tovaryi/52/thumbIMG_9844'){ //платье Валентино (черный)
            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3';
        }
        else if(urlparams=='/ru/tovaryi/135/thumb0L9F8912'){ // сарафан Розалия (бирюзовый)

            urlparams='/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3';
        }
        //console.log(urlparams)



        /*phantom.create(function(err, ph) {
            return ph.createPage(function(err, page) {
                return page.open("http://jadone.biz/" + urlparams, function(status) {
                    return page.evaluate((function() {
                    // We grab the content inside <html> tag...
                        return document.getElementsByTagName('html')[0].innerHTML; }), function(err, result) {
                        // ... and we send it to the client.
                        //console.log(result)
                            res.send(result);
                            return ph.exit();
                    });
                });
            });
        });*/
        var pref= path.join(__dirname,"/snapshots",urlparams);
        var str='';
        //console.log(urlQuery);
        if (urlQuery){
            var qs = queryStringToJSON(urlQuery);
            //console.log(qs);
            for (var key in qs){
                if (key !='_escaped_fragment_'){
                    str +=key+qs[key];
                }
            }


        }
        pref +=str+'.html';


        var date= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        var s = date + ' '+req.url+"\t"+urlparams+"\t"+pref+"\n";
        fs.appendFile('crawling.log',s, function (err, data) {
            if (err) throw error;
        });
        //console.log(pref);
        if(!fs.existsSync(pref)){
            if (urlparams='/'){
                res.sendfile(path.join(__dirname,"/snapshots","/ru/home.html"));
            } else {
                res.sendfile(path.join(__dirname,"/snapshots","/404.html"));
            }

        } else {
            res.sendfile(pref);
        }
   } else {
        next();
    }

});


// Express settings
require('./lib/config/express')(app);



var Order = require('./lib/controllers/order'),
    order = new Order(chatRoom);

// Routing
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
    console.log('уже что-то',req.method, req.url);
    // continue doing what we were doing and go to the route
    next();
});
require('./lib/routesOrder')(routerOrder,order);
app.use('/api/order', routerOrder);


var routerUser = express.Router();
require('./lib/routesUser')(routerUser);
app.use('/api/users', routerUser);

var routerInbox = express.Router();
require('./lib/routesInbox')(routerInbox);
app.use('/api/inbox', routerInbox);

var routerShip = express.Router();
require('./lib/routesShip')(routerShip);
app.use('/api/ship', routerShip);



var router = express.Router();
router.use(function(req, res, next) {
    // log each request to the console
    console.log(req.method, req.url);

    // continue doing what we were doing and go to the route
    next();
});
router.param('sfuff', function(req, res, next, name) {
    // do validation on name here
    // blah blah validation
    // log something so we know its working
    console.log('doing name validations on ' + name);
    // once validation is done save the new item in the req
    //req. =
    // go to the next thing
    next();
});
require('./lib/routes')(router,order);
app.use('/', router);






// Socket.io Communication
io.sockets.countSocket=[];
Socket=require('./lib/controllers/socket');
socket= new Socket(chatRoom,io.sockets.countSocket);
io.sockets.on('connection',socket.connect);



app.use(function(error, req, res, next) {
    // log the error, treat it like a 500 internal server error
    // maybe also log the request so you have more debug information
    //log.error(err, req);

    // during development you may want to print the errors to your console
    //console.log(err.stack);
    var date= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var s = date + ' '+error.stack+"\n";
    fs.appendFile('errors.log',s, function (err, data) {
        if (err) throw error;
    });
    // send back a 500 with a generic message

    res.status(500);
    res.send( {'error': error.message});
});



/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
