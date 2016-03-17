testadmin.controller('ScheduleSummarySeatSelectionController',function($scope,$modalInstance,data, ScheduleSummaryService) {
	//Local Functions ###############
	var seperator = "&";
	var join = function(testPlatform, accessibilityEquipment) {
		return testPlatform + seperator + accessibilityEquipment;
	};
	var getAsText = ScheduleSummaryService.getAccessibilityEquipmentText;
	var split   = function(value){
		return value.split(seperator);
	};
	//######################

	$scope.seatConfigurations = data.seatConfigurations;
	$scope.existingConfigurations = data.existingConfigurations;
	$scope.selectedSeatConfig = join(data.existingConfigurations.testPlatform, getAsText(data.existingConfigurations.accessibilityEquipments));
	$scope.scheduledSeats = data.scheduledSeats;
	
	
	angular.forEach($scope.seatConfigurations, function(config, index) {
		var count = parseInt(config.numberOfSeats, 10); //base 10
		angular.forEach(data.scheduledSeats, function(scheduledSeat) {
			if(scheduledSeat.testPlatform == config.testPlatform && getAsText(scheduledSeat.accessibilityEquipments) == getAsText(config.accessibilityEquipments)) {
				count--;
			}
		});
		config.remainingSeats = count; //new Property for easy access
	});
	
	$scope.selectASeatConfig = function(selectedNowValue) {
		//Previously Selected Value
		var testPlatformSelectedPrevious   		    = split($scope.selectedSeatConfig)[0];
		var accessibilityEquipmentSelectedPrevious  = split($scope.selectedSeatConfig)[1];
		
		//Selected Now Value
		var testPlatformSelectedNow 		  		= split(selectedNowValue)[0];
		var accessibilityEquipmentSelectedNow 		= split(selectedNowValue)[1];
		
		angular.forEach($scope.seatConfigurations, function(config, index) {
			if(testPlatformSelectedPrevious  == config.testPlatform && getAsText(accessibilityEquipmentSelectedPrevious) == getAsText(config.accessibilityEquipments)) {
				config.remainingSeats = parseInt(config.remainingSeats, 10)+1;
			} else if(testPlatformSelectedNow  == config.testPlatform && getAsText(accessibilityEquipmentSelectedNow) == getAsText(config.accessibilityEquipments)) {
				config.remainingSeats = parseInt(config.remainingSeats, 10)-1;
			}
		});
		$scope.selectedSeatConfig = join(testPlatformSelectedNow, accessibilityEquipmentSelectedNow);
	};
	
	
	
	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');  
	}; // end cancel
  
	$scope.selectSeat = function() {
		$modalInstance.close({testPlatform: split($scope.selectedSeatConfig)[0], accessibilityEquipments: split($scope.selectedSeatConfig)[1]});				
	}; // end save
  
});
