'use strict';

var users= require('./controllers/users');

module.exports = function(router) {
    router.post('/', users.create);
    router.put('/profile', users.changeProfile);
    router.put('/changepswd', users.changePassword);
    router.post('/resetpswd/:email', users.resetPassword);
    router.get('/me', users.me);
    router.get('/:id', users.show);
    router.get('/subscribe/:email', users.subscribe);
    router.get('/subscribeconfirm/:emailsalt/:email', users.subscribeConfirm);

    router.get('/', users.list);
    router.delete('/:id', users.delete)
    router.post('/editForce',users.editForcePassword);
};