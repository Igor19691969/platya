'use strict';
function getCookie(name) {
    var parts = document.cookie.split(name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


// Declare app level module which depends on filters, and services

var myApp= angular.module('myApp', [
        'ngRoute','ui.router','ngResource','ngCookies','ui.select2','ui.bootstrap','ngAnimate','btford.socket-io','i.mongoPaginate',
        'ngAutocomplete',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
])
.run(['$rootScope', '$state', '$stateParams','Config','User','Auth',
        function ($rootScope,   $state,   $stateParams,Config,User,Auth) {


    //console.log(Auth.isLoggedIn())
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    //console.log($stateParams);

    $rootScope.titles={};
    $rootScope.titles.pageTitle='';
    $rootScope.titles.pageKeyWords='';
    $rootScope.titles.pageDescription='';

        $rootScope.user=null;//User.get();


    $rootScope.activeG = null;
        $rootScope.activeM=null;
        $rootScope.config=Config.get();
        $rootScope.changeStuff=false;
        $rootScope.changeCategory=false;
        $rootScope.changeCollection=false;
        $rootScope.changeNews=false;
        $rootScope.changeStat=false;

        $rootScope.quantityUser=0;

        //http://pastebin.com/czJk3pmk
        $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {

        if(from.name=='mainFrame.stuff.editStuffGallery' || from.name=='mainFrame.stuff.edit'){
            $rootScope.changeStuff=true;
        }
        /*if(from.name=='mainFrame.category.edit'){
            console.log('gfd');
            $rootScope.changeCtegory=true;
            console.log($rootScope.changeCtegory);
        }*/
    })
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

            if(to.name=='mainFrame.stuff' && (from.name=='mainFrame.stuff.editStuffGallery' || from.name=='mainFrame.stuff.edit')){
                $rootScope.changeStuff=true;
            }
            if(to.name=='mainFrame.category' && from.name=='mainFrame.category.edit'){
                $rootScope.changeCategory=true;
            }
            if(to.name=='mainFrame.brands'&& from.name=='mainFrame.brands.edit'){
                $rootScope.changeBrand=true;
            }
            if(to.name=='mainFrame.collection' && from.name=='mainFrame.collection.edit'){
                $rootScope.changeCollection=true;
            }
            if(to.name=='mainFrame.news' &&( from.name=='mainFrame.news.editNewsGallery' || from.name=='mainFrame.news.edit')){
                $rootScope.changeNews=true;
            }
            if(to.name=='mainFrame.describe' && from.name=='mainFrame.describe.edit'){
                $rootScope.fromDescribeEdit=true;
            }
            /*if(to.name=='mainFrame.stat'){
                $rootScope.changeStat=true;
            }*/
        })
    }])

.config(['$stateProvider', '$urlRouterProvider','$locationProvider',function ($stateProvider,$urlRouterProvider,$locationProvider){

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $urlRouterProvider
        .when('/', '/admin123')
        .otherwise('/');

    $stateProvider
        .state("mainFrame", {
            url: "/admin123",
            abstract:true,
            templateUrl: function(){ return 'manager/views/partials/mainFrame.html' },
            controller: 'mainFrameCtrl'
        })
        .state("mainFrame.home", {
            url: "",
            templateUrl: function(){ return 'manager/views/partials//home.html' },
            controller: 'homeCtrl'
        })
        .state("mainFrame.goods", {
            url: "/goods/:id",
            templateUrl: function(){ return 'manager/views/partials/goods.html' },
            controller: 'goodsCtrl'
        })
        .state("mainFrame.comments", {
            url: "/comments/:id",
            templateUrl: function(){ return 'manager/views/partials/comments.html' },
            controller: 'commentsCtrl'
        })
        .state("mainFrame.uploadFile", {
            url: "/uploadFile",
            templateUrl: function(){ return 'manager/views/partials/uploadfile.html' },
            controller: 'uploadFileCtrl'
        })


        .state("mainFrame.filters", {
            url: "/filters",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/filters.html' },
            controller: 'filtersCtrl'
        })
        .state("mainFrame.brands", {
            url: "/brands",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/brands.html' },
            controller: 'brandsCtrl'
        })
        .state("mainFrame.brands.edit", {
            url: "/edit/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/brands.edit.html' },
            controller: 'brandsEditCtrl'
        })

        .state("mainFrame.category", {
            url: "/categories",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/category.html' },
            controller: 'categoryCtrl'
        })
        .state("mainFrame.category.edit", {
            url: "/edit/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/category.edit.html' },
            controller: 'categoryEditCtrl'
        })

        .state("mainFrame.stuff", {
            url: "/stuff",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_catalog'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/stuff.html' },
            controller: 'stuffCtrl'
        })
        .state("mainFrame.stuff.edit", {
            url: "/edit/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_catalog'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/editstuff.html' },
            controller: 'editStuffCtrl'
        })
        .state("mainFrame.stuff.commentStuff", {
            url: "/comment/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_catalog'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/commentstuff.html' },
            controller: 'commentStuffCtrl'
        })

        .state("mainFrame.stuff.editStuffGallery", {
            url: "/gallery/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_catalog'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/stuff.gallery.html' },
            controller: 'editStuffGalleryCtrl'
        })

        .state("mainFrame.news", {
            url: "/news",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_news'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/news.html' },
            controller: 'newsCtrl'
        })
        .state("mainFrame.news.edit", {
            url: "/edit/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_news'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/news.edit.html' },
            controller: 'editNewsCtrl'
        })
        .state("mainFrame.news.editNewsGallery", {
            url: "/gallery/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin' && $rootScope.user.role!='admin_news'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/news.gallery.html' },
            controller: 'editNewsGalleryCtrl'
        })

        .state("mainFrame.places", {
            url: "/places",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/place.html' },
            controller: 'placesCtrl'
        })

        .state("mainFrame.paginator", {
            url: "/collection",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/collection.html' },
            controller: 'collectionCtrl'
        })
        .state("mainFrame.collection.edit", {
            url: "/:brand/:id",
            templateUrl: function(){ return 'manager/views/partials/collection.edit.html' },
            controller: 'editCollectionCtrl'
        })

        .state("mainFrame.currency", {
            url: "/currency",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_catalog'
                    && $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/currency.html'},
            controller: 'currencyCtrl'
        })

        .state("mainFrame.orders", {
            url: "/orders?num",
            onEnter: function($rootScope){
                /*console.log($rootScope.user);
                for(var i=0;i<1000000;i++){
                    var r=(i*i+2345)/i;
                }*/
                /*if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order')){
                    //console.log('2-'+$rootScope.user.role);
                    $rootScope.$state.transitionTo('mainFrame.home');
                }*/
            },
            data:{retail:false},
            templateUrl: function(){ return 'manager/views/partials/orders.html' },
            controller: 'ordersCtrl'
        })

        .state("mainFrame.ordersRetail", {
            url: "/ordersRetail?num",
            onEnter: function($rootScope){
                //console.log($rootScope.user.role);
               /* if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order_retail'&& $rootScope.user.role!='admin_order')){
                    //console.log('2-'+$rootScope.user.role);
                    $rootScope.$state.transitionTo('mainFrame.home');
                }*/
            },
            data:{retail:true},
            templateUrl: function(){ return 'manager/views/partials/orders.html' },
            controller: 'ordersCtrl'
        })


        .state("mainFrame.ordersArch", {
            url: "/ordersArch",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/orders.arch.html' },
            controller: 'ordersArchCtrl'
        })

        .state("mainFrame.ordersStat", {
            url: "/ordersStat",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order'
                    && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/orders.stat.html' },
            controller: 'ordersStatCtrl'
        })


        .state("mainFrame.ordersSummary", {
            url: "/ordersSummary",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order'
                     && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/orders.summary.html' },
            controller: 'ordersSummaryCtrl'
        })

        .state("mainFrame.stat", {
            url: "/stat",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/stat.html' },
            controller: 'statCtrl'
        })

        .state("mainFrame.stat.edit", {
            url: "/edit/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/stat.edit.html' },
            controller: 'editStatCtrl'
        })
        .state("mainFrame.stat.editStatGallery", {
            url: "/gallery/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/stat.gallery.html' },
            controller: 'editStatGalleryCtrl'
        })

        .state("mainFrame.users", {
            url: "/users",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order' && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/users.html' },
            controller: 'usersCtrl'
        })

        .state("mainFrame.searchUser", {
            url: "/searchUser?fio&name&email",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order'
                    && $rootScope.user.role!='admin_order_retail')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/searchUser.html' },
            controller: 'searchUserCtrl',
            //params: ['fio','name','email']
        })

        .state("mainFrame.siteMAP", {
            url: "/sitemap",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            template: "<h1>siteMAP</h1><div ng-show='done'>Готово!</div>",
            controller: 'siteMapCtrl'
        })
        .state("mainFrame.snapshots", {
            url: "/snapshots",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            template: "<h1>Snapshots</h1><div ng-show='done'>Готово!</div>",
            controller: 'snapshotsCtrl'
        })

        .state("mainFrame.chats", {
            url: "/chats",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/chats.html' },
            controller: 'chatsCtrl'
        })

        .state("mainFrame.editForcePswd", {
            url: "/editForcePswd",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/editForcePswd.html' },
            controller: 'editForcePswdCtrl'
        })
        .state("mainFrame.editComments", {
            url: "/editComments",
            onEnter: function($rootScope){
                if (!$rootScope.user || ($rootScope.user.role!='admin'&& $rootScope.user.role!='admin_order')){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/editComments.html' },
            controller: 'editCommentsCtrl'
        })


        .state("mainFrame.usersOld", {
            url: "/usersOld",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/users.old.html' },
            controller: 'usersOldCtrl'
        })


        .state("mainFrame.describe", {
            url: "/describe",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/describe.html' },
            controller: 'describeCtrl'
        })

        .state("mainFrame.describe.edit", {
            url: "/:id",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/describe.edit.html' },
            controller: 'editDescribeCtrl'
        })
        .state("mainFrame.storify", {
            url: "/storify",
            onEnter: function($rootScope){
                if (!$rootScope.user || $rootScope.user.role!='admin'){
                    $rootScope.$state.transitionTo('mainFrame.home');
                }
            },
            templateUrl: function(){ return 'manager/views/partials/storify.html' },
            controller: 'storifyCtrl'
        })

        .state("mainFrame.ship", {
            url: "/ship",
            templateUrl: function(){ return 'manager/views/partials/ship.html' },
            controller: 'shipCtrl'
        })

        .state("mainFrame.inbox", {
            url: "/inbox?id",
            templateUrl: function(){ return 'manager/views/partials/inbox.html' },
            controller: 'inboxCtrl'
        })



    }])

angular.module('btford.socket-io', []).
    provider('socketFactory', function () {

        // when forwarding events, prefix the event name
        var defaultPrefix = 'socket:',
            ioSocket;

        // expose to provider
        this.$get = function ($rootScope, $timeout) {

            var asyncAngularify = function (socket, callback) {
                return callback ? function () {
                    var args = arguments;
                    $timeout(function () {
                        callback.apply(socket, args);
                    }, 0);
                } : angular.noop;
            };

            return function socketFactory (options) {
                options = options || {};
                var socket = options.ioSocket || io.connect();

                var prefix = options.prefix || defaultPrefix;
                var defaultScope = options.scope || $rootScope;

                var addListener = function (eventName, callback) {
                    socket.on(eventName, asyncAngularify(socket, callback));
                };

                var wrappedSocket = {
                    on: addListener,
                    addListener: addListener,
                    socket : socket,
                    emit: function (eventName, data, callback) {
                        return socket.emit(eventName, data, asyncAngularify(socket, callback));
                    },

                    removeListener: function () {
                        return socket.removeListener.apply(socket, arguments);
                    },

                    // when socket.on('someEvent', fn (data) { ... }),
                    // call scope.$broadcast('someEvent', data)
                    forward: function (events, scope) {
                        if (events instanceof Array === false) {
                            events = [events];
                        }
                        if (!scope) {
                            scope = defaultScope;
                        }
                        events.forEach(function (eventName) {
                            var prefixedEvent = prefix + eventName;
                            var forwardBroadcast = asyncAngularify(socket, function (data) {
                                scope.$broadcast(prefixedEvent, data);
                            });
                            scope.$on('$destroy', function () {
                                socket.removeListener(eventName, forwardBroadcast);
                            });
                            socket.on(eventName, forwardBroadcast);
                        });
                    }
                };

                return wrappedSocket;
            };
        };
    })


angular.module('i.mongoPaginate', [])

    .filter('paginate', function(Paginator) {
        return function(input, rowsPerPage) {
            /*console.log(input);
             console.log(input.length);*/
            if (!input)
                return;
            if (!input.length) {
                return input;
            }

            if (rowsPerPage) {
                Paginator.rowsPerPage = rowsPerPage;
            }

            Paginator.itemCount = input.length;

            return input.slice(parseInt(Paginator.page * Paginator.rowsPerPage), parseInt((Paginator.page + 1) * Paginator.rowsPerPage + 1) - 1);
        }
    })

    .filter('forLoop', function() {
        return function(input, start, end) {
            input = new Array(end - start);
            for (var i = 0; start < end; start++, i++) {
                input[i] = start;
            }

            return input;
        }
    })

    .service('mongoPaginator', function ($rootScope) {
        this.page = 0;
        this.rowsPerPage = ($rootScope.config.perPage)?$rootScope.config.perPage:20
        this.itemCount = 0;
        //this.pageCount =13

        this.setPage = function (page) {
            if (page > this.pageCount()) {
                return;
            }

            this.page = page;
            notifyObservers();
        };

        this.nextPage = function () {
            if (this.isLastPage()) {
                return;
            }

            this.page++;
            notifyObservers();

        };

        this.perviousPage = function () {
            if (this.isFirstPage()) {
                return;
            }

            this.page--;
            notifyObservers();
        };

        this.firstPage = function () {
            this.page = 0;
            notifyObservers();
        };

        this.lastPage = function () {
            this.page = this.pageCount() - 1;
            notifyObservers();
        };

        this.isFirstPage = function () {
            return this.page == 0;
            notifyObservers();
        };

        this.isLastPage = function () {
            return this.page == this.pageCount() - 1;
            notifyObservers();
        };

        this.pageCount = function () {
            //console.log(this.itemCount);
            var count = Math.ceil(parseInt(this.itemCount, 10) / parseInt(this.rowsPerPage, 10)); if (count === 1) { this.page = 0; }
            //console.log( count);
            return count;
        };

//http://stackoverflow.com/questions/12576798/angularjs-how-to-watch-service-variables

        var observerCallbacks = [];

        //register an observer
        this.registerObserverCallback = function(callback){
            observerCallbacks.push(callback);
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(){
            angular.forEach(observerCallbacks, function(callback){
                callback();
            });
        };

    })
    .service('mongoPaginatorS', function ($rootScope) {
        this.page = 0;
        this.rowsPerPage = ($rootScope.config.perPage)?$rootScope.config.perPage:5
        this.itemCount = 0;
        //this.pageCount =13

        this.setPage = function (page) {
            if (page > this.pageCount()) {
                return;
            }

            this.page = page;
            notifyObservers();
        };

        this.nextPage = function () {
            if (this.isLastPage()) {
                return;
            }

            this.page++;
            notifyObservers();

        };

        this.perviousPage = function () {
            if (this.isFirstPage()) {
                return;
            }

            this.page--;
            notifyObservers();
        };

        this.firstPage = function () {
            this.page = 0;
            notifyObservers();
        };

        this.lastPage = function () {
            this.page = this.pageCount() - 1;
            notifyObservers();
        };

        this.isFirstPage = function () {
            return this.page == 0;
            notifyObservers();
        };

        this.isLastPage = function () {
            return this.page == this.pageCount() - 1;
            notifyObservers();
        };

        this.pageCount = function () {
            //console.log(this.itemCount);
            var count = Math.ceil(parseInt(this.itemCount, 10) / parseInt(this.rowsPerPage, 10)); if (count === 1) { this.page = 0; }
            //console.log( count);
            return count;
        };

//http://stackoverflow.com/questions/12576798/angularjs-how-to-watch-service-variables

        var observerCallbacks = [];

        //register an observer
        this.registerObserverCallback = function(callback){
            observerCallbacks.push(callback);
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(){
            angular.forEach(observerCallbacks, function(callback){
                callback();
            });
        };

    })

    .directive('mongoPaginator', function factory() {
        return {
            restrict:'E',
            controller: function ($scope, mongoPaginator) {
                $scope.paginator = mongoPaginator;
            },
            templateUrl: 'manager/views/templates/mongoPaginationControl.html'
        };
    })

.directive('mongoPaginatorS', function factory() {
    return {
        restrict:'E',
        controller: function ($scope, mongoPaginatorS) {
            $scope.paginator = mongoPaginatorS;
        },
        templateUrl: 'manager/views/templates/mongoPaginationControl.html'
    };
})


.directive('mongoPaginatorAll', function () {
    return {
        restrict:'E',
        scope :{
            page:'=',
            row:'=',
            rowsPerPage :'@',
            totalItems:'='
        },
        link: function (scope, element, attrs, controller) {
            scope.paginator={};
            scope.paginator.page=0;
            scope.paginator.itemCount=0;
            scope.row=scope.paginator.rowsPerPage=scope.rowsPerPage;


            scope.paginator.setPage = function (page) {
                if (page > scope.paginator.pageCount()) {
                    return;
                }
                scope.paginator.page = page;
            };
            scope.paginator.nextPage = function () {
                if (scope.paginator.isLastPage()) {
                    return;
                }
                scope.paginator.page++;
            };
            scope.paginator.perviousPage = function () {
                if (scope.paginator.isFirstPage()) {
                    return;
                }
                scope.paginator.page--;
            };
            scope.paginator.firstPage = function() {
                scope.paginator.page = 0;
            };
            scope.paginator.lastPage = function () {
                scope.paginator.page = scope.paginator.pageCount() - 1;
            };
            scope.paginator.isFirstPage = function () {
                return scope.paginator.page == 0;
            };
            scope.paginator.isLastPage = function () {
                return scope.paginator.page == scope.paginator.pageCount() - 1;
            };
            scope.paginator.pageCount = function () {
                var count = Math.ceil(parseInt(scope.paginator.itemCount, 10) / parseInt(scope.paginator.rowsPerPage, 10)); if (count === 1) { scope.paginator.page = 0; }
                //console.log( count);
                return count;
            };
            scope.$watch('totalItems',function(n,o){
                scope.paginator.itemCount=scope.totalItems;
            })
            scope.$watch("paginator.page",function(n,o){
                scope.page=scope.paginator.page;
            })
        },
        templateUrl: 'manager/views/templates/mongoPaginationControlAll.html'
    };
})
    .service('mongoPaginatorAllService', function ($rootScope,$timeout) {
        /*this.page = 0;
        this.rowsPerPage = ($rootScope.config.perPage)?$rootScope.config.perPage:20
        this.itemCount = 0;*/
        //this.pageCount =13
        var that=this;
        this.page = [];
        this.rowsPerPage = [];
        this.itemCount = [];

        this.setPage = function (page,type) {
            //console.log(this.pageCount(type));

            if (page > this.pageCount(type)) {
                return;
            }
            this.page[type] = page;
            console.log(this.page[type]);


            //notifyObservers();
        };

        this.nextPage = function (type) {
            if (this.isLastPage(type)) {
                return;
            }

            this.page[type]++;
            //notifyObservers();

        };

        this.perviousPage = function (type) {
            if (this.isFirstPage(type)) {
                return;
            }

            this.page[type]--;
            //notifyObservers();
        };

        this.firstPage = function (type) {
            this.page[type] = 0;
            //notifyObservers();
        };

        this.lastPage = function (type) {
            this.page[type] = this.pageCount(type) - 1;
            //notifyObservers();
        };

        this.isFirstPage = function (type) {
            return this.page[type] == 0;
            //notifyObservers();
        };

        this.isLastPage = function (type) {
            return this.page[type] == this.pageCount(type) - 1;
            //notifyObservers();
        };

        this.pageCount = function (type) {
            //console.log(this.itemCount);
            var count = Math.ceil(parseInt(this.itemCount[type], 10) / parseInt(this.rowsPerPage[type], 10)); if (count === 1) { this.page[type] = 0; }
            //console.log( count);
            return count;
        };

//http://stackoverflow.com/questions/12576798/angularjs-how-to-watch-service-variables

        /*var observerCallbacks = [];

        //register an observer
        this.registerObserverCallback = function(callback){
            observerCallbacks.push(callback);
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(){
            angular.forEach(observerCallbacks, function(callback){
                callback();
            });
        };
*/
    })
angular.module( "ngAutocomplete", [])
    .directive('ngAutocomplete2', function($parse,$timeout) {
        return {

            require: 'ngModel',
            scope: {
                ngModel: '=',
                options: '=?',
                details: '=?',
                fromList: '=',
                countryId:   '='
            },

            link: function(scope, element, attrs, model) {

                //options for autocomplete
                var opts
                // scope.options.types='cities';
                //convert options provided to opts
                var initOpts = function() {
                    opts = {}
                    // console.log(scope.options);
                    if (scope.options) {
                        if (scope.options.types) {
                            opts.types = []
                            //console.log(scope.options.types);
                            opts.types.push(scope.options.types)
                        }
                        if (scope.options.bounds) {
                            opts.bounds = scope.options.bounds
                        }
                        if (scope.options.country) {
                            opts.componentRestrictions = {
                                country: scope.options.country
                            }
                        }
                    }

                }
                initOpts()

                element.bind('blur', function () {
                    //console.log(scope.ngModel);
                    //console.log(scope.cityId);
                    $timeout(function(){
                        scope.cityId='no id';
                    });


                    //console.log(scope.cityId);
                });

                //create new autocomplete
                //reinitializes on every change of the options provided
                var options = {
                    types: ['(cities)']
                };
                var newAutocomplete = function() {
                    scope.gPlace = new google.maps.places.Autocomplete(element[0],options);
                    google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                        scope.$apply(function() {
//              if (scope.details) {
                            scope.details = scope.gPlace.getPlace();
                            //console.log(scope.details);
                            //scope.cityId=scope.details.
//              }           console.log();
                            $timeout(function(){
                                if(scope.details.address_components && scope.details.address_components.length ){
                                    for (var i= 0,l=scope.details.address_components.length;i<l;i++){
                                        var c=scope.details.address_components[i];
                                        if (c.types && c.types[0] && c.types[0]=='country'){
                                            console.log(scope.details.address_components[i].short_name);
                                            scope.countryId=scope.details.address_components[i].short_name;
                                        }
                                    }
                                }
                                scope.ngModel=scope.ngAutocomplete = element.val();
                                //scope.cityId=scope.details.place_id;
                            })

                        });
                    })
                }
                newAutocomplete()

                //watch options provided to directive
                scope.watchOptions = function () {
                    return scope.options
                };
                scope.$watch(scope.watchOptions, function () {
                    initOpts()
                    newAutocomplete()
                    element[0].value = '';
                    scope.ngAutocomplete = element.val();
                }, true);
            }
        };
    })

