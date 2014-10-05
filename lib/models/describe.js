'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var describeSchema = new Schema({
    name:String,
    desc : String,
    img:String,
    stuffs:[{type : Schema.ObjectId, ref : 'Stuff'}],
    date: { type: Date, default: Date.now }
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

describeSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('stuffs')
            //.populate('category','name filters mainFilter')
            //.populate('brand','name')
            //.populate('brandTag','name')
            //.populate('author','name')
            //.populate('category.mainFilter')
            .exec(cb)
    },

    /**
     * List articles
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function (options, cb) {
        var criteria = options.query|| {}

        this.find(criteria)
            //.populate('author','name')
            .select('name')
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }

}

describeSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  test: function(plainText) {
    return plainText;
  }

};

mongoose.model('Describe', describeSchema);



