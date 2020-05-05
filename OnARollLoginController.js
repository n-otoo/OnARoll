var app = angular.module('OnARoll', []);

app.controller('OnARollLoginController', ['$scope',  '$http', function($scope, $http) {
$scope.account = {username:"",password:""};


$scope.createAccount = function(){
	if($scope.details.username != "" && $scope.details.password != ""){
		$http({
			method: "POST",
			url: location.origin + "/api/users/",
			data: {name:$scope.details.username, pass:$scope.details.password}
		  }).then(function(success) {
			  alert("Acccount successfully created");
			  window.open(location.origin);				  
		  },
		  function(error) {
			  alert("invalid detailds")
		  });
	}
}

$scope.verifyNotEmpty = function(){
	return $scope.details.username != "" && $scope.details.password != "" && $scope.details.username.length > 3 && $scope.details.username.length > 1
}

}]);