'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    nodemailer = require("nodemailer"),
    async=require("async"),
    passport = require('passport');
var domain = require('domain');









/**
 * Create user
 */
exports.create = function (req, res, next) {
    /*if (req.body.profile){
        req.body.profile=JSON.stringify(req.body.profile);
        console.log(req.body);
    }*/
   // console.log(req.body);
    var d = domain.create();
    d.on('error', function(error) {
        next(error);
    });
    d.run(function() {

      var newUser = new User(req.body);
      newUser.provider = 'local';

      newUser.save(function(err) {
        if (err) {
          // Manually provide our own message for 'unique' validation errors, can't do it from schema
          if(err.errors.email.type === 'Value is not unique.') {
            err.errors.email.type = 'The specified email address is already in use.';
          }
          return res.json(400, err);
        }

        req.logIn(newUser, function(err) {
          if (err) return next(err);
            return res.json({'status':'ok'})
          //return res.json(req.user.userInfo);
        });
      });
    });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(new Error('Failed to load User'));
  
    if (user) {
      res.send({ profile: user.profile });
    } else {
      res.send(404, 'USER_NOT_FOUND');
    }
  });
};

exports.list = function (req, res, next) {
    var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
    var perPage = (req.query && req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):20;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }
    var qArr=[];
    var fio={},name={},email={};
    if (req.query && req.query.name) {
        name ={name:RegExp(req.query.name.substring(0,50), "i")}
        qArr.push(name);
    }
    if (req.query && req.query.email) {
        //var query = RegExp(searchStr, "i");
        email ={email:RegExp(req.query.email.substring(0,50), "i")}
        qArr.push(email);
    }
    if (req.query && req.query.fio) {
        fio ={ 'profile.fio' : RegExp(req.query.fio.substring(0,50), "i")}
        qArr.push(fio);
    }
    if (qArr.length>1){
        options.criteria={$or:qArr};
    } else if (qArr.length=1) {
        options.criteria=qArr[0];
    }

    //console.log(options.criteria);
    User.find(options.criteria)
        .limit(options.perPage)
        .skip(options.perPage * options.page)
        .exec(function (err, users){
            if (err) return res.send(null, 500);
            if (page==0){
                User.count(options.criteria).exec(function (err, count) {
                    if (users.length>0){
                        users.unshift({'index':count});
                    }
                    return res.json(users)
                })
            } else {
                return res.json(users)
            }
        })



       /* function (err, users) {
        if (err) return next(new Error('Failed to load Users'));
        res.json(users);
    });*/
};

exports.delete = function (req, res, next) {
    User.findByIdAndRemove(req.params.id ,function (err, user) {
        if (err) return next(new Error('Failed to load User'));
        res.json({'status':'deleted'});
    });
};


/**
 * Change password
 */
exports.changePassword= function(req, res, next) {
    console.log('aaaa');
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {

      user.password = newPass;
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
};
function shuffle(len) {
    var string=
        //'abcdefghijklmnopqrstuvwxyzQAZWSXEDCRFVTGBYHNUJMIKOLP1234567890';
        '12345678901234567892101234567890123456789012345678901234567890';
    var parts = string.split('');
    for (var i = parts.length; i > 0;) {
        var random = parseInt(Math.random() * i);
        var temp = parts[--i];
        parts[i] = parts[random];
        parts[random] = temp;
    }
    return parts.join('').substring(0,len);
}



exports.resetPassword = function(req, res, next) {
    var email = req.body.email;

    //var newPass = String(req.body.newPassword);

    User.findOne({email:email}, function (err, user) {
        if(user) {
           // console.log(user);

            var password=shuffle(7);
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
            });



            user.password = password;
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
};


exports.changeProfile = function(req, res, next) {
    //console.log(req.body.profile);
    User.findById(req.body._id, function (err, user) {
        user.profile=req.body.profile;
        if (req.body.role && req.body.role!=user.role){
            user.role=req.body.role;
        }
            user.save(function(err) {
                if (err) {
                    res.send(500, err);
                } else {
                    res.send(200);
                }
            });
    });
};


exports.userOldTransform = function(req, res) {
    console.log(req.body);
    var i=0;
    //.return res.json({});
    async.each(req.body, function( user, callback) {

        i++;
        if (i<1000){
            user.date *=1000;
            user.password = '123456';
            var newUser = new User(user);
            newUser.provider = 'local';

            newUser.save(function(err) {
                //console.log(res);
                if (err) {
                    // Manually provide our own message for 'unique' validation errors, can't do it from schema
                    if(err.errors.email.type === 'Value is not unique.') {
                        err.errors.email.type = 'The specified email address is already in use.'+user.name;
                    }
                    callback(err.errors.email.type);
                } else {

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
                        //to: newUser.email, // list of receivers
                        //to:'igorchugurov@gmail.com',
                        to :newUser.email,
                        subject: "change account detail ✔", // Subject line
                        //text: "Hello world ✔", // plaintext body
                        html: "<div>Уважаемый пользователь.<br />В связи с модернизацией сайта http://jadone.biz/ Ваш пароль был временно изменен на 123456"+
                            ".<br />Ваш логин - "+newUser.name+
                            ".<br />Ваш е-mail - "+newUser.email+
                            "<br />Вы можете его изменить или восстановить свой старый пароль в личном кабинете, зайдя на сайт по <a href='http://localhost:8800/changecreditails/"+newUser._id+"'>данной ссылке<a/>,"+
                            "<br />или авторизоваться на сайте, используя свой логин и пароль 123456." +
                            "<br>Приносим извинения за причиненные неудобства.</div>"

                    }

                    smtpTransport.sendMail(mailOptions, function(error, response){
                        smtpTransport.close();

                        if(error){
                            console.log(error);
                            callback(error);
                        }else{
                            console.log("Message sent: " + response.message);
                            callback();
                        }

                        // if you don't want to use this transport object anymore, uncomment following line
                         // shut down the connection pool, no more messages
                    });


                }
            });
        } else {
            callback();
        }



        /*if( file.length > 32 ) {
            console.log('This file name is too long');
            callback('File name too long');
        } else {
            // Do work to process file here
            console.log('File processed');
            callback();
        }*/
    }, function(err){
        if( err ) {
            console.log(err);
        } else {
            console.log('All files have been processed successfully');
        }

        // if any of the file processing produced an error, err would equal that error
        /*if( err ) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A file failed to process');
        } else {
            console.log('All files have been processed successfully');
        }*/
    });
}



/**
 * Get current user
 */
exports.me = function(req, res) {
   // console.log(req.user);
  res.json(req.user || null);
};

exports.editForcePassword= function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
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



            user.password = password;
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
