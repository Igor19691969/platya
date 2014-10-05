'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Country = mongoose.model('Country',new Schema({}),
    'country');

var request = require('superagent');

    //Region =mongoose.model('Region');


/**
 * Get awesome things
 */
exports.list= function(req, res) {

    var path= '/method/database.getCountries?v=5.5'+
        '&offset=0&need_all=1&count=1000&lang=ru';

    request
        .get('http://api.vk.com'+path)
        //.use(nocache) // Prevents caching of *only* this request
        .end(function(respons){
            if (respons.body && respons.body.response && respons.body.response.items){
                res.json(respons.body.response.items);
            }else {
                res.json(response);
            }

        });


    /*for (var i= 0,l=data.length;i<l;i++){
     $scope.countries[$scope.countries.length]={name:data[i]['title_'+$rootScope.lang],id:data[i]['country_id']}
     }*/

    /*Country.find()
       .sort('country_id')
        .select('country_id title_'+req.query.lang)
        .exec(function (err, result){
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })*/
}


exports.get= function(req, res) {
    //console.log(req.body);
    Country.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var country = new Country(req.body);
    var upsertData = country.toObject();
    delete upsertData._id;
    //console.log(brand);
    Country.update({_id: country.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}


exports.delete = function(req,res){
    /*Country.findById(req.params.id,function(err,country){
        if (err)  res.json(err);
        //console.log(country);
        Region.find({country:req.params.id})
            .exec(function (err, regions){
                if (err) return res.json(err);
                //console.log(regions);
                if (regions.length<=0){
                    country.remove(function (err) {
                        if (err)
                            res.json(err)
                        else
                            res.json({});
                    })
                } else {
                    res.json({'error':'There are regions for this country!'});
                }
            })

        country.remove(function (err) {
            if (err)
                res.json(err)
            else
                res.json({});
        })
    });

Cakes.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })*/


}




