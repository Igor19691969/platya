'use strict';

var describe = require('./controllers/describe');

module.exports = function(router) {
    router.get('/',describe.list);
    router.get('/:id',describe.get);
    router.get('/file/:id',describe.createFile);
    router.get('/cancel/:id',describe.cancelSubscribe);
    router.get('/send/:id',describe.sendDescribe);
    router.delete('/:id',describe.delete);
    router.delete('/file/:id',describe.deleteFile);
    router.post('/',describe.add);
    router.post('/:id',describe.add);
    router.put('/',describe.add);
    router.post('/file/upload',describe.fileUpload);
};