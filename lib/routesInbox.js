'use strict';

var inbox= require('./controllers/inbox');

module.exports = function(router) {
    router.get('/:id', inbox.get);
    router.get('/', inbox.list);
    router.delete('/:id', inbox.delete)
    router.post('/',inbox.add);
    router.post('/:id',inbox.add);
    router.put('/:id',inbox.add);
};