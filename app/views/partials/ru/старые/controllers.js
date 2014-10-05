'use strict';
//Получаем i18n список стран, регионов, населенных пунктов из ВКонтакте
//http://habrahabr.ru/post/204840/

// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}


/* Controllers */

angular.module('myApp.controllers', [])



.controller('mainFrameCtrl',['$scope', '$location','Auth',"$stateParams" ,"$rootScope","$window","$http",'$sce','$filter','Category',"Filters","User",'News','$timeout','chats','socket','$interval','CartLocal','UserService',
        function              ($scope, $location, Auth,    $stateParams,    $rootScope,  $window,  $http,  $sce,  $filter,Category,Filters,User,News,$timeout,chats,socket,$interval,CartLocal,UserService) {

            moment.lang("ru");

            // при инициализации
            $scope.localCart=CartLocal;



            $scope.countNewMsgs=0;



            $scope.displayNewMsg=function(){
                var newMsg=0;
                var list = chats.chatList;
                for (var i=0;i<list.length;i++){
                    if (list[i].newMsg){
                        newMsg+=list[i].newMsg;
                    }
                }
                return $scope.countNewMsgs=newMsg;
            }

            $scope.stopTime=null;
            $scope.$watch('countNewMsgs',function(){
                if ($scope.countNewMsgs && !$scope.stopTime){
                    $scope.stopTime = $interval(function(){
                        if ($rootScope.titles.pageTitle=='************'){
                            $rootScope.titles.pageTitle=$scope.title;
                        } else {
                            $scope.title=$rootScope.titles.pageTitle;
                            $rootScope.titles.pageTitle='************';
                        }

                    }, 800);

                }else if (!$scope.countNewMsgs && $scope.stopTime) {
                    $interval.cancel($scope.stopTime);
                    $scope.stopTime=null;
                    $rootScope.titles.pageTitle=$scope.title;
                }
            })


            $scope.trustHtml = function(text,i){

                if(i){
                    text= $filter('cut')(text,true,i,"...");
                }
                var trustedHtml = $sce.trustAsHtml(text);
                return trustedHtml;
            };
            //$scope.collections=BrandTags.list({brand:'brand',limit:2});


            $scope.displayDate= function(dateStr,time){
                var q='ll';
                if (time){
                    q='lll';
                }
                dateStr = moment(dateStr).format(q)
                return dateStr;
            }




            if ($rootScope.lang!=$rootScope.$stateParams.lang) {
                $rootScope.lang=$rootScope.$stateParams.lang;
                document.cookie = "lan="+$rootScope.lang+";path=/";
            }

        $scope.lang=$rootScope.lang;
        $scope.logout = function() {
            //$rootScope.socket=nill; stuff for deleting user from socket list
            Auth.logout()
                .then(function() {
                    $rootScope.user=User.get(function(){
                        $rootScope.socket.emit('delete user from chat');
                        $rootScope.chats.refreshLists(false);
                        UserService.isLogged=false;
                    });
                    $location.path('/');
                });
        };
        $scope.isActive = function(route) {
            return route === $location.path();
        };

        $scope.lanImg="img/icon/"+$rootScope.lang+".png";
        if ($rootScope.lang=='ru')
            $scope.langName='рус';
        else
            $scope.langName='eng';



           $scope.changeCurrency= function(lan){
               $rootScope.currency=lan;
               //$scope.$apply();
           }
        $scope.changeLanguage= function(lan){
            if(lan==$rootScope.lang) return;

             var arr_path = $location.path().split('/')
             if (arr_path.length>=2){
                 arr_path[1]=lan;
                 var path_name = arr_path.join("/");
                 arr_path = arr_path.join("/");
             }
            document.cookie = "lan=" +lan+";path=/";
              window.location.href=arr_path;

        }
            $scope.toCategory = function(obj){
               // console.log(obj);
                $rootScope.$state.transitionTo('language.stuff',obj,{ reload: true,
                    inherit: false,
                    notify: true  })
            }

        $scope.searchStr=''
        $scope.goToSearch=function(searchStr){
            $scope.searchStr=''
            if (!searchStr || !searchStr.trim()) return;
            $rootScope.$state.transitionTo('language.searchStuff',{'searchStr':searchStr,'lang':$rootScope.lang},{ reload: true,
                inherit: false,
                notify: true })
        }

}])

    .controller('homeCtrl', ['$scope','News','$rootScope','Stuff',function ($scope,News,$rootScope,Stuff) {
        //$scope.categories=$rootScope.categories;
        $scope.category=[];
        $scope.popStuff=[];
        $rootScope.$watch('mainSection',function(n,o){
            if ($rootScope.mainSection){
                var ii=0;
                for(var i=0;i<$rootScope.categories.length;i++){
                    //console.log(i);
                    if ($rootScope.categories[i].section==$rootScope.mainSection){
                        $scope.category.push($rootScope.categories[i]);
                    }
                    if(ii==2) break;
                }
                Stuff.list({category:$rootScope.mainSection,brand:'section',page:0,main:'main'},function(res){
                    var tepmArr=[];
                    var col=0;
                    res.shift();
                    for (var i=0;i<res.length;i++){
                        var temp=null;
                        for(var j=0;j<res[i].gallery.length;j++){
                            if (!temp){
                                temp={
                                    img:res[i].gallery[j].thumb,'name':res[i].name[$rootScope.lang],
                                    'color':res[i].gallery[j].tag.name[$rootScope.lang],
                                    'id':res[i]._id,'colorId':res[i].gallery[j].tag._id,section:$rootScope.mainSection,
                                    category:res[i].category,index:res[i].gallery[j].index
                                }
                            } else {
                                if (res[i].gallery[j].index<temp.index){
                                    temp={
                                        img:res[i].gallery[j].thumb,'name':res[i].name[$rootScope.lang],
                                        'color':res[i].gallery[j].tag.name[$rootScope.lang],
                                        'id':res[i]._id,'colorId':res[i].gallery[j].tag._id,section:$rootScope.mainSection,
                                        category:res[i].category,index:res[i].gallery[j].index
                                    }

                                }
                            }
                        }
                        if (temp){
                            col++;
                            tepmArr.push(temp);
                        }
                        if (col>=12) break;

                    }
                    $scope.popStuff=tepmArr;
                });

            }
        });
        $scope.slidesS = [{img:'img/slide/1.jpg'},{img:'img/slide/2.jpg'},{img:'img/slide/3.jpg'},{img:'img/slide/4.jpg'},
            {img:'img/slide/5.jpg'},{img:'img/slide/6.jpg'},{img:'img/slide/7.jpg'},{img:'img/slide/8.jpg'},
            {img:'img/slide/9.jpg'}];
        $scope.imagesS = [{img:'img/slide/1.jpg'},{img:'img/slide/2.jpg'},{img:'img/slide/3.jpg'},{img:'img/slide/4.jpg'},
            {img:'img/slide/5.jpg'},{img:'img/slide/6.jpg'},{img:'img/slide/7.jpg'},{img:'img/slide/8.jpg'},
            {img:'img/slide/9.jpg'}];

        $scope.images=$rootScope.slides;
        $scope.lastNews=[];
        News.list({page:1,main:'main'},function(tempArr){
            for (var i=0 ; i<=tempArr.length - 1; i++) {
                // tempArr[i].filters=JSON.parse(tempArr[i].filters);

                tempArr[i].desc=(tempArr[i].desc0[$scope.lang]=='')?tempArr[i].desc1:tempArr[i].desc0;
                tempArr[i].desc[$scope.lang]= tempArr[i].desc[$scope.lang].substring(0,150);
                //console.log(tempArr[i].desc);
                /*if (!tempArr.desc0){

                 }*/
                $scope.lastNews.push(tempArr[i]);
            }
        });


    }])

    .controller('stuffCtrl', ['$scope','Brands','$rootScope','Category','Filters','Stuff','$q','$timeout','BrandTags','$location','$anchorScroll','mongoPaginator',
        function ($scope,Brands,$rootScope,Category,Filters,Stuff,$q,$timeout,BrandTags,$location,$anchorScroll,mongoPaginator) {


            var getCategoryName = function(id){
                var str='';
                for (var i= 0,l=$rootScope.categories.length;i<l;i++){
                    if($rootScope.categories[i]._id==id){
                        str=$rootScope.categories[i].name[$rootScope.lang];
                        break;
                    }
                }
                return str;
            }
            $scope.mongoPaginator=mongoPaginator;

            $scope.row= $scope.mongoPaginator.rowsPerPage;
            $scope.page=$scope.mongoPaginator.page;

            /*$scope.$watch('mongoPaginator.rowsPerPage',function(){
                if ($scope.page==0){
                    if ($scope.section) {
                        if (!$scope.activeBrand && !$scope.activeCategory){
                            var brandId='section';
                        } else {
                            //console.log();
                            var brandId=($scope.activeBrand)?$scope.activeBrand:0;
                        }

                        var categoryId=($scope.activeCategory)?$scope.activeCategory:$scope.section.id;
                        if ($scope.activeBrand && !$scope.activeCategory){
                            categoryId=0;
                        }
                        $scope.getStuffList(categoryId,brandId,$scope.page,$scope.mongoPaginator.rowsPerPage);
                    }
                } else {
                    $scope.page=0
                }

            })*/




            var updatePage = function(){
                $scope.page=$scope.mongoPaginator.page;
            };

            mongoPaginator.registerObserverCallback(updatePage);

            $scope.$watch('page',function(n,o){
                if (n!=o){

                    var categoryId=($scope.selectedCategory)?$scope.selectedCategory:$scope.section.id;
                    $scope.getStuffList(categoryId,$scope.page,$scope.mongoPaginator.rowsPerPage);
                }
            })






            if ($rootScope.$stateParams.scrollTo){

                $timeout(function(){
                    $scope.scrollTo($rootScope.$stateParams.scrollTo);
                },1000)

            }

            $scope.commonFilter=$rootScope.commonFilter;

            $scope.stuffList=[];
            //paginator
            $scope.page=0;
            $scope.totalItems=0;
            $scope.textList=''
            $scope.headerList='';
            $scope.displayFilter=[];
            //console.log( $scope.filterList);
            //$scope.filters=Filters.list();

            // инициализация********************************
            //$scope.rowsPerPage=($rootScope.config.perPage)?$rootScope.config.perPage:53;
            //$scope.rowsPerPage=6;
            $scope.lang=$rootScope.$stateParams.lang;
            //$scope.section=$rootScope.$stateParams.section;

            $scope.categories=[];
            $scope.filterDisplay=[];
            $scope.checkfilterList=[];






            Category.list(function(res){
               //console.log($rootScope.$stateParams);
                $scope.section =_.findWhere(res,{_id:$rootScope.$stateParams.category}).section;

                for (var i =0;i<res.length;i++){
                    if (res[i].section==$scope.section){//$rootScope.$stateParams.section){
                        $scope.categories.push(res[i]);
                    }
                }
                $scope.selectedCategory=$rootScope.$stateParams.category;
            });


            //*********************************************
            $scope.$watch('selectedCategory',function(newValue, oldValue){
                if (typeof newValue == 'undefined' || newValue == oldValue) return;
                $scope.filters=[];

                if ($scope.page){
                    $scope.page=$scope.mongoPaginator.page=0;
                } else {
                    $scope.getStuffList($scope.selectedCategory);
                }

                var query;
                if ($scope.selectedCategory){


                    for(var i=0;i<$scope.categories.length;i++){
                        if ($scope.categories[i]._id==$scope.selectedCategory){
                            query={'filters':JSON.stringify($scope.categories[i].filters)};
                            $scope.textList=$scope.categories[i].desc[$scope.lang];
                            $scope.headerList=$scope.categories[i].name[$scope.lang];
                            /*console.log($scope.textList);
                            console.log($scope.headerList);*/
                            break;
                        }
                    }
                    if ($rootScope.lang=="ru"){
                        $rootScope.titles.pageTitle= 'Модная женская одежда на Jadone fashion.Платья. туники. кардиганы. Скидки.'+$scope.headerList;
                        $rootScope.titles.pageKeyWords='купить '+$scope.headerList+' оптом, в розницу,купить '+$scope.headerList+' от производителя,стильная одежда, женская одежда оптом, красивая стильная одежда';
                        //(вставить наименование бренда, к которой относится данная модель),
                        $rootScope.titles.pageDescription="В нашем интернет-магазине Вы можете купить оптом  и в розницу платья, туники, костюмы  от известного " +
                            " производителя модной женской одежды "+$scope.headerList;
                    }


                } else {
                    $scope.textList='';
                    $scope.headerList='';
                    var tagArr=[];
                    for(var i=0;i<$scope.categories.length;i++){
                        var arr=[];
                        for(var j=0;j<$scope.categories[i].filters.length;j++){
                            if (i==0){
                                //tagArr.push($scope.categories[i].filters[j]);
                                arr.push($scope.categories[i].filters[j]);
                            } else{
                                if(tagArr.indexOf($scope.categories[i].filters[j])>-1){
                                    arr.push($scope.categories[i].filters[j]);
                                }
                            }
                        }
                        tagArr=JSON.parse(JSON.stringify(arr));
                    }
                    if (tagArr.length>0){
                        query={'filters':JSON.stringify(tagArr)};
                    }
                }
                Filters.list(query,function(res){
                    for(var i=0;i<res.length;i++){
                        res[i].value='';
                        $scope.filters.push(res[i]);

                    }
                    //console.log($scope.filters);
                });
            });

            $scope.getStuffList = function(categoryId,page){
                //console.log(page);
                $scope.stuffList=[];
                if (!page){
                    $scope.page=0;

                }
                var  brandId;
                if (categoryId){
                    brandId=0;
                } else {
                    categoryId=$scope.section;
                    brandId='section';
                }
                //console.log($scope.page  );
                //console.log($rootScope.$stateParams);
                //var searchStr=($rootScope.$stateParams.searchStr)?$rootScope.$stateParams.searchStr:'';
                function noStock(tag,stock){
                   // console.log(stock);
                    if(stock && stock[tag]) {
                        var is = true;
                        for (var key in stock[tag]){
                            if (!stock[tag][key]){
                                is = false;
                            }
                        }
                        return is;
                    } else{
                        return false;
                    }
                }

                Stuff.list({category:categoryId,brand:brandId,page:$scope.page},function(tempArr){
                    //var time1 = new Date().getTime();
                   /* for (var ii=1; ii<10000000;ii++){
                        var jj= ii/13*0.546;
                    }*/
                    if ($scope.page==0 && tempArr.length>0){
                        $scope.totalItems=$scope.mongoPaginator.itemCount=tempArr.shift().index;
                    }

                    $scope.checkfilterList=[];
                    for (var i= 0,ll=tempArr.length; i<ll; i++) {
                        /*if(tempArr[i]._id=="5368bee7d00a0d940e2d1147"){
                            console.log(tempArr[i].gallery);
                        }*/
                        var stock;
                        if (tempArr[i].stock){
                            stock=JSON.parse(tempArr[i].stock);
                        }

                        var filtersForStatus=JSON.parse(JSON.stringify(tempArr[i].tags));
                        var tempGallery=[];
                        tempArr[i].gallery=_(tempArr[i].gallery).sortBy(function(obj) { return +obj.index });

                        /*for (var l=0 ; l<=tempArr[i].gallery.length - 1; l++) {
                            console.log(tempArr[i].gallery[l].index);
                        }*/

                        for (var j= 0,len=tempArr[i].gallery.length;j<len;j++){
                            //console.log(tempArr[i].gallery[j]);
                            if (tempGallery.length<1 && tempArr[i].gallery[j].tag && tempArr[i].gallery[j].tag._id){
                                tempGallery[tempGallery.length]=tempArr[i].gallery[j];
                                var l = tempArr[i].tags.indexOf(tempArr[i].gallery[j].tag._id);
                                //console.log(l);
                                if (l>-1){
                                    tempArr[i].tags.splice(l,1);
                                }
                            } else{
                                var is=false;
                                for (var k=0;k<tempGallery.length;k++){
                                    //if (is) break;
                                    if (tempArr[i].gallery[j].tag && tempGallery[k].tag._id==tempArr[i].gallery[j].tag._id){
                                        is=true;
                                        if(tempArr[i].gallery[j].index<tempGallery[k].index){
                                            tempGallery.splice(k,1);
                                            tempGallery[tempGallery.length]=tempArr[i].gallery[j];
                                           // is=true;
                                        }
                                    }/* else {
                                        is=true;
                                        tempGallery.push(tempArr[i].gallery[j]);
                                    }*/
                                }
                                if (!is && tempArr[i].gallery[j].tag) {
                                    tempGallery[tempGallery.length]=tempArr[i].gallery[j];
                                    var l = tempArr[i].tags.indexOf(tempArr[i].gallery[j].tag._id);
                                    //console.log(l);
                                    if (l>-1){
                                        tempArr[i].tags.splice(l,1);
                                    }
                                }
                            }
                       }
                        var price = (tempArr[i].priceSale)? tempArr[i].priceSale:tempArr[i].price;
                        var retail = (tempArr[i].retailSale)? tempArr[i].retailSale:tempArr[i].retail;

                        for (var j=0;j<tempArr[i].tags.length;j++){
                            if ($scope.checkfilterList.indexOf(tempArr[i].tags[j])<0){
                                $scope.checkfilterList[$scope.checkfilterList.length]=tempArr[i].tags[j];
                            }
                        }
                        for (var j= 0,len=tempGallery.length;j<len;j++){
                            var status=0;
                            // 1 - распродажа
                            // 2- новинка
                            // 3- нет в наличии
                            if (filtersForStatus.indexOf(tempGallery[j].tag._id)<0 || filtersForStatus.indexOf($scope.commonFilter.tags[2])>-1
                                || noStock(tempGallery[j].tag._id,stock)){
                                //tempGallery[j].tag._id tag of color

                                status=3;

                            } else if(filtersForStatus.indexOf($scope.commonFilter.tags[1])>-1){
                                status=2;
                            } else if( filtersForStatus.indexOf($scope.commonFilter.tags[0])>-1){
                                status=1;
                            }
                            var tags=JSON.parse(JSON.stringify(tempArr[i].tags));
                            tags.push(tempGallery[j].tag._id)
                            if ($scope.checkfilterList.indexOf(tempGallery[j].tag._id)<0){
                                $scope.checkfilterList.push(tempGallery[j].tag._id);
                            }
                            //console.log(tempGallery[j]);
                            $scope.stuffList.push({img:tempGallery[j].thumb,'name':tempArr[i].name[$scope.lang],
                                'color':tempGallery[j].tag.name[$scope.lang],'price':price,'retail':retail,'tags':tags,'category':getCategoryName(tempArr[i].category),
                            'id':tempArr[i]._id,'colorId':tempGallery[j].tag._id,'status':status});
                        }
                    }
                });

            }

            $scope.showItemFilter=function(id,index){
                //console.log(index);
                var i=$scope.checkfilterList.indexOf(id);
                if (i>-1){
                    $scope.displayFilter[index]=true;
                    return true;
                }
                return false;
            }

            $scope.filterLists =  function() {
                return function(item) {
                   if ($scope.collectionTag &&  $scope.collectionTag.val && item.brandTag!=$scope.collectionTag.val){
                        return false;
                    }
                    if (!$scope.filters || $scope.filters.length<=0){
                        return true;
                    }
                    for (var i=0 ; i<=$scope.filters.length - 1; i++) {
                        if ($scope.filters[i].value && item.tags.indexOf($scope.filters[i].value)<=-1){
                            return false;
                        }
                    }
                    return true;
                }
            }

            $scope.goToStuffDetail = function(item){
                $rootScope.$state.transitionTo('language.stuff.detail',{id:item.id,color:item.colorId});
            }


            $scope.morePage = function () {
                $scope.page++;
                console.log($scope.page);
                $scope.getStuffList($scope.activeCategory,$scope.page);


            };

            //прокрутка вверх екрана
            $scope.scrollTo = function(id) {
                //console.log(id);
                $location.hash(id);
                $anchorScroll();
            }

            $scope.$watch('changeStuff',function(){
                if ($rootScope.changeStuff && $rootScope.$state.current.name=='mainFrame.stuff'){

                    console.log($scope.page);
                    //$scope.loadData($scope.page);
                    /*for (var i=1;i<=$scope.page;i++){
                     promises.push($scope.getStuffList($scope.activeCategory,$scope.activeBrand,i));
                     }*/
                    //$q.all(promises);

                }
                $rootScope.changeStuff=false;
            })



        }])
    .controller('stuffDetailCtrl',['$scope','Stuff','$rootScope','$timeout','CartLocal','Comment','localStorage',
        function($scope,Stuff,$rootScope,$timeout,CartLocal,Comment,localStorage){
            $scope.viewed=localStorage.get('viewed');




        $scope.lang=$rootScope.$stateParams.lang;
        $scope.cart=CartLocal.list();
        $scope.itemToCart={'stuff':'','status':1,'color':'','size':'','name':'','colorName':'','sizeName':'','quantity':1,'price':1,'retail':1,
            'category':$rootScope.$stateParams.category,'categoryName':'','img':''};
        /*$scope.itemToCart={'stuff':'','status':1,'color':'','size':'','name':'','colorName':'','sizeName':'','quantity':1,'price':1,'retail':1,
            'category':$rootScope.$stateParams.category,'categoryName':'','section':$rootScope.$stateParams.section,'img':''};*/
        if($rootScope.$stateParams.size){
            $scope.itemToCart.size=$rootScope.$stateParams.size
        }

        function htmlToPlaintext(text) {
            return String(text).replace(/<[^>]+>/gm, '');
        }




        $scope.ez;
        $scope.currentQuantity=1;
        $scope.quantityArr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,
            25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];


        var setViewed = function(){
            var viewedItem ={lang:$rootScope.$stateParams.lang,
                category:$rootScope.$stateParams.category,color:$rootScope.$stateParams.color,
                id:$rootScope.$stateParams.id,img:$scope.activePhoto.thumb,
                categoryName:$scope.itemToCart.categoryName,name:$scope.itemToCart.name,
                colorName:$scope.itemToCart.colorName};
            var posItem = -1;
            for (var i= 0,l=$scope.viewed.length;i<l;i++){
                var item=$scope.viewed[i];
                if (item.id==viewedItem.id && item.category==viewedItem.category && item.color==viewedItem.color) {
                    posItem=i;
                    break;
                }
            }

            console.log(posItem);
            if (posItem>-1){
                $scope.viewed.splice(posItem,1);
            }
            if ($scope.viewed.length>4){
                $scope.viewed.splice(0,1);
            }
            $scope.viewed[$scope.viewed.length]=viewedItem;
            //$scope.viewed=[];
            localStorage.set('viewed', $scope.viewed);
        }

        $scope.stuff=Stuff.full({id:$rootScope.$stateParams.id,page:'page'},function(res,err){
            $scope.itemToCart.stuff=res._id;
            $scope.itemToCart.artikul=res.artikul;
            $scope.itemToCart.name=res.name[$scope.lang];
            $scope.itemToCart.categoryName=res.category.name[$scope.lang];
            $scope.itemToCart.price=(res.priceSale)?res.priceSale:res.price;
            $scope.itemToCart.retail=(res.retailSale)?res.retailSale:res.retail;
            for (var i=0;i<res.gallery.length;i++){
                if ($rootScope.$stateParams.color==res.gallery[i].tag){
                    if (!$scope.activePhoto){
                        $scope.activePhoto=res.gallery[i];
                    } else if ($scope.activePhoto.index>res.gallery[i].index){
                        $scope.activePhoto=res.gallery[i];
                    }
                }
            }
            if (res.stock){
                res.stock=JSON.parse(res.stock);
                //console.log(res.stock);
            }
            //console.log($rootScope.$stateParams);


            getCurrentSize(res.category.filters,res.tags);
            //console.log();
            if ($rootScope.lang=='ru'){
                $rootScope.titles.pageTitle= $scope.itemToCart.categoryName+' '+ $scope.itemToCart.name+
                    ' на Jadone fashion.Платья. туники. кардиганы. Скидки.';
                $rootScope.titles.pageKeyWords='купить '+$scope.itemToCart.categoryName+' оптом,в розницу,купить  '+$scope.itemToCart.categoryName+
                    ' от производителя,стильная одежда, женская одежда оптом, красивая стильная одежда '+$scope.itemToCart.colorName ;
                //(вставить наименование бренда, к которой относится данная модель),
                $rootScope.titles.pageDescription= $scope.itemToCart.name+" - "+$scope.itemToCart.colorName+" всех размеров "+
                    htmlToPlaintext($scope.stuff.desc[$rootScope.lang]).substring(0,100);
            }


            function showOptionColor(id){
                //console.log('jj - '+jj++);
                if (!res.gallery || !res.gallery.length) return;
                for (var i= 0,l=res.gallery.length;i<l;i++){
                    if (res.gallery[i].tag==id) {
                        return true;
                    }
                }
                return false;
            }
            $scope.colorsArray=[];
            for(var i= 0,l=res.category.mainFilter.tags.length;i<l;i++){
                if(showOptionColor(res.category.mainFilter.tags[i]._id)){
                    $scope.colorsArray[$scope.colorsArray.length]=res.category.mainFilter.tags[i];
                }
            }
            //console.log($scope.colorsArray);


        });

//*****************************************photo**************************************************
        $scope.$watch('activePhoto',function(){
            if (!$scope.activePhoto) return;
            $scope.itemToCart.color=$scope.activePhoto.tag;
            if (!$scope.activePhoto.name) {
                var tags=$scope.stuff.category.mainFilter.tags;
                for (var i=0;i<tags.length;i++){
                    if (tags[i]._id==$scope.activePhoto.tag){
                        $scope.activePhoto.name=tags[i].name[$scope.lang];
                    }
                }
            }
            if ($scope.color){
                $scope.color=$scope.activePhoto.tag
            } else {
                $timeout(function(){$scope.color=$scope.activePhoto.tag;},300)
            }
            $scope.itemToCart.img=$scope.activePhoto.thumb;
            $scope.itemToCart.color=$scope.activePhoto.tag;
            $scope.itemToCart.colorName=$scope.activePhoto.name;
            if ($scope.itemToCart.size) {
                $scope.currentQuantity=CartLocal.getCount($scope.itemToCart);
            }

            setViewed();

        })

        $scope.changeColor = function(tag){
            var j=0;
            for (var i=0;i<$scope.stuff.gallery.length;i++){
                if (tag==$scope.stuff.gallery[i].tag){
                    if ($scope.activePhoto.tag!=$scope.stuff.gallery[i].tag){
                        j=i;
                        //$scope.activePhoto=$scope.stuff.gallery[i];
                    } else if ($scope.activePhoto.index>$scope.stuff.gallery[i].index){
                        j=i;
                        //$scope.activePhoto=$scope.stuff.gallery[i];
                    }
                }
            }
            $scope.changePhoto(j);
        }

        $scope.changePhoto= function(index){
            if (!$scope.ez){
                $scope.ez =$('#img_001').data('elevateZoom');
            }
            $scope.ez.swaptheimage($scope.stuff.gallery[index].thumb, $scope.stuff.gallery[index].img);
            $scope.activePhoto=$scope.stuff.gallery[index];
            /*$scope.itemToCart.color=$scope.activePhoto.tag;
            $scope.currentQuantity=CartLocal.getCount($scope.itemToCart);*/
        };
        //var jj=0;


//*********************************************size***********************************************
        function getSizeName(tags){
            for (var i=0;i<tags.length;i++){
                if (tags[i]._id==$scope.itemToCart.size) {
                    $scope.itemToCart.sizeName=tags[i].name[$scope.lang];
                }
            }
        };
        $scope.filterSize=[];
        function getCurrentSize(filters,tags){
            var tempArr=[];
            for (var i=0;i<filters.length;i++){
                //if (is) break;
                if (filters[i].name['en'].toLowerCase()=='size'){
                    for (var j=0;j<filters[i].tags.length;j++){
                        //console.log(filters[i].tags[j]);
                        for (var l=0;l<tags.length;l++){
                            if (filters[i].tags[j]==tags[l]._id) {
                                tempArr.push(tags[l]);
                                if (!$scope.itemToCart.size){
                                    $scope.itemToCart.size=tags[l]._id;
                                    $scope.itemToCart.sizeName=tags[l].name[$scope.lang];
                                } else {
                                    if($scope.itemToCart.size==tags[l]._id) {
                                        $scope.itemToCart.sizeName=tags[l].name[$scope.lang];
                                    }
                                }
                          }
                        }
                    }
                }
            }
            $scope.filterSize=tempArr;
        }
        $scope.changeSize = function(){
            getSizeName($scope.stuff.tags);
            $scope.currentQuantity=CartLocal.getCount($scope.itemToCart);
        }
//***************************************** end size ******************************************
        $scope.disabledToCart=function(){
            //console.log(new Date().getTime());

            if ($scope.stuff.stock){
                /*console.log($scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]);
                console.log($scope.stuff.stock[$scope.itemToCart.color]);
                console.log($scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]);*/
                if ($scope.stuff.stock[$scope.itemToCart.color] && $scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]
                    && $scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]==1){
                    return true;
                }


            }
            var disabled = false;
            var noColor=true;
            if (!$scope.stuff || !$scope.stuff.tags) return;
            for (var i=0;i<$scope.stuff.tags.length;i++){
               /* console.log($scope.activePhoto._id);
                console.log($scope.stuff.tags[i]._id);*/
                if ($scope.stuff.tags[i]._id==$scope.activePhoto.tag){
                   noColor=false;
                }
               if  ($scope.stuff.tags[i]._id==$scope.commonFilter.tags[2]){
                   disabled=true;
                   break;
               }
            }

            return disabled || noColor;
        }
        $scope.addedToCart=false;
        $scope.addToCart= function(){
            //console.log($scope.itemToCart);
            $scope.addedToCart=true;
            $scope.itemToCart.quantity=parseInt($scope.currentQuantity);
            CartLocal.addToCart($scope.itemToCart);
            $timeout(function(){
                $scope.addedToCart=false;
            },2000);

        }

        $scope.goToList=function(){
            $rootScope.$state.transitionTo('language.stuff',
                {'lang':$rootScope.$stateParams.lang,'section':'category','category':$scope.stuff.category._id,scrollTo:$scope.stuff._id+'stuff'});
        }

        //***********************************************************
        $scope.page=0;
        $scope.comments=Comment.list({stuff:$rootScope.$stateParams.id,page:$scope.page,perPage:5});
        $scope.comment={};
        $scope.comment.text='';
        $scope.comment.author=$rootScope.user._id;
        $scope.comment.authorName=$rootScope.user.name;
        $scope.comment.stuff=$rootScope.$stateParams.id;
        //console.log($scope.comment);
        $scope.moreComments=function(){
            $scope.page++;
            Comment.list({stuff:$rootScope.$stateParams.id,page:$scope.page,perPage:5},function(res){
                //console.log(res);
                for (var i=0;i<res.length;i++){
                    $scope.comments.push(res[i]);
                }
            });
        };



        $scope.showEdit=false;
        $scope.updateComment =  function(){
            $scope.disallowEdit = true;
            $scope.comment.author=$rootScope.user._id;
            Comment.add($scope.comment,function(){
                $scope.disallowEdit = false;
                $scope.showEdit=false;
                $scope.afterSave();
            })



        }

        $scope.afterSave = function(){
            $scope.comment.text='';
            /*$scope.comment.author='';
            $scope.comment.date='';
*/
            var arrIndex=[];
            var comments=[];
            for(var i=1;i<=$scope.page;i++){
                arrIndex.push(i);
            }
            async.eachSeries(arrIndex,function( i, cb) {
                Comment.list({stuff:$rootScope.$stateParams.id,page: i},function(result){
                    for(var i=0;i<result.length;i++){
                        comments.push(result[i]);
                    }
                    cb();
                })
            },function(err,result){
                $scope.comments=comments;
            });
        }
        $scope.dateConvert = function(date){
            return moment(date).format('ll');
        }

        //***********************************************************
   }])

    .controller('cartCtrl',['$scope','$rootScope','$timeout','CartLocal','$modal','localStorage',
        function($scope,$rootScope,$timeout,CartLocal,$modal,localStorage){
            $scope.viewedL=localStorage.get('viewed');
            $scope.viewed=[];
            //console.log($scope.viewedL.length);
            for (var i = $scope.viewedL.length-1,l=0;i>=l;i--){
                //console.log(i);
                $scope.viewed[$scope.viewed.length]= $scope.viewedL[i];
            }

            $scope.goToViewed=function(item){
                var stuff=  item;
                $rootScope.$state.transitionTo('language.stuff.detail',
                    {'lang':$rootScope.$stateParams.lang,'category':stuff.category,
                        'id':stuff.id,'color':stuff.color});
            }
            //console.log($scope.viewed);
        //$scope.currency=$rootScope.currency;
        $scope.sendCart=false;
        $scope.comment='';
        $scope.sendDisabled=false;
        $timeout(function(){
            if($rootScope.config && $rootScope.config.currency){
                $scope.kurs = $rootScope.config.currency[$rootScope.currency][0];
            }
        },300);

        $rootScope.$watch('currency',function(o,n){
            //console.log($rootScope.currency);
           //if(o==n) return;
            if($rootScope.config && $rootScope.config.currency){
                $scope.kurs = $rootScope.config.currency[$rootScope.currency][0];
            }
        })
        //console.log($scope.kurs);
        $scope.quantityArr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,
            25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
        $scope.cart=CartLocal;
        //$scope.cart.sum=0;

        $scope.goToStuff=function(i){
           var stuff=  $scope.cart.getItem(i);
            $rootScope.$state.transitionTo('language.stuff.detail',
                {'lang':$rootScope.$stateParams.lang,'section':stuff.section,'category':stuff.category,
                'id':stuff.stuff,'color':stuff.color,'size':stuff.size});
        }

        $scope.sendOrder=function(){
            $scope.sendCart=true;
            yaCounter23946445.reachGoal('ORDER');
            $scope.sendDisabled=true;
            $scope.comment.substring(0,200);
            $scope.cart.send($rootScope.$stateParams.lang,$scope.comment,$scope.kurs,$rootScope.currency,$rootScope.user.profile,function(err){
                $scope.sendCart=false;
                $scope.sendDisabled=false;
                $scope.cart.clearCart();
                $rootScope.$state.transitionTo('language.customOrder',{'lang':$rootScope.$stateParams.lang});
            });
        }

        $scope.items;
        $scope.open = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
                console.log( $scope.selected);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance,items) {

            /*$scope.items = items;
            $scope.selected = {
                item: $scope.items[0]
            };*/

            $scope.ok = function () {

                $modalInstance.close('dddddd');
                $rootScope.$state.transitionTo('language.login',{lang:$rootScope.lang});
            };

            $scope.signup = function () {
                $modalInstance.dismiss('cancel');
                $rootScope.$state.transitionTo('language.signup',{lang:$rootScope.lang});

            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
                ;

            };
        };

        $scope.isAuth=function(){
            if ($rootScope.user._id){
                return true;
            } else {
                return false;
            }
        }



    }])

    .controller('loginCtrl',['$scope', '$location','Auth','$rootScope','User', 'UserService','$modal',
        function ($scope, $location, Auth,$rootScope,User,UserService,$modal) {
        $scope.user = {};
        $scope.errors = {};

        $scope.resetPswd = function(form) {
            if(form.$valid) {
                Auth.resetPswd({
                    email: $scope.reseteEmail

                })
                    .then( function(data) {
                        console.log(data);
                        $scope.open();
                        $scope.reseteEmail='на почту отправлено письмо';
                    })
                    .catch( function(err) {
                        console.log(err);
                        err = err.data;
                        $scope.errors.other = err.message;
                    });
            }
        }

        $scope.login = function(form) {
            $scope.submitted = true;

            if(form.$valid) {
                Auth.login({
                    email: $scope.user.email,
                    password: $scope.user.password
                })
                    .then( function(data) {

                        //console.log(data);userid.
                        document.cookie = "userid="+data.userid+";path=/";
                        $rootScope.user=User.get(function(user){
                            //console.log(user);
                            $.playSound('sounds/login');
                                if (user){
                                    //console.log('ddd');
                                    $rootScope.socket.emit('new user in chat',user._id);
                                    $rootScope.chats.refreshLists(true);
                                    //UserService.isLogged=true;
                                }
                        });

                        // Logged in, redirect to home
                        if ($rootScope.fromCart){
                            $rootScope.$state.transitionTo('language.cart',{lang:$scope.lang});
                            $rootScope.fromCart=false;
                        } else {
                            $rootScope.$state.transitionTo('language.home',{lang:$scope.lang});
                        }

                    })
                    .catch( function(err) {
                        err = err.data;
                        $scope.errors.other = err.message;
                    });
            }
        };

        $scope.open = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size

            });
            modalInstance.result.then(function () {

            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance) {
            $scope.ok = function () {};
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };




    }])
    .controller('signupCtrl',['$scope', 'Auth',"$location",'$rootScope', '$modal','User','$http','UserService','$window',
        function ($scope, Auth,$location,$rootScope,$modal,User,$http,UserService,$window) {
        $scope.user = {};
        $scope.errors = {};
        $scope.countries=[];
        $scope.regions=[];
        $scope.cities=[];

        $http.get('api/country?lang='+$rootScope.lang).success(function (data, status, headers, config) {
            if(data){

                for (var i= 0,l=data.length;i<l;i++){
                    $scope.countries[$scope.countries.length]={name:data[i]['title_'+$rootScope.lang],id:data[i]['country_id']}
                }
            }
        })




        $scope.changeCountry=function(id){
            if (!id) return;
            $scope.regions=[];
            $scope.cities=[];
            $http.get('api/region?lang='+$rootScope.lang+'&id='+id).success(function (data, status, headers, config) {
                if(data){
                    //$scope.regions=data;
                    for (var i= 0,l=data.length;i<l;i++){
                        $scope.regions[$scope.regions.length]={name:data[i]['title_'+$rootScope.lang],
                            country_id:data[i]['country_id'],id:data[i]['region_id']}
                    }
                }
            })

        }

        $scope.changeRegion=function(id){
            $scope.cities=[];
            var date1=(new Date).getTime();
            if (!id) return;
            //$scope.cities=[];
             $http.get('api/city?lang='+$rootScope.lang+'&id='+id).success(function (data, status, headers, config) {
               // var date2=(new Date).getTime();
                 $scope.cities=data;
                /*if(data){
                    for (var i= 0,l=data.length;i<l;i++){
                        $scope.cities[$scope.cities.length]={name:data[i]['title_'+$rootScope.lang],
                            refion_id:data[i]['region_id'],country_id:data[i]['country_id'],id:data[i]['region_id']}
                    }
                }*/
                //var date3=(new Date).getTime();
                //console.log('date2-date1='+(date2-date1));
                //console.log('date3-date2='+(date3-date2));

            })

        }


        $scope.cities=[];
        /*$scope.$watch('user.profile.region',function(n,o){
            $scope.cities=[];
            console.log(n);
            if (n!=o && n){

                $http.get('http://api.vk.com/method/database.getCountries?v=5.5&need_all=1&count=1000')
                *//*$http({method:'GET',url:'http://api.vk.com/method/database.getCities?v=5.5&country_id=' + $scope.user.profile.country
                    + '&region_id=' +$scope.user.profile.region + '&offset=0&need_all=1&count=1000&callback=callbackFunc'
                    //,headers:{'Access-Control-Allow-Credentials': 'true'}})*//*
                .success(function (data, status, headers, config) {
                        $scope.cities=data.resonse;
                        console.log($scope.cities);

                })
            }
        });*/
        /*$scope.changeRegion=function(val){
            if (val){
                $http.get('csv/_countries.csv').success(function (data, status, headers, config) {

                })

            }
        }*/
        function getProfile(){
            for (var i = 0,l=$scope.cities.length;i<l;i++){
                if ($scope.countries[i].id==$scope.user.profile.country){
                    $scope.user.profile.country=$scope.countries[i].name;
                    break;
                }
            }
            for (var i = 0,l=$scope.regions.length;i<l;i++){
                if ($scope.regions[i].id==$scope.user.profile.region){
                    $scope.user.profile.region=$scope.regions[i].name;
                    break;
                }
            }
            console.log($scope.user.profile);
        }


        $scope.register = function(form) {

            //console.log('asasd');
            $scope.submitted = true;
            yaCounter23946445.reachGoal('REGISTRATION');
            if(form.$valid) {
              // getProfile();

                //return;
                Auth.createUser({
                    name: $scope.user.name,
                    email: $scope.user.email,
                    password: $scope.user.password,
                    profile: $scope.user.profile
                })
                    .then( function() {
                        // Account created, redirect to home
                        $rootScope.user=User.get(function(user){
                            $.playSound('sounds/login');
                            if (user){
                                $rootScope.socket.emit('new user in chat',user._id);
                                $rootScope.chats.refreshLists(true);
                            }
                            UserService.isLogged=true;
                        });
                        //$rootScope.$state.transitionTo('language.home');
                        $scope.open();
                        /*if ($rootScope.fromCart){
                            $rootScope.$state.transitionTo('language.cart',{lang:$scope.lang});
                            $rootScope.fromCart=false;
                        } else {
                            $location.path('/');
                        }*/

                        //$location.path('/');
                    })
                    .catch( function(err) {
                        err = err.data;
                        $scope.errors = {};
                        console.log(err);
                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.type;
                        });
                    });
            }
        };

        $scope.open = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
                console.log( $scope.selected);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance,items) {

            /*$scope.items = items;
             $scope.selected = {
             item: $scope.items[0]
             };*/

            $scope.toHome = function () {
                $window.location.href='/';
                //$modalInstance.close('dddddd');
                //$rootScope.$state.transitionTo('language.home',{lang:$rootScope.lang});
            };

            $scope.toCart = function () {
                //$modalInstance.dismiss('cancel');
                //$rootScope.$state.transitionTo('language.cart',{lang:$rootScope.lang});
                $window.location.href='/';

            };
            /*$scope.cancel = function () {
                $modalInstance.dismiss('cancel');
                ;

            };*/
        };
       // $scope.open();
    }])
    .controller('settingsCtrl',  ['$scope', 'User', 'Auth',function ($scope, User, Auth) {
        $scope.errors = {};

        $scope.changePassword = function(form) {
            $scope.submitted = true;

            if(form.$valid) {
                Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
                    .then( function() {
                        $scope.message = 'Password successfully changed.';
                    })
                    .catch( function() {
                        form.password.$setValidity('mongoose', false);
                        $scope.errors.other = 'Incorrect password';
                    });
            }
        };
    }])

    .controller('contactsCtrl',['$scope','$rootScope','$location','$http','$timeout','Stat',	function($scope,$rootScope,$location,$http,$timeout,Stat){
        var regex = "/(<([^>]+)>)/ig";


        var page =$rootScope.$state.current.url;

        //console.log(page.substring(1));
        $scope.stuff=Stat.get({name:page.substring(1),id:'qqq'},function(res){
            if ($rootScope.lang=='ru'){

                $rootScope.titles.pageTitle='Женская одежда оптом и в розницу от производителя Jadone fashion - платья, туники, сарафаны. Контакты.';
                $rootScope.titles.pageKeyWords=
                    " женская одежда от производителя, оптом женский трикотаж, купить, интернет магазин, опт, оптовый, модная женская одежда, женские юбки оптом, " +
                        "женские платья , сарафаны, женские костюмы, кардиганы, розница , туники " +
                        " платья французский трикотаж, купить, оптом, беларусь, мода, стиль, россия, казахстан, фабрика, оптом купить"+
                        'стильная одежда, женская одежда оптом и в розницу, красивая одежда' +
                        'контакты, обратная связь, координаты';
                $rootScope.titles.pageDescription=res.desc0[$rootScope.lang].replace(regex, "");

            }
        });


        $scope.feedbackError=false;
        $scope.feedbackSent = false;

        $scope.errorText=false;
        $scope.SuccessFeedBack=false;
        $scope.feedbackDisabled=false;


        $scope.feedback={};

        $scope.feedback.email ='';
        $scope.feedback.name = '';
        $scope.feedback.text = '';

        if ($rootScope.user){
            if ($rootScope.user.email){
                // console.log($rootScope.user.email);
                $scope.feedback.email=$rootScope.user.email;
            }
            if ($rootScope.user.name)
                $scope.feedback.name=$rootScope.user.name;
        }
        /*$rootScope.watch('user',function(){
            if ($rootScope.user){
                if ($rootScope.user.email){
                    //console.log($rootScope.user.email);
                    $scope.feedback.email=$rootScope.user.email;
                }
                if ($rootScope.user.name)
                    $scope.feedback.name=$rootScope.user.name;
            }
        });
*/

        $scope.feedbackMassage = function(){
            return 	$scope.feedbackError|| $scope.feedbackSent;
        }


        $scope.send = function(form){
            console.log($scope.feedback);
            if ($scope.feedback.text.length<10){
                $scope.errorText = true;
                $timeout(function(){$scope.errorText = false}, 3000);
            }
            else{
                $scope.feedback.text=$scope.feedback.text.substring(0,700);
                $scope.feedbackDisabled=true;
                $http.post('/api/feedback',$scope.feedback).
                    success(function(data, status) {
                        $scope.data = data;
                        if ($scope.data.done){
                            $scope.SuccessFeedBack = true;
                            $scope.feedback.text='';
                            $timeout(function(){
                                $scope.SuccessFeedBack = false;
                                $scope.feedbackDisabled=false;
                            }, 10000);
                        }else{
                            $scope.feedbackError = true;
                            $timeout(function()
                            {$scope.feedbackError=false;
                                $scope.feedbackDisabled=false;
                            }, 10000);
                        }
                    }).
                    error(function(data, status) {
                        console.log(status);
                        console.log(data);
                        $scope.feedbackError = true;
                        $timeout(function(){$scope.feedbackError=false}, 3000);
                    });
            }

        };

    }])



    .controller('searchCtrl', ['$scope','$http','$stateParams','$filter','$sce',function ($scope,$http,$stateParams,$filter,$sce) {
        // write Ctrl here

        $scope.quantity=0;
        $scope.searchStr = $stateParams.searchStr;
        $scope.getResults = function (){
            $scope.searchStr= $scope.searchStr.substring(0,30).split(' ',2).join(' ').toLowerCase();
            $http.get('/api/goods/search/'+$stateParams.lang+'/'+$scope.searchStr).success(function (data, status, headers, config) {
                $scope.results=data;
                $scope.quantity=$scope.results.quantity;
                //$scope.quantity=$scope.results.
                $scope.results.desc=data.desc.map(function(doc){
                    var text = doc.desc[$stateParams.lang];
                    var lb='<span style="color: #ff2a27">';
                    var le ='</span>';
                    var pos = text.toLowerCase().indexOf($scope.searchStr);
                    var begin=0;end=100;
                    if (pos>50){
                        var begin =pos-50;
                        var end =pos+50
                    }
                    doc.text=text.insert(pos,lb)
                                .insert(pos+lb.length+$scope.searchStr.length,le)
                                .slice(begin,end+lb.length+$scope.searchStr.length+le.length);
                    return doc;
                })
            }).error(function (data, status, headers, config) { })
        }

        $scope.getText= function(text){
            return $sce.trustAsHtml(text);
        }
        $scope.getResults();
        //$scope.categories=$rootScope.categories;


    }])


    .controller('customOrderCtrl',['$scope','$rootScope','$stateParams','$http','$timeout','$sce','Orders',
        function($scope,$rootScope,$stateParams,$http,$timeout,$sce,Orders){

            //***********************************
            // управление ордерами
            //************************************
            moment.lang('ru');
            //console.log(moment.lang.language);


            $scope.fromChat = ($rootScope.$stateParams.num)?$rootScope.$stateParams.num:'';

            /*$scope.orders=Orders.list({'user':$rootScope.user._id},function(res){
                console.log(res);
            });*/

            $scope.filterStatus='';
            $scope.filterNumber='';

            $scope.getTotalSum =  function(order,quantity,all){
                //console.log(order);
                var s=0;
                for (var i =0;i<order.cart.length;i++){
                    s+=(quantity>=5||order.opt)?order.cart[i].quantity*order.cart[i].price:order.cart[i].quantity*order.cart[i].retail;
                }
                if (all){
                    for (var i= 0,len=order.addInCart.length;i<len;i++){
                        for (var j= 0,l=order.addInCart[i].cart.length;j<l;j++){
                            var price=(quantity>=5||order.opt)?order.addInCart[i].cart[j].price:order.addInCart[i].cart[j].retail;
                            s +=Number(price)*Number(order.addInCart[i].cart[j].quantity);
                        }
                    }
                }
                //console.log('s-'+s);
                return s;

            }

            $scope.orderSum= function(order,q){
                var sum=0;
                for (var i= 0,l=order.cart.length;i<l;i++){
                    var price=(q>=5||order.opt)?order.cart[i].price:order.cart[i].retail;
                    sum +=price*order.cart[i].quantity;
                }
                return sum;
            }


            $scope.afterSave = function(){
                $scope.orders=Orders.list({'user':$rootScope.user._id},function(res){
                    //console.log(res);
                });
            };

            $scope.updateOrder =  function(order){

                order.$update(function(err){
                    if (err) console.log(err);
                    $scope.afterSave();
                });
            }

            $scope.deleteOrder= function(order){
                if (confirm("Удалить?")){
                    order.$delete(function(){
                        $scope.afterSave();
                    });
                }
            }

            $scope.dateConvert = function(date){
                if (date) {
                    return moment(date).format('lll');
                } else {
                    return '';
                }

            }
            $scope.goToStuff=function(stuff){
               // console.log(stuff);
                $rootScope.$state.transitionTo('language.stuff.detail',
                    {'lang':$rootScope.$stateParams.lang,'section':stuff.section,'category':stuff.category,
                        'id':stuff.stuff,'color':stuff.color,'size':stuff.size});
            }

            $scope.afterSave();

        }])

    .controller('profileCtrl',['$scope','$rootScope','$stateParams','$http','$timeout','User','Auth',function($scope,$rootScope,$stateParams,$http,$timeout,User,Auth){
        /* if (!$rootScope.Signed) $rootScope.$state.go('language.home');*/
        //***********************************
        // редактирование профиля
        //************************************

        // смена пароля
        $scope.profile={};
        //$scope.profile.changePswdNameBtn = 'Сменить пароль';
        $scope.profile.showChangePswd =  false;
        $scope.oldPassword='';
        $scope.newPassword='';
        $scope.newPassword1='';
        $scope.changePswdSuccess = false;
        $scope.changePswdError = false;
        $scope.changePswdMatch = false;
        //$scope.changePswdMatch

        $scope.profile.changePswdF = function(){
            // console.log('info');
            if (!$scope.profile.showChangePswd)
                $scope.profile.showChangePswd = true;
            $scope.oldPassword='';
            $scope.newPassword='';
            $scope.newPassword1='';

            //$scope.profile.changePswdNameBtn = 'Отправить';
        }

        $scope.errors = {};

        $scope.changePassword = function(form) {

            if ($scope.newPassword != $scope.newPassword1){
                $scope.changePswdMatch=true;
                $timeout(function(){$scope.changePswdMatch=false},3000);
                return;
            }

            $scope.submitted = true;

            //if(form.$valid) {
            //$http.get('/api/change');//,{oldPassword:$scope.oldPassword,newPassword: $scope.newPassword });
            //$rootScope.user.$updatePswd();
            Auth.changePassword( $scope.oldPassword, $scope.newPassword )
                .then( function() {
                    console.log('ssss');
                    $scope.profile.showChangePswd = false;
                    $scope.oldPassword='';
                    $scope.newPassword='';
                    $scope.newPassword1='';
                    $scope.changePswdSuccess=true;
                    $timeout(function(){$scope.changePswdSuccess=false},3000);

                })
                .catch( function(err) {
                    err = err.data;
                    //s$scope.errors.other = err.message;
                    $scope.changePswdError=true;
                    $timeout(function(){$scope.changePswdError=false},3000);
                    $scope.errors.other = 'Incorrect password';
                });
            //}
        };

        /*$scope.profile.changePswdServer = function(){
         var  pswd = {};
         pswd.email = $rootScope.uuser;
         pswd.pswd  =$scope.profile.psdw;
         pswd.pswd1 =$scope.profile.psdw1;
         pswd.pswd2 =$scope.profile.psdw2;

         $http.post('/login/changepswd',{data:pswd}).
         success(function(data, status) {
         $scope.data = data;
         //console.log(data);
         if (!$scope.data.done){
         $scope.profile.changePswdError = true
         $timeout(function(){$scope.profile.changePswdError = false;}, 3000);
         }else{
         $scope.profile.changePswdSuccess = true;
         $timeout(function(){$scope.profile.changePswdSuccess = false; $scope.profile.showChangePswd = false;}, 2000)
         }
         }).
         error(function(data, status) {
         console.log(status);
         console.log(data);
         $scope.profile.changePswdError = true
         $timeout(function(){$scope.profile.changePswdError = false;}, 3000);
         });
         }*/
        // update profile


        $scope.disableButtonSave = false;
        $scope.showUpdateError = false;
        $scope.showUpdateSuccess = false;

        $scope.profileSave= function() {
            $scope.disableButtonSave = true;
            $rootScope.user.$update(function(){
                $scope.showUpdateSuccess = true;
                $timeout(function(){$scope.showUpdateSuccess=false;$scope.disableButtonSave = false;}, 2000);
                $rootScope.user=User.get();
            });

        };

    }])



    .controller('newsCtrl', ['$scope','$rootScope','News','$q','$timeout','$location','$anchorScroll','mongoPaginator',
        function ($scope,$rootScope,News,$q,$timeout,$location,$anchorScroll,mongoPaginator) {
            $scope.newsList=[];
            //paginator
            $scope.page=0;
            //$scope.numPages=2;
            $scope.totalItems=0;


            $scope.mongoPaginator=mongoPaginator;

            $scope.row= $scope.mongoPaginator.rowsPerPage;
            $scope.page=$scope.mongoPaginator.page;

            $scope.$watch('mongoPaginator.rowsPerPage',function(){
                if ($scope.page==0){
                    $scope.getNewsList($scope.page,$scope.mongoPaginator.rowsPerPage);
                } else {
                    $scope.page=$scope.mongoPaginator.page=0
                }
            })



            var updatePage = function(){
                $scope.page=$scope.mongoPaginator.page;
            };

            mongoPaginator.registerObserverCallback(updatePage);

            $scope.$watch('page',function(n,o){
                if (n!=o){

                    $scope.getNewsList($scope.page,$scope.mongoPaginator.rowsPerPage);
                    //$scope.getStuffList(categoryId,$scope.page,$scope.mongoPaginator.rowsPerPage);
                }
            })







            //$scope.maxSize = 5;
            //$scope.perPage =3;
            var defer = $q.defer();
            var promises = [];
            $scope.getNewsList = function(page,rowsPerPage){
                $scope.newsList=[];
                if (!page){
                    $scope.page=0;
                }
                var perPage =  (rowsPerPage)?rowsPerPage:null;

                News.list({page:$scope.page,perPage:perPage},function(tempArr){
                    if ($scope.page==0 && tempArr.length>0){
                        $scope.totalItems=$scope.mongoPaginator.itemCount=tempArr.shift().index;
                    }
                    /*if ($scope.page==1 && tempArr.length>0){
                        $scope.totalItems=tempArr[0].index;
                    }*/
                    for (var i=0 ; i<=tempArr.length - 1; i++) {
                        // tempArr[i].filters=JSON.parse(tempArr[i].filters);

                        tempArr[i].desc=(tempArr[i].desc0[$scope.lang]=='')?tempArr[i].desc1:tempArr[i].desc0;
                        tempArr[i].desc[$scope.lang]= tempArr[i].desc[$scope.lang].substring(0,300);
                        //console.log(tempArr[i].desc);
                        /*if (!tempArr.desc0){

                         }*/
                        $scope.newsList.push(tempArr[i]);
                    }
                });
            }
            //Angularjs promise chain when working with a paginated collection
            //http://stackoverflow.com/questions/20171928/angularjs-promise-chain-when-working-with-a-paginated-collection
            /*$scope.loadData = function(numPage) {
                //console.log(numPage);
                if (!numPage) numPage=1;
                var deferred = $q.defer();
                var i=1;
                $scope.newsList=[];
                function loadAll() {
                    News.list({page:i},function(news){
                        //console.log(stuffs);
                        if ($scope.newsList.length<=0 && news.length>0){
                            $scope.totalItems=news[0].index;
                        }
                        for(var ii=0; ii<=news.length-1;ii++){
                            news[ii].desc=(news[ii].desc0[$scope.lang]=='')?news[ii].desc1:news[ii].desc0;
                            news[ii].desc[$scope.lang]= news[ii].desc[$scope.lang].substring(0,300);
                            $scope.newsList.push(news[ii]);
                        }
                        if(i<numPage) {
                            i++;
                            loadAll();
                        }
                        else {
                            deferred.resolve();
                        }
                    })
                }
                loadAll();
                return deferred.promise;
            };*/




            $scope.goToNews = function(news){
                //console.log('dd');
                var id =(news)?news._id:'';
                $rootScope.$state.transitionTo('mainFrame.news.detail',{'id':id});

            }



            /*$scope.setPage = function () {
                $scope.page++;
                $scope.getNewsList($scope.page);
                //console.log($scope.page);

            };*/

            //прокрутка вверх екрана
            $scope.scrollTo = function(id) {
                //console.log(id);
                $location.hash(id);
                $anchorScroll();
            }

            //$scope.getNewsList();

        }])
    .controller('newsDetailCtrl',['$scope','News','$rootScope','$timeout',function($scope,News,$rootScope,$timeout){
        $scope.lang=$rootScope.$stateParams.lang;

        $scope.news=News.get({id:$rootScope.$stateParams.id},function(res,err){
            // console.log('gfdfdfd');


        });

    }])

    .controller('chatCtrl', ['$scope','socket','$rootScope','$timeout','Chat','chats','$location',
        function ($scope,socket,$rootScope,$timeout,Chat,chats,$location) {

            if (!$rootScope.user._id) return;
            $scope.country='';
            function myfocus(){
                $timeout(function(){
                    angular.element("#myinput").focus();
                },300)

            };
            $scope.goToOrder = function(num,id,opt){

                if ($rootScope.user && $rootScope.user.role &&$rootScope.user.role!='user' && $rootScope.user._id==id){
                    if (opt){
                        window.location.pathname="/admin123/orders"
                    } else {
                        window.location.pathname="/admin123/ordersRetail?num="
                    }
                } else {
                    $rootScope.$state.transitionTo('language.customOrder',
                        {lang:$rootScope.lang,num:num});
                }
          }
            $scope.activeChat=chats.activeChat;
            $scope.listUsers= chats.listUsers;
            $scope.chatList=chats.chatList;
            $scope.msgs=[];
            $scope.sendMsgBtn=false;

            $scope.selectedUser;
            $scope.$watch('selectedUser',function(){
                if ($scope.selectedUser){
                    var a = _.findWhere($scope.listUsers, {_id: $scope.selectedUser});
                    $scope.addChat(a);

                    $scope.selectedChat=$scope.selectedUser;
                    $scope.selectedUser='';
                }
            });
            $scope.changeChat = function(chat){
                $scope.sendMsgBtn=true;
                $scope.msgs=[];
                chats.changeChat(chat,function(res){
                    $scope.msgs=chats.msqs();
                    //chats.updateListMsgs($scope.activeChat._id,$rootScope.user._id);
                    myfocus();
                });
            }

            if ($scope.activeChat._id){
                $scope.changeChat($scope.activeChat)

            }

            $scope.addChat= function (user){
                chats.addChat(user);

                $scope.changeChat(user);


            }

            $scope.moreMsgs=function(){
                chats.moreMsgs();
            }

            $scope.sendMsg=function(msg){
                if (!msg){
                    myfocus();
                    return;
                }
                var a=msg.split(':)').join("<img src='img/smile/1.png' style='width: 30px' alt=':)'>");
                var b=a.split(':-)').join("<img src='img/smile/2.png' style='width: 30px' alt=':)'>");
                var c=b.split(';)').join("<img src='img/smile/3.png' style='width: 30px' alt=':)'>");
                var d=c.split(':(').join("<img src='img/smile/4.png' style='width: 30px' alt=':)'>");
                var e=d.split(':-(').join("<img src='img/smile/5.png' style='width: 30px' alt=':)'>");
                var f=e.split(':o').join("<img src='img/smile/6.png' style='width: 30px' alt=':)'>");
                var g=f.split(':p').join("<img src='img/smile/7.png' style='width: 30px' alt=':)'>");
                chats.sendMsg(g,function(){
                    myfocus();
                });
                $scope.msg='';
            }

            $scope.button={};
            $scope.button.editChat=false;
            $scope.deleteMsgs={}
            $scope.deleteAll=false;

            $scope.$watch('deleteAll',function(){
                if ($scope.deleteAll){
                    for (var i= 0,len=$scope.msgs.length;i<len;i++){
                        $scope.msgs[i].delete=true;
                    }

                } else {
                    for (var i= 0,len=$scope.msgs.length;i<len;i++){
                        $scope.msgs[i].delete=false;
                    }
                }
            })

            $scope.deleteMsgs=function(){

                $scope.sendMsgBtn=false;
                var msgsStr;
                if (!$scope.deleteAll){
                    var temp=[];
                    for (var i= 0,len=$scope.msgs.length;i<len;i++){
                        if ($scope.msgs[i].delete){
                            temp[temp.length]=$scope.msgs[i]._id;
                        }
                    }
                    /*for(var key in $scope.deleteMsgs) {
                        if ($scope.deleteMsgs[key]){
                            temp.push(key);
                            $scope.deleteMsgs[key]=false;
                        }
                    }*/
                    msgsStr=JSON.stringify(temp);
                    console.log(temp);
                } else {
                    msgsStr = 'all';
                }

               Chat.delete({from:$rootScope.user._id,to:$scope.activeChat._id,msgs:msgsStr},function(){
                   $scope.sendMsgBtn=true;
                   $scope.button.editChat=false;
                   $scope.deleteAll=false;
                   $scope.changeChat($scope.activeChat)
                   chats.updateListMsgs($scope.activeChat._id,$rootScope.user._id);

               })
                // clear $scope.deleteMsgs={}  $scope.deleteAll=false $scope.button.editChat=false;
            }
            $scope.deleteChat= function(user){
                if (confirm("Удалить?")){
                    Chat.delete({from:user._id,to:$rootScope.user._id,msgs:'chat'},function(){
                        if ($scope.activeChat._id==user._id){
                            $scope.activeChat._id='';
                            $scope.activeChat.name='';
                            $scope.sendMsgBtn=false;
                            $scope.button.editChat=false;
                            $scope.msgs=[];
                        }
                        $scope.chatList.splice($scope.chatList.indexOf(user),1);
                    })
                }
            }

            $scope.addSmile = function(smile) {
                var $smilies = {1:':)',2:':-)',3:';)',4:':(',5:':-(',6:':o',7:':p'};
                $rootScope.$broadcast('add', $smilies[smile]);
            }
    }])


    .controller('searchStuffCtrl', ['$scope','Brands','$rootScope','Category','Filters','Stuff','$q','$timeout','BrandTags','$location','$anchorScroll','mongoPaginator',
        function ($scope,Brands,$rootScope,Category,Filters,Stuff,$q,$timeout,BrandTags,$location,$anchorScroll,mongoPaginator) {
            var getCategoryName = function(id){
                var str='';
                for (var i= 0,l=$rootScope.categories.length;i<l;i++){
                    if($rootScope.categories[i]._id==id){
                        str=$rootScope.categories[i].name[$rootScope.lang];
                        break;
                    }
                }
                return str;
            }


            $scope.commonFilter=$rootScope.commonFilter;


            $scope.mongoPaginator=mongoPaginator;

            $scope.row= $scope.mongoPaginator.rowsPerPage;
            $scope.page=$scope.mongoPaginator.page;

            /*$scope.$watch('mongoPaginator.rowsPerPage',function(){
             if ($scope.page==0){
             if ($scope.section) {
             if (!$scope.activeBrand && !$scope.activeCategory){
             var brandId='section';
             } else {
             //console.log();
             var brandId=($scope.activeBrand)?$scope.activeBrand:0;
             }

             var categoryId=($scope.activeCategory)?$scope.activeCategory:$scope.section.id;
             if ($scope.activeBrand && !$scope.activeCategory){
             categoryId=0;
             }
             $scope.getStuffList(categoryId,brandId,$scope.page,$scope.mongoPaginator.rowsPerPage);
             }
             } else {
             $scope.page=0
             }

             })*/



            var updatePage = function(){
                $scope.page=mongoPaginator.page;
            };

            mongoPaginator.registerObserverCallback(updatePage);

            $scope.$watch('page',function(n,o){
                if (n!=o){

                    var categoryId=($scope.activeCategory)?$scope.activeCategory:$scope.section.id;
                    $scope.getStuffList(categoryId,$scope.page,$scope.mongoPaginator.rowsPerPage);
                }
            })



            $scope.stuffList=[];
            //paginator
            $scope.page=0;
            $scope.totalItems=0;
            $scope.textList=''
            $scope.headerList='';
            $scope.displayFilter=[];
           // инициализация********************************
           // $scope.rowsPerPage=($rootScope.config.perPage)?$rootScope.config.perPage:53;
            //$scope.rowsPerPage=54;
            $scope.lang=$rootScope.$stateParams.lang;
            $scope.section='category';
            $scope.categories=[];
            $scope.filterDisplay=[];
            $scope.checkfilterList=[];

            $scope.getStuffList = function(categoryId,page){
                $scope.stuffList=[];
                if (!page){
                    $scope.page=0;

                }
                var  brandId;
                if (categoryId){
                    brandId=0;
                } else {
                    categoryId=$scope.section;
                    brandId='section';
                }
                //console.log($rootScope.$stateParams);
                var searchStr=($rootScope.$stateParams.searchStr)?$rootScope.$stateParams.searchStr:'';
                function noStock(tag,stock){
                  //  console.log(stock[tag]);
                    if(stock && stock[tag]) {
                        var is = true;
                       for (var key in stock[tag]){
                          if (!stock[tag][key]){
                              is = false;
                          }
                       }
                       return is;
                    } else{
                       return false;
                    }
                }
                Stuff.list({category:categoryId,brand:brandId,page:$scope.page,searchStr:searchStr},function(tempArr){
                    //var time1 = new Date().getTime();
                    /* for (var ii=1; ii<10000000;ii++){
                     var jj= ii/13*0.546;
                     }*/

                    /*if ($scope.page==1 && tempArr.length>0){
                        $scope.totalItems=tempArr[0].index;
                    }*/

                    if ($scope.page==0 && tempArr.length>0){
                        $scope.totalItems=$scope.mongoPaginator.itemCount=tempArr.shift().index;
                    }
                    $scope.checkfilterList=[];
                    for (var i=0 ; i<=tempArr.length - 1; i++) {
                        var filtersForStatus=JSON.parse(JSON.stringify(tempArr[i].tags));
                        var stock;
                        if (tempArr[i].stock){
                            stock=JSON.parse(tempArr[i].stock);
                        }

                        var tempGallery=[];
                        _(tempArr[i].gallery).sortBy(function(obj) { return +obj.index });
                        //console.log(tempArr[i].gallery);
                        for (var j=0;j<tempArr[i].gallery.length;j++){
                            //console.log(tempArr[i].gallery[j]);
                            if (tempGallery.length<1){
                                tempGallery.push(tempArr[i].gallery[j]);
                                var l = tempArr[i].tags.indexOf(tempArr[i].gallery[j].tag._id);
                                //console.log(l);
                                if (l>-1){
                                    tempArr[i].tags.splice(l,1);
                                }
                            } else{
                                var is=false;
                                for (var k=0;k<tempGallery.length;k++){
                                    //if (is) break;
                                    if (tempGallery[k].tag._id==tempArr[i].gallery[j].tag._id){
                                        is=true;
                                        if(tempArr[i].gallery[j].index<tempGallery[k].index){
                                            tempGallery.splice(k,1);
                                            tempGallery.push(tempArr[i].gallery[j]);
                                            // is=true;
                                        }
                                    }/* else {
                                     is=true;
                                     tempGallery.push(tempArr[i].gallery[j]);
                                     }*/
                                }
                                if (!is) {
                                    tempGallery.push(tempArr[i].gallery[j]);
                                    var l = tempArr[i].tags.indexOf(tempArr[i].gallery[j].tag._id);
                                    //console.log(l);
                                    if (l>-1){
                                        tempArr[i].tags.splice(l,1);
                                    }
                                }
                            }
                        }
                        var price = (tempArr[i].priceSale)? tempArr[i].priceSale:tempArr[i].price;
                        var retail = (tempArr[i].retailSale)? tempArr[i].retailSale:tempArr[i].retail;

                        for (var j=0;j<tempArr[i].tags.length;j++){
                            if ($scope.checkfilterList.indexOf(tempArr[i].tags[j])<0){
                                $scope.checkfilterList.push(tempArr[i].tags[j]);
                            }
                        }
                        for (var j=0;j<tempGallery.length;j++){
                            var status=0;
                            // 1 - распродажа
                            // 2- новинка
                            // 3- нет в наличии
                            if (filtersForStatus.indexOf(tempGallery[j].tag._id)<0 ||
                                filtersForStatus.indexOf($scope.commonFilter.tags[2])>-1|| noStock(tempGallery[j].tag._id,stock)){
                                status=3;
                            } else if(filtersForStatus.indexOf($scope.commonFilter.tags[1])>-1){
                                status=2;
                            } else if( filtersForStatus.indexOf($scope.commonFilter.tags[0])>-1){
                                status=1;
                            }
                            var tags=JSON.parse(JSON.stringify(tempArr[i].tags));
                            tags.push(tempGallery[j].tag._id)
                            if ($scope.checkfilterList.indexOf(tempGallery[j].tag._id)<0){
                                $scope.checkfilterList.push(tempGallery[j].tag._id);
                            }
                            //console.log(tempGallery[j]);
                            $scope.stuffList.push({img:tempGallery[j].thumb,'name':tempArr[i].name[$scope.lang],
                                'color':tempGallery[j].tag.name[$scope.lang],'price':price,'retail':retail,'tags':tags,'category':tempArr[i].category,
                                'id':tempArr[i]._id,'colorId':tempGallery[j].tag._id,'status':status,'categoryName':getCategoryName(tempArr[i].category)});
                        }
                    }
                });

            }
            $scope.getStuffList('category')

            $scope.goToStuffDetail = function(item){
                //console.log(item);return;
                $rootScope.$state.transitionTo('language.stuff.detail',
                    {lang:$rootScope.lang,id:item.id,color:item.colorId,category:item.category,section:'section'});
            }


            $scope.setPage = function () {
                $scope.page++;
                $scope.getStuffList($scope.activeCategory,$scope.activeBrand,$scope.page);
                //console.log($scope.page);

            };

            //прокрутка вверх екрана
            $scope.scrollTo = function(id) {
                //console.log(id);
                $location.hash(id);
                $anchorScroll();
            }


        }])

    .controller('saleStuffCtrl', ['$scope','$rootScope','Stuff','$q','$timeout','BrandTags','$location','$anchorScroll','mongoPaginator',
        function ($scope,$rootScope,Stuff,$q,$timeout,BrandTags,$location,$anchorScroll,mongoPaginator) {
            var getCategoryName = function(id){
                var str='';
                for (var i= 0,l=$rootScope.categories.length;i<l;i++){
                    if($rootScope.categories[i]._id==id){
                        str=$rootScope.categories[i].name[$rootScope.lang];
                        break;
                    }
                }
                return str;
            }

            $scope.commonFilter=$rootScope.commonFilter;

            $scope.mongoPaginator=mongoPaginator;

            $scope.row= $scope.mongoPaginator.rowsPerPage;
            $scope.page=$scope.mongoPaginator.page;

            /*$scope.$watch('mongoPaginator.rowsPerPage',function(){
             if ($scope.page==0){
             if ($scope.section) {
             if (!$scope.activeBrand && !$scope.activeCategory){
             var brandId='section';
             } else {
             //console.log();
             var brandId=($scope.activeBrand)?$scope.activeBrand:0;
             }

             var categoryId=($scope.activeCategory)?$scope.activeCategory:$scope.section.id;
             if ($scope.activeBrand && !$scope.activeCategory){
             categoryId=0;
             }
             $scope.getStuffList(categoryId,brandId,$scope.page,$scope.mongoPaginator.rowsPerPage);
             }
             } else {
             $scope.page=0
             }

             })*/



            var updatePage = function(){
                $scope.page=mongoPaginator.page;
            };

            mongoPaginator.registerObserverCallback(updatePage);

            $scope.$watch('page',function(n,o){
                if (n!=o){

                    var categoryId=($scope.activeCategory)?$scope.activeCategory:$scope.section.id;
                    $scope.getStuffList(categoryId,$scope.page,$scope.mongoPaginator.rowsPerPage);
                }
            })

            $scope.stuffList=[];
            //paginator
            $scope.page=0;
            $scope.totalItems=0;
            $scope.textList=''
            $scope.headerList='';
            $scope.displayFilter=[];
            // инициализация********************************
            //$scope.rowsPerPage=($rootScope.config.perPage)?$rootScope.config.perPage:53;
            $scope.lang=$rootScope.$stateParams.lang;
            //$scope.section=$rootScope.$stateParams.section;
            $scope.section='category';
            $scope.categories=[];
            $scope.filterDisplay=[];
            $scope.checkfilterList=[];

            $scope.getStuffList = function(categoryId,page){
                $scope.stuffList=[];
                if (!page){
                    $scope.page=0;

                }
                var  brandId;
                if (categoryId){
                    brandId=0;
                } else {
                    categoryId=$scope.section;
                    brandId='section';
                }
               // console.log($rootScope.$stateParams);
                var sale=($rootScope.$stateParams.sale)?$rootScope.$stateParams.sale:'sale';
                function noStock(tag,stock){
                   // console.log(stock[tag]);
                    if(stock && stock[tag]) {
                        var is = true;
                        for (var key in stock[tag]){
                            if (!stock[tag][key]){
                                is = false;
                            }
                        }
                        return is;
                    } else{
                        return false;
                    }
                }


                Stuff.list({category:categoryId,brand:brandId,page:$scope.page,sale:sale},function(tempArr){
                    //var time1 = new Date().getTime();
                    /* for (var ii=1; ii<10000000;ii++){
                     var jj= ii/13*0.546;
                     }*/
                    /*if ($scope.page==1 && tempArr.length>0){
                        $scope.totalItems=tempArr[0].index;
                    }*/
                    if ($scope.page==0 && tempArr.length>0){
                        $scope.totalItems=$scope.mongoPaginator.itemCount=tempArr.shift().index;
                    }
                    $scope.checkfilterList=[];
                    for (var i=0 ; i<=tempArr.length - 1; i++) {
                        var filtersForStatus=JSON.parse(JSON.stringify(tempArr[i].tags));
                        var stock;
                        if (tempArr[i].stock){
                            stock=JSON.parse(tempArr[i].stock);
                        }
                        var tempGallery=[];
                        for (var j=0;j<tempArr[i].gallery.length;j++){
                            //console.log(tempArr[i].gallery[j]);
                            if (tempGallery.length<1){
                                tempGallery.push(tempArr[i].gallery[j]);
                                var l = tempArr[i].tags.indexOf(tempArr[i].gallery[j].tag._id);
                                //console.log(l);
                                if (l>-1){
                                    tempArr[i].tags.splice(l,1);
                                }
                            } else{
                                var is=false;
                                for (var k=0;k<tempGallery.length;k++){
                                    //if (is) break;
                                    if (tempArr[i].gallery[j].tag && tempGallery[k].tag._id==tempArr[i].gallery[j].tag._id){
                                        is=true;
                                        if(tempArr[i].gallery[j].index<tempGallery[k].index){
                                            tempGallery.splice(k,1);
                                            tempGallery.push(tempArr[i].gallery[j]);
                                            // is=true;
                                        }
                                    }/* else {
                                     is=true;
                                     tempGallery.push(tempArr[i].gallery[j]);
                                     }*/
                                }
                                if (!is && tempArr[i].gallery[j].tag) {
                                    tempGallery.push(tempArr[i].gallery[j]);
                                    var l = tempArr[i].tags.indexOf(tempArr[i].gallery[j].tag._id);
                                    //console.log(l);
                                    if (l>-1){
                                        tempArr[i].tags.splice(l,1);
                                    }
                                }
                            }
                        }
                        var price = (tempArr[i].priceSale)? tempArr[i].priceSale:tempArr[i].price;
                        var retail = (tempArr[i].retailSale)? tempArr[i].retailSale:tempArr[i].retail;

                        for (var j=0;j<tempArr[i].tags.length;j++){
                            if ($scope.checkfilterList.indexOf(tempArr[i].tags[j])<0){
                                $scope.checkfilterList.push(tempArr[i].tags[j]);
                            }
                        }
                        for (var j=0;j<tempGallery.length;j++){
                            var status=0;
                            // 1 - распродажа
                            // 2- новинка
                            // 3- нет в наличии
                            if (filtersForStatus.indexOf(tempGallery[j].tag._id)<0 || filtersForStatus.indexOf($scope.commonFilter.tags[2])>-1
                                || noStock(tempGallery[j].tag._id,stock)){
                                status=3;
                            } else if(filtersForStatus.indexOf($scope.commonFilter.tags[1])>-1){
                                status=2;
                            } else if( filtersForStatus.indexOf($scope.commonFilter.tags[0])>-1){
                                status=1;
                            }
                            var tags=JSON.parse(JSON.stringify(tempArr[i].tags));
                            tags.push(tempGallery[j].tag._id)
                            if ($scope.checkfilterList.indexOf(tempGallery[j].tag._id)<0){
                                $scope.checkfilterList.push(tempGallery[j].tag._id);
                            }
                            //console.log(tempGallery[j]);
                            $scope.stuffList.push({img:tempGallery[j].thumb,'name':tempArr[i].name[$scope.lang],
                                'color':tempGallery[j].tag.name[$scope.lang],'price':price,'retail':retail,'tags':tags,
                                'id':tempArr[i]._id,'colorId':tempGallery[j].tag._id,'status':status,'category':tempArr[i].category,'categoryName':getCategoryName(tempArr[i].category)});
                        }
                    }
                });

            }
            $scope.getStuffList('category')

            $scope.goToStuffDetail = function(item){
                console.log(item);
                $rootScope.$state.transitionTo('language.stuff.detail',
                    {lang:$rootScope.lang,id:item.id,color:item.colorId,category:item.category,section:'section'});
            }


            $scope.setPage = function () {
                $scope.page++;
                $scope.getStuffList($scope.activeCategory,$scope.activeBrand,$scope.page);
            };

            //прокрутка вверх екрана
            $scope.scrollTo = function(id) {
                //console.log(id);
                $location.hash(id);
                $anchorScroll();
            }

        }])
