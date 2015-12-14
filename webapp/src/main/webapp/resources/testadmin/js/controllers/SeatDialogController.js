testadmin.controller('SeatDialogController',function($scope,$modalInstance,data){
	$scope.seatConfigurations = data.seatConfigurations;
	$scope.selectedConfigurations = angular.copy($scope.seatConfigurations);
	$scope.filteredConfigurations = [];
	$scope.existingConfigurations = data.existingConfigurations;
	
	angular.forEach($scope.selectedConfigurations, function(config, index){
		modified = false;
		angular.forEach($scope.existingConfigurations, function(existingConfig, index){
			if(config.configId == existingConfig.configId) {
				config.numberOfSeats = existingConfig.numberOfSeats;
				modified = true;
				return;
			} 
		});
		if(!modified) {
			config.numberOfSeats = 0;
		}
	});
	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');  
	}; // end cancel
  
	$scope.selectSeats = function(){
		
		$scope.errors = [];
		$scope.filteredConfigurations = [];
		angular.forEach($scope.selectedConfigurations, function(config, index){
			if (config.numberOfSeats === "") {
				$scope.errors.push("Required number of seats is required");
				return;
			}
			if (isNaN(config.numberOfSeats)) {
				$scope.errors.push("Required number of seats must be a number");
				return;
			}
			if (config.numberOfSeats > $scope.seatConfigurations[index].numberOfSeats) {
				$scope.errors.push("Required number of seats cannot be greater than available number of seats");
				return;
			}
			if (config.numberOfSeats < 0) {
				$scope.errors.push("Required number of seats must be a positive number");
				return;
			}
			if (config.numberOfSeats.toString().indexOf("-") >= 0) {
				$scope.errors.push("Required number of seats must be a positive number");
				return;
			}
			if (config.numberOfSeats.toString().indexOf(".") >= 0) {
				$scope.errors.push("Required number of seats must be a positive whole number");
				return;
			}
			if(config.numberOfSeats != 0){
				config.seats = config.seats.slice(0, config.numberOfSeats);
				$scope.filteredConfigurations.push(config);
			} 
		});
		if ($scope.errors.length == 0) {
			if($scope.filteredConfigurations.length > 0) {
				$modalInstance.close($scope.filteredConfigurations);
			}else {
				$scope.errors.push("At least one seat configuration is required");
				return;
			}
		}
	}; // end save
  
});
