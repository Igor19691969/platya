'use strict';
//
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    //nodemailer = require("nodemailer"),
    passport = require('passport');
//NodeJS user-agent middleware
//https://github.com/biggora/express-useragent
//http://www.gordejev.lv


    /**
 * Custom middleware used by the application
 */
module.exports = {

  /**
   *  Protect routes on your api from unauthenticated access
   */
  auth: function auth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send(401);
  },

  /**
   * Set a cookie for angular so it knows we have an http session
   */
  setUserCookie: function(req, res, next) {
    if(req.user) {
      res.cookie('user', JSON.stringify(req.user.userInfo));
    }
    next();
  },


  requiresLogin : function (req, res, next) {
    if (req.isAuthenticated() && (req.user.role=='admin' || req.user.role=='admin_order_retail'
        || req.user.role=='admin_order' || req.user.role=='admin_news' || req.user.role=='admin_catalog')) return next()
    //if (req.isAuthenticated()) return next()
    if (req.method == 'GET')
        req.session.returnTo = req.originalUrl
    res.redirect('/ru/login')
  },

  versionBrowser :  function (req, res, next) {

      if (req.useragent.Browser=='IE' && parseFloat(req.useragent.Version)<10){
         res.redirect('/IE89')
      } else {
          next();
      }

      //res.redirect('/ru/login')
  },

    forceLogin: function(req,res,next){
        var id= req.params.id;
        User.findById(id, function (err, user) {
            if (err) return next(new Error('Failed to load User'));
            //console.log(user);
            if (user) {
                //res.send({ profile: user.profile });
                //console.log(user);
                var email = user.email;
                var password ='123456';
                var data ={};
                data.body={email:email,password:'123456'};
                //console.log(data);
                passport.authenticate('local', function(err, user, info) {
                    var error = err || info;
                    //console.log('?-'+error);
                    if (error) return res.json(401, error);

                    req.logIn(user, function(err) {
                        //console.log(user);
                        // req.user.userInfo.userid=user._id;
                        //console.log(req.user.userInfo);
                       /* if (err) return res.send(err);
                        res.json(req.user.userInfo);*/
                        next();
                    });
                })(data, res, next);




            } else {
                res.send(404, 'USER_NOT_FOUND');
            }
        });
    },
    redirect: function(req,res,next){
        if (req.method == 'GET'){
           // console.log(req.originalUrl);
            if (req.originalUrl=='/ru/tovaryi/13/thumbIMG_3919'){ //платье Литиция (синий)
                //console.log('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368a212a3fe6bdc1fdc09ed/5364db8d707981801b256498');
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367c99e1b72646400c298f8/5367c9d61b72646400c298fb')
            }else if(req.originalUrl=='/ru/tovaryi/100/thumb0L9F3074'){ //туника Ажур (электрик)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07e433a62a3815491ba12/5367c9d61b72646400c298fb');
            }
            else if(req.originalUrl=='/ru/tovaryi/61/thumbIMG_1008'){ //платье Керри (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368c171d00a0d940e2d115f/5364db8d707981801b256498');
            }else if(req.originalUrl=='/ru/tovaryi/122/thumb0L9F3774'){ //сарафан Бриз (розовый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a2806d89ed366e72bf88dc/53a05de23a62a3815491b9cd');
            }else if(req.originalUrl=='/ru/tovaryi/118/thumb0L9F3315'){  //сарафан Кавалли (розовый)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2a7c589ed366e72bf88f6/53a05de23a62a3815491b9cd');
            }

            else if(req.originalUrl=='/ru/tovaryi/90/thumbALX_9261'){//юбка Бриджит (синий)
                res.redirect('/ru/stuff/category/539c3462bfb495d70ff7939b/stuffdetail/539c33d2bfb495d70ff7939a/5367c9d61b72646400c298fb');
            }else if(req.originalUrl=='/ru/tovaryi/1/thumbIMG_3702'){ //платье Астория (коралловый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367c7ea1b72646400c298ed/5367e30c1b72646400c29903');
            }

            else if(req.originalUrl=='/ru/tovaryi/62/thumbIMG_1118'){ //платье Фиджи (молочный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368c228d00a0d940e2d1166/5367c9be1b72646400c298f9');
            }
            else if(req.originalUrl=='/ru/tovaryi/101/thumbIMG_9159'){ //платье Dolce&Gabbana (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a05b913a62a3815491b9c2/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/117/thumb0L9F3507'){ //сарафан Флори (коралловый)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2aa0289ed366e72bf88ff/5364dbb2707981801b25649a');
            }
            else if(req.originalUrl=='/ru/tovaryi/113/thumb0L9F3426'){ //сарафан Шанди (красный)

                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3');
            }
            else if(req.originalUrl=='/ru/tovaryi/57/thumbIMG_9377'){ //платье Франческа (электрик)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368b9bcd00a0d940e2d1133/5367c9d61b72646400c298fb');
            }
            else if(req.originalUrl=='/ru/tovaryi/52/thumbIMG_9844'){//платье Валентино (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368a212a3fe6bdc1fdc09ed/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/140/thumb0L9F8683'){ //туника Ажур (сиреневый)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07ac53a62a3815491ba01/5399c88d60a171812bd46c9e');
            }
            else if(req.originalUrl=='/ru/tovaryi/93/thumbALX_8984'){ //платье Перис (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/539c2959103b3b680b0de308/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/117/thumb0L9F3241'){ //сарафан Флори (голубой)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a2aa0289ed366e72bf88ff/5368ca99d00a0d940e2d11a6');
            }
            else if(req.originalUrl=='/ru/tovaryi/68/thumbALX_3961'){ //туника Пальмира (чёрный)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/5368c4c2d00a0d940e2d1181/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/56/thumbIMG_9402'){ //платье Мэгги (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5368b7bfd00a0d940e2d112f/5364db8d707981801b256498');
            }

            else if(req.originalUrl=='/ru/tovaryi/27/thumbIMG_0025'){ //платье Валенсия (коралловый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367e6301b72646400c29915/5367e30c1b72646400c29903');
            }
            else if(req.originalUrl=='/ru/tovaryi/59/thumbIMG_1179'){ //костюм Винтаж (молочный)
                res.redirect('/ru/stuff/category/53a45cb0c9e647221f485349/stuffdetail/5368c04ed00a0d940e2d1153/5367c9be1b72646400c298f9');
            }
            else if(req.originalUrl=='/ru/tovaryi/22/thumbIMG_2885'){ //платье Прада (бежевый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367ea7f1b72646400c29924/5364db9a707981801b256499');
            }
            else if(req.originalUrl=='/ru/tovaryi/99/thumbIMG_8948'){ //туника Ажур (фуксия)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07e433a62a3815491ba12/5368bbc8d00a0d940e2d1136');
            }
            else if(req.originalUrl=='/ru/tovaryi/76/thumbALX_4132'){ //платье Рим (коралл)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/5368ca60d00a0d940e2d11a5/5367e30c1b72646400c29903');
            }
            else if(req.originalUrl=='/ru/tovaryi/95/thumbIMG_9290'){ //платье Chloe (белый)

                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a1325325835e0d6ff25de3/5368c6c1d00a0d940e2d1190');
            }
            else if(req.originalUrl=='/ru/tovaryi/29/thumbIMG_3637'){ //платье Верда (серый)

                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a8169b85c84bfc3340a719/5367c9cb1b72646400c298fa');
            }
            else if(req.originalUrl=='/ru/tovaryi/112/thumb0L9F3397'){ //сарафан Афродита (красный)

                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a060683a62a3815491b9d4/5367e30c1b72646400c29903');
            }
            else if(req.originalUrl=='/ru/tovaryi/8/thumbIMG_0108'){ //кардиган Империя (черный)
                res.redirect('/ru/stuff/category/53a806c085c84bfc3340a6e3/stuffdetail/53a8067d85c84bfc3340a6e2/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/75/thumbALX_4112'){ //платье Рим (корица)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/5368ca60d00a0d940e2d11a5/5368c8cbd00a0d940e2d1198');
            }
            else if(req.originalUrl=='/ru/tovaryi/104/thumbALX_0516'){ //сарафан Розалия (красные розы)

                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a14354d27e0adb6febb019/5367e30c1b72646400c29903');
            }
            else if(req.originalUrl=='/ru/tovaryi/96/thumbALX_0568'){ //сарафан Lola (бирюза)

                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/5367e3371b72646400c29906');
            }

            else if(req.originalUrl=='/ru/tovaryi/10/thumbIMG_3864'){ //кардиган Корона (черный)
                res.redirect('/ru/stuff/category/53a806c085c84bfc3340a6e3/stuffdetail/53a80be185c84bfc3340a6ec/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/114/thumb0L9F3556'){ //сарафан Сафари (оранжевый)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a075ba3a62a3815491b9ef/53a073313a62a3815491b9ee');
            }
            else if(req.originalUrl=='/ru/tovaryi/20/thumbIMG_3775'){ //платье Нюша (коралловый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a814cf85c84bfc3340a710/5367e30c1b72646400c29903');
            }
            else if(req.originalUrl=='/ru/tovaryi/96/thumbALX_0443'){ //сарафан Lola (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/539ed01ae3629ebd1ce62c9e/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/103/thumbIMG_8934'){ //платье Ришелье (белый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a1304c0260a82c6b2f15cb/5368c6c1d00a0d940e2d1190');
            }
            else if(req.originalUrl=='/ru/tovaryi/12/thumbIMG_3822'){ //платье Лилия (лиловый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a80f8285c84bfc3340a6fa/5367e32c1b72646400c29905');
            }

            else if(req.originalUrl=='/ru/tovaryi/19/thumbIMG_3726'){ //платье Нори (черный)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/5367e4b81b72646400c2990e/5364db8d707981801b256498');
            }
            else if(req.originalUrl=='/ru/tovaryi/8/thumbIMG_3866'){ //кардиган Империя (коричневый)
                res.redirect('/ru/stuff/category/53a806c085c84bfc3340a6e3/stuffdetail/53a8067d85c84bfc3340a6e2/53a806e485c84bfc3340a6e4');
            }
            else if(req.originalUrl=='/ru/tovaryi/100/thumbIMG_9061'){ //туника Ажур (белый)
                res.redirect('/ru/stuff/category/5367eb481b72646400c2992a/stuffdetail/53a07ac53a62a3815491ba01/5368c6c1d00a0d940e2d1190');
            }
            else if(req.originalUrl=='/ru/tovaryi/123/thumb0L9F3707'){ //сарафан Фиалка (фиолетовый)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a27f7b89ed366e72bf88d8/5367e32c1b72646400c29905');
            }
            else if(req.originalUrl=='/ru/tovaryi/96/thumbALX_0549'){ //сарафан Lola (салатовый)

                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3');
            }
            else if(req.originalUrl=='/ru/tovaryi/115/thumb0L9F3653'){ //сарафан Мафия (коралловый)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/53a071193a62a3815491b9e5/5364dbb2707981801b25649a');
            }
            else if(req.originalUrl=='/ru/tovaryi/116/thumb0L9F3204'){ //платье Лагуна (желтый)
                res.redirect('/ru/stuff/category/5364d9c9707981801b25648f/stuffdetail/53a2ac9989ed366e72bf8908/5368c8cbd00a0d940e2d1198');
            }
            else if(req.originalUrl=='/ru/tovaryi/52/thumbIMG_9844'){ //платье Валентино (черный)
                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3');
            }
            else if(req.originalUrl=='/ru/tovaryi/135/thumb0L9F8912'){ // сарафан Розалия (бирюзовый)

                res.redirect('/ru/stuff/category/539c793ae3629ebd1ce62c93/stuffdetail/539ed01ae3629ebd1ce62c9e/539ed867e3629ebd1ce62ca3');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }

            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }
            else if(req.originalUrl==''){ //
                res.redirect('');
            }


            /*else if(req.originalUrl==''){ //
                res.redirect('');
            }*/

        }
        next();

    }

};


//ru/tovaryi/102/thumbALX_0345

//http:/localhost:8800/changecreditails/535ea88fb4ee684c1085c4ce