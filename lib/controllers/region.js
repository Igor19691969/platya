'use strict';
var request = require('superagent');

var mongoose = require('mongoose'),
 //   City = mongoose.model('City'),
    Schema = mongoose.Schema,
    Region = mongoose.model('Region',new Schema({}),
        'region');


/**
 * Get awesome things
 */
exports.list= function(req, res) {

    var path= '/method/database.getRegions?v=5.5'+'&country_id='+req.query.id
        '&offset=0&count=1000&lang=ru';
console.log(path);
    request
        .get('http://api.vk.com'+path)
        //.use(nocache) // Prevents caching of *only* this request
        .end(function(respons){
            //console.log(respons.body.response.items);
            if (respons.body && respons.body.response && respons.body.response.items){
                res.json(respons.body.response.items);
            }else {
                res.json(response);
            }

            //res.json(respons.body.response.items);
        });


    //console.log(parseInt(req.query.id));
 /*   Region.find({country_id:parseInt(req.query.id)})
        //.where({country_id:req.query.id})
        .sort('region_id')
        .select('country_id region_id title_'+req.query.lang)
        .exec(function (err, result){
            //console.log(result);
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })*/
}


exports.get= function(req, res) {
    //console.log(req.body);
    Region.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var region = new Region(req.body);
    var upsertData = region.toObject();
    delete upsertData._id;
    //console.log(brand);
    Region.update({_id: region.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}


exports.delete = function(req,res){
 /*   Region.findById(req.params.id,function(err,region){
        if (err)  res.json(err);

        City.find({country:req.params.id})
            .exec(function (err,cities){
                if (err) return res.json(err);
                if (cities.length<=0){
                    region.remove(function (err) {
                        if (err)
                            res.json(err)
                        else
                            res.json({});
                    })
                } else {
                    res.json({'error':'There are rcities for this country!'});
                }
            })

        region.remove(function (err) {
            if (err)
                res.json(err)
            else
                res.json({});
        })
    });
*/
    /*Cakes.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })*/

}




