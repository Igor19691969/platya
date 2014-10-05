'use strict';

var ship= require('./controllers/ship');

module.exports = function(router) {
    router.get('/',ship.list);
    router.get('/:id',ship.get);
    router.delete('/:id',ship.delete);
    router.post('/',ship.add);
    router.post('/:id',ship.add);
};