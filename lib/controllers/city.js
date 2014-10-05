'use strict';


var request = require('superagent');




var async = require('async'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,


    CityInRegion= new Schema({
        city_id :Number,
        country_id:Number,
        important:String,
        region_id:Number,
        title_ru:String,
        area_ru:String,
        region_ru:String,
        title_ua:String,
        area_ua:String,
        region_ua:String,
        title_be:String,
        area_be:String,
        region_be:String,
        title_en:String,
        area_en:String,
        region_en:String,
        title_es:String,
        area_es:String,
        region_es:String,
        title_pt:String,
        area_pt:String,
        region_pt:String,
        title_de:String,
        area_de:String,
        region_de:String,
        title_fr:String,
        area_fr:String,
        region_fr:String,
        title_it:String,
        area_it:String,
        region_it:String,
        title_pl:String,
        area_pl:String,
        region_pl:String,
        title_ja:String,
        area_ja:String,
        region_ja:String,
        title_lt:String,
        area_lt:String,
        region_lt:String,
        title_lv:String,
        area_lv:String,
        region_lv:String,
        title_cz:String,
        area_cz:String,
        region_cz:String
    });

CityInRegion.index({city_id: 1}, {unique: true});
CityInRegion.index({region_id: 1});
CityInRegion.set('autoIndex', false);

    var City = mongoose.model('City',CityInRegion,'city');

    var Region = mongoose.model('Region');


/**
 * Get awesome things
 */

var CityOneSchema = new Schema({
    region_id:Number,
    cities:[{
        city_id :Number,
        country_id:Number,
        important:String,
        region_id:Number,
        title_ru:String,
        area_ru:String,
        region_ru:String,
        title_ua:String,
        area_ua:String,
        region_ua:String,
        title_be:String,
        area_be:String,
        region_be:String,
        title_en:String,
        area_en:String,
        region_en:String,
        title_es:String,
        area_es:String,
        region_es:String,
        title_pt:String,
        area_pt:String,
        region_pt:String,
        title_de:String,
        area_de:String,
        region_de:String,
        title_fr:String,
        area_fr:String,
        region_fr:String,
        title_it:String,
        area_it:String,
        region_it:String,
        title_pl:String,
        area_pl:String,
        region_pl:String,
        title_ja:String,
        area_ja:String,
        region_ja:String,
        title_lt:String,
        area_lt:String,
        region_lt:String,
        title_lv:String,
        area_lv:String,
        region_lv:String,
        title_cz:String,
        area_cz:String,
        region_cz:String
    }]


});
//CityOneSchema.index({city_id: 1}, {unique: true});
CityOneSchema.index({region_id: 1});
CityOneSchema.set('autoIndex', false);
mongoose.model('CityOneModel', CityOneSchema);
var CityOne = mongoose.model('CityOneModel');

/*CityOneSchema.index({city_id: 1}, {unique: true});
 CityOneSchema.index({region_id: 1}, {unique: true});
 CityOneSchema.set('autoIndex', false);*/

/*var trunsform = function(){

    var stream = City.find().stream();

    stream.on('data', function (document) {
        console.log(document);
        *//*for(var key in document){
            console.log(key);
        }
        return;*//*
        var doc=document.toJSON;
        console.log(doc);
       // do something with the mongoose document
        if (doc.region_id){
            console.log('result[i].region_id -'+result[i].region_id);
            var region;
            async.series([
                function(callback){
                    // do some stuff ...
                    CityInRegion.findOne({region_id:parseInt(doc.region_id)}).exec(function (err, reg){
                        if (reg) {
                            region=reg;
                        } else {
                            console.log(doc.region_id);
                            region=new CityInRegion({region_id:doc.region_id});
                        }
                        callback(null, 'one');
                    });

                },
                function(callback){
                    region.cities[region.cities.length]=result[i];
                    region.save();
                    callback(null, 'two');
                }
            ],

                function(err, results){
                    // results is now equal to ['one', 'two']
                });
        }



    }).on('error', function (err) {
            // handle the error
            console.log(err);
        }).on('close', function () {
            // the stream is closed
            console.log('end');
        });

}*/

exports.list= function(req, res,next) {
    var id =parseInt(req.query.id);
    var country_id =parseInt(req.query.country_id);
    var date1=(new Date).getTime();
    var cityOne=[];
    async.series([
        function(callback){
            var path= '/method/database.getCities?v=5.5&country_id=' +country_id+
                '&region_id=' +id+
                '&offset=0&need_all=0&count=1000&lang=en';
            console.log(path);
            request
                .get('http://api.vk.com'+path)
                //.use(nocache) // Prevents caching of *only* this request
                .end(function(res){
                    if (res.body && res.body.response && res.body.response.items){

                        var count = res.body.response.count;

                        //var result=JSON.parse(res.text);
                        //var cc = result.response.items;
                        //console.log(res.body.response.items);
                        var cc = res.body.response.items;
                        //var title = "title_"+req.query.lang;
                        for (var i= 0,l=cc.length;i<l;i++){
                            //console.log(i);
                            cityOne[cityOne.length]={city_id:cc[i].id,title:cc[i]['title']}
                        }
                        count -=1000;
                        var j=0;
                        var fooStack=[];
                        while (count>0){
                            j++;
                            count -=1000;
                            fooStack[fooStack.length]=j;
                        }
                        if  (fooStack.length>0) {
                            async.eachSeries(fooStack,function(item, cb) {
                                path= '/method/database.getCities?v=5.5&country_id=' +country_id+
                                    '&region_id=' +id+
                                    '&offset=' +item*1000+
                                    '&need_all=0&count=1000';

                                //console.log(path);
                                request
                                    .get('http://api.vk.com'+path)
                                    //.use(nocache) // Prevents caching of *only* this request
                                    .end(function(res){
                                        var cc = res.body.response.items;
                                        for (var i= 0,l=cc.length;i<l;i++){
                                            cityOne[cityOne.length]={city_id:cc[i].id,title:cc[i]['title']}
                                        }
                                        cb(null);
                                    })
                            }, function(err, data) {
                                callback(null, 'one');
                            });
                        }   else {
                            callback(null, 'one');
                        }

                    }else {
                        res.json(res);
                    }

                    // Do something
                });
            /*var options = {
                host: 'http://api.vk.com',
                path: '/method/database.getCities?v=5.5&country_id=1&region_id=1045244&offset=0&need_all=1&count=1000'
            };

            var req = http.get(options, function(res) {
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));

                // Buffer the body entirely for processing as a whole.
                var bodyChunks = [];
                res.on('data', function(chunk) {
                    // You can process streamed parts here...
                    bodyChunks.push(chunk);
                }).on('end', function() {
                        var body = Buffer.concat(bodyChunks);
                        console.log('BODY: ' + body);
                        callback(null, 'one');
                        // ...and/or process the entire body here.
                    })
            });


            req.on('error', function(e) {
                callback(e)
            });*/



        },
        function(callback){
            /*if (!cityOne){
                City.find({region_id:id})
                    .select('city_id title_'+req.query.lang)
                    .exec(function (err, result){
                        var newCityOne = new CityOne({region_id:id,cities:result});
                        newCityOne.save();
                        if (err) callback(err);
                        callback(null,result);
                    })
            } else {
                callback(null);
            }*/
            callback(null);
        }
    ],
        function(err, results){
            var date2=(new Date).getTime();
            //onsole.log('date2-date1='+(date2-date1));
            if (err) console.log(err);
            return res.json(cityOne);
       });
}


exports.list1= function(req, res) {
    //convert ();
    /*trunsform();
    return res.json({});*/
    var id =parseInt(req.query.id);
    var date1=(new Date).getTime();
    //City.find({$and: [{region_id:parseInt(req.query.id)},{important:'t'}]})
    var cityOne=[];
    async.series([
        function(callback){
            CityOne.find({region_id:id})
                //.select('city_id title_'+req.query.lang)
                .exec(function(err,cities){
                if (err) callback(err);
                if (cities && cities.length>0){
                    //console.log(cities[0].region_id);
                    var title = "title_"+req.query.lang;
                    for (var i= 0,l=cities[0].cities.length;i<l;i++){
                        cityOne[cityOne.length]={city_id:cities[0].cities[i].city_id,title:cities[0].cities[i]["title_"+req.query.lang]}
                    }
                    //cityOne=cities[0];
                }
                callback(null, 'one');
            })
        },
        function(callback){
            if (!cityOne){
                City.find({region_id:id})
                    .select('city_id title_'+req.query.lang)
                    .exec(function (err, result){
                        var newCityOne = new CityOne({region_id:id,cities:result});
                        newCityOne.save();
                        if (err) callback(err);
                        callback(null,result);
                    })
            } else {
                callback(null);
            }
        }
    ],
// optional callback
        function(err, results){
            var date2=(new Date).getTime();
            console.log('date2-date1='+(date2-date1));
            if (err)
                return res.json(err);
            else {
                if (cityOne)
                    return res.json(cityOne);
                else
                    return res.json(results[1]);
            }

        });


    /*City.find({region_id:id})
       //.sort('city_id')
        .select('city_id title_'+req.query.lang)
        .exec(function (err, result){
            var date2=(new Date).getTime();
            console.log(result[0]);
            console.log('date2-date1='+(date2-date1));
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })*/
}


exports.get= function(req, res) {
    //console.log(req.body);
    City.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var city = new City(req.body);
    var upsertData = city.toObject();
    delete upsertData._id;
    //console.log(brand);
    City.update({_id: city.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}


exports.delete = function(req,res){
    City.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}


function convert (){
    Region.find()
        .sort('region_id')
        .select('region_id')
        .exec(function (err, regions){
        //console.log(regions.length);
            async.eachSeries(regions, function( region, callback) {

                // Perform operation on file here.
               // console.log('Processing file ' + region);
                var str = JSON.parse(JSON.stringify(region));
                //console.log(str.region_id+'*******************************');
                CityOne.find({region_id:parseInt(str.region_id)})
                    .exec(function (err, newCity){
                        if (newCity.length>0){
                            City.find({region_id:parseInt(str.region_id)})
                                .exec(function (err, result){
                                    console.log(result.length);
                                    var newCityOne = new CityOne({region_id:str.region_id,cities:result});
                                    if (result.length>0) {
                                        newCityOne.save(function(err){
                                            console.log('saved');
                                            callback(null);
                                        });
                                    } else {
                                        callback(null);
                                    }



                                })
                        } else {
                            callback(null);
                        }

                    })

                //callback();
            }, function(err){
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('A file failed to process');
                } else {
                    console.log('All files have been processed successfully');
                }
            });



        })
}




