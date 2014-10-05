'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var CityOneSchema = new Schema({

    ru:{city:String,area:String,region:String},
    ua:{city:String,area:String,region:String},
    be:{city:String,area:String,region:String},
    en:{city:String,area:String,region:String},
    es:{city:String,area:String,region:String},
    pt:{city:String,area:String,region:String},
    de:{city:String,area:String,region:String},
    fr:{city:String,area:String,region:String},
    it:{city:String,area:String,region:String},
    pl:{city:String,area:String,region:String},
    ja:{city:String,area:String,region:String},
    lt:{city:String,area:String,region:String},
    lv:{city:String,area:String,region:String},
    cz:{city:String,area:String,region:String},


  country: Number,
  id : Number
  //region: {type : Schema.ObjectId, ref : 'Region'},

});
var CitiesSchema = new Schema({
    region: Number,
    cities:[{type : Schema.ObjectId, ref : 'CityOneSchema'}]
})

CitiesSchema.index({region: 1}, {unique: true});
CitiesSchema.set('autoIndex', false);

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


mongoose.model('Town', CitiesSchema);



