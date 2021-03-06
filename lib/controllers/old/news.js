'use strict';
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');
var im = require('imagemagick');

var mongoose = require('mongoose'),
    async = require('async')
    ,extend = require('util')._extend
    ,News = mongoose.model('News')
    ,User = mongoose.model('User');


var path = "../../data/config.json";
var  config = require(path);


/**
 * Get awesome things
 */


exports.list= function(req, res) {
    var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
    var perPage = (config.perPage)?config.perPageNews:20;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }

    if (req.query.perPage && parseInt(req.query.perPage)>0){
        options.perPage= parseInt(req.query.perPage);
        //console.log(options.perPage);
    }

    /*var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page)-1:0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1
    var perPage = 400;
    var options = {
        perPage: perPage,
        page: page
    }*/
    if (req.query.main=='main'){
        News.find()
            .populate('author','name')
            .select('name img desc0 desc1 author date')
            .sort({'date': -1}) // sort by date
            .limit(2)
            .exec(function(err, news) {
                if (err)  return res.json(err);
                return res.json(news)
            })
    } else {
        News.list(options, function(err, news) {
            if (err)  return res.json(err);
            if (page==0){
                News.count().exec(function (err, count) {
                    if (news.length>0){
                        news.unshift({'index':count});
                        //news[0].index=count;
                    }
                    return res.json(news)
                })
            } else {
                return res.json(news)
            }
        })
    }
}




exports.get= function(req, res) {
    News.load(req.params.id,function (err, result) {
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
    var stuff = new News(req.body);

    var upsertData = stuff.toObject();
    console.log(upsertData);
    delete upsertData._id;
    News.update({_id: stuff.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

exports.updateGallery = function(req, res) {
    News.findById(req.body._id,function(err,stuff){
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
    var stuff;
    async.series([
        function(callback){
            News.findById(req.params.id,function(err,result){
                if (err)
                    callback(err);
                else{
                    stuff = result;
                    //console.log(cake);return;
                    callback(null);
                }
            })
        },
        function(callback){
           callback(null)
        }
    ], function (err, results) {
            var folder =  './app/images/news/' + req.params.id;
            if (fs.existsSync(folder)) {
                rimraf(folder, function(error) {console.log(error);});
                console.log('Yes')
            }
            else
                console.log('no');
            stuff.remove(function (err) {
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

exports.fileUpload = function(req, res){
    var stuff;
    setTimeout(
        function () {
            res.setHeader('Content-Type', 'text/html');
            if (req.files.length == 0 || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() });
            else {
                //удаление файла есле есть
                var file = req.files.file;
                var tmp_path = req.files.file.path;
                // set where the file should actually exists - in this case it is in the "images" directory

                var folder =  './app/images/news/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/news/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        News.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                stuff = result;
                                //console.log(cake);return;
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
                                width:   450
                            }, function(err, stdout, stderr){
                                if (err)
                                    callback(err);
                                else
                                    callback(null);
                            });

                        });

                    },
                    function(callback){
                        //console.log(cake);
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

                    },function(cb){
                        stuff.img=target_pathQ;
                        stuff.save(function(err) {
                            if (err) { cb(err); }
                            else
                                cb(null)

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

exports.fileUploadGallery = function(req, res){
    //console.log(req.body);
    var stuff;
    setTimeout(
        function () {
            //console.log(req.files);
            res.setHeader('Content-Type', 'text/html');
            if (req.files.length == 0 || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() ,file: req.files});
            else {
                var file = req.files.file;
                var tmp_path = req.files.file.path;
                // set where the file should actually exists - in this case it is in the "images" directory

                var folder =  './app/images/news/' + req.body.id;

                var target_path = folder+'/'  + 'img'+ req.files.file.name;
                var thumb_target_path = folder+'/' +'thumb'+ req.files.file.name;

                var target_pathQ = '/images/news/'+ req.body.id+'/' + 'img' +req.files.file.name;
                var thumb_target_pathQ = '/images/news/'+req.body.id+'/'+'thumb'+  req.files.file.name;

                if (!fs.existsSync(folder)) {
                    fs.mkdir(folder, function(error) {
                        //console.log(error);
                        fs.rename(tmp_path, target_path, function(err) {
                            im.resize({
                                srcPath: target_path,
                                dstPath: target_path,
                                width:   1170
                            }, function(err, stdout, stderr){
                                if (err) throw err;
                                im.resize({
                                    srcPath: target_path,
                                    dstPath: thumb_target_path,
                                    width:   540
                                }, function(err, stdout, stderr){
                                    if (err) throw err;
                                    //запись в бv
                                    var index =(req.body.index)?req.body.index:1;
                                    var tag =(req.body.tag)?req.body.tag:null;
                                    var gallery={
                                        thumb:thumb_target_pathQ,
                                        img:  target_pathQ,
                                        tag:tag,
                                        index:index
                                    };
                                    //gallery = JSON.stringify(gallery);
                                    News.findById(req.body.id,function(err,stuff){
                                        if (err) console.log(err);
                                        if(!stuff.gallery) stuff.gallery=[];
                                        stuff.gallery.push(gallery);
                                        stuff.save(function(err) {res.json(err)})
                                    })
                                });
                            });

                        });
                    });
                } else {
                    fs.rename(tmp_path, target_path, function(err) {
                        im.resize({
                            srcPath: target_path,
                            dstPath: target_path,
                            width:   1110
                        }, function(err, stdout, stderr){
                            if (err) throw err;
                            im.resize({
                                srcPath: target_path,
                                dstPath: thumb_target_path,
                                width:   540
                            }, function(err, stdout, stderr){
                                if (err) throw err;
                                //запись в бv
                                var index =(req.body.index)?req.body.index:1;
                                var tag =(req.body.tag)?req.body.tag:null;
                                var gallery={
                                    thumb:thumb_target_pathQ,
                                    img:  target_pathQ,
                                    tag:tag,
                                    index:index
                                };
                                //gallery = JSON.stringify(gallery);
                                News.findById(req.body.id,function(err,stuff){
                                    if (err) console.log(err);
                                    if(!stuff.gallery) stuff.gallery=[];
                                    stuff.gallery.push(gallery);
                                    stuff.save(function(err) {res.json(err)})
                                })
                            });
                        });

                    });
                }

            }
        },
        (req.param('delay', 'yes') == 'yes') ? 200 : -1
    );

}

exports.fileGalleryDelete = function(req, res){

    var id = req.params.id;
    var photo,
        photoId = req.params.index;

    News.findById(id,function(err,stuff){
        if (err) { res.json(err);}
        //console.log(cake);
        if(stuff.gallery) {
            photo = stuff.gallery.id(photoId);
            //console.log(photo);
            var thumbfile = './app'+photo.thumb;
            var imgfile =  './app'+photo.img;

            fs.unlink(thumbfile, function (err) {
                if (err)
                    console.log(err)
                else
                    console.log('successfully deleted '+photo.thumb);
            });
            fs.unlink(imgfile, function (err) {
                if (err)
                    console.log(err)
                else
                    console.log('successfully deleted '+photo.img);
            });
            stuff.gallery.id(photoId).remove();
            stuff.save(function(err) {res.json(err)})
        } else
            res.json({});

    })


}
/*

exports.categories_list= function(req, res) {
    var lang= req.params.lang;
    console.log(lang);

    Category.find().exec(function(error,categories){
        return res.json(categories);
    });

};
*/





