var app = angular.module('OnARoll', []);

app.controller('OnARollController', ['$scope', '$window', '$http', function($scope, window, $http) {
$scope.loggedIn = false;
$scope.details = {username:""};

$scope.login = function(){
	if($scope.details.username != ""){
		$http({
			method: "GET",
			url: "http://localhost:8080/api/rolls/user/" + $scope.details.username
		  }).then(function(success) {
			  console.log(success);
			  $scope.main = {rolls:success.data}; 
			  $scope.loggedIn = true;
		  },
		  function(error) {
			  console.log(error);
		  });
	}
}

}]);