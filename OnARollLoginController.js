var app = angular.module('OnARoll', []);

app.controller('OnARollLoginController', ['$scope',  '$http', function($scope, $http) {
$scope.account = {username:"", password:""};


$scope.createAccount = function(){
	if($scope.account.username != "" && $scope.account.password != ""){
		$http({
			method: "POST",
			url: location.origin + "/api/users/",
			data: {name:$scope.account.username, pass:$scope.account.password}
		  }).then(function(success) {
			  alert("Acccount successfully created");
			  window.location = location.origin;				  
		  },
		  function(error) {
			  alert("invalid detailds")
		  });
	}
}

$scope.verifyNotEmpty = function(){
	return $scope.account.username != "" && $scope.account.password != "" && $scope.account.username.length > 3 && $scope.account.password.length > 1
}

$scope.navigateToAbout = function(){
	window.location = location.origin + "/about.html"
}

}]);