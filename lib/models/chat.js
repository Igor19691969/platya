'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */

var msgSchema = mongoose.Schema({
    user:String,
    msg:String,
    created:{type:Date,default:Date.now},
    status:[String]
});




var ChatSchema = mongoose.Schema({
    members:[String],
    chat:[msgSchema]
});

/**
 * Virtuals
 */

/**
 * Pre-save hook
 */
/*
GroupsSchema

  .pre('save', function(next) {

      next();
  });
*/

/**
 * Methods
 */

mongoose.model('Chat', ChatSchema);
mongoose.model('Msg', msgSchema);



