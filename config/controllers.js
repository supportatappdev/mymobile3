/**
 * MainCtrl - controller
 */
angular
    .module('mymobile3')
    .controller('MainCtrl', function MainCtrl($scope,Cache,$location,AlertService,$http) {
    if(!Cache.loggedInUser()) {
       $scope.showLogin = true;
    } else {
        console.log(Cache.loggedInUser());
    }
     $scope.login  = function() {
            $scope.signin  = true;
            var data = $.param({
                us: $scope.username,
                pw: $scope.pwd
            });
        
            var config = {
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }

            $http.post('/api/login', data, config)
            .success(function (data, status, headers, config) {
                $scope.signin = false;
                if(data.status =="S") {
                        window._u = data.$_u;
                        localStorage.setItem("$_u",JSON.stringify(_u));
							window.location.href = "index.html";
  					} else {
  						$scope.responseDetails = data.error;
  					}
            })
            .error(function (data, status, header, config) {
                $scope.signin = false;
                $scope.responseDetails = "<li>Data: " + data +
                    "</li><li>status: " + status +
                    "</li><li>headers: " + header +
                    "</li><li>config: " + config +"</li>";
            });
        }
    
    this.userName = 'Example user';
    this.helloText = 'Welcome in SeedProject';
    this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';
})