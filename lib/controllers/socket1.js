'use strict';
/* module.exports = function (socket) {
   socket.emit('send:name', {
        name: 'Bob'
    });

    setInterval(function () {
        socket.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 1000);
};*/



var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Chat=mongoose.model('Chat'),
    Msg=mongoose.model('Msg'),
    usersChat={},
    chatRoom=[];

module.exports = function (socket) {
    console.log('user connection!');
    /*setInterval(function () {
        socket.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 1000);*/
    //socket.emit('what user');



    socket.on('new user in chat',function(data,callback){
        socket.nickname=data;
        chatRoom.push(socket);



        if((data in usersChat)||!data){
            console.log('cb from new user - false')
            // new socket with the same user
            usersChat[data].disconnect();
            socket.nickname=data;
            usersChat[socket.nickname]=socket;
            callback(false)
        } else {
        // chech avalable users with the same id
            console.log('cb from new user - true')
            callback(true);
            socket.nickname=data;

            usersChat[socket.nickname]=socket;
            /*User.findById(data,'name',function(err,doc){
                var res = userTransform(doc);
                socket.broadcast.emit('new user in chat',res);
            })*/
        }
    })

    function userTransform(item){
        return {name:item.name,_id:item._id};
    }
    socket.on('who is in chat',function(data,callback){
            User.find({
                '_id': { $in: Object.keys(usersChat)}},function(err,docs){
                var res=[];
                res = docs.map(userTransform);
                callback(res);
            })
    })

    socket.on('updateListMsgs',function(data){
        if (usersChat[data.to]){
            usersChat[data.to].emit('updateListMsgs',{from:data.from});
        }

    })

    socket.on('delete user from chat',function(data){
        if(!socket.nickname) return;
        delete usersChat[socket.nickname];
        chatRoom.splice(chatRoom.indexOf(socket),1);
       

        //socket.broadcast.emit('delete user from chat',socket.nickname);
    })

    socket.on('disconnect',function(data){
        if(!socket.nickname) return;
        delete usersChat[socket.nickname];
        //updateNickName();
        //socket.broadcast.emit('delete user from chat',socket.nickname);
        console.log('disconnect '+socket.nickname);
    })


    socket.on('new:msg',function(data,callback){
        var msg=data.msg.substring(0,200);
        msg = msg.replace(/\n/g, '<br />');
        var to=data.to;
        var from = data.from;
        var date = Date.now();
        var query={$and:[{members:to},{members:from}]};
        Chat.findOne(query,function (err, chat) {
            if (err) throw err;
            //console.log(usersChat);
            if (!chat){
                if (usersChat[to]){
                    usersChat[to].emit('new chat',from);
                }

                chat= new Chat({members:[to,from]});
            }

            if(data.to in usersChat){ // respondent is on line
                chat.chat.push({user:from,msg:msg,date:date});
                usersChat[data.to]
                    .emit('new:msg',{msg:msg,date:date,from:from},function(respons){ //response from respondent
                        //console.log(respons);
                        if (respons.status){ //have read from chat
                            /*var msg= new Msg({user:from,msg:msg,date:date,status:[data.to]});
                            console.log(msg);*/
                            chat.chat[chat.chat.length-1].status=[data.to];
                            //chat.chat.push({user:from,msg:msg,date:date,status:[data.to]});

                        } else { //don't read from chat
                            //chat.chat.push({user:from,msg:msg,date:date});
                            usersChat[data.to].emit('notRead:msg',{from:from}); // send message about don't read message
                        }
                        //callback({date:date,msg:msg,res:'this cb from new:msg. user is in chat list'});
                        callback({date:date,msg:msg,_id:chat.chat[chat.chat.length-1]._id});
                        chat.save();
                        //console.log(respons);
                    });
            } else {
                callback({date:date,msg:msg,res:'this cb from new:msg. user is  not in chat list'});
                chat.chat.push({user:from,msg:msg,date:date});
                chat.save();
            }

        })

    })

};

