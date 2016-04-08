
testreg.controller('GroupOfDistrictsEditController',['$scope','$state', 'loadedData', 'GroupOfDistrictsService','StateService', 'EntityService', 'inputData',
    function($scope, $state, loadedData, GroupOfDistrictsService, StateService, EntityService, inputData) {
		$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.groupOfDistricts = loadedData.data;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		
		if($scope.groupOfDistricts && $scope.groupOfDistricts.id){
			$scope.formAction = 'Edit';
			EntityService.getEntity($scope.groupOfDistricts.parentEntityType, $scope.groupOfDistricts.parentId).then(function(response){
				$scope.groupOfDistricts.parentEntityId = response.data.entityId;
			});					
		} else {
			if(inputData) {
				$scope.groupOfDistricts.entityId = inputData.entityId;
				$scope.groupOfDistricts.entityName = inputData.entityName;
				$scope.groupOfDistricts.stateAbbreviation = inputData.stateAbbreviation;
			}
		}
		//Load the client config
		EntityService.loadClientConfig().then(function(response){
			$scope.entities = EntityService.loadGroupOfDistrictsParentEntities(response.data);
		});		

		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('GroupOfDistricts', label);
		};
		
		$scope.resetParent = function() {
			$scope.groupOfDistricts.parentEntityId = '';
		};
		
		$scope.save = function(groupOfDistricts){
			$scope.savingIndicator = true;
			GroupOfDistrictsService.saveGroupOfDistricts(groupOfDistricts).then(function(response){
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$scope.groupOfDistrictsForm.$setPristine();
					$scope.groupOfDistricts = response.data;
					$state.transitionTo("entities.searchGroupOfDistricts");
				}
			});
		};
		
		$scope.setParentInfoOnChange = function (parentEntityId) { 
			angular.forEach($scope.selectedParentEntities.$$v, function(parentEntity){
				if (parentEntity.entityId === parentEntityId) {
					$scope.groupOfDistricts.stateAbbreviation =  parentEntity.stateAbbreviation;
					return;
				}
			} ) 
		}
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("entities.searchGroupOfDistricts");
		};
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.groupOfDistrictsForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

