var app = angular.module('kfl', ['ng','ngRoute']);
app.config(function($routeProvider){
    $routeProvider
        .when('/kflStart',{templateUrl:'tpl/start.html'})
        .when('/kflMain',{templateUrl:'tpl/main.html',controller:'MainCtrl'})
        .when('/kflDetail/:id',{templateUrl:'tpl/detail.html',controller:'DetailCtrl'})
        .when('/kflOrder/:id',{templateUrl:'tpl/order.html',controller:'OrderCtrl'})
        .when('/kflMyOrder',{templateUrl:'tpl/myOrder.html',controller:'MyOrder'})
        .otherwise({redirectTo:'/kflStart'})
});
app.controller('parentCtrl',['$scope','$location',function($scope,$location){
    $scope.jump=function(path){
        $location.path(path);
    }
}]);

app.controller('MainCtrl', ['$scope', '$http',
    function ($scope, $http) {
        //定义一个空的字符串，存储搜索时用户输入的内容
        $scope.kw = '';
        //定义一个布尔类型的标志位
        $scope.hasMore = true;
        //发起请求拿菜品列表 并绑定到视图去显示
        $http
            .get('data/dish_getbypage.php')
            .success(function (data) {
                console.log(data);
                $scope.dishList = data;
            });

        //加载更多数据
        $scope.loadMore = function () {
            $http
                .get('data/dish_getbypage.php?start=' +
                $scope.dishList.length)
                .success(function (data) {
                    if (data.length < 5) {
                        $scope.hasMore = false;
                    }
                    //将返回的新的数组 和 之前的dishList拼接
                    //比如本来：[1,2,3],返回[4,5]--> 【1,2,3,4,5】
                    $scope.dishList =
                        $scope.dishList.concat(data);
                })
        };

        //监听kw模型数据变化
        $scope.$watch('kw', function () {
            //console.log($scope.kw);
            //向服务器端发起请求进行关键字查询
            if($scope.kw.length > 0)
            {
                $http
                    .get('data/dish_getbykw.php?kw=' + $scope.kw)
                    .success(function (data) {
                        console.log('查询结果为', data);
                        if(data.length > 0)
                        {
                            //将data数组中数据显示在视图中
                            $scope.dishList = data;
                        }
                    })
            }

        });
    }
]);

app.controller('DetailCtrl', ['$scope', '$http', '$routeParams',
        function ($scope, $http, $routeParams) {
            var did = $routeParams.id;
            console.log(did);
            $http
                .get('data/dish_getbyid.php?id=' + did)
                .success(function (data) {
                    console.log(data);
                    $scope.dish = data[0];
                })
        }
    ]);

app.controller('OrderCtrl',['$scope','$http','$routeParams','$httpParamSerializerJQLike',function($scope,$http,$routeParams,$httpParamSerializerJQLike){
    console.log($routeParams);
    $scope.order={did:$routeParams.id};
    $scope.submitOrder=function(){
        console.log($scope.order);
        //针对 对象或者数组 做序列化的处理
        //$httpParamsSerializerJQLike
        var result=$httpParamSerializerJQLike($scope.order);
        $http.get('data/order_add.php?'+result)
            .success(function(data){
                console.log(data);
                if(data[0].msg =='succ'){
                    $scope.AddResult='下单成功，订单的编号为'+data[0].oid;
                    sessionStorage.setItem('phone',$scope.order.phone)

                }else{
                    $scope.AddResult='下单失败';
                }
            })
    }
}]);

app.controller('MyOrder',['$scope','$http',function($scope,$http){
    var phone=sessionStorage.getItem('phone');
    console.log(phone);
    $http
        .get('data/order_getbyphone.php?phone='+phone)
        .success(function(data){
            console.log(data);
            $scope.orderList = data;
        })
}]);