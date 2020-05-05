var app = angular.module('OnARoll', []);

app.controller('OnARollController', ['$scope', '$window', '$http', function($scope, window, $http) {
$scope.loggedIn = {value:false};
$scope.showPopup = {value:false};
$scope.details = {username:""};
$scope.popups = {
	shotsDialog: {shots: null, show:false, rollId:null},
	AddShotDialog: {show:false,info:{ss:"",aperture:"", iso:"",description:""}},
	AddRollDialog: {show:false, info:{name:"",description:"", camera:"",stock:""}},
	AddCameraDialog: {show:false, cameras:null, info:{type:"",make:"", model:""}}	
}

// Give the users set options for normally used/realistic stoped
$scope.apertureOptions = ["f/0.5", "f/0.75", "f/0.95", "f/1", "f/1.1", "f/1.2", "f/1.4", "f/1.7", "f/1.8", "f/2", "f/2.2", "f/2.4", "f/2.5", "f/2.8", "f/3.2", "f/3.3", "f/3.5", "f/4", "f/4.5", "f/4.8", "f/5.0", "f/5.6", "f/6.3", "f/6.7", "f/7.1", "f/8", "f/9", "f/9.5", "f/10", "f/11", "f/13", "f/14", "f/16", "f/18", "f/19", "f/20", "f/22", "f/25", "f/27", "f/28", "f/32", "f/36", "f/38", "f/40", "f/45", "f/50", "f/55", "f/60", "f/64", "f/72", "f/76", "f/80", "f/90"]  
$scope.ssOptions = ["30s", "25s", "20s", "15s", "13s", "10s", "8s", "6s", "5s", "4s", "3s", "2s", "1s", "1/2", "1/4", "1/8", "1/15", "1/30", "1/60",  "1/125", "1/160", "1/180", "1/200", "1/250", "1/320", "1/350", "1/400", "1/500", "1/640", "1/750", "1/800", "1/1000", "1/1250", "1/1500", "1/1600", "1/2000", "1/2500", "1/3000", "1/3200", "1/4000", "1/5000", "1/6000", "1/6400", "1/8000", "1/10000", "1/12000", "1/12800", "1/16000"]

// Gives users set options for common film format types
$scope.formatOptions = ["110", "APS", "135/35mm (Half Frame)", "135/35mm",  "127",  "120 (6x4.5)", "120 (6x6)", "120 (6x7)", "120 (6x8)", "120 (6x9)", "120 (6x12)", "120 (6x17)", "4x5 LF", "4x10 LF", "8x10 LF", "8x20 LF", "8x20 LF", "16x20 LF", "20x24 LF" ];

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

$scope.openAddCameraDialog = function(){
	$http({
		method: "GET",
		url: "http://localhost:8080/api/users/cameras/" + $scope.details.username
	  }).then(function(success) {
		$scope.showPopup.value = true;
		$scope.popups.AddCameraDialog.show = true;
		$scope.popups.AddCameraDialog.cameras = success.data[0].cameras;
	  },
	  function(error) {
		  alert(error);
	  });
}

$scope.openShotsDialog = function(rollId, shotsArray){
	$scope.showPopup.value = true;
	$scope.popups.shotsDialog.show = true;
	$scope.popups.AddShotDialog.show = true;
	$scope.popups.shotsDialog.rollId = rollId;
	$scope.popups.shotsDialog.shots = shotsArray;
}

$scope.openAddRollDialog = function(camera){
	$scope.showPopup.value = true;
	$scope.popups.AddRollDialog.show = true;
	$scope.popups.AddRollDialog.info.camera = camera;
	console.log($scope.showPopup.value);
	//$scope.$apply();
}

$scope.submitNewRoll = function(){
	$http({
		method: "POST",
		url: "http://localhost:8080/api/rolls/user/" + $scope.details.username,
		data: $scope.popups.AddRollDialog.info
	  }).then(function(success) {
		updateMainRollsView();
		$scope.closeDialog();
	  },
	  function(error) {
		  alert(error);
	  });
}

$scope.submitNewCamera = function(){
	$http({
		method: "POST",
		url: "http://localhost:8080/api/users/cameras/" + $scope.details.username,
		data: $scope.popups.AddCameraDialog.info
	  }).then(function(success) {
		$scope.openAddCameraDialog();
		updateMainRollsView();
	  },
	  function(error) {
		  alert(error);
	  });
}

// We needed to add a placeholder row when the camera is initially created
$scope.isPlaceholder = function(roll){
	return roll.name == "__PLCHOLDER";
}

$scope.submitNewShot = function(){
	$http({
		method: "POST",
		url: "http://localhost:8080/api/shots/roll/" + $scope.details.username + "/" + $scope.popups.shotsDialog.rollId,
		data: $scope.popups.AddShotDialog.info
	  }).then(function(success) {
		getUpdatedShotsForRoll($scope.details.username, $scope.popups.shotsDialog.rollId);
		updateMainRollsView();
	  },
	  function(error) {
		  alert(error);
	  });
}

function getUpdatedShotsForRoll(username, roll){
	$http({
		method: "GET",
		url: "http://localhost:8080/api/shots/roll/" + username + "/" + roll
	  }).then(function(success) {
		$scope.popups.shotsDialog.shots = success.data.rolls[0].shots;
	  },
	  function(error) {
		  alert(error);
	  });
}

$scope.closeDialog = function(){
	$scope.showPopup.value = false;
	$scope.popups.AddRollDialog.show = false;
	$scope.popups.shotsDialog.show = false;
	$scope.popups.AddCameraDialog.show = false;
	// Reset all dialog options to null / ""
}

$scope.verify = function(editElement){
	switch(editElement) {
		case 'roll':
		  return $scope.popups.AddRollDialog.info.name && $scope.popups.AddRollDialog.info.stock && $scope.popups.AddRollDialog.info.camera
		  break;
		case 'shot':
		  return $scope.popups.AddShotDialog.info.iso && $scope.popups.AddShotDialog.info.ss && $scope.popups.AddShotDialog.info.aperture 
		  break;
		case 'camera':
		  return $scope.popups.AddCameraDialog.info.type && $scope.popups.AddCameraDialog.info.make && $scope.popups.AddCameraDialog.info.model 
		  break;
	  }
}

}]);