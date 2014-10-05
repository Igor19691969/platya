+'use strict';
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _=require('underscore'),
    Chat=mongoose.model('Chat');

exports.list= function(req, res) {

    var page = req.query['page'] > 0 ? req.query['page'] : 1;
    var last = req.query['last'] ? req.query['last']: '';
    /*console.log('last '+last);
    console.log('page '+page);*/
    var perPage = 20;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }


    var to=req.params.to;
    var from =req.params.from;
    var query={ $and: [ { members:to  }, {members:from} ] };
    var start,end;
    Chat.findOne(query,function (err, result) {
        if (err) return res.json(err);
        if (result && result.chat) {
            var retArr=[];
            if (!last){
                start=result.chat.length-perPage*page;
                end=start+perPage;
                if (start<0){start=0}
                retArr=result.chat.slice(start,end);
            } else {
                var pos;
                for (var i=0;i<result.chat.length;i++){
                    if(result.chat[i]._id==last){
                        pos=i;
                        break;
                    }
                }
                start=pos-perPage;
                end=start+perPage;
                if (start<0){start=0}
            }

            retArr=result.chat.slice(start,end);
            var newArr=[];
            _.each(retArr,function(el){
                newArr.push(JSON.parse(JSON.stringify(el)));
            });
            var newMsg=0;
           /* console.log('start - '+start);
            console.log('end - '+end);*/
            for (var l=0;l<result.chat.length;l++){
                //console.log('list - '+l);
                //console.log(result.chat[l].status);
                if (result.chat[l].user!=from && result.chat[l].status.indexOf(from)<0){
                    if (l>=start && l<end){
                        //console.log('push - '+l)
                        result.chat[l].status.push(from);
                    } else {
                        //console.log('newMsg - '+l);
                        newMsg++;
                    }

                }
            }
            //console.log(newMsg);
            /*if (retArr[1]){
                retArr[1]['status']=newMsg;
            }
*/
            result.save();
            if ( newArr[0]){
                newArr[0]['more']= (start==0)?false:true;
                newArr[0]['newMsg']=newMsg;
            }

            //******************************************
            res.json(newArr);
        } else {
            res.json([]);
        }
    })
}


exports.deleteMsgs= function(req, res) {
    var to=req.params.to;
    var from =req.params.from;
    console.log(req.query);
    /*if (req.query && req.query.msgs){
        //console.log(req.query.msgs)
        var msgs= req.query.msgs;
        console.log(msgs);
    }*/

    var query={ $and: [ { members:to  }, {members:from} ] };
    console.log(query);
    if (req.query.msgs=='chat'){
        Chat.findOne(query,function (err,chat) {
            if (err) return res.json(err);
            console.log(chat);
            if (chat){
                chat.remove();
            }
            res.json({});
        });
    } else {
        Chat.findOne(query,function (err,chat) {
            if (err) return res.json(err);

            if (chat && chat.chat) {
                if (req.query.msgs=='all'){
                    chat.chat=[];
                } else {
                    //console.log(req.query.msgs);
                    var arrId=JSON.parse(req.query.msgs);
                    //console.log(arrId);
                    for (var i=0;i<chat.chat.length;i++){
                        //console.log(chat.chat[i]._id);
                        for(var j=0;j<arrId.length;j++){
                            if (arrId[j]==chat.chat[i]._id){
                                chat.chat.splice(i, 1);
                                i--;
                                break;
                            }
                        }
                        /*if (  arrId.indexOf(chat.chat[i]._id)  >-1){
                         console.log(chat.chat[i].msg);
                         chat.chat.splice(i, 1);
                         i--;
                         }*/
                    }
                }
                chat.save();
                res.json({});
            } else {
                res.json({});
            }
        })
    }


}


exports.listChats= function(req, res) {
    var from =req.params.from;
    var query= {members:from}  ;
    var user=[];
    var chats={};
    function userTransform(item){
        var fio = (item.profile&&item.profile.fio)?item.profile.fio:'';
        var c = (item.profile&&item.profile.country)?item.profile.country:'';
        var city = (item.profile&&item.profile.city)?item.profile.city:'';
        return {name:item.name,_id:item._id,newMsg:chats[item._id],fio:fio,city:city,country:c};
    }
    Chat.find(query,"members chat",function (err, result) {
        //console.log(result);
        if (err) return res.json(err);
        for (var i= 0,len=result.length;i<len;i++){
            //console.log(result[i].members);
            var newMsg=0;
            for (var l= 0,k=result[i].chat.length;l<k;l++){
                if (result[i].chat[l].user!=from && result[i].chat[l].status.indexOf(from)<0){
                    newMsg++;
                }
            }
            //console.log(newMsg);

            for (var j=0;j<result[i].members.length;j++){
                //console.log(result[i].members[j]);
                if (user.indexOf(result[i].members[j])<0 && result[i].members[j]!=from ){
                    user.push(result[i].members[j]);
                    chats[result[i].members[j]]=newMsg;
                }
            }

        }

        //console.log(user.clean(''));

        User.find({'_id': { $in: user}},function(err,docs){
            var arr=[];
            //console.log(docs);
            if (docs) {
                arr = docs.map(userTransform);
            }

            res.json(arr);
        })
    })
}

exports.listUsers= function(req, res) {

    function userTransform(item){
        var c = (item.profile&&item.profile.country)?item.profile.country.toLowerCase():'';
        var fio = (item.profile&&item.profile.fio)?item.profile.fio:'';
        return {name:item.name,_id:item._id,country: c,fio:fio};
    }
    User.find(function(err,docs){
        if (err) return res.json(err);
        var arr=[];
        arr = docs.map(userTransform);
        res.json(arr);
    })

}

exports.editList= function(req, res) {
    var email = req.body.email;

    //var newPass = String(req.body.newPassword);

    User.findOne({email:email}, function (err, user) {
        if(user) {
            // console.log(user);

            /*var password=shuffle(7);
            var smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Mailgun",
                auth: {
                    user: "postmaster@sandbox86422.mailgun.org",
                    pass: "9zsllp27ndo6"
                }
            });
            var mailOptions = {
                from: "noreplay ✔ <noreplay@jadone.biz>", // sender address
                to: email, // list of receivers
                subject: "Reset password ✔", // Subject line
                //text: "Hello world ✔", // plaintext body
                html: "<div>Уважаемый пользователь.<br />Вами был запрошен сброс пароля на сайте http://jadone.biz/"+
                    ".<br />Логин - "+user.name+
                    ".<br />почта - "+email+
                    "<br />Новый пароль - "+password+
                    "<br /> Изменить пароль на свой Вы можете в своей учетной записи.</div>"
            }

            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }

                // if you don't want to use this transport object anymore, uncomment following line
                smtpTransport.close(); // shut down the connection pool, no more messages
            });*/



            user.password = '123456';
            user.save(function(err) {
                if (err) {
                    res.send(500, err);
                } else {
                    res.send(200);
                }
            });
        } else {
            res.send(400);
        }
    });

}

