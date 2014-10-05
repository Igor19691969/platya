'use strict';


var mongoose = require('mongoose'),
    Stuff = mongoose.model('Stuff'),
    _=require('underscore'),
    Comment = mongoose.model('Comment');

/**
 * Get awesome things
 */
exports.list= function(req, res) {

    var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
    var perPage = 4;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }
    if (req.params.stuff!='all'){
        options.criteria= {stuff:req.params.stuff};
    }
    if (req.query.perPage && parseInt(req.query.perPage)>0){
        options.perPage= parseInt(req.query.perPage);
        //console.log(options.perPage);
    }
    //console.log(options.criteria);
    Comment.find(options.criteria)
        .sort('-date')
        .limit(options.perPage)
        .skip(options.perPage*(page))
        .populate('author','name profile')
        .populate('stuff','name index')
        .exec(function (err, result) {
            /*console.log(err);
            console.log(result);*/

            if (err) return res.json(err);
            if (page==0){
                Comment.count(options.criteria).exec(function (err, count) {
                    if (result.length>0){
                        result.unshift({'index':count});
                    }

                    res.json(result);
                })
            } else {
                res.json(result);
            }






        })

}


exports.get= function(req, res) {
    //console.log(req.body);
    Comment.findById(req.params.id)
        .populate('author','name')
        .exec(function (err, result) {

        if (err) return res.json(err);

        res.json(result);})


}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    //console.log(req.body);
    if (req.body.stuff && req.body.stuff._id) {
        req.body.stuff=req.body.stuff._id;
    }
    if (req.body.author && req.body.author._id) {
        req.body.author=req.body.author._id;
    }


    var comment = new Comment(req.body);
    //console.log(comment);
    var upsertData = comment.toObject();
    delete upsertData._id;
   // console.log('comment.stuff befor ='+comment.stuff);

    Comment.update({_id: comment.id}, upsertData, {upsert: true}, function (err,result) {
        //console.log('comment.stuff='+comment.stuff);
        if (err) return res.json(err);
            Stuff.findById(comment.stuff,function(err,stuff){
                //console.log(stuff.comments);
                //console.log(comment.id);
                //console.log(stuff.comments.indexOf(comment.id));
                if (stuff.comments.indexOf(comment.id)<=-1){
                    stuff.comments.push(comment.id);
                    stuff.save();
                }
                res.json({});
            })
    })

}


exports.delete = function(req,res){
    Comment.findById(req.params.id, function (err,doc) {
        Stuff.findById(doc.stuff,function(err,stuff){
            /*console.log(stuff.comments);
            console.log(comment.id);*/
            //console.log(stuff.comments.indexOf(comment.id));
            //var i = stuff.comments.indexOf(req.params.id);
            var i=stuff.comments.indexOf(req.params.id);
            if (i>-1){
                stuff.comments.splice(i,1)
               // console.log(stuff.comments);
                stuff.save();
            }
            doc.remove();
            res.json({});
        })
        /*if (err) return res.json(err);
        // saved!
        res.json({});*/
    })

}




