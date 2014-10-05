'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var InboxSchema = new Schema({
    date: { type: Date, default: Date.now },
    name:String,
    email:String,
    text:String,
    read:{type:Boolean,default:false}});

mongoose.model('Inbox', InboxSchema);



