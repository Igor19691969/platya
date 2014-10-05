'use strict';

//var order = require('./controllers/order');

module.exports = function(router,order) {
    router.get('/daySummary/:day',order.getDaySummary);
    router.post('/callback/:num',order.pay);
    router.post('/',order.add);
    router.get('/',order.list);
    router.delete('/:id',order.delete);
    router.get('/:id',order.get);
    router.put('/',order.add);
};