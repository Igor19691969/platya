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
    async=require('async'),
    _ = require('underscore'),
    moment=require('moment');
    //chatRoom=[];

    moment.lang('ru');

var sock = function (chatRoom,countSocket) {

    this.connect= function(socket){
        countSocket[countSocket.length]=1;
        console.log('user connection!');
        socket.emit('who are you',function(data){ // if there was disconnect
            //console.log(data);
            if (data=='user not auth'){
                //console.log('hello '+data);
            } else {
                var l=chatRoom.indexOf(socket);
                console.log('user = '+l); console.log('line 38 chatRoom.length='+chatRoom.length);
                if (l<0){
                    socket.nickname=data;
                    chatRoom.push(socket);
                    console.log('line 42 chatRoom.length='+chatRoom.length)

                    User.findById(data,function(err,user){
                     //console.log(user);
                     if (user && user.role && user.role=='admin') {
                     //console.log('sss');
                        /* setInterval(function () {
                         //console.log((new Date()).toString());
                             socket.emit('send:numUres', {
                                 time: moment((new Date())).format('llll'),
                                 quantity: countSocket.length
                             });
                         }, 3000);*/
                     }
                     })
                }

            }
        })

        socket.on('new user in chat',function(data){

            var l=chatRoom.indexOf(socket);
            console.log('new - '+l); console.log('line 66 chatRoom.length='+chatRoom.length);
            if (l<0){
                socket.nickname=data;
                //chatRoom.push(socket);
                chatRoom[chatRoom.length]=socket;console.log('line 70 chatRoom.length='+chatRoom.length);
                User.findById(data,function(err,user){
                    //console.log(user);
                    /*if (user && user.role && user.role=='admin') {
                        //console.log('1sss');
                        setInterval(function () {
                            //console.log((new Date()).toString());
                            socket.emit('send:numUres', {
                                time: moment((new Date())).format('lll'),
                                quantity: chatRoom.length
                            });
                        }, 3000);
                    }*/
                })
            }
        })

        function userTransform(item){
            return {name:item.name,_id:item._id};
        }
        /*socket.on('who is in chat',function(data,callback){
         User.find({
         '_id': { $in: Object.keys(usersChat)}},function(err,docs){
         var res=[];
         res = docs.map(userTransform);
         callback(res);
         })
         })*/

        /*socket.on('updateListMsgs',function(data){
         if (usersChat[data.to]){
         usersChat[data.to].emit('updateListMsgs',{from:data.from});
         }

         })*/

        socket.on('delete user from chat',function(data){
            if(!socket.nickname) return;console.log('socket.nickname='+socket.nickname);
            //delete usersChat[socket.nickname];
            chatRoom.splice(chatRoom.indexOf(socket),1);
            console.log('line 110 chatRoom.length='+chatRoom.length);


            //socket.broadcast.emit('delete user from chat',socket.nickname);
        })

        socket.on('disconnect',function(data){
            if (countSocket.length>0){
                countSocket.splice(0,1);
            }
            if(!socket.nickname) return;
            //delete usersChat[socket.nickname];
            //updateNickName();
            //socket.broadcast.emit('delete user from chat',socket.nickname);
            chatRoom.splice(chatRoom.indexOf(socket),1);
            if (countSocket.length>0){
                countSocket.splice(0,1);
            }

            //console.log('disconnect '+socket.nickname);
        })


        socket.on('new:msg',function(data,callback){
            function wherefoo(a,o){
                var t=[];
                for (var i= 0,l= a.length;i<l;i++){
                    for (var k in o ){
                        if (a[i][k] && a[i][k]==o[k]){
                            t[t.length]=a[i];
                        }
                    }
                }
                return t;
            }
            var to=data.to;
            var from = data.from;
            var a = wherefoo(chatRoom,{nickname:to});
            var b = wherefoo(chatRoom,{nickname:from});
            //console.log(b.length);
            if (b.length<1){
                /*callback(false);
                return;*/
                socket.nickname=from;
                chatRoom[chatRoom.len]=socket;
                b = wherefoo(chatRoom,{nickname:from});
            }
            var msg=data.msg.substring(0,1000);
            msg = msg.replace(/\n/g, '<br />');

            var date = Date.now();
            var query={$and:[{members:to},{members:from}]};


            Chat.findOne(query,function (err, chat) {
                if (err) throw err;
                //console.log(usersChat);
                if (!chat){
                    /*if (usersChat[to]){
                     usersChat[to].emit('new chat',from);
                     }*/

                    chat= new Chat({members:[to,from]});
                }
                chat.chat.push({user:from,msg:msg,date:date});
                var id = chat.chat[chat.chat.length-1]._id;
                chat.save();


                /*console.log(a);
                 console.log(b.length);*/
                _.each(b,function(chat){

                    chat.emit('new:msg',{msg:msg,date:date,from:from,to:to,_id:id},function(res){
                        console.log(res);
                    })
                })
                var arr =[];
                _.each(a,function(chat){
                    var c = function(cb){
                        chat.emit('new:msg',{msg:msg,date:date,from:from,to:to,_id:id},function(res){
                            cb(null,res);
                        })
                    }
                    arr.push(c);
                })
                var read=false;
                async.parallel(arr,function(err,result){
                    for(var i=0;i<result.length;i++){
                        if(result[i].status){
                            read=true;
                            break;
                        }
                    }
                    //console.log(result);
                    if (read){
                        chat.chat[chat.chat.length-1].status=[to];
                        chat.save();
                    }/* else{
                     _.each(a,function(chat){
                     chat.emit('notRead:msg',{from:from}); // send message about don't read message
                     })
                     }*/
                    callback(true);
                })
            })

        })

    }


};

module.exports=sock;

