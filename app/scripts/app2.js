'use strict';
// jquery-play-sound / jquery.playSound.js
//Playing sound notifications using Javascript?
//$.playSound('http://example.org/sound.mp3');
(function($){

    $.extend({
        playSound: function(){
            return $("<embed src='"+arguments[0]+".mp3' hidden='true' autostart='true' loop='false' class='playSound'>" +
                "<audio autoplay='autoplay' style='display:none;' controls='controls'><source src='"+arguments[0]+".mp3' /><source src='"+arguments[0]+".ogg' /></audio>").appendTo('body');
        }
    });

})(jQuery);

String.prototype.insert = function (index, string) {
    //console.log(string);
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};
if (!Array.prototype.indexOf)
{
    /**
     * Add array.indexOf() functionality (exists in >FF 1.5 but not in IE)
     *
     * @param {Object} elem Element to find.
     * @param {Number} [from] Position in array to look from.
     */
    Array.prototype.indexOf = function(elem /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }

        for (; from < len; from++) {
            if (from in this && this[from] === elem) {
                return from;
            }
        }

        return -1;
    };
}
if (!Array.prototype.remove)
{
    /**
     * Add array.remove() convenience method to remove element from array.
     *
     * @param {Object} elem Element to remove.
     */
    Array.prototype.remove = function(elem) {
        var index = this.indexOf(elem);
        alert(index);
        if (index !== -1) {
            this.splice(index, 1);
        }
    };
}
function getCookie(name) {
    var parts = document.cookie.split(name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

var myApp= angular.module('myApp', ['ngFx',

        /*'ngRoute',
        'ui.router',
        'ngResource',
        'ngCookies',
        'ui.bootstrap',
        'caco.ClientPaginate',
        'btford.socket-io',
        'ui.select2',
        'i.mongoPaginate',
        'ngAutocomplete',
        'myApp.controllers',
        'myApp.filters',
        'myApp.services',
        'myApp.directives',
        'dialogs.services',
        'pascalprecht.translate'*/

])



/*
.run(['$rootScope', '$state', '$stateParams','Config','$global','subjectSrv',
        '$cookieStore','$resource','User','$window',"socket",'Category','$http','$location','Auth',
        function ($rootScope,   $state,   $stateParams,Config,$global,subjectSrv,
                  $cookieStore,$resource,User,$window,socket,Category,$http,$location,Auth){

            $rootScope.lang=getCookie('lan');
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.socket = socket;


            $rootScope.user=null;

            $rootScope.titles={};
          $rootScope.commonFilter={"tags":['xx','xx','xx']};
            $rootScope.config=Config.get(function(res){
                $rootScope.commonFilter.tags=res.tags;
                $rootScope.currencyIndex=0;
                $rootScope.currency='UAH';

                $http.get('/api/getip').success(function (data, status, headers, config) {
                   //console.log(data);
                    if (data && data.country_code){
                        if (data.country_code=='RU' ||data.country_code=='RUS'){
                            $rootScope.currency="RUB";
                            $rootScope.countryRUB=true;
                        } else if (data.country_code=='UA'){
                            $rootScope.currency="UAH";
                            $rootScope.countryUAH=true;
                        }
                        else {
                            $rootScope.currency="USD";
                            $rootScope.countryUSD=true;
                        }
                    }
                }).error(function (data, status, headers, config) {})

            });
            $rootScope.slides=[];
            Category.list(function(res){
                $rootScope.categories=res;
                if($rootScope.categories[0]){
                    $rootScope.mainSection=$rootScope.categories[0]._id;
                    for (var i=0,l=$rootScope.categories.length;i<l;i++){
                        if ($rootScope.categories[i].section==$rootScope.mainSection){
                            $rootScope.slides[$rootScope.slides.length]={
                                    img:$rootScope.categories[i].img,
                                    name:$rootScope.categories[i].name[$rootScope.lang],
                                    url:$rootScope.categories[i]._id,
                                    lang:$rootScope.lang
                            }
                        }

                    }
                }


            });
            $rootScope.changeStuff=false;

            $rootScope.$on('$stateChangeStart', function(event, to, toParams, fromState, fromParams){

                if ($rootScope.lang=='ru'){
                    $rootScope.titles.pageTitle='Женская одежда оптом и в розницу от украинского производителя Jadone fashion - платья, туники, сарафаны.';
                    $rootScope.titles.pageKeyWords=
                        " женская одежда украинского производителя, оптом женский трикотаж, купить, украина, интернет магазин, опт, оптовый, модная женская одежда, женские юбки оптом, " +
                            "женские платья , сарафаны, женские костюмы, кардиганы, розница , туники " +
                            " платья французский трикотаж, купить, оптом, беларусь, мода, стиль, россия, казахстан, фабрика, оптом купить"+
                            'стильная одежда, женская одежда оптом и в розницу, красивая одежда';
                    $rootScope.titles.pageDescription='Jadone fashion  – сайт для оптовых и розничных покупателей  женской одежлы от  украинского производителя Jadone fashion. ' +
                        'Здесь Вы можете купить стильные и красивые женские платья , сарафаны, костюмы, кардиганы и туники, выполненные из качественных тканей.';

                }
                if (((to.name=='language.login' || to.name=='language.signup') &&Auth.isLoggedIn())||
                    (to.name=='language.customOrder' && !Auth.isLoggedIn())){
                    //console.log(toParams);
                    $rootScope.$state.transitionTo('language.home',{'lang':toParams.lang});
                }
            })

            $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
                if ($window.ga)
                    $window.ga('send', 'pageview', { page: $location.path() });
                $('.zoomContainer').remove();


                if(to.name=='language.stuff' && from.name=='language.stuff.detail'){
                    $rootScope.changeStuff=true;
                }

            });
}])

.config(['$stateProvider', '$urlRouterProvider','$locationProvider','dialogsProvider','$translateProvider',function ($stateProvider,$urlRouterProvider,$locationProvider,dialogsProvider,$translateProvider){


            dialogsProvider.useBackdrop('static');
            dialogsProvider.useEscClose(true);
            dialogsProvider.useCopy(false);
            dialogsProvider.setSize('sm');

            $translateProvider.translations('ru',{
                DIALOGS_ERROR: "Ошибка",
                DIALOGS_ERROR_MSG: "Se ha producido un error desconocido.",
                DIALOGS_CLOSE: "Закрыть",
                DIALOGS_PLEASE_WAIT: "Espere por favor",
                DIALOGS_PLEASE_WAIT_ELIPS: "Espere por favor...",
                DIALOGS_PLEASE_WAIT_MSG: "Esperando en la operacion para completar.",
                DIALOGS_PERCENT_COMPLETE: "% Completado",
                DIALOGS_NOTIFICATION: "Уведомление",
                DIALOGS_NOTIFICATION_MSG: "Notificacion de aplicacion Desconocido.",
                DIALOGS_CONFIRMATION: "Confirmacion",
                DIALOGS_CONFIRMATION_MSG: "Подтвердите",
                DIALOGS_OK: "Ок",
                DIALOGS_YES: "Да",
                DIALOGS_NO: "Нет"
            });
            $translateProvider.preferredLanguage('en-US');



        var lang=getCookie('lan');
        if (!lang || (lang!='en'&& lang!='ru')) {
            lang='ru';
            document.cookie = "lan=ru;path=/";
        }


        */
/*chatsProvider.listUsers=[];
        console.log(chatsProvider.listUsers);*//*


        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        $urlRouterProvider
            .when('/', '/'+lang+'/home')
            .otherwise('/');


    $stateProvider
        .state("language", {
            url: "/:lang",
            abstract:true,
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/mainFrame.html' },
            controller: 'mainFrameCtrl'
        })
        .state("language.home", {
            url: "/home",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/home.html' },
            controller: 'homeCtrl'
        })
        .state("language.login", {
            url: "/login",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/login.html' },
            controller: 'loginCtrl'
        })
        .state("language.signup", {
            url: "/signup",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/signup.html' },
            controller: 'signupCtrl'
        })

        .state("language.customOrder", {
            url: "/customorder?num",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/customorder.html' },
            controller:'customOrderCtrl',
            */
/*onEnter: ['Auth','$rootScope',function (Auth,$rootScope) {
                console.log(Auth.isLoggedIn());
                if (!Auth.isLoggedIn()){
                    console.log($rootScope.$stateParams.lang);
                    //$rootScope.$state.transitionTo('language.customOrder',{'lang':$rootScope.$stateParams.lang});
                }
            }]*//*

        })
        .state("language.profile", {
            url: "/profile",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/profile.html' },
            controller:'profileCtrl'
        })

        .state("language.settings", {
            url: "/settings",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/settings.html' },
            controller: 'settingsCtrl'
        })
        .state("language.contacts", {
            url: "/contacts",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/contacts.html' },
            controller: 'contactsCtrl'
        })
        .state("language.searchStuff", {
            url: "/searchStuff?searchStr",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/stuff.search.html' },
            controller: 'searchStuffCtrl'
        })
        .state("language.stuffSale", {
            url: "/stuffsale?sale",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/stuff.search.html' },
            controller: 'saleStuffCtrl'
        })
        .state("language.stuff.detail", {
            url: "/stuffdetail/:id/:color?size",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/stuff.detail.html' },
            controller: 'stuffDetailCtrl'
        })

        .state("language.stuff", {
            url: "/stuff/:section/:category?searchStr?scrollTo",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/stuff.html' },
            controller: 'stuffCtrl'
        })
        .state("language.cart", {
            url: "/cart",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/cart.html' },
            controller: 'cartCtrl'
        })

        .state("language.news.detail", {
            url: "/newsdetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/news.detail.html' },
            controller: 'newsDetailCtrl'
        })

        .state("language.news", {
            url: "/news",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/news.html' },
            controller: 'newsCtrl'
        })
        .state("language.chat", {
            url: "/chat",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/chat.html' },
            controller: 'chatCtrl'
        })
        .state("language.aboutus", {
            url: "/aboutus",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/about_us_company.html' }
//controller:'homeCtrl'
        })
        .state("language.delivery", {
            url: "/delivery",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/about_us_delivery.html' },
            controller:'deliveryCtrl'
        })
        .state("language.payment", {
            url: "/payment",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/about_us_payment.html' },
            controller:'paymentCtrl'
        })
        .state("language.pay", {
            url: "/pay?num&sum&currency?desc?kurs",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/pay.html' },
            controller:'payCtrl'
        })
        .state("language.help", {
            url: "/help",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/help.html' },
            //controller:'payCtrl'
        })

       */
/* .state("language.searchStuff", {
           // url: "/searchstuff?searchStr",
            url:"/ssss",
            templateUrl: function(stateParam){ return 'views/partials/'+stateParams.lang+'/stuff.search.html' }
            //controller: 'searchStuffCtrl'
        })*//*



}])
*/


angular.module('caco.ClientPaginate', [])

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

    .service('Paginator', function ($rootScope) {
        this.page = 0;
        this.rowsPerPage = 54
        this.itemCount = 0;

        this.setPage = function (page) {
            if (page > this.pageCount()) {
                return;
            }

            this.page = page;
        };

        this.nextPage = function () {
            if (this.isLastPage()) {
                return;
            }

            this.page++;
        };

        this.perviousPage = function () {
            if (this.isFirstPage()) {
                return;
            }

            this.page--;
        };

        this.firstPage = function () {
            this.page = 0;
        };

        this.lastPage = function () {
            this.page = this.pageCount() - 1;
        };

        this.isFirstPage = function () {
            return this.page == 0;
        };

        this.isLastPage = function () {
            return this.page == this.pageCount() - 1;
        };

        this.pageCount = function () { var count = Math.ceil(parseInt(this.itemCount, 10) / parseInt(this.rowsPerPage, 10)); if (count === 1) { this.page = 0; } return count;
        };
        /*this.pageCount = function () {
         return Math.ceil(parseInt(this.itemCount) / parseInt(this.rowsPerPage));
         };*/
    })

    .directive('paginator', function factory() {
        return {
            restrict:'E',
            controller: function ($scope, Paginator) {
                $scope.paginator = Paginator;
            },
            templateUrl: 'paginationControl.html'
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
    });

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

    .directive('mongoPaginator', function factory() {
        return {
            restrict:'E',
            controller: function ($scope, mongoPaginator) {
                $scope.paginator = mongoPaginator;
            },
            templateUrl: 'manager/views/templates/mongoPaginationControl.html'
        };
    });



/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Simple Usage:
 *
 * <input type="text" ng-autocomplete="result"/>
 *
 * creates the autocomplete text box and gives you access to the result
 *
 *   + `ng-autocomplete="result"`: specifies the directive, $scope.result will hold the textbox result
 *
 *
 * Advanced Usage:
 *
 * <input type="text" ng-autocomplete="result" details="details" options="options"/>
 *
 *   + `ng-autocomplete="result"`: specifies the directive, $scope.result will hold the textbox autocomplete result
 *
 *   + `details="details"`: $scope.details will hold the autocomplete's more detailed result; latlng. address components, etc.
 *
 *   + `options="options"`: options provided by the user that filter the autocomplete results
 *
 *      + options = {
 *           types: type,        string, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *           bounds: bounds,     google maps LatLngBounds Object
 *           country: country    string, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *         }
 *
 *
 *
 *
 *
 */



//angular.module('dialogs.services', ['ui.bootstrap.modal'])


angular.module( "ngAutocomplete", [])
    .directive('ngAutocomplete1', function($parse,$timeout) {
        return {

            require: 'ngModel',
            scope: {
                ngModel: '=',
                options: '=?',
                details: '=?',
                fromList: '=',
                cityId:   '=',
                countryId:'='
            },

            link: function(scope, element, attrs, model) {

                //options for autocomplete
                //console.log(scope.ngModel);
                $timeout(function(){
                    element[0].value=scope.ngModel;
                })

                //console.log(element);
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
                        scope.cityId='';
                    });


                    //console.log(scope.cityId);
                });

                //create new autocomplete
                //reinitializes on every change of the options provided
                var newAutocomplete = function() {
                    scope.gPlace = new google.maps.places.Autocomplete(element[0], scope.options);
                    google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                        scope.$apply(function() {
//              if (scope.details) {
                            scope.details = scope.gPlace.getPlace();
                            //console.log(scope.details);
                            //scope.cityId=scope.details.
//              }           console.log();
                            if(scope.details.address_components && scope.details.address_components.length ){
                                 for (var i= 0,l=scope.details.address_components.length;i<l;i++){
                                     var c=scope.details.address_components[i];
                                     if (c.types && c.types[0] && c.types[0]=='country'){
                                         console.log(scope.details.address_components[i].short_name);
                                         scope.countryId=scope.details.address_components[i].short_name;
                                     }
                                 }
                            }


                            if (scope.details && scope.details.types && scope.details.types[0]=='locality'){

                                $timeout(function(){
                                    scope.ngModel=scope.ngAutocomplete = element.val();

                                    scope.cityId=scope.details.place_id;
                                },100)
                            }


                        });
                    })
                }
                newAutocomplete()
                /*scope.$watch('ngModel', function (n) {
                    console.log(n);
                });*/

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


    .directive('ngAutocomplete', function() {
        return {
            require: 'ngModel',
            scope: {
                ngModel: '=',
                options: '=?',
                details: '=?',
                fromList: '='
            },

            link: function(scope, element, attrs, controller) {

                //options for autocomplete
                scope.fromList=false;
                var opts
                var watchEnter = false
                //convert options provided to opts
                var initOpts = function() {

                    opts = {}
                    if (scope.options) {

                        if (scope.options.watchEnter !== true) {
                            watchEnter = false
                        } else {
                            watchEnter = true
                        }

                        if (scope.options.types) {
                            opts.types = []
                            opts.types.push(scope.options.types)
                            scope.gPlace.setTypes(opts.types)
                        } else {
                            scope.gPlace.setTypes([])
                        }

                        if (scope.options.bounds) {
                            opts.bounds = scope.options.bounds
                            scope.gPlace.setBounds(opts.bounds)
                        } else {
                            scope.gPlace.setBounds(null)
                        }

                        if (scope.options.country) {
                            opts.componentRestrictions = {
                                country: scope.options.country
                            }
                            scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
                        } else {
                            scope.gPlace.setComponentRestrictions(null)
                        }
                    }
                }

                if (scope.gPlace == undefined) {
                    scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
                }

                google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                    var result = scope.gPlace.getPlace();
                    if (result !== undefined) {
                        if (result.address_components !== undefined) {

                            scope.$apply(function() {

                                scope.details = result;

                                controller.$setViewValue(element.val());
                            });
                        }
                        else {
                            if (watchEnter) {
                                getPlace(result)
                            }
                        }
                    }
                })

                //function to get retrieve the autocompletes first result using the AutocompleteService
                var getPlace = function(result) {
                    var autocompleteService = new google.maps.places.AutocompleteService();
                    if (result.name.length > 0){
                        autocompleteService.getPlacePredictions(
                            {
                                input: result.name,
                                offset: result.name.length
                            },
                            function listentoresult(list, status) {
                                if(list == null || list.length == 0) {

                                    scope.$apply(function() {
                                        scope.details = null;
                                    });

                                } else {
                                    var placesService = new google.maps.places.PlacesService(element[0]);
                                    placesService.getDetails(
                                        {'reference': list[0].reference},
                                        function detailsresult(detailsResult, placesServiceStatus) {

                                            if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                                                scope.$apply(function() {

                                                    controller.$setViewValue(detailsResult.formatted_address);
                                                    element.val(detailsResult.formatted_address);

                                                    scope.details = detailsResult;

                                                    //on focusout the value reverts, need to set it again.
                                                    var watchFocusOut = element.on('focusout', function(event) {
                                                        element.val(detailsResult.formatted_address);
                                                        element.unbind('focusout')
                                                    })

                                                });
                                            }
                                        }
                                    );
                                }
                            });
                    }
                }

                controller.$render = function () {
                    var location = controller.$viewValue;
                    element.val(location);
                };

                //watch options provided to directive
                scope.watchOptions = function () {
                    return scope.options
                };
                scope.$watch(scope.watchOptions, function () {
                    initOpts()
                }, true);

            }
        };
    });
