'use strict';

var mongoose = require('mongoose'),
    async = require('async'),
    nodemailer = require("nodemailer"),
    categories = require('../../data/categories.json'),
   // Groups = mongoose.model('Groups'),
    Stuff = mongoose.model('Stuff'),
    Category = mongoose.model('Category'),
    News = mongoose.model('News'),
    path=require('path'),
    xml2js = require('xml2js'),
    fs=require('fs');
   var phantom = require('node-phantom');
   // mkdir=require('mkdir'),
   var Inbox =mongoose.model('Inbox');

var http=require('http');

var satelize = require('satelize');

    //Stuff = mongoose.model('Stuff');
//var ip2cc = require('ip2cc');
//var xlsx = require('node-xlsx');
//var excelParser = require('excel-parser');


//var XLS = require('xlsjs');

/**
 * Get awesome things
 */

exports.userOldList=function(req, res) {
    var  config = require('../../users.json');
    return res.json(config);
}

exports.categories_list= function(req, res) {
    return res.json(categories);
};
exports.categories_get= function(req, res) {
    return res.json(categories[parseInt(req.params.id)]);
};


exports.getIP = function (req, res,next) {
    var ip = req.headers['x-real-ip'];
    if (!ip){
        return res.json({country_code: 'UA'});
        //ip='37.57.5.247';
    }
    /*console.log(req.headers['x-real-ip']);
    console.log(req.headers);*/
    //console.log(req.headers['x-forwarded-for'])
    //console.log(req.connection.remoteAddress);
    //var $url="http://ip-api.com/json/"+ip;
    //console.log();




    satelize.satelize({ip:ip}, function(err, geoData) {
        // process err
        if (err) return next(err)
        // if data is JSON, we may wrap it in js object

        try{
            var obj = JSON.parse(geoData);
        } catch(e){
            return next(e)
        }


        //console.log('obj - %s',geoData);
        // if used with expressjs
        //console.log(obj);
        res.json(obj);

        // res.json...
    });






    /*var SatelizeMy = function(options, nextS) {
        var path = (options.ip ? ('/'+options.ip) : '') + (options.JSONP ? serviceJSONP : '');
        var opts = {
            hostname: 'http://ip-api.com',
            path: '/json' + path,
            method: 'GET',
            port: 80
        };
        var reqS = http.request(opts, function(resS) {
            resS.setEncoding('utf8');
            var output = '';
            resS.on('data', function (chunk) { output += chunk; });
            resS.on('end', function() { return nextS(null, output); });
        });
        reqS.on('error', function(e) { return nextS(e); });
        reqS.setTimeout(1000, function() { return next(new Error('timeout')); });
        reqS.end();
        return this;
    };
    SatelizeMy({ip:ip},function(err,response){
        console.log(err);
        console.log(response);

    });
*/
    //return res.json({'ip':ip});
};



exports.feedback= function(req, res, next) {
    //console.log(req.body);  return;
    var data ={},
        smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Mailgun",
            auth: {
                /*user: "postmaster@sandbox86422.mailgun.org",
                pass: "9zsllp27ndo6"*/
                user: "postmaster@jadone.biz",
                pass: "73o6okae8971"
            }
        });

    var text,name,email;
    text= (req.body.text)?req.body.text.substring(0,1000):'';
    name=(req.body.name)?req.body.name.substring(0,100):'';
    email=(req.body.email)?req.body.email.substring(0,100):'';
    if (!req.body.name || !req.body.email || !req.body.text){
        return next( new Error('не все поля заполнены'))
    }

    var mailOptions = {
        from: "noreplay ✔ <noreplay@zadone.biz>", // sender address
        //to: 'jadoneopt@gmail.com', // list of receivers
        to: 'igorchugurov@gmail.com', // list of receivers
        subject: "feedback ✔", // Subject line
        text:"Cообщение из формы обратной связи."+'\n'+
            "Имя :"+name+'\n'+
            "email :"+email+'\n'+
            "text :"+text// plaintext body
    }
    //console.log(mailOptions);
    data.done = false;
    var item = new Inbox({text:text,email:email,name:name});
    item.save();
    //return res.json({});
    smtpTransport.sendMail(mailOptions, function(error, response){
        smtpTransport.close(); // shut down the connection pool, no more messages
        if(error){
            return next(error);
        }else{
            console.log("Message sent: " + response.message);
            data.done = true;
            res.json(data);
        }


    });
}


exports.siteMAP= function(req, res) {
    var siteMAP='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+"\n";

    async.series([
        function(callback){
            // do some stuff ...
            Stuff.find()
                .populate('gallery.tag', 'name')
                .select('category gallery tags name')
                .sort({index: -1}) // sort by date
                .exec(function(err,stuffs){
                    //console.log("stuffs.length="+stuffs.length);
                    if (err)  return callback(err);
                    for (var i=0,ll=stuffs.length;i<ll;i++){

                        if (stuffs[i].category){
                            var tempGallery=[];
                            for (var j= 0,len=stuffs[i].gallery.length;j<len;j++){
                                //console.log(tempArr[i].gallery[j]);
                                if (tempGallery.length<1 && stuffs[i].gallery[j].tag && stuffs[i].gallery[j].tag._id){
                                    tempGallery[tempGallery.length]=stuffs[i].gallery[j];
                                    var l = stuffs[i].tags.indexOf(stuffs[i].gallery[j].tag._id);

                                    if (l>-1){
                                        stuffs[i].tags.splice(l,1);
                                    }
                                } else{
                                    var is=false;
                                    for (var k=0;k<tempGallery.length;k++){
                                        //if (is) break;
                                        if (stuffs[i].gallery[j].tag && tempGallery[k].tag._id==stuffs[i].gallery[j].tag._id){
                                            is=true;
                                            if(stuffs[i].gallery[j].index<tempGallery[k].index){
                                                tempGallery.splice(k,1);
                                                tempGallery[tempGallery.length]=stuffs[i].gallery[j];
                                                // is=true;
                                            }
                                        }
                                    }
                                    if (!is && stuffs[i].gallery[j].tag) {
                                        tempGallery[tempGallery.length]=stuffs[i].gallery[j];
                                        var l = stuffs[i].tags.indexOf(stuffs[i].gallery[j].tag._id);
                                        //console.log(l);
                                        if (l>-1){
                                            stuffs[i].tags.splice(l,1);
                                        }
                                    }
                                }
                            }
                            for (var j= 0,len=tempGallery.length;j<len;j++){
                                if (stuffs[i]._id && tempGallery[j].tag._id){
                                    siteMAP +="\t"+"<url>"+"\n";
                                    siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/stuff/category/"+stuffs[i].category+"/stuffdetail/"
                                        +stuffs[i]._id+"/"+tempGallery[j].tag._id+"</loc>"+"\n";
                                    siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
                                }

                            }
                        }
                    }
                    callback(null, 'one');

                })


        },
        function(callback){
            //console.log('dddd');
            // do some more stuff ...
            Category.find()
                .sort('index')
                .select('name section')
                .exec(function (err, categories){
                    //console.log('sdsd');
                    if (err)  return callback(err);
                    if(categories[0]){
                        //console.log(categories.length);
                        var section= categories[0]._id;
                        for (var i=0,l=categories.length;i<l;i++){
                           /* console.log(typeof section);
                            console.log(typeof categories[i].section);*/
                            if (categories[0]._id.equals(categories[i].section)){
                                //console.log("section="+section);
                                siteMAP +="\t"+"<url>"+"\n";
                                siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/stuff/category/"+categories[i]._id
                                    +"</loc>"+"\n";
                                siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
                            }
                        }
                    }
                    callback(null, 'three');
                })
        },
        function(callback){
            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz"
                +"</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/home"
                +"</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";

            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/stuffsale"
                +"</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";

            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/stuffsale?sale=new</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";

            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/payment</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";

            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/delivery</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";

            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/aboutus</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";


            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/contacts</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";


            siteMAP +="\t"+"<url>"+"\n";
            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/news"
                +"</loc>"+"\n";
            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
            News.find()
                .sort({'date': -1}) // sort by date
                .select('name')
                .exec(function (err, news){
                    console.log('sdsd'+news.length);
                    if (err)  return callback(err);
                    for (var i=0,l=news.length;i<l;i++){
                        siteMAP +="\t"+"<url>"+"\n";
                        siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/news/newsdetail/"+news[i]._id
                            +"</loc>"+"\n";
                        siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
                        //console.log(i);
                   }
                    siteMAP +="</urlset>";
                    callback(null, 'four');
                })
        },
        function(callback){
            // do some more stuff ...
            callback(null, 'two');
        }
    ],
// optional callback
        function(err, results){
            if (err){
                console.log(err);
                return res.json(err);
            }
            // results is now equal to ['one', 'two']
            fs.writeFile('./app/sitemap.xml',siteMAP , function (err,cfg) {
                if (err) {
                    console.log(err);
                    return res.json(err);
                }

                return res.json({});
            });
        });






};

exports.snapshot= function(req, res,next) {
    //console.log(req.params);

    var url=require('url');
    var parser = new xml2js.Parser();
    var count =0;
    function createOneSnapSot( oneurl, callback) {
        count++;
        console.log(count);
        /*if (url.parse(oneurl.loc[0]).query);
         console.log(url.parse(oneurl.loc[0]));*/
        var urlParse = url.parse(oneurl.loc[0]);


        var patharr = urlParse.pathname.split('/');
        var fullPath = urlParse.path;
        var urlQuery=urlParse.query;

        if (!patharr[0]){
            patharr.splice(0,1);
        }
        if (!patharr[patharr.length-1]){
            patharr.splice(patharr.length-1,1);
        }

        var rootPath = path.normalize(__dirname + '/../..');
        var pref= path.join(rootPath,"/snapshots");


        for (var i= 0,l=patharr.length-1;i<l;i++){
            //pref= path.join(pref,"/snapshot"+patharr[i]);

            pref +='/'+patharr[i];
            if(!fs.existsSync(pref)){
                //console.log(pref);
                fs.mkdirSync(pref, '0766', function(err){
                    if(err){
                        console.log('creating folder - %s',err);

                    }
                });
            }
        }

        var str='';
        if (urlQuery){
            /*console.log(typeof urlQuery);
             console.log(urlQuery);*/
            var arr= urlQuery.split('=');
            str=arr[0]+arr[1];
            //console.log(str);
        }

        if (patharr.length>0){
            pref +='/'+patharr[patharr.length-1]+str+'.html';
            /*if(fs.existsSync(pref)){
                console.log('exist - s%',pref)
                callback();
            } else {*/
                // webkit ***************
                phantom.create(function(err, ph) {
                    return ph.createPage(function(err, page) {
                        return page.open("http://localhost:8800/" + fullPath, function(status) {
                            console.log(status);
                            return page.evaluate((function() {
                                // We grab the content inside <html> tag...
                                return document.getElementsByTagName('html')[0].innerHTML; }), function(err, result) {
                                // ... and we send it to the client.
                                //console.log(result)

                                fs.writeFile(pref, result, function (err) {
                                    if (err) {
                                        callback();
                                        return console.log(err);
                                    }
                                    console.log('сделан номер  = %d',count);
                                    //count++;
                                    callback();
                                });


                                return ph.exit();
                            });
                        });
                    });
                });
                //***********************
           // }


        } else {
            callback();
        }

    }

    if (req.params.stuff && req.params.stuff=='stuff'){
        var id = req.params.id
            ,stuff=req.stuff;


        Stuff.findOne({_id:id})
            .populate('gallery.tag', 'name')
            .select('category gallery tags name')
            .sort({index: -1}) // sort by date
            .exec(function(err,stuff){
                //console.log("stuffs.length="+stuffs.length);
                if (err) return next(err);
                var stuffs=[];
                var i=0;
                stuffs[i]=stuff;
                if (err)  return next(err);
                if (stuffs[i].category){
                    var tempGallery=[];
                    for (var j= 0,len=stuffs[i].gallery.length;j<len;j++){
                        //console.log(tempArr[i].gallery[j]);
                        if (tempGallery.length<1 && stuffs[i].gallery[j].tag && stuffs[i].gallery[j].tag._id){
                            tempGallery[tempGallery.length]=stuffs[i].gallery[j];
                            var l = stuffs[i].tags.indexOf(stuffs[i].gallery[j].tag._id);

                            if (l>-1){
                                stuffs[i].tags.splice(l,1);
                            }
                        } else{
                            var is=false;
                            for (var k=0;k<tempGallery.length;k++){
                                //if (is) break;
                                if (stuffs[i].gallery[j].tag && tempGallery[k].tag._id==stuffs[i].gallery[j].tag._id){
                                    is=true;
                                    if(stuffs[i].gallery[j].index<tempGallery[k].index){
                                        tempGallery.splice(k,1);
                                        tempGallery[tempGallery.length]=stuffs[i].gallery[j];
                                        // is=true;
                                    }
                                }
                            }
                            if (!is && stuffs[i].gallery[j].tag) {
                                tempGallery[tempGallery.length]=stuffs[i].gallery[j];
                                var l = stuffs[i].tags.indexOf(stuffs[i].gallery[j].tag._id);
                                //console.log(l);
                                if (l>-1){
                                    stuffs[i].tags.splice(l,1);
                                }
                            }
                        }
                    }
                    var siteMAP ="<urlset>";
                    for (var j= 0,len=tempGallery.length;j<len;j++){
                        if (stuffs[i]._id && tempGallery[j].tag._id){
                            siteMAP +="\t"+"<url>"+"\n";
                            siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/stuff/category/"+stuffs[i].category+"/stuffdetail/"
                                +stuffs[i]._id+"/"+tempGallery[j].tag._id+"</loc>"+"\n";
                            siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
                        }

                    }
                    siteMAP +="</urlset>";
                    //res.json(siteMAP);
                    parser.parseString(siteMAP, function (err, result) {
                        if (err) next( new Error(err));
                        if (result && result.urlset && result.urlset.url && result.urlset.url.length){
                            var urlset = result.urlset.url;
                            var count =1;
                            async.eachSeries(urlset,createOneSnapSot
                                ,function(err){
                                    res.json([]);
                                    console.log('Done');
                                });
                        }
                    });


                }

            })


    } else if(req.params.stuff && req.params.stuff=='news' && req.params.id) {
        var siteMAP ="<urlset>";
        siteMAP +="\t"+"<url>"+"\n";
        siteMAP +="\t\t"+"<loc>http://jadone.biz/ru/news/newsdetail/"+req.params.id
            +"</loc>"+"\n";
        siteMAP +="\t\t"+"<changefreq>weekly</changefreq>"+"\n"+"\t\t"+"<priority>1.0</priority>"+"\n"+"\t"+"</url>"+"\n";
        //console.log(i);

        siteMAP +="</urlset>";
        parser.parseString(siteMAP, function (err, result) {
            if (err) return next( new Error(err));
            if (result && result.urlset && result.urlset.url && result.urlset.url.length){
                var urlset = result.urlset.url;
                var count =1;
                async.eachSeries(urlset,createOneSnapSot
                    ,function(err){
                        res.json([]);
                        console.log('Done');
                    });
            }
        });

    } else {
        fs.readFile('./app/sitemap.xml', function(err, data) {
            console.log('enter');
            parser.parseString(data, function (err, result) {
                if (err) return next( new Error(err));
                if (result && result.urlset && result.urlset.url && result.urlset.url.length && result.urlset.url.length){
                    var urlset = result.urlset.url;
                    console.log(urlset.length);
                    async.eachSeries(urlset,createOneSnapSot
                        ,function(err){

                            var rootPath = path.normalize(__dirname + '/../..');
                            var pref= path.join(rootPath,"/snapshots/404.html");
                            var content=''
                                +'<html><head></head><body><h1>Page not found</h1></body></html>';
                            fs.writeFile(pref, content, function (err) {
                                res.json({});
                            });
                            console.log('Done');
                        });


                }



            });
        });
    }
    //return res.json([])
//return;



}

