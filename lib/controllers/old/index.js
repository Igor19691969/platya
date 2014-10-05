'use strict';

var path = require('path');

/**
 * Send partial, or 404 if it doesn't exist
 */
exports.index = function(req, res){

    res.render('index');
};

exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

exports.profile = function(req, res) {

    res.redirect('/ru/profile');

};

/*

exports.partials = function(req, res) {
  var stripped = req.url.split('.')[0];
  var requestedView = path.join('./', stripped);
  res.render(requestedView, function(err, html) {
    if(err) {
      res.send(404);
    } else {
      res.send(html);
    }
  });
};

*/
/**
 * Send our single page app
 *//*

exports.index = function(req, res) {

 res.redirect
  res.render('index');
};
*/
