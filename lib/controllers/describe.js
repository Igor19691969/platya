'use strict';
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');
var im = require('imagemagick');
var ObjectId = require('mongoose').Types.ObjectId;
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    nodemailer = require("nodemailer"),
    _ = require("underscore"),
    Describe = mongoose.model('Describe');

var path = "../../data/config.json";
var  config = require(path);


/**
 * Get awesome things
 */


exports.list= function(req, res) {
    //console.log('describe');
    var page = (req.query['page'] > 0 ? req.query['page'] : 0);
    var perPage = 100;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }

    if (req.query.perPage && parseInt(req.query.perPage)>0){
        options.perPage= parseInt(req.query.perPage);
        //console.log(options.perPage);
    }
    //console.log(options);

    Describe.list(options, function(err, describe) {
        //console.log(describe);
            if (err)  return res.json(err);
                Describe.count().exec(function (err, count) {
                    describe.unshift({'index':count});
                    return res.json(describe)
                })

        })



}


exports.get= function(req, res) {
    Describe.load(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })
}




exports.add= function(req, res) {
    console.log(req.body);
    //req.body.filters=JSON.stringify(req.body.filters);
    //console.log(req.body.filters);
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    var stuff = new Describe(req.body);

    var upsertData = stuff.toObject();
    console.log(upsertData);
    delete upsertData._id;
    Describe.update({_id: stuff.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

exports.updateGallery = function(req, res) {
    Stat.findById(req.body._id,function(err,stuff){
        if (err) {
            console.log(err);
            res.send(null, 500);
        } else if (stuff){
            stuff.gallery=req.body.gallery;
            stuff.save(function(err){
                if (err) {
                    console.log(err);
                    res.send(null, 500);
                } else {
                    // send the records
                    res.send(stuff);
                }
            });
            // stop here, otherwise 404
        } else {
        // send 404 not found
        res.send(null, 404);
        }
    })
}

exports.delete = function(req,res){
    var describe;
    async.series([
        function(callback){
            Describe.findById(req.params.id,function(err,result){
                if (err)
                    callback(err);
                else{
                    describe = result;
                    //console.log(cake);return;
                    callback(null);
                }
            })
        },
        function(callback){
           callback(null)
        }
    ], function (err, results) {
            var folder =  './app/images/describe/' + req.params.id;
            if (fs.existsSync(folder)) {
                rimraf(folder, function(error) {console.log(error);});
                console.log('Yes')
            }
            else
                console.log('no');
            describe.remove(function (err) {
                if (err)
                    res.json(err)
                else
                    res.json({});
            })

        })
    /*Cakes.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })*/

}


exports.deleteFile = function(req,res){
    var describe;
    async.series([
        function(callback){
            Describe.findById(req.params.id,function(err,result){
                if (err)
                    callback(err);
                else{
                    describe = result;
                    //console.log(cake);return;
                    callback(null);
                }
            })
        },
        function(callback){
            callback(null)
        }
    ], function (err, results) {
        var folder =  './app/images/describe/' + req.params.id;
        if (fs.existsSync(folder)) {
            rimraf(folder, function(error) {console.log(error);});
            console.log('Yes')
        }
        else
            console.log('no');
        describe.img='';
        describe.save(function (err) {
            if (err)
                res.json(err)
            else
                res.json({});
        })

    })
}

exports.createFile = function(req,res){
    var describe,
        content='';
    async.series([
        function(callback){
            Describe.load(new ObjectId(req.params.id),function(err,result){
                if (err)
                    callback(err);
                else{
                    describe = result;
                    //console.log(describe);return;
                    callback(null);
                }
            })
        },
        function(callback){

            content +='<html><head>' +
                /*'<link rel="stylesheet" href="http://jadone.biz/bower_components/bootstrap/dist/css/bootstrap.min.css"></head><body>' +*/
                '<div  style="width: 500px; margin: 0 auto; background-image: url(http://jadone.biz//img/background/bg-content5.jpg); color: #ccc; padding: 20px;" >';
            content +='<div  style="width: 500px; background-color: #fff; text-align: center;"> ';
            content +='<img src="http://jadone.biz//img/background/brand5.jpg" style="width: 280px; margin-bottom: 10px;">';
            content +='</div>';
            content +='<div  style="width: 500px; background-image: url(http://jadone.biz//img/background/bg-content5.jpg)"> ';
            content +='<h3 style="text-align: center; color: #fff;">'+describe.name+'</h3>';

            content +='<a href="http://localhost:8800>">' +
                '<img style="width: 500px;" src="http://jadone.biz/'+describe.img+'"></a>';
            content +='<p style="text-align: justify">'+describe.desc+'</p>';

            for (var i= 0,l=describe.stuffs.length;i<l;i++){
                describe.stuffs[i].gallery= _(describe.stuffs[i].gallery).sortBy(function(obj) { return +obj.index });
                content +='<div style="width: 145px; margin: 10px; float: left;">';
                content +='<a href="http://jadone.biz/ru/stuff/category/'+describe.stuffs[i].category+'/stuffdetail/'+describe.stuffs[i]._id+'/'+describe.stuffs[i].gallery[0].tag+'">' +
                    '<img style="width: 145px;" src="http://jadone.biz/'+describe.stuffs[i].gallery[0].thumb+'"></a>';
                content +='<h4 style="text-align: center; color: #b00058;">'+describe.stuffs[i].name[config.DL]+'</h4>';
                content +='</div>';
            }
            //http://localhost:8800/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a2c33989ed366e72bf893d/5367e30c1b72646400c29903
            content +='<div style="clear: both;"></div>';
            content +='<p  style="width: 500px; text-align: justify">Вы можете посмотреть все  модели из <a href="" style="color: #B00058;">НОВОЙ КОЛЛЕКЦИИ</a>.</p>';

            content +='<p  style="width: 500px; text-align: justify">Если Вы не хотите получать информацию о новых коллекциях Jadone Fashion, то отписаться от рассылки можно, нажав ' +
                '<a href="" style="color: #B00058;">ЗДЕСЬ</a>.</p>';
            content +='<p style="width: 500px; text-align: justify">Если Вы не можете авторизоваться на сайте jadone.biz со своим паролем, то попробуйте использовать пароль 123456 ' +
                '.</p>';

            content +='</div></div></body></html>'

            callback(null)
        },
        function(callback){

            callback(null)
        }
    ], function (err, results) {
        fs.writeFile('./app/describe/'+req.params.id+'.html', content, function (err,resfile) {
            if (err) return console.log(err);

            return res.json({});
        });

    })
}


exports.fileUpload = function(req, res){
    var stuff;
    setTimeout(
        function () {
            console.log(req.files);
            res.setHeader('Content-Type', 'text/html');
            if (!req.files || req.files.length == 0 || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() });
            else {
                //удаление файла есле есть
                var file = req.files.file;
                var tmp_path = req.files.file.path;
                // set where the file should actually exists - in this case it is in the "images" directory

                var folder =  './app/images/describe/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/describe/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        Describe.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                stuff = result;
                                callback(null);
                            }
                        })

                    },
                    function(callback){
                        if (!fs.existsSync(folder)) {
                            fs.mkdir(folder, function(error) {
                                if (error)
                                    callback(error);
                                else
                                    callback(null);
                            });
                        } else
                            callback(null);
                    },
                    function(callback){
                        fs.rename(tmp_path, target_path, function(err) {
                            if (err)
                                callback(err);
                            im.resize({
                                srcPath: target_path,
                                dstPath: target_path,
                                width:   1170
                            }, function(err, stdout, stderr){
                                if (err)
                                    callback(err);
                                else
                                    callback(null);
                            });

                        });

                    },
                    function(callback){
                        if (stuff.img ){
                            fs.unlink('./app'+stuff.img, function (err) {
                                if (err)
                                    console.log(err)
                                else{
                                    console.log('successfully deleted '+stuff.img);
                                }
                                callback(null);
                            });
                        } else
                            callback(null);

                    },
                    function(callback){
                        stuff.img=target_pathQ;
                        stuff.save(function(err) {
                            if (err) { callback(err); }
                            else callback(null)
                        });
                   }
                ], function (err, results) {
                    if (err)
                        res.json(err);
                    else
                        res.json(results);
                })
            }
        },
        (req.param('delay', 'yes') == 'yes') ? 200 : -1
    );

}

/*for (var i= 0,l=users.length;i<l;i++){
 ii++;
 if (users[i].role=='admin'){
 console.log(users[i]);
 }
 }*/
exports.sendDescribe = function(req,res,next){
    var describe,
        content='';
    var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Mailgun",
        auth: {
            user: "postmaster@jadone.biz",
            pass: "73o6okae8971"
        }
    });
    async.series([
        function(callback){
            Describe.load(new ObjectId(req.params.id),function(err,result){
                if (err)
                    callback(err);
                else{
                    describe = result;
                    //console.log(describe);return;
                    callback(null);
                }
            })
        },
        function(callback){

            content +='<html><head>' +
                /*'<link rel="stylesheet" href="http://jadone.biz/bower_components/bootstrap/dist/css/bootstrap.min.css"></head><body>' +*/
                '<div  style="width: 500px; margin: 0 auto; background-image: url(http://jadone.biz//img/background/bg-content5.jpg); color: #ccc; padding: 20px;" >';
            content +='<div  style="width: 500px; background-color: #fff; text-align: center;"> ';
            content +='<img src="http://jadone.biz//img/background/brand5.jpg" style="width: 280px; margin-bottom: 10px;">';
            content +='</div>';
            content +='<div  style="width: 500px; background-image: url(http://jadone.biz//img/background/bg-content5.jpg)"> ';
            content +='<h3 style="text-align: center;  color: #fff;">'+describe.name+'</h3>';

            content +='<a href="http://jadone.biz">' +
                '<img style="width: 500px;" src="http://jadone.biz/'+describe.img+'"></a>';
            content +='<p style="text-align: justify">'+describe.desc+'</p>';

            for (var i= 0,l=describe.stuffs.length;i<l;i++){
                describe.stuffs[i].galler=_(describe.stuffs[i].gallery).sortBy(function(obj) { return +obj.index });
                //tempArr[i].gallery=_(tempArr[i].gallery).sortBy(function(obj) { return +obj.index });
                content +='<div style="width: 145px; margin: 10px; float: left;">';
                content +='<a href="http://jadone.biz/ru/stuff/category/'+describe.stuffs[i].category+'/stuffdetail/'+describe.stuffs[i]._id+'/'+describe.stuffs[i].gallery[0].tag+'">' +
                    '<img style="width: 145px;" src="http://jadone.biz/'+describe.stuffs[i].gallery[0].thumb+'"></a>';
                content +='<h4 style="text-align: center; color: #B00058;">'+describe.stuffs[i].name[config.DL]+'</h4>';
                content +='</div>';
            }
            //http://localhost:8800/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a2c33989ed366e72bf893d/5367e30c1b72646400c29903
            content +='<div style="clear: both;"></div>';
            content +='<p  style="width: 500px; text-align: justify">Вы можете посмотреть все модели из <a href="http://jadone.biz/ru/stuffsale?sale=new" style="color: #B00058;"> НОВОЙ КОЛЛЕКЦИИ</a>.</p>';

            content +='<p  style="width: 500px; text-align: justify">Если Вы не хотите получать информацию о новых коллекциях Jadone Fashion, то отписаться от рассылки можно, нажав ';

                callback(null)
        },
        function(callback){
            User.find(function(err,users){
                var ii=0;
                if(err) callback(err);

                var mailOptions = {
                    from: "noreplay ✔ <noreplay@jadone.biz>", // sender address
                    subject: "subsribe ✔"
                }

                async.eachSeries(users, function( user, cb) {
                    //ii++;
                    console.log(ii);
                    mailOptions.html =content+

                    '<a style="color: #B00058;" href="http://jadone.biz/api/describe/cancel/'+user._id+'">ЗДЕСЬ</a>.</p>'+
                    '<p class="col-lg-12" style="text-align: justify">Если Вы не можете авторизоваться на сайте jadone.biz со своим паролем, то попробуйте использовать пароль 123456.</p>'+
                    '</div></div></div></body></html>';


                    /*user.subscribe=true;
                    user.save();*/
                    if (user.subscribe){
                        //if (user.role=='admin'){
                            //console.log(user);
                            mailOptions.to=user.email;
                            smtpTransport.sendMail(mailOptions, function(error, response){
                                if(error){
                                    cb(error);
                                }else{
                                    cb(null);
                                }
                            });
                        /*} else {
                            cb(null);
                        }*/
                    } else {
                        cb(null);
                    }
                }, function(err){
                        callback(null,ii);
                });
            })
        }
  ], function (err, results) {
        smtpTransport.close();
        /*console.log('hello');
        console.log(err);*/
        if (err) return next(err);
        return res.json({q:results[2]});


    })
}

exports.cancelSubscribe = function(req,res){
    User.findById(new ObjectId(req.params.id)).exec(function(err,user){
        //console.log(user);
        user.subscribe=false;
        user.save();

        res.writeHead(200, {'Content-Type': 'text/html','charset':'utf-8'});
        res.write('<html><head><meta charset="utf8"></head><body><h4>Вы успешно отменили подписку.</h4></body></html>');
        res.end();
    });


}





