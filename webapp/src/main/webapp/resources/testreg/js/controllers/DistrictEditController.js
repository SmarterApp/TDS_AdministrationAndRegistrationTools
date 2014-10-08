
testreg.controller('DistrictEditController',['$scope','$state', 'loadedData', 'DistrictService','StateService', 'EntityService', 'inputData',
    function($scope, $state, loadedData, DistrictService, StateService, EntityService, inputData) {
		$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.district = loadedData.data;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		
		if($scope.district && $scope.district.id){
			$scope.formAction = 'Edit';
			EntityService.getEntity($scope.district.parentEntityType, $scope.district.parentId).then(function(response){
				$scope.district.parentEntityId = response.data.entityId;
			});			
		} else {
			if(inputData) {
				$scope.district.entityId = inputData.entityId;
				$scope.district.entityName = inputData.entityName;
				$scope.district.stateAbbreviation = inputData.stateAbbreviation;
			}
		}

		//Load the client config
		EntityService.loadClientConfig().then(function(response){
			$scope.entities = EntityService.loadDistrictParentEntities(response.data);
		});

		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('District', label);
		};
		
		//TODO: move this function to directive. 
		$scope.resetParent = function() {
			$scope.district.parentEntityId = '';
			$scope.district.parentId = '';
		};
		
		$scope.save = function(district){
			$scope.savingIndicator = true;
			DistrictService.saveDistrict(district).then(function(response){
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$scope.districtForm.$setPristine();
					$scope.district = response.data;
					$state.transitionTo("entities.searchDistrict");
				}
			});
		};
		
		$scope.setParentInfoOnChange = function (parentEntityId) { 
			angular.forEach($scope.selectedParentEntities.$$v, function(parentEntity){
				if (parentEntity.id === parentEntityId) {
					$scope.district.parentEntityId =  parentEntity.entityId;
					$scope.district.stateAbbreviation =  parentEntity.stateAbbreviation;
					return;
				}
			} );
		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("entities.searchDistrict");
		};
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.districtForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

