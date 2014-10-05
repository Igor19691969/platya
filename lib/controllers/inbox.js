'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Inbox = mongoose.model('Inbox');

exports.list= function(req, res,next) {
    var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
    var perPage = (req.query && req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):20;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }

    Inbox.find(options.criteria)
        .limit(options.perPage)
        .skip(options.perPage * options.page)
        .sort('-date')
        .exec(function (err, messages){
            if (err) return next(err);
            if (page==0){
                Inbox.count(options.criteria).exec(function (err, count) {
                    if (messages.length>0){
                        messages.unshift({'index':count});
                    }
                    return res.json(messages)
                })
            } else {
                return res.json(messages)
            }
        })
}


exports.get= function(req, res) {
    //console.log(req.body);
    Inbox.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);
        res.json(result);
    })

}

exports.delete = function(req,res,next){
   Inbox.findByIdAndRemove(req.params.id, function (err) {
        if (err) return next(err);
        // saved!
        res.json({});
    })
}

exports.add= function(req, res,next) {
    //console.log(req.body);
    //req.body.filters=JSON.stringify(req.body.filters);
    //console.log(req.body.filters);
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    var stuff = new Inbox(req.body);
    //stuff.shippers=req.body.shippers;
    var upsertData = stuff.toObject();
    //console.log(upsertData);
    delete upsertData._id;
    Inbox.update({_id: stuff.id}, upsertData, {upsert: true}, function (err) {
        if (err) return next(err);
        // saved!
        res.json({});
    })
}



