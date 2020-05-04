var app = angular.module('OnARoll', []);

app.controller('OnARollController', ['$scope', '$window', '$http', function($scope, window, $http) {
$scope.loggedIn = {value:false};
$scope.showPopup = {value:false};
$scope.details = {username:""};
$scope.popups = {value: {
	shotsDialog: {shots: null, show:false, rollId:null},
	AddShotDialog: {show:false},
	AddRollDialog: {show:false, info:{name:"",description:"", camera:""}},
	AddCameraDialog: {show:false}	
}}

$scope.login = function(){
	if($scope.details.username != ""){
		$http({
			method: "GET",
			url: "http://localhost:8080/api/rolls/user/" + $scope.details.username
		  }).then(function(success) {
			  console.log(success);
			  $scope.loggedIn.value = true;
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
	$scope.showPopup.value = true;
	$scope.popups.value.shotsDialog.show = true;
	$scope.popups.value.shotsDialog.rollId = rollId;
	$scope.popups.value.shotsDialog.shots = shotsArray;
}

$scope.openAddRollDialog = function(camera){
	$scope.showPopup.value = true;
	$scope.popups.value.AddRollDialog.info.camera = camera;
	console.log($scope.showPopup.value);
	//$scope.$apply();
}

$scope.submitNewRoll = function(){
	$http({
		method: "POST",
		url: "http://localhost:8080/api/rolls/user/" + $scope.details.username,
		data: $scope.popups.value.AddRollDialog.info
	  }).then(function(success) {
		updateMainRollsView();
		$scope.closeDialog();
	  },
	  function(error) {
		  alert(error);
	  });
}

$scope.closeDialog = function(){
	$scope.showPopup.value = false;
	// Reset all dialog options to null / ""
}

$scope.verify = function(editElement){
	switch(editElement) {
		case 'roll':
		  return $scope.popups.value.AddRollDialog.info.name && $scope.popups.value.AddRollDialog.info.description && $scope.popups.value.AddRollDialog.info.camera
		  break;
		case 'camera':
		  // code block
		  break;
	  }
}

}]);