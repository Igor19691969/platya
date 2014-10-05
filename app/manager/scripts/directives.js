'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })

 .directive('mongooseError', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            element.on('keydown', function() {
                return ngModel.$setValidity('mongoose', true);
            });
        }
    };
})
    .directive("fileRead", ['$parse',function ($parse) {
        return {
            restrict: 'A',
            /* scope: {
             fileread: "="
             },  */
            link: function (scope, element, attrs) {
                element.bind("change", function (changeEvent) {
                    var model = $parse(attrs.fileread);
                    var modelSetter = model.assign;
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.myFileSrc = loadEvent.target.result;
                            scope.noLoad=false;
                            //smodelSetter(scope, loadEvent.target.result);
                            //console.log(loadEvent.target.result);
                        });
                    }
                    scope.myFile= changeEvent.target.files[0];
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);


Array.prototype.in_array = function(p_val) {
    for(var i = 0, l = this.length; i < l; i++)  {
        if(this[i] == p_val) {
    	    return true;
        }
    }
    return false;
}

angular.module('myApp').directive('focus',
    function() {
        return {
            link: function(scope, element, attrs) {
                element[0].focus();
            }
        };
    })
//How to set focus in AngularJS? http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
.directive('focusMe1', function($timeout,$parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                if(value === true) {
                    //nsole.log('value=',value);
                    $timeout(function() {
                    element[0].focus();
                    scope[attrs.focusMe] = false;
                    },50);
                }
            });
            element.bind('blur', function() {
                console.log('blur');
                scope.$apply(model.assign(scope, false));
            });
        }
    };
})

//http://stackoverflow.com/questions/16502559/angular-js-using-a-directive-inside-an-ng-repeat-and-a-mysterious-power-of-sco
    // Angular.js: Using a directive inside an ng-repeat, and a mysterious power of scope '@'
.directive('focusMe', function($timeout) {
    return {
        scope: { trigger: '=focusMe' },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                //console.log('dd');
                if(value === true) {
                    //console.log('trigger',value);
                    //$timeout(function() {
                    //console.log(element[0]);
                    $timeout(function(){element[0].focus()},50);
                    element[0].focus();
                    scope.trigger = false;
                    //});
                }
            });
        }
    };
})
    .directive('focusMeT', function($timeout) {
        return {
            scope: { trigger: '=focusMe' },
            link: function(scope, element) {
                scope.$watch('trigger', function(value) {
                    console.log('dd');
                    if(value === true) {
                        console.log('trigger-',value);
                        //$timeout(function() {
                        element[0].focus();
                        scope.trigger = false;
                        //});
                    }
                });
            }
        };
    })


//http://habrahabr.ru/post/179473/
//Валидация форм в AngularJS http://habrahabr.ru/post/167793/
.directive('mimimi', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(mimimi) {
                if (/mimimi/.test(mimimi)) {
                    alert('mimimi');
                    ctrl.$setValidity('mimimi', true);
                    return mimimi.toUpperCase();
                } else {
                    ctrl.$setValidity('mimimi', false);
                    return undefined;
                }
            });
        }
    };
})

    .directive('dir', function($compile, $parse) {
        return {
            restrict: 'E',
            link: function(scope, element, attr) {
                scope.$watch(attr.content, function() {
                    element.html($parse(attr.content)(scope));
                    $compile(element.contents())(scope);
                }, true);
            }
        }
    })

    .directive("fileReadSrc", ['$parse','$timeout',function ($parse,$timeout) {
        return {
            restrict: 'A',
            scope: {
                fileSrc : "=fileReadSrc",
                myFile:'='
            },

            link: function (scope, element, attrs) {
                element.bind("change", function (changeEvent) {
                    /*var model = $parse(attrs.fileReadScr);

                    var modelSetter = model.assign;
                    //console.log(modelSetter)*/
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            $timeout(function(){
                                scope.fileSrc = loadEvent.target.result;
                            });
                        });
                    }
                    scope.myFile= changeEvent.target.files[0];
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }])
    .directive('loadImage', function($fileUpload) {
        return {
            restrict : 'AE',
            scope: {
                noLoad:'=noLoad',
                noChange:'=noChange',
                uploadUrl:'@',
                itemId:'@',
                fileSrc:'@',
                Item:'=itemResourse'
                //fileReadSrc
            },
            templateUrl: 'views/templates/loadimage.html',
            link: function(scope, element,attrs) {
                /*attrs.$observe('fileReadSrc', function(value){
                    //console.log(value);
                    scope.myFileSrc=value;
                })*/
                scope.$watch('fileSrc',function(n,o){
                    /*console.log(n);
                    console.log(o)*/
                    if (o!=n){
                        //console.log('sss');
                        scope.noLoad=false;
                    }
                    //console.log(scope.fileSrc);
                });

                scope.uploadImg = function(){
                    if (!scope.itemId) return;
                    var file = scope.myFile;
                    //console.log(scope.itemid);

                    scope.noChange=true;
                    $fileUpload.uploadFileToUrl(file, scope.uploadUrl,scope.itemId).then(function(promise){
                        console.log(promise);
                        scope.noChange=false;
                        scope.noLoad=true;
                    });
                }
                scope.deleteImg=function(){
                    if (!scope.itemId) return;
                    scope.noChange=true;

                    scope.fileSrc='/nofile';
                    scope.Item.delete({id:scope.itemId,file:'file'},function(){
                        scope.noChange=false;
                        scope.noLoad=true;
                    });
                }
            }

        };
    })
    .directive("spinner", function($compile){
        return {
            restrict: 'E',
            scope: {enable:"="},
            link: function(scope, element, attr) {

                var spinner =angular.element('<div class="spinner" id="spinner" ng-show="enable" ' +
                    'style="position: fixed; opacity: 0.6; bottom:0; z-index:2000;' +
                    'background: #CCC' +
                    /*'background: ' +
                     'url(../img/spinner.gif) no-repeat center center #d2e3c3' +*/
                    '"></div>');
                var img=angular.element('<img src="../img/spinner.gif" style="position: fixed; bottom:50%; left: 45%; ">');
                spinner.append(img);

                var el= $compile(spinner)(scope);
                $('body').append(spinner);

                scope.$on('$destroy', function() {
                    $('#spinner').remove();
                });
                scope.$watch('enable',function(n,o){
                    if (n){
                        //console.log('dd');
                        abso()
                    }
                });

                function abso() {
                    var height= ($("body").height()>$(window).height())?$("body").height():$(window).height();
                    $('#spinner').css({
                        position: 'fixed',
                        width: $(window).width(),
                        height: height
                    });
                }
                $(window).resize(function() {
                    console.log('sssss');
                    abso();
                });
                /*$(window).scroll(function(){
                 if($(window).scrollTop() > elementPosition.top){
                 spinner.css('position','fixed').css('top','0');
                 } else {
                 $('#navigation').css('position','static');
                 }
                 });*/

                abso();

                /*scope.$watch('enable', function() {
                 //                element.html($parse(attr.content)(scope));
                 //                $compile(element.contents())(scope);
                 console.log(scope.enable);
                 }, true);*/
            }
        }
    })

    .directive("spinner1", function($compile){
        return {
            restrict: 'E',
            scope: {enable:"="},
            link: function(scope, element, attr) {

                var spinner =angular.element('<div class="spinner" id="spinner" ng-show="enable" style="position: fixed; opacity: 0.6; bottom:0; z-index:2000;background: url(../img/spinner.gif) no-repeat center center #d2e3c3"></div>');
                var el= $compile(spinner)(scope);
                $('body').append(spinner);
                scope.$on('$destroy', function() {
                    $('#spinner').remove();
                });
                function abso() {
                    $('#spinner').css({
                        position: 'absolute',
                        width: $(window).width(),
                        height: $(window).height()
                    });

                }
                $(window).resize(function() {
                    abso();
                });
                abso();
            }
        }
    })


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