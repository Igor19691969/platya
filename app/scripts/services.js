'use strict';

/* Services */
function findById(collection,id){
    for (var i=0;i<collection.length;i++){
        if (collection[i]._id==id){
            return collection[i];
            break;
        }
    }
    return null;
};

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
     value('version', '0.1')
    //http://michaeleconroy.blogspot.com/2013_09_01_archive.html
    .factory('$global',['$http',function($http){
        var _urls = {
            country : '/api/getip/',
            config : '/api/config/',
            categories : '/api/category/',
            user:'/api/users/me/'
        }; // end urls
        var _currency,
            _country,
            _config,
            _categories;
        var _user = null;
        var _titles={};

        return {
            request : function(url,vars){
                if(angular.isDefined(vars)){
                    return $http.post(url,$.param(vars),{headers:{'Content-Type': 'application/x-www-form-urlencoded'}});
                }else{
                    return $http.get(url);
                }
            },

            url : function(which){
                return _urls[which];
            }, // end url
            setCurrency : function(data){
                _currency = data;
            },
            getCarrency : function(){
                return _currency;
            },
            setCongif : function(data){
                _config = data;
            },
            getCongif : function(){
                return _config;
            },
            setCountry : function(data){
                if (data.country_code){
                    _country = data.country_code;
                    if (data.country_code=='RU' || data.country_code=='RUS'){
                        _currency="RUB";
                    } else if (data.country_code=='UA'){
                        _currency="UAH";
                    }
                    else {
                        _currency="USD";
                    }
                }
           },
            getCountry : function(){
                return _country;
            },
            setCategories : function(data){
                _categories = data;
            },
            getCategories : function(){
                return _categories;
            },
            setUser : function(aUser){
                if (!aUser._id && aUser.id) { aUser._id=aUser.id;}
                if (!aUser.id && aUser._id) { aUser.id=aUser._id;}
                _user = aUser;;
            },
            getUser : function(){
                return _user;
            },
            setTitles : function(data){
                _titles = data;
            },
            getTitles : function(){
                return _titles;
            }
        };


    }]) // end $global

    .factory('subjectSrv',['$global',function($global){
        //-- Variables --//
        var _send = $global.request;

        //-- Methods --//
        return {
            subjects : function(){
                return _send($global.url('subjects'));
            }, // end subjects

            course : function(abbr,num){
                var url = $global.url('course');
                if(angular.isDefined(abbr) && !(angular.equals(abbr,null) || angular.equals(abbr,'')))
                    url += 'abbr/' + abbr + '/';

                if(angular.isDefined(num) && !(angular.equals(num,null) || angular.equals(num,'')))
                    url += 'num/' + num;

                return _send(url);
            }, // end course
            categories:function(){
                return _send($global.url('categories'));
            },
            country:function(){
                return _send($global.url('country'));
            },
            config:function(){
                return _send($global.url('config'));
            },
            user:function(){
                return _send($global.url('user'));
            }

        };
    }]) // end subjectSrv / module(myapp.services)



    .factory('User', function ($resource) {
        return $resource('/api/users/:id/:email', {
            id: '@id'
        }, { //parameters default
            update: {
                method: 'PUT',
                params: {
                    id:'profile',
                    email:''
                }
            },
            updatePswd: {
                method: 'PUT',
                params: {
                    // id:'profile'
                    id:'changepswd',
                    email:''
                }
            },
            resetPswd: {
                method: 'POST',
                params: {
                    id:'resetpswd',
                    email:'@email'
                }
            },
            get: {
                method: 'GET',
                params: {
                    id:'me',
                    email:''
                }
            }
        });
    })
    .factory('UserService',[function(){
        var sdo={
            isLogged:false
        }
        return sdo;
    }])

.factory('Session',['$resource', function ($resource) {
        return $resource('/api/session/');
    }])

    .factory('Chat',['$resource', function($resource){
        return $resource('/api/chat/:from/:to', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            delete: {method:'DELETE',params: {}}
            /*add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@id'}}*/
        });
    }])

.factory('Auth',['$timeout', '$rootScope', 'Session', 'User', '$global',
        function Auth($timeout, $rootScope, Session, User,$global) {

        // Get currentUser from cookie
       /* $rootScope.currentUser = $cookieStore.get('user') || null;
        $cookieStore.remove('user');*/

        //console.log($rootScope.currentUser);
        var user={},that=this;
        User.get(function(aUser){
            if (!aUser._id && aUser.id) { aUser._id=aUser.id;}
            if (!aUser.id && aUser._id) { aUser.id=aUser._id;}
            if (aUser._id){
                user= aUser;
                $timeout(function(){$rootScope.$broadcast('logged', user);},100)
            }

        });

        return {

            /**
             * Authenticate user
             *
             * @param  {Object}   user     - login info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            login: function(userInfo, callback) {
                var cb = callback || angular.noop;
                return Session.save({
                    email: userInfo.email,
                    password: userInfo.password
                }, function(aUser) {
                    //setUser(aUser);
                    if (!aUser._id && aUser.id) { aUser._id=aUser.id};
                    if (!aUser.id && aUser._id) { aUser.id=aUser._id;}
                    user=aUser;
                    $rootScope.$broadcast('logged', user);
                    //console.log(that.user)
                    return cb();
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            /**
             * Unauthenticate user
             *
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            logout: function(callback) {
                var cb = callback || angular.noop;
                return Session.delete(function() {
                        user={};
                        $rootScope.$broadcast('logout', user);
                        return cb();
                    },
                    function(err) {
                        return cb(err);
                    }).$promise;
            },

            /**
             * Create a new user
             *
             * @param  {Object}   user     - user info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            createUser: function(userInfo, callback) {
                var cb = callback || angular.noop;
               return User.save(userInfo,
                    function(aUser) {
                        if (!aUser._id && aUser.id) { aUser._id=aUser.id;}
                        if (!aUser.id && aUser._id) { aUser.id=aUser._id;}
                        user=aUser;
                        $rootScope.$broadcast('logged', user);
                        return cb();
                        // авторизация сразу после регистрации
                        /*Session.save({
                            email: userInfo.email,
                            password: userInfo.password
                        },function(aUser){
                            if (!aUser._id && aUser.id) { aUser._id=aUser.id;}
                            if (!aUser.id && aUser._id) { aUser.id=aUser._id;}
                            user=aUser;
                            return cb();
                        })*/

                    },
                    function(err) {
                        return cb(err);
                    }).$promise;
            },

            /**
             * Change password
             *
             * @param  {String}   oldPassword
             * @param  {String}   newPassword
             * @param  {Function} callback    - optional
             * @return {Promise}
             */
            changePassword: function(oldPassword, newPassword, callback) {
                var cb = callback || angular.noop;

                return User.updatePswd({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }, function(aUser) {
                    return cb(aUser);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },
            resetPswd: function( email,callback) {
                var cb = callback || angular.noop;
                return User.resetPswd(email, function(aUser) {
                    return cb(aUser);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            /**
             * Gets all available info on authenticated user
             *
             * @return {Object} user
             */
            currentUser: function() {
                return user;
            },

            setUserProfile :function(profile){
                user.profile=profile;
            },

            /**
             * Simple check to see if a user is logged in
             *
             * @return {Boolean}
             */
            isLoggedIn: function(){
                //console.log(user.id);
                return(user && user.id)? user : false;
            }
        };
    }])

    .factory('Config',['$resource', function ($resource) {
        return $resource('/api/config');
    }])

    .factory('Filters',['$resource', function($resource){
        return $resource('/api/filters/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@id'}}
        });
    }])
    .factory('Tags',['$resource', function($resource){
        return $resource('/api/tag/:filter/:id', {}, {
            list: {method:'GET', isArray: true, params:{filter:'@filter',id:''}},
            add: {method:'POST',params:{filter:'@filter',id:''}},
            update: {method:'PUT',params: {filter:'@filter',id: ''}},
            delete: {method:'DELETE',params: {filter:'@filter',id: '@_id'}},
            get:{method:'GET', params: {filter:'filter',id: '@id'}}
        });
    }])

    .factory('BrandTags',['$resource', function($resource){
        return $resource('/api/brandtags/:brand/:id', {}, {
            list: {method:'GET', isArray: true, params:{brand:'@brand',id:''}},
            add: {method:'POST',params:{brand:'',id:''}},
            update: {method:'PUT',params: {brand:'',id: ''}},
            delete: {method:'DELETE',params: {brand:'@brand',id: '@_id'}},
            get:{method:'GET', params: {brand:'brand',id: '@_id'}}
        });
    }])

    .factory('Brands',['$resource', function($resource){
        return $resource('/api/brand/:_id', {}, {
            list: {method:'GET', isArray: true, params:{_id:''}},
            add: {method:'POST',params:{_id:''}},
            update: {method:'PUT',params: {_id: ''}},
            delete: {method:'DELETE',params: {_id: '@_id'}},
            get:{method:'GET', params: {_id: '@_id'}}
        });
    }])

    .factory('BrandTags',['$resource', function($resource){
        return $resource('/api/brandtags/:brand/:id', {}, {
            list: {method:'GET', isArray: true, params:{brand:'@brand',id:''}},
            add: {method:'POST',params:{brand:'',id:''}},
            update: {method:'PUT',params: {brand:'',id: ''}},
            delete: {method:'DELETE',params: {brand:'@brand',id: '@_id'}},
            get:{method:'GET', params: {brand:'brand',id: '@_id'}}
        });
    }])
    .factory('Category',['$resource', function($resource){
        return $resource('/api/category/:_id', {}, {
            list: {method:'GET', isArray: true, params:{_id:''}},
            add: {method:'POST',params:{_id:''}},
            update: {method:'PUT',params: {_id: ''}},
            delete: {method:'DELETE',params: {_id: '@_id'}},
            get:{method:'GET', params: {_id: '@_id'}}
        });
    }])

    .factory('Comment',['$resource', function($resource){
        return $resource('/api/commentStuff/:stuff/:_id', {}, {
            list: {method:'GET', isArray: true, params:{stuff:"@stuff",_id:''}},
            add: {method:'POST',params:{stuff:"",_id:''}},
            update: {method:'PUT',params: {stuff:"",_id: ''}},
            delete: {method:'DELETE',params: {stuff:"",_id: '@_id'}},
            get:{method:'GET', params: {stuff:"stuff",_id: '@_id'}}
        });
    }])

    .factory('Stuff',['$resource', function($resource){
        return $resource('/api/stuff/:category/:brand/:id', {}, {
            list: {method:'GET', isArray: true, params:{category:'@category',brand:'@brand',id:''}},
            add: {method:'POST',params:{category:'category',brand:'brand',id:''}},
            update: {method:'PUT',params: {category:'category',brand:'brand',id:''}},
            updateGallery: {method:'PUT',params: {category:'category',brand:'brand',id:'gallery'}},
            delete: {method:'DELETE',params: {category:'category',brand:'brand',id:'@_id'}},
            get:{method:'GET', params: {category:'category',brand:'brand',id:'@_id'}},
            full:{method:'GET', params: {category:'category',brand:'brand',id:'@_id'}}
        });
    }])

    .factory('Country',['$resource', function($resource){
        return $resource('/api/country/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@_id'}}
        });
    }])
    .factory('Region',['$resource', function($resource){
        return $resource('/api/region/:country/:id', {}, {
            list: {method:'GET', isArray: true, params:{country:'@country',id:''}},
            add: {method:'POST',params:{country:'country',id:''}},
            update: {method:'PUT',params: {country:'country',id: ''}},
            delete: {method:'DELETE',params: {country:'country',id: '@_id'}},
            get:{method:'GET', params: {country:'country',id: '@_id'}}
        });
    }])
    .factory('City',['$resource', function($resource){
        return $resource('/api/city/:region/:id', {}, {
            list: {method:'GET', isArray: true, params:{region:'@region',id:''}},
            add: {method:'POST',params:{region:'region',id:''}},
            update: {method:'PUT',params: {region:'region',id: ''}},
            delete: {method:'DELETE',params: {region:'region',id: '@_id'}},
            get:{method:'GET', params: {region:'region',id: '@_id'}}
        });
    }])

    .factory('Orders',['$resource', function($resource){
        return $resource('/api/order/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@_id'}}
        });
    }])

    .factory('News',['$resource', function($resource){
        return $resource('/api/news/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id:''}},
            updateGallery: {method:'PUT',params: {id:'gallery'}},
            delete: {method:'DELETE',params: {id:'@_id'}},
            get:{method:'GET', params: {id:'@_id'}}
            //full:{method:'GET', params: {id:'@_id'}},
        });
    }])



    .factory('Stat',['$resource', function($resource){
        return $resource('/api/stat/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id:''}},
            delete: {method:'DELETE',params: {id:'@_id'}},
            get:{method:'GET', params: {id:'@_id'}},
        });
    }])

    .factory('CartLocal',['localStorage','$http','$rootScope','$filter','$timeout','$location', function(localStorage,$http,$rootScope,$filter,$timeout,$location){
        var self = this;
        self.sum;
        self.quantity;
        //console.log('dddd');
        var cartItems = [];
        var cartItems = localStorage.get('cart');


        var cartComment='';

        var sendOrder= true;
        var items = cartCount();
        //console.log(items);

        var divider = 1;

        function list(){
            return cartItems;
        }
        function cartCount(){
            var i=0;
            cartItems.forEach(function(item){
                //console.log(item.quantity);
                if(item.quantity)
                    i +=Number(item.quantity);
            })
            return i;
        }

        function getCount(itemTo){
            //console.log('ss');
            var count = 1;
            cartItems.forEach(function(current){
                if (current.size == itemTo.size && current.stuff == itemTo.stuff && current.color == itemTo.color){
                    count = current.quantity;
                }
            })
            return count;
        }

        function addToCart(itemTo){
            //console.log(itemTo);
            var itemFound = false;

            cartItems.forEach(function(current){
                //console.log(current);

                if (current.size == itemTo.size && current.stuff == itemTo.stuff && current.color == itemTo.color){
                    current.quantity = itemTo.quantity;
                    //console.log(current.quantity);
                    itemFound=true;
                }
            });

            if (!itemFound){
                //item.quantity;
                var itemToCart= new Object;
                itemToCart = JSON.parse(JSON.stringify(itemTo));

                cartItems.push(itemToCart);
            }

            localStorage.set('cart', cartItems);
            localStorage.set('cart-count',items);
            //$rootScope.itemsOnCart = items;
        };

        function getItem(i){
            return cartItems[i];
        }
        function getItems(){
            return cartItems;
        }

        function save(){
            localStorage.set('cart', cartItems);
        }


        function getTotalSum(){

            var sum=0;
            var i = cartCount();
            cartItems.forEach(function(c){
                var q = (i>=5)? c.price: c.retail;
                sum += q * c.quantity;
            });
            //console.log(grandTotal);
            return sum;

        }

        /*function getSum(current){

            var i;

            if  (current.price){
                i=Number(current.new_price);
            } else{
                i=Number(current.price);
            }

            return i * Number(current.quantity);

        }*/


        function clearCart(){
            //console.log('ssss');
            cartItems = [];
            save();


        }


        function removeItem(i){
            cartItems.splice(i,1);
            save();
        }


        function send(arg,callback){
            //console.log($rootScope)
            var lang=arg.lang,
                comment =arg.comment,
                kurs=arg.kurs,
                currency=arg.currency,
                profile=arg.profile,
                shipper=arg.shipper,
                shipperOffice=arg.shipperOffice;
           /* self.quantity=cartCount();
            self.sum:*/
            //var ss = $rootScope.user.profile.country.toLowerCase();
            //var country = (ss=='украина' || ss=="україна")?'UA':"ELSE";
            var country =profile.countryId;
            var order={
                'cart':cartItems,
                'comment':comment,
                'lang':lang,
                'user':$rootScope.user._id,
                'quantity':cartCount(),
                'sum':getTotalSum(),
                'kurs':kurs,
                'currency':currency,
                //'address':profile.address,
                fio:profile.fio,
                country:country,
                profile:profile,
                shipper:shipper,
                shipperOffice:shipperOffice
            }
            //console.log(order);return;
            $http.post('/api/order',order).then(
                function (resp) {
                    console.log(resp.data);
                    callback(false,resp.data);
                    /*if (resp.data.done){
                        *//*cartItems = [];
                        save();*//*
                        callback(false,resp.data);
                    } else {
                        callback(resp.data.err);
                    }*/
                },
                function(err){
                    callback(err.data);
                })


        };




        return{
            addToCart:addToCart,
            list:list,
            cartCount:cartCount,
            getCount : getCount,
            getItem:getItem,
            getItems:getItems,
            getTotalSum:getTotalSum,
            save:save,
            clearCart:clearCart,
            removeItem:removeItem,
            send:send
        }
    }])

    .factory('localStorage', function(){
        var APP_ID =  'fraim-local-storage';

        // api exposure
        return {
            // return item value
            getB: function(item){

                return JSON.parse(localStorage.getItem(item) || 'false');
            },
            // return item value
            getN: function(item){
                var i = localStorage.getItem(item);
                if (i!='undefined'){
                    return JSON.parse(i)
                }
                else
                    return '';
            },
            // return item value
            get: function(item){
                return JSON.parse(localStorage.getItem(item) || '[]');
            },
            set: function(item, value){
                // set item value
                localStorage.setItem(item, JSON.stringify(value));
            }

        };

    })


    .factory('socket', function (socketFactory) {
        return socketFactory();
    })

    .provider('chats', function () {

       return {
           world: 'World',
           listUsers : [],
           activeChat:{},
           chatList :[],

            $get: function(socket,Chat,$rootScope,$timeout) {

                var that=this;
                var msgs =[];
                //activeChat={};
                //var chatList =[];
                    //listUsers=[];

                function clearArray(A){
                    while(A.length > 0) {
                        A.pop();
                    }
                }



                function refreshLists(user,logout){
                    //console.log(user);
                    clearArray(that.chatList);
                    clearArray(that.listUsers);
                    if (logout) return;
                    if (!that.activeChat['_id'] || !enter){
                        that.activeChat['_id']='';
                        that.activeChat['name']='';
                        that.activeChat['more']=false;
                        that.activeChat['page']=1;
                    }


                    Chat.list({from:user._id},function(res){
                        //console.log(res);
                        for (var i= 0,l=res.length;i<l;i++){
                            that.chatList.push(res[i]);
                        }
                    });
                    if (user.role=='admin'){
                        Chat.list(function(res){
                            //console.log(res);
                            for (var i= 0,l=res.length;i<l;i++){
                                that.listUsers.push(res[i]);
                            }

                        })

                    }
                }

                /*function changeUser(enter){
                    refreshLists(enter)
                    if (enter){
                        socket.emit('new user in chat',$rootScope.user._id);
                    } else {
                        socket.emit('delete user from chat');
                    }
                }*/



                socket.on('who are you',function(cb){
                    //console.log('who are you');
                    var id = ($rootScope.user&&$rootScope.user._id)?$rootScope.user._id:'user not auth';
                    //console.log(id);
                    cb(id);
                })

               socket.on('new:msg',function(data,cb){

                   //console.log(data);
                   var from= data.from;
                   var to= data.to;
                   var status=true;
                   if (from!=$rootScope.user._id){
                       $.playSound('sounds/chat');
                   }
                   //console.log("$rootScope.$state.includes('language.chat') = "+$rootScope.$state.includes('language.chat'));
                    if ($rootScope.$state.includes('language.chat')){
                        if (to==that.activeChat._id || from==that.activeChat._id){

                           if (from==$rootScope.user._id){
                                var name =$rootScope.user.name;
                                var clas=true;
                                var item= to;
                            } else{
                                var name =that.activeChat.name;
                                var clas=false;
                                var item= from;
                            }
                            msgs[msgs.length]={name:name,msg:data.msg,date:data.date,class:clas,delete:false,_id:data._id};
                            //console.log({name:name,msg:data.msg,date:data.date,class:clas,delete:false,_id:data._id});
                        } else  {
                            status=false;
                        }
                        cb({cb:'cb from chat controller have read',status:status});
                    } else{
                        status=false;
                        cb({cb:"from mainFraim don't read",status:false});
                    }
                   //console.log(status);
                   if (!status && from==$rootScope.user._id  && !_.findWhere(that.chatList, {_id: data.to})){
                      // console.log('refreshList');
                       refreshLists(true);
                   }
                   if (!status && from!=$rootScope.user._id){ // not read
                       //console.log('ssssss');
                       if (_.findWhere(that.chatList, {_id: data.from})){
                           _.findWhere(that.chatList, {_id: data.from}).newMsg++;
                       } else { // there is not chat
                           refreshLists(true,function(){
                               /*console.log('add in chatList');
                               _.findWhere(that.chatList, {_id: data.from}).newMsg++;*/
                           });

                       }
                   }

                })


                function changeChat(chat,cb){
                    clearArray(msgs);

                    that.activeChat['_id']=chat._id;
                    that.activeChat['name']=chat.name;
                    that.activeChat['more']=false;
                    that.activeChat['page']=1;


                    _.findWhere(that.chatList, {_id: chat._id}).newMsg=0; // ????

                    Chat.list({from:$rootScope.user._id,to:that.activeChat._id,page:that.activeChat['page']},function(res){
                        //console.log(res);
                        var arr=[];
                        if (res[0]){
                            that.activeChat['more']=res[0].more;
                            _.findWhere(that.chatList, {_id: chat._id}).newMsg=res[0].newMsg;
                        }

                        //console.log(res[0]);
                        res.forEach(function(el){
                            if (el.user==that.activeChat._id){
                                el.name=that.activeChat.name;
                                el.class=false;
                            }else{
                                el.class=true;
                                el.name=$rootScope.user.name;
                            }
                            el.date=el.created;
                            el.delete=false;
                            msgs[msgs.length]=el;
                            //console.log(msgs);
                        })
                        //console.log(msgs);

                        if (cb){
                            cb(arr)
                        }

                        //console.log(msgs[chat._id].length);
                        //massages=$scope.msgs[chat._id];msgs[chat._id]
                    });
                }

                function moreMsgs(){
                    that.activeChat['page']++;
                    Chat.list({from:$rootScope.user._id,to:that.activeChat._id,page:that.activeChat['page'],last:msgs[0]._id},function(res){
                        var arr=[];
                        if (res[0]){
                            that.activeChat['more']=res[0].more;
                            _.findWhere(that.chatList, {_id: that.activeChat._id}).newMsg=res[0].newMsg;
                        }
                        res.forEach(function(el){
                            if (el.user==that.activeChat._id){
                                el.name=that.activeChat.name;
                                el.class=false;
                            }else{
                                el.class=true;
                                el.name=$rootScope.user.name;
                            }
                            el.date=el.created;
                            arr.push(el);
                        })
                        //console.log(arr);
                        for(var i=arr.length-1;i>=0;i--){
                            msgs.unshift(arr[i]);
                        }
                    });

                }


                function sendMsg(msg,cb){
                    socket.emit('new:msg',{from:$rootScope.user._id,to:that.activeChat._id,msg:msg});
                    cb();
                }

                function getMsgs(){
                    if (that.activeChat._id){
                        return msgs;
                    } else {
                        return  [];
                    }
                }
                /*function getlistUsers(){
                    return that.listUsers;
                }
                function getchatList(){
                    return chatList;
                }*/
                function addChat(user){
                    //console.log(user);
                    if(_.findWhere(that.chatList, {_id: user._id})){
                        //console.log('is chat');
                        _.findWhere(that.chatList, {_id: user._id}).newMsg=0;
                    } else {
                        user.newMsg=0;
                        that.chatList.push(user);
                    }


                }
                function updateListMsgs(to,from){
                    socket.emit('updateListMsgs',{to:to,from:from});
                }


                return {
                    sendMsg:sendMsg,
                    changeChat:changeChat,
                    listUsers:that.listUsers,
                   // listUsers1:listUsers,
                    world:this.world,
                    msqs:getMsgs,
                    chatList:that.chatList,
                    addChat:addChat,
                    activeChat:that.activeChat,
                    moreMsgs:moreMsgs,
                    updateListMsgs:updateListMsgs,
                    //changeUser:changeUser,
                    refreshLists:refreshLists
                }
            }
       }


    })

