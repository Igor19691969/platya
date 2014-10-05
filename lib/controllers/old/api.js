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
   // var Inbox =mongoose.model('Inbox');
    //Stuff = mongoose.model('Stuff');
//var ip2cc = require('ip2cc');
//var xlsx = require('node-xlsx');
//var excelParser = require('excel-parser');


//var XLS = require('xlsjs');

/**
 * Get awesome things
 */
/*exports.menuItem = function(req, res) {
    async.series([
        function(callback){
            Groups.find(function (err, result){
                if (err) {
                    console.log(error);
                    callback(err);
                } else {
                    //console.log(result);
                    callback(null,result);
                }
            })
        },
        function(callback){
            Stuff.find(function (err, result){
                if (err) {
                    console.log(error);
                    callback(err);
                } else {
                    //console.log(result);
                    callback(null,result);
                }
            })
        }
    ], function (err, results) {
        //console.log(results);

        if (err)
            return res.json(err);
        else {
            return res.json(results);
        }
    })

//      return res.send(err);
};*/
exports.userOldList=function(req, res) {
    var  config = require('../../users.json');
    return res.json(config);
}




exports.categories_list= function(req, res) {
    return res.json(categories);
};

exports.getIP = function (req, res) {
    var ip = req.headers['x-real-ip'];
    /*console.log(req.headers['x-real-ip']);
    console.log(req.headers);*/
    return res.json({'ip':ip});
};


exports.categories_get= function(req, res) {
    return res.json(categories[parseInt(req.params.id)]);
};
exports.fileUpload = function(req, res){
    //console.log(req.files);return
    if (req.files.length == 0 || req.files.file.size == 0)
          res.send({ msg: 'No file uploaded at ' + new Date().toString() });
    else{
        var tmp_path = req.files.file.path;
        var target_path =  './app/price.pdf';
        fs.rename(tmp_path, target_path, function(err) {
            res.json(err);
        });

        /*fs.readFile(req.files.displayImage.path, function (err, data) {
            // ...Really simple file uploads with Express  http://howtonode.org/really-simple-file-uploads
            var newPath = __dirname + "/uploads/uploadedFileName";
            fs.writeFile(newPath, data, function (err) {
                res.redirect("back");
            });
        });*/


    }


}

exports.fileDownload = function(req, res){
    //res.download('app/price.pdf');
    fs.readFile('app/price.pdf',function(error,data){
     if(error){
     res.json({'status':'error',msg:err});
     }else{
     res.type('application/pdf');
     res.end(data, 'binary');
     //            res.writeHead(200, {"Content-Type": "application/pdf"});
     //            res.write(data);
     //            res.end();
     }
     });

}

exports.feedback111= function(req, res, next) {
    //console.log(req.body);  return;
    var data ={},
        smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Mailgun",
            auth: {
                user: "postmaster@sandbox86422.mailgun.org",
                pass: "9zsllp27ndo6"
            }
        });

    var mailOptions = {
        from: "noreplay ✔ <noreplay@ri.biz>", // sender address
        to: 'igorchugurov@gmail.com', // list of receivers
        //to: 'ri@kture.kharkov.ua', // list of receivers
        subject: "feedback ✔", // Subject line
        text:"Cообщение из формы обратной связи."+'\n'+
            "Имя :"+req.body.name+'\n'+
            "email :"+req.body.email+'\n'+
            "text :"+req.body.text// plaintext body
    }
    //console.log(mailOptions);
    data.done = false;
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
            data.done = true;
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
        res.json(data);
    });
}


exports.parse_xlsx= function(req, res) {
    /*excelParser.worksheets({
        inFile: 'pricedst.xls'
    }, function(err, worksheets){
        if(err) console.error(err);
        return res.json(worksheets);
    });
    xlsx.parse('price.xls',function(err,data){
        console.log(err);
        console.log(data);
    });*/


    /*var xls = XLS.readFile('price.xls');
    return res.json(xls);*/
    var ip = req.headers['x-real-ip'];
    //console.log(ip);
// Download IP database (48 hours for expiration)
    /*if(mIP2CO.dbCSVCheckExp(48)) {
        mIP2CO.dbGet().then(function() {
            console.log('done!');
        }, function(err) {
            console.log(err);
        });
    }*/
// done!

// Search IP addresses
   /* mIP2CO.ipSearch(['37.57.5.247']).then(function(res) {
        console.log(res);
    }, function(err) {
        console.log(err);
    });*/

    /*ip2cc.lookUp('92.0.0.95.255.255', function(ipaddress, country) {
        if (country) {
            console.log(ipaddress+': '+country);
        } else {
            console.log(ipaddress+' not found');
        }
    });*/

    //console.log('IP 174.96.192.67 is located in '+ip2cc.lookUp('174.96.192.67'));


    //console.log(req.connection.remoteAddress);
    //console.log(req.socket.remoteAddress);
    return res.json({'ip':ip});
};


exports.feedback= function(req, res, next) {
    //console.log(req.body);  return;
    var data ={},
        smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Mailgun",
            auth: {
                user: "postmaster@sandbox86422.mailgun.org",
                pass: "9zsllp27ndo6"
            }
        });

    var mailOptions = {
        from: "noreplay ✔ <noreplay@zadone.biz>", // sender address
        to: 'jadoneopt@gmail.com', // list of receivers

        subject: "feedback ✔", // Subject line
        text:"Cообщение из формы обратной связи."+'\n'+
            "Имя :"+req.body.name+'\n'+
            "email :"+req.body.email+'\n'+
            "text :"+req.body.text// plaintext body
    }
    //console.log(mailOptions);
    data.done = false;
    /*var item = new Inbox(req.body);
    item.save();*/
    //res.json({});
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
            data.done = true;
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
        res.json(data);
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

    var url=require('url');
    var parser = new xml2js.Parser();

    fs.readFile('./app/sitemap.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err) return next( new Error(err));
            if (result && result.urlset && result.urlset.url && result.urlset.url.length && result.urlset.url.length){
                var urlset = result.urlset.url;
                var count =1;
                async.eachSeries(urlset,
                    function( oneurl, callback) {
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

                            // webkit ***************
                            phantom.create(function(err, ph) {
                                return ph.createPage(function(err, page) {
                                    return page.open("http://jadone.biz/" + fullPath, function(status) {
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
                                                console.log('count = %d',count);
                                                count++;
                                                callback();
                                            });


                                            return ph.exit();
                                        });
                                    });
                                });
                            });
                            //***********************

                        } else {
                            callback();
                        }

                    } ,function(err){

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

