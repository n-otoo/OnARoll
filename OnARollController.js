var app = angular.module('OnARoll', []);

app.controller('OnARollController', ['$scope', '$window', '$http', function($scope, window, $http) {
$scope.loggedIn = false;
$scope.showPopup = false;
$scope.details = {username:""};
$scope.popups = {
	shotsDialog: {shots: null, show:false, rollId:null},
	AddShotDialog: {show:false},
	AddRollDialog: {show:false},
	AddCameraDialog: {show:false}	
}

$scope.login = function(){
	if($scope.details.username != ""){
		$http({
			method: "GET",
			url: "http://localhost:8080/api/rolls/user/" + $scope.details.username
		  }).then(function(success) {
			  console.log(success);
			  $scope.loggedIn = true;
			  $scope.main = {rolls:success.data};
			  mapVisibilityToCameras($scope.main.rolls); 			  
		  },
		  function(error) {
			  console.log(error);
		  });
	}
}

function updateMainRollsView(){
	$http({
		method: "GET",
		url: "http://localhost:8080/api/rolls/user/" + $scope.details.username
	  }).then(function(success) {
		  console.log(success);
		  $scope.main = {rolls:success.data};
		  mapVisibilityToCameras($scope.main.rolls);  
	  },
	  function(error) {
		  console.log(error);
	  });
}

function mapVisibilityToCameras(cameras){
	for(camera in cameras){
		cameras[camera] = {
			rolls: mapVisibilityToRolls(cameras[camera]),
			expand: false
		}
	}

	console.log(cameras);
}

function mapVisibilityToRolls(rolls){
	return rolls.map(function(roll){
		roll.shots = {shots:roll.shots,expand:false}
		return roll
	})
}

$scope.openShotsDialog = function(rollId, shotsArray){
	$scope.popups.shotsDialog.show = true;
	$scope.popups.shotsDialog.rollId = rollId;
	$scope.popups.shotsDialog.shots = shotsArray;
}

$scope.openAddRollDialog = function(){
	$scope.showPopup = true;
	console.log($scope.showPopup);
	//$scope.$apply();
}

}]);