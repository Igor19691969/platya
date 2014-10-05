'use strict';
var mongoose = require('mongoose'),
    nodemailer = require("nodemailer"),
    User = mongoose.model('User'),
    moment = require('moment'),
    _=require('underscore'),
    Order = mongoose.model('Order'),
    config=require("../../data/config.json"),
    Chat=mongoose.model('Chat'),
    async=require('async'),
    OrderArch = mongoose.model('OrderArch');

var domain = require('domain');
//var d = domain.create();
var fs = require('fs');
/*d.on('error', function(err) {
    //console.error();
    var date= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    var s = date + ' '+err+"\n";
    fs.appendFile('errors.log',s, function (error, data) {
        if (error) throw error;
        console.log(data);
    });
});*/

var order = function(chatRoom){

    this.list= function(req, res) {
        //console.log(req.query);



            /*fs.readFile('somefile.txt', function (err, data) {
                if (err) throw err;
                console.log(data);
            });*/



       /*var query = (req.query.user)?{'user':req.query.user}:null;
        var query = (req.query.retail)?{'quantity':{"$lt":5}}:{'quantity':{"$gte":5}};*/
        //console.log(req.user.role);

        var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
        //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
        var perPage = (req.query && req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):20;
        var options = {
            perPage: perPage,
            page: page,
            criteria:null
        }
        //console.log(options);
        //console.log(req.user)
        if (!req.user) return res.send(null, 404);
        //console.log('yes');
        if (req.user.role!='admin_order' && req.user.role!='admin_order_retail' &&
            req.user.role!='admin' && !req.query.user) return res.send(null, 404);
    /*console.log('req.query.user - '+req.query.user);
        console.log(req.user.role);*/
       var query=null;
       if (req.query.user){
           query = {'user':req.query.user};
       } else if (req.query.retail) {
           if (req.user.email==config.email.optUA){
               query = {'quantity':{"$lt":5},'country':'UA'};
           } else if (req.user.email==config.email.opt){
               query = {'quantity':{"$lt":5},'country':"ELSE"};
           } else {
               query = {'quantity':{"$lt":5}}
           }

       } else if (req.user.role=='admin_order'){
               if (req.user.email==config.email.optUA){
                   query = {'quantity':{"$gte":5},'country':'UA'};
               } else {
                   query = {'quantity':{"$gte":5},'country':{ $ne: 'UA' }};
               }
       } else {
               //query = {'quantity':{"$gte":5}}

       }
        console.log(query);
/*console.log(new Date(req.query.dtfrom));
            console.log(req.query.dtfrom)*/

        if (req.query && req.query.dtfrom && req.query.dtto){
            var start=new Date(req.query.dtfrom);
            var  end =new Date(req.query.dtto);
            if (end>=start){
                query = {date: {
                    $gte:start,
                    $lte: end
                }};
            }

        }




        //console.log('query-'+query);
       //console.log(req.query.retail);
       Order.find(query)
           .populate('user', 'email name')
           .sort('-num')
           .limit(options.perPage)
           .skip(options.perPage * options.page)
           //.select('name index country region')
           .exec(function (err, orders){
               //console.log(err);
               if (err) return res.send(null, 500);
               if (page==0){
                   Order.count(query).exec(function (err, count) {
                       if (orders.length>0){
                           orders.unshift({'index':count});
                       }
                       return res.json(orders)
                   })
               } else {
                   return res.json(orders)
               }
           })

    },
    this.get= function(req, res) {
           //console.log(req.body);
           Order.findById(req.params.id)

               .exec(function (err, result) {

                   if (err) return res.json(err);

                   res.json(result);})


    },
    this.delete = function(req,res){
           Order.findByIdAndRemove(req.params.id, function (err,doc) {
               if (err) {console.log(err);return res.json(err);}

               res.json({});
           })
    },

        this.pay = function(req,res,next){
            //console.log('pay - ',req.params);
            Order.findOne({num:req.params.num}, function (err,doc) {
                if (err) {return next(err);}
                console.log(doc);
                if (doc.status==2){
                    doc.status=3;
                    doc.save(function(err){
                        if (err) return next(err)
                    });
                }
                res.json({});
           })
        },
    this.add = function(req, res,next) {
        var d = domain.create();
        d.on('error', function(error) {
            return next(error);
        });


        d.run(function() {
            /*console.log('from new -',req.params.num);
            if (req.params.num){
                Order.findOne({num:req.params.num}, function (err,doc) {
                    if (err) {return next(err);}
                    if (doc.status==2){
                        doc.status=3;
                        doc.save(function(err){
                            if (err) return next(err)
                        });
                    }
                    res.json({});
                })
            }*/




        function checkInCart(cart,item){
            for (var i= 0,len=cart.length;i<len;i++){
                if (cart[i].stuff.equals(item.stuff)&&cart[i].color.equals(item.color)&&cart[i].size.equals(item.size)) {
                    console.log('i='+i);
                    return i;
                    break;
                }
            }
            return -1;
        }
        function getTotalQuantity(order){
            var quantity=0;
            for (var i= 0,len=order.cart.length;i<len;i++){
                quantity +=Number(order.cart[i].quantity);
            }

            if (order.addInCart && order.addInCart.length){
                for (var i= 0,len=order.addInCart.length;i<len;i++){
                    //console.log(order.addInCart[i].cart);
                    if (order.addInCart[i].cart){
                        for (var j= 0,l=order.addInCart[i].cart.length;j<l;j++){
                            quantity +=Number(order.addInCart[i].cart[j].quantity);
                        }
                    }

                }
            }


            return quantity;
        }
        function orderSum(order,quantity,all){
            var sum=0;
            for (var i= 0,l=order.cart.length;i<l;i++){
                var price=(quantity>=5||order.opt)?order.cart[i].price:order.cart[i].retail;
                sum +=Number(price)*Number(order.cart[i].quantity);
            }
            if (all){
                if (order.addInCart && order.addInCart.length){
                    for (var i= 0,len=order.addInCart.length;i<len;i++){
                        if (order.addInCart[i].cart){
                            for (var j= 0,l=order.addInCart[i].cart.length;j<l;j++){
                                var price=(quantity>=5||order.opt)?order.addInCart[i].cart[j].price:order.addInCart[i].cart[j].retail;
                                sum +=Number(price)*Number(order.addInCart[i].cart[j].quantity);
                            }
                        }
                    }
                }
            }
            return sum;
        }

        var date= Date.now();

        var orderNew = new Order(req.body);

        var upsertData = orderNew.toObject();
        delete upsertData._id;
        if (req.body.user._id){
            upsertData.user= req.body.user._id;
        }
        //console.log(upsertData);



        var isStatus1=false,isStatus2=false,update=0;
        var orderToAdd;

        if (upsertData.num){ // update
        //************************************************************************
            async.series([
                function(callback){
                    // check for add order
                    //console.log('upsertData.num='+upsertData.num);
                    if (upsertData.num) {// изменение статуса а не новый
                        if (upsertData.status==6 && !upsertData.date4){
                            upsertData.date4=Date.now();
                            var orderArch = new OrderArch(upsertData);
                            orderArch.save(function (err) {
                                if (err) return callback(err);
                                // saved!
                                Order.findByIdAndRemove(orderNew.id,function(err,order){
                                    if (err) return callback(err);
                                    callback(null);
                                })
                            })
                        }
                        else {
                            if (upsertData.status==2 && !upsertData.date0){
                                upsertData.date0=Date.now();
                                update = 1;
                            }
                            else if (upsertData.status==3 && !upsertData.date1){
                                upsertData.date1=Date.now();
                            }
                            else if (upsertData.status==4 && !upsertData.date2){
                                upsertData.date2=Date.now();
                            }
                            else if (upsertData.status==5 && !upsertData.date3){
                                upsertData.date3=Date.now();
                            }

                            // update дозаказа
                            if (upsertData.addInCart && upsertData.addInCart.length>0 && upsertData.addInCart[upsertData.addInCart.length-1].status==2
                                && upsertData.addInCart[upsertData.addInCart.length-1].status && !upsertData.addInCart[upsertData.addInCart.length-1].date){
                                upsertData.addInCart[upsertData.addInCart.length-1].date=Date.now();
                                update = 2;
                            }

                            upsertData.quantity=getTotalQuantity(upsertData);
                            upsertData.sum=orderSum(upsertData,upsertData.quantity,1);
                            //console.log(upsertData.sum);
                            Order.update({_id: orderNew.id}, upsertData, {upsert: true}, function (err) {
                                if (err) return callback(err);
                                callback(null);

                            })
                        }
                    }
                },
                function(callback){
                    if (update) { // update
                        //console.log(update);
                        if (update==1)
                            sendEmail(upsertData,callback);
                        else if (update==2)
                            sendEmail(upsertData,callback,2);
                        //console.log('second email');return callback(null);
                        //sendEmail(upsertData,callback);
                    } else {
                        callback(null);
                    }
                },
                function(callback){
                    callback(null);
                }],
                function(err, results){
                    //console.log(results);
                    if (err) return next(err)
                    else res.json({num: upsertData.num})
                }
            );
        //************************************************************************
        } else { // new
        //************************************************************************
            var id=order.id;
            Order.findOne({user:upsertData.user, $or:[{status:1},{status:2}]}).exec(function(err,order){
                //console.log('order='+order);
                /*var order=ord[0];
                 console.log(ord[0]);*/
                //console.log(err);
                if (err) return callback(err);
                if (!order) { // новый ордер и нет открытого ордера
                    //console.log('2upsertData.num='+upsertData.num);
                    async.series([
                        function(callback){
                            Order.getLastNumberOrder(function(err,lastOrder){
                                if (err) callback(err);
                                if(!lastOrder[0] || !lastOrder[0].num){
                                    if (!upsertData.num){
                                        upsertData.num=2455;
                                    }
                                }else {
                                    if (!upsertData.num){
                                        upsertData.num=++lastOrder[0].num;
                                    }
                                }
                                //console.log('3upsertData.num='+upsertData.num);
                                callback(null);
                            });
                        },
                        function(callback){
                            Order.update({_id: orderNew.id}, upsertData, {upsert: true}, function (err) {
                                if (err) return callback(err);
                                callback(null);

                            })
                        },
                        function(callback){
                            if (!req.body._id){ // new order
                                //console.log('first email');return callback(null);
                                createMail(upsertData,callback)
                            }
                        }],
                        function(err, results){
                            //console.log(results);
                            if (err) return next(err)
                            else res.json({num: upsertData.num})
                        }
                    )



                } else {
                    async.series([ // есть открытый ордер
                        function(callback){
                            //orderToAdd=ord;

                            if (order.status==1){ // сумирование дозаказа с заказом
                                for (var i= 0,len=upsertData.cart.length;i<len;i++){
                                    var j;
                                    if ((j=checkInCart(order.cart,upsertData.cart[i]))>=0){
                                        //console.log('j='+j);
                                        order.cart[j].quantity += upsertData.cart[i].quantity;
                                    } else {
                                        order.cart[order.cart.length]=upsertData.cart[i];
                                    }
                                }
                                order.quantity=getTotalQuantity(order);
                                order.sum=orderSum(order,order.quantity,1);
                                if (upsertData.comment){
                                    order.comment +="\n";
                                    order.comment +=upsertData.comment;
                                }
                                Order.update({_id:order._id}, {$set: {cart: order.cart,quantity:order.quantity,sum:order.sum,comment:order.comment}},function(err){
                                });
                                //order.save();

                                createMail(order, callback,1); // дозаказ к открытому ордеру

                                isStatus1=true;
                            } else if (order.status==2){ //дозаказ
                                var typeAdd ;
                                if (order.addInCart.length>0){
                                    var isOpen=false;
                                    var k;
                                    for (var k= 0,len=order.addInCart.length;k<len;k++){
                                        if (order.addInCart[k].status==1){ // there is  an open addition order.
                                            isOpen=true;
                                            break;
                                        }
                                    }
                                    if (isOpen){ // есть открытый дозаказ
                                        typeAdd=3;
                                        for (var i= 0,len=upsertData.cart.length;i<len;i++){ // cумирование с открытым дозаказом
                                            var j;
                                            if ((j=checkInCart(order.addInCart[k].cart,upsertData.cart[i]))>=0){
                                                //console.log('j='+j);
                                                order.addInCart[k].cart[j].quantity += upsertData.cart[i].quantity;
                                            } else {
                                                order.addInCart[k].cart[order.addInCart[k].cart.length]=upsertData.cart[i];
                                            }
                                        }
                                        /*order.quantity=getTotalQuantity(order);
                                        order.sum=orderSum(order);*/
                                    } else { //новый дозаказ
                                        typeAdd=2;
                                        order.addInCart[order.addInCart.length]={status:1,cart:upsertData.cart};

                                    }

                                }else{ // первый дозаказ
                                    typeAdd=2;
                                    order.addInCart[order.addInCart.length]={status:1,cart:upsertData.cart};
                                }
                                if (upsertData.comment){
                                    order.comment +="\n";
                                    order.comment +=upsertData.comment;
                                }
                                isStatus2=true;
                                //console.log(order.addInCart);
                                order.quantity=getTotalQuantity(order);
                                order.sum=orderSum(order,order.quantity,1);
                                Order.update({_id:order._id}, {$set: {cart: order.cart,quantity:order.quantity,sum:order.sum,addInCart:order.addInCart,comment:order.comment}},function(err){
                                });
                                //order.save();
                                createMail(order, callback,typeAdd)
                                //callback(null);
                            }
                        },
                        function(callback){
                            callback(null);
                        }],
                        function(err, results){
                            //console.log(results);
                            if (err) return next(err)
                            else res.json({num: order.num})
                        }
                    )

                }
            });
        }
        //************************************************************************

        /*function mailAddOrder(type,order,cb){
            if (type==1){
                console.log('first email сумирование дозаказа с заказом');
            }
            cb();
        }*/



           //*******************************mail
           function sendEmail(order,cb,typeUpDate){ // after status 2
               User.findById(order.user).exec(function (err,user){
                   if (err) {cb(err);}
                   var mailChat=config.email.opt;
                   if (upsertData.quantity<5){ // retail
                       mailChat=config.email.retail;
                   } else if(user.profile['country'] && (user.profile['country'].toLowerCase()=="украина"||
                       user.profile['country'].toLowerCase()=="україна")||user.profile['countryId']=="UA") { // UA opt
                       mailChat=config.email.optUA;
                   } else { // OPT

                   }


                   var dateForTable= Date.now();
                   var smtpTransport = nodemailer.createTransport("SMTP",{
                       service: "Mailgun",
                       auth: {
                           /*user: "postmaster@sandbox86422.mailgun.org",
                           pass: "9zsllp27ndo6"*/
                           user: "postmaster@jadone.biz",
                           pass: "73o6okae8971"
                       }
                   });
                   var mailOptions = {
                       from: "noreplay ✔ <noreplay@jadone.biz>", // sender address
                       //to: req.body.useremail, // list of receivers
                       subject: "order update✔", // Subject line
                       //text: "Hello world ✔", // plaintext body
                       html:""
                   }

                   var  message =

                       '<table width="100%" border="1px" style="border-color: #ccc;">'+
                           ' <tbody>'+
                           '  <tr>'+
                           '   <td style="background-color: #999;">#</td><td style="background-color: #999">Категория</td><td style="background-color: #999">Артикул</td><td style="background-color: #999">Размер</td><td style="background-color: #999">Цена</td><td style="background-color: #999">Кол-во</td><td style="background-color: #999">Сумма</td>'+
                           '  </tr>'+
                           ' </tbody>'+
                           ' <tbody>';

                   var cartData=upsertData['cart'];
                   if (typeUpDate==2){
                       cartData=upsertData.addInCart[upsertData.addInCart.length-1]['cart'];
                   }
                   var q= 0,s=0;
                   cartData.forEach(function(good,index){
                       message +=
                           '<tr>'+
                               '<td>'+(++index)+'</td><td>'+good.categoryName+'</td><td>'+good['name']+' '+good['colorName']+'</td><td>'+good['sizeName']+'</td>';
                       var sum = (upsertData.quantity>=5)?good.price:good.retail;
                       message +=
                           '<td>'+(upsertData.kurs* sum).toFixed(2)+' '+upsertData.currency+'</td><td>'+good['quantity']+'</td>';
                       var localSum = upsertData.kurs* sum*good['quantity'];
                       message +=
                           '<td>'+(localSum).toFixed(2)+' '+upsertData.currency+'</td></tr>';
                       s +=localSum;
                       q +=good['quantity'];
                   })

                   /*upsertData['cart'].forEach(function(good,index){
                       message +=
                           '<tr>'+
                               '<td>'+(++index)+'</td><td>'+good.categoryName+'</td><td>'+good['name']+' '+good['colorName']+'</td><td>'+good['sizeName']+'</td>';
                       var sum = (upsertData.quantity>=5||order.opt)?good.price:good.retail;
                       message +=
                           '<td>'+(upsertData.kurs* sum).toFixed(2)+' '+upsertData.currency+'</td><td>'+good['quantity']+'</td>';
                       message +=
                           '<td>'+(upsertData.kurs* sum*good['quantity']).toFixed(2)+' '+upsertData.currency+'</td>'+
                               '</tr>';
                   })*/
                   message +=
                       '</tbody>'+
                           '<tbody>'+
                           '<tr>'+
                           '<td></td>'+
                           '<td>Итого</td>'+
                           '<td></td>'+
                           '<td></td>'+
                           '<td></td>'+
                           '<td>'+q+'</td>'+
                           '<td>'+(s).toFixed(2)+' '+upsertData.currency+'</td>'+
                           '</tr>'+
                           '</tbody></table>'+
                           '<table width="100%">'+
                           '<tr>'+
                           '<td>'+
                           '<h5>Данные для доставки</h5>'+
                           'ФИО : '+upsertData.profile['fio']+'<br>'+
                           'индекс : '+upsertData.profile['zip']+'<br>'+
                           /*'cтрана : '+upsertData.profile['country']+'<br>'+
                           'регион : '+upsertData.profile['region']+'<br>'+*/
                           'город : '+upsertData.profile['city']+'<br>'+
                           'адрес : '+upsertData.profile['address']+'<br>'+
                           'перевозчик : '+upsertData['shipper']+'<br>'+
                           'отделение : '+upsertData['shipperOffice']+
                           '</td>'+
                           '<td>'+
                           '<h5>Контактная информация</h5>'+
                           'телефон : '+upsertData.profile['phone']+'<br>'+
                           'e-mail  : '+user['email']+'<br>'+
                           'login: '+user['name']+'<br>'+
                           'комментарий  : '+upsertData['comment']+'<br>'+
                           '</td>'+
                           '</tr>'+
                           '<tr>'+
                           '<td colspan="2" style="background-color:#999"></td>'+
                           '</tr>'+
                           '</table>';
                   var end1 =
                       '</body>'+
                           '</html>';

                   var end2=
                       //'Менеджер свяжется с Вами в ближайшее время.'+ //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                       '</body>'+
                           '</html>';
                   var ss='заказ';
                   if (typeUpDate==2){
                        ss='дозаказ';
                   }


                   var messageBegin1=
                       '<html>'+
                           '<body bgcolor="#D4D4D4" topmargin="25">'+
                           '<h3>Здравствуйте</h3>'+
                           '<p>'+ss+' на сайте <a href="http://jadone.biz">jadone.biz</a> откорректирован, уточнен и принят к выполнению.</p>'+
                           '<p>Номер заказа: '+upsertData.num+'</p>'+
                           'Дата : '+moment(dateForTable).format('LLL')+'<br>';

                   var messageBegin2=
                       '<html>'+
                           '<body bgcolor="#D4D4D4" topmargin="25">'+
                           '<h3>Здравствуйте!</h3>'+
                           '<p>Ваш '+ss+' на сайте <a href="http://jadone.biz">jadone.biz</a> оформлен и принят к выполнению.</p>'+
                           'Теперь Вы можете оплатить заказ из  <a href="jadone.biz/ru/customorder">ЛИЧНОГО КАБИНЕТА</a> ' +

                           '<p>Номер заказа: '+upsertData.num+'</p>'+
                           'Дата : '+moment(dateForTable).format('LLL')+'<br>';

                   async.series([
                       function(callback){
                           mailOptions.html=messageBegin2+message+end2;
                           mailOptions.to=user.email;
                           smtpTransport.sendMail(mailOptions, function(error, response){
                               if(error){
                                   callback(error);
                               }else{
                                   callback(null);
                               }
                           });
                       },
                       function(callback){
                           mailOptions.html=messageBegin1+message+end1;
                           mailOptions.to=mailChat;
                           smtpTransport.sendMail(mailOptions, function(error, response){
                               if(error){
                                   callback(error);
                               }else{
                                   callback(null);
                               }
                           });
                       }
                   ],
                       function(err, results){
                           smtpTransport.close(); // shut down the connection pool, no more messages
                           if (err)
                               cb(err)
                           else
                               cb(null)
                       });


               })

           }

           function createMail(upsertData,cb,type){ //first email
               // type =1 дозаказ к открытому ордеру
               // type = 2 первый дозаказ или новый дозаказ
               // type = 3 есть открытый дозаказ

               var dateForTable=upsertData.date;
               var smtpTransport = nodemailer.createTransport("SMTP",{
                   service: "Mailgun",
                   auth: {
                       user: "postmaster@jadone.biz",
                       pass: "73o6okae8971"
                   }
               });
               var mailOptions = {
                   from: "noreplay ✔ <noreplay@jadone.biz>", // sender address
                   subject: "order ✔", // Subject line
                   html:""
               }
               User.findById(upsertData.user).exec(function(err,user){
                   if (err) cb(err);
                   // chat ********************************
                   var mailChat=config.email.opt;
                   if(user.profile['country'] && (user.profile['country'].toLowerCase()=="украина"||
                       user.profile['country'].toLowerCase()=="україна"||user.profile['countryId']=='UA')) { // UA opt
                       mailChat=config.email.optUA;
                       //upsertData.country='UA';
                   }
                   /*if (upsertData.quantity<5){ // retail
                       mailChat=config.email.retail;
                   } else if(user.profile['country'] && user.profile['country'].toLowerCase()=="украина") { // UA opt
                       mailChat=config.email.optUA;
                       //upsertData.country='UA';
                   } else { // OPT

                   }*/
                   User.findOne({email:mailChat}).exec(function(err,manager){
                       //console.log('manager -'+manager);
                       if (manager && !manager._id.equals(user._id)){
                           var query={ $and: [ { members:user._id  }, {members:manager._id} ] };
                           /*console.log(manager._id);
                            console.log(userm._id);*/
                           Chat.findOne(query,function (err, chat) {
                               //console.log('chat -'+chat);
                               if (err) throw err;
                               if (!chat){
                                   chat= new Chat({members:[user._id,manager._id]});

                               }
                               var date = Date.now();

                               var opt = (upsertData.quantity>=5)?true:false;
                               var msg='Оформлен заказ по ';
                               if (type && type==1){
                                   msg='Дооформлен заказ по ';
                               }

                               msg +="<a ng-click=\"goToOrder('"+upsertData.num +"','"+manager._id +"',"+opt +")\">ордеру N "+upsertData.num+"</a></br>";
                               msg +='сумма итого - '+(upsertData.sum*upsertData.kurs).toFixed(2)+' '+upsertData.currency;
                               msg +=', в количестве - '+upsertData.quantity+'</br>';
                               msg +='заказчик - '+upsertData.profile['fio']+'</br>';
                               msg +='ствана -'+upsertData.profile['country']+'</br>';
                               msg +='город -'+upsertData.profile['city']+'</br>';
                               msg +='телефон -'+upsertData.profile['phone']+'</br>';
                               msg +='перевозчик : '+upsertData['shipper']+'<br>';
                               msg +='отделение : '+upsertData['shipperOffice']+'<br>';
                               msg +='e-mail -'+user.email+'</br>';;
                               msg +='login -'+user.name;
                               chat.chat.push({user:user._id,msg:msg,date:date});
                               chat.save();
                               sendSocketMsg(user._id,manager._id,msg,date,chat);
                           })
                       }


                   })
                   //**************************************
                   // console.log(user);
                   var  message =

                       '<table width="100%" border="1px" style="border-color: #ccc;">'+
                           ' <tbody>'+
                           '  <tr>'+
                           '   <td style="background-color: #999;">#</td><td style="background-color: #999">Категория</td><td style="background-color: #999">Артикул</td><td style="background-color: #999">Размер</td><td style="background-color: #999">Цена</td><td style="background-color: #999">Кол-во</td><td style="background-color: #999">Сумма</td>'+
                           '  </tr>'+
                           ' </tbody>'+
                           ' <tbody>';
                   var cartData=upsertData['cart'];
                   if (type && type>1){
                       cartData=upsertData.addInCart[upsertData.addInCart.length-1]['cart'];
                   }
                    var q= 0,s=0;
                   cartData.forEach(function(good,index){
                       message +=
                           '<tr>'+
                               '<td>'+(++index)+'</td><td>'+good.categoryName+'</td><td>'+good['name']+' '+good['colorName']+'</td><td>'+good['sizeName']+'</td>';
                       var sum = (upsertData.quantity>=5)?good.price:good.retail;
                       message +=
                           '<td>'+(upsertData.kurs* sum).toFixed(2)+' '+upsertData.currency+'</td><td>'+good['quantity']+'</td>';
                       var localSum = upsertData.kurs* sum*good['quantity'];
                       message +=
                           '<td>'+(localSum).toFixed(2)+' '+upsertData.currency+'</td></tr>';
                       s +=localSum;
                       q +=good['quantity'];
                   })
                   //sumAll.toFixed(2);
                   message +=
                       '</tbody>'+
                           '<tbody>'+
                           '<tr>'+
                           '<td></td>'+
                           '<td>Итого</td>'+
                           '<td></td>'+
                           '<td></td>'+
                           '<td></td>'+
                           '<td>'+q+'</td>'+
                           '<td>'+(s).toFixed(2)+' '+upsertData.currency+'</td>'+
                           '</tr>'+
                           '</tbody></table>'+
                           '<table width="100%">'+
                           '<tr>'+
                           '<td>'+
                           '<h5>Данные для доставки</h5>'+
                           'ФИО : '+upsertData.profile['fio']+'<br>'+
                           'индекс : '+upsertData.profile['zip']+'<br>'+
                           /*'cтрана : '+upsertData.profile['country']+'<br>'+
                           'регион : '+upsertData.profile['region']+'<br>'+*/
                           'город : '+upsertData.profile['city']+'<br>'+
                           'адрес : '+upsertData.profile['address']+'<br>'+
                           'перевозчик : '+upsertData['shipper']+'<br>'+
                           'отделение : '+upsertData['shipperOffice']+
                           '</td>'+
                           '<td>'+
                           '<h5>Контактная информация</h5>'+
                           'телефон : '+upsertData.profile['phone']+'<br>'+
                           'e-mail  : '+user['email']+'<br>'+
                           'login: '+user['name']+'<br>'+
                           'комментарий  : '+upsertData['comment']+'<br>'+
                           '</td>'+
                           '</tr>'+
                           '<tr>'+
                           '<td colspan="2" style="background-color:#999"></td>'+
                           '</tr>'+
                           '</table>';
                   var end1 =
                       '</body>'+
                           '</html>';

                   var end2=
                       'Менеджер свяжется с Вами в ближайшее время.<br>' +


                           '</body>'+
                           '</html>';
                   var ss='поступил  заказ';
                   if (type){
                       if (type==1)
                        ss='дооформлен заказ';
                       else if (type==2)
                           ss='поступил дозаказ';
                       else if (type==3)
                           ss='уточнен дозаказ';
                   }

                   var messageBegin1=
                       '<html>'+
                           '<body bgcolor="#D4D4D4" topmargin="25">'+
                           '<h3>Здравствуйте</h3>'+
                           '<p>'+ss+' заказ с сайта <a href="http://jadone.biz">jadone.biz.</a></p>'+
                           '<p>Номер заказа: '+upsertData.num+'</p>'+
                           'Дата : '+moment(upsertData.date).format('LLL')+'<br>';

                   var messageBegin2=
                       '<html>'+
                           '<body bgcolor="#D4D4D4" topmargin="25">'+
                           '<h3>Здравствуйте!</h3>'+
                           '<p>С Вашего адреса на сайте<a href="http://jadone.biz"> jadone.biz</a> '+ss+':</p>' +
                           'Оплатить заказ Вы сможете из  <a href="jadone.biz/ru/customorder">ЛИЧНОГО КАБИНЕТА</a> ' +
                                'после изменения менеджером статуса Вашего заказа с ПОСТУПИЛ на ПРИНЯТ'+
                           '<p>Номер заказа: '+upsertData.num+'</p>'+
                           'Дата : '+moment(upsertData.date).format('LLL')+'<br>';



                   async.series([
                       function(callback){
                           mailOptions.html=messageBegin2+message+end2;
                           mailOptions.to=user.email;
                           smtpTransport.sendMail(mailOptions, function(error, response){
                               if(error){
                                   callback(error);
                               }else{
                                   callback(null);
                               }
                           });
                       },
                       function(callback){
                           mailOptions.html=messageBegin1+message+end1;
                           mailOptions.to=mailChat;
                           smtpTransport.sendMail(mailOptions, function(error, response){
                               if(error){
                                   callback(error);
                               }else{
                                   callback(null);
                               }
                           });
                       }
                   ],
                       function(err, results){
                           smtpTransport.close(); // shut down the connection pool, no more messages
                           if (err)
                               cb(err)
                           else
                               cb(null)
                       });


               })

           }
        }); // d.run

    }

    function sendSocketMsg(from,to,msg,date,chat){
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
        var a = wherefoo(chatRoom,{nickname:to});
        var b = wherefoo(chatRoom,{nickname:from});
        console.log('a.length-'+a.length);
        console.log('b.length-'+b.length);
        _.each(b,function(chat){
            chat.emit('new:msg',{msg:msg,date:date,from:from,to:to},function(res){
                console.log(res);
            })
        })
        var arr =[];
        _.each(a,function(chat){
            var c = function(cb){
                chat.emit('new:msg',{msg:msg,date:date,from:from,to:to},function(res){
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
            if (read){
                chat.chat[chat.chat.length-1].status=[to];
                chat.save();
            }
        })

    }


    this.getDaySummary=function(req,res,next){
        if (req.query && req.query.dtfrom && req.query.dtto){
            var start=new Date(req.query.dtfrom);
            var  end =new Date(req.query.dtto);
            if (end>=start){
                var query = {date: {
                    $gte:start,
                    $lte: end
                }};
            }

        } else {
            var date = new Date();
            date.setDate(date.getDate() - 1);
            var from = date.setHours(0,0,0);
            var to   = date.setHours(23,59,59);
            /*var start=new Date(from);
             var  end =new Date(to);*/
            var query = {date: {
                $gte:from,
                $lte: to
            }};
        }




        /*console.log( moment(from).format());
        console.log( moment(to).format());*/

        async.series([
            function(cb){
                Order.find(query).populate('user').exec(function(err,res){
                    if(err) return next(err);
                    cb(null,res);
                });
            },
            function(cb){
                User.find(query).exec(function(err,res){
                    if(err) return next(err);
                    cb(null,res);
                });;
            }
        ],function(errors,results){
            //console.log(results);
            return res.json([results[0],results[1]]);
        });

    }


}



module.exports = order;




