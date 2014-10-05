'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var ShipSchema = new Schema({
    name: String,
    country:String,
    countryId:String,
    shippers:[{type:String}]
});


mongoose.model('Ship', ShipSchema);



